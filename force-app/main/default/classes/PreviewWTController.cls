public with sharing class PreviewWTController {
   
    @AuraEnabled
    public Static List<EmailTemplate> getWTTemplates(){
        try {
            List<Emailtemplate> temrec = [SELECT Id, Name, folder.name, DeveloperName FROM Emailtemplate WHERE folder.name = 'BT WT'];
            return temrec;
        } catch (Exception e) {
            System.debug('Error in getTemplates: ' + e.getMessage());
            throw new AuraHandledException('Error retrieving email templates: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Contact getContactEmail(String recordId){
        try {
            buildertek__Walk_Through_List__c wt = [SELECT Id, buildertek__Contact__c FROM buildertek__Walk_Through_List__c WHERE Id = :recordId];
            if (wt.buildertek__Contact__c != null) {
                Contact con = [SELECT Id, Name, Email FROM Contact WHERE Id = :wt.buildertek__Contact__c];
                return con;
            } else {
                return null;
            }
        } catch (Exception e) {
            System.debug('Error in getContactEmail: ' + e.getMessage());
            throw new AuraHandledException('Error retrieving contact email: ' + e.getMessage());
        }
    }
   
    @AuraEnabled
    public static string getTemplateDetails(String recordId, String templateId){
        try {
            Contact con = [SELECT Id, Email FROM Contact WHERE email != null ORDER BY createddate DESC LIMIT 1];
            String[] toaddress = new String[]{con.email};
            
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setTemplateId(templateId);
            email.setWhatId(recordId);                        
            email.setTargetObjectId(con.Id);       
            email.setSaveAsActivity(false);
            email.setToAddresses(toaddress);
            
            Savepoint sp = Database.setSavepoint();
            Messaging.SendEmailResult[] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[]{email});
            if (results[0].isSuccess()) {
                string templateBody = email.getHTMLBody();
                Database.rollback(sp);
                System.debug('Template Body: ' + templateBody);

                return templateBody;
            } else {
                throw new AuraHandledException('Failed to send email: ' + results[0].getErrors()[0].getMessage());
            }
        } catch (Exception e) {
            System.debug('Error in getTemplateDetails: ' + e.getMessage());
            throw new AuraHandledException('Error retrieving template details: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static String sendWalkThroughEmail(String htmlBody, String recordId, String templateId, List<String> to, List<String> cc,String fileid, List<Id> attacheDocs, String emailSubject, Boolean ccCurrentUser){
        try{
            String body = '';
            String subject = emailSubject; 
            string templateBody1 = '';
            Blob filebody;

            List<buildertek__ConfirmationPageSiteURL__c> confirmationurl = buildertek__ConfirmationPageSiteURL__c.getall().values();
            string SiteUrl;
            if(confirmationurl.size() > 0){
                SiteUrl = confirmationurl[0].buildertek__SiteURL__c ;
            }
            List<string> strTO = new List<string>();
            List<string> strCC = new List<string>();
            SET<Id> contactIdSet = new SET<Id>();
            List<Contact> conList = new List<Contact>();
            if(Schema.sObjectType.Contact.fields.Id.isAccessible()
                && Schema.sObjectType.Contact.fields.email.isAccessible()){
                conList = [SELECT Id, email FROM Contact WHERE Id IN:to and email != null];        
            }
            for(Contact con: conList){
                strTO.add(con.email);
            }
            List<Contact> ccConList = new List<Contact>(); 
            if(ccCurrentUser){
                User currentUser = [SELECT Id, Email FROM User WHERE Id = :UserInfo.getUserId()];
                strCC.add(currentUser.Email);
            }
            if(cc.size() > 0 && Schema.sObjectType.Contact.fields.Id.isAccessible()
                && Schema.sObjectType.Contact.fields.Email.isAccessible()){
                ccConList = [SELECT Id, email FROM Contact WHERE Id IN:cc and Email != null];        
            }
            if(ccConList.size() > 0){
                for(Contact con: ccConList){
                    strCC.add(con.email);
                }    
            }

            body += 'Hi, <br/><br/> ';
            body += '</br> Please &nbsp;';
            body += '<a href=' + SiteUrl + 'buildertek__walkthroughPage?Id=' + recordId + '&templateId=' + templateId + '>Click here</a>';
            body += '&nbsp;to confirm your walkthrough details.';

            List<ContentVersion> contentList = [SELECT id, Title, Versiondata, FileType FROM ContentVersion WHERE ContentDocumentId IN: attacheDocs];

            List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            system.debug('strTO ---------> '+strTO);
            mail.setToAddresses(strTO);
            if(strCC != null && strCC.size() > 0) {
                system.debug('strCC -------> '+strCC);
                mail.setCcAddresses(strCC);
            }
            EmailServicesAddress eServices;
            if(Schema.sObjectType.EmailServicesAddress.fields.Id.isAccessible()&&
                Schema.sObjectType.EmailServicesAddress.fields.AuthorizedSenders.isAccessible() &&
                Schema.sObjectType.EmailServicesAddress.fields.EmailDomainName.isAccessible() &&
                Schema.sObjectType.EmailServicesAddress.fields.LocalPart.isAccessible() &&
                Schema.sObjectType.EmailServicesAddress.fields.IsActive.isAccessible()){
                eServices =  [SELECT Id,AuthorizedSenders,EmailDomainName,IsActive,LocalPart FROM EmailServicesAddress where LocalPart = 'projects'];
            } 
            string fromAddress = eServices.LocalPart+'@'+eServices.EmailDomainName;
            mail.setReplyTo(fromAddress);
            mail.setSubject(subject+' [ref:'+recordId+']');
            mail.setHTMLBody(body);
            mail.setSaveAsActivity(false);
            List<Messaging.Emailfileattachment> fileAttachments = new List<Messaging.Emailfileattachment>();
            Messaging.Emailfileattachment efa = new Messaging.Emailfileattachment();
            efa.setFileName('WalkThrough.pdf');
            filebody = setAttachmentBody(recordId, templateId,fileid);
            efa.setBody(setAttachmentBody(recordId, templateId,fileid));
            fileAttachments.add(efa); 
            for (ContentVersion condocs : contentList) {
                Messaging.Emailfileattachment efat = new Messaging.Emailfileattachment();
                efat.setFileName(condocs.Title+'.'+condocs.FileType);
                efat.setBody(condocs.Versiondata);
                fileAttachments.add(efat);
            }
            mail.setFileAttachments(fileAttachments);
            mails.add(mail);
            Messaging.SendEmailResult[] results = Messaging.sendEmail(mails);
            String message = 'Success';
                if(results.size() > 0){
                if (results[0].isSuccess()) {
                    string Toaddresses= '';
                    string CCaddresses= '';
                    integer i = 0;
                    
                    for(String Str : strTO){
                        Toaddresses += Str;
                        if(strTO.size() > i){
                            Toaddresses += ';';
                        }
                        i++;
                    }
                    
                    for(String Str : strCC){
                        CCaddresses += Str;
                        if(strCC.size() > i){
                            CCaddresses += ';';
                        }
                        i++;
                    }
                    String anchorTagRegex = '<a href=\"(.*?)">(.*?)</a>';
                    String plainText = templateBody1.replaceAll(anchorTagRegex, ' ');
                    String plainText2 = plainText.stripHtmlTags();

                    EmailMessage caseEmailMessage = new EmailMessage();
                    caseEmailMessage.fromAddress= UserInfo.getUserEmail();
                    caseEmailMessage.ToAddress = Toaddresses;
                    caseEmailMessage.FromName = UserInfo.getUserName();
                    caseEmailMessage.CcAddress = CCaddresses;
                    caseEmailMessage.Subject = subject;
                    caseEmailMessage.HtmlBody = templateBody1;
                    caseEmailMessage.Incoming= False;

                    caseEmailMessage.buildertek__Is_Incoming_Email__c = false;
                    caseEmailMessage.MessageDate = system.now();
                    caseEmailMessage.TextBody = plainText2;
                    caseEmailMessage.status = '5';
                    caseEmailMessage.RelatedToId = recordId;
                    caseEmailMessage.buildertek__Subject__c = 'Re: '+subject;
                    
                    insert caseEmailMessage;        

                    ContentVersion conVer1 = new ContentVersion();
                    conVer1.PathOnClient = 'WT.pdf'; // The files name, extension is very important here which will help the file in preview.
                    conver1.Title = 'WT.pdf';
                    conVer1.VersionData = filebody; // converting your binary string to Blog
                    insert conVer1;    //Insert ContentVersion

                    ContentDocumentLink conDocLink1 = New ContentDocumentLink();
                    conDocLink1.LinkedEntityId = caseEmailMessage.Id; // Specify RECORD ID here i.e Any Object ID (Standard Object/Custom Object)
                    conDocLink1.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:conVer1.Id].ContentDocumentId;  //ContentDocumentId Id from ContentVersion
                    conDocLink1.Visibility = 'AllUsers';
                    insert conDocLink1; 
                    
                    EmailMessageRelation emr = new EmailMessageRelation();
                    emr.emailMessageId = caseEmailMessage.id;
                    emr.relationId = UserInfo.getUserId(); // user id / contact Id of the sender
                    emr.relationType = 'FromAddress';
                    emr.relationAddress = caseEmailMessage.fromAddress;
                    insert emr;        
                }
            }
            return message;                   
        } catch(Exception exp){
            system.debug('Error Message --------> '+exp);
            String message = 'Error Message => '+exp.getMessage() + 'Error Line no => '+exp.getLineNumber();

            return message;    
        }
   }
    
     @AuraEnabled
    public static String acceptandsendProposal(String htmlBody, String recordId, String templateId, List<String> to, List<String> cc,string Emailsubject, string fileid, Boolean ccCurrentUser){
        try{
            String body = '';
            String subject=Emailsubject;
            list<buildertek__Admin_Interface_Node_Configuration__c> adminInterfaceNodeConfigurations = [Select Id,
                                                                                                 buildertek__Quote_Configuration__c,buildertek__Email_Subject__c 
                                                                                                 from buildertek__Admin_Interface_Node_Configuration__c
                                                                                                 WHERE Name=:'Purchase Order Configuration' and buildertek__Email_Subject__c !=null limit 1];

             List<buildertek__ConfirmationPageSiteURL__c> confirmationurl = buildertek__ConfirmationPageSiteURL__c.getall().values();
            string SiteUrl;
            if(confirmationurl.size() > 0){
              SiteUrl = confirmationurl[0].buildertek__SiteURL__c ;
            }

           List<string> strTO = new List<string>();
           List<string> strCC = new List<string>();
           SET<Id> contactIdSet = new SET<Id>();
           List<Contact> conList = new List<Contact>();
           if(Schema.sObjectType.Contact.fields.Id.isAccessible()
               && Schema.sObjectType.Contact.fields.email.isAccessible()){
               conList = [Select Id, email from Contact where Id IN:to and email != null];        
           }
           system.debug('conList -------> '+conList);
           for(Contact con: conList){
               strTO.add(con.email);
           }
           List<Contact> ccConList = new List<Contact>(); 
           if(cc.size() > 0 && Schema.sObjectType.Contact.fields.Id.isAccessible()
               && Schema.sObjectType.Contact.fields.Email.isAccessible()){
               ccConList = [Select Id, email from Contact where Id IN:cc and Email != null];        
           }
           if(ccCurrentUser){
                User currentUser = [SELECT Id, Email FROM User WHERE Id = :UserInfo.getUserId()];
                strCC.add(currentUser.Email);
           }
           if(ccConList.size() > 0){
               for(Contact con: ccConList){
                   strCC.add(con.email);
               }    
           }
            
            List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            system.debug('strTO ---------> '+strTO);
            mail.setToAddresses(strTO);
            if(strCC != null && strCC.size() > 0) {
                system.debug('strCC -------> '+strCC);
               mail.setCcAddresses(strCC);
            }
            EmailServicesAddress eServices;
            if(Schema.sObjectType.EmailServicesAddress.fields.Id.isAccessible()&&
               Schema.sObjectType.EmailServicesAddress.fields.AuthorizedSenders.isAccessible() &&
               Schema.sObjectType.EmailServicesAddress.fields.EmailDomainName.isAccessible() &&
               Schema.sObjectType.EmailServicesAddress.fields.LocalPart.isAccessible() &&
               Schema.sObjectType.EmailServicesAddress.fields.IsActive.isAccessible()){
                eServices =  [SELECT Id,AuthorizedSenders,EmailDomainName,IsActive,LocalPart FROM EmailServicesAddress where LocalPart = 'projects'];
           } 
            string fromAddress = eServices.LocalPart+'@'+eServices.EmailDomainName;
             body += 'Hi, <br/><br/> ';
            body += '</br> Please &nbsp;'; 
            body += '<a href='+ SiteUrl +'buildertek__ConfirmationPage?Id='+recordId+'&templateId='+templateId+'>Click here</a>';
            body += '&nbsp;to confirm your Purchase Order details.' ;
            mail.setReplyTo(fromAddress);
            // subject = subject +'[ref:'+recordId+']'; 
            mail.setSubject(subject+'[ref:'+recordId+']');
            mail.setHTMLBody(body);
            List<Messaging.Emailfileattachment> fileAttachments = new List<Messaging.Emailfileattachment>();
            Messaging.Emailfileattachment efa = new Messaging.Emailfileattachment();
            efa.setFileName('PurchaseOrder.pdf');
            system.debug('Blob ---> '+setAttachmentBody(recordId, templateId,fileid));
            efa.setBody(setAttachmentBody(recordId, templateId,fileid));
            fileAttachments.add(efa); 
            mail.setFileAttachments(fileAttachments);
            mails.add(mail);
            Messaging.SendEmailResult[] results = Messaging.sendEmail(mails);
            String message = 'Success';
                if(results.size() > 0){
               if (results[0].isSuccess()) {
                   string Toaddresses= '';
                   string CCaddresses= '';
                   integer i = 0;
                   for(String Str : strTO){
                       Toaddresses += Str;
                       if(strTO.size() > i){
                           Toaddresses += ';';
                       }
                       i++;
                   }
                   for(String Str : strCC){
                       CCaddresses += Str;
                       if(strCC.size() > i){
                           CCaddresses += ';';
                       }
                       i++;
                       
                   }
                   system.debug('CCaddresses ----------> '+CCaddresses);
                    EmailMessage caseEmailMessage = new EmailMessage();
                   caseEmailMessage.fromAddress= UserInfo.getUserEmail();
                   caseEmailMessage.ToAddress = Toaddresses;
                   caseEmailMessage.FromName = UserInfo.getUserName();
                   caseEmailMessage.CcAddress = CCaddresses;
                   caseEmailMessage.Subject = subject;
                   caseEmailMessage.HtmlBody = body;
                   caseEmailMessage.Incoming= False;
                   caseEmailMessage.buildertek__Is_Incoming_Email__c = false;
                   caseEmailMessage.MessageDate = system.now();
                   caseEmailMessage.TextBody = body.replaceAll('<br/>', '\n');
                   system.debug('Content length ---------> '+body.length());
                   caseEmailMessage.status = '5';
                   caseEmailMessage.RelatedToId = recordId;
                   caseEmailMessage.buildertek__Subject__c = 'Re: '+subject;
                   
                   insert caseEmailMessage;        
                   
                   
                   
                   EmailMessageRelation emr = new EmailMessageRelation();
                   emr.emailMessageId = caseEmailMessage.id;
                   emr.relationId = UserInfo.getUserId(); // user id / contact Id of the sender
                   emr.relationType = 'FromAddress';
                   emr.relationAddress = caseEmailMessage.fromAddress;
                   insert emr;        
                  
               }
           }
            list<buildertek__Purchase_Order__c> porec = [select id,
                                                               Name,
                                                               buildertek__Status__c,
                                                               buildertek__Customer_Accepted_Date__c,
                                                               buildertek__Date_Confirmed__c
                                                               from buildertek__Purchase_Order__c where Id=:recordId limit 1];
               if(porec.size() > 0 ){
                //    porec[0].buildertek__Date_Confirmed__c = System.today();
                //    update porec;
               }
               
            return message;                   
        }
        catch(Exception exp){
            system.debug('Error Message --------> '+exp);
           String message = exp.getMessage();
           return message;    
        }
   }
   
    private static Blob setAttachmentBody(String recordId, String templateId, String fileid){
       pagereference pdf;
       pdf = Page.buildertek__BT_GeneratePdf;
       pdf.getParameters().put('recordId',recordId);  
       pdf.getParameters().put('templateId',templateId); 
       pdf.getParameters().put('fileId',fileId);
       pdf.setRedirect(true);
       
       Blob blobbody = !Test.isRunningTest() ? pdf.getContent() : Blob.ValueOf('dummy text');
       return blobbody;
   }
   
   
   
   
    /* To Save the Signature in Files */
   @AuraEnabled
   public static string saveSign(String recId,String base64Data, String contentType,string signName){
       system.debug('base64Data-------------'+base64Data);
       string conversn;
       if(base64Data.length() > 1696 || Test.isRunningTest()){  
           base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');   
           ContentVersion conVer = new ContentVersion();
           conVer.ContentLocation = 'S'; // to use S specify this document is in Salesforce, to use E for external files
           conVer.PathOnClient = 'SignatureName.png'; // The files name, extension is very important here which will help the file in preview.
           conVer.Title = signName; // Display name of the files
           conVer.VersionData = EncodingUtil.base64Decode(base64Data); // converting your binary string to Blog
           insert conVer;    //Insert ContentVersion
           system.debug('*******conVer*******'+conVer);
           // First get the Content Document Id from ContentVersion Object
           Id conDoc = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:conVer.Id].ContentDocumentId;
           //create ContentDocumentLink  record 
           ContentDocumentLink conDocLink = New ContentDocumentLink();
           conDocLink.LinkedEntityId = recId; // Specify RECORD ID here i.e Any Object ID (Standard Object/Custom Object)
           conDocLink.ContentDocumentId = conDoc;  //ContentDocumentId Id from ContentVersion
           conDocLink.shareType = 'I';
           insert conDocLink;  
          system.debug('conDocLink---'+conDocLink.id);
          
          list<buildertek__Purchase_Order__c> porec = [select id,
                                                               Name,
                                                               buildertek__Status__c,
                                                               buildertek__Customer_Accepted_Date__c,
                                                               buildertek__Date_Confirmed__c,
                                                               buildertek__Rejection_Reason__c
                                                               from buildertek__Purchase_Order__c where Id=:recId limit 1];
               if(porec.size() > 0 ){
                //    porec[0].buildertek__Date_Confirmed__c = System.today();
                   porec[0].buildertek__Status__c = 'Vendor Accepted';
                   update porec;
               }
            conversn = [SELECT Id,VersionData FROM ContentVersion WHERE ContentDocumentId = :conDoc AND IsLatest = true].Id;
           //system.debug('conversn[0].Id ='+conversn[0].Id);
           return conversn;
       }else{
            String message = 'NoImage';
           return message;
       }
       
   } 
   
   
   @AuraEnabled
   public static string rejectSign(String recId,String base64Data, String contentType,string signName,String rejectionReason){
       system.debug('base64Data-------------'+base64Data);
       string conversn;
       if(base64Data.length() > 1696 || Test.isRunningTest()){  
           base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');   
           ContentVersion conVer = new ContentVersion();
           conVer.ContentLocation = 'S'; // to use S specify this document is in Salesforce, to use E for external files
           conVer.PathOnClient = 'SignatureName.png'; // The files name, extension is very important here which will help the file in preview.
           conVer.Title = signName; // Display name of the files
           conVer.VersionData = EncodingUtil.base64Decode(base64Data); // converting your binary string to Blog
           insert conVer;    //Insert ContentVersion
           system.debug('*******conVer*******'+conVer);
           // First get the Content Document Id from ContentVersion Object
           Id conDoc = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:conVer.Id].ContentDocumentId;
           //create ContentDocumentLink  record 
           ContentDocumentLink conDocLink = New ContentDocumentLink();
           conDocLink.LinkedEntityId = recId; // Specify RECORD ID here i.e Any Object ID (Standard Object/Custom Object)
           conDocLink.ContentDocumentId = conDoc;  //ContentDocumentId Id from ContentVersion
           conDocLink.shareType = 'I';
           insert conDocLink;  
          system.debug('conDocLink---'+conDocLink.id);
          
          list<buildertek__Purchase_Order__c> porec = [select id,
                                                               Name,
                                                               buildertek__Status__c,
                                                               buildertek__Customer_Accepted_Date__c,
                                                               buildertek__Date_Confirmed__c,
                                                               buildertek__Rejection_Reason__c
                                                               from buildertek__Purchase_Order__c where Id=:recId limit 1];
               if(porec.size() > 0 ){
                   porec[0].buildertek__Date_Confirmed__c = System.today();
                   porec[0].buildertek__Status__c = 'Vendor Rejected';
                   porec[0].buildertek__Rejection_Reason__c = rejectionReason;
                   update porec;
               }
            conversn = [SELECT Id,VersionData FROM ContentVersion WHERE ContentDocumentId = :conDoc AND IsLatest = true].Id;
           //system.debug('conversn[0].Id ='+conversn[0].Id);
           return conversn;
       }else{
            String message = 'NoImage';
           return message;
       }
       
   } 
   
    /* To Save the Signature in Files */
   @AuraEnabled
   public static string rejectionWithReason(String recId,String base64Data, String contentType,string signName,String rejectionReason){
       system.debug('base64Data-------------'+base64Data);
       string conversn;
       if(base64Data.length() > 1696 || Test.isRunningTest()){  
           base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');   
           ContentVersion conVer = new ContentVersion();
           conVer.ContentLocation = 'S'; // to use S specify this document is in Salesforce, to use E for external files
           conVer.PathOnClient = 'SignatureName.png'; // The files name, extension is very important here which will help the file in preview.
           conVer.Title = signName; // Display name of the files
           conVer.VersionData = EncodingUtil.base64Decode(base64Data); // converting your binary string to Blog
           insert conVer;    //Insert ContentVersion
           system.debug('*******conVer*******'+conVer);
           // First get the Content Document Id from ContentVersion Object
           Id conDoc = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:conVer.Id].ContentDocumentId;
           //create ContentDocumentLink  record 
           ContentDocumentLink conDocLink = New ContentDocumentLink();
           conDocLink.LinkedEntityId = recId; // Specify RECORD ID here i.e Any Object ID (Standard Object/Custom Object)
           conDocLink.ContentDocumentId = conDoc;  //ContentDocumentId Id from ContentVersion
           conDocLink.shareType = 'I';
           insert conDocLink;  
           system.debug('conDocLink---'+conDocLink.id);
          
          list<buildertek__Purchase_Order__c> porec = [select id,
                                                               Name,
                                                               buildertek__Status__c,
                                                               buildertek__Customer_Accepted_Date__c,
                                                               buildertek__Date_Confirmed__c,
                                                               buildertek__Rejection_Reason__c
                                                               from buildertek__Purchase_Order__c where Id=:recId limit 1];
               if(porec.size() > 0 ){
                   porec[0].buildertek__Date_Confirmed__c = System.today();
                   porec[0].buildertek__Status__c = 'Vendor Rejected';
                   porec[0].buildertek__Rejection_Reason__c = rejectionReason;
                   
                   update porec;
               }
            conversn = [SELECT Id,VersionData FROM ContentVersion WHERE ContentDocumentId = :conDoc AND IsLatest = true].Id;
           //system.debug('conversn[0].Id ='+conversn[0].Id);
           return conversn;
       }else{
            String message = 'NoImage';
           return message;
       }
       
   } 
   @AuraEnabled
    public static String getBlobBody(String recordId, String templateId, String fileid){
        try {
            pagereference pdf;
            pdf = Page.buildertek__BT_GenerateQuotePDF;
            system.debug('*********'+pdf);
            pdf.getParameters().put('recordId', recordId);
            pdf.getParameters().put('templateId', templateId);
            pdf.getParameters().put('fileId', fileId);
            pdf.setRedirect(true);

            return EncodingUtil.base64Encode(pdf.getContent());
        } catch (Exception e) {
            System.debug('Error in getBlobBody: ' + e.getMessage());
            throw new AuraHandledException('Error generating blob body: ' + e.getMessage());
        }
    }
   
}