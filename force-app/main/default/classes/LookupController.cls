public with sharing class LookupController {
    
    @AuraEnabled
    public static List<LookupSearchResult> searchLookupRecords(String searchTerm, List<String> selectedIds,String sObjectName, String field, String subField,Integer maxResults) {
        List<LookupSearchResult> results = new List<LookupSearchResult>();
        
        String strQuery = 'SELECT Id, '+field + (String.isNotBlank(subField) ? ' ,'+subField : '')+' FROM '+sObjectName;
        strQuery += ' WHERE '+field+' LIKE \'%' + searchTerm + '%\' AND ';  
        strQuery += ' Id NOT IN :selectedIds ORDER BY '+field+' LIMIT :maxResults';
        
        List<sObject> searchResults = Database.query(strQuery);   
        if(searchResults != NUll && !searchResults.isEmpty()){
            for(sObject sObj : searchResults){
                LookupSearchResult res = new LookupSearchResult();
                res.Id = sObj.Id;
                res.title = String.valueOf(sObj.get(field));
                if(String.isNotBlank(subField) && sObj.get(subField) != NULL){
                    res.subtitle = String.valueOf(sObj.get(subField));
                }else{
                    res.subtitle = sObjectName;
                }
                results.add(res);
            } 
        }
        return results;        
    }
    
    @AuraEnabled
    public static LookupSearchResult getRecentlyCreatedRecord(String sObjectName, String recordId, String field, String subField) {
        LookupSearchResult result = new LookupSearchResult();
        String strQuery = 'SELECT Id, '+field + (String.isNotBlank(subField) ? ' ,'+subField : '')+' FROM '+sObjectName +' WHERE Id =:recordId LIMIT 1';
        List<sObject> searchResults = Database.query(strQuery);   
        if(searchResults != NUll && !searchResults.isEmpty()){
            sObject sObj = searchResults.get(0);
            LookupSearchResult res = new LookupSearchResult();
            result.Id = sObj.Id;
            result.title = String.valueOf(sObj.get(field));
            if(String.isNotBlank(subField) && sObj.get(subField) != NULL){
                result.subtitle = String.valueOf(sObj.get(subField));
            }else{
                result.subtitle = sObjectName;
            }
        }
        return result;        
    }
    
    public class LookupSearchResult {
        @AuraEnabled public Id id{get;set;}
        @AuraEnabled public String title{get;set;}
        @AuraEnabled public String subtitle{get;set;}
    }
    public class LookupSearchForProduct {
        @AuraEnabled public Id id{get;set;}
        @AuraEnabled public String title{get;set;}
        @AuraEnabled public String subtitle{get;set;}
    }

    @AuraEnabled
    public static List<LookupSearchForProduct> getProducts(String objectName, String pricebookId, String productFamilyName, String searchTerm) {
        try {
            List<LookupSearchForProduct> results = new List<LookupSearchForProduct>();
            String query = 'SELECT Id, Product2Id, Product2.Name FROM PricebookEntry WHERE Pricebook2Id = :pricebookId AND Product2.Family = :productFamilyName AND Product2.Name LIKE \'%' + searchTerm + '%\'ORDER BY Product2.Name ASC LIMIT 10';
            List<PricebookEntry> productList = Database.query(query);
            if (productList != null && !productList.isEmpty()) {
                for (PricebookEntry pbe : productList) {
                    LookupSearchForProduct res = new LookupSearchForProduct();
                    res.Id = pbe.Product2Id;
                    res.title = pbe.Product2.Name;
                    res.subtitle = 'Product';
                    results.add(res);
                }
            }
            return results;
        } catch (Exception e) {
            System.debug(e.getMessage());
            return null;
        }
    }

    @AuraEnabled
    public static List<LookupSearchResult> getTasksFromProject(String objectName, String searchTerm, List<String> projectIds, List<String> selectedIds) {
        try {
            List<LookupSearchResult> results = new List<LookupSearchResult>();
            String likeValue = '%' + searchTerm + '%';
            List<buildertek__Project_Task__c> tasksList = [SELECT Id, Name, buildertek__Schedule__c, buildertek__Schedule__r.buildertek__Project__c FROM buildertek__Project_Task__c WHERE buildertek__Schedule__r.buildertek__Project__c IN :projectIds AND Name LIKE :likeValue AND Id NOT IN :selectedIds ORDER BY Name ASC LIMIT 10];
            System.debug('getTasksFromProject'+projectIds);
            if (tasksList != null && !tasksList.isEmpty()) {
                for (buildertek__Project_Task__c tsk : tasksList) {
                    LookupSearchResult res = new LookupSearchResult();
                    res.Id = tsk.Id;
                    res.title = tsk.Name;
                    res.subtitle = 'Schedule Item';
                    results.add(res);
                }
            }
            return results;
        } catch (Exception e) {
            System.debug(e.getMessage());
            return null;
        }
    }
}