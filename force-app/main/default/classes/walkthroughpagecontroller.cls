public without sharing class walkthroughpagecontroller {
    public String strBody { get; set; }
    public String imageContent { get; set; }
    public String recordId { get; set; }
    public String templateId { get; set; }
    public Boolean isAcceptedOrRejected { get; set; }

    public walkthroughpagecontroller() {
        recordId = ApexPages.currentPage().getParameters().get('Id');
        templateId = ApexPages.currentPage().getParameters().get('templateId');
    }
    
    public PageReference createWalkthroughPage() {
        isAcceptedOrRejected = false;
        loadEmailTemplate();
        fetchCompanyLogo();
        return null;
    }
    
    private void loadEmailTemplate() {
        try {
            if (String.isNotBlank(templateId)) {
                List<Messaging.SingleEmailMessage> msgList = new List<Messaging.SingleEmailMessage>();
                
                if (String.isBlank(recordId) || !((Id)recordId).getSObjectType().getDescribe().isAccessible()) {
                    throw new CustomException('Invalid or inaccessible recordId');
                }
                
                List<Contact> contacts = [SELECT Id, Email FROM Contact WHERE Email != null LIMIT 1];
                if (contacts.isEmpty()) {
                    throw new CustomException('No valid contact found');
                }
                
                Contact contact = contacts[0];
                
                List<EmailTemplate> templates = [SELECT Id, Name, Body FROM EmailTemplate WHERE Id = :templateId];
                if (templates.isEmpty()) {
                    throw new CustomException('Invalid email template Id');
                }
                EmailTemplate emailTemplateRec = templates[0];
                // fetch template Body
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                email.setTemplateId(emailTemplateRec.Id);
                email.setWhatId(recordId);
                email.setTargetObjectId(contact.Id);
                email.setSaveAsActivity(false);
                email.setToAddresses(new List<String>{contact.Email});
                msgList.add(email);
                
                Messaging.SendEmailResult[] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[]{email});
                
                for (Messaging.SendEmailResult result : results) {
                    if (!result.isSuccess()) {
                        for (Messaging.SendEmailError error : result.getErrors()) {
                            System.debug('Email Error: ' + error.getMessage());
                        }
                        throw new CustomException('Failed to send email');
                    }
                }
                
                for (Messaging.SingleEmailMessage emailNew : msgList) {
                    String htmlBody = emailNew.getHTMLBody();
                    if (htmlBody != null) {
                        strBody = htmlBody;
                    }
                }
            } else {
                throw new CustomException('Template Id is null or empty');
            }
        } catch (Exception e) {
            System.debug('Error loading email template: ' + e.getMessage());
            strBody = 'Error: ' + e.getMessage();
        }
    }

    private void fetchCompanyLogo() {
        try {
            List<Document> docs = [SELECT Id FROM Document WHERE DeveloperName = 'Company_Logo' LIMIT 1];
            if (!docs.isEmpty()) {
                String imageId = docs[0].Id;
                imageId = imageId.substring(0, 15);
                strBody = strBody.replace('###############', imageId);
            }
        } catch (Exception ex) {
            System.debug('Error fetching company logo: ' + ex.getMessage());
        }
    }
    
    public void acceptWalkthrough() {
        if (String.isNotBlank(imageContent)) {
            strBody = '<div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">' +
          '<h2 style="color: #28a745; font-size: 24px; margin-bottom: 10px;">Thank you for accepting the walkthrough!</h2>' +
          '<p style="font-size: 16px; margin: 0; line-height: 1.6;">Your signature has been recorded. Someone will contact you shortly.</p>' +
          '</div>';
        }

        buildertek__Walk_Through_List__c wTRec = [SELECT Id, buildertek__Status__c FROM buildertek__Walk_Through_List__c WHERE Id =: recordId];
        if(wTRec != null){
            wTRec.buildertek__Status__c = 'Customer Accepted';
            wTRec.buildertek__Date_Customer_Reviewed_and_Approved__c = System.now();
            update wTRec;
            isAcceptedOrRejected = true;
        }

        saveSign();
    }
    
    public void rejectWalkthrough() {
        if (String.isNotBlank(imageContent)) {
            strBody = '<div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">' +
          '<h2 style="color: #dc3545; font-size: 24px; margin-bottom: 10px;">You have rejected the walkthrough.</h2>' +
          '<p style="font-size: 16px; margin: 0; line-height: 1.6;">Your signature has been recorded.</p>' +
          '</div>';
        }

        buildertek__Walk_Through_List__c wTRec = [SELECT Id, buildertek__Status__c FROM buildertek__Walk_Through_List__c WHERE Id =: recordId];
        if(wTRec != null){
            wTRec.buildertek__Status__c = 'Customer Rejected';
            update wTRec;
            isAcceptedOrRejected = true;
        }

        saveSign();
    }

    public void saveSign(){
        transient DateTime nowDT = System.now();
        ContentVersion conVer = new ContentVersion();
        conVer.ContentLocation = 'S';
        conVer.PathOnClient = 'SignatureName.png';
        conVer.Title = 'Signature' + ' ' + nowDT;
        conVer.VersionData = EncodingUtil.base64Decode(imageContent);
        insert conVer;
        
        Id conDoc = [SELECT ContentDocumentId
                     FROM ContentVersion
                     WHERE Id = :conVer.Id].ContentDocumentId;
        
        ContentDocumentLink conDocLink = New ContentDocumentLink();
        conDocLink.LinkedEntityId = recordID;
        conDocLink.ContentDocumentId = conDoc;
        conDocLink.shareType = 'I';
        conDocLink.Visibility = 'AllUsers';
        insert conDocLink;

        ContentDistribution cd = new ContentDistribution();
        cd.name = 'WT';
        cd.ContentVersionId = conVer.id;
        cd.PreferencesAllowOriginalDownload = true;
        cd.PreferencesAllowPDFDownload = true;
        cd.PreferencesAllowViewInBrowser = true;
        cd.PreferencesNotifyOnVisit = false;
        insert cd;
    }

    public class CustomException extends Exception {}
}