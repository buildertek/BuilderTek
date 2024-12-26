public class InventoryManagementHandler{
    public static void UniqueProductId(Map<Id,Inventory_Management__c> oldMap,List<Inventory_Management__c> lstIM){
        for(Inventory_Management__c objIM : lstIM){
            if(oldMap != null){
                if(oldMap.get(objIM.Id).Product_Name__c != objIM.Product_Name__c){
                    objIM.Product_Id__c = objIM.Product_Name__c;
                }
            }
            else{
                objIM.Product_Id__c = objIM.Product_Name__c;
            }
        }
    }

    //beforeInsert
    public static void beforeInsert(List<buildertek__Inventory_Management__c> lstIM){
        List<RecordType> lstRecordType = [SELECT Id, Name FROM RecordType WHERE SObjectType = 'buildertek__Inventory_Management__c'];
        Map<Id, String> mapRecordType = new Map<Id, String>();
        for(RecordType objRecordType : lstRecordType){
            mapRecordType.put(objRecordType.Id, objRecordType.Name);
        }

        Set<Id> setProductId = new Set<Id>();
        for(buildertek__Inventory_Management__c objIM : lstIM){
            setProductId.add(objIM.buildertek__Product_Name__c);
        }

        Map<Id,List<buildertek__Inventory_Management__c>> mapProductToIM = new Map<Id,List<buildertek__Inventory_Management__c>>();
        for(buildertek__Inventory_Management__c objIM : lstIM){
            if(mapProductToIM.containsKey(objIM.buildertek__Product_Name__c)){
                mapProductToIM.get(objIM.buildertek__Product_Name__c).add(objIM);
            }
            else{
                List<buildertek__Inventory_Management__c> lst = new List<buildertek__Inventory_Management__c>();
                lst.add(objIM);
                mapProductToIM.put(objIM.buildertek__Product_Name__c,lst);
            }
        }

        List<Product2> lstProduct = [SELECT Id,Name, buildertek__Available_Quantity__c FROM Product2 WHERE Id IN :setProductId];
        Map<Id,Product2> mapProduct = new Map<Id,Product2>();
        for(Product2 objProduct : lstProduct){
            mapProduct.put(objProduct.Id,objProduct);
        }

        for(Product2 objProduct : lstProduct){
            if(mapProductToIM.containsKey(objProduct.Id)){
                List<buildertek__Inventory_Management__c> lst = mapProductToIM.get(objProduct.Id);
                Decimal availableQuantity = objProduct.buildertek__Available_Quantity__c;
                for(buildertek__Inventory_Management__c objIM : lst){
                    objIM.buildertek__Initial_Stock__c = availableQuantity;
                    if(mapRecordType.get(objIM.RecordTypeId) == 'Received'){
                        availableQuantity += objIM.buildertek__Received_Stock__c;
                    }
                    else if(mapRecordType.get(objIM.RecordTypeId) == 'Returned'){
                        availableQuantity -= objIM.buildertek__Returned_Stock__c;
                    }
                }
            }
        }

        // for(buildertek__Inventory_Management__c objIM : lstIM){
        //     if(mapProduct.containsKey(objIM.buildertek__Product_Name__c)){
        //         objIM.buildertek__Initial_Stock__c = mapProduct.get(objIM.buildertek__Product_Name__c).buildertek__Available_Quantity__c;
        //     }
        // }
    }

    public static void afterInsert(List<buildertek__Inventory_Management__c> lstIM){
        List<RecordType> lstRecordType = [SELECT Id, Name FROM RecordType WHERE SObjectType = 'buildertek__Inventory_Management__c'];
        Map<Id, String> mapRecordType = new Map<Id, String>();
        for(RecordType objRecordType : lstRecordType){
            mapRecordType.put(objRecordType.Id, objRecordType.Name);
        }

        Set<Id> setProductId = new Set<Id>();
        for(buildertek__Inventory_Management__c objIM : lstIM){
            setProductId.add(objIM.buildertek__Product_Name__c);
        }
        List<Product2> lstProduct = [SELECT Id,Name, buildertek__Available_Quantity__c FROM Product2 WHERE Id IN :setProductId];

        Map<Id,Product2> mapProduct = new Map<Id,Product2>();
        for(Product2 objProduct : lstProduct){
            mapProduct.put(objProduct.Id,objProduct);
        }

        //create a map of product to buildertek__Inventory_Management__c
        Map<Id,List<buildertek__Inventory_Management__c>> mapProductToIM = new Map<Id,List<buildertek__Inventory_Management__c>>();
        for(buildertek__Inventory_Management__c objIM : lstIM){
            if(mapProductToIM.containsKey(objIM.buildertek__Product_Name__c)){
                mapProductToIM.get(objIM.buildertek__Product_Name__c).add(objIM);
            }
            else{
                List<buildertek__Inventory_Management__c> lst = new List<buildertek__Inventory_Management__c>();
                lst.add(objIM);
                mapProductToIM.put(objIM.buildertek__Product_Name__c,lst);
            }
        }

        for(Product2 objProduct : lstProduct){
            if(mapProductToIM.containsKey(objProduct.Id)){
                List<buildertek__Inventory_Management__c> lst = mapProductToIM.get(objProduct.Id);
                Decimal totalStock = 0;
                for(buildertek__Inventory_Management__c objIM : lst){
                    if(mapRecordType.get(objIM.RecordTypeId) == 'Received'){
                        totalStock += objIM.buildertek__Received_Stock__c;
                    }
                    else if(mapRecordType.get(objIM.RecordTypeId) == 'Returned'){
                        totalStock -= objIM.buildertek__Returned_Stock__c;
                    }
                }
                objProduct.buildertek__Available_Quantity__c += totalStock;
            }
        }
        update lstProduct;
    }
}