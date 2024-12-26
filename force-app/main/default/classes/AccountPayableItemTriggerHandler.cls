public with sharing class AccountPayableItemTriggerHandler {
    // public AccountPayableItemTriggerHandler() {
    //     // Constructor logic if needed, otherwise leave empty
    // }
    // public void OnBeforeInsert(List<buildertek__Account_Payable_Item__c> listAccountPayable) {
    //     addCostCodeToAPItemIfProductExists(listAccountPayable);
    // }
    // public void OnBeforeUpdate(List<buildertek__Account_Payable_Item__c> listAccountPayable) {
    //     addCostCodeToAPItemIfProductExists(listAccountPayable);
    // }

    // public void addCostCodeToAPItemIfProductExists(buildertek__Account_Payable_Item__c[] newAccountPayableItem) {
	// 	Set<Id> productIds = new Set<Id>();
	// 	for (buildertek__Account_Payable_Item__c apItem : newAccountPayableItem) {
	// 		if (apItem.buildertek__Product__c != null && apItem.buildertek__Cost_Code__c == null) {
	// 			productIds.add(apItem.buildertek__Product__c);
	// 		}
	// 	}

	// 	if (!productIds.isEmpty()) {
	// 		Map<Id, Product2> productMap = new Map<Id, Product2>([SELECT Id, buildertek__Cost_Code__c FROM Product2 WHERE Id IN :productIds]);
	// 		for (buildertek__Account_Payable_Item__c apItem : newAccountPayableItem) {
	// 			if (productMap.containsKey(apItem.buildertek__Product__c)) {
	// 				apItem.buildertek__Cost_Code__c = productMap.get(apItem.buildertek__Product__c).buildertek__Cost_Code__c;
	// 			}
	// 		}
	// 	}
	// }

}