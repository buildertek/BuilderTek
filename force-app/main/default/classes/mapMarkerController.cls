public with sharing class mapMarkerController {
    
    @AuraEnabled(cacheable=true)
    public static List<buildertek__Project__c> fetchProject() {
        return [SELECT Id, Name, buildertek__Address__c, buildertek__City__c, buildertek__State__c, buildertek__Zip__c, buildertek__Country__c, buildertek__City_Text__c FROM buildertek__Project__c WHERE buildertek__City_Text__c != null AND buildertek__Country__c != null ORDER BY Name];
    }
}