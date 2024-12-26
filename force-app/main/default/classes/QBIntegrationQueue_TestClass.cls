@isTest
public without sharing class QBIntegrationQueue_TestClass {

    //     public static String itemBatch_Success_Response_JSONbody = ' "BatchItemResponse":[{"Item":{"Name":"tset sdf","Active":true,"FullyQualifiedName":"tset sdf","Taxable":true,"UnitPrice":11,"Type":"Inventory","IncomeAccountRef":{"value":"79","name":"Sales of Product Income"},"PurchaseCost":0,"ExpenseAccountRef":{"value":"80","name":"Cost of Goods Sold"},"AssetAccountRef":{"value":"100","name":"Test acc"},"TrackQtyOnHand":true,"QtyOnHand":210,"InvStartDate":"2024-02-01","DeferredRevenue":false,"domain":"QBO","sparse":false,"Id":"834","SyncToken":"0","MetaData":{"CreateTime":"2024-01-31T23:04:48-08:00","LastUpdatedTime":"2024-01-31T23:04:52-08:00"}},"bId":"a0u1K00000gwqVXQAY"}],"time":"2024-01-31T23:04:47.786-08:00"';
    //     public static String term_Success_Response_JSONbody = ' "Term": { "SyncToken": "1", "domain": "QBO", "Name": "Net 30", "DiscountPercent": 0, "DiscountDays": 10, "Type": "STANDARD", "sparse": false, "Active": true, "DueDays": 30, "Id": "3", "MetaData": { "CreateTime": "2014-09-11T14:41:49-07:00", "LastUpdatedTime": "2015-07-28T08:55:59-07:00" } }, "time": "2015-07-28T08:55:59.916-07:00" ';
        
    //     public static String customer_Success_Response_JSONbody = ' "Customer": { "domain": "QBO", "PrimaryEmailAddr": { "Address": "Surf@Intuit.com" }, "DisplayName": "Bills Windsurf Shop", "PreferredDeliveryMethod": "Print", "GivenName": "Bill", "FullyQualifiedName": "Bills Windsurf Shop", "BillWithParent": false, "Job": false, "BalanceWithJobs": 85.0, "PrimaryPhone": { "FreeFormNumber": "(415) 444-6538" }, "Active": true, "MetaData": { "CreateTime": "2014-09-11T16:49:28-07:00", "LastUpdatedTime": "2015-07-23T11:18:37-07:00" }, "BillAddr": { "City": "Half Moon Bay", "Line1": "12 Ocean Dr.", "PostalCode": "94213", "Lat": "37.4307072", "Long": "-122.4295234", "CountrySubDivisionCode": "CA", "Id": "3" }, "MiddleName": "Mac", "Taxable": false, "Balance": 85.0, "SyncToken": "1", "CompanyName": "Bills Windsurf Shop", "FamilyName": "Lucchini", "PrintOnCheckName": "Bills Wind Surf Shop", "sparse": false, "Id": "2" }, "time": "2015-07-23T11:18:37.323-07:00" ';
    //     public static String taxRate_Success_Response_JSONbody = '"TaxCode":"Tax - 96.5000","TaxCodeId":"65","TaxRateDetails":[{"TaxRateName":"Tax - 96.5000","TaxRateId":"73","RateValue":96.5,"TaxAgencyId":"1","TaxApplicableOn":"Sales"}] ';
    //     public static String invoice_Success_Response_JSONbody = '"Invoice": { "TxnDate": "2015-07-24", "domain": "QBO", "PrintStatus": "NeedToPrint", "TotalAmt": 150.0, "Line": [ { "LineNum": 1, "Amount": 150.0, "SalesItemLineDetail": { "TaxCodeRef": { "value": "NON" }, "ItemRef": { "name": "Services", "value": "1" } }, "Id": "1", "DetailType": "SalesItemLineDetail" }, { "DetailType": "SubTotalLineDetail", "Amount": 150.0, "SubTotalLineDetail": {} } ], "DueDate": "2015-08-23", "ApplyTaxAfterDiscount": false, "DocNumber": "1070", "sparse": false, "CustomerMemo": { "value": "Added customer memo." }, "ProjectRef": { "value": "39298045" }, "Deposit": 0, "Balance": 150.0, "CustomerRef": { "name": "Amys Bird Sanctuary", "value": "1" }, "TxnTaxDetail": { "TotalTax": 0 }, "SyncToken": "1", "LinkedTxn": [], "ShipAddr": { "CountrySubDivisionCode": "CA", "City": "Bayshore", "PostalCode": "94326", "Id": "118", "Line1": "4581 Finch St." }, "EmailStatus": "NotSet", "BillAddr": { "CountrySubDivisionCode": "CA", "City": "Bayshore", "PostalCode": "94326", "Id": "117", "Line1": "4581 Finch St." }, "MetaData": { "CreateTime": "2015-07-24T10:35:08-07:00", "LastUpdatedTime": "2015-07-24T10:53:39-07:00" }, "CustomField": [ { "DefinitionId": "1", "Type": "StringType", "Name": "Crew #" } ], "Id": "239" }, "time": "2015-07-24T10:53:39.287-07:00" ';
    //     public static String payment_Success_Response_JSONbody = '"Payment": { "SyncToken": "1", "domain": "QBO", "PaymentMethodRef": { "value": "16" }, "UnappliedAmt": 0, "TxnDate": "2013-03-13", "TotalAmt": 0, "ProjectRef": { "value": "39298045" }, "PaymentRefNum": "123456", "sparse": false, "Line": [ { "Amount": 300, "LinkedTxn": [ { "TxnId": "67", "TxnType": "Invoice" } ] }, { "Amount": 300, "LinkedTxn": [ { "TxnId": "68", "TxnType": "CreditMemo" } ] } ], "CustomerRef": { "value": "16" }, "Id": "69", "MetaData": { "CreateTime": "2013-03-13T14:49:21-07:00", "LastUpdatedTime": "2013-03-13T14:49:21-07:00" } }, "time": "2013-03-13T14:49:41.512-07:00"';
        
    //     public static String paymentMethod_Success_Response_JSONbody = ' "PaymentMethod": { "SyncToken": "2", "domain": "QBO", "Name": "Platinum Diners Club", "sparse": false, "Active": true, "Type": "CREDIT_CARD", "Id": "7", "MetaData": { "CreateTime": "2014-09-11T14:42:05-07:00", "LastUpdatedTime": "2015-07-24T15:33:48-07:00" } }, "time": "2015-07-24T15:33:55.695-07:00" ';
    //     public static String bill_Success_Response_JSONbody = ' "Bill": { "DocNumber": "56789", "SyncToken": "2", "domain": "QBO", "APAccountRef": { "name": "Accounts Payable", "value": "49" }, "VendorRef": { "name": "Bayshore CalOil Service", "value": "81" }, "TxnDate": "2014-04-04", "TotalAmt": 200.0, "CurrencyRef": { "name": "United States Dollar", "value": "USD" }, "PrivateNote": "This is a updated memo.", "SalesTermRef": { "value": "12" }, "DepartmentRef": { "name": "Garden Services", "value": "1" }, "DueDate": "2013-06-09", "sparse": false, "Line": [ { "Description": "Gasoline", "DetailType": "AccountBasedExpenseLineDetail", "ProjectRef": { "value": "39298034" }, "Amount": 200.0, "Id": "1", "AccountBasedExpenseLineDetail": { "TaxCodeRef": { "value": "TAX" }, "AccountRef": { "name": "Automobile", "value": "75" }, "BillableStatus": "Billable", "CustomerRef": { "name": "Blackwell, Edward", "value": "20" }, "MarkupInfo": { "Percent": 10 } } } ], "Balance": 200.0, "Id": "890", "MetaData": { "CreateTime": "2014-04-04T12:38:01-07:00", "LastUpdatedTime": "2014-04-04T12:58:16-07:00" } }, "time": "2014-04-04T12:58:16.491-07:00"';
    //     public static String vendor_Success_Response_JSONbody = ' "Vendor": { "PrimaryEmailAddr": { "Address": "Books@Intuit.com" }, "Vendor1099": false, "domain": "QBO", "GivenName": "Bessie", "DisplayName": "Books by Bessie", "BillAddr": { "City": "Palo Alto", "Line1": "15 Main St.", "PostalCode": "94303", "Lat": "37.445013", "Long": "-122.1391443", "CountrySubDivisionCode": "CA", "Id": "31" }, "SyncToken": "2", "PrintOnCheckName": "Books by Bessie and Joan", "FamilyName": "Williams", "PrimaryPhone": { "FreeFormNumber": "(650) 555-7745" }, "AcctNum": "13451234", "CompanyName": "Books by Bessie", "WebAddr": { "URI": "http://www.booksbybessie.co" }, "sparse": false, "Active": true, "Balance": 0, "Id": "30", "MetaData": { "CreateTime": "2014-09-12T10:07:56-07:00", "LastUpdatedTime": "2015-07-28T13:37:05-07:00" } }, "time": "2015-07-28T13:37:07.196-07:00" ';
    //     public static String expense_Success_Response_JSONbody = ' "Purchase": { "SyncToken": "2", "domain": "QBO", "PurchaseEx": { "any": [ { "name": "{http://schema.intuit.com/finance/v3}NameValue", "nil": false, "value": { "Name": "TxnType", "Value": "54" }, "declaredType": "com.intuit.schema.finance.v3.NameValue", "scope": "javax.xml.bind.JAXBElement$GlobalScope", "globalScope": true, "typeSubstituted": false } ] }, "TxnDate": "2015-07-27", "TotalAmt": 10.0, "PrivateNote": "Added an updated private note via update.", "PaymentType": "Cash", "sparse": false, "Line": [ { "DetailType": "AccountBasedExpenseLineDetail", "Amount": 10.0, "ProjectRef": { "value": "42991284" }, "Id": "1", "AccountBasedExpenseLineDetail": { "TaxCodeRef": { "value": "NON" }, "AccountRef": { "name": "Meals and Entertainment", "value": "13" }, "BillableStatus": "NotBillable" } } ], "AccountRef": { "name": "Checking", "value": "35" }, "CustomField": [], "Id": "252", "MetaData": { "CreateTime": "2015-07-27T10:37:26-07:00", "LastUpdatedTime": "2015-07-27T10:45:20-07:00" } }, "time": "2015-07-27T10:45:20.806-07:00" ';
    //     public static String purchaseOrder_Success_Response_JSONbody = ' "PurchaseOrder": { "DocNumber": "1005", "SyncToken": "1", "domain": "QBO", "APAccountRef": { "name": "Accounts Payable (A/P)", "value": "33" }, "CurrencyRef": { "name": "United States Dollar", "value": "USD" }, "TxnDate": "2015-07-28", "TotalAmt": 25.0, "ShipAddr": { "Line4": "Half Moon Bay, CA  94213", "Line3": "65 Ocean Dr.", "Id": "121", "Line1": "Grace Pariente", "Line2": "Cool Cars" }, "PrivateNote": "This is a private note added during update.", "VendorAddr": { "Line4": "Middlefield, CA  94303", "Line3": "42 Main St.", "Id": "120", "Line1": "Geoff Hicks", "Line2": "Hicks Hardware" }, "POStatus": "Open", "sparse": false, "VendorRef": { "name": "Hicks Hardware", "value": "41" }, "Line": [ { "DetailType": "ItemBasedExpenseLineDetail", "Amount": 25.0, "ProjectRef": { "value": "39298034" }, "Id": "1", "ItemBasedExpenseLineDetail": { "ItemRef": { "name": "Garden Supplies", "value": "38" }, "CustomerRef": { "name": "Cool Cars", "value": "3" }, "Qty": 1, "TaxCodeRef": { "value": "NON" }, "BillableStatus": "NotBillable", "UnitPrice": 25 } } ], "CustomField": [ { "DefinitionId": "1", "Type": "StringType", "Name": "Crew #" }, { "DefinitionId": "2", "Type": "StringType", "Name": "Sales Rep" } ], "Id": "257", "MetaData": { "CreateTime": "2015-07-28T16:01:47-07:00", "LastUpdatedTime": "2015-07-28T16:17:41-07:00" } }, "time": "2015-07-28T16:17:42.952-07:00"';
        
    //     public static String query_Customer_Response = '"Customer": [ { "Taxable": true, "BillAddr": { "Id": "2", "Line1": "4581 Finch St.", "City": "Bayshore", "CountrySubDivisionCode": "CA", "PostalCode": "94326", "Lat": "INVALID", "Long": "INVALID" }, "ShipAddr": { "Id": "2", "Line1": "4581 Finch St.", "City": "Bayshore", "CountrySubDivisionCode": "CA", "PostalCode": "94326", "Lat": "INVALID", "Long": "INVALID" }, "Job": false, "BillWithParent": false, "Balance": -570.52, "BalanceWithJobs": -570.52, "CurrencyRef": { "value": "USD", "name": "United States Dollar" }, "PreferredDeliveryMethod": "Print", "IsProject": false, "ClientEntityId": "0", "domain": "QBO", "sparse": false, "Id": "1", "SyncToken": "0", "MetaData": { "CreateTime": "2023-09-21T16:48:43-07:00", "LastUpdatedTime": "2024-01-05T04:29:10-08:00" }, "GivenName": "Amy", "FamilyName": "Lauterbach", "FullyQualifiedName": "Amys Bird Sanctuary", "CompanyName": "Amys Bird Sanctuary", "DisplayName": "Amys Bird Sanctuary", "PrintOnCheckName": "Amys Bird Sanctuary", "Active": true, "V4IDPseudonym": "002098482ffa2d19e14c2ca86229d5aee9e4ee", "PrimaryPhone": { "FreeFormNumber": "(650) 555-3311" }, "PrimaryEmailAddr": { "Address": "Birds@Intuit.com" } } ]';
    //     public static String query_Item_Response = '"Item": [ { "FullyQualifiedName": "Concrete", "domain": "QBO", "Name": "Concrete", "TrackQtyOnHand": false, "Type": "Service", "PurchaseCost": 0, "IncomeAccountRef": { "name": "Landscaping Services:Job Materials:Fountains and Garden Lighting", "value": "48" }, "Taxable": true, "MetaData": { "CreateTime": "2014-09-16T10:36:03-07:00", "LastUpdatedTime": "2014-09-19T12:47:47-07:00" }, "sparse": false, "Active": true, "SyncToken": "1", "UnitPrice": 0, "Id": "3", "Description": "Concrete for fountain installation" }, { "FullyQualifiedName": "Design", "domain": "QBO", "Name": "Design", "TrackQtyOnHand": false, "Type": "Service", "PurchaseCost": 0, "IncomeAccountRef": { "name": "Design income", "value": "82" }, "Taxable": false, "MetaData": { "CreateTime": "2014-09-16T10:41:38-07:00", "LastUpdatedTime": "2015-04-17T14:31:10-07:00" }, "sparse": false, "Active": true, "SyncToken": "1", "UnitPrice": 75, "Id": "4", "Description": "Custom Design" } ]';
    //     public static String query_TaxCode_Response = '"TaxCode": [ { "Name": "Tax - 96.5000", "Description": "Tax - 96.5000", "Active": true, "Hidden": false, "Taxable": true, "TaxGroup": true, "SalesTaxRateList": { "TaxRateDetail": [ { "TaxRateRef": { "value": "73", "name": "Tax - 96.5000" }, "TaxTypeApplicable": "TaxOnAmount", "TaxOrder": 0 } ] }, "PurchaseTaxRateList": { "TaxRateDetail": [] }, "TaxCodeConfigType": "USER_DEFINED", "domain": "QBO", "sparse": false, "Id": "65", "SyncToken": "0", "MetaData": { "CreateTime": "2024-01-31T23:27:34-08:00", "LastUpdatedTime": "2024-01-31T23:27:34-08:00" } } ]';
    //     public static String query_Term_Response = '"Term": [ { "Name": "Due on receipt", "Active": true, "Type": "STANDARD", "DueDays": 0, "DiscountDays": 0, "domain": "QBO", "sparse": false, "Id": "1", "SyncToken": "0", "MetaData": { "CreateTime": "2023-09-21T14:41:49-07:00", "LastUpdatedTime": "2023-09-21T14:41:49-07:00" } } ]';
    //     public static String query_Invoice_Response = '';
    //     public static String query_PaymentMethod_Response = '';
    //     public static String query_Bill_Response = '';
    //     public static String query_Vendor_Response = '';
    //     public static String query_Expense_Response = '';
    //     public static String query_Purchase_Response = '';

    //     public static String queryBasic_Response_JSONbody = '"startPosition": 1, "maxResults": 2, "totalCount" : 2 ';
        
    //     public static String queryMerger_Success_Response_JSONbody = '"QueryResponse": {' + query_Customer_Response +',' + query_Item_Response +',' + query_TaxCode_Response +',' + query_Term_Response + ','+ queryBasic_Response_JSONbody + ', "time": "2015-04-22T11:04:34.194-07:00"  }';
    //     public static String queryNull_Response = '{ "QueryResponse": {}, "time": "2024-02-01T00:52:14.654-08:00" }';
        
    //     public static String unSuccess_Basic_Response_JSONbody = '{"Fault":{"Error":[{"Message":"Duplicate Name Exists Error","Detail":"The name supplied already exists. : null","code":"6240"}],"type":"ValidationFault"},"time":"2023-12-27T02:34:47.279-08:00"}';
    //     public static String unSuccess_SyncToken_Response_JSONbody = '{"Fault":{"Error":[{"Message":"Stale Object Error","Detail":"Stale Object Error : You and karan.pa@mvclouds.com were working on this at the same time. karan.pa@mvclouds.com finished before you did, so your work was not saved.","code":"5010","element":""}],"type":"ValidationFault"},"time":"2023-12-25T03:39:23.297-08:00"}';

    // public static Account createAccount(){
    //     Account acc = new Account(
    //         Name = 'QB Test Acc',
    //         Description = 'QB Test Description',
    //         ShippingCity = 'TestCity',
    //         ShippingStreet = 'TestStreet',
    //         ShippingState = 'TestState',
    //         ShippingPostalCode = '12345',
    //         ShippingLatitude = 37.7749,
    //         ShippingLongitude = -122.4194,
    //         ShippingCountry = 'TestCountry',
    //         buildertek__Email_Address__c = 'test@example.com',
    //         Fax = '123-456-7890',
    //         Phone = '987-654-3210',
    //         BillingCity = 'BillingCity',
    //         BillingStreet = 'BillingStreet',
    //         BillingState = 'BillingState',
    //         BillingPostalCode = '54321',
    //         BillingLatitude = 37.7749,
    //         BillingLongitude = -122.4194,
    //         BillingCountry = 'BillingCountry',
    //         buildertek__QB_Type__c = 'Customer'
    //     );
    //     insert acc;
    //     return acc;
    // }
    // public static Account createVendorAccount(){
    //     Account acc = new Account(
    //         Name = 'QB Test Acc 1',
    //         Description = 'QB Test Description',
    //         ShippingCity = 'TestCity',
    //         ShippingStreet = 'TestStreet',
    //         ShippingState = 'TestState',
    //         ShippingPostalCode = '12345',
    //         ShippingLatitude = 37.7749,
    //         ShippingLongitude = -122.4194,
    //         ShippingCountry = 'TestCountry',
    //         buildertek__Email_Address__c = 'test@example.com',
    //         Fax = '123-456-7890',
    //         Phone = '987-654-3210',
    //         BillingCity = 'BillingCity',
    //         BillingStreet = 'BillingStreet',
    //         BillingState = 'BillingState',
    //         BillingPostalCode = '54321',
    //         BillingLatitude = 37.7749,
    //         BillingLongitude = -122.4194,
    //         BillingCountry = 'BillingCountry',
    //         buildertek__QB_Type__c = 'Vendor',
    //         buildertek__QB_Id__c = '534'
    //     );
    //     insert acc;
    //     return acc;
    // }
    // public static buildertek__Billings__c createSI(string AccId){
    //     // sales invoice without tax rate
    //     buildertek__Billings__c inv = new buildertek__Billings__c();
    //     inv.Name = 'QB Test Invoice';
    //     inv.buildertek__Customer_Account__c = AccId;
    //     inv.buildertek__Tax_Rate__c = 15;
    //     inv.buildertek__QB_Id__c = '15';
    //     inv.buildertek__Terms__c = 'Net 30';
    //     inv.buildertek__Tax_Rate__c = double.valueOf(12.43);
    //     insert inv;
    // return inv;
    // }

    // public static List<buildertek__Billable_Lines__c> createSalesIvoiceLine(String SIid){
    //     List<buildertek__Billable_Lines__c> SILines = new List<buildertek__Billable_Lines__c>();
    //     buildertek__Billable_Lines__c invLine = new buildertek__Billable_Lines__c();
    //     invLine.buildertek__Item_Name__c = 'inv line 1';
    //     invLine.buildertek__Billings__c = SIid;
    //     invLine.buildertek__QB_Id__c = '12';
    //     invLine.buildertek__QBO_Name__c =' inv line 1';
    //     invLine.buildertek__Quantity__c = 12;
    //     invLine.buildertek__Unit_Price__c = 30;
    //     SILines.add(invLine);
        
    //     buildertek__Billable_Lines__c invLine1 = new buildertek__Billable_Lines__c();
    //     invLine1.buildertek__Item_Name__c = 'inv line 1';
    //     invLine1.buildertek__Billings__c = SIid;
    //     invLine1.buildertek__QBO_Name__c =' inv line 1';
    //     invLine1.buildertek__Quantity__c = 12;
    //     invLine1.buildertek__Unit_Price__c = 30;
    //     SILines.add(invLine1);
    //     insert SILines;

    //     return SILines;
    // }
    // public static buildertek__Receipt__c createReceipt(String SIid){
    //     buildertek__Receipt__c rec = new buildertek__Receipt__c(
    //         buildertek__Billing__c = SIid,
    //         buildertek__Amount__c = 100
    //     );
    //     insert rec;
    //     return rec;
    // }

    // public static void success_MockTest(){
    //     MockTest(null, false);
    // }
    // public static void unsuccess_MockTest(String error_AT){
    //     MockTest(error_AT, false);
    // }
    // public static void syncToken_unsuccess_MockTest(String error_AT){
    //     MockTest(error_AT, true);
    // }
    // public static void MockTest(String error_AT, boolean is_SyncToken_Error){
    //     QBMockTest MockCallout = new QBMockTest(error_AT, is_SyncToken_Error);
    //     Test.setMock(HttpCalloutMock.class, MockCallout);
    // }

    // // // ======================== >  TEST Class For QBIntegrationQueue_SIFlow < ==============================
    // @isTest
    // public static void SIFlow_QBcallouts_Test(){

    //     Account acc = createAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     List<buildertek__Billable_Lines__c> SILines = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     String ReceiptId = rec.Id;
        
    //     Test.startTest();
    //     success_MockTest();
    //     QBIntegrationQueue_SIFlow.qb_Payment_Invoice_Flow_Callout(inv.Id, ReceiptId);
        
    //     Test.stopTest();
    // }
    // @isTest
    // public static void SIFlow_unsuccess_customer_QBcallouts_Test(){

    //     Account acc = createAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     List<buildertek__Billable_Lines__c> SILines = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     String ReceiptId = rec.Id;

    //         Test.startTest();
    //         unsuccess_MockTest('customer_400');
    //         QBIntegrationQueue_SIFlow.qb_Payment_Invoice_Flow_Callout(inv.Id, ReceiptId);
    //         Test.stopTest();
    // }
    // @isTest
    // public static void SIFlow_unsuccess_item_QBcallouts_Test(){

    //     Account acc = createAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     List<buildertek__Billable_Lines__c> SILines = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     String ReceiptId = rec.Id;

    //         Test.startTest();
    //         unsuccess_MockTest('item_400');
    //         QBIntegrationQueue_SIFlow.qb_Payment_Invoice_Flow_Callout(inv.Id, ReceiptId);
    //         Test.stopTest();
    // }
    // @isTest
    // public static void SIFlow_unsuccess_taxService_QBcallouts_Test(){

    //     Account acc = createAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     List<buildertek__Billable_Lines__c> SILines = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     String ReceiptId = rec.Id;

    //         Test.startTest();
    //         unsuccess_MockTest('taxservice_400');
    //         QBIntegrationQueue_SIFlow.qb_Payment_Invoice_Flow_Callout(inv.Id, ReceiptId);
    //         Test.stopTest();
    // }
    // @isTest
    // public static void SIFlow_unsuccess_term_QBcallouts_Test(){

    //     Account acc = createAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     List<buildertek__Billable_Lines__c> SILines = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     String ReceiptId = rec.Id;

    //         Test.startTest();
    //         unsuccess_MockTest('term_400');
    //         QBIntegrationQueue_SIFlow.qb_Payment_Invoice_Flow_Callout(inv.Id, ReceiptId);
    //         Test.stopTest();
    // }
    // @isTest
    // public static void SIFlow_unsuccess_invoice_QBcallouts_Test(){

    //     Account acc = createAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     List<buildertek__Billable_Lines__c> SILines = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     String ReceiptId = rec.Id;

    //         Test.startTest();
    //         unsuccess_MockTest('invoice_400');
    //         QBIntegrationQueue_SIFlow.qb_Payment_Invoice_Flow_Callout(inv.Id, ReceiptId);
    //         Test.stopTest();
    // }
    // @isTest
    // public static void SIFlow_unsuccess_payment_QBcallouts_Test(){

    //     Account acc = createAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     List<buildertek__Billable_Lines__c> SILines = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     String ReceiptId = rec.Id;

    //         Test.startTest();
    //         unsuccess_MockTest('payment_400');
    //         QBIntegrationQueue_SIFlow.qb_Payment_Invoice_Flow_Callout(inv.Id, ReceiptId);
    //         Test.stopTest();
    // }

    // @isTest
    // public static void qb_SyncTokenError_customer_QBcallouts_Test(){
    //     Account acc = createAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     List<buildertek__Billable_Lines__c> SILines = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     String ReceiptId = rec.Id;
    //         Test.startTest();
    //         syncToken_unsuccess_MockTest('customer_400');
    //         QBIntegrationQueue_SIFlow.qb_Payment_Invoice_Flow_Callout(inv.Id, ReceiptId);
    //         Test.stopTest();
    // }
    // @isTest
    // public static void qb_SyncTokenError_invoice_QBcallouts_Test(){
    //     Account acc = createAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     List<buildertek__Billable_Lines__c> SILines = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     String ReceiptId = rec.Id;
        
    //     // List<String> calloutObjects = new List<String>{
    //     //     'customer_400','item_400','taxservice_400','invoice_400','payment_400'
    //     // };
    //         Test.startTest();
    //         syncToken_unsuccess_MockTest('invoice_400');
    //         QBIntegrationQueue_SIFlow.qb_Payment_Invoice_Flow_Callout(inv.Id, ReceiptId);
    //         Test.stopTest();
    // }
    // @isTest
    // public static void qb_SyncTokenError_payment_QBcallouts_Test(){
    //     Account acc = createAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     List<buildertek__Billable_Lines__c> SILines = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     String ReceiptId = rec.Id;
        
    //     // List<String> calloutObjects = new List<String>{
    //     //     'customer_400','item_400','taxservice_400','invoice_400','payment_400'
    //     // };
    //         Test.startTest();
    //         syncToken_unsuccess_MockTest('payment_400');
    //         QBIntegrationQueue_SIFlow.qb_Payment_Invoice_Flow_Callout(inv.Id, ReceiptId);
    //         Test.stopTest();
    // }
    // @isTest
    // public static void Query_QB_Recordtest() {
    //     Account acc = createAccount();
    //     Account vendorAcc = createVendorAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     buildertek__Billings__c inv1 = createSI(vendorAcc.Id);
        
    //     QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper wrapper = new QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper();
    //     wrapper.SI = inv;
    //     wrapper.SyncObjName = 'buildertek__Billings__c';
    //     wrapper.QueryCustomer_VendorFlag = true;
    //     wrapper.acc = acc;
    //     wrapper.SI = inv;

    //     QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper vendorWrapper = new QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper();
    //     vendorWrapper.SI = inv1;
    //     vendorWrapper.SyncObjName = 'buildertek__Billings__c';
    //     vendorWrapper.QueryCustomer_VendorFlag = true;
    //     vendorWrapper.acc = vendorAcc;

    //     QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper WrapperFlagFalse = new QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper();
    //     WrapperFlagFalse.SI = inv;
    //     WrapperFlagFalse.SyncObjName = 'buildertek__Billings__c';
    //     WrapperFlagFalse.QueryCustomer_VendorFlag = false;
    //     WrapperFlagFalse.acc = acc;

    //     Test.startTest();
    //     try {
    //         success_MockTest();
    //         QBIntegrationQueue_SIFlow.Query_QB_Record(wrapper);
    //         QBIntegrationQueue_SIFlow.Query_QB_Record(vendorWrapper);
    //         QBIntegrationQueue_SIFlow.Query_QB_Record(WrapperFlagFalse);
    //     } catch(Exception e) {
    //         System.debug('Exception-->'+e);
    //         System.debug('Exception-->'+e.getMessage());
    //         System.debug('Exception-->'+e.getLineNumber());
    //         System.debug('Exception-->'+e.getStackTraceString());
    //     }
    //     Test.stopTest();
    // }
    // @isTest
    // public static void sync_invoice_in_QB() {

    //     Account acc = createAccount();
    //     Account vendorAcc = createVendorAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     List<buildertek__Billable_Lines__c> invLine = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);

    //     Map<Id, List<String>> lineIdsMap = new Map<Id, List<String>>();
    //     lineIdsMap.put(
    //             Id.valueOf(invLine[0].Id), // Salesforce ID
    //             new List<String> { 
    //                 invLine[0].buildertek__QB_Id__c, invLine[0].buildertek__QBO_Name__c, string.valueOf(invLine[0].buildertek__SubTotal__c), string.valueOf(invLine[0].buildertek__Quantity__c), string.valueOf(invLine[0].buildertek__Unit_Price__c)
    //             }
    //     );
    //     QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper wrapper = new QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper();
    //     wrapper.Get_Access_Token = false;
    //     wrapper.SyncObjName = 'buildertek__Billings__c';
    //     wrapper.acc = acc;
    //     wrapper.SI = inv;
    //     wrapper.lineIdsMap = lineIdsMap;
    //     wrapper.receiptID = rec.Id;

    //     Test.startTest();
    //         success_MockTest();
    //         QBIntegrationQueue_SIFlow.sync_invoice_in_QB(wrapper);
    //     Test.stopTest();
    // }
    // @isTest
    // public static void sync_invoice_in_QB1() {

    //     Account acc = createAccount();
    //     Account vendorAcc = createVendorAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     List<buildertek__Billable_Lines__c> invLine = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     Map<Id, List<String>> lineIdsMap = new Map<Id, List<String>>();
    //     lineIdsMap.put(
    //             Id.valueOf(invLine[0].Id), // Salesforce ID
    //             new List<String> { 
    //                 invLine[0].buildertek__QB_Id__c, invLine[0].buildertek__QBO_Name__c, string.valueOf(invLine[0].buildertek__SubTotal__c), string.valueOf(invLine[0].buildertek__Quantity__c), string.valueOf(invLine[0].buildertek__Unit_Price__c)
    //             }
    //     );
        
    //     QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper wrapper = new QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper();
    //     wrapper.Get_Access_Token = false;
    //     wrapper.SyncObjName = 'buildertek__Billings__c';
    //     wrapper.acc = acc;
    //     wrapper.SI = inv;
    //     wrapper.lineIdsMap = lineIdsMap;
    //     wrapper.receiptID = rec.Id;

    //     Test.startTest();
    //         unsuccess_MockTest('invoice_400');
    //         QBIntegrationQueue_SIFlow.sync_invoice_in_QB(wrapper);
    //     Test.stopTest();
    // }
    // @isTest
    // public static void sync_invoice_in_QB2() {

    //     Account acc = createAccount();
    //     Account vendorAcc = createVendorAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     buildertek__Billings__c inv1 = createSI(vendorAcc.Id);
    //     List<buildertek__Billable_Lines__c> invLine = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     Map<Id, List<String>> lineIdsMap = new Map<Id, List<String>>();
    //     lineIdsMap.put(
    //             Id.valueOf(invLine[0].Id), // Salesforce ID
    //             new List<String> { 
    //                 invLine[0].buildertek__QB_Id__c, invLine[0].buildertek__QBO_Name__c, string.valueOf(invLine[0].buildertek__SubTotal__c), string.valueOf(invLine[0].buildertek__Quantity__c), string.valueOf(invLine[0].buildertek__Unit_Price__c)
    //             }
    //     );
        
    //     QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper wrapper = new QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper();
    //     wrapper.Get_Access_Token = false;
    //     wrapper.SyncObjName = 'buildertek__Billings__c';
    //     wrapper.acc = acc;
    //     wrapper.SI = inv;
    //     wrapper.lineIdsMap = lineIdsMap;
    //     wrapper.receiptID = rec.Id;

    //     Test.startTest();
    //         syncToken_unsuccess_MockTest('invoice_400');
    //         QBIntegrationQueue_SIFlow.sync_invoice_in_QB(wrapper);
    //     Test.stopTest();
    // }
    // @isTest
    // public static void sync_Payment_In_QB() {

    //     Account acc = createAccount();
    //     Account vendorAcc = createVendorAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     buildertek__Billings__c inv1 = createSI(vendorAcc.Id);
    //     List<buildertek__Billable_Lines__c> invLine = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
        
    //     QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper wrapper = new QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper();
    //     wrapper.Get_Access_Token = false;
    //     wrapper.SyncObjName = 'buildertek__Receipt__c';
    //     wrapper.acc = acc;
    //     wrapper.SI = inv;
    //     wrapper.receiptID = rec.Id;

    //     Test.startTest();
    //     unsuccess_MockTest('payment_400');
    //     QBIntegrationQueue_SIFlow.sync_Payment_In_QB(wrapper);
    //     Test.stopTest();
    // }
    // @isTest
    // public static void sync_Payment_In_QB1() {

    //     Account acc = createAccount();
    //     Account vendorAcc = createVendorAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     buildertek__Billings__c inv1 = createSI(vendorAcc.Id);
    //     List<buildertek__Billable_Lines__c> invLine = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    
    //     QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper wrapper = new QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper();
    //     wrapper.Get_Access_Token = false;
    //     wrapper.SyncObjName = 'buildertek__Receipt__c';
    //     wrapper.acc = acc;
    //     wrapper.SI = inv;
    //     wrapper.receiptID = rec.Id;

    //     Test.startTest();
    //     syncToken_unsuccess_MockTest('payment_400');
    //     QBIntegrationQueue_SIFlow.sync_Payment_In_QB(wrapper);
    //     Test.stopTest();
    // }
    // @isTest
    // public static void sync_Term_in_QB2() {

    //     Account acc = createAccount();
    //     Account vendorAcc = createVendorAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     buildertek__Billings__c inv1 = createSI(vendorAcc.Id);
    //     List<buildertek__Billable_Lines__c> invLine = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     Map<Id, List<String>> lineIdsMap = new Map<Id, List<String>>();
    //     lineIdsMap.put(
    //             Id.valueOf(invLine[0].Id), // Salesforce ID
    //             new List<String> { 
    //                 invLine[0].buildertek__QB_Id__c, invLine[0].buildertek__QBO_Name__c, string.valueOf(invLine[0].buildertek__SubTotal__c), string.valueOf(invLine[0].buildertek__Quantity__c), string.valueOf(invLine[0].buildertek__Unit_Price__c)
    //             }
    //     );
    //     QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper wrapper = new QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper();
    //     wrapper.Get_Access_Token = false;
    //     wrapper.acc = acc;
    //     wrapper.SI = inv;
    //     wrapper.receiptID = rec.Id;
    //     wrapper.lineIdsMap = lineIdsMap;

    //     Test.startTest();
    //     unsuccess_MockTest('term_400');
    //     QBIntegrationQueue_SIFlow.sync_Term_in_QB(wrapper);
    //     Test.stopTest();
    // }
    // @isTest
    // public static void sync_TaxRate_in_QB() {

    //     Account acc = createAccount();
    //     Account vendorAcc = createVendorAccount();
    //     buildertek__Billings__c inv = createSI(acc.Id);
    //     buildertek__Billings__c inv1 = createSI(vendorAcc.Id);
    //     List<buildertek__Billable_Lines__c> invLine = createSalesIvoiceLine(inv.Id);
    //     buildertek__Receipt__c rec = createReceipt(inv.Id);
    //     Map<Id, List<String>> lineIdsMap = new Map<Id, List<String>>();
    //     lineIdsMap.put(
    //             Id.valueOf(invLine[0].Id), // Salesforce ID
    //             new List<String> { 
    //                 invLine[0].buildertek__QB_Id__c, invLine[0].buildertek__QBO_Name__c, string.valueOf(invLine[0].buildertek__SubTotal__c), string.valueOf(invLine[0].buildertek__Quantity__c), string.valueOf(invLine[0].buildertek__Unit_Price__c)
    //             }
    //     );
    //     QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper wrapper = new QBIntegrationQueue_SIFlow.salesInvoiceFlow_Wrapper();
    //     wrapper.Get_Access_Token = false;
    //     wrapper.acc = acc;
    //     wrapper.SI = inv;
    //     wrapper.receiptID = rec.Id;
    //     wrapper.lineIdsMap = lineIdsMap;
    //     Test.startTest();

    //     success_MockTest();
    //     QBIntegrationQueue_SIFlow.sync_TaxRate_in_QB(wrapper);
    //     Test.stopTest();
    // }
}