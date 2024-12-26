public class PurchaseOrder_handler {
    public static void handledelete(List<buildertek__Purchase_Order__c> polist){
        // Set<Id> purchaseOrderIds = new Set<Id>();

        // for (buildertek__Purchase_Order__c po : polist) {
        //     purchaseOrderIds.add(po.Id);
        // }

        // // Query for related Account Payable records
        // List<buildertek__Account_Payable__c> contInvoiceList = [SELECT Id, buildertek__Purchase_Order__c FROM buildertek__Account_Payable__c WHERE buildertek__Purchase_Order__c IN :purchaseOrderIds];

        // // Check for related invoices and add errors
        // for (buildertek__Account_Payable__c contInvoice : contInvoiceList) {
        //     if (purchaseOrderIds.contains(contInvoice.buildertek__Purchase_Order__c)) {
        //         buildertek__Purchase_Order__c relatedPo = new buildertek__Purchase_Order__c(Id = contInvoice.buildertek__Purchase_Order__c);
        //         relatedPo.addError('Error: Contract Invoice is Present');
        //     }
        // }
    }
}

        // List<buildertek__Account_Payable__c> contInvoiceList = [SELECT buildertek__Purchase_Order__c FROM buildertek__Account_Payable__c WHERE buildertek__Purchase_Order__c IN : polist];

        // for(buildertek__Purchase_Order__c Po:polist){
        //     for(buildertek__Account_Payable__c contInvoice:contInvoiceList){
        //         if(Po.Id == contInvoice.buildertek__Purchase_Order__c){
        //             Po.addError('Error: Contract Invoice is Present');
        //         }
        //     }
        // }