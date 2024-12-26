public without sharing class ContractPageNew {
    @AuraEnabled
    public static Object getContractData(String contractId){
        System.debug('Contract Id ==> ' + contractId);

        FinalWrapperClass wrap = new FinalWrapperClass();
        
        ContractDetails Detail = new ContractDetails();
        Detail.groups = getQuoteGroupDetails(contractId);
        wrap.groups = Detail.groups;

        List<BT_Lightning_Utils.dataTableFields> fieldSetRecord = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Contract_Item__c', 'buildertek__Contract_Line_Field_Set');
        wrap.fieldSetRecords = fieldSetRecord;

        List<BT_Lightning_Utils.dataTableFields> column = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Contract_Item__c', 'buildertek__Contract_Line_Field_Set');
        System.debug('column: ' + column);
        wrap.columns = column;

        String apiString = '';
        for(BT_Lightning_Utils.dataTableFields s : column){
            if(s.type == 'Reference'){
                s.fieldName = s.fieldName.substringBefore('__c')+'__r.Name';
            }
            apiString += s.fieldName + ', ';
        }
        System.debug(apiString);

        String query = 'SELECT Id, ' + apiString;

        //Check if apiString contains specific fields before appending them
        if (!apiString.contains('buildertek__Contract_Item_Group__r.Name')) {
            query += 'buildertek__Contract_Item_Group__c, buildertek__Contract_Item_Group__r.Name, buildertek__Contract_Item_Group__r.buildertek__Sort_Id__c';
        } else{
            query += 'buildertek__Contract_Item_Group__c, buildertek__Contract_Item_Group__r.buildertek__Sort_Id__c';
        }

        query += ' FROM buildertek__Contract_Item__c WHERE buildertek__Contract__c =\'' + contractId + '\'';
        query += ' ORDER BY buildertek__Contract_Item_Group__r.Name, Name ASC';
        System.debug('query: ' + query);

        List<buildertek__Contract_Item__c> records = Database.query(query);
        System.debug('records: ' + records);
        wrap.records = records;

        buildertek__Quote_Line_Group__c noGrouping = [SELECT Id, Name FROM buildertek__Quote_Line_Group__c WHERE Name = 'No Grouping' LIMIT 1];
        wrap.noGrouping = noGrouping;

        buildertek__Contract__c contractQuery = [SELECT Id, Name FROM buildertek__Contract__c WHERE Id =: contractId LIMIT 1];
        wrap.contractRec = contractQuery;
        wrap.total = [SELECT count() FROM buildertek__Contract_Item__c WHERE buildertek__Contract__c =: contractId];

        return wrap;
    }

    public static List<Quote_Line_Group__c> getQuoteGroupDetails(String contractId){
        // Add selected field in soql from field set
        String objectName = 'buildertek__Contract_Item__c';
        //String filterConditions = ' AND buildertek__Contract__c =:contractId'; 
        String fieldSetAPI = 'buildertek__Contract_Line_Field_Set';
        String soql = 'SELECT Id, Name ';
        soql = soql + ', Contract_Item_Group__c, Description__c, Product__c ';
        
        String namespacePrefix = BT_Utils.getNamespacePrefix();
        List<Schema.FieldSetMember> fieldSetMemberList = BT_Utils.getFieldSetMembers(fieldSetAPI,objectName);
        for(Schema.FieldSetMember fieldSetMemberObj : fieldSetMemberList){
            if(!soql.contains(fieldSetMemberObj.getFieldPath().replace(namespacePrefix,''))){
                soql = soql+ ',' + fieldSetMemberObj.getFieldPath();
            }
            
            if (String.ValueOf(fieldSetMemberObj.getType()).toUpperCase() == 'REFERENCE') {
                if (!fieldSetMemberObj.getFieldPath().Contains('__c')) {
                    soql = soql+ ',' + fieldSetMemberObj.getFieldPath().replace('Id','.Name');
                } else {
                    soql = soql+ ',' + fieldSetMemberObj.getFieldPath().replace('__c','__r.Name');
                }
            }
        }
        soql = soql + ' FROM buildertek__Contract_Item__c';
        soql = soql + ' WHERE buildertek__Contract__c =: contractId ORDER BY Contract_Item_Group__r.Name ASC';
        
        List<buildertek__Contract_Item__c> contractItemList;
        contractItemList = Database.query(soql);
        system.debug('contractItemList ------------> '+contractItemList);
        
        SET<Id> groupIdSet = new SET<Id>();
        for(buildertek__Contract_Item__c contractItem : contractItemList){
            groupIdSet.add(contractItem.buildertek__Contract_Item_Group__c);        
        }
        
        List<Quote_Line_Group__c> contractGroup;
            if(Schema.sObjectType.buildertek__Quote_Line_Group__c.fields.Id.isAccessible() &&
                Schema.sObjectType.buildertek__Quote_Line_Group__c.fields.Name.isAccessible()){
            contractGroup = Database.query('Select Id, Name from buildertek__Quote_Line_Group__c where Id IN: groupIdSet ORDER BY Name ASC');  
        }
        
        return contractGroup;    
    }

    @AuraEnabled 
    public static string getPricebook(string contractId){
        list<buildertek__Contract__c> contractList; 
        if(Schema.sObjectType.buildertek__Contract__c.fields.Id.isAccessible()&&
            Schema.sObjectType.buildertek__Contract__c.fields.Name.isAccessible()&&
            Schema.sObjectType.buildertek__Contract__c.fields.buildertek__Project__c.isAccessible() &&
			Schema.sObjectType.buildertek__Project__c.fields.buildertek__Price_Book__c.isAccessible()  ){
                contractList= [ SELECT id, buildertek__Project__r.buildertek__Price_Book__c FROM buildertek__Contract__c WHERE id =: contractId ];
		}
        if(contractList.size() > 0){
            return contractList[0].buildertek__Project__r.buildertek__Price_Book__c ;
        }
        return null;
    }

    @AuraEnabled //get Pricebook Values
    public static Map<String, String> getPricebookValue(){
        Map<String, String> options = new Map<String, String>();
        list<pricebook2> PriceList = [SELECT Id,Name FROM pricebook2 ORDER BY Name ASC];
        for (pricebook2 p: PriceList) {
            //Put Picklist Value & Label in Map
            options.put(p.name, p.Id); 
        }
        return options;
    } 

    @AuraEnabled 
    public static list<ProductFamilyClass> getProductfamilyRecords(String parentId) {
        Map<String, String> options = new Map<String, String>();
        List <sObject> returnList = new List < sObject > ();
       
        list<string> ProdIds = new list<string>();
        if(parentId != null){
            list<pricebookEntry> PElist;
            PElist = [SELECT id, Product2Id FROM pricebookEntry WHERE pricebook2Id =: parentId];
            for(pricebookEntry PE : PElist){
                ProdIds.add(PE.Product2Id);
            }
        }
        
        List<AggregateResult> productfamlylst =[SELECT family FROM Product2  WHERE (Id IN :ProdIds AND family != null) GROUP BY family];
        list<ProductFamilyClass> pfwrapperlst = new list<ProductFamilyClass>();
        if(productfamlylst.size() > 0 ){
            for(AggregateResult agg : productfamlylst){
                ProductFamilyClass pf = new ProductFamilyClass();
                pf.productfamilyvalues = String.valueof(agg.get('family'));
                pfwrapperlst.add(pf);
            }
            System.debug('pfwrapperlst---->'+pfwrapperlst);
        }
         return pfwrapperlst;
    }

    @AuraEnabled
    public static PricebookEntry getProductPrice(string productId){
        PricebookEntry pList = new PricebookEntry();
        pList = [SELECT Id, UnitPrice, buildertek__Unit_Cost__c, Product2.buildertek__Quote_Group__r.Name, Product2.buildertek__Quote_Group__c, buildertek__Markup__c, buildertek__Discount__c, Product2.buildertek__Cost_Code__c, Product2.buildertek__Cost_Code__r.Name FROM PricebookEntry WHERE product2Id =: productId AND isActive = true AND pricebook2Id IN (SELECT id FROM Pricebook2 WHERE isActive = true) LIMIT 1];
        return pList;
    }

    @AuraEnabled
    public static string deleteContractLine(Id contractItemId) {
        try{
            if(Schema.sObjectType.buildertek__Contract_Item__c.fields.id.isAccessible()
                && buildertek__Contract_Item__c.sObjectType.getDescribe().isDeletable()){
                    buildertek__Contract_Item__c contractItem = [SELECT Id FROM buildertek__Contract_Item__c WHERE Id =: contractItemId];
                    delete contractItem;
            }   
            return 'Sucess';
        } catch(Exception ex){
            System.debug('Error: ' + ex.getMessage());
            List<buildertek__Exception_Log_Store_Option__c> StoreExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
            if (!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true) {
                BT_ExceptionHandler.Store_Exception(ex);
            }
            return ex.getMessage();
        }
    }

    @AuraEnabled
    public static string deleteSelectedItems(List<String> recordIds){
        list<buildertek__Contract_Item__c> contractItemLists;
        if(Schema.sObjectType.buildertek__Contract_Item__c.fields.Name.isAccessible()&&
            Schema.sObjectType.buildertek__Contract_Item__c.fields.Id.isAccessible() ){
                contractItemLists= [select id from buildertek__Contract_Item__c where id IN: recordIds];
        }
        if(buildertek__Contract_Item__c.sObjectType.getDescribe().isDeletable()){
            delete contractItemLists; 
            return 'success';
        }
        return null;
    }

    @AuraEnabled
    public static buildertek__Contract_Item__c saveContractLineItem(String contractRecord){
       
        buildertek__Contract_Item__c contractItemRec = new buildertek__Contract_Item__c();
        contractItemRec = (buildertek__Contract_Item__c)System.JSON.deserialize(contractRecord, buildertek__Contract_Item__c.class);

        if(contractItemRec.buildertek__Contract_Item_Group__c == null){
            List<buildertek__Quote_Line_Group__c> contractGroup ;
            if(Schema.sObjectType.buildertek__Quote_Line_Group__c.fields.Id.isAccessible() &&
                Schema.sObjectType.buildertek__Quote_Line_Group__c.fields.Name.isAccessible()){
                    contractGroup= [SELECT Id, Name FROM buildertek__Quote_Line_Group__c WHERE Name = 'No Grouping'];
            }

            if(contractGroup.size() > 0){
                contractItemRec.buildertek__Contract_Item_Group__c = contractGroup[0].Id;     
            } else{
                buildertek__Quote_Line_Group__c conGroup = new buildertek__Quote_Line_Group__c();
                if(Schema.sObjectType.buildertek__Quote_Line_Group__c.fields.Name.isCreateable()){
                    conGroup.Name = 'No Grouping';    
                }
                insert conGroup;
                contractItemRec.buildertek__Contract_Item_Group__c = conGroup.Id;
            }
        }  
        
        buildertek__Contract_Item__c contractLineToInsert = new buildertek__Contract_Item__c();

        if (contractItemRec.Name != null && contractItemRec.Name.length() > 79){
            contractLineToInsert.Name = contractItemRec.Name.left(78);
            contractLineToInsert.buildertek__Description__c = contractItemRec.Name;
        } else{
            contractLineToInsert.Name = contractItemRec.Name;
        }

        contractLineToInsert.buildertek__Product__c = contractItemRec.buildertek__Product__c;
        // contractLineToInsert.Name = contractItemRec.Name;
        contractLineToInsert.buildertek__Contract__c = contractItemRec.buildertek__Contract__c; 
        contractLineToInsert.buildertek__Contract_Item_Group__c = contractItemRec.buildertek__Contract_Item_Group__c;
        contractLineToInsert.buildertek__Unit_Price__c = contractItemRec.buildertek__Unit_Price__c;
        contractLineToInsert.buildertek__Unit_Cost__c = contractItemRec.buildertek__Unit_Cost__c;
        contractLineToInsert.buildertek__Quantity__c = contractItemRec.buildertek__Quantity__c;
        contractLineToInsert.buildertek__Cost_Code__c = contractItemRec.buildertek__Cost_Code__c;
        contractLineToInsert.buildertek__Discount__c = contractItemRec.buildertek__Discount__c;
         
        insert contractLineToInsert;
    			
        return contractLineToInsert;
    }

    public class ContractDetails{
        @AuraEnabled
        public List<Quote_Line_Group__c> groups {get;set;}
        
        @AuraEnabled
        public List<String> headerFields {get;set;}
        
        @AuraEnabled
        public List<BT_Lightning_Utils.dataTableFields> columns {get;set;}
        
        public ContractDetails(){
            groups = new List<Quote_Line_Group__c>();
            headerFields = new List<String>();
            columns = new List<BT_Lightning_Utils.dataTableFields>();
        }
    }

    public class TargetTable{
        @AuraEnabled public List <sObject> records; 
    }

    public class finalWrapperClass{
        @AuraEnabled public List<buildertek__Contract_Item__c> records;
        @AuraEnabled public List<BT_Lightning_Utils.dataTableFields> columns;
        @AuraEnabled public List<BT_Lightning_Utils.dataTableFields> fieldSetRecords;
        @AuraEnabled public List<Quote_Line_Group__c> groups {get; set;}
        @AuraEnabled public Integer pageSize {get; set;}
        @AuraEnabled public Integer page {get; set;}
        @AuraEnabled public Integer total {get; set;}
        @AuraEnabled public buildertek__Contract__c contractRec {get; set;}
        @AuraEnabled public buildertek__Quote_Line_Group__c noGrouping {get; set;}
    }

    public class FieldClass{
        @AuraEnabled public String fieldName; //Record Id used for Firing Events
        @AuraEnabled public String fieldType;
        @AuraEnabled public Boolean isEditable; 
    }

    public class ProductFamilyClass{
        @AuraEnabled Public String productfamilyvalues {get; set;}
    } 
}