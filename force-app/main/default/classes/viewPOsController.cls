public without sharing class viewPOsController {
    public viewPOsController() {

    }

    @AuraEnabled(cacheable=true)
    public static List<buildertek__Purchase_Order__c> getPurchaseOrdersd(
        String poNumberSearch, 
        String projectSearch, 
        String vendorSearch, 
        String costCodeSearch,
        String statusSearch,
        String descriptionSearch

    ) {
        String query = 'SELECT Id, Name, buildertek__Project__c, buildertek__Project__r.Name, ' +
                    'buildertek__Vendor__c, buildertek__Vendor__r.Name, ' +
                    'buildertek__Cost_Code__c, buildertek__Cost_Code__r.buildertek__Cost_Code_Name__c, ' +
                    'buildertek__Description__c, buildertek__Status__c, buildertek__PO_Total__c ' +
                    'FROM buildertek__Purchase_Order__c ' +
                    'WHERE Id != null';

        if (String.isNotBlank(poNumberSearch)) {
            query += ' AND Name LIKE \'%' + String.escapeSingleQuotes(poNumberSearch) + '%\'';
        }

        if (String.isNotBlank(projectSearch)) {
            query += ' AND buildertek__Project__r.Name LIKE \'%' + String.escapeSingleQuotes(projectSearch) + '%\'';
        }

        if (String.isNotBlank(vendorSearch)) {
            query += ' AND buildertek__Vendor__r.Name LIKE \'%' + String.escapeSingleQuotes(vendorSearch) + '%\'';
        }

        if (String.isNotBlank(costCodeSearch)) {
            query += ' AND buildertek__Cost_Code__r.buildertek__Cost_Code_Name__c LIKE \'%' + String.escapeSingleQuotes(costCodeSearch) + '%\'';
        }

        if (String.isNotBlank(statusSearch)) {
            query += ' AND buildertek__Status__c = \'' + String.escapeSingleQuotes(statusSearch) + '\'';
        }

        if (String.isNotBlank(descriptionSearch)) {
            query += ' AND buildertek__Description__c LIKE \'%' + String.escapeSingleQuotes(descriptionSearch) + '%\'';
        }

        query += ' ORDER BY buildertek__Vendor__r.Name ASC NULLS LAST, Name DESC, buildertek__Project__r.Name ASC NULLS LAST';

        System.debug('Query: ' + query);

        return Database.query(query);
    }
    
    @AuraEnabled
    public static List<Map<String, String>> getPicklistValues(String objectApiName, String fieldApiName) {
        List<Map<String, String>> picklistValues = new List<Map<String, String>>();

        try {
            // Describe the object
            Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectApiName);
            if (sObjectType == null) {
                throw new IllegalArgumentException('Object API Name is invalid: ' + objectApiName);
            }

            // Get the field describe
            Map<String, Schema.SObjectField> fieldMap = sObjectType.getDescribe().fields.getMap();
            if (!fieldMap.containsKey(fieldApiName)) {
                throw new IllegalArgumentException('Field API Name is invalid: ' + fieldApiName);
            }

            Schema.SObjectField field = fieldMap.get(fieldApiName);
            Schema.DescribeFieldResult fieldDescribe = field.getDescribe();

            // Check if the field is a picklist
            if (fieldDescribe.getType() != Schema.DisplayType.Picklist) {
                throw new IllegalArgumentException('Field is not a picklist: ' + fieldApiName);
            }

            // Retrieve the picklist values
            for (Schema.PicklistEntry entry : fieldDescribe.getPicklistValues()) {
                Map<String, String> picklistEntry = new Map<String, String>();
                picklistEntry.put('label', entry.getLabel());
                picklistEntry.put('value', entry.getValue());
                picklistValues.add(picklistEntry);
            }
        } catch (Exception e) {
            System.debug('Error retrieving picklist values: ' + e.getMessage());
            throw e;
        }

        return picklistValues;
    }

    @AuraEnabled
    public static List<buildertek__Purchase_Order_Item__c> getPOLineItems(String purchaseOrderId) {
        return [
            SELECT 
                Id, 
                Name, 
                buildertek__Quantity__c, 
                buildertek__Unit_Price__c, 
                buildertek__Tax__c, 
                buildertek__Total_Amount_Tax__c 
            FROM buildertek__Purchase_Order_Item__c 
            WHERE buildertek__Purchase_Order__c = :purchaseOrderId 
            ORDER BY Name ASC
        ];
    }


}