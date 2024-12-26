public with sharing class CreatePOController {

    @AuraEnabled
    public static ErrorClass createPoOnBudgetLine(String recordId){
        
        ErrorClass err = new ErrorClass();

        try {
            buildertek__Purchase_Order__c po = new buildertek__Purchase_Order__c();
            buildertek__Purchase_Order_Item__c poLine = new buildertek__Purchase_Order_Item__c();
            buildertek__Budget_Item__c budgetLine = new buildertek__Budget_Item__c();
            budgetLine = [SELECT Id, name, buildertek__Budget__r.buildertek__Project__c, buildertek__Quantity__c, buildertek__Cost_Code__c, buildertek__Contractor__c, buildertek__Budget__c, buildertek__Group__c, buildertek__Complete__c, buildertek__Unit_Price__c FROM buildertek__Budget_Item__c WHERE Id = :recordId];

            if (budgetLine.buildertek__Contractor__c == null) {
                err.Message = 'Vendor is required';
                err.RecordId = '';
                return err;
            }
            po.buildertek__Description__c = budgetLine.Name;
            po.buildertek__Vendor__c = budgetLine.buildertek__Contractor__c;
            po.buildertek__Cost_Code__c = budgetLine.buildertek__Cost_Code__c;
            po.buildertek__Budget__c = budgetLine.buildertek__Budget__c;
            po.buildertek__Budget_Line__c = budgetLine.Id;
            po.buildertek__Project__c = budgetLine.buildertek__Budget__r.buildertek__Project__c;
            insert po;

            poLine.buildertek__Purchase_Order__c = po.Id;
            poLine.Name = budgetLine.Name;
            poLine.buildertek__Description__c = budgetLine.Name;
            poLine.buildertek__Cost_Code__c = budgetLine.buildertek__Cost_Code__c;
            poLine.buildertek__Unit_Price__c = budgetLine.buildertek__Unit_Price__c;
            poLine.buildertek__Quantity__c = budgetLine.buildertek__Quantity__c;
            poLine.buildertek__BT_Budget__c = budgetLine.buildertek__Budget__c;
            poLine.buildertek__Budget_Item__c = budgetLine.Id;
            insert poLine;

            err.Message = 'Success';
            err.RecordId = po.Id;
        } catch (Exception e) {
            BT_ExceptionHandler.Store_Exception(e);
            err.Message = e.getMessage();
            err.RecordId = '';
        }
        
        return err;
    }

    public class ErrorClass{
        @AuraEnabled
        public String Message{ get; set; }

        @AuraEnabled
        public String RecordId{ get; set; }
    }
}