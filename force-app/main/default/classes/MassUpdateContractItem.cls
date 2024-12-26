public with sharing class MassUpdateContractItem {
    @AuraEnabled
    public static Map<String, Object> fetchDataAndFieldSetValues(String RecordId, String sObjectName, String fieldSetName) {
        Map<String, Object> result = new Map<String, Object>();
        try {
            Set<String> queryFields = new Set<String>();
            List<Map<String, Object>> fieldSetValues = new List<Map<String, Object>>();
            Schema.SObjectType objToken = Schema.getGlobalDescribe().get(sObjectName);
            Schema.DescribeSObjectResult d = objToken.getDescribe();
            Map<String, Schema.FieldSet> FsMap = d.fieldSets.getMap();
            Map<String, Schema.SObjectField> mapFields = d.fields.getMap();

            // Include fields from the field set if not already included as required fields
            if (FsMap.containsKey(fieldSetName)) {
                for (Schema.FieldSetMember f : FsMap.get(fieldSetName).getFields()) {
                    String fieldPath = f.getFieldPath();
                    if (!queryFields.contains(fieldPath)) {
                        Map<String, Object> fieldData = new Map<String, Object>();
                        fieldData.put('label', f.getLabel());
                        fieldData.put('required', f.getDBRequired() || f.getRequired());
                        fieldData.put('type', String.valueOf(f.getType().name()));
                        fieldData.put('name', fieldPath);
                        queryFields.add(fieldPath);

                        Schema.DescribeFieldResult fieldDescribe = mapFields.get(fieldPath).getDescribe();
                        fieldData.put('editable', fieldDescribe.isUpdateable());

                        if (String.valueOf(f.getType()) == 'PICKLIST') {
                            List<String> pickListValuesList = getDropDown(sObjectName, fieldPath);
                            fieldData.put('pickListValuesList', pickListValuesList);
                        }
                        fieldSetValues.add(fieldData);
                    }
                }
            }

            String QueryString = 'SELECT ' + String.join(new List<String>(queryFields), ', ');
            System.debug(QueryString);

            // check if group is already present in fieldset or not because we need it in aura anyway
            if(!QueryString.contains('buildertek__Contract_Item_Group__c')){
                QueryString += ', buildertek__Contract_Item_Group__c, buildertek__Contract_Item_Group__r.Name'; 
            } else{
                QueryString += ', buildertek__Contract_Item_Group__r.Name';
            }
                
            QueryString += ', buildertek__Contract__r.Name FROM ' + sObjectName + ' WHERE buildertek__Contract__c = \'' + RecordId + '\' ORDER BY buildertek__Contract_Item_Group__r.buildertek__Sort_Id__c NULLS Last, buildertek__Contract_Item_Group__r.Name, Name ASC';

            result.put('FieldSetValues', fieldSetValues);
            System.debug(QueryString);
            result.put('contractItemList', Database.query(QueryString));
            
            List<buildertek__Contract_Line_Group__c> groupingList = [SELECT Id, Name FROM buildertek__Contract_Line_Group__c ORDER BY Name];
            result.put('ContractItemGroupList', groupingList);
        } catch (Exception e) {
            System.debug('Error...' + e.getMessage() + '\n' + e +'\n Exception line no : '+ e.getLineNumber() +'--->'+ e.getStackTraceString());
            BT_ExceptionHandler.Store_Exception(e);
            result.put('Error', e.getMessage());
        }
        return result;
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
    public static string updateContractItemsList(List<buildertek__Contract_Item__c> updateContractItems) {
        try {
            for(buildertek__Contract_Item__c conItem: updateContractItems){
                if (conItem.Name != null && conItem.Name.length() > 79){
                    conItem.Name = conItem.Name.left(78);
                } else{
                    conItem.Name = conItem.Name;
                }
            }
            if (!updateContractItems.isEmpty()) {
                update updateContractItems;
            }
            return 'Success';
        } catch (Exception e) {
            System.debug('Error updating contract items: ' + e.getMessage());
            return e.getMessage();
        }
    }

    @AuraEnabled
    public static buildertek__Quote_Line_Group__c getNoGroupingData() {
        try {
            buildertek__Quote_Line_Group__c noGrouping = [SELECT Id, Name FROM buildertek__Quote_Line_Group__c WHERE Name = 'No Grouping' LIMIT 1];
            return noGrouping;
        } catch (Exception e) {
            System.debug('Error in getNoGroupingData: ' + e.getMessage());
            return null;
        }
    }
}