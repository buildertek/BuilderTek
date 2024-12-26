public with sharing class conflictViewController {
    @AuraEnabled
    public static ScheduleDataWrapper fetchScheduleData(String scheduleId){
        ScheduleDataWrapper wrapper = new ScheduleDataWrapper();
       
        try {
            // wrapper.scheduleList = [SELECT Id, Name, buildertek__Schedule__c, buildertek__Schedule__r.Name, buildertek__Schedule__r.buildertek__Description__c, buildertek__Schedule__r.buildertek__Project__r.Name, buildertek__Contractor__c, buildertek__Contractor__r.Name, buildertek__Contractor_Resource_1__c,buildertek__Contractor_Resource_1__r.Name,buildertek__Contractor_Resource_2__c,buildertek__Contractor_Resource_2__r.Name, buildertek__Contractor_Resource_3__c,buildertek__Contractor_Resource_3__r.Name, buildertek__Internal_Resource_1__c ,buildertek__Internal_Resource_1__r.Name,buildertek__Start__c, buildertek__Finish__c, buildertek__Schedule__r.buildertek__Start_Date__c, buildertek__Schedule__r.buildertek__End_Date__c FROM buildertek__Project_Task__c WHERE buildertek__Schedule__c = :scheduleId AND buildertek__Type__c = 'Task' Order By  buildertek__Phase__c, buildertek__BT_Grouping__c, buildertek__BT_Phase3__c, buildertek__Order__c NULLS LAST, CreatedDate ASC];
            // if (!wrapper.scheduleList.isEmpty()) {
            //     scheduleStartDate = wrapper.scheduleList[0].buildertek__Schedule__r.buildertek__Start_Date__c;
            //     scheduleEndDate = wrapper.scheduleList[0].buildertek__Schedule__r.buildertek__End_Date__c;
            // }
            buildertek__Project_Task__c task1 = [SELECT Id, Name, buildertek__Schedule__c, buildertek__Schedule__r.Name, buildertek__Start__c, buildertek__Finish__c, buildertek__Contractor__c, buildertek__Contractor__r.Name, buildertek__Contractor_Resource_1__c, buildertek__Contractor_Resource_1__r.Name,buildertek__Contractor_Resource_2__c, buildertek__Contractor_Resource_2__r.Name, buildertek__Contractor_Resource_3__c, buildertek__Contractor_Resource_3__r.Name,buildertek__Resource__c, buildertek__Resource__r.Name, buildertek__Internal_Resource_1__c, buildertek__Internal_Resource_1__r.Name, buildertek__Internal_Resource_3__c, buildertek__Internal_Resource_3__r.Name, buildertek__Internal_Resource_4__c, buildertek__Internal_Resource_4__r.Name FROM buildertek__Project_Task__c WHERE Id = :scheduleId  LIMIT 1];
            System.debug(task1);
            Date task1start = task1.buildertek__Start__c;
            Date task1finish = task1.buildertek__Finish__c;

            wrapper.internalResourcesList = [SELECT Id, Name FROM User WHERE isActive = TRUE ORDER BY Name ASC LIMIT 10000];
            
            wrapper.contractorAndResourcesList = [SELECT Id, Name, (SELECT Id, Name, LastName, FirstName FROM Contacts) FROM Account WHERE buildertek__BT_Account_Type__c = 'Vendor' ORDER BY Name ASC];
            List<buildertek__Project_Task__c> conflictList = new List<buildertek__Project_Task__c>();
            List<buildertek__Project_Task__c> task2 = [SELECT Id, Name, buildertek__Schedule__c, buildertek__Schedule__r.Name, buildertek__Start__c, buildertek__Finish__c, buildertek__Contractor__c, buildertek__Contractor__r.Name, buildertek__Contractor_Resource_1__c, buildertek__Contractor_Resource_1__r.Name,buildertek__Contractor_Resource_2__c, buildertek__Contractor_Resource_2__r.Name, buildertek__Contractor_Resource_3__c, buildertek__Contractor_Resource_3__r.Name,buildertek__Resource__c, buildertek__Resource__r.Name, buildertek__Internal_Resource_1__c, buildertek__Internal_Resource_1__r.Name, buildertek__Internal_Resource_3__c, buildertek__Internal_Resource_3__r.Name, buildertek__Internal_Resource_4__c, buildertek__Internal_Resource_4__r.Name FROM buildertek__Project_Task__c WHERE (buildertek__Start__c >=: task1start AND buildertek__Start__c <=: task1finish) OR (buildertek__Finish__c >=: task1start AND buildertek__Finish__c <=: task1finish) OR (buildertek__Start__c <=: task1start AND buildertek__Finish__c >=: task1finish)];
            System.debug(task2);

            for(buildertek__Project_Task__c t2: task2){
                if ((task1.buildertek__Contractor_Resource_1__c != null && task1.buildertek__Contractor_Resource_1__c == t2.buildertek__Contractor_Resource_1__c) ||
                (task1.buildertek__Contractor_Resource_1__c != null && task1.buildertek__Contractor_Resource_1__c == t2.buildertek__Contractor_Resource_2__c) ||
                (task1.buildertek__Contractor_Resource_1__c != null && task1.buildertek__Contractor_Resource_1__c == t2.buildertek__Contractor_Resource_3__c) ||
                (task1.buildertek__Contractor_Resource_2__c != null && task1.buildertek__Contractor_Resource_2__c == t2.buildertek__Contractor_Resource_1__c) ||
                (task1.buildertek__Contractor_Resource_2__c != null && task1.buildertek__Contractor_Resource_2__c == t2.buildertek__Contractor_Resource_2__c) ||
                (task1.buildertek__Contractor_Resource_2__c != null && task1.buildertek__Contractor_Resource_2__c == t2.buildertek__Contractor_Resource_3__c) ||
                (task1.buildertek__Contractor_Resource_3__c != null && task1.buildertek__Contractor_Resource_3__c == t2.buildertek__Contractor_Resource_1__c) ||
                (task1.buildertek__Contractor_Resource_3__c != null && task1.buildertek__Contractor_Resource_3__c == t2.buildertek__Contractor_Resource_2__c) ||
                (task1.buildertek__Contractor_Resource_3__c != null && task1.buildertek__Contractor_Resource_3__c == t2.buildertek__Contractor_Resource_3__c) ||
                (task1.buildertek__Internal_Resource_1__c != null && task1.buildertek__Internal_Resource_1__c == t2.buildertek__Internal_Resource_1__c) ||
                (task1.buildertek__Internal_Resource_1__c != null && task1.buildertek__Internal_Resource_1__c == t2.buildertek__Internal_Resource_3__c) ||
                (task1.buildertek__Internal_Resource_1__c != null && task1.buildertek__Internal_Resource_1__c == t2.buildertek__Internal_Resource_4__c) ||
                (task1.buildertek__Internal_Resource_3__c != null && task1.buildertek__Internal_Resource_3__c == t2.buildertek__Internal_Resource_1__c) ||
                (task1.buildertek__Internal_Resource_3__c != null && task1.buildertek__Internal_Resource_3__c == t2.buildertek__Internal_Resource_3__c) ||
                (task1.buildertek__Internal_Resource_3__c != null && task1.buildertek__Internal_Resource_3__c == t2.buildertek__Internal_Resource_4__c) ||
                (task1.buildertek__Internal_Resource_4__c != null && task1.buildertek__Internal_Resource_4__c == t2.buildertek__Internal_Resource_1__c) ||
                (task1.buildertek__Internal_Resource_4__c != null && task1.buildertek__Internal_Resource_4__c == t2.buildertek__Internal_Resource_3__c) ||
                (task1.buildertek__Internal_Resource_4__c != null && task1.buildertek__Internal_Resource_4__c == t2.buildertek__Internal_Resource_4__c)) {
                System.debug(t2);
                conflictList.add(t2);
                }
            }
            wrapper.conflictingSchedulesList = conflictList;
            return wrapper;

        } catch (Exception ex) {
            System.debug('Error: ' + ex.getMessage());
            List<buildertek__Exception_Log_Store_Option__c> StoreExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
            if (!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true) {
                BT_ExceptionHandler.Store_Exception(ex);
            }
            return null;
        }
    }
    
    @AuraEnabled
    public static String updateScheduleItemResources(buildertek__Project_Task__c scheduleItem){
        try {
            System.debug('scheduleItem: ' + scheduleItem);
            buildertek__Project_Task__c scheduleItemToUpdate = new buildertek__Project_Task__c(Id = scheduleItem.Id);
            scheduleItemToUpdate.buildertek__Contractor__c = scheduleItem.buildertek__Contractor__c;
            scheduleItemToUpdate.buildertek__Contractor_Resource_1__c = scheduleItem.buildertek__Contractor_Resource_1__c;
            scheduleItemToUpdate.buildertek__Contractor_Resource_2__c = scheduleItem.buildertek__Contractor_Resource_2__c;
            scheduleItemToUpdate.buildertek__Contractor_Resource_3__c = scheduleItem.buildertek__Contractor_Resource_3__c;
            scheduleItemToUpdate.buildertek__Internal_Resource_1__c = scheduleItem.buildertek__Internal_Resource_1__c;
            update scheduleItemToUpdate;
            System.debug('scheduleItemToUpdate: ' + scheduleItemToUpdate);
            return 'Success';
        } catch (Exception ex) {
            System.debug('Error: ' + ex.getMessage());
            List<buildertek__Exception_Log_Store_Option__c> StoreExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
            if (!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true) {
                BT_ExceptionHandler.Store_Exception(ex);
            }
            return 'Error';
        }
    }

    public class ScheduleDataWrapper {
        @AuraEnabled public List<buildertek__Project_Task__c> scheduleList;
        @AuraEnabled public List<User> internalResourcesList;
        @AuraEnabled public List<Account> contractorAndResourcesList;
        @AuraEnabled public List<buildertek__Project_Task__c> conflictingSchedulesList;
    }
    
}