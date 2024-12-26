trigger InventoryManagementTrigger on buildertek__Inventory_Management__c (before insert,before update, after insert, after update) {

    if(Trigger.isBefore){
        if(Trigger.isInsert){
            InventoryManagementHandler.beforeInsert(Trigger.New);
        }
        if(Trigger.isUpdate){
            // InventoryManagementHandler.UniqueProductId(Trigger.New);
        }
    }

    if(Trigger.isAfter){
        if(Trigger.isInsert){
            InventoryManagementHandler.afterInsert(Trigger.New);
        }
        if(Trigger.isUpdate){
            // InventoryManagementHandler.afterUpdate(Trigger.New, Trigger.OldMap);
        }
    }


}