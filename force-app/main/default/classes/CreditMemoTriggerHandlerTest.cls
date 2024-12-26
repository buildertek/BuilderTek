@isTest
private class CreditMemoTriggerHandlerTest {
    
    @TestSetup
    static void makeData(){
        List<buildertek__Budget__c> testBudgetsList = new List<buildertek__Budget__c>();
        
        buildertek__Budget__c testBudget = new buildertek__Budget__c(Name = 'Test Budget');
        testBudgetsList.add(testBudget);
        
        buildertek__Budget__c anotherTestBudget = new buildertek__Budget__c(Name = 'Another Test Budget');
        testBudgetsList.add(anotherTestBudget);
        insert testBudgetsList;
        
        buildertek__Budget_Line_Group__c testGroup = new buildertek__Budget_Line_Group__c(Name = 'Credit');
        insert testGroup;
    }
    
    @isTest
    static void testHandleAfterInsert() {
        buildertek__Budget__c testBudget = [SELECT Id FROM buildertek__Budget__c WHERE Name = 'Test Budget' LIMIT 1];
        
        buildertek__Credit_Memo__c testCreditMemo = new buildertek__Credit_Memo__c(
            Name = 'Test Credit Memo',
            buildertek__BT_Budget__c = testBudget.Id
        );
        insert testCreditMemo;
    }
    
    @isTest
    static void testHandleAfterUpdate() {
        buildertek__Budget__c testBudget = [SELECT Id FROM buildertek__Budget__c WHERE Name = 'Test Budget' LIMIT 1];
        buildertek__Budget__c anotherTestBudget = [SELECT Id FROM buildertek__Budget__c WHERE Name = 'Another Test Budget' LIMIT 1];

        buildertek__Credit_Memo__c testCreditMemo = new buildertek__Credit_Memo__c(
            Name = 'Test Credit Memo',
            buildertek__BT_Budget__c = testBudget.Id
        );
        insert testCreditMemo;
        
        testCreditMemo.buildertek__BT_Budget__c = anotherTestBudget.Id;
        update testCreditMemo;
    }
    
    @isTest
    static void testHandleBeforeDelete() {
        buildertek__Budget__c testBudget = [SELECT Id FROM buildertek__Budget__c WHERE Name = 'Test Budget' LIMIT 1];
        
        buildertek__Credit_Memo__c testCreditMemo = new buildertek__Credit_Memo__c(
            Name = 'Test Credit Memo',
            buildertek__BT_Budget__c = testBudget.Id
        );
        insert testCreditMemo;
        
        delete testCreditMemo;
    }
}