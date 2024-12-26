public without sharing class CreatePOFromBudgetController {
    
    @AuraEnabled
    public static string checkIfPOExists(String budgetLineList){
        String budgetLineNames = '';
        try {
            List<Object> rawBudgetLineDetails = (List<Object>) JSON.deserializeUntyped(budgetLineList);
            List<Map<String, Object>> budgetLineDetails = new List<Map<String, Object>>();
            for (Object obj : rawBudgetLineDetails) {
                budgetLineDetails.add((Map<String, Object>) obj);
            }

            Map<Id, String> budgetLineMap = new Map<Id, String>();
            List<Id> budgetLineItemIds = new List<Id>();
            for (Map<String, Object> budgetDetail : budgetLineDetails) {
                if (budgetDetail.containsKey('Id') && budgetDetail.get('Id') != null) {
                    Id budgetLineId = (Id) budgetDetail.get('Id');
                    String budgetLineName = (String) budgetDetail.get('Name');
                    budgetLineMap.put(budgetLineId, budgetLineName);
                    budgetLineItemIds.add(budgetLineId);    
                }
            }

            List<buildertek__Purchase_Order_Item__c> poLines = [ SELECT Id, Name, buildertek__Budget_Item__c FROM buildertek__Purchase_Order_Item__c WHERE buildertek__Budget_Item__c IN :budgetLineItemIds];
            Set<String> budgetLineNamesSet = new Set<String>();
            for (buildertek__Purchase_Order_Item__c poLine : poLines) {
                if (budgetLineMap.containsKey(poLine.buildertek__Budget_Item__c)) {
                    String budgetLineName = budgetLineMap.get(poLine.buildertek__Budget_Item__c);
                    budgetLineNamesSet.add(budgetLineName);
                }
            }

            if (!budgetLineNamesSet.isEmpty()) {
                if (budgetLineNamesSet.size() == 1) {
                    budgetLineNames = budgetLineNamesSet.iterator().next();
                } else {
                    budgetLineNames = String.join(new List<String>(budgetLineNamesSet), ', ');
                }            
            } else {
                budgetLineNames = 'No PO lines found for the provided budget lines.';
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return budgetLineNames;
    }

    @AuraEnabled
    public static String createPOs(String budgetId, String budgetLineList){
        try {
            List<Object> rawBudgetLineDetails = (List<Object>) JSON.deserializeUntyped(budgetLineList);
            List<Map<String, Object>> budgetLineDetails = new List<Map<String, Object>>();
            for (Object obj : rawBudgetLineDetails) {
                budgetLineDetails.add((Map<String, Object>) obj);
            }

            List<Id> budgetLineItemIds = new List<Id>();
            for (Map<String, Object> budgetDetail : budgetLineDetails) {
                if (budgetDetail.containsKey('Id') && budgetDetail.get('Id') != null) {
                    budgetLineItemIds.add((Id) budgetDetail.get('Id'));
                }
            }
            List<buildertek__Budget_Item__c> budgetLinesRecord = [ SELECT Id, Name, buildertek__Description__c, buildertek__Cost_Code__c, buildertek__Quantity__c, buildertek__Unit_Price__c, buildertek__Item_Name__c, buildertek__Product__c, buildertek__Trade_Type__c, buildertek__Notes__c, buildertek__Discount__c, buildertek__Tax__c FROM buildertek__Budget_Item__c WHERE Id IN :budgetLineItemIds];

            buildertek__Budget__c budgetRecord = [SELECT Id, Name, buildertek__Description__c, buildertek__Project__c FROM buildertek__Budget__c WHERE Id = :budgetId];

            buildertek__Purchase_Order__c poToAdd = new buildertek__Purchase_Order__c();
            List<buildertek__Purchase_Order_Item__c> poLinesToLink = new List<buildertek__Purchase_Order_Item__c>();

            if(budgetId != null){
                // poToAdd.buildertek__Budget__c = budgetId;
                poToAdd.buildertek__Project__c = budgetRecord.buildertek__Project__c;
                poToAdd.buildertek__Description__c = budgetRecord.buildertek__Description__c;
                insert poToAdd;
            } else{
                System.debug('Failed ot get budget Id');
            }

            if(budgetLineDetails != null && !budgetLinesRecord.isEmpty()){
                for (buildertek__Budget_Item__c budgetLineItem : budgetLinesRecord) {
                    buildertek__Purchase_Order_Item__c poLineToAdd = new buildertek__Purchase_Order_Item__c();
                    poLineToAdd.Name = budgetLineItem.Name;
                    poLineToAdd.buildertek__BT_Budget__c = budgetId;
                    poLineToAdd.buildertek__Budget_Item__c = budgetLineItem.Id;
                    poLineToAdd.buildertek__Purchase_Order__c = poToAdd.Id;
                    poLineToAdd.buildertek__Description__c = budgetLineItem.buildertek__Description__c;
                    poLineToAdd.buildertek__Item_Name__c = budgetLineItem.buildertek__Item_Name__c;
                    poLineToAdd.buildertek__Cost_Code__c = budgetLineItem.buildertek__Cost_Code__c;
                    poLineToAdd.buildertek__Product__c = budgetLineItem.buildertek__Product__c;
                    poLineToAdd.buildertek__Quantity__c = budgetLineItem.buildertek__Quantity__c;
                    poLineToAdd.buildertek__Notes__c = budgetLineItem.buildertek__Notes__c;
                    poLineToAdd.buildertek__BT_Trade_Type__c = budgetLineItem.buildertek__Trade_Type__c;
                    poLineToAdd.buildertek__Unit_Price__c = budgetLineItem.buildertek__Unit_Price__c;
                    poLineToAdd.buildertek__Discount__c = budgetLineItem.buildertek__Discount__c;
                    poLineToAdd.buildertek__Tax__c = budgetLineItem.buildertek__Tax__c;

                    poLinesToLink.add(poLineToAdd);
                }

                if(!poLinesToLink.isEmpty()){
                    PurchaseOrderItemTriggerHandler.allowPOLinkToBudgetLinkCreation = false;
                    insert poLinesToLink;
                    PurchaseOrderItemTriggerHandler.allowPOLinkToBudgetLinkCreation = true;
                }
            } else{
                System.debug('Failed to get budgetLines');
            }

            return poToAdd.Id;
        } catch (Exception e) {
            System.debug(e.getMessage());
            return e.getMessage();
        }
    }
}