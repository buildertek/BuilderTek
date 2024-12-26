global class MyBatchClass implements Database.batchable<sObject>, Database.Stateful{

    global String ObjectName ;
    global String pricebookId;
    global String productFamily;

    global MyBatchClass(String ObjectName,  String pricebookId, String productFamily){
        this.ObjectName=ObjectName;
        this.pricebookId=pricebookId;
        this.productFamily=productFamily;

        
    }
    public Database.QueryLocator start(Database.BatchableContext context) {
        // Fetch the records from the database.
        list<pricebookEntry> pricebookEntryList;
        list<string> ProdIds = new list<string>();
        

        if (ObjectName == 'Product2' && pricebookId != null && productFamily !=null){
            pricebookEntryList= [SELECT Id, Pricebook2Id, Product2Id , Product2.family FROM PricebookEntry where Pricebook2Id=:pricebookId AND  toLabel(product2.family) = :productFamily];
        }else{
            pricebookEntryList= [SELECT Id, Pricebook2Id, Product2Id , Product2.family FROM PricebookEntry where Pricebook2Id=:pricebookId AND  toLabel(product2.family) =null];
        }
        for (pricebookEntry pricebookEntry : pricebookEntryList){
            if(pricebookEntry.Product2Id !=null){

                ProdIds.add(pricebookEntry.Product2Id);
            }
        }
        // List<Product2> productList=[Select Id, Name From Product2 where Id=:ProdIds];
        String query='Select Id, Name From Product2 WHERE Id In:ProdIds';
        return Database.getQueryLocator(query);

    }

    public void execute(Database.BatchableContext context, List<sObject> records) {
        // Iterate over the records and pass them to another Apex class.
        // for (sObject record : records) {
        //     // System.debug(records);
        //     // Pass the record to the other Apex class.
        //     QuoteDAO.test(record);
        // }
    }

    public void finish(Database.BatchableContext context) {
        // Do any cleanup.
    }

}