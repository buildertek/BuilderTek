public without sharing class ImportSOVonBudgetController {
    
    @AuraEnabled
    public static List<sovRecordsClass> getSOVs(String recordId, String searchKeyword){
        buildertek__Budget__c budgetRecord = [SELECT Id, buildertek__Project__c, buildertek__Project__r.Name FROM buildertek__Budget__c WHERE Id =: recordId];

        String searchString = '%' + searchKeyword + '%';
        List<buildertek__Schedule_of_Values__c> SOVRecords = [SELECT Id, Name, buildertek__Vendor__r.Name, buildertek__Status__c, buildertek__Total_Costs__c FROM buildertek__Schedule_of_Values__c WHERE Name LIKE :searchString AND buildertek__Project__c =: budgetRecord.buildertek__Project__c ORDER BY Name ASC LIMIT 50000];

        List<sovRecordsClass> sovRecordsClassList = new List<sovRecordsClass>();
        for(buildertek__Schedule_of_Values__c sov : SOVRecords){
            sovRecordsClass sovRecordsClassRecord = new sovRecordsClass(); 
            sovRecordsClassRecord.sovRecord = sov;
            sovRecordsClassRecord.sovCheck = false;
            sovRecordsClassList.add(sovRecordsClassRecord);
        }

        return sovRecordsClassList;
    }
    
    @AuraEnabled
    public static String importSOVs (List<String> sovIds, String recordId){
        try{
            List<buildertek__Schedule_of_Value_Lines__c> sovLines = [SELECT Id, Name, buildertek__Description_of_Work__c, 
            buildertek__Scheduled_Value__c, buildertek__Schedule_of_Values__c, buildertek__Cost_Code__c, 
            buildertek__Schedule_of_Values__r.buildertek__Vendor__c FROM buildertek__Schedule_of_Value_Lines__c WHERE buildertek__Schedule_of_Values__c IN :sovIds];

            List<buildertek__Budget_Item__c> budgetLineList = new List<buildertek__Budget_Item__c>();

            // if(!sovIds.isEmpty()){
            //     buildertek__Budget__c budgetRec = new buildertek__Budget__c(
            //         Id = recordId,
            //         // buildertek__Schedule_of_Values__c = sovIds[0]
            //     );
            //     update budgetRec;
            // }

            if(!sovLines.isEmpty()){
                for(buildertek__Schedule_of_Value_Lines__c sovLineRec : sovLines){
                    buildertek__Budget_Item__c budgetLineItem = new buildertek__Budget_Item__c();
                    budgetLineItem.buildertek__Budget__c = recordId;
                    budgetLineItem.Name = sovLineRec.buildertek__Description_of_Work__c;
                    budgetLineItem.buildertek__Cost_Code__c = sovLineRec.buildertek__Cost_Code__c;                    
                    budgetLineItem.buildertek__Unit_Price__c = sovLineRec.buildertek__Scheduled_Value__c;
                    budgetLineItem.buildertek__Quantity__c = 1;
                    budgetLineItem.buildertek__Contractor__c = sovLineRec.buildertek__Schedule_of_Values__r.buildertek__Vendor__c;
                    budgetLineList.add(budgetLineItem);
                }
            }
            insert budgetLineList;

            return 'SOV Imported Successfully';
        } catch(Exception e) {
            System.debug('importSOVOnBudget Error: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }                                           
    }

    public class sovRecordsClass{
        @AuraEnabled
        public buildertek__Schedule_of_Values__c sovRecord {get;set;}
        @AuraEnabled
        public boolean sovCheck {get;set;}
   }
}