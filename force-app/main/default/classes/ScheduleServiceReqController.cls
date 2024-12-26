public with sharing class ScheduleServiceReqController {
    
    @AuraEnabled
    public static boolean checkIncludeWeekend(){
        try{
            buildertek__Admin_Interface_Node_Configuration__c adminInterfaceNodeConfigurations = [SELECT Id, buildertek__Hide_Internal_Resource__c, buildertek__Hide_Contractor__c, buildertek__Hide_Contractor_Resource__c, buildertek__Setting_Description__c, buildertek__Old_Gantt_Chart__c,buildertek__Include_Weekend__c
                    FROM buildertek__Admin_Interface_Node_Configuration__c WHERE Name=:'Schedule Configuration'];

            return adminInterfaceNodeConfigurations.buildertek__Include_Weekend__c;
        }catch(Exception e){
            List<buildertek__Exception_Log_Store_Option__c> StoreExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
            if (!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true) {
                BT_ExceptionHandler.Store_Exception(e);
            }
            return false;
        }
    }
    
    @AuraEnabled
    public static String getFieldSet(String objectName, String fieldSetName){
        String result = '';
        List<String> pickListValuesList = new List<String>();
        try{
            SObjectType objToken = Schema.getGlobalDescribe().get(objectName);
            Schema.DescribeSObjectResult d = objToken.getDescribe();
            Map<String, Schema.FieldSet> FsMap = d.fieldSets.getMap();
            if (FsMap.containsKey(fieldSetName)){
                for (Schema.FieldSetMember f : FsMap.get(fieldSetName).getFields()){
                    if (result != ''){
                        result += ',';
                    }
                    String jsonPart = '{';
                    jsonPart += '"label":"' + f.getLabel()+'",';
                    jsonPart += '"required":"' + (f.getDBRequired() || f.getRequired())+'",';
                    jsonPart += '"type":"' + (f.getType())+'",';
                    jsonPart += '"name":"' + f.getFieldPath()+'"';
                    if (String.valueOf(f.getType()) == 'PICKLIST'){
                        pickListValuesList = getDropDown(objectName, String.valueOf(f.getFieldPath()));
                        jsonPart += ',"pickListValuesList":' + JSON.serialize(pickListValuesList);
                    }
                    jsonPart += '}';
                    result += jsonPart;
                }
            }
            
        } catch (Exception e){
            result += e.getLineNumber()+' : ' + e.getMessage();
            System.debug('Error::' + e.getMessage());
            System.debug('Error At Line::' + e.getLineNumber());
        }
        return '[' + result + ']';
    }

    @AuraEnabled
    public static List<String> getDropDown(String objName, String fieldName){
        List<String> pickListValuesList = new List<String>();
        try{
            Schema.SObjectType s = Schema.getGlobalDescribe().get(objName);
            Schema.DescribeSObjectResult r = s.getDescribe();
            Map<String, Schema.SObjectField> fields = r.fields.getMap();
            Schema.DescribeFieldResult fieldResult = fields.get(fieldName).getDescribe();
            List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
            for (Schema.PicklistEntry pickListVal : ple){
                pickListValuesList.add(pickListVal.getLabel());
            }
        } catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
        return pickListValuesList;
    }

    @AuraEnabled
    public static buildertek__Service_Request__c getServiceRequestData(String recordId){
        buildertek__Service_Request__c serReq;
         if(Schema.sObjectType.buildertek__Service_Request__c.fields.Id.isAccessible() &&
            Schema.sObjectType.buildertek__Service_Request__c.fields.buildertek__Description__c.isAccessible() &&
            Schema.sObjectType.buildertek__Service_Request__c.fields.buildertek__Subject__c.isAccessible() &&
            Schema.sObjectType.buildertek__Service_Request__c.fields.buildertek__Project__c.isAccessible() &&
            Schema.sObjectType.buildertek__Service_Request__c.fields.buildertek__Vendor__c.isAccessible() &&
            Schema.sObjectType.buildertek__Project__c.fields.Name.isAccessible() &&
            Schema.sObjectType.Account.fields.Name.isAccessible() ){

                serReq= [SELECT Id, buildertek__Description__c, buildertek__Subject__c, buildertek__Project__c, buildertek__Project__r.Name,buildertek__Vendor__c,buildertek__Vendor__r.Name FROM buildertek__Service_Request__c WHERE Id =: recordId];
            }
        return serReq;     
    }

    @AuraEnabled
    public static List<ScheduleWrap> getSchedulelist(String recordId){
        buildertek__Service_Request__c serReq;
        if(Schema.sObjectType.buildertek__Service_Request__c.fields.Id.isAccessible() &&
            Schema.sObjectType.buildertek__Service_Request__c.fields.buildertek__Description__c.isAccessible() &&
            Schema.sObjectType.buildertek__Service_Request__c.fields.buildertek__Project__c.isAccessible()){
                serReq= [SELECT Id, buildertek__Description__c, buildertek__Project__c FROM buildertek__Service_Request__c WHERE Id =: recordId]; 
        }
        System.debug('projectId -----> ' + serReq.buildertek__Project__c);

        list<Schedule__c> getSchedulesList;
        if(Schema.sObjectType.Schedule__c.fields.Id.isAccessible() &&
            Schema.sObjectType.Schedule__c.fields.Name.isAccessible()&&
            Schema.sObjectType.Schedule__c.fields.buildertek__Description__c.isAccessible() &&
            Schema.sObjectType.Schedule__c.fields.buildertek__Project__c.isAccessible()){
                getSchedulesList = [SELECT id, Name, buildertek__Description__c FROM Schedule__c WHERE buildertek__Project__c =: serReq.buildertek__Project__c];
        }
        System.debug('getSchedulesList ---------> '+getSchedulesList);

        list<ScheduleWrap> ScheduleWrapList = new list<ScheduleWrap>(); 
        for(Schedule__c sch : getSchedulesList){
            ScheduleWrap ScheduleWrapRec = new ScheduleWrap();
            ScheduleWrapRec.getSchedulesList = sch;
            ScheduleWrapRec.scheduleCheckbox = false;
            ScheduleWrapList.add(ScheduleWrapRec);
        }
        return ScheduleWrapList;    
    }

    @AuraEnabled
    public static  Map<String,String> getPredecessorList(String scheduleId) {
        List<buildertek__Project_Task__c> schduleItemList= [SELECT Id , Name , buildertek__Schedule__c FROM buildertek__Project_Task__c  WHERE buildertek__Schedule__c =: scheduleId];
        Map<String,String> predecessorMap= new Map<String, String>();
        for(buildertek__Project_Task__c scheduleItem: schduleItemList){
            predecessorMap.put(scheduleItem.Id , scheduleItem.Name);
        }
        return predecessorMap;
    }

    @AuraEnabled
    public static List<ScheduleWrap> getProjectSchedules(String projectId){
         list<Schedule__c> getSchedulesList;
        if(Schema.sObjectType.Schedule__c.fields.Id.isAccessible() &&
            Schema.sObjectType.Schedule__c.fields.Name.isAccessible()&&
            Schema.sObjectType.Schedule__c.fields.buildertek__Description__c.isAccessible() &&
            Schema.sObjectType.Schedule__c.fields.buildertek__Project__c.isAccessible()){
            getSchedulesList = [SELECT id, Name, buildertek__Description__c FROM Schedule__c WHERE buildertek__Project__c =: projectId];
         }
        system.debug('getSchedulesList -----------> '+getSchedulesList);
        list<ScheduleWrap> ScheduleWrapList = new list<ScheduleWrap>(); 
        for(Schedule__c sch : getSchedulesList){
            ScheduleWrap ScheduleWrapRec = new ScheduleWrap();
            ScheduleWrapRec.getSchedulesList = sch;
            ScheduleWrapRec.scheduleCheckbox = false;
            ScheduleWrapList.add(ScheduleWrapRec);
        }
        return ScheduleWrapList;
    }

    @AuraEnabled
    public static MessageClass saveData(String allData, String recordId, String scheduleId){
        MessageClass msg = new MessageClass();
        try {
            buildertek__Project_Task__c newRecord = (buildertek__Project_Task__c) JSON.deserialize(allData, buildertek__Project_Task__c.class);
            insert newRecord;

            // buildertek__Service_Request__c serReq = new buildertek__Service_Request__c();
            // serReq.Id = recordId;
            // serReq.buildertek__Schedule__c = scheduleId;
            // serReq.buildertek__Schedule_Item__c = newRecord.Id;
            // update serReq;

            msg.Status = 'Success';
            msg.Message = 'Service Request scheduled successfully';
            msg.RecordId = newRecord.Id;
        } catch (Exception ex) {
            List<buildertek__Exception_Log_Store_Option__c> StoreExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
            if (!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true) {
                BT_ExceptionHandler.Store_Exception(ex);
            }
            msg.Status = 'Failed';
            msg.Message = ex.getMessage();
            msg.RecordId = null;
        }
        return msg; 
    }

    public class MessageClass{
        @AuraEnabled
        public String Status {get; set;}
        @AuraEnabled
        public String Message {get; set;}
        @AuraEnabled
        public Id RecordId {get; set;}
    }

    public class ScheduleWrap{
        @AuraEnabled public boolean scheduleCheckbox;
        @AuraEnabled public Schedule__c getSchedulesList;
    }
}