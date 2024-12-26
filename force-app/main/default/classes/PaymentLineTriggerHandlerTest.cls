@isTest
private class PaymentLineTriggerHandlerTest {

    @isTest
    static void testOnAfterInsert() {
        buildertek__Account_Payable_Clone__c payableInvoice = new buildertek__Account_Payable_Clone__c();
        payableInvoice.buildertek__Description__c = 'Test PayableInvoice';
        payableInvoice.buildertek__Status__c = 'Open';
        insert payableInvoice;

        buildertek__Account_Payable_Item_Clone__c payableItem = new buildertek__Account_Payable_Item_Clone__c();
        payableItem.Name = 'Test Item';
        payableItem.buildertek__Quantity__c = 1;
        payableItem.buildertek__Account_Payable_Clone__c = payableInvoice.Id;
        payableItem.buildertek__Unit_Price__c = 23;
        insert payableItem;

        buildertek__BT_Payment__c payment = new buildertek__BT_Payment__c();
        payment.buildertek__Invoices_AP__c = payableInvoice.Id;
        payment.buildertek__Status__c = 'New';
        payment.buildertek__Description__c = 'Test Payment';
        insert payment;

        buildertek__BT_Payment_Lines__c paymentLine = new buildertek__BT_Payment_Lines__c();
        paymentLine.buildertek__Invoice_Line_AP__c = payableItem.Id;
        paymentLine.buildertek__Payment__c = payment.Id;
        Test.startTest();
        insert paymentLine;
        Test.stopTest();

    }

    @isTest
    static void testOnAfterUpdate() {
        buildertek__Account_Payable_Clone__c payableInvoice = new buildertek__Account_Payable_Clone__c();
        payableInvoice.buildertek__Description__c = 'Test PayableInvoice';
        payableInvoice.buildertek__Status__c = 'Open';
        insert payableInvoice;

        buildertek__Account_Payable_Item_Clone__c payableItem = new buildertek__Account_Payable_Item_Clone__c();
        payableItem.Name = 'Test Item';
        payableItem.buildertek__Quantity__c = 1;
        payableItem.buildertek__Account_Payable_Clone__c = payableInvoice.Id;
        payableItem.buildertek__Unit_Price__c = 23;
        insert payableItem;

        List<buildertek__BT_Payment__c> payments = new List<buildertek__BT_Payment__c>();
        buildertek__BT_Payment__c payment = new buildertek__BT_Payment__c();
        payment.buildertek__Invoices_AP__c = payableInvoice.Id;
        payment.buildertek__Status__c = 'New';
        payment.buildertek__Description__c = 'Test Payment';
        payments.add(payment);

        buildertek__BT_Payment__c payment1 = new buildertek__BT_Payment__c();
        payment1.buildertek__Invoices_AP__c = payableInvoice.Id;
        payment1.buildertek__Status__c = 'New';
        payment1.buildertek__Description__c = 'Test Payment';
        payments.add(payment1);

        insert payments;


        buildertek__BT_Payment_Lines__c oldPaymentLine = new buildertek__BT_Payment_Lines__c();
        oldPaymentLine.buildertek__Invoice_Line_AP__c = payableItem.Id;
        oldPaymentLine.buildertek__Payment__c = payments[0].Id;
        oldPaymentLine.buildertek__Description__c = 'test';
        
        insert oldPaymentLine;
        
        buildertek__BT_Payment_Lines__c newPaymentLine = oldPaymentLine.clone();
        newPaymentLine.buildertek__Description__c = 'new description';
        newPaymentLine.buildertek__Payment__c = payments[1].Id;

        Test.startTest();

        PaymentLineTriggerHandler paymementLineHandler = new PaymentLineTriggerHandler(true, 1); // Pass parameters to the constructor
        paymementLineHandler.onAfterUpdate(new List<buildertek__BT_Payment_Lines__c>{newPaymentLine}, new Map<Id, buildertek__BT_Payment_Lines__c>{oldPaymentLine.Id => oldPaymentLine});

        Test.stopTest();

    }

    @isTest
    static void testOnAfterDelete() {
        buildertek__Account_Payable_Clone__c payableInvoice = new buildertek__Account_Payable_Clone__c();
        payableInvoice.buildertek__Description__c = 'Test PayableInvoice';
        payableInvoice.buildertek__Status__c = 'Open';
        insert payableInvoice;

        buildertek__Account_Payable_Item_Clone__c payableItem = new buildertek__Account_Payable_Item_Clone__c();
        payableItem.Name = 'Test Item';
        payableItem.buildertek__Quantity__c = 1;
        payableItem.buildertek__Account_Payable_Clone__c = payableInvoice.Id;
        payableItem.buildertek__Unit_Price__c = 23;
        insert payableItem;

        buildertek__BT_Payment__c payment = new buildertek__BT_Payment__c();
        payment.buildertek__Invoices_AP__c = payableInvoice.Id;
        payment.buildertek__Status__c = 'New';
        payment.buildertek__Description__c = 'Test Payment';
        insert payment;

        buildertek__BT_Payment_Lines__c oldPaymentLine = new buildertek__BT_Payment_Lines__c();
        oldPaymentLine.buildertek__Invoice_Line_AP__c = payableItem.Id;
        oldPaymentLine.buildertek__Payment__c = payment.Id;
        oldPaymentLine.buildertek__Description__c = 'test';

        insert oldPaymentLine;
        Test.startTest();
        delete oldPaymentLine;
        Test.stopTest();

    }

}