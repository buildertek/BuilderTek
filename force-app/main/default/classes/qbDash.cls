public with sharing class qbDash {

    public qbDash() {

    }

    @AuraEnabled
    public static string getDetails(Id recordId, String ObjectName){
        try {
            System.debug('recordId: '+recordId);
            System.debug('ObjectName: '+ObjectName);

            String query = 'SELECT ';
            String data;

            List<BT_Lightning_Utils.dataTableFields> fieldsList;
            SObject sObjectrec;

            if(ObjectName == 'buildertek__Billings__c'){
                fieldsList = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Billings__c', 'buildertek__QBDashboard');
                sObjectrec = new buildertek__Billings__c();
            } else if(ObjectName == 'buildertek__Account_Payable__c'){
                fieldsList = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Account_Payable__c', 'buildertek__QBDashboard');
                sObjectrec = new buildertek__Account_Payable__c();
            } else if(ObjectName == 'buildertek__Expense__c'){
                fieldsList = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Expense__c', 'buildertek__QBDashbiard');
                sObjectrec = new buildertek__Expense__c();
            }else if(ObjectName == 'Account'){
                fieldsList = BT_Lightning_Utils.getFieldSetForDataTable('Account', 'buildertek__QBDashboard');
                sObjectrec = new Account();
            }else if(ObjectName == 'buildertek__Credit_Memo__c'){
                fieldsList = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Credit_Memo__c', 'buildertek__QBDashboard');
                sObjectrec = new buildertek__Credit_Memo__c();
            }
            else {
                return 'Invalid ObjectName';
            }

            for(BT_Lightning_Utils.dataTableFields fields: fieldsList){
                query += fields.fieldName + ',';
            }
            if(ObjectName == 'buildertek__Credit_Memo__c'){
                query += 'RecordType.Name, RecordType.DeveloperName,buildertek__QB_Line_Type__c,';
            }
            if(ObjectName == 'buildertek__Account_Payable__c'){
                query += ' buildertek__Status__c, buildertek__Vendor__r.buildertek__Commercial_GL_Expiration_Date__c, buildertek__Vendor__r.buildertek__General_Liability_License_Expiration__c, buildertek__Vendor__r.buildertek__Worker_s_Compensation_License_Expiration__c, buildertek__Vendor__r.buildertek__Umbrella_Policy_Expiration_Date__c';
            }
            query = query.removeEnd(',');
            query += ' FROM '+ObjectName+' WHERE Id = \''+recordId+'\'';
            System.debug('query: '+query);
            sObjectrec = (SObject)Database.query(query);
            data = JSON.serialize(sObjectrec);

            return data;
        } catch (Exception e) {
            System.debug('An error occurred: ' + e.getMessage());
            return 'Error'; // or any other appropriate action
        }

    }

    @AuraEnabled
    public static string getLineDetails(Id recordId, String ObjectName){
        try {   
            System.debug('recordId: '+recordId);
            System.debug('ObjectName: '+ObjectName);

            String query = 'SELECT ';
            
            if(ObjectName == 'buildertek__Account_Payable__c'){
                query += 'Id, Name, buildertek__Cost_Code__c from buildertek__Account_Payable_Item__c WHERE buildertek__Account_Payable__c = \''+recordId+'\'';
                System.debug('query: '+query);
                List<buildertek__Account_Payable_Item__c> sObjectrec = Database.query(query);
                
                for (buildertek__Account_Payable_Item__c item : sObjectrec) {
                    if (item.buildertek__Cost_Code__c == null) {
                        item.buildertek__Cost_Code__c = null;
                    }
                }
                
                return JSON.serialize(sObjectrec);
            } else {
                return 'Invalid ObjectName';
            }

            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string removeQBDetails(Id recordId, String ObjectName){
        try {
            System.debug('recordId: '+recordId);
            System.debug('ObjectName: '+ObjectName);

            List<BT_Lightning_Utils.dataTableFields> fieldsList;
            SObject sObjectrec;

            if(ObjectName == 'buildertek__Billings__c'){
                fieldsList = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Billings__c', 'buildertek__QBDashboard');
                sObjectrec = new buildertek__Billings__c();
            } else if(ObjectName == 'buildertek__Account_Payable__c'){
                fieldsList = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Account_Payable__c', 'buildertek__QBDashboard');
                sObjectrec = new buildertek__Account_Payable__c();
                alsoupdatechile('buildertek__Account_Payable_Item__c', recordId);
            }else if(ObjectName == 'buildertek__Expense__c'){
                fieldsList = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Expense__c', 'buildertek__QBDashbiard');
                sObjectrec = new buildertek__Expense__c();
            }else if(ObjectName == 'Account'){
                fieldsList = BT_Lightning_Utils.getFieldSetForDataTable('Account', 'buildertek__QBDashboard');
                sObjectrec = new Account();
            }else if(ObjectName == 'buildertek__Credit_Memo__c'){
                fieldsList = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Credit_Memo__c', 'buildertek__QBDashboard');
                sObjectrec = new buildertek__Credit_Memo__c();
                alsoupdatechile('buildertek__Credit_Memo_Line__c', recordId);
            }
            else {
                return 'Invalid ObjectName';
            }

            sObjectrec.Id = recordId;
            for(BT_Lightning_Utils.dataTableFields fields: fieldsList){
                if(fields.editable == true && fields.fieldName.containsIgnoreCase('QB')){
                    sObjectrec.put(fields.fieldName, null);
                }
            }
            update sObjectrec;

            return 'Success';
        } catch (Exception e) {
            System.debug('An error occurred: ' + e.getMessage());
            return 'Error'; // or any other appropriate action
        }
    }

    public static void alsoupdatechile(String childObjectName, Id parentRecordId) {
        try {
            if(childObjectName == 'buildertek__Credit_Memo_Line__c'){
                List<buildertek__Credit_Memo_Line__c> creditMemoItems = [
                    SELECT Id, buildertek__QB_Id__c 
                    FROM buildertek__Credit_Memo_Line__c 
                    WHERE buildertek__BT_Credit_Memo__c = :parentRecordId
                ];
                for (buildertek__Credit_Memo_Line__c item : creditMemoItems) {
                    item.buildertek__QB_Id__c = null;
                }
                try{
                    update creditMemoItems;
                }catch(Exception e){
                    System.debug('An error occurred: ' + e.getMessage());
                }
            }

            //buildertek__Account_Payable_Item__c
            if(childObjectName == 'buildertek__Account_Payable_Item__c'){
                List<buildertek__Account_Payable_Item__c> accountPayableItems = [
                    SELECT Id, buildertek__QB_Id__c
                    FROM buildertek__Account_Payable_Item__c
                    WHERE buildertek__Account_Payable__c = :parentRecordId
                ];
                for (buildertek__Account_Payable_Item__c item : accountPayableItems) {
                    item.buildertek__QB_Id__c = null;
                }
                try{
                    update accountPayableItems;
                }catch(Exception e){
                    System.debug('An error occurred: ' + e.getMessage());
                }
            }
            
        } catch (Exception e) {
            System.debug('An error occurred in alsoupdatechile: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static string sendEmail(Id recordId, String ObjectName, String QBMessage){
        try {
            System.debug('recordId: '+recordId);
            System.debug('ObjectName: '+ObjectName);
            System.debug('QBMessage: '+QBMessage);
            String baseURL = URL.getOrgDomainUrl().toExternalForm();
            String orgName = [Select Id, Name, Division from Organization].Name;

            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            String[] toAddresses = new String[] { 'jaimin@buildertek.com', 'brian.cronin@buildertek.com' };
            mail.setToAddresses(toAddresses);
            mail.setSubject('Error in Quickbook integration in Org: ' + orgName);
            String recordURL = baseURL + '/' + recordId;
            String emailBody = '<html><body>';
            emailBody += '<p>Hey developer,</p>';
            emailBody += '<p>There is an error that the customer is facing while integrating with QuickBooks. Please find the details below:</p>';
            emailBody += '<table style="border-collapse: collapse; width: 100%;">';
            emailBody += '<tr><td style="border: 1px solid black; padding: 8px;">Record ID:</td><td style="border: 1px solid black; padding: 8px;">' + recordId + '</td></tr>';
            emailBody += '<tr><td style="border: 1px solid black; padding: 8px;">Object Name:</td><td style="border: 1px solid black; padding: 8px;">' + ObjectName + '</td></tr>';
            emailBody += '<tr><td style="border: 1px solid black; padding: 8px;">Record URL:</td><td style="border: 1px solid black; padding: 8px;"><a href="' + recordURL + '">' + recordURL + '</a></td></tr>';
            emailBody += '<tr><td style="border: 1px solid black; padding: 8px;">QB Message:</td><td style="border: 1px solid black; padding: 8px;">' + QBMessage + '</td></tr>';
            emailBody += '</table>';
            emailBody += '<p>Regards,</p>';
            emailBody += '<p>Jaimin</p>';
            emailBody += '</body></html>';

            mail.setHtmlBody(emailBody);

            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
            System.debug('Email sent successfully');

            return 'Success';
        } catch (Exception e) {
            System.debug('An error occurred: ' + e.getMessage());
            return 'Error'; // or any other appropriate action
        }
    }



}