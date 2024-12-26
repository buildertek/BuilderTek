trigger CreditMemoTrigger on buildertek__Credit_Memo__c (before insert, before update, before delete, after insert, after update, after delete) {

    if(trigger.isBefore){
        if(trigger.isInsert){
            CreditMemoTriggerHandler.handleBeforeInsert(trigger.new);
        } 
    }
    
    if (trigger.isAfter) {
        if (trigger.isInsert) {
            CreditMemoTriggerHandler.handleAfterInsert(trigger.new);
        } else if (trigger.isUpdate) {
            CreditMemoTriggerHandler.handleAfterUpdate(trigger.new, trigger.oldMap);
        }
    } else if (trigger.isBefore) {
        if (trigger.isDelete) {
            CreditMemoTriggerHandler.handleBeforeDelete(trigger.old);
        }
    }
}