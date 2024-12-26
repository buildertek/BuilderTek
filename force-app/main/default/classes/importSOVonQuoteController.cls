public without sharing class importSOVonQuoteController {
   
    @AuraEnabled
    public static List<buildertek__Schedule_of_Values__c> fetchSOVForQuote(String searchKeyword, String quoteId){
        try {
            List<buildertek__Quote__c> quoteRec = [SELECT Id, buildertek__Project__c FROM buildertek__Quote__c WHERE Id = :quoteId];
            String projectId = quoteRec[0].buildertek__Project__c;
            if (projectId == null) {
                return new List<buildertek__Schedule_of_Values__c>();
            }
            String search = '%' + searchKeyword + '%';
            
            List<buildertek__Schedule_of_Values__c> SOVList = [SELECT Id, Name, buildertek__Vendor__r.Name, buildertek__Status__c, 
            buildertek__Total_Costs__c FROM buildertek__Schedule_of_Values__c WHERE buildertek__Project__c =:projectId AND (Name LIKE :search) ORDER BY Name ASC];
    
            return SOVList;
        } catch(Exception e) {
            System.debug('fetchSOVForQuote Error: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String importSOVOnQuote(String quoteId, List<String> sovId) {
        try {
            List<buildertek__Schedule_of_Value_Lines__c> sovLineRecList = [SELECT Id, Name, buildertek__Description_of_Work__c, 
            buildertek__Scheduled_Value__c, buildertek__Cost_Code__c, buildertek__Schedule_of_Values__r.buildertek__Vendor__c FROM buildertek__Schedule_of_Value_Lines__c  WHERE buildertek__Schedule_of_Values__c IN :sovId];
            
            List<buildertek__Quote_Item__c> quoteItemList = new List<buildertek__Quote_Item__c>();
            
            if (!sovId.isEmpty()) {
                buildertek__Quote__c quoteRec = new buildertek__Quote__c(
                    Id = quoteId,
                    buildertek__Schedule_of_Values__c = sovId[0]
                );
                update quoteRec;
            }

            if (!sovLineRecList.isEmpty()) {
                for (buildertek__Schedule_of_Value_Lines__c sovLineRec : sovLineRecList) {
                    buildertek__Quote_Item__c quoteLineItemRec = new buildertek__Quote_Item__c();
                    quoteLineItemRec.buildertek__Quote__c = quoteId;
                    quoteLineItemRec.Name = sovLineRec.buildertek__Description_of_Work__c;
                    quoteLineItemRec.buildertek__Cost_Code__c = sovLineRec.buildertek__Cost_Code__c;
                    quoteLineItemRec.buildertek__Item_Name__c = sovLineRec.buildertek__Description_of_Work__c;
                    quoteLineItemRec.buildertek__Quantity__c = 1;
                    quoteLineItemRec.buildertek__Unit_Cost__c = sovLineRec.buildertek__Scheduled_Value__c;
                    quoteLineItemRec.buildertek__Vendor__c = sovLineRec.buildertek__Schedule_of_Values__r.buildertek__Vendor__c;
                    
                    quoteItemList.add(quoteLineItemRec);
                }
            }
            insert quoteItemList;

            return 'SOV imported successfully';
        } catch (Exception e) {
            System.debug('importSOVOnQuote Error: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }

}