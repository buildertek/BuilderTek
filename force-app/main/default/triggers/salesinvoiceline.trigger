trigger salesinvoiceline on buildertek__Billable_Lines__c (before insert, before update, after insert, after update,before delete, after delete) {

    saelsinvoicelinehandler handler = new saelsinvoicelinehandler ();

    if(Trigger.isInsert && Trigger.isAfter){
        handler.OnAfterInsert(Trigger.new, Trigger.oldMap);
    }

    else if(Trigger.isUpdate && Trigger.isAfter){
        handler.OnAfterUpdate(Trigger.old, Trigger.new, Trigger.newMap, trigger.oldMap);
    }

    else if(Trigger.isDelete && Trigger.isBefore){
        handler.OnBeforeDelete(Trigger.old, Trigger.oldMap); 
    }

   
    

    

}