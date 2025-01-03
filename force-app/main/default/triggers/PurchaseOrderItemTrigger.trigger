/*
Copyright (c) 2017-2018, BuilderTek.
All rights reserved.

Developed By: Sagar
Date: 15/09/2017
*/
trigger PurchaseOrderItemTrigger on Purchase_Order_Item__c (after delete, after insert, after undelete, after update, before delete, before insert, before update) {

    if(!BT_Utils.isTriggerDeactivate('Purchase_Order_Item__c') && !PurchaseOrderItemTriggerHandler.blnSkipPurchaseOrderItemUpdateTrigger){

    	PurchaseOrderItemTriggerHandler handler = new PurchaseOrderItemTriggerHandler (Trigger.isExecuting, Trigger.size);

		if(Trigger.isInsert && Trigger.isBefore){
			handler.OnBeforeInsert(Trigger.new);
		}

		else if(Trigger.isInsert && Trigger.isAfter){
			handler.OnAfterInsert(Trigger.new, Trigger.newMap);
		}

		else if(Trigger.isUpdate && Trigger.isBefore){
			handler.OnBeforeUpdate(Trigger.old, Trigger.new, Trigger.newMap);
		}

		else if(Trigger.isUpdate && Trigger.isAfter){
			handler.OnAfterUpdate(Trigger.old, Trigger.new, Trigger.newMap, trigger.oldMap);
		}

		else if(Trigger.isDelete && Trigger.isBefore){
			handler.OnBeforeDelete(Trigger.old, Trigger.oldMap);
		}

		else if(Trigger.isDelete && Trigger.isAfter){
			handler.OnAfterDelete(Trigger.old);
		}
    }
}