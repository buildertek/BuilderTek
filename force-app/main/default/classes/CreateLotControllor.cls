public without sharing class CreateLotControllor {
    @AuraEnabled
    public static buildertek__Community__c getCommunityRec(String recordId){
        buildertek__Community__c communityRec = [SELECT Id, Name, buildertek__Number_of_Lots__c FROM buildertek__Community__c WHERE Id =: recordId];
        return communityRec;
    }

    @AuraEnabled
    public static MessageClass saveData(String allData){
        MessageClass msg = new MessageClass();
        try {
            buildertek__BT_Lots__c newRecord = (buildertek__BT_Lots__c) JSON.deserialize(allData, buildertek__BT_Lots__c.class);
            insert newRecord;
            msg.Status = 'Success';
            msg.Message = 'Lot Item created successfully';
            msg.RecordId = newRecord.Id;
        } catch (Exception ex) {
            BT_ExceptionHandler.Store_Exception(ex);
            msg.Status = 'Failed';
            msg.Message = ex.getMessage();
            msg.RecordId = null;
        }
        return msg; 
    }

    public class MessageClass{
        @AuraEnabled
        public String Status {get;set;}
        @AuraEnabled
        public String Message {get;set;}
        @AuraEnabled
        public Id RecordId {get;set;}
    }
}