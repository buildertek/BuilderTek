public class MyBatchJob implements Database.Batchable<SObject> {

     private String objName;
     private String pricebook;
     private String family;


    public MyBatchJob(String objectName , String pricebookId, String productFamily) {
        objName = objectName;
        pricebook = pricebookId;
        family = productFamily;
    }


    public Database.QueryLocator start(Database.BatchableContext context) {
        // Define your query locator logic here
         list<pricebookEntry> pricebookEntryList;
        list<string> ProdIds = new list<string>();
        if (objName == 'Product2' && pricebook != null && family !=null){
            pricebookEntryList= [SELECT Id, Pricebook2Id, Product2Id , Product2.family FROM PricebookEntry where Pricebook2Id=:pricebook AND  toLabel(product2.family) = :family];
        }else{
            pricebookEntryList= [SELECT Id, Pricebook2Id, Product2Id , Product2.family FROM PricebookEntry where Pricebook2Id=:pricebook AND  toLabel(product2.family) =null];
        }
        for (pricebookEntry pricebookEntry : pricebookEntryList){
            if(pricebookEntry.Product2Id !=null){

                ProdIds.add(pricebookEntry.Product2Id);
            }
        }
        string query ='Select Id, Name From Product2 Where Id=:'+ProdIds;
        return Database.getQueryLocator(query);

    }

    public void execute(Database.BatchableContext context, List<Product2> scope) {
        // Process records in the batch

    }

    public void finish(Database.BatchableContext context) {
        // Finish logic here
    }
}