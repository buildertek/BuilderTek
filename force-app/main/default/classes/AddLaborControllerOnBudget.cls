public with sharing class AddLaborControllerOnBudget {

    @AuraEnabled
    public static tsDataTableWrapper getTimeCardAndTimeSheetEntryData(string RecId){
        
        tsDataTableWrapper tsDwrp = new tsDataTableWrapper();
        
        try {
            buildertek__Budget__c BudgetRec = [SELECT Id, Name, buildertek__Project__c FROM buildertek__Budget__c where Id = :RecId ORDER BY Name ASC];
    
            List<buildertek__Time_Cards__c> recordList = new List<buildertek__Time_Cards__c>();
    
            List<buildertek__BT_Time_Sheet_Entry__c> timesheetEntryList = [SELECT Id, Name, buildertek__BT_Project__r.Name, buildertek__Status__c, buildertek__BT_Budget__c, buildertek__BT_Budget_Line__c, buildertek__Total_Labor_Costs__c, buildertek__BT_Time_Sheet__r.Name
                                                                           FROM buildertek__BT_Time_Sheet_Entry__c WHERE (buildertek__BT_Project__c = :BudgetRec.buildertek__Project__c and buildertek__BT_Budget_Line__c = null) and (buildertek__Status__c = 'Approved' OR buildertek__Status__c ='Submitted')];
            if (UserInfo.isMultiCurrencyOrganization() && BudgetRec.buildertek__Project__c != null){
                string BudgetRecords = 'SELECT Id, Name,buildertek__Resource__c, buildertek__Resource__r.Name ,buildertek__Project__c, buildertek__Project__r.Name,buildertek__Description__c, buildertek__Budget_Line__c, buildertek__Budget__c, ' +
                                    'buildertek__Daily_Expense__c' +
                                    ' FROM buildertek__Time_Cards__c' +
                                    ' where buildertek__Project__c =\'' + BudgetRec.buildertek__Project__c + '\' and buildertek__Budget_Line__c = null and buildertek__Budget__c = null ORDER BY Name LIMIT 5000';
                recordList = Database.query(BudgetRecords);
            } else{
                recordList = [SELECT Id, Name, buildertek__Resource__c, buildertek__Resource__r.Name, buildertek__Project__c, buildertek__Budget__c, buildertek__Project__r.Name, buildertek__Description__c, buildertek__Budget_Line__c, buildertek__Daily_Expense__c
                                    FROM buildertek__Time_Cards__c WHERE buildertek__Project__c = :BudgetRec.buildertek__Project__c and buildertek__Budget_Line__c = null and buildertek__Budget__c = null ORDER BY Name LIMIT 5000];
            }
    
    
            tsDwrp.timesheetEntryList = timesheetEntryList;
            tsDwrp.timeCardList = recordList;
            tsDwrp.msg = 'success';
        } catch (Exception e) {
            System.debug('Exception error '+e);
            tsDwrp.msg = e.getMessage();
            BT_ExceptionHandler.Store_Exception(e);
        }

        return tsDwrp;
    }

    @AuraEnabled
    public static string updateTimeSheetEntry(List<buildertek__BT_Time_Sheet_Entry__c> timeSheetEntryList){
        System.debug('timeSheetEntryList => ' + timeSheetEntryList);
        if (timeSheetEntryList.size() > 0){
            update timeSheetEntryList;
        }
        return 'Success';
    }

    @AuraEnabled
    public static string updateTimeCards(List<buildertek__Time_Cards__c> timeCardList){
        System.debug('timeCardList => ' + timeCardList);
        if (timeCardList.size() > 0){
            update timeCardList;
        }
        return 'Success';
    }

    public class tsDataTableWrapper {
        @AuraEnabled
        public List<buildertek__BT_Time_Sheet_Entry__c> timesheetEntryList{ get; set; }

        @AuraEnabled
        public List<buildertek__Time_Cards__c> timeCardList{ get; set; }

        @AuraEnabled
        public String msg = '';
    }
}