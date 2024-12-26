public without sharing class QBAccountResponseJSON {
    public Account Account;
    
    public class Account {
        public String Name;
        public Boolean SubAccount;
        public ParentRef ParentRef;
        public String FullyQualifiedName;
        public Boolean Active;
        public String Classification;
        public String AccountType;
        public String AccountSubType;
        public String AcctNum;
        public Decimal CurrentBalance;
        public Decimal CurrentBalanceWithSubAccounts;
        public CurrencyRef CurrencyRef;
        public String domain;
        public Boolean sparse;
        public String Id;
        public String SyncToken;
        public MetaData MetaData;
    }

    public class ParentRef {
        public String value;
    }

    public class CurrencyRef {
        public String value;
        public String name;
    }

    public class MetaData {
        public String CreateTime;
        public String LastUpdatedTime;
    }

    public QueryResponse QueryResponse;
    
    public class QueryResponse {
        public Integer startPosition;
        public Integer maxResults;
        public List<Account> Account;
        public Integer totalCount;
    }

    // Static method to parse the JSON response
    public static QBAccountResponseJSON parse(String json) {
        return (QBAccountResponseJSON) System.JSON.deserialize(json, QBAccountResponseJSON.class);
    }
}