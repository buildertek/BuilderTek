public without sharing class RequestInvoicePageController{
    public string companycurrency {get;set;}

    public boolean multicurrency {get;set;}

    public string purchaseOrderId{ get; set; }

    public Boolean isErrorMessage{ get; set; }

    public String errorMessage{ get; set; }

    public List<buildertek__Purchase_Order__c> purchaseOrderRecord{ get; set; }

    public List<buildertek__Purchase_Order_Item__c> poLineRecord{ get; set; }

    public String latestFileName { get; set; }

    transient String fileContents { get; set; }

    public Boolean isModalVisible { get; set; }

    public String modalTitle { get; set; }

    public String modalMessage { get; set; }

    public String modalButtonLabel { get; set; }

    public Boolean HideSubmitButton { get; set; }

    public RequestInvoicePageController(){
        try{
            
            purchaseOrderId = ApexPages.currentPage().getParameters().get('Id').escapeHtml4();
            purchaseOrderRecord = new List<buildertek__Purchase_Order__c>();
            poLineRecord = new List<buildertek__Purchase_Order_Item__c>();

            List<buildertek__Purchase_Order__c> tempPurchaseOrderList = [SELECT Name, buildertek__Project__c, buildertek__Project__r.buildertek__Project_Manager__r.Email, buildertek__Project__r.Name, buildertek__Vendor__c, buildertek__Vendor__r.Name, buildertek__PO_Total__c, buildertek__Description__c, 
                                                                    (SELECT Name, buildertek__Product__c, buildertek__Product__r.Name, buildertek__Description__c, buildertek__Quantity__c, buildertek__Unit_Price__c, buildertek__Total_Price__c 
                                                                     FROM buildertek__Purchase_Order_Items__r) 
                                                                    FROM buildertek__Purchase_Order__c WHERE ID = :purchaseOrderId LIMIT 1];

            if (!tempPurchaseOrderList.isEmpty()) {
                purchaseOrderRecord = tempPurchaseOrderList;
                if (!tempPurchaseOrderList[0].buildertek__Purchase_Order_Items__r.isEmpty()) {
                    poLineRecord = tempPurchaseOrderList[0].buildertek__Purchase_Order_Items__r;
                }
            }

            isErrorMessage = false;
            errorMessage = '';
            companycurrency = UserInfo.getDefaultCurrency();
            multicurrency = UserInfo.isMultiCurrencyOrganization();
            HideSubmitButton = false;

        } catch (Exception ex){
            isErrorMessage = true;
            errorMessage = ex.getMessage();
            HideSubmitButton = true;
        }
    }

    public void uploadFileToPurchaseorder(){
        try {
            fileContents = Apexpages.currentpage().getparameters().get('secondParam');
            fileContents = EncodingUtil.urlDecode(fileContents, 'UTF-8');
            Blob blobValue = EncodingUtil.base64Decode(fileContents);
            String attachmentBody = EncodingUtil.base64Encode(blobValue);

            ContentVersion contentToInsert =new ContentVersion();
            contentToInsert.ContentLocation = 'S';
            contentToInsert.PathOnClient = latestFileName;
            contentToInsert.Title = latestFileName;
            contentToInsert.VersionData = EncodingUtil.base64Decode(attachmentBody);
            insert contentToInsert;

            contentToInsert = [select id, ContentDocumentId from ContentVersion WHERE Id =: contentToInsert.Id];
            ContentDocumentLink cl = new ContentDocumentLink();
            cl.ContentDocumentId = contentToInsert.ContentDocumentId;
            cl.LinkedEntityId = purchaseOrderId;
            cl.ShareType = 'V'; // Inferred permission
            cl.Visibility = 'AllUsers';
            Database.SaveResult linkSaveResult = Database.insert(cl);

            if (linkSaveResult.isSuccess()) {
                sendEmailToProjectManager();
                handleSuccess();
            } else {
                handleError('Failed to insert ContentDocumentLink.');
            }
        } catch (Exception ex) {
            List<buildertek__Exception_Log_Store_Option__c> StoreExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
            if (!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true) {
                BT_ExceptionHandler.Store_Exception(ex);
            }
            handleError(ex.getMessage());
        }
    }

    public void sendEmailToProjectManager() {
        try {
            System.debug('We are in Send Email Method');
            List<buildertek__Purchase_Order__c> tempPurchaseOrderList = [SELECT Name, buildertek__Project__c, buildertek__Project__r.buildertek__Project_Manager__r.Email, buildertek__Project__r.buildertek__Project_Manager__r.Name, buildertek__Project__r.Name, buildertek__Vendor__c, buildertek__Vendor__r.Name, buildertek__PO_Total__c, buildertek__Description__c, 
                                                                    (SELECT Name, buildertek__Product__c, buildertek__Product__r.Name, buildertek__Description__c, buildertek__Quantity__c, buildertek__Unit_Price__c, buildertek__Total_Price__c 
                                                                     FROM buildertek__Purchase_Order_Items__r) 
                                                                    FROM buildertek__Purchase_Order__c WHERE ID = :purchaseOrderId LIMIT 1];  
                                    
             

            if (!tempPurchaseOrderList.isEmpty()) {

                if (tempPurchaseOrderList[0].buildertek__Project__c == null) {
                    return;
                } 

                buildertek__Admin_Interface_Node_Configuration__c adminInterfaceNodeConfigurations = [SELECT Id, buildertek__Send_Email_to_PM_Invoice__c FROM buildertek__Admin_Interface_Node_Configuration__c WHERE Name = :'Purchase Order Configuration'];
                if (!adminInterfaceNodeConfigurations.buildertek__Send_Email_to_PM_Invoice__c) {
                    return;
                }
                OrgWideEmailAddress owea = [select Id from OrgWideEmailAddress LIMIT 1];
                if (owea == null) {
                    System.debug('No OrgWideEmailAddress found. We need to set up one.');
                    return;
                }
                Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                String[] toAddresses = new String[] {tempPurchaseOrderList[0].buildertek__Project__r.buildertek__Project_Manager__r.Email};
                // String[] toAddresses = new String[] {'jaiminshah555@gmail.com'};
                // toAddresses.add('jaiminshah555@gmail.com');
                String companyName = [SELECT Name FROM Organization].Name;
                String baseURL = Url.getOrgDomainURL().toExternalForm();
                mail.setToAddresses(toAddresses);
                mail.setOrgWideEmailAddressId(owea.Id);
                mail.setSubject('Invoice Uploaded for Purchase Order ' + tempPurchaseOrderList[0].Name);
                String recordLink = baseURL + '/' + purchaseOrderId;
                mail.setHtmlBody('Hello ' + tempPurchaseOrderList[0].buildertek__Project__r.buildertek__Project_Manager__r.Name + ',<br/><br/>' +
                                 tempPurchaseOrderList[0].buildertek__Vendor__r.Name + ' has uploaded an Invoice for Purchase Order ' + tempPurchaseOrderList[0].Name + '.<br/><br/>' +
                                 'Please <a href="' + recordLink + '">click here</a> to review this Invoice.<br/><br/>' +
                                 'Sincerely,<br/>' +
                                 companyName);
                System.debug('We are in Send Email Method2');
                System.debug('mail: ' + mail);
                Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
            }
        } catch (Exception ex) {
            List<buildertek__Exception_Log_Store_Option__c> StoreExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
            if (!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true) {
                BT_ExceptionHandler.Store_Exception(ex);
            }
            handleError(ex.getMessage());
            System.debug('Exception: ' + ex.getMessage());
        }
    }

    public void handleSuccess() {
        modalTitle = 'Success';
        modalMessage = 'File uploaded successfully.';
        modalButtonLabel = 'Close';
        isModalVisible = true;
        HideSubmitButton = true;
        isErrorMessage = true;
        errorMessage = 'Invoice Uploaded Successfully!';
    }

    public void handleError(String errorMessage) {
        modalTitle = 'Error';
        modalMessage = errorMessage;
        modalButtonLabel = 'Close';
        isModalVisible = true;
    }

}