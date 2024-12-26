public without sharing class massEmailRFQ {
    public massEmailRFQ() {

    }

    @AuraEnabled
    public static String getOrgCurrency() {
        return UserInfo.getDefaultCurrency();
    }

    @AuraEnabled
    public static List<buildertek__RFQ__c> getRFQs(String searchTerm){
        try{
            List<buildertek__RFQ__c> allRFQs = new List<buildertek__RFQ__c>();
            String query = 'SELECT Id, Name, buildertek__Auto_Number__c, buildertek__Due_Date__c, buildertek__Project__c, buildertek__Project__r.Name, buildertek__Status__c, buildertek__Description__c, buildertek__Trade_Type__c, buildertek__Trade_Type__r.Name FROM buildertek__RFQ__c WHERE Id IN (SELECT buildertek__RFQ__c FROM buildertek__RFQ_To_Vendor__c) AND buildertek__Status__c NOT IN (\'Awarded\', \'Canceled\', \'Accepted\') ';
            if(String.isNotBlank(searchTerm)){
                String searchTermWithWildcards = '%' + searchTerm + '%';
                query += ' AND (Name LIKE :searchTermWithWildcards OR buildertek__Project__r.Name LIKE :searchTermWithWildcards OR buildertek__Trade_Type__r.Name LIKE :searchTermWithWildcards OR buildertek__Auto_Number__c LIKE :searchTermWithWildcards)';
            }
            query += ' ORDER BY Name ASC, buildertek__Project__r.Name ASC NULLS LAST';
            System.debug('query: ' + query);
            allRFQs = Database.query(query);
            return allRFQs;

        }catch(Exception e){
            BT_ExceptionHandler.Store_Exception(e);
            return null;
        }
    }

    @AuraEnabled
    public static Map<Id, List<RFQ_To_Vendor__c>> getRfqToVendorsMap(List<String> rfqIds) {
        Map<Id, List<RFQ_To_Vendor__c>> rfqToVendorsMap = new Map<Id, List<RFQ_To_Vendor__c>>();
        
        try {
            // Validate input
            if (rfqIds == null || rfqIds.isEmpty()) {
                return rfqToVendorsMap;
            }
            
            // Query RFQ to Vendor records
            List<buildertek__RFQ_To_Vendor__c> rfqVendorsList;
            
            // Multi-currency organization handling
            if (UserInfo.isMultiCurrencyOrganization()) {
                String rfqRecordsQuery = 'SELECT Id, Name, buildertek__Contact__c, buildertek__Contact__r.Name, ' +
                    'buildertek__Contact__r.Email, buildertek__Contact__r.Phone, buildertek__RFQ__r.buildertek__Status__c, ' +
                    'buildertek__RFQ__r.buildertek__Vendor__c, buildertek__Vendor__r.Name, ' +
                    'buildertek__Status__c, buildertek__Vendor__c, ' +
                    'buildertek__Vendor__r.buildertek__Pre_Qualified__c, buildertek__Quote_Amount__c, ' +
                    'buildertek__RFQ__c, CurrencyIsoCode, ' +
                    '(SELECT id, Name, buildertek__Item_Name__c, buildertek__Quantity__c, ' +
                    'buildertek__Unit_Price__c, buildertek__Total_Price__c, CurrencyIsoCode, ' +
                    'buildertek__Description__c, buildertek__Budget_Line_Amount__c, ' +
                    'buildertek__Estimated_Work_Days__c, buildertek__Vendor_Note__c, ' +
                    'buildertek__isVendorRFQSubmited__c FROM buildertek__Vendor_Items__r), ' +
                    '(SELECT Id, Name, File__r.Name, File__r.buildertek__File_Presigned_URL__c, ' +
                    'File__r.buildertek__Download_Link__c, CurrencyIsoCode, ' +
                    'File__r.buildertek__Download_Link1__c FROM buildertek__RFQ_To_Vendor_Document_Links__r), ' +
                    '(SELECT Id, buildertek__File_Presigned_URL__c, CurrencyIsoCode, ' +
                    'buildertek__Download_Link__c, buildertek__Download_Link1__c, Name ' +
                    'FROM buildertek__Files__r) ' +
                    'FROM buildertek__RFQ_To_Vendor__c ' +
                    'WHERE buildertek__RFQ__c IN :rfqIds ' +
                    'ORDER BY buildertek__Vendor__r.Name, buildertek__Contact__r.Name NULLS LAST';
                
                rfqVendorsList = Database.query(rfqRecordsQuery);
            } else {
                rfqVendorsList = [
                    SELECT Id, Name, buildertek__Contact__c, buildertek__Contact__r.Name, 
                    buildertek__Contact__r.Email, buildertek__Contact__r.Phone, buildertek__RFQ__r.buildertek__Status__c, 
                    buildertek__RFQ__r.buildertek__Vendor__c, buildertek__Vendor__r.Name, 
                    buildertek__Status__c, buildertek__Vendor__c, 
                    buildertek__Vendor__r.buildertek__Pre_Qualified__c, 
                    buildertek__Quote_Amount__c, buildertek__RFQ__c,
                    (SELECT id, Name, buildertek__Item_Name__c, buildertek__Quantity__c, 
                    buildertek__Unit_Price__c, buildertek__Total_Price__c, 
                    buildertek__Description__c, buildertek__Budget_Line_Amount__c, 
                    buildertek__Estimated_Work_Days__c, buildertek__Vendor_Note__c, 
                    buildertek__isVendorRFQSubmited__c 
                    FROM buildertek__Vendor_Items__r 
                    ORDER BY CreatedDate),
                    (SELECT Id, Name, buildertek__File__r.Name, 
                    buildertek__File__r.buildertek__File_Presigned_URL__c, 
                    buildertek__File__r.buildertek__Download_Link__c, 
                    buildertek__File__r.buildertek__Download_Link1__c 
                    FROM buildertek__RFQ_To_Vendor_Document_Links__r),
                    (SELECT Id, buildertek__File_Presigned_URL__c, 
                    buildertek__Download_Link__c, buildertek__Download_Link1__c, Name 
                    FROM buildertek__Files__r)
                    FROM buildertek__RFQ_To_Vendor__c 
                    WHERE buildertek__RFQ__c IN :rfqIds 
                    ORDER BY buildertek__Vendor__r.Name, buildertek__Contact__r.Name NULLS LAST
                ];
            }
            
            // Group vendors by RFQ Id
            for (buildertek__RFQ_To_Vendor__c vendor : rfqVendorsList) {
                Id rfqId = vendor.buildertek__RFQ__c;
                
                if (!rfqToVendorsMap.containsKey(rfqId)) {
                    rfqToVendorsMap.put(rfqId, new List<buildertek__RFQ_To_Vendor__c>());
                }
                
                rfqToVendorsMap.get(rfqId).add(vendor);
            }
            
            return rfqToVendorsMap;
        } catch (Exception ex) {
            System.debug('Exception >>> ' + ex);
            BT_ExceptionHandler.Store_Exception(ex);
            throw new AuraHandledException(ex.getMessage() + ' Line: ' + ex.getLineNumber());
        }
    }

    @AuraEnabled
    public static string updateContact(String contactId, String contactEmail){
        try{
            Contact con = new Contact(Id = contactId, Email = contactEmail);
            update con;
            return 'success';
        }catch(Exception e){
            BT_ExceptionHandler.Store_Exception(e);
            return e.getMessage();
        }
    }

    
}