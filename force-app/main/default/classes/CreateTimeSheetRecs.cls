public without sharing class CreateTimeSheetRecs {
    public CreateTimeSheetRecs() {

    }

    @InvocableMethod(label='Create Time Sheet Records' description='Create Time Sheet Records')
    public static void createRecords() {
        System.debug('Inside createTimeSheetRecs');

        List<Contact> contactList = getContactList();
        Map<Id, Id> userContactMap = getUserContactMap(contactList);

        if (contactList.isEmpty()) {
            return;
        }

        List<buildertek__BT_Time_Sheet__c> timeSheetList = createTimeSheetList(contactList, userContactMap);
        Map<Id, ContactInfo> contactInfoMap = createContactInfoMap(contactList);

        String baseUrl = Url.getOrgDomainURL().toExternalForm();

        List<Database.SaveResult> saveResults = Database.insert(timeSheetList, false);
        List<buildertek__BT_Time_Sheet__c> successTimeSheetList = new List<buildertek__BT_Time_Sheet__c>();
        List<buildertek__BT_Time_Sheet__c> errorTimeSheetList = new List<buildertek__BT_Time_Sheet__c>();

        for(Integer i = 0; i < saveResults.size(); i++) {
            if(saveResults.get(i).isSuccess()) {
                successTimeSheetList.add(timeSheetList.get(i));
            } else {
                errorTimeSheetList.add(timeSheetList.get(i));
            }
        }

        sendSuccessEmails(successTimeSheetList, contactInfoMap, baseUrl);
        sendErrorEmails(errorTimeSheetList, contactInfoMap, saveResults, baseUrl);
        if (!successTimeSheetList.isEmpty() || !errorTimeSheetList.isEmpty()) {
            sendSummaryEmail(successTimeSheetList, errorTimeSheetList, baseUrl);
        }
    }

    private static List<Contact> getContactList() {
        List<Contact> contactList = new List<Contact>();

        if (Schema.sObjectType.Contact.isAccessible() && Schema.sObjectType.Contact.isQueryable()) {
            contactList = [SELECT Id, Name, buildertek__Create_Time_Sheets__c, Email FROM Contact WHERE buildertek__Create_Time_Sheets__c = true];
        }

        return contactList;
    }

    private static Map<Id, Id> getUserContactMap(List<Contact> contactList) {
        //create a set of contact names
        Set<String> contactSet = new Set<String>();
        for(Contact contact : contactList) {
            contactSet.add(contact.Name);
        }

        Map<Id, Id> userContactMap = new Map<Id, Id>();

        List<User> userList = new List<User>();
        
        if (Schema.sObjectType.User.isAccessible()) {
            userList = [SELECT Id, Name FROM User WHERE NAME like :contactSet];
        }

        for(User user : userList) {
            for(Contact contact : contactList) {
                if((user.Name == contact.Name) && !userContactMap.containsKey(contact.Id)) {
                    userContactMap.put(contact.Id, user.Id);
                }
            }
        }

        return userContactMap;
    }

    private static List<buildertek__BT_Time_Sheet__c> createTimeSheetList(List<Contact> contactList, Map<Id, Id> userContactMap) {
        List<buildertek__BT_Time_Sheet__c> timeSheetList = new List<buildertek__BT_Time_Sheet__c>();

        for(Contact contact : contactList) {
            buildertek__BT_Time_Sheet__c timeSheet = new buildertek__BT_Time_Sheet__c();
            timeSheet.buildertek__Contact__c = contact.Id;
            timeSheet.Name = contact.Name + ' ' + Date.today().format() ;
            timeSheet.buildertek__Status__c = 'New';
            timeSheet.buildertek__Send_Remainder_Email__c = true;
            if(userContactMap.containsKey(contact.Id)) {
                timeSheet.OwnerId = userContactMap.get(contact.Id);
            }
            timeSheetList.add(timeSheet);
        }

        return timeSheetList;
    }

    private static Map<Id, ContactInfo> createContactInfoMap(List<Contact> contactList) {
        Map<Id, ContactInfo> contactInfoMap = new Map<Id, ContactInfo>();

        for(Contact contact : contactList) {
            ContactInfo info = new ContactInfo(contact.Email, contact.Name);
            contactInfoMap.put(contact.Id, info);
        }

        return contactInfoMap;
    }

    private static void sendSuccessEmails(List<buildertek__BT_Time_Sheet__c> successTimeSheetList, Map<Id, ContactInfo> contactInfoMap, String baseUrl) {
        if(!successTimeSheetList.isEmpty()) {
            List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
            EmailTemplate tem;
            if (Schema.sObjectType.EmailTemplate.isAccessible() && Schema.sObjectType.EmailTemplate.isQueryable()) {
                tem = [SELECT Id, DeveloperName from EmailTemplate where DeveloperName  = 'TimeSheet_Created' limit 1];
            }
            List<RecordType> recordTypeList = new List<RecordType>();
            if (Schema.sObjectType.RecordType.isAccessible() && Schema.sObjectType.RecordType.isQueryable()) {
                recordTypeList = [SELECT Id, Name, DeveloperName FROM RecordType where SobjectType ='buildertek__BT_Time_Sheet_Entry__c' and DeveloperName = 'Weekly_Entry'];
            } else {
                System.debug('Insufficient permissions to query RecordType object.');
            }
            System.debug('recordTypeList: ' + recordTypeList[0].Name);
            List<buildertek__BT_Time_Sheet_Entry__c> timeSheetEntryList = new List<buildertek__BT_Time_Sheet_Entry__c>();
            for(buildertek__BT_Time_Sheet__c timeSheet : successTimeSheetList) {
                buildertek__BT_Time_Sheet_Entry__c timesheetentry = new buildertek__BT_Time_Sheet_Entry__c();
                if(contactInfoMap.containsKey(timeSheet.buildertek__Contact__c)) {
                    timesheetentry.Name = timeSheet.Name;
                    timesheetentry.buildertek__BT_Time_Sheet__c = timeSheet.Id;
                    timesheetentry.buildertek__Contact__c = timeSheet.buildertek__Contact__c;
                    timesheetentry.RecordTypeId = recordTypeList[0].Id;
                    timeSheetEntryList.add(timesheetentry);
                    ContactInfo info = contactInfoMap.get(timeSheet.buildertek__Contact__c);
                    Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                    mail.setToAddresses(new String[] {info.email});
                    mail.setTemplateId(tem.Id);
                    mail.setTargetObjectId(timeSheet.buildertek__Contact__c);
                    mail.setWhatId(timeSheet.Id);
                    mails.add(mail);
                }
            }
            if (Schema.sObjectType.buildertek__BT_Time_Sheet_Entry__c.isCreateable()) {
                insert timeSheetEntryList;
            } else {
                System.debug('Insufficient permissions to create buildertek__BT_Time_Sheet_Entry__c records.');
            }
            Messaging.sendEmail(mails);
        }
    }

    private static void sendErrorEmails(List<buildertek__BT_Time_Sheet__c> errorTimeSheetList, Map<Id, ContactInfo> contactInfoMap, List<Database.SaveResult> saveResults, String baseUrl) {
        if(!errorTimeSheetList.isEmpty()) {
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setToAddresses(new String[] {'jaimin.s@mvclouds.com'});
            mail.setSubject('Error while creating Time Sheet records');
            mail.setHtmlBody(mail.getHtmlBody() + 'Hello Admin,<br><br>There was an error while creating Time Sheet records. Please find the details below:<br><br>');
            mail.setHtmlBody(mail.getHtmlBody() + 'Base URL: ' + baseUrl + '<br><br>');
            for(buildertek__BT_Time_Sheet__c timeSheet : errorTimeSheetList) {
                if(contactInfoMap.containsKey(timeSheet.buildertek__Contact__c)) {
                    ContactInfo info = contactInfoMap.get(timeSheet.buildertek__Contact__c);
                    mail.setHtmlBody(mail.getHtmlBody() + 'Error while creating Time Sheet record for ' + info.name + '<br>');
                    mail.setHtmlBody(mail.getHtmlBody() + 'Error Message: ' + saveResults.get(errorTimeSheetList.indexOf(timeSheet)).getErrors() + '<br><br>');
                }
            }
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] {mail});
        }
    }

    private static void sendSummaryEmail(List<buildertek__BT_Time_Sheet__c> successTimeSheetList, List<buildertek__BT_Time_Sheet__c> errorTimeSheetList, String baseUrl) {
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new String[] {'jaimin.s@mvclouds.com'});
        // mail.setCcAddresses(new String[] {'brian.cronin@buildertek.com'});
        mail.setSubject('Time Sheet records creation summary');
        mail.setHtmlBody(mail.getHtmlBody() + 'Hello Admin,<br><br>Time Sheet records creation summary:<br><br>');
        mail.setHtmlBody(mail.getHtmlBody() + 'Base URL: ' + baseUrl + '<br><br>');
        mail.setHtmlBody(mail.getHtmlBody() + 'Total Time Sheet records created: ' + successTimeSheetList.size() + '<br>');
        mail.setHtmlBody(mail.getHtmlBody() + 'Total Time Sheet records failed: ' + errorTimeSheetList.size() + '<br><br>');
        mail.setHtmlBody(mail.getHtmlBody() + '<table style="border-collapse: collapse;"><tr><th style="border: 1px solid black; padding: 5px;">Id</th><th style="border: 1px solid black; padding: 5px;">Name</th><th style="border: 1px solid black; padding: 5px;">Status</th><th style="border: 1px solid black; padding: 5px;">Contact</th><th style="border: 1px solid black; padding: 5px;">Send Reminder Email</th><th style="border: 1px solid black; padding: 5px;">Owner</th></tr>');
        for(buildertek__BT_Time_Sheet__c timeSheet : successTimeSheetList) {
            String recordLink = baseUrl + '/' + timeSheet.Id;
            mail.setHtmlBody(mail.getHtmlBody() + '<tr><td style="border: 1px solid black; padding: 5px;">' + timeSheet.Id + '</td><td style="border: 1px solid black; padding: 5px;"><a href="' + recordLink + '">' + timeSheet.Name + '</a></td><td style="border: 1px solid black; padding: 5px;">' + timeSheet.buildertek__Status__c + '</td><td style="border: 1px solid black; padding: 5px;">' + timeSheet.buildertek__Contact__c + '</td><td style="border: 1px solid black; padding: 5px;">' + timeSheet.buildertek__Send_Remainder_Email__c + '</td><td style="border: 1px solid black; padding: 5px;">' + timeSheet.OwnerId + '</td></tr>');
        }
        mail.setHtmlBody(mail.getHtmlBody() + '</table><br><br>');
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] {mail});
    }

    public class ContactInfo {
        public String email;
        public String name;

        public ContactInfo(String email, String name) {
            this.email = email;
            this.name = name;
        }
    }
}