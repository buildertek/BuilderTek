public with sharing class massUpdateBudgetItem {
    
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

            // if (!queryFields.contains('Name')) {
            //     Schema.DescribeFieldResult nameFieldDescribe = objToken.getDescribe().fields.getMap().get('Name').getDescribe();
            //     Map<String, Object> nameFieldData = new Map<String, Object>();
            //     nameFieldData.put('label', nameFieldDescribe.getLabel());
            //     nameFieldData.put('required', true);
            //     nameFieldData.put('type', String.valueOf(nameFieldDescribe.getType().name()));
            //     nameFieldData.put('name', 'Name');
            //     queryFields.add('Name');
            //     fieldSetValues.add(nameFieldData);
            // }

        String QueryString = 'SELECT ' + String.join(new List<String>(queryFields), ', ') + ', buildertek__Group__c, buildertek__Category__c, buildertek__Group__r.Name, buildertek__budget__r.Name FROM ' + sObjectName + ' WHERE buildertek__budget__c = \'' + RecordId + '\' ORDER BY buildertek__Group__r.buildertek__Sort_Id__c NULLS Last, buildertek__Group__r.Name, Name ASC';

        result.put('FieldSetValues', fieldSetValues);
        List<sObject> budgetItemList = Database.query(QueryString);
        result.put('budgetItemList', budgetItemList);
        
        List<buildertek__Budget_Line_Group__c> groupingList = [SELECT Id, Name FROM buildertek__Budget_Line_Group__c ORDER BY Name];
        result.put('BudgetItemGroupList', groupingList);

        // Set<Id> categoryIds = new Set<Id>();
        // for (sObject item : budgetItemList) {
        //     Id categoryId = (Id) item.get('buildertek__Category__c');
        //     if (categoryId != null) {
        //         categoryIds.add(categoryId);
        //     }
        // }
        // List<buildertek__Category__c> categoryList = new List<buildertek__Category__c>();
        // categoryList = [SELECT Id, Name, buildertek__Order_Id__c FROM buildertek__Category__c WHERE Id IN : categoryIds ORDER BY Name];
        // result.put('categoryList', categoryList);
        
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
    public static string updatebudgetItemsList(List<buildertek__Budget_Item__c> updateBudgetItems) {
        try {
            if (!updateBudgetItems.isEmpty()) {
                List<buildertek__Budget_Item__c> updateBudgetItemsList = new List<buildertek__Budget_Item__c>();
                List<buildertek__Budget_Item__c> insertBudgetItemsList = new List<buildertek__Budget_Item__c>();

                for (buildertek__Budget_Item__c budgetItem : updateBudgetItems) {
                    if (budgetItem.Id != null) {
                        updateBudgetItemsList.add(budgetItem);
                    } else {
                        insertBudgetItemsList.add(budgetItem);
                    }
                }

                if (!updateBudgetItemsList.isEmpty()) {
                    update updateBudgetItemsList;
                }

                if (!insertBudgetItemsList.isEmpty()) {
                    insert insertBudgetItemsList;
                }
                
            }
            return 'Success';
        } catch (Exception e) {
            System.debug('Error updating budget items: ' + e.getMessage());
            return e.getMessage();
        }
    }
    
}