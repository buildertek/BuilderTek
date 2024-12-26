public with sharing class CreateWorkOrder {
    @AuraEnabled
    public static object getWarrantyLines(String recordId){
        List<MasterquoteClass> WarrantyLinesClassList = new List<MasterquoteClass>();
        List<buildertek__Warranty_Item__c> quotesList;
        quotesList = [SELECT Id,
                  Name,buildertek__Warranty__r.Name,
                  buildertek__Description__c,
                  buildertek__Date_Submitted__c,
                  buildertek__Contractor_Account__r.Name
                  FROM buildertek__Warranty_Item__c 
                  WHERE buildertek__Warranty__c = :recordId 
                  AND buildertek__WorkOrder__c = NULL
                  AND buildertek__Contractor_Account__c != NULL
                 ];    
        
        for(buildertek__Warranty_Item__c bud : quotesList){
            MasterquoteClass MasterquotesClassRecord = new MasterquoteClass(); 
            MasterquotesClassRecord.quoteRecord = bud;
            MasterquotesClassRecord.budgetCheck = false;
            WarrantyLinesClassList.add(MasterquotesClassRecord);
        }
        return  WarrantyLinesClassList;                                               
    }
    
    @AuraEnabled
    public static  String createWorkOrder(String warrantyRecId){
        Id warrantyID ;
        WorkOrder WO =new WorkOrder();
        system.debug(warrantyRecId);
        insert WO;
        if(WO.Id != null){
            if(warrantyRecId != null){
                warrantyID = Id.valueOf(warrantyRecId);
                WO.buildertek__Warranty__c = warrantyID;
                buildertek__Warranty__c waranty = [Select Id,Name, buildertek__Project__c FROM buildertek__Warranty__c WHERE Id =: warrantyRecId];
                if(waranty.buildertek__Project__c != null){
                    WO.buildertek__Project__c = waranty.buildertek__Project__c;
                }
                update WO;
            }
        }
        return String.ValueOf(WO.id);
        
    }    
    
    
    @AuraEnabled
    public static MessageClass CreateWorkOrderLines(List<String> budgetIds){
        MessageClass msg = new MessageClass();
        try{
            List<buildertek__Warranty_Item__c> warrantyItems = [SELECT id, Name, buildertek__Auto_Number__c, buildertek__Category__c, buildertek__Contractor_Account__c, buildertek__Contractor_Resource__c, buildertek__Date_Submitted__c, buildertek__Description__c, buildertek__Details__c, buildertek__Internal_Resource__c, buildertek__Location__c, buildertek__Project__c, buildertek__Purchase_Order__c, buildertek__Service_Request__c, buildertek__Status__c, buildertek__Type__c, buildertek__Warranty__c, buildertek__Work_Date__c FROM buildertek__Warranty_Item__c WHERE Id IN: budgetIds AND buildertek__WorkOrder__c = NULL];

            buildertek__Warranty__c waranty = [Select Id,Name, buildertek__Project__c FROM buildertek__Warranty__c WHERE Id =: warrantyItems[0].buildertek__Warranty__c]; 

            System.debug('warrantyItems: ' + warrantyItems);

            Map<Id, List<buildertek__Warranty_Item__c>> warrantiesGroupedByIds = new Map<Id, List<buildertek__Warranty_Item__c>>();
            Set<String> ContractorAccountIds = new Set<String>();

            for (buildertek__Warranty_Item__c wi : warrantyItems) {
                if (wi.buildertek__Contractor_Account__c != null) {
                    ContractorAccountIds.add(wi.buildertek__Contractor_Account__c);
                    if(warrantiesGroupedByIds.containsKey(wi.buildertek__Contractor_Account__c)){
                        warrantiesGroupedByIds.get(wi.buildertek__Contractor_Account__c).add(wi);
                    }else{
                        List<buildertek__Warranty_Item__c> warrantiesLocal = new List<buildertek__Warranty_Item__c>();
                        warrantiesLocal.add(wi);
                        warrantiesGroupedByIds.put(wi.buildertek__Contractor_Account__c, warrantiesLocal);
                    }
                }
            }
            System.debug('warrantiesGroupedByIds: ' + warrantiesGroupedByIds);
            System.debug('ContractorAccountIds: ' + ContractorAccountIds);

            List<WorkOrder> workOrdersToInsert = new List<WorkOrder>();
            for (String ContractorAccountId : ContractorAccountIds) {
                WorkOrder wo = new WorkOrder();
                wo.buildertek__Warranty__c = warrantyItems[0].buildertek__Warranty__c;
                wo.buildertek__Project__c = waranty.buildertek__Project__c;
                wo.buildertek__Vendor_Account__c = ContractorAccountId;
                workOrdersToInsert.add(wo);
            }

            if(workOrdersToInsert.size()>0){
                insert workOrdersToInsert;
            }

            Map<Id,Id> contractorIdToWorkOrderIdMap = new Map<Id,Id>();
            for(WorkOrder wo : workOrdersToInsert){
                contractorIdToWorkOrderIdMap.put(wo.buildertek__Vendor_Account__c,wo.Id);
            }

            List<buildertek__Warranty_Item__c> warrantyItemsToUpdate = new List<buildertek__Warranty_Item__c>();
            List<WorkOrderLineItem> workOrderLineItemToInsert = new List<WorkOrderLineItem>();

            for (buildertek__Warranty_Item__c wi : warrantyItems) {
                wi.buildertek__WorkOrder__c = contractorIdToWorkOrderIdMap.get(wi.buildertek__Contractor_Account__c);
                warrantyItemsToUpdate.add(wi);

                //create WorkOrderLineItem 
                WorkOrderLineItem woLineItem = new WorkOrderLineItem();
                woLineItem.Description = wi.buildertek__Description__c;
                woLineItem.Status = wi.buildertek__Status__c;
                woLineItem.WorkOrderId = contractorIdToWorkOrderIdMap.get(wi.buildertek__Contractor_Account__c);
                workOrderLineItemToInsert.add(woLineItem);
            }
            if(warrantyItemsToUpdate.size()>0){
                update warrantyItemsToUpdate;
            }

            if(workOrderLineItemToInsert.size()>0){
                insert workOrderLineItemToInsert;
            }

            msg.Status = 'Success';
            msg.Message = 'Work Order(s) Created Successfully';

            return msg;
        }catch(Exception exp){
            msg.Status = 'Failed';
            msg.Message = exp.getMessage();  
            return msg;
        }                                             
    }
    
    public class MasterquoteClass{
        @AuraEnabled
        public buildertek__Warranty_Item__c quoteRecord {get;set;}
        @AuraEnabled
        public buildertek__Master_Budget__c masterBudgetRecord {get;set;}
        @AuraEnabled
        public boolean budgetCheck {get;set;}
    }
    
    public class MessageClass{
        @AuraEnabled
        public String Status {get;set;}
        @AuraEnabled
        public string Message {get;set;}
        
    }
}