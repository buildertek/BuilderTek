public with sharing class certificateExpirationRemainder {
    public certificateExpirationRemainder() {

    }

    @InvocableMethod(label='Certificate Expiration Remainder' description='Send email to user for certificate expiration remainder')
    public static void sendEmail(){
        System.debug('Inside sendEmail method');

        List<User> users = getUsers();
        List<Account> accounts = getacc();
        System.debug('Users: ' + users);
        System.debug('Accounts: ' + accounts);

        if(users.isEmpty()){
            System.debug('No users found');
            return;
        }

        String baseURL = Url.getOrgDomainURL().toExternalForm();

        List<Account> commercialGL = filterAccountsByExpiration(accounts, 'buildertek__Commercial_GL_Expiration_Date__c', 30);
        List<Account> workerComp = filterAccountsByExpiration(accounts, 'buildertek__Worker_s_Compensation_License_Expiration__c', 30);
        List<Account> generalLiability = filterAccountsByExpiration(accounts, 'buildertek__General_Liability_License_Expiration__c', 30);
        List<Account> umbrellaPolicy = filterAccountsByExpiration(accounts, 'buildertek__Umbrella_Policy_Expiration_Date__c', 30);

        List<Account> commercialGL15Days = filterAccountsByExpiration(accounts, 'buildertek__Commercial_GL_Expiration_Date__c', 15);
        List<Account> workerComp15Days = filterAccountsByExpiration(accounts, 'buildertek__Worker_s_Compensation_License_Expiration__c', 15);
        List<Account> generalLiability15Days = filterAccountsByExpiration(accounts, 'buildertek__General_Liability_License_Expiration__c', 15);
        List<Account> umbrellaPolicy15Days = filterAccountsByExpiration(accounts, 'buildertek__Umbrella_Policy_Expiration_Date__c', 15);

        sendEmails(users, commercialGL, workerComp, generalLiability, umbrellaPolicy, baseURL, 'Certificate Expiration Remainder - 30 Days', 30);
        sendEmails(users, commercialGL15Days, workerComp15Days, generalLiability15Days, umbrellaPolicy15Days, baseURL, 'Certificate Expiration Remainder - 15 Days', 15);
    }

    private static List<Account> filterAccountsByExpiration(List<Account> accounts, String fieldName, Integer days) {
        List<Account> filteredAccounts = new List<Account>();
        for(Account acc : accounts){
            if((Date)acc.get(fieldName) == Date.today().addDays(days)){
                filteredAccounts.add(acc);
                System.debug('fieldName: ' + fieldName);
            }
        }
        System.debug('Filtered Accounts: ' + filteredAccounts);
        return filteredAccounts;
    }

    private static void sendEmails(List<User> users, List<Account> commercialGL, List<Account> workerComp, List<Account> generalLiability, List<Account> umbrellaPolicy, String baseURL, String subject, Integer days) {
        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
        for(User user : users){
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setToAddresses(new String[]{user.Email});
            email.setSubject(subject);
            String body = ''; 
            body += '<html><head><style>table {border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;} th, td {padding: 8px; text-align: left; border-bottom: 1px solid #ddd;} th {background-color: #f2f2f2;}</style></head><body>';
            body += 'Hello ' + user.Name + ',<br><br> The following accounts have certificates expiring in ' + days + ' days. Please review the accounts and update the certificates.<br><br>';
            body += '<table>';
            body += '<tr><th>Account Name</th><th>Certificate Type</th><th>Expiration Date</th></tr>';
            for(Account acc : commercialGL){
                body += '<tr><td><a href="' + baseURL + '/' + acc.Id + '">' + acc.Name + '</a></td><td>Commercial GL</td><td>' + formatDate(acc.buildertek__Commercial_GL_Expiration_Date__c) + '</td></tr>';
            }
            for(Account acc : workerComp){
                body += '<tr><td><a href="' + baseURL + '/' + acc.Id + '">' + acc.Name + '</a></td><td>Worker\'s Compensation</td><td>' + formatDate(acc.buildertek__Worker_s_Compensation_License_Expiration__c) + '</td></tr>';
            }
            for(Account acc : generalLiability){
                body += '<tr><td><a href="' + baseURL + '/' + acc.Id + '">' + acc.Name + '</a></td><td>General Liability</td><td>' + formatDate(acc.buildertek__General_Liability_License_Expiration__c) + '</td></tr>';
            }
            for(Account acc : umbrellaPolicy){
                body += '<tr><td><a href="' + baseURL + '/' + acc.Id + '">' + acc.Name + '</a></td><td>Umbrella Policy</td><td>' + formatDate(acc.buildertek__Umbrella_Policy_Expiration_Date__c) + '</td></tr>';
            }
            body += '</table><br><br>';
            body += '</body></html>';
            email.setHtmlBody(body);
            emails.add(email);
        }
        if(!commercialGL.isEmpty() || !workerComp.isEmpty() || !generalLiability.isEmpty()){
            System.debug('Sending email');
            Messaging.sendEmail(emails);
        }
    }

    public static string formatDate(Date inputDate){
        return inputDate.format();
    }

    public static List<User> getUsers(){
        List<User> users = new List<User>();
        if (Schema.sObjectType.User.isAccessible()) {
            users = [SELECT Id, Name, Email FROM User WHERE buildertek__Receive_Insurance_Expiration_Email__c = true AND Email != null];
        }
        return users;
    }

    public static List<Account> getacc(){
        List<Account> accs = new List<Account>();
        if (Schema.sObjectType.Account.isAccessible()) {
            accs = [SELECT Id, Name, buildertek__Commercial_GL_Expiration_Date__c, buildertek__Worker_s_Compensation_License_Expiration__c, buildertek__General_Liability_License_Expiration__c, buildertek__Umbrella_Policy_Expiration_Date__c 
                    FROM Account 
                    WHERE (buildertek__Commercial_GL_Expiration_Date__c != null 
                    OR buildertek__Worker_s_Compensation_License_Expiration__c != null 
                    OR buildertek__General_Liability_License_Expiration__c != null
                    OR buildertek__Umbrella_Policy_Expiration_Date__c != null)
                    AND buildertek__BT_Account_Type__c = 'Vendor'];
        }

        return accs;
    }
}