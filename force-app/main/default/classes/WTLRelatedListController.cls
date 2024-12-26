public with sharing class WTLRelatedListController {
    @AuraEnabled
    public static List<buildertek__Walk_Through_Line_Items__c> getRelatedRecords() {
        String queryString = 'SELECT Id';
        List<buildertek__Walk_Through_Line_Items__c> accList = new List<buildertek__Walk_Through_Line_Items__c>();

        for(Schema.FieldSetMember fld :SObjectType.buildertek__Walk_Through_Line_Items__c.FieldSets.buildertek__NewfromParent.getFields()) {
            queryString += ', ' + fld.getFieldPath();
        }

        queryString += ' FROM buildertek__Walk_Through_Line_Items__c';
         
        acclist = Database.query(queryString);
        return acclist;
    }
}