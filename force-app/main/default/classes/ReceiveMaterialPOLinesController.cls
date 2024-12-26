public with sharing class ReceiveMaterialPOLinesController {

    @auraEnabled
    public static List<Map<String, String>> getPicklistValues(String objectApiName, String fieldApiName) {
        List<Map<String, String>> picklistValues = new List<Map<String, String>>();
        
        try {
            // Get the describe result for the object
            Schema.SObjectType objectType = Schema.getGlobalDescribe().get(objectApiName);
            if (objectType == null) {
                throw new IllegalArgumentException('Invalid object API name: ' + objectApiName);
            }

            // Get the describe result for the fields
            Map<String, Schema.SObjectField> fieldMap = objectType.getDescribe().fields.getMap();
            Schema.SObjectField field = fieldMap.get(fieldApiName);
            if (field == null) {
                throw new IllegalArgumentException('Invalid field API name: ' + fieldApiName);
            }

            // Check if the field is a picklist
            Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
            if (fieldDescribe.getType() == Schema.DisplayType.Picklist) {
                // Retrieve active picklist values
                for (Schema.PicklistEntry entry : fieldDescribe.getPicklistValues()) {
                    if (entry.isActive()) { // Check if the picklist value is active
                        Map<String, String> picklistEntry = new Map<String, String>();
                        picklistEntry.put('label', entry.getLabel());
                        picklistEntry.put('value', entry.getValue());
                        picklistValues.add(picklistEntry);
                    }
                }
            } else {
                throw new IllegalArgumentException('Field is not a picklist: ' + fieldApiName);
            }
        } catch (Exception e) {
            System.debug('Error retrieving picklist values: ' + e.getMessage());
        }
        return picklistValues;
    }
    
    @auraEnabled
    public static list<buildertek__Purchase_Order_Item__c> getProducts(String recordId)
    {
        //system.debug(recordId);
        list<buildertek__Purchase_Order_Item__c> Products =[select id,Name,buildertek__Purchase_Order__c, buildertek__Purchase_Order__r.buildertek__Project__c, buildertek__Ready_to_Ship__c, buildertek__Product__r.Name,buildertek__Product__r.Id,buildertek__Product__c,buildertek__Quantity__c, buildertek__Quantity_Remaining__c, buildertek__Quantity_Received__c from buildertek__Purchase_Order_Item__c WHERE buildertek__Purchase_Order__c =:recordId];
        for(buildertek__Purchase_Order_Item__c p: Products){
            if(p.buildertek__Ready_to_Ship__c == null){
                p.buildertek__Ready_to_Ship__c = 0;
            }
        }
        system.debug(Products);
        return Products;
    }

    @auraEnabled
    public static boolean checkforCOInvoice(String recordId) {
        List<buildertek__Account_Payable__c> invoices = [SELECT Id, buildertek__Purchase_Order__c FROM buildertek__Account_Payable__c WHERE buildertek__Purchase_Order__c = :recordId];
        if(invoices.size() > 0){
            return true;
        }
        return false;
    }

    @auraEnabled
    public static boolean deleteDocument(String ContentDocumentId){
        List<ContentDocument> cd = [SELECT Id FROM ContentDocument WHERE Id =: ContentDocumentId];
        system.debug(cd);
        if(cd.size() >= 0){
            delete cd;
        }
        return true;
    }
    

    @auraEnabled
    public static string addProductsCorrection(String ProductsList){
        try{
            List<buildertek__Purchase_Order_Item__c> updatedItems = (List<buildertek__Purchase_Order_Item__c>)JSON.deserialize(ProductsList, List<buildertek__Purchase_Order_Item__c>.class);
            System.debug(updatedItems);

            //make the set of the polineids
            Set<Id> polineIds = new Set<Id>();
            for(buildertek__Purchase_Order_Item__c p: updatedItems){
                polineIds.add(p.Id);
            }
    
            if(updatedItems != null){
                update updatedItems;
                return 'Success';
            }else{
                return 'Failed';
            }
        }catch(Exception e){
            return e.getMessage();
        }
    }
    
    @auraEnabled
    public static string addProducts(String ProductsList , List<String> productId){
        try{
            //   list<Product2> prod = [select Id from Product2 where Id IN:= POItems ];
            // system.debug('workinggggg' + productId);
            boolean flag = false;
            Decimal old_quantity_recieved = 0;
            
            system.debug('productsKist'+ ProductsList);
            List<String> selectedProdIds = new List<String>();
            list<RfqDataTableWrapper> newProductList = (list<RfqDataTableWrapper>)JSON.deserialize(ProductsList, list<RfqDataTableWrapper>.class);
            List<buildertek__Inventory_Tracking__c> invTrackList= new List<buildertek__Inventory_Tracking__c>();
            Map<Id, List<string>> POLinetoCdId = new map<Id, List<string>>();
            
            //iterate over list and store the polineid in a list
            System.debug(newProductList);
            List<Id> polineIds = new List<Id>();
            Map <Id, Integer> polineMap = new Map<Id, Integer>();
            Map<Id, Integer> polineMap2 = new Map<Id, Integer>();
            Map<Id, String> polineMap3 = new Map<Id, String>();
            for(RfqDataTableWrapper p: newProductList){
                polineIds.add(p.polineId);
                if(p.ContentDocumnetIdList != null){
                    POLinetoCdId.put(p.polineId, p.ContentDocumnetIdList);
                }
                polineMap.put(p.polineId, p.quantity_recieved);
                polineMap2.put(p.polineId, p.readytoship);
                polineMap3.put(p.polineId, p.locationReceived);
            }
            System.debug(POLinetoCdId);
            //System.debug(polineIds);
            List<buildertek__Purchase_Order_Item__c> polineList = [Select Id ,Name, buildertek__Purchase_Order__c, buildertek__Purchase_Order__r.buildertek__Project__c, buildertek__Product__c,buildertek__Item_Name__c,buildertek__Quantity_Received__c,buildertek__Product__r.buildertek__Available_Quantity__c,buildertek__Quantity_Remaining__c FROM buildertek__Purchase_Order_Item__c WHERE Id IN:polineIds];
            System.debug(polineList);
            for(buildertek__Purchase_Order_Item__c poline: polineList){
                if(polineMap.get(poline.Id) != null){
                    //ready to ship
                    poline.buildertek__Location_Delivered2__c = polineMap3.get(poline.Id);
                    poline.buildertek__Ready_to_Ship__c = polineMap2.get(poline.Id);
                    if(poline.buildertek__Quantity_Remaining__c - polineMap.get(poline.Id) >= 0){
                        if(poline.buildertek__Quantity_Received__c == null){
                            poline.buildertek__Quantity_Received__c = polineMap.get(poline.Id);
                            flag = true;
                        }
                        else if(poline.buildertek__Quantity_Received__c != null){
                            old_quantity_recieved = poline.buildertek__Quantity_Received__c;
                            poline.buildertek__Quantity_Received__c = poline.buildertek__Quantity_Received__c + polineMap.get(poline.Id);
                        }
                    }
                }else{
                    return 'Quantity Received cannot be greater than Quantity Remaining';
                }
                System.debug('poline: ' + poline);
                System.debug('poline.Name: ' + poline.Name);
                System.debug('poline.buildertek__Quantity_Received__c: ' + poline.buildertek__Quantity_Received__c);
            }
            System.debug(polineList);
            update polineList;
        
            
            
            if (newProductList != null)
            {
                System.debug(newProductList);
                for(RfqDataTableWrapper p: newProductList){
                    selectedProdIds.add(p.prodId);
                    
                }
                List<Product2> newProdListToUpdate = new List<Product2>();
                Map<String,Decimal> prodMap = new Map<String,Decimal>();
                Decimal quant = 0;
                for(RfqDataTableWrapper newProd : newProductList){
                    //prodMap.put(newProd.prodId, newProd.quantity_recieved);
                    if(prodMap.containsKey(newProd.prodId)){
                        quant = prodMap.get(newProd.prodId);
                        System.debug(quant+ 'quant');
                        if(quant != null){
                            quant = quant+newProd.quantity_recieved;
                        }else{
                            quant = newProd.quantity_recieved;
                        }
                         prodMap.put(newProd.prodId, quant);
                    }else{
                        prodMap.put(newProd.prodId, newProd.quantity_recieved);
                    }
                    //newProdListToUpdate.add(prodItem);
                }
                List<Product2> prodListToUpdate = [Select Id,buildertek__Available_Quantity__c FROM Product2 WHERE Id IN:productId];
        
                System.debug('prodMap.keySet()::::::::::' + prodMap.keySet());
                for(Product2 prod:prodListToUpdate){
        
                    Product2 prodItem = new Product2();
                    prodItem.Id = prod.Id;
                    System.debug(prod.buildertek__Available_Quantity__c);
                    System.debug(prodMap.get(prod.Id));
        
                    if(prod.buildertek__Available_Quantity__c!= null && prodMap.get(prod.Id)!= null){
                        prodItem.buildertek__Available_Quantity__c =prod.buildertek__Available_Quantity__c+ prodMap.get(prod.Id);
                    }else if(prod.buildertek__Available_Quantity__c == null && prodMap.get(prod.Id)!= null){
                        prodItem.buildertek__Available_Quantity__c = prodMap.get(prod.Id);
                    }
                    System.debug(prodItem.buildertek__Available_Quantity__c);
        
                    system.debug(prodMap.get(prod.Id));
                    newProdListToUpdate.add(prodItem);
                    
        
                }
                // update newProdListToUpdate;
                
                system.debug(newProdListToUpdate);
        
                for(buildertek__Purchase_Order_Item__c poline: polineList){
                    buildertek__Inventory_Tracking__c  invTrack= new buildertek__Inventory_Tracking__c();
                    invTrack.buildertek__Date_Received__c= Date.today();
                    if(flag){
                        invTrack.buildertek__Old_Quantity__c= 0;
                    }else{
                        invTrack.buildertek__Old_Quantity__c= old_quantity_recieved;
                    }
                    invTrack.buildertek__New_Quantity__c= poline.buildertek__Quantity_Received__c;
                    invTrack.buildertek__Product__c= poline.buildertek__Product__c;
                    invTrack.buildertek__Description__c= poline.buildertek__Item_Name__c;
                    invTrack.buildertek__BT_Purchase_Order_Line__c= poline.Id;
                    invTrack.buildertek__Purchase_Order__c= poline.buildertek__Purchase_Order__c;
                    invTrackList.add(invTrack);
        
                }
                if(invTrackList.size() > 0){
                    System.debug('invTrackList' + invTrackList);
                    insert invTrackList;
                }
        
                //create a map of polineid and inventory tracking id
                Map<Id, Id> POLinetoInvTrackId = new map<Id, Id>();
                for(buildertek__Inventory_Tracking__c invTrack: invTrackList){
                    POLinetoInvTrackId.put(invTrack.buildertek__BT_Purchase_Order_Line__c, invTrack.Id);
                }
                System.debug('POLinetoInvTrackId' + POLinetoInvTrackId);
        
                
                Map<Id, Id> ContentDocumentIdtoInvTrackId = new map<Id, Id>();
                for(Id polineId : POLinetoCdId.keySet()){
                   List<Id> cdIdList = POLinetoCdId.get(polineId);
                   Id invTrackId = POLinetoInvTrackId.get(polineId);
                    for(Id cdId : cdIdList){
                         ContentDocumentIdtoInvTrackId.put(cdId, invTrackId);
                    }
                }
                System.debug('ContentDocumentIdtoInvTrackId' + ContentDocumentIdtoInvTrackId);
                
                String RecrecordTypeId = [SELECT Id FROM RecordType WHERE SObjectType = 'buildertek__Inventory_Management__c' AND Name = 'Received'].Id;
                String ConrecordTypeId = [SELECT Id FROM RecordType WHERE SObjectType = 'buildertek__Inventory_Management__c' and Name = 'Consumed'].Id;


                List<buildertek__Inventory_Management__c> invMgmtList = new List<buildertek__Inventory_Management__c>();

                for(buildertek__Purchase_Order_Item__c poline: polineList){
                    buildertek__Inventory_Management__c invMgmt = new buildertek__Inventory_Management__c();
                    invMgmt.buildertek__Date_Material_Received__c = Date.today();
                    if(flag){
                        // invMgmt.buildertek__Initial_Stock__c = 0;
                    }else{
                        // invMgmt.buildertek__Initial_Stock__c = old_quantity_recieved;
                    }
                    invMgmt.buildertek__Received_Stock__c = polineMap.get(poline.Id);
                    invMgmt.buildertek__Product_Name__c = poline.buildertek__Product__c;
                    invMgmt.buildertek__BT_Purchase_Order_Line__c = poline.Id;
                    invMgmt.buildertek__Project__c = poline.buildertek__Purchase_Order__r.buildertek__Project__c;
                    if(polineMap3.get(poline.Id) == 'Job Site'){
                        // invMgmt.buildertek__Action__c = 'Consumed';
                        invMgmt.RecordTypeId = ConrecordTypeId;
                        invMgmt.buildertek__Location_Received__c = polineMap3.get(poline.Id);
                    }else{
                        invMgmt.buildertek__Action__c = 'Received';
                        invMgmt.buildertek__Location_Received__c = polineMap3.get(poline.Id);
                        invMgmt.RecordTypeId = RecrecordTypeId;
                    }
                    invMgmtList.add(invMgmt);
                }

                if(invMgmtList.size() > 0){
                    System.debug('invMgmtList' + invMgmtList);
                    insert invMgmtList;
                }
        
                
                
        
                //create a contentdocumentlink list
                List<ContentDocumentLink> cdlList = new List<ContentDocumentLink>();
                for(Id cdId : ContentDocumentIdtoInvTrackId.keySet()){
                    ContentDocumentLink cdl = new ContentDocumentLink();
                    cdl.ContentDocumentId = cdId;
                    cdl.LinkedEntityId = ContentDocumentIdtoInvTrackId.get(cdId);
                    cdl.ShareType = 'V';
                    cdlList.add(cdl);
                }
                System.debug('cdlList' + cdlList);
                if(cdlList.size() > 0){
                    insert cdlList;
                }
        
                return 'Success';
            }

            return 'Success';

        }catch(Exception e){
            return e.getMessage();
        }
        
    }
    

    //addInventoryManagement
    @auraEnabled
    public static string addInventoryManagement(String ProductsList){
        try{
            System.debug(ProductsList);
            List<RecordType> lstRecordType = [SELECT Id, Name FROM RecordType WHERE SObjectType = 'buildertek__Inventory_Management__c'];
            Map<String, Id> mapRecordType = new Map<String, Id>();
            for(RecordType objRecordType : lstRecordType){
                mapRecordType.put(objRecordType.Name, objRecordType.Id);
            }
            List<buildertek__Inventory_Management__c> invMgmtList = (List<buildertek__Inventory_Management__c>)JSON.deserialize(ProductsList, List<buildertek__Inventory_Management__c>.class);
            for(buildertek__Inventory_Management__c invMgmt: invMgmtList){
                invMgmt.buildertek__Date_Material_Received__c = Date.today();
                if(invMgmt.buildertek__Action__c == 'Returned'){
                    invMgmt.RecordTypeId = mapRecordType.get('Returned');
                }
            }
            System.debug(invMgmtList);
            if(invMgmtList != null){
                insert invMgmtList;
                return 'Success';
            }else{
                return 'Failed';
            }
        }catch(Exception e){
            return e.getMessage();
        }
    }
    
    
 public class RfqDataTableWrapper{

        @AuraEnabled
        public String locationReceived{ get; set; }
      
        @AuraEnabled
        public Integer quantity_recieved{ get; set; }
        
        @AuraEnabled
        public Id prodId{ get; set; }

        @AuraEnabled
        public Id polineId{ get; set;}

        @AuraEnabled
        public List<String> ContentDocumnetIdList { get; set; }

        @AuraEnabled
        public Integer readytoship{ get; set; }
    }
}