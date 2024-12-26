public without sharing class New_AssetController {
    public New_AssetController() {

    }

    //getPriceBookValues
    @AuraEnabled
    public static List<pricebook2> getPriceBookValues() {
        try{
            return [SELECT Id, Name FROM pricebook2 WHERE buildertek__BT_Visible__c = true ORDER BY Name ASC];
        }catch(Exception e){
            System.debug('Error in getPriceBookValues: '+e.getMessage());
            return null;
        }
    }

    @AuraEnabled
    public static List<String> getProductFamilyValues(String pbookId){
        try {

            List<PriceBookEntry> pEntries2 = [SELECT Id,Product2Id, toLabel(Product2.Family),
                                            Product2.IsActive, Pricebook2.Name  //----
                                            FROM PricebookEntry WHERE Pricebook2Id=:pbookId AND Product2.Family != null AND IsActive = True
                                            ORDER BY Product2.Family ASC NULLS LAST, Product2.Name ASC NULLS LAST LIMIT 50000];

            Set<String> ProductfamilySet = new Set<String>();
            for(PriceBookEntry PE : pEntries2){
                if(PE.Product2.Family != null){
                    ProductfamilySet.add(PE.Product2.Family);
                }
            }

            return new List<String>(ProductfamilySet);

        } catch (Exception e) {
            System.debug('Exception in getProductFamily : '+ e.getMessage());
            return null;
        }
    }

    @AuraEnabled
    public static Map<Id, PricebookEntry> getProductsbyNameandFamily(String pbookId, String pName, String pfId) {
        // Validate input parameters
        if (String.isBlank(pbookId) || String.isBlank(pfId)) {
            return new Map<Id, PricebookEntry>();
        }

        // Build dynamic query
        List<String> queryConditions = new List<String>{
            'Pricebook2Id = :pbookId',
            'IsActive = True', 
            'toLabel(Product2.Family) = :pfId'
        };

        // Add name search condition only if pName is not blank
        if (String.isNotBlank(pName)) {
            String[] searchTerms = pName.split('\\s+');
            List<String> nameConditions = new List<String>();
            
            for (String term : searchTerms) {
                nameConditions.add('Product2.Name LIKE \'%' + String.escapeSingleQuotes(term) + '%\'');
            }
            
            queryConditions.add('(' + String.join(nameConditions, ' AND ') + ')');
        }

        // Construct the final query
        String sQuery = 'SELECT Id, Product2Id, Product2.Name, buildertek__Hourly_Rate__c ' +
                        'FROM PricebookEntry ' +
                        'WHERE ' + String.join(queryConditions, ' AND ') + 
                        ' ORDER BY Product2.Family ASC NULLS LAST, Product2.Name ASC NULLS LAST ' +
                        'LIMIT 1000';

        // Execute query
        List<PriceBookEntry> pEntries = Database.query(sQuery);

        Map<Id, PricebookEntry> productMap = new Map<Id, PricebookEntry>();
        for (PriceBookEntry pEntry : pEntries) {
            productMap.put(pEntry.Product2Id, pEntry);
        }

        return productMap;
    }

    //getRecordTypeValues
    @AuraEnabled
    public static List<RecordType> getRecordTypeValues() {
        try{
            return [SELECT Id, Name FROM RecordType WHERE SObjectType = 'buildertek__Asset_Manager__c'];
        }catch(Exception e){
            System.debug('Error in getRecordTypeValues: '+e.getMessage());
            return null;
        }
    }

    //getFieldSetValues
    @AuraEnabled
    public static List<BT_Lightning_Utils.dataTableFields> getFieldSetValues(String objectName, String fieldSetName) {
        try{
            List<BT_Lightning_Utils.dataTableFields> fieldList = BT_Lightning_Utils.getFieldSetForDataTable(objectName, fieldSetName);
            return fieldList;
        }catch(Exception e){
            System.debug('Error in getFieldSetValues: '+e.getMessage());
            return null;
        }
    }

    //createAssetRecord
    @AuraEnabled
    public static String createAssetRecord(buildertek__Asset_Manager__c assetRecord) {
        try{
            System.debug('assetRecord: '+assetRecord);
            insert assetRecord;
            return assetRecord.Id;
        }catch(Exception e){
            System.debug('Error in createAssetRecord: '+e.getMessage());
            return null;
        }
    }

    //getProductValues
    @AuraEnabled
    public static List<Product2> getProductValues() {
        try{
            return [SELECT Id, Name FROM Product2];
        }catch(Exception e){
            System.debug('Error in getProductValues: '+e.getMessage());
            return null;
        }
    }

    //getAsset
    @AuraEnabled
    public static List<BT_Lightning_Utils.dataTableFields> getAsset(String assetId) {
        try{
            buildertek__Asset_Manager__c asset = [SELECT Id, Name, RecordTypeId, RecordType.Name from buildertek__Asset_Manager__c WHERE Id = :assetId];
            if(asset.recordType.Name == 'Company Owned'){
                return BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Asset_Manager__c', 'buildertek__Company_Owned_Page_Layout');
            }else if(asset.recordType.Name == 'Rental'){
                return BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Asset_Manager__c', 'buildertek__Rental_Page_Layout');
            }else{
                return null;
            }
        }catch(Exception e){
            System.debug('Error in getAsset: '+e.getMessage());
            return null;
        }
    }

    //updateAsset
    @AuraEnabled
    public static String updateAsset(buildertek__Asset_Manager__c assetRecord) {
        try{
            System.debug('assetRecord: '+assetRecord);
            update assetRecord;
            return 'Success';
        }catch(Exception e){
            System.debug('Error in updateAsset: '+e.getMessage());
            return e.getMessage();
        }
    }




}