public class CreateBudgetController {
    @AuraEnabled
    public static ResponseBase createBudget(Id contractId) {
        ResponseBase response = new ResponseBase();
        response.isSuccess = true;
        
        try {
            List<buildertek__Budget__c> newBudget = BudgetContractCreateHelper.createBudgetFromContract(new List<Id> {contractId});
            response.strMessage = 'success';
            response.newRecordId = newBudget[0].Id;
        }
        catch(Exception ex) {
            response.isSuccess = false;
            response.strMessage = ex.getMessage();
        }
        
        return response;
    }
    
    @AuraEnabled
    public static ResponseBase createBudgetFromQuote(Id QuoteId) {
        system.debug('testt');
        ResponseBase response = new ResponseBase();
        response.isSuccess = true;
        
        try {
            List<buildertek__Budget__c> newBudget = BudgetContractCreateHelper.createBudgetFromQuote(new List<Id> {QuoteId});
            response.strMessage = 'success';
            response.newRecordId = newBudget[0].Id;
        }
        catch(Exception ex) {
            response.isSuccess = false;
            response.strMessage = ex.getMessage();
        }
        
        return response;
    }
    
    @AuraEnabled
    public static ResponseBase createContract(Id quotetId) {
        ResponseBase response = new ResponseBase();
        response.isSuccess = true;
        
        //try {
            List<buildertek__Contract__c> newContracts = BudgetContractCreateHelper.createContractsFromQuote(new List<Id> {quotetId});
            response.strMessage = 'success';
            response.newRecordId = newContracts[0].Id;
        //}
        /*catch(Exception ex) {
            response.isSuccess = false;
            response.strMessage = ex.getMessage();
        }*/
        
        return response;
    }
    
    @AuraEnabled
    public static ResponseBase createBudgetFromPurchase(Id purchaseId) {
        ResponseBase response = new ResponseBase();
        response.isSuccess = true;
        
        try {
            List<buildertek__Budget__c> newBudgets = BudgetPurchaseOrderCreateHelper.createBudgetFromPurchaseOrder(new List<Id> {purchaseId});
            system.debug('Budget Id ------> '+newBudgets[0].Id);
            response.newRecordId = newBudgets[0].Id;
            response.strMessage = 'success';
        }
        catch(Exception ex) {
            response.isSuccess = false;
            response.strMessage = ex.getMessage();
        }
        
        return response;
    }

    @AuraEnabled
    public static ResponseBase createGroupBudgetFromQuote(Id QuoteId, String groupByType) {
        ResponseBase response = new ResponseBase();
        try {
            buildertek__Quote__c quoteDetails = [SELECT Id, Name, buildertek__Description__c, buildertek__Additional_Fees__c, buildertek__Project__c FROM buildertek__Quote__c WHERE Id = :QuoteId];

            buildertek__Budget__c budget = new buildertek__Budget__c();
            budget.Name = quoteDetails.Name;
            budget.buildertek__Project__c = quoteDetails.buildertek__Project__c;
            budget.buildertek__BT_Quote__c = quoteDetails.Id;
            budget.buildertek__Description__c = quoteDetails.buildertek__Description__c;
            budget.buildertek__Additional_Fees__c = quoteDetails.buildertek__Additional_Fees__c;
            insert budget;

            List<buildertek__Quote_Item__c> quoteItemList = [SELECT Id, Name, buildertek__Item_Name__c, buildertek__Description__c, buildertek__Quantity__c, buildertek__Unit_Price__c, buildertek__Total_Cost__c, buildertek__Quote__c, buildertek__Cost_Code__c, buildertek__Auto_Number__c, buildertek__Product__c, buildertek__Grouping__c, buildertek__UOM__c, buildertek__Vendor__c, buildertek__Markup__c, buildertek__Unit_Cost__c, buildertek__List_Total__c, buildertek__Net_Unit__c, buildertek__Applied_Markup__c, buildertek__Net_Total__c, buildertek__MFG_Discount__c, buildertek__List_Unit_Price__c, buildertek__Pricing_Method__c, buildertek__Discount__c, buildertek__Profit_Margin__c, buildertek__Net_Total_Price__c, buildertek__Notes__c, buildertek__Tax__c, buildertek__Status__c, buildertek__Priority__c, buildertek__Purchase_Order__c, buildertek__Category__c, buildertek__Grouping__r.Name,buildertek__Product_Family__c,buildertek__Vendor__r.Name,buildertek__Cost_Code__r.Name, buildertek__Category__r.Name, buildertek__Build_Phase__c, buildertek__Build_Phase__r.Name FROM buildertek__Quote_Item__c WHERE buildertek__Quote__c = :QuoteId And buildertek__Status__c != 'Reject' AND buildertek__Not_Customer_Visible__c != true];

            // This section is for Fetching default 'No Grouping' Phase for Budget Line
            List<buildertek__Budget_Line_Group__c> budgetGroupList = [SELECT Id, Name FROM buildertek__Budget_Line_Group__c];
            Map<String, Id> budgetGroupMap = new Map<String, Id>();

            for (buildertek__Budget_Line_Group__c budgetGroupData : budgetGroupList) {
                budgetGroupMap.put(budgetGroupData.Name, budgetGroupData.Id);
            }

            // This section is for Grouping Quote Lines by Vendor, Product Family, Phase, Cost Code, and Category
            Map<String, List<buildertek__Quote_Item__c>> groupedQuoteLines = new Map<String, List<buildertek__Quote_Item__c>>();
            Map<String, String> groupKeyNameMap = new Map<String, String>();
            String groupKeyName = '';
            for (buildertek__Quote_Item__c quoteLine : quoteItemList) {
                String groupKey = '';
                switch on groupByType {
                    when 'Vendor' {
                        groupKey = quoteLine.buildertek__Vendor__c != null ? String.valueOf(quoteLine.buildertek__Vendor__c) : 'No Vendor';
                        groupKeyName = quoteLine.buildertek__Vendor__c != null ? quoteLine.buildertek__Vendor__r.Name : 'No Vendor';
                    }
                    when 'Product_Family' {
                        groupKey = quoteLine.buildertek__Product_Family__c != null ? quoteLine.buildertek__Product_Family__c : 'No Product Family';
                        groupKeyName = quoteLine.buildertek__Product_Family__c != null ? quoteLine.buildertek__Product_Family__c : 'No Product Family';
                    }
                    when 'Phase' {
                        groupKey = quoteLine.buildertek__Build_Phase__c != null ? String.valueOf(quoteLine.buildertek__Build_Phase__c) : 'No Phase';
                        groupKeyName = quoteLine.buildertek__Build_Phase__c != null ? quoteLine.buildertek__Build_Phase__r.Name : 'No Phase';
                    }
                    when 'Cost_Code' {
                        groupKey = quoteLine.buildertek__Cost_Code__c != null ? String.valueOf(quoteLine.buildertek__Cost_Code__c) : 'No Cost Code';
                        groupKeyName = quoteLine.buildertek__Cost_Code__c != null ? quoteLine.buildertek__Cost_Code__r.Name : 'No Cost Code';
                    }
                    when 'Category' {
                        groupKey = quoteLine.buildertek__Category__c != null ? String.valueOf(quoteLine.buildertek__Category__c) : 'No Category';
                        groupKeyName = quoteLine.buildertek__Category__c != null ? quoteLine.buildertek__Category__r.Name : 'No Category';
                    }
                }
                if (!groupedQuoteLines.containsKey(groupKey)) {
                    groupedQuoteLines.put(groupKey, new List<buildertek__Quote_Item__c>());
                    groupKeyNameMap.put(groupKey, groupKeyName);
                }
                groupedQuoteLines.get(groupKey).add(quoteLine);
            }

            // This section is for Calculating Total Cost for each Group from Quote Lines
            Map<String, Decimal> groupTotalCost = new Map<String, Decimal>();
            for (String groupKey : groupedQuoteLines.keySet()) {
                Decimal totalCost = 0;
                for (buildertek__Quote_Item__c quoteLine : groupedQuoteLines.get(groupKey)) {
                    totalCost += quoteLine.buildertek__Total_Cost__c;
                }
                groupTotalCost.put(groupKey, totalCost);
            }

            // This section is for Inserting Budget Items for each Group
            List<buildertek__Budget_Item__c> budgetItemsToInsert = new List<buildertek__Budget_Item__c>();
            for (String groupKey : groupTotalCost.keySet()) {
                buildertek__Budget_Item__c budgetItem = new buildertek__Budget_Item__c();
                budgetItem.buildertek__Budget__c = budget.Id;
                budgetItem.Name = groupKeyNameMap.get(groupKey);
                budgetItem.buildertek__Unit_Price__c = groupTotalCost.get(groupKey);
                budgetItem.buildertek__Quantity__c = 1;
                budgetItem.buildertek__Group__c = budgetGroupMap.get('No Grouping');

                budgetItemsToInsert.add(budgetItem);
            }

            if (!budgetItemsToInsert.isEmpty()) {
                insert budgetItemsToInsert;
            }

            response.isSuccess = true;
            response.strMessage = 'Success';
            response.newRecordId = budget.Id;
            return response;
        } catch (Exception ex) {
            response.isSuccess = false;
            response.strMessage = ex.getMessage();
            System.debug('Error:: '+ex.getMessage());
            return response;
        }
    }
    
    public virtual class ResponseBase {
        @AuraEnabled public Boolean isSuccess;
        @AuraEnabled public String strMessage;
        @AuraEnabled public String newRecordId;
    }
}