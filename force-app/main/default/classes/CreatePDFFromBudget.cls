public with sharing class CreatePDFFromBudget {
    
    @AuraEnabled
    public Static List<EmailTemplate> getTemplates(){
        List<Emailtemplate> temrec;
        if (Schema.sObjectType.Emailtemplate.fields.Id.isAccessible() && Schema.sObjectType.Emailtemplate.fields.Name.isAccessible() && Schema.sObjectType.Emailtemplate.fields.folderid.isAccessible() && Schema.sObjectType.Folder.fields.Name.isAccessible()){
            // temrec = [Select Id, Name, folder.name, DeveloperName from Emailtemplate where folder.name = 'BT Budget'];
            temrec = [Select Id, Name, folder.name, DeveloperName from Emailtemplate where folder.name = 'BT Budget' AND DeveloperName = 'Standard_Budget'];
        }

        return temrec;
    }

    @AuraEnabled
    public Static List<EmailTemplate> getTemplatesPO(){
        List<Emailtemplate> temrec;
        if (Schema.sObjectType.Emailtemplate.fields.Id.isAccessible() && Schema.sObjectType.Emailtemplate.fields.Name.isAccessible() && Schema.sObjectType.Emailtemplate.fields.folderid.isAccessible() && Schema.sObjectType.Folder.fields.Name.isAccessible()){
            // temrec = [Select Id, Name, folder.name, DeveloperName from Emailtemplate where folder.name = 'BT Budget'];
            temrec = [Select Id, Name, folder.name, DeveloperName from Emailtemplate where folder.name = 'BT PO' AND DeveloperName = 'Purchase_Order_Template_1'];
        }

        return temrec;
    }
    
    @AuraEnabled
    public static String createPoPDFAndStoreInFiles(String templateId, String poId){
        try {
            if(checkPoLine(poId)){
                Blob pdfBlob = previewQuoteController.setAttachmentBody(poId, templateId, '');
                System.debug('pdfBlob : ' + pdfBlob);

                buildertek__Purchase_Order__c po = new buildertek__Purchase_Order__c();
                po = [SELECT Id, Name, buildertek__Description__c FROM buildertek__Purchase_Order__c WHERE Id =: poId];
                String poFileName = po.Name;
                
                if(!String.isBlank(po.buildertek__Description__c)){
                    poFileName = poFileName + ' - ' + po.buildertek__Description__c; 
                }

                ContentVersion cv = new ContentVersion();
                cv.Title = poFileName;
                cv.PathOnClient = cv.Title + '.pdf';
                cv.VersionData = pdfBlob;
                insert cv;

                ContentDocumentLink conDocLink = New ContentDocumentLink();
                conDocLink.LinkedEntityId = poId;
                conDocLink.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:cv.Id].ContentDocumentId;
                conDocLink.Visibility = 'AllUsers';
                insert conDocLink;

                return 'Success';
            }
            else{
                return 'No Purchase Order Lines Found';
            }
        } catch (Exception ex) {
            System.debug('Error: ' + ex.getMessage());
            List<buildertek__Exception_Log_Store_Option__c> StoreExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
            if (!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true) {
                BT_ExceptionHandler.Store_Exception(ex);
            }
            return ex.getMessage();
        }
    }

    @AuraEnabled
    public static String createPDFAndStoreInFiles(String templateId, String budgetId){
        try {
            if(checkLine(budgetId)){
                Blob pdfBlob = previewQuoteController.setAttachmentBody(budgetId, templateId, '');
                System.debug('pdfBlob : ' + pdfBlob);

                ContentVersion cv = new ContentVersion();
                cv.Title = 'Budget_' + DateTime.now().format('yyyyMMddHHmmss');
                cv.PathOnClient = cv.Title + '.pdf';
                cv.VersionData = pdfBlob;
                insert cv;

                ContentDocumentLink conDocLink = New ContentDocumentLink();
                conDocLink.LinkedEntityId = budgetId;
                conDocLink.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:cv.Id].ContentDocumentId;
                conDocLink.Visibility = 'AllUsers';
                insert conDocLink;

                return 'Success';
            }
            else{
                return 'No Budget Lines Found';
            }
        } catch (Exception ex) {
            System.debug('Error: ' + ex.getMessage());
            List<buildertek__Exception_Log_Store_Option__c> StoreExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
            if (!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true) {
                BT_ExceptionHandler.Store_Exception(ex);
            }
            return ex.getMessage();
        }
    }

    public static Boolean checkPoLine(String poId){
        try {
            List<buildertek__Purchase_Order_Item__c> poline = new List<buildertek__Purchase_Order_Item__c>();
            poline = [SELECT Id FROM buildertek__Purchase_Order_Item__c WHERE buildertek__Purchase_Order__c =: poId];
            if(!poline.isEmpty()){
                return true;
            }
            return false;
            
        } catch (Exception e) {
            System.debug('check Po Line exception '+e.getMessage());
            return false;
        }
    }

    public static Boolean isPoFileExist(String poId){
        try {
            buildertek__Purchase_Order__c po = new buildertek__Purchase_Order__c();
            po = [SELECT Id, Name, buildertek__Description__c FROM buildertek__Purchase_Order__c WHERE Id =: poId];
            String poFileName = po.Name;
                
            if(!String.isBlank(po.buildertek__Description__c)){
                poFileName = poFileName + ' - ' + po.buildertek__Description__c;
            }

            List<ContentDocumentLink> conDocLink = new List<ContentDocumentLink>();
            conDocLink = [SELECT ContentDocumentId, ContentDocument.Title FROM ContentDocumentLink WHERE LinkedEntityId =: poId AND ContentDocument.Title =: poFileName LIMIT 1];
            if (conDocLink.size() > 0) {
                return true;
            }
            
            return false;

        } catch (Exception e) {
            System.debug('Exception message '+e.getMessage());
            return false;
        }
    }

    public static Boolean checkLine(String budgetId){
        try {
            if (Schema.sObjectType.buildertek__Budget__c.fields.Id.isAccessible() && Schema.sObjectType.buildertek__Budget__c.fields.buildertek__Budget__c.isAccessible()){
            List<buildertek__Budget_Item__c> budgetline = new List<buildertek__Budget_Item__c>();
            budgetline = [SELECT Id FROM buildertek__Budget_Item__c WHERE buildertek__Budget__c =: budgetId];
                if(!budgetline.isEmpty()){
                    return true;
                }
            }
            return false;
            
        } catch (Exception e) {
            return false;
        }
    }
}