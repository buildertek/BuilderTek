public without sharing class createPOFromSalesOrderController {

    @AuraEnabled
    public static List<buildertek__Sales_Order_Lines__c> getsalesOrderLines(String salesOrderId){
        try {
            return [SELECT Id, Name, buildertek__Product__c, buildertek__Product__r.Name, buildertek__Description__c, buildertek__Quantity__c, buildertek__Unit_Sales_Price__c, buildertek__Discount__c, buildertek__Markup__c, buildertek__Unit_Cost__c FROM buildertek__Sales_Order_Lines__c WHERE buildertek__Sales_Order__c =: salesOrderId AND buildertek__Purchase_Order_Line__c = null Order By Name ASC];
        } catch (Exception e) {
            BT_ExceptionHandler.Store_Exception(e);
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String createPurchaseOrders(List<buildertek__Sales_Order_Lines__c> salesOrderLines, String salesOrderId){
        try {
            buildertek__Sales_Order__c salesOrders = [SELECT Id, Name, buildertek__Project__c, buildertek__Quote__c, buildertek__Purchase_Order__c, buildertek__Comments__c FROM buildertek__Sales_Order__c WHERE Id =: salesOrderId];
            
            buildertek__Purchase_Order__c purchaseOrder = new buildertek__Purchase_Order__c();
            purchaseOrder.buildertek__Type__c = 'Material';
            purchaseOrder.buildertek__Status__c = 'Draft';
            purchaseOrder.buildertek__Quote__c = salesOrders.buildertek__Quote__c;
            purchaseOrder.buildertek__Description__c = salesOrders.buildertek__Comments__c;
            purchaseOrder.buildertek__Project__c = salesOrders.buildertek__Project__c;
            purchaseOrder.buildertek__Sales_Order__c = salesOrders.Id;
            insert purchaseOrder;
            Map<Id, buildertek__Purchase_Order_Item__c> salesOrderLineToPurchaseOrderLineMap = new Map<Id, buildertek__Purchase_Order_Item__c>();
            List<buildertek__Purchase_Order_Item__c> purchaseOrderLines = new List<buildertek__Purchase_Order_Item__c>();
            for(buildertek__Sales_Order_Lines__c salesOrderLine : salesOrderLines){
                buildertek__Purchase_Order_Item__c purchaseOrderLine = new buildertek__Purchase_Order_Item__c();
                purchaseOrderLine.buildertek__Purchase_Order__c = purchaseOrder.Id;
                purchaseOrderLine.Name = salesOrderLine.Name;
                purchaseOrderLine.buildertek__Quantity__c = salesOrderLine.buildertek__Quantity__c;
                purchaseOrderLine.buildertek__Unit_Price__c = salesOrderLine.buildertek__Unit_Cost__c;
                purchaseOrderLine.buildertek__Discount__c = salesOrderLine.buildertek__Discount__c;
                purchaseOrderLine.buildertek__Product__c = salesOrderLine.buildertek__Product__c;
                purchaseOrderLine.buildertek__Description__c = salesOrderLine.buildertek__Description__c;
                purchaseOrderLine.buildertek__Sales_Order_Line__c = salesOrderLine.Id;
                salesOrderLineToPurchaseOrderLineMap.put(salesOrderLine.Id, purchaseOrderLine);
                purchaseOrderLines.add(purchaseOrderLine);
            }
            insert purchaseOrderLines;

            salesOrders.buildertek__Purchase_Order__c = purchaseOrder.Id;
            update salesOrders;

            for(buildertek__Sales_Order_Lines__c salesOrderLine : salesOrderLines){
                buildertek__Purchase_Order_Item__c purchaseOrderLine = salesOrderLineToPurchaseOrderLineMap.get(salesOrderLine.Id);
                salesOrderLine.buildertek__Purchase_Order_Line__c = purchaseOrderLine.Id;
                salesOrderLine.buildertek__Purchase_Order__c = purchaseOrder.Id;
            }
            update salesOrderLines;

            return purchaseOrder.Id;
        } catch (Exception e) {
            BT_ExceptionHandler.Store_Exception(e);
            throw new AuraHandledException(e.getMessage());
        }
    }
}