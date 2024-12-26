@RestResource(urlMapping='/accounts/*')
global with sharing class AccountRestController {

    @HttpGet
    global static List<Account> getAccounts() {
        List<Account> accounts = [SELECT Id, Name, Phone FROM Account LIMIT 10];
        return accounts;
    }

    @HttpPost
    global static String createAccount(String accountJSON) {
        Account newAccount = (Account)JSON.deserialize(accountJSON, Account.class);
        insert newAccount;
        return 'Account created with Id: ' + newAccount.Id;
    }
}