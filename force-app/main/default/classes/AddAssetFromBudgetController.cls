public without sharing class AddAssetFromBudgetController {

    @AuraEnabled
    public static List<buildertek__Asset_History__c> getAssetData(string budgetId){

        buildertek__Budget__c budgetRec = [SELECT Id, Name, buildertek__Project__c FROM buildertek__Budget__c WHERE Id = :budgetId ORDER BY Name ASC];

        List<buildertek__Asset_History__c> assetHistoryList = new List<buildertek__Asset_History__c>();

        assetHistoryList = [SELECT Id, Name, buildertek__Asset_Manager__r.Name,buildertek__Project__c, buildertek__Project__r.Name, buildertek__Date_on_Job__c, buildertek__Date_off_Job__c, buildertek__Hours_Used__c, buildertek__Cost__c, buildertek__Total_Cost__c, buildertek__BT_Budget__c, buildertek__BT_Budget_Line__c
                           FROM buildertek__Asset_History__c
                           WHERE buildertek__Project__c = :budgetRec.buildertek__Project__c AND buildertek__BT_Budget__c = null AND buildertek__BT_Budget_Line__c = null
                           ORDER BY Name ASC];

        return assetHistoryList;
    }

    @AuraEnabled
    public static String addAssetToBudget(List<buildertek__Asset_History__c> selectedAsset, String budgetId){
        
        List<buildertek__Asset_History__c> assetHistoryList = [SELECT Id, Name, buildertek__Total_Cost__c, buildertek__Notes__c FROM buildertek__Asset_History__c WHERE Id IN :selectedAsset];
        List<buildertek__Budget_Line_Group__c> budgetLinePhase = [SELECT Id, Name FROM buildertek__Budget_Line_Group__c WHERE Name LIKE '%No Grouping%' LIMIT 1];

        String budgetItemName;
        Decimal totalAssetCost = 0;

        if (!assetHistoryList.isEmpty()) {
            if (assetHistoryList.size() == 1) {
                List<String> assetNames = new List<String>();
                for (buildertek__Asset_History__c asset : assetHistoryList) {
                    assetNames.add(asset.Name);
                    totalAssetCost += asset.buildertek__Total_Cost__c != null ? asset.buildertek__Total_Cost__c : 0;
                }
                budgetItemName = assetHistoryList[0].Name;
            } else {
                List<String> assetNames = new List<String>();
                for (buildertek__Asset_History__c asset : assetHistoryList) {
                    assetNames.add(asset.Name);
                    totalAssetCost += asset.buildertek__Total_Cost__c != null ? asset.buildertek__Total_Cost__c : 0;
                }
                budgetItemName = String.join(assetNames, '_');
            }
        }

        buildertek__Budget_Item__c budgetItem = new buildertek__Budget_Item__c();
        budgetItem.Name = budgetItemName;
        budgetItem.buildertek__Item_Name__c = budgetItemName;
        budgetItem.buildertek__Budget__c = budgetId;
        budgetItem.buildertek__Assets__c = totalAssetCost;
        budgetItem.buildertek__Quantity__c = 1;
        budgetItem.buildertek__Unit_Price__c = 0.00;
        if(!budgetLinePhase.isEmpty()){
            budgetItem.buildertek__Group__c = budgetLinePhase[0].Id;
        }
        insert budgetItem;

        for (buildertek__Asset_History__c assetHist : assetHistoryList) {
            assetHist.buildertek__BT_Budget__c = budgetId;
            assetHist.buildertek__BT_Budget_Line__c = budgetItem.Id;
        }
        AssestManagerHandler.blnSkipAssetHistoryTrigger = true;
        update assetHistoryList;
        AssestManagerHandler.blnSkipAssetHistoryTrigger = false;

        return 'Success';
    }

    @AuraEnabled
    public static String addAssetToBudgetLine(String selectedBudgetLine, List<buildertek__Asset_History__c> selectedAsset, String budgetId){
        
        List<buildertek__Asset_History__c> assetHistoryList = [SELECT Id, Name, buildertek__Total_Cost__c FROM buildertek__Asset_History__c WHERE Id IN :selectedAsset];
        
        Decimal totalAssetCost = 0;   
        for (buildertek__Asset_History__c asset : assetHistoryList) {
            totalAssetCost += asset.buildertek__Total_Cost__c != null ? asset.buildertek__Total_Cost__c : 0;
        }
        
        List<buildertek__Budget_Item__c> budgetItemRec = [SELECT Id, Name, buildertek__Assets__c, buildertek__BT_Asset_History__c FROM buildertek__Budget_Item__c WHERE Id = :selectedBudgetLine];

        if (!budgetItemRec.isEmpty()) {
            for (buildertek__Budget_Item__c budgetItem : budgetItemRec){
                if(budgetItem.buildertek__Assets__c == null){
                    budgetItem.buildertek__Assets__c = totalAssetCost;
                } else{
                    budgetItem.buildertek__Assets__c += totalAssetCost;
                }
            }
            update budgetItemRec;
        }

        for (buildertek__Asset_History__c assetHist : assetHistoryList) {
            assetHist.buildertek__BT_Budget__c = budgetId;
            assetHist.buildertek__BT_Budget_Line__c = selectedBudgetLine;
        }
        AssestManagerHandler.blnSkipAssetHistoryTrigger = true;
        update assetHistoryList;
        AssestManagerHandler.blnSkipAssetHistoryTrigger = false;

        return 'Success';
    }

    @AuraEnabled
    public static string getcurrency(){
        return UserInfo.getDefaultCurrency();
    }
}