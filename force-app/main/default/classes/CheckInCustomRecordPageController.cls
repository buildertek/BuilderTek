public without sharing class CheckInCustomRecordPageController {     

    @AuraEnabled
    public list<buildertek__Check_In__c> checkInList;
    
    @AuraEnabled 
    public integer offst;
    
    @AuraEnabled 
    public integer total;
    
    @AuraEnabled 
    public boolean hasprev;
    
    @AuraEnabled 
    public boolean hasnext;

    @AuraEnabled 
    public String orgBaseUrl = '';

    @AuraEnabled 
    public integer totalPage;

    @AuraEnabled
    public List<String> statusOptions;

    @AuraEnabled
    public List<String> categoryOptions;
    
    private static integer pagesize = 5;
    private static integer offset;
    
    @AuraEnabled
    public static CheckInCustomRecordPageController getCheckIns(boolean next, boolean prev, decimal off, string projectId, String status, String category) {
        System.debug('Satus : ' + status);
        System.debug('Category : ' + category);
        offset = (integer)off;
        list<buildertek__Check_In__c> li = new list<buildertek__Check_In__c>();
        integer listlength;
        if(status == 'All' && category == 'All'){
            listlength = [SELECT count() FROM buildertek__Check_In__c WHERE Name != null AND buildertek__Project__c =: projectId];
        }
        else if(status == 'All' && category != 'All'){
            listlength = [SELECT count() FROM buildertek__Check_In__c WHERE Name != null AND buildertek__Project__c =: projectId AND buildertek__Category__c =: category];
        }
        else if(status != 'All' && category == 'All'){
            listlength = [SELECT count() FROM buildertek__Check_In__c WHERE Name != null AND buildertek__Project__c =: projectId AND buildertek__Status__c =: status];
        }
        else{
            listlength = [SELECT count() FROM buildertek__Check_In__c WHERE Name != null AND buildertek__Project__c =: projectId AND buildertek__Status__c =: status AND buildertek__Category__c =: category];
        }
        
        if (!schema.sobjecttype.Account.isaccessible()) {
            li = new list<buildertek__Check_In__c>();
        } else {
            String statusFilter = (status != 'All') ? ' AND buildertek__Status__c =: status' : '';
            String categoryFilter = (category != 'All') ? ' AND buildertek__Category__c =: category' : '';
            if (next==false && prev==false) {
                String query = 'SELECT id, Name, buildertek__Status__c, buildertek__Category__c, buildertek__Notes__c, buildertek__Date_Created__c, (SELECT Id, ContentDocument.title FROM ContentDocumentLinks) ' +
                               'FROM buildertek__Check_In__c ' +
                               'WHERE buildertek__Project__c =: projectId' + statusFilter + categoryFilter + 
                               ' LIMIT ' + pagesize + ' OFFSET ' + offset;
                li = Database.query(query);
            } else if (next == true && (status != 'All' || category != 'All')){
                offset = offset + pagesize;
                String query = 'SELECT id, Name, buildertek__Status__c, buildertek__Category__c, buildertek__Notes__c, buildertek__Date_Created__c, (SELECT Id, ContentDocument.title FROM ContentDocumentLinks) ' +
                               'FROM buildertek__Check_In__c ' +
                               'WHERE buildertek__Project__c =: projectId' + statusFilter + categoryFilter + 
                               ' LIMIT ' + pagesize + ' OFFSET ' + offset;
                li = Database.query(query);
            } else if (prev == true && (status != 'All' || category != 'All')){
                offset = offset - pagesize;
                String query = 'SELECT id, Name, buildertek__Status__c, buildertek__Category__c, buildertek__Notes__c, buildertek__Date_Created__c, (SELECT Id, ContentDocument.title FROM ContentDocumentLinks) ' +
                               'FROM buildertek__Check_In__c ' +
                               'WHERE buildertek__Project__c =: projectId' + statusFilter + categoryFilter + 
                               ' LIMIT ' + pagesize + ' OFFSET ' + offset;
                li = Database.query(query);
            }else if(next==true && (offset+pagesize)<=listlength) {
                offset = offset + pagesize;
                li = [SELECT id, Name, buildertek__Status__c, buildertek__Category__c, buildertek__Notes__c,buildertek__Date_Created__c, (SELECT Id, ContentDocument.title FROM ContentDocumentLinks) FROM buildertek__Check_In__c WHERE buildertek__Project__c =: projectId LIMIT :pagesize OFFSET :offset];
            } else if(prev==true && offset>0) {
                offset = offset - pagesize;
                li = [SELECT id, Name, buildertek__Status__c,buildertek__Category__c, buildertek__Notes__c,buildertek__Date_Created__c, (SELECT Id, ContentDocument.title FROM ContentDocumentLinks) FROM buildertek__Check_In__c WHERE buildertek__Project__c =: projectId LIMIT :pagesize OFFSET :offset];
            }
        }

        //query for status options and category options for that project
        list<buildertek__Check_In__c> checkInStatusOptions = [Select id, Name, buildertek__Category__c, buildertek__Status__c, buildertek__Project__c From buildertek__Check_In__c where buildertek__Project__c =: projectId];
        list<string> statusOptions = new list<string>();
        list<string> categoryOptions = new list<string>();
        for(buildertek__Check_In__c checkIn : checkInStatusOptions){
            if(checkIn.buildertek__Status__c != null && !statusOptions.contains(checkIn.buildertek__Status__c)){
                statusOptions.add(checkIn.buildertek__Status__c);
            }
            if(checkIn.buildertek__Category__c != null && !categoryOptions.contains(checkIn.buildertek__Category__c)){
                categoryOptions.add(checkIn.buildertek__Category__c);
            }
        }

        CheckInCustomRecordPageController pageController = new CheckInCustomRecordPageController();
        pageController.checkInList = li;
        pageController.offst = offset;
        pageController.hasprev = hasprev(offset);   
        pageController.hasnext = hasnxt(offset,listlength,pagesize);
        pageController.orgBaseUrl = URL.getSalesforceBaseUrl().toExternalForm();
        pageController.totalPage = integer.valueOf(Math.ceil(Decimal.valueOf(listlength)/pagesize));
        pageController.statusOptions = statusOptions;
        pageController.categoryOptions = categoryOptions;
        
        return pageController;
    }
    
    private static boolean hasprev(integer off) {
        if (off > 0) {
            return false;
        }
        return true; 
    }

    private static boolean hasnxt(integer off,integer li,integer ps) {
        if(off + ps < li) {
            return false;
        }
        return true;
    }

     // -------------------- New Image Preview  END --------------------
     @AuraEnabled
     public static ContentDistribution GetContentDistrubutionRecord(String Content_Document_Id){
             ContentVersion CV = [SELECT Id,Title,ContentDocumentId FROM ContentVersion WHERE ContentDocumentId =: Content_Document_Id LIMIT 1]; 
             list<ContentDistribution> CD = [SELECT Id, Name, ContentDocumentId,ContentVersionId , RelatedRecordId, DistributionPublicUrl, ContentDownloadUrl FROM ContentDistribution WHERE ContentVersionId =: CV.Id Limit 1];
     
             system.debug('CD.size : ' + CD.size());
             if(CD.size() == 0){
                 // If ContentDistribution is not available for ContentDocument,
                 // Create ContentDistribution Record for ContentDocument
                 ContentDistribution newCD = new ContentDistribution();
                 newCD.Name = CV.Title;
                 newCD.ContentVersionId = CV.Id;
                 newCD.PreferencesAllowViewInBrowser = true;
                 insert newCD;
     
                 ContentDistribution newDistribution = [SELECT Id, Name, ContentDocumentId,ContentVersionId , RelatedRecordId, DistributionPublicUrl, ContentDownloadUrl FROM ContentDistribution WHERE Id =: newCD.Id Limit 1];
                 system.debug(' Newly created Content Distribution : ' + newDistribution);
                 return newDistribution;
             }
             else if(CD.size() > 0){
                 // Else Return Existing Content Distribution...
                 system.debug('existing Content Distribution : ' + CD[0]);
                 return CD[0];
             }
             return null; // in  case of eroor
      }
     //  ------------------ New Image Preview  END --------------------
}