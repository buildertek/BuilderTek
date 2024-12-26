public with sharing class scheduleItemcontroller {
    @AuraEnabled(cacheable=true)
    public static List<buildertek__Project_Task__c> getProjectTasks() {
        Id contactId = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()].ContactId;
        System.debug('UserId: ' + UserInfo.getUserId());
        System.debug('ContactId: ' + contactId);
        if (contactId == null) {
            return new List<buildertek__Project_Task__c>();
        }

        Contact associatedContact = [SELECT Id, AccountId FROM Contact WHERE Id = :contactId];
        Id accountId = associatedContact.AccountId;
        System.debug('AccountId: ' + accountId);

        List<buildertek__Project_Task__c> projectTasks = [SELECT Id,
                       Name,
                       buildertek__Project__c,
                       buildertek__Schedule__c,
                       buildertek__Start__c,
                       buildertek__Finish__c,
                       buildertek__Completion__c,
                       buildertek__Status__c
                FROM buildertek__Project_Task__c
                WHERE buildertek__Contractor__c = :accountId];
        
        System.debug('Project Tasks: ' + projectTasks);

        return projectTasks;
    }
}