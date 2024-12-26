public class RFQResponseClass {

    public static String rfqVendorID { get; set; }

    public RFQResponseClass() {
    }
    
   /* @AuraEnabled
    public static RFQResponseClass.allData getallData(Id rfqVen) {
        RFQResponseClass.allData allData = new RFQResponseClass.allData();
        try{
            System.debug('getallmethod ' + rfqVen);
        
            allData.vendorRFQItemColumns = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__RFQ_Vendor_Item__c', 'buildertek__RFQ_vender_filed');
        
            String dynamicQuery = 'SELECT Id, buildertek__RFQ_Item__r.buildertek__Public_Folder__c, buildertek__RFQ_Item__r.buildertek__RFQ_Package__c, ';
            for (BT_Lightning_Utils.dataTableFields field : allData.vendorRFQItemColumns) {
                dynamicQuery += field.fieldName + ', ';
            }
            dynamicQuery = dynamicQuery.removeEnd(', ');
            dynamicQuery += ' FROM buildertek__RFQ_Vendor_Item__c where buildertek__Vendor__c = \'' + rfqVen + '\'';
            System.debug('dynamicQuery:=> ' + dynamicQuery);
            allData.vendorRFQItems = Database.query(dynamicQuery);
        
            String RFQId = '';
        
            if (allData.vendorRFQItems != null || allData.vendorRFQItems.size() != 0) {
                RFQId = allData.vendorRFQItems[0].buildertek__RFQ_Item__r.buildertek__RFQ_Package__c;
            }
        
            System.debug('getallmethod' + rfqVen);
        
            allData.RFQFields = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__RFQ__c', 'buildertek__RFQ_vfPage');
            dynamicQuery = 'SELECT Id, ';
            for (BT_Lightning_Utils.dataTableFields field : allData.RFQFields) {
                if (field.type == 'reference') {
                    dynamicQuery += field.fieldName.removeEnd('__c') + '__r.Name, ';
                } else {
                    dynamicQuery += field.fieldName + ', ';
                }
            }
            dynamicQuery = dynamicQuery.removeEnd(', ');
            dynamicQuery += ' FROM buildertek__RFQ__c where Id = \'' + RFQId + '\'';
            System.debug('dynamicQuery:=> ' + dynamicQuery);
            allData.RFQData = (buildertek__RFQ__c)Database.query(dynamicQuery);
            allData.RFQWrapperId = RFQId;
            allData.Status = 'Success';
        
            return allData;
        }catch(Exception e){
            allData.Status = 'Error: ' + e.getMessage();
            return allData;
        }
}*/

@AuraEnabled
public static RFQResponseClass.allData getallData(Id rfqVen) {
    RFQResponseClass.allData allData = new RFQResponseClass.allData();
    try {
        System.debug('getallmethod ' + rfqVen);
        
        allData.vendorRFQItemColumns = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__RFQ_Vendor_Item__c', 'buildertek__RFQ_vender_filed');
        
        String dynamicQuery = 'SELECT Id, buildertek__RFQ_Item__r.buildertek__Public_Folder__c, buildertek__RFQ_Item__r.buildertek__RFQ_Package__c, ';
        for (BT_Lightning_Utils.dataTableFields field : allData.vendorRFQItemColumns) {
            dynamicQuery += field.fieldName + ', ';
        }
        dynamicQuery = dynamicQuery.removeEnd(', ');
        dynamicQuery += ' FROM buildertek__RFQ_Vendor_Item__c where buildertek__Vendor__c = \'' + rfqVen + '\'';
        System.debug('dynamicQuery:=> ' + dynamicQuery);
        allData.vendorRFQItems = Database.query(dynamicQuery);
        System.debug('allData.vendorRFQItems===========>'+allData.vendorRFQItems);
        String RFQId = '';
        
        if (allData.vendorRFQItems != null && allData.vendorRFQItems.size() > 0) {
            RFQId = allData.vendorRFQItems[0].buildertek__RFQ_Item__r.buildertek__RFQ_Package__c;
        }
        
        System.debug('getallmethod ' + rfqVen);
        
        allData.RFQFields = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__RFQ__c', 'buildertek__RFQ_vfPage');
        
        // Building the JSON structure for the fields
        List<String> fieldJSONList = new List<String>();
        for (BT_Lightning_Utils.dataTableFields field : allData.RFQFields) {
            System.debug('field'+field);
            String fieldJSON = '{';
            fieldJSON += '"label":"' + field.label + '",';
            
            // fieldJSON += '"required":"' + field.required + '",';
            fieldJSON += '"type":"' + field.type + '",';
            fieldJSON += '"name":"' + field.fieldName + '"';
            
            if (field.type == 'reference') {
                fieldJSON += ',"isReference": true';
            } else if (field.type == 'picklist') {
                List<String> pickListValuesList = getDropDown('buildertek__RFQ__c', field.fieldName);
                fieldJSON += ',"pickListValuesList":' + JSON.serialize(pickListValuesList);
            }
            fieldJSON += '}';
            fieldJSONList.add(fieldJSON);
        }
        //allData.RFQFieldJSON = '[' + String.join(fieldJSONList, ',') + ']';
        
        dynamicQuery = 'SELECT Id, ';
        List<Map<String, String>> fieldList = new List<Map<String, String>>();
        for (BT_Lightning_Utils.dataTableFields field : allData.RFQFields) {
            Map<String, String> fieldMap = new Map<String, String>();
            fieldMap.put('label', field.label);
            fieldMap.put('type', field.type);
            fieldMap.put('name', field.fieldName);
            // fieldMap.put('value', field.value);
            // System.debug('value===>',fieldMap.value);
            fieldList.add(fieldMap);
                    if (field.type == 'reference') {
                        dynamicQuery += field.fieldName.removeEnd('__c') + '__r.Name, ';
                    } else {
                        dynamicQuery += field.fieldName + ', ';
                    }

                    System.debug('fieldMap'+fieldMap);
      }
        allData.RFQFieldJSON = JSON.serialize(fieldList);
        dynamicQuery = dynamicQuery.removeEnd(', ');
        dynamicQuery += ' FROM buildertek__RFQ__c where Id = \'' + RFQId + '\'';
        System.debug('dynamicQuery:=> ' + dynamicQuery);
        allData.RFQData = (buildertek__RFQ__c)Database.query(dynamicQuery);
        allData.RFQWrapperId = RFQId;
        System.debug(allData.RFQData);
        // System.debug(RFQData);
        allData.Status = 'Success';
        
        return allData;
    } catch(Exception e) {
        allData.Status = 'Error: ' + e.getMessage();
        return allData;
    }
}

@AuraEnabled
public static List<String> getDropDown(String objName, String fieldName) {
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
    }  catch (Exception e) {
        // Log exceptions and rethrow as AuraHandledException
        List<buildertek__Exception_Log_Store_Option__c> storeExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
        if(!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true){
            BT_ExceptionHandler.Store_Exception(e);
        }
        throw new AuraHandledException(e.getMessage());
    }
    
    return pickListValuesList;
}


@AuraEnabled
public static void saveRFQResponse(List<buildertek__RFQ_Vendor_Item__c> rfqData) {
    System.debug('saveRFQResponse: ' + rfqData);

    if (rfqData != null && !rfqData.isEmpty()) {
        List<buildertek__RFQ_Vendor_Item__c> recordsToUpdate = new List<buildertek__RFQ_Vendor_Item__c>();

        for (buildertek__RFQ_Vendor_Item__c item : rfqData) {
            System.debug('Processing item: ' + item);
            if (item.Id != null) {
                buildertek__RFQ_Vendor_Item__c updatedRecord = new buildertek__RFQ_Vendor_Item__c();
                updatedRecord.Id = item.Id;
                updatedRecord.buildertek__Quantity__c = item.buildertek__Quantity__c;
                updatedRecord.buildertek__Unit_Price__c = item.buildertek__Unit_Price__c;

                recordsToUpdate.add(updatedRecord);
            }
        }

        if (!recordsToUpdate.isEmpty()) {
            update recordsToUpdate;
            System.debug('RFQ Data updated successfully.');
        } else {
            System.debug('No records to update.');
        }
    } else {
        System.debug('No data to save.');
    }
}



        @AuraEnabled
        public static String saveRFQRecord(String RFQData) {
            System.debug('saveRFQRecord'+RFQData);
            try {
             
                List<buildertek__RFQ__c> rfqDetailsList = (List<buildertek__RFQ__c>) JSON.deserialize(RFQData, List<buildertek__RFQ__c>.class);
                System.debug('RFQ Details List (Deserialized): ' + rfqDetailsList);
                
                // Check if the list is populated
                if (rfqDetailsList != null && !rfqDetailsList.isEmpty()) {
                    System.debug('Upserting records: ' + rfqDetailsList);
                    upsert rfqDetailsList; 
                    
                    System.debug('Upsert operation successful');
                    return 'Success';
                } else {
                    System.debug('Deserialized list is null or empty');
                    return 'Error: Deserialized list is null or empty';
                }
            } catch (Exception e) {
                System.debug('Exception during upsert: ' + e.getMessage());
                throw new AuraHandledException('Error processing data: ' + e.getMessage());
            }
        }



        public class allData {
        
            @AuraEnabled
            public List<BT_Lightning_Utils.dataTableFields> vendorRFQItemColumns;
            
            @AuraEnabled
            public List<buildertek__RFQ_Vendor_Item__c> vendorRFQItems;
    
            @AuraEnabled
            public List<BT_Lightning_Utils.dataTableFields> RFQFields;
    
            @AuraEnabled
            public buildertek__RFQ__c RFQData;
    
            @AuraEnabled
            public string Status;
    
            @AuraEnabled
            public String RFQWrapperId; 

            @AuraEnabled
            public String RFQFieldJSON { get; set; }
        }
    
        public class FieldSetObject {
            public String label;
            public String required;
            public String type;
            public String name;
        }
        
    }