public without sharing class massVoidPOController {

    @AuraEnabled(cacheable=true)
    public static List<buildertek__Purchase_Order__c> getPurchaseOrders(String poNumberSearch, String projectSearch, String vendorSearch, String costCodeSearch, String descriptionSearch) {
        String query = 'SELECT Id, Name, buildertek__Vendor__c, buildertek__Vendor__r.Name, buildertek__Project__c, buildertek__Cost_Code__c, buildertek__Cost_Code__r.buildertek__Cost_Code_Name__c, buildertek__Project__r.Name, buildertek__Status__c, buildertek__PO_Total__c, buildertek__Description__c FROM buildertek__Purchase_Order__c WHERE (buildertek__Status__c = \'Open\' OR buildertek__Status__c = \'Ordered\')';
        
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
        if (String.isNotBlank(descriptionSearch)) {
            query += ' AND buildertek__Description__c LIKE \'%' + String.escapeSingleQuotes(descriptionSearch) + '%\'';
        }
        
        query += ' ORDER BY buildertek__Vendor__r.Name ASC NULLS LAST, Name DESC, buildertek__Project__r.Name ASC NULLS LAST';
        return Database.query(query);
    }

    @AuraEnabled
    public static String getOrgCurrency() {
        return UserInfo.getDefaultCurrency();
    }

    @AuraEnabled
    public static void createVoidPOs(List<Id> recordIds, String voidReason) {
        List<buildertek__Purchase_Order__c> POsToUpdate = new List<buildertek__Purchase_Order__c>();
        List<buildertek__Purchase_Order__c> VoidPOsToCreate = new List<buildertek__Purchase_Order__c>();
        List<buildertek__Purchase_Order_Item__c> POlinesToCreate = new List<buildertek__Purchase_Order_Item__c>();
        Map<Id, buildertek__Purchase_Order__c> originalToVoidPOMap = new Map<Id, buildertek__Purchase_Order__c>();
        
        List<buildertek__Purchase_Order__c> POs = [SELECT Id, Name, buildertek__Vendor__c, buildertek__Project__c, buildertek__Status__c, buildertek__Schedule__c, buildertek__Schedule_Item__c, buildertek__Completion__c, buildertek__Projected_Start_Date__c, buildertek__Projected_Completion_Date__c, buildertek__Void_Reason__c,
                                                    (SELECT Id, Name, buildertek__Unit_Price__c, buildertek__Tax__c, buildertek__Cost_Type__c, 
                                                     buildertek__Cost_Code__c, buildertek__Quantity__c, buildertek__Description__c, buildertek__Product__c FROM buildertek__Purchase_Order_Items__r)
                                                   FROM buildertek__Purchase_Order__c WHERE Id IN :recordIds];
        
        List<RecordType> recordTypes = [SELECT Id, Name FROM RecordType WHERE SobjectType ='buildertek__Purchase_Order__c' and Name = 'Standard'];
        for (buildertek__Purchase_Order__c PO : POs) {
            buildertek__Purchase_Order__c VoidPOtoCreate = PO.clone(false, false, false, false);
            VoidPOtoCreate.buildertek__Old_Purchase_Order__c = PO.Id;
            VoidPOtoCreate.buildertek__Status__c = 'Ordered';
            VoidPOtoCreate.buildertek__Schedule__c = PO.buildertek__Schedule__c;
            VoidPOtoCreate.buildertek__Schedule_Item__c = PO.buildertek__Schedule_Item__c;
            VoidPOtoCreate.buildertek__Completion__c = PO.buildertek__Completion__c;
            VoidPOtoCreate.buildertek__Projected_Start_Date__c = PO.buildertek__Projected_Start_Date__c;
            VoidPOtoCreate.buildertek__Projected_Completion_Date__c = PO.buildertek__Projected_Completion_Date__c;
            VoidPOtoCreate.RecordTypeId = recordTypes[0].Id;
            VoidPOsToCreate.add(VoidPOtoCreate);
            originalToVoidPOMap.put(PO.Id, VoidPOtoCreate);
            
            PO.buildertek__Status__c = 'Canceled';
            PO.buildertek__Schedule__c = null;
            PO.buildertek__Schedule_Item__c = null;
            PO.buildertek__Completion__c = null;
            PO.buildertek__Projected_Start_Date__c = null;
            PO.buildertek__Projected_Completion_Date__c = null;
            PO.buildertek__Void_Reason__c = voidReason;
            POsToUpdate.add(PO);
        }
        
        try {
            insert VoidPOsToCreate;
            
            for (buildertek__Purchase_Order__c voidPO : VoidPOsToCreate) {
                originalToVoidPOMap.get(voidPO.buildertek__Old_Purchase_Order__c).Id = voidPO.Id;
            }
            
            // Update original POs
            for (buildertek__Purchase_Order__c PO : POsToUpdate) {
                PO.buildertek__Voided_PO__c = originalToVoidPOMap.get(PO.Id).Id;
            }
            update POsToUpdate;
            
            // Create PO lines for void POs
            for (buildertek__Purchase_Order__c PO : POs) {
                Id newPOId = originalToVoidPOMap.get(PO.Id).Id;
                for (buildertek__Purchase_Order_Item__c line : PO.buildertek__Purchase_Order_Items__r) {
                    buildertek__Purchase_Order_Item__c POline = line.clone(false, false, false, false);
                    POline.buildertek__Purchase_Order__c = newPOId;
                    POline.buildertek__Unit_Price__c = -(POline.buildertek__Unit_Price__c);
                    POline.buildertek__Tax__c = POline.buildertek__Tax__c;
                    POline.buildertek__Cost_Code__c = POline.buildertek__Cost_Code__c;
                    POline.buildertek__Cost_Type__c = POline.buildertek__Cost_Type__c;
                    POlinesToCreate.add(POline);
                }
            }
            
            if (!POlinesToCreate.isEmpty()) {
                insert POlinesToCreate;
            }
            
            System.debug('Void POs and PO lines created successfully.');
        } catch (Exception e) {
            System.debug('Error in createVoidPOs: ' + e.getMessage() + '\n' + e + '\n Exception line no: ' + e.getLineNumber() + '--->' + e.getStackTraceString());
            BT_ExceptionHandler.Store_Exception(e);
        }
    }
}