public without sharing class ExportBudgetLineController {
    public ExportBudgetLineController() {

    }
    //BUIL -3321
    @AuraEnabled
    public static List<buildertek__Budget_Item__c> getBudgetLine(String BudgetId){
        if(BudgetId != null){
            List<buildertek__Budget_Item__c> budgtItemList = new List<buildertek__Budget_Item__c>();
            List<buildertek__Budget_Item__c> budgetLineList=[Select  Id, Name ,buildertek__Labor__c, buildertek__Total_Sales_Price__c, buildertek__Total_Approvals_CO__c, buildertek__Committed_Costs__c, buildertek__Unit_Price__c, buildertek__Product_Name__c, buildertek__Quantity__c, buildertek__Markup__c, buildertek__Tax__c,buildertek__Total_Costs__c, buildertek__Invoice_total__c, buildertek__Additional_Costs__c, buildertek__Group_Name__c, buildertek__Subcontractor_Budget__c, buildertek__Equipment_Budget__c, buildertek__Material_Budget__c, buildertek__Labor_Budget__c, buildertek__Misc_Budget__c  From buildertek__Budget_Item__c WHERE buildertek__Budget__c=:BudgetId AND buildertek__Group_Name__c != null Order by buildertek__Group_Name__c ]; 
            for(buildertek__Budget_Item__c budgetLine:budgetLineList){
                budgetLine.Name=budgetLine.Name.replace('"', '');
                budgtItemList.add(budgetLine);
            }
            return budgtItemList;
        }else{
            return null;
        }
       
    }
}