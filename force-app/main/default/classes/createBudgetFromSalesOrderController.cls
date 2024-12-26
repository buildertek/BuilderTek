public without sharing class createBudgetFromSalesOrderController {
    
    @AuraEnabled
    public static String createBudgetFromSalesOrder(Id salesOrderId, String groupByType) {
        try {
            buildertek__Sales_Order__c salesOrderDetails = [SELECT Id, Name, buildertek__Project__c, buildertek__Sales_Order_Name__c FROM buildertek__Sales_Order__c WHERE Id = :salesOrderId];

            buildertek__Budget__c budget = new buildertek__Budget__c();
            budget.Name = salesOrderDetails.Name;
            budget.buildertek__Project__c = salesOrderDetails.buildertek__Project__c;
            budget.buildertek__Description__c = salesOrderDetails.buildertek__Sales_Order_Name__c;
            budget.buildertek__Sales_Order__c = salesOrderDetails.Id;
            insert budget;

            List<buildertek__Sales_Order_Lines__c> salesOrderLineList = [SELECT Id, Name, buildertek__Quantity__c, buildertek__Unit_Cost__c, buildertek__Discount__c, buildertek__Markup__c, buildertek__Description__c, buildertek__Product__c FROM buildertek__Sales_Order_Lines__c WHERE buildertek__Sales_Order__c = :salesOrderId];

            List<buildertek__Budget_Line_Group__c> budgetGroupList = [SELECT Id, Name FROM buildertek__Budget_Line_Group__c WHERE Name = 'No Grouping'];

            List<buildertek__Budget_Item__c> budgetItemsToInsert = new List<buildertek__Budget_Item__c>();
            for (buildertek__Sales_Order_Lines__c soLine : salesOrderLineList) {
                buildertek__Budget_Item__c budgetItem = new buildertek__Budget_Item__c();
                budgetItem.buildertek__Budget__c = budget.Id;
                budgetItem.Name = soLine.Name;
                budgetItem.buildertek__Item_Name__c = soLine.Name;
                budgetItem.buildertek__Sales_Order_Line__c = soLine.Id;
                budgetItem.buildertek__Unit_Price__c = soLine.buildertek__Unit_Cost__c;
                budgetItem.buildertek__Quantity__c = soLine.buildertek__Quantity__c;
                budgetItem.buildertek__Discount__c = soLine.buildertek__Discount__c;
                budgetItem.buildertek__Markup__c = soLine.buildertek__Markup__c;
                budgetItem.buildertek__Description__c = soLine.buildertek__Description__c;
                budgetItem.buildertek__Product__c = soLine.buildertek__Product__c;
                budgetItem.buildertek__Group__c = budgetGroupList[0].Id;

                budgetItemsToInsert.add(budgetItem);
            }

            if (!budgetItemsToInsert.isEmpty()) {
                System.debug('Inserted');
                insert budgetItemsToInsert;
            }

            return budget.Id;
        } catch (Exception ex) {
            return ex.getMessage();
        }
    }
}