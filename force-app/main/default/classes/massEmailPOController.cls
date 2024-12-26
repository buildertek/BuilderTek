public without sharing class massEmailPOController {

    @AuraEnabled
    public static List<buildertek__Purchase_Order__c> getPurchaseOrders(String pONumber, String project, String vendor, String costCode, String status, String description) {
        try {
            List<buildertek__Purchase_Order__c> allPOs = new List<buildertek__Purchase_Order__c>();
            String query = 'SELECT Id, Name,buildertek__Vendor__c, buildertek__Has_PO_PDF_Attached__c, buildertek__Vendor__r.Name, buildertek__Vendor__r.buildertek__Email_Address__c, buildertek__Project__c, buildertek__Cost_Code__c, buildertek__Cost_Code__r.buildertek__Cost_Code_Name__c,buildertek__Project__r.Name, buildertek__Status__c, buildertek__PO_Total__c, buildertek__Description__c FROM buildertek__Purchase_Order__c WHERE Id IN (SELECT buildertek__Purchase_Order__c FROM buildertek__Purchase_Order_Item__c) AND buildertek__PO_Total__c != 0.00 AND buildertek__Vendor__c != null ';
            if (pONumber != null && pONumber != '') {
                query += ' AND Name LIKE \'%' + pONumber + '%\'';
            }
            if (project != null && project != '') {
                query += ' AND buildertek__Project__r.Name LIKE \'%' + project + '%\'';
            }
            if (vendor != null && vendor != '') {
                query += ' AND buildertek__Vendor__r.Name LIKE \'%' + vendor + '%\'';
            }
            if (costCode != null && costCode != '') {
                query += ' AND buildertek__Cost_Code__r.buildertek__Cost_Code_Name__c LIKE \'%' + costCode + '%\'';
            }
            if (status != null && status != '') {
                query += ' AND buildertek__Status__c = \'' + status + '\'';
            }
            if (description != null && description != '') {
                query += ' AND buildertek__Description__c LIKE \'%' + description + '%\'';
            }
            query += ' ORDER BY buildertek__Vendor__r.Name ASC NULLS LAST, Name DESC, buildertek__Project__r.Name ASC NULLS LAST';
            
            allPOs = Database.query(query);
            return allPOs;
        } catch (Exception e) {
            BT_ExceptionHandler.Store_Exception(e);
            return null;
        }
    }

    @AuraEnabled
    public static String getOrgCurrency() {
        return UserInfo.getDefaultCurrency();
    }

    @AuraEnabled
    public static String sendEmailWithPOAttachments(Map<Id, List<Id>> posByVendor, String subject, String emailBody, List<Id> toIds, List<Id> ccIds) {
        try {
            Id vendorId = posByVendor.keySet().iterator().next();
            List<Id> poIds = posByVendor.get(vendorId);
            
            String vendorEmail = [SELECT Id, buildertek__Email_Address__c FROM Account WHERE Id = :vendorId LIMIT 1].buildertek__Email_Address__c;
            List<string> strTo = new List<string>();
            strTo.add(vendorEmail);
            List<Contact> toConList = new List<Contact>();
            if (toIds.size() > 0){
                if (Schema.sObjectType.Contact.fields.Id.isAccessible() && Schema.sObjectType.Contact.fields.email.isAccessible()){
                    toConList = [SELECT Id, Email FROM Contact WHERE Id IN :toIds and Email != null];
                }
            }
            if (toConList.size() > 0){
                for (Contact con : toConList){
                    strTo.add(con.email);
                }
            }
            List<string> strCC = new List<string>();
            List<Contact> ccConList = new List<Contact>();
            if (ccIds.size() > 0){
                if (Schema.sObjectType.Contact.fields.Id.isAccessible() && Schema.sObjectType.Contact.fields.email.isAccessible()){
                    ccConList = [SELECT Id, Email FROM Contact WHERE Id IN :ccIds and Email != null];
                }
            }
            if (ccConList.size() > 0){
                for (Contact con : ccConList){
                    strCC.add(con.email);
                }
            }
            
            List<ContentDocumentLink> poDocs = [SELECT Id, ContentDocument.Title, ContentDocument.LatestPublishedVersionId FROM ContentDocumentLink WHERE LinkedEntityId IN :poIds];
            Set<Id> documentVersionIds = new Set<Id>();
            for (ContentDocumentLink docLink : poDocs) {
                documentVersionIds.add(docLink.ContentDocument.LatestPublishedVersionId);
            }

            List<Messaging.Emailfileattachment> attachments = new List<Messaging.Emailfileattachment>();
            Set<String> addedDocumentNames = new Set<String>();
            List<ContentVersion> contentVersions = [SELECT VersionData, Title FROM ContentVersion WHERE Id IN :documentVersionIds];
            for (ContentVersion docVersion : contentVersions) {
                if (docVersion.Title != null && docVersion.Title.startsWith('PO-') && !addedDocumentNames.contains(docVersion.Title)) {
                    Messaging.Emailfileattachment attachment = new Messaging.Emailfileattachment();
                    attachment.setFileName(docVersion.Title + '.pdf');
                    attachment.setBody(docVersion.VersionData);
                    attachments.add(attachment);
                    addedDocumentNames.add(docVersion.Title);
                } else {
                    System.debug('Skipping attachment: ' + docVersion.Title + ' (does not meet filename condition)');
                }
            }
            
            if (!attachments.isEmpty()) {
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                email.setToAddresses( strTo );
                if (strCC != null && strCC.size() > 0){
                    system.debug('strCC -------> ' + strCC);
                    email.setCcAddresses(strCC);
                }
                email.setSubject(subject);
                email.setHtmlBody(emailBody);
                email.setFileAttachments(attachments);
                System.debug(email);
                Messaging.SendEmailResult[] r = Messaging.sendEmail(new Messaging.SingleEmailMessage[]{email});
                System.debug('Email Results isSuccess = ' + r[0].IsSuccess());
                if (r[0].IsSuccess()) {
                    List<EmailMessage> emailMessages = new List<EmailMessage>();
                    String strCCString = String.join(strCC, ',');
                    String strToString = String.join(strTo, ',');
                    for (Id poId : poIds) {
                        EmailMessage emailMessage = new EmailMessage();
                        emailMessage.Subject = subject;
                        emailMessage.HtmlBody = emailBody;
                        emailMessage.ToAddress = strToString;
                        emailMessage.CcAddress = strCCString;
                        emailMessage.RelatedToId = poId;
                        emailMessage.status = '3';
                        emailMessages.add(emailMessage);
                    }
                    insert emailMessages;
                    return 'success';
                } else{
                    return 'error';
                }
            } else {
                System.debug('No attachments to send for vendor: ' + vendorId);
                return 'error';
            }
        } catch (Exception e) {
            BT_ExceptionHandler.Store_Exception(e);
            return e.getMessage();
        }
    }

    @AuraEnabled
    public static String createPoPDFAndStoreInFiles(String templateId, List<String> poIds) {
        try {
            if (poIds != null && poIds.size() > 0) {
                Map<Id, buildertek__Purchase_Order__c> poMap = new Map<Id, buildertek__Purchase_Order__c>(
                    [SELECT Id, Name, buildertek__Description__c FROM buildertek__Purchase_Order__c WHERE Id IN :poIds]
                );

                List<ContentVersion> contentVersionsToInsert = new List<ContentVersion>();
                Map<String, Id> poIdToTitleMap = new Map<String, Id>();
                for (String poId : poIds) {
                    if (poMap.containsKey(poId)) {
                        buildertek__Purchase_Order__c po = poMap.get(poId);
                        Blob pdfBlob = previewQuoteController.setAttachmentBody(poId, templateId, '');
                        String poFileName = po.Name;

                        if (!String.isBlank(po.buildertek__Description__c)) {
                            poFileName = poFileName + ' - ' + po.buildertek__Description__c;
                        }

                        ContentVersion cv = new ContentVersion();
                        cv.Title = poFileName;
                        cv.PathOnClient = poFileName + '.pdf';
                        cv.VersionData = pdfBlob;
                        contentVersionsToInsert.add(cv);

                        poIdToTitleMap.put(poFileName, po.Id);
                    }
                }
                insert contentVersionsToInsert;

                Map<Id, ContentVersion> contentVersionMap = new Map<Id, ContentVersion>(
                    [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id IN :contentVersionsToInsert]
                );

                List<ContentDocumentLink> contentDocumentLinksToInsert = new List<ContentDocumentLink>();
                for (ContentVersion cv : contentVersionsToInsert) {
                    if (contentVersionMap.containsKey(cv.Id)) {
                        ContentDocumentLink conDocLink = new ContentDocumentLink();
                        conDocLink.LinkedEntityId = poIdToTitleMap.get(cv.Title);
                        conDocLink.ContentDocumentId = contentVersionMap.get(cv.Id).ContentDocumentId;
                        conDocLink.Visibility = 'AllUsers';
                        contentDocumentLinksToInsert.add(conDocLink);
                    }
                }
                insert contentDocumentLinksToInsert;

                return 'Success';
            } else {
                return 'No Purchase Order Lines Found';
            }
        } catch (Exception ex) {
            List<buildertek__Exception_Log_Store_Option__c> storeExcCustomSetting = [ SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c ];
            if (!storeExcCustomSetting.isEmpty() && storeExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true) {
                BT_ExceptionHandler.Store_Exception(ex);
            }
            return ex.getMessage();
        }
    }
}