public without sharing class CreditMemoTriggerHandler {
	
    public static Boolean blnSkipCreditMemoUpdateTrigger = false;

    public static void handleBeforeInsert(List<buildertek__Credit_Memo__c> newCreditMemos) {
        for (buildertek__Credit_Memo__c creditMemo : newCreditMemos) {
            if(creditMemo.buildertek__Credit_Memo_Date__c == null){
                creditMemo.buildertek__Credit_Memo_Date__c = Date.today();
            }
        }
    }

    public static void handleAfterInsert(List<buildertek__Credit_Memo__c> newCreditMemos) {
        List<buildertek__Credit_Memo__c> creditMemosToUpsert = new List<buildertek__Credit_Memo__c>();
        for (buildertek__Credit_Memo__c creditMemo : newCreditMemos) {
            if (creditMemo.buildertek__BT_Budget__c != null) {
                creditMemosToUpsert.add(creditMemo);
            }

        }
        if (!creditMemosToUpsert.isEmpty()) {
            upsertBudgetItemsForCreditMemos(creditMemosToUpsert);
        }
    }

    public static void handleAfterUpdate(List<buildertek__Credit_Memo__c> newCreditMemos, Map<Id, buildertek__Credit_Memo__c> oldCreditMemosMap) {
        List<buildertek__Credit_Memo__c> creditMemosToUpsert = new List<buildertek__Credit_Memo__c>();
        List<buildertek__Credit_Memo__c> creditMemosToDelete = new List<buildertek__Credit_Memo__c>();

        for (buildertek__Credit_Memo__c creditMemo : newCreditMemos) {
            buildertek__Credit_Memo__c oldCreditMemo = oldCreditMemosMap.get(creditMemo.Id);
            if (!blnSkipCreditMemoUpdateTrigger) {
                // The Budget has changed, so delete old Budget Items and create new ones
                if (creditMemo.buildertek__BT_Budget__c != null && creditMemo.buildertek__BT_Budget__c != oldCreditMemo.buildertek__BT_Budget__c) {
                    creditMemosToDelete.add(oldCreditMemo);
                    creditMemosToUpsert.add(creditMemo);
                } else if (oldCreditMemo.buildertek__BT_Budget__c != null && creditMemo.buildertek__BT_Budget__c == null) {
                    // Budget has been removed, so delete the Budget Items related to the old Credit Memo
                    creditMemosToDelete.add(oldCreditMemo);
                }
            }
        }

        if (!creditMemosToDelete.isEmpty()) {
            deleteBudgetItemsForCreditMemos(creditMemosToDelete);
        }
        
        if (!creditMemosToUpsert.isEmpty()) {
            upsertBudgetItemsForCreditMemos(creditMemosToUpsert);
        }
    }

    public static void handleBeforeDelete(List<buildertek__Credit_Memo__c> oldCreditMemos) {
        Set<Id> creditMemoIds = new Set<Id>();
        for (buildertek__Credit_Memo__c creditMemo : oldCreditMemos) {
            if (creditMemo.buildertek__BT_Budget__c != null) {
                creditMemoIds.add(creditMemo.Id);
            }
        }
        if (!creditMemoIds.isEmpty()) {
            deleteBudgetItemsForCreditMemoIds(creditMemoIds);
        }
    }

    private static void upsertBudgetItemsForCreditMemos(List<buildertek__Credit_Memo__c> creditMemos) {
        Map<Id, buildertek__Budget_Item__c> budgetItemsToUpsert = new Map<Id, buildertek__Budget_Item__c>();

        // Get the existing Budget Items related to these Credit Memos
        Map<Id, buildertek__Budget_Item__c> existingBudgetItems = new Map<Id, buildertek__Budget_Item__c>([
            SELECT Id, buildertek__Budget__c, buildertek__Credit_Memo__c 
            FROM buildertek__Budget_Item__c 
            WHERE buildertek__Credit_Memo__c IN :creditMemos
        ]);

        // Get the Credit Phase Group Id or create a new one if it doesn't exist
        String creditPhaseGroupId;
        List<buildertek__Budget_Line_Group__c> budgetLineGroups = [SELECT Id FROM buildertek__Budget_Line_Group__c WHERE Name = 'Credit' LIMIT 1];
        if (budgetLineGroups.isEmpty()) {
            buildertek__Budget_Line_Group__c newBudgetLineGroup = new buildertek__Budget_Line_Group__c(Name = 'Credit');
            insert newBudgetLineGroup;
            creditPhaseGroupId = newBudgetLineGroup.Id;
        } else {
            creditPhaseGroupId = budgetLineGroups[0].Id;
        }

        // Create or update the Budget Items related to these Credit Memos
        for (buildertek__Credit_Memo__c creditMemo : creditMemos) {
            buildertek__Budget_Item__c budgetItem;

            if (existingBudgetItems.containsKey(creditMemo.Id)) {
                budgetItem = existingBudgetItems.get(creditMemo.Id);
            } else {
                budgetItem = new buildertek__Budget_Item__c();
                budgetItem.buildertek__Credit_Memo__c = creditMemo.Id;
            }

            budgetItem.buildertek__Budget__c = creditMemo.buildertek__BT_Budget__c;
            budgetItem.Name = creditMemo.Name;
            budgetItem.buildertek__Item_Name__c = creditMemo.Name;
            budgetItem.buildertek__Group__c = creditPhaseGroupId;
            budgetItem.buildertek__Unit_Price__c = creditMemo.buildertek__Amount__c;

            budgetItemsToUpsert.put(creditMemo.Id, budgetItem);
        }

        // Upsert the Budget Items
        if (!budgetItemsToUpsert.isEmpty()) {
            upsert budgetItemsToUpsert.values();
        }
    }

    private static void deleteBudgetItemsForCreditMemos(List<buildertek__Credit_Memo__c> creditMemos) {
        Set<Id> creditMemoIds = new Set<Id>();
        for (buildertek__Credit_Memo__c creditMemo : creditMemos) {
            creditMemoIds.add(creditMemo.Id);
        }
        deleteBudgetItemsForCreditMemoIds(creditMemoIds);
    }

    private static void deleteBudgetItemsForCreditMemoIds(Set<Id> creditMemoIds) {
        List<buildertek__Budget_Item__c> budgetItemsToDelete = [SELECT Id FROM buildertek__Budget_Item__c WHERE buildertek__Credit_Memo__c IN :creditMemoIds];
        if (!budgetItemsToDelete.isEmpty()) {
            delete budgetItemsToDelete;
        }
    }
}