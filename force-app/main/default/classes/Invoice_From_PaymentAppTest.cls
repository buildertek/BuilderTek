@isTest
public with sharing class Invoice_From_PaymentAppTest {

    @isTest
    static void testMethod1() {
        buildertek__SOV_Payment_Application__c paymentApp = new buildertek__SOV_Payment_Application__c();
        paymentApp.Name = 'Testing Payment';
        paymentApp.buildertek__Retainage__c = 5;
        insert paymentApp;
        
        buildertek__SOV_Continuation__c sov = [SELECT Id, Name FROM buildertek__SOV_Continuation__c LIMIT 1]; 

        buildertek__SOV_Continuation_Sheet_Lines__c sovLine = new buildertek__SOV_Continuation_Sheet_Lines__c();
        sovLine.Name = 'Testing SOV Line';
        sovLine.buildertek__Description_of_Work__c = 'Testing Line';
        sovLine.buildertek__SOV_Continuation_Sheet__c = sov.Id;
        insert sovLine;
        buildertek__Purchase_Order__c PO = new buildertek__Purchase_Order__c();
        PO.buildertek__Project__c = paymentApp.buildertek__Project__c;
        insert PO;
        Invoice_From_PaymentApp.getPaymentAppData(paymentApp.Id);
        Invoice_From_PaymentApp.createInvoice(paymentApp.Id);

        paymentApp.buildertek__PA_Type__c = 'AR';
        update paymentApp;

        Invoice_From_PaymentApp.createInvoice(paymentApp.Id);
    }
}