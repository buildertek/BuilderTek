public with sharing class QBPMQueryJSON {
    public QueryResponse QueryResponse;
	// public String time;
	public class QueryResponse{
		public list<PaymentMethod> PaymentMethod;
		public Integer maxResults;
		public Integer startPosition;
	}
	public class PaymentMethod{
		public String Id;
		public String Type;
		public Boolean sparse;
		public String Name;
		public Boolean Active;
		public String domain;
		public MetaData MetaData;
		public String SyncToken;
	}
	public class MetaData{
		public String CreateTime;
		public String LastUpdatedTime;
	}

    public static QBPMQueryJSON parse(String json){
		return (QBPMQueryJSON) System.JSON.deserialize(json, QBPMQueryJSON.class);
	}
}