public without sharing class BT_NewAssetHistoryController {
    
    @AuraEnabled
public static Map<String, Object> fetchAssetDateoffJob(String assetId) {
    try {
        // Fetch Asset History records
        List<buildertek__Asset_History__c> assetHistoryList = [
            SELECT Id, Name, buildertek__Project__c, buildertek__Project__r.Name,
                   buildertek__Date_on_Job__c, buildertek__Hours_Used__c, 
                   buildertek__Date_off_Job__c, 
                   buildertek__Asset_Manager__r.buildertek__Current_Project__c
            FROM buildertek__Asset_History__c 
            WHERE buildertek__Asset_Manager__c = :assetId 
            ORDER BY CreatedDate DESC
        ];

        // Fetch Asset Manager record
        buildertek__Asset_Manager__c assetManager = [
            SELECT Id, Name, buildertek__Hourly_Rate__c, buildertek__Current_Project__c
            FROM buildertek__Asset_Manager__c 
            WHERE Id = :assetId
            LIMIT 1
        ];

        // Create a map to return both results
        Map<String, Object> resultMap = new Map<String, Object>{
            'assetHistoryList' => assetHistoryList,
            'assetManager' => assetManager
        };

        return resultMap;
    } catch(Exception e) {
        throw new AuraHandledException('Error fetching asset history: ' + e.getMessage());
    }
}
    
    @AuraEnabled
    public static void updateAssetHistory(List<buildertek__Asset_History__c> assetHistoryList){
        try {
            if(assetHistoryList != null && !assetHistoryList.isEmpty()) {
                update assetHistoryList;
            }
        } catch(Exception e) {
            throw new AuraHandledException('Error updating asset history: ' + e.getMessage());
        }
    }
}