public class QBAccountJSON {
    public Account Acc;  // This field will represent the account
    public QueryResponse QueryResponse;

    // Constructor
    public QBAccountJSON() {}

    // Account class to hold the account details
    public class Account {
        public String Name;
        public Boolean SubAccount;
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

        // Constructor
        public Account() {}
    }

    public class CurrencyRef {
        public String value;
        public String name;

        // Constructor
        public CurrencyRef(String value, String name) {
            this.value = value;
            this.name = name;
        }
    }

    public class MetaData {
        public String CreateTime;
        public String LastUpdatedTime;

        // Constructor
        public MetaData(String CreateTime, String LastUpdatedTime) {
            this.CreateTime = CreateTime;
            this.LastUpdatedTime = LastUpdatedTime;
        }
    }

    // Method to parse JSON string into QBAccountJSON object
    public static QBAccountJSON parse(String json) {
        return (QBAccountJSON) System.JSON.deserialize(json, QBAccountJSON.class);
    }

    public class QueryResponse{
		public list<Account> Account;
		public Integer maxResults;
		public Integer startPosition;
	}


}