public with sharing class DTForWalkThroughLineController {

    @AuraEnabled
    public static List<buildertek__Walk_Through_Line_Items__c> fetchWalkthroughLineData(String wtRecordId, String categoryId){
        String queryString = 'SELECT Id';
        List<buildertek__Walk_Through_Line_Items__c> accList = new List<buildertek__Walk_Through_Line_Items__c>();

        for(Schema.FieldSetMember fld :SObjectType.buildertek__Walk_Through_Line_Items__c.FieldSets.buildertek__NewfromParent.getFields()) {
            queryString += ', ' + fld.getFieldPath();
        }

        queryString += ' FROM buildertek__Walk_Through_Line_Items__c WHERE buildertek__Walk_Through_List__c =: wtRecordId AND buildertek__BT_Category__c =: categoryId';
         
        acclist = Database.query(queryString);
        return acclist;
    }

    @AuraEnabled(cacheable=true)
    public static String getFieldSetValues(String sObjectName, String fieldSetName) {
        try {
            String result = '';
            List<String> pickListValuesList = new List<String>();
            Schema.SObjectType objToken = Schema.getGlobalDescribe().get(sObjectName);
            Schema.DescribeSObjectResult d = objToken.getDescribe();
            Map<String, Schema.FieldSet> FsMap = d.fieldSets.getMap();
            if (FsMap.containsKey(fieldSetName)) {
                for (Schema.FieldSetMember f : FsMap.get(fieldSetName).getFields()) {
                    if (result != '') {
                        result += ',';
                    }
                    String jsonPart = '{';
                    jsonPart += '"label":"' + (f.getLabel()) + '",';
                    jsonPart += '"required":"' + (f.getDBRequired() || f.getRequired()) + '",';
                    jsonPart += '"type":"' + (f.getType()) + '",';
                    jsonPart += '"name":"' + f.getFieldPath() + '",';
                    
                    // Check if the field is editable and include in JSON
                    Schema.DescribeFieldResult fieldDescribe = objToken.getDescribe().fields.getMap().get(f.getFieldPath()).getDescribe();
                    jsonPart += '"editable":"' + fieldDescribe.isUpdateable() + '"';

                    if (String.valueOf(f.getType()) == 'PICKLIST') {
                        pickListValuesList = getDropDown(sObjectName, String.valueOf(f.getFieldPath()));
                        jsonPart += ',"pickListValuesList":' + JSON.serialize(pickListValuesList);
                    }
                    jsonPart += '}';
                    result += jsonPart;

                }
            }

            return '[' + result + ']';

        } catch (Exception e) {
            System.debug('Error ..' + e.getMessage() + '\n' + e +'\n Exception line no : '+ e.getLineNumber() +'--->'+ e.getStackTraceString());
            return e.getMessage();
        }
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

    // public class responseWrapper{
    //     @AuraEnabled Public String state;
    //     @AuraEnabled Public String FieldSetValues;
    //     @AuraEnabled Public String returnMessage;
    // }
}