global without sharing class QuoteOptionsCategoriesTotalsController{
    global string quoteId;
    global string queryfields;
    global string selectedOption;
    global buildertek__Quote__c quote{ get; set; }
    global Boolean isOptionsEnabled {get;set;}
    global List<buildertek__Quote__c> quotesList {get; set;}
    global Decimal total {get;set;}
    global Decimal subTotal {get;set;}
    global Decimal markupAmount {get;set;}
    global Decimal tax {get;set;}
    global Decimal discount {get;set;}
    global Decimal shippingHandling {get;set;}
    global Decimal additionalFee {get;set;}
    global Decimal quoteTotal {get;set;}

    global list<string> colsApiLst{ get; set; }

    global Boolean runCls{ get; set; }

    global string orgCurr{ get; set; }

    global List<buildertek__Quote_Item__c> allQuoteLineList{ get; set; }

    global List<object> finalObj{ get; set; }

    global List<BT_Lightning_Utils.dataTableFields> columns{ get; set; }

    global string tableHeaderDynamicColor{ get; set; }

    global List<String> categoryList{ get; set; }

    global Integer totalcat{ get; set; }

    global boolean havenull{ get; set; }

    global Map<string, decimal> groupingTotalMap{ get; set; }

    global Map<string, decimal> groupingTotalCatMap{ get; set; }

    global Map<String, Object> groupingtoobj{ get; set; }

    global List<String> groupingList{ get; set; }

    global Map<String, Map<String, String>> getNestedGroupingCategoryTotalMap {get; set;}
    global String quoteOption { get; set; }
    global string tableFooterFieldsAPINames {get;set;}
    public List<FieldInfo> dynamicFields { get; set; }
    global Boolean noCategory { get; set; }


    global QuoteOptionsCategoriesTotalsController(){
        runCls = true;
        orgCurr = UserInfo.getDefaultCurrency();
        buildertek__Admin_Interface_Node_Configuration__c adminInterfaceNodeConfigurations = [Select Id, buildertek__Color_code__c, buildertek__Display_Quote_Options__c
                                                                                              from buildertek__Admin_Interface_Node_Configuration__c
                                                                                              WHERE Name = :'Quote Configuration'];
        if (adminInterfaceNodeConfigurations != null && String.isNotBlank(adminInterfaceNodeConfigurations.buildertek__Color_code__c)){
            tableHeaderDynamicColor = adminInterfaceNodeConfigurations.buildertek__Color_code__c;
        } else{
            tableHeaderDynamicColor = '#1B5397';
        }

        if(adminInterfaceNodeConfigurations.buildertek__Display_Quote_Options__c == true){
            isOptionsEnabled = true;
        } else{
            isOptionsEnabled = false;
        }
    }

    global void setquerystring(string querystring){
        this.queryfields = querystring;
        colsApiLst = querystring.split(',');
    }

    global string getquerystring(){
        return queryfields;
    }

    global string getrelatedToId(){
        return quoteId;
    }

    global string quoteOption(){
        return this.quoteOption;
    }

    global void setquerystrings(string quoteOption){
        this.quoteOption = quoteOption;
    }

    global void setrelatedToId(string Id){
        this.quoteId = Id;
        if (runCls){
            runCls = false;
            getQuoteItemData();
        }
    }

    global string gettableFooterFieldsName(){
        return tableFooterFieldsAPINames;
    }

    global void settableFooterFieldsName(string tableFooterFieldsName){
        this.tableFooterFieldsAPINames = tableFooterFieldsName;
        populateDynamicFields();
    }

    global void getQuoteItemData(){
        String quoteId = this.quoteId;
        List<String> fieldNames = getFieldNames();

        allQuoteLineList = getQuoteItems(quoteId);

        Set<String> Category = getCategorySet();
        totalcat = Category.size();
        havenull = checkForNullCategory(Category);

        categoryList = getCategoryList(Category);

        Set<String> Grouping = getGroupingSet();
        groupingList = new List<String>(Grouping);

        groupingTotalMap = getGroupingTotalMap(Grouping);
        
        groupingTotalCatMap = getCategoryTotalMap(Category);

        finalObj = getFinalObjectList(Category);

        groupingtoobj = getGroupingToObjectMap(Grouping);

        getNestedGroupingCategoryTotalMap = getNestedGroupingCategoryTotalMap(Grouping, Category);
    }

    private List<String> getFieldNames(){
        Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.buildertek__Quote_Item__c.fields.getMap();
        List<String> fieldNames = new List<String>();
        for (String fieldName : colsApiLst){
            fieldNames.add(fieldMap.get(fieldName).getDescribe().getLabel());
        }
        return fieldNames;
    }

    private List<buildertek__Quote_Item__c> getQuoteItems(String quoteId){
        quotesList = [SELECT id, buildertek__Markup_Amount__c, buildertek__Tax__c, buildertek__Discount__c, buildertek__Additional_Fees__c, buildertek__Shipping_and_Handling__c FROM buildertek__Quote__c WHERE id =: quoteid limit 1 ];

        tax = (quotesList[0].buildertek__Tax__c != null) ? quotesList[0].buildertek__Tax__c : 0;
        discount = (quotesList[0].buildertek__Discount__c != null) ? quotesList[0].buildertek__Discount__c : 0;
        shippingHandling = (quotesList[0].buildertek__Shipping_and_Handling__c != null) ? quotesList[0].buildertek__Shipping_and_Handling__c : 0;
        additionalFee = (quotesList[0].buildertek__Additional_Fees__c != null) ? quotesList[0].buildertek__Additional_Fees__c : 0;
        markupAmount = (quotesList[0].buildertek__Markup_Amount__c != null) ? quotesList[0].buildertek__Markup_Amount__c : 0;

        String query = 'SELECT Id,';
        for (String fieldName : colsApiLst){
            query += fieldName + ',';
        }
        query += ' buildertek__Category__c, buildertek__Category__r.Name, buildertek__Grouping__c, buildertek__Grouping__r.Name, buildertek__Grouping__r.buildertek__Sort_Id__c, buildertek__Option__c FROM buildertek__Quote_Item__c WHERE buildertek__Quote__c = :quoteId';

        query += ' AND buildertek__Not_Customer_Visible__c = false ORDER BY buildertek__Grouping__r.buildertek__Sort_Id__c NULLS Last, buildertek__Grouping__r.Name';
        
        List<buildertek__Quote_Item__c> quoteItems = Database.query(query);
        subTotal = 0;
        for (buildertek__Quote_Item__c item : quoteItems){
            if (item.buildertek__Category__c == null){
                item.buildertek__Category__r = new buildertek__Category__c(
                    Name = 'No Category'
                );
            }
            // Only add to subtotal if the item belongs to the selected option, 'All', or has no option
            if(!isOptionsEnabled || String.isBlank(quoteOption) || quoteOption == 'All' || 
               item.buildertek__Option__c == quoteOption || item.buildertek__Option__c == 'All' || 
               String.isBlank(item.buildertek__Option__c)){
                if(item.buildertek__Net_Unit__c != null){
                    subTotal += item.buildertek__Net_Unit__c;
                }
            }
        }
        
        total = (subTotal - (subTotal*(discount/100))) + markupAmount;
        quoteTotal = (total + (total*(tax/100))) + shippingHandling + additionalFee;
        return quoteItems;
    }

    private Set<String> getCategorySet(){
        Set<String> Category = new Set<String>();
        for (buildertek__Quote_Item__c quoteItem : allQuoteLineList){
            Category.add(quoteItem.buildertek__Category__r.Name);
        }
        return Category;
    }

    private boolean checkForNullCategory(Set<String> Category){
        for (buildertek__Quote_Item__c quoteItem : allQuoteLineList){
            if (quoteItem.buildertek__Category__r.Name == null){
                return true;
            }
        }
        return false;
    }

    private List<String> getCategoryList(Set<String> Category){
        List<String> categoryList = new List<String>();
        for (String cat : Category){
            if (cat != null && Category.size() == 1 && cat == 'No Category') {
                noCategory = true;
            }
            if (cat != null){
                categoryList.add(cat);
            }
        }
        return categoryList;
    }

    private Set<String> getGroupingSet(){
        Set<String> Grouping = new Set<String>();
        for (buildertek__Quote_Item__c quoteItem : allQuoteLineList){
            Grouping.add(quoteItem.buildertek__Grouping__r.Name);
        }
        return Grouping;
    }

    private Map<String, Decimal> getGroupingTotalMap(Set<String> Grouping){
        Map<String, Decimal> groupingTotalMap = new Map<String, Decimal>();
        for (String grp : Grouping){
            Decimal total = 0;
            for (buildertek__Quote_Item__c quoteItem : allQuoteLineList){
                if (quoteItem.buildertek__Grouping__r.Name == grp){
                    // Only include in total if the item belongs to the selected option, 'All', or has no option
                    if(!isOptionsEnabled || String.isBlank(quoteOption) || quoteOption == 'All' || 
                       quoteItem.buildertek__Option__c == quoteOption || quoteItem.buildertek__Option__c == 'All' || 
                       String.isBlank(quoteItem.buildertek__Option__c)){
                        total += quoteItem.buildertek__Net_Total_Price__c;
                    }
                }
            }
            groupingTotalMap.put(grp, total);
        }
        return groupingTotalMap;
    }

    private Map<String, Decimal> getCategoryTotalMap(Set<String> Category){
        Map<String, Decimal> groupingCatTotalMap = new Map<String, Decimal>();
        for (String cat : Category){
            Decimal total = 0;
            for (buildertek__Quote_Item__c quoteItem : allQuoteLineList){
                if (quoteItem.buildertek__Category__r.Name == cat){
                    // Only include in total if the item belongs to the selected option, 'All', or has no option
                    if(!isOptionsEnabled || String.isBlank(quoteOption) || quoteOption == 'All' || 
                       quoteItem.buildertek__Option__c == quoteOption || quoteItem.buildertek__Option__c == 'All' || 
                       String.isBlank(quoteItem.buildertek__Option__c)){
                        total += quoteItem.buildertek__Net_Unit__c;
                    }
                }
            }
            groupingCatTotalMap.put(cat, total);
        }
        return groupingCatTotalMap;
    }

    private List<Object> getFinalObjectList(Set<String> Category){
        List<Object> objList = new List<Object>();
        for (buildertek__Quote_Item__c quoteItem : allQuoteLineList){
            Map<String, Object> obj = new Map<String, Object>();
            obj.put('Id', quoteItem.Id);
            obj.put('Name', quoteItem.Name);
            if (String.isBlank(quoteItem.buildertek__Notes__c)){
                obj.put('Notes', '');
            } else {
                obj.put('Notes', quoteItem.buildertek__Notes__c);
            }
            obj.put('Quantity', quoteItem.buildertek__Quantity__c);
            obj.put('Category', quoteItem.buildertek__Category__r.Name);
            if(quoteItem.buildertek__Net_Unit__c != null){
                Decimal dec = quoteItem.buildertek__Net_Unit__c;
                Double doub = dec.doublevalue();
                List<String> args = new String[]{'0','number','⌗⌗⌗,⌗⌗⌗,⌗⌗⌗,⌗⌗⌗0.00'};
                String s = String.format(doub.format(), args);
                if(!s.contains('.')){
                    s = s + '.00';
                }
                obj.put(obj.get('Category') + 'UnitPrice', orgCurr + ' ' + s);
            } else{
                obj.put(obj.get('Category') + 'UnitPrice', 0);
            }            
            for (String cat : Category){
                if (cat != quoteItem.buildertek__Category__r.Name){
                    obj.put(cat + 'UnitPrice', ' ');
                }
            }
            if(quoteItem.buildertek__Net_Total_Price__c != null){
                Decimal rA = quoteItem.buildertek__Net_Unit__c;
                Double doubVal = rA.doublevalue();
                List<String> argss = new String[]{'0','number','⌗⌗⌗,⌗⌗⌗,⌗⌗⌗,⌗⌗⌗0.00'};
                String ss = String.format(doubVal.format(), argss);
                if(!ss.contains('.')){
                    ss= ss + '.00';
                }
                obj.put('TotalPrice', orgCurr + ' ' + ss);
            } else{
                obj.put('TotalPrice', 0);
            }              
            obj.put('Grouping', quoteItem.buildertek__Grouping__r.Name);

            // Add a flag to indicate if the item should be colored red
            boolean isRed = isOptionsEnabled && String.isNotBlank(quoteOption) && quoteOption != 'All' && 
                            quoteItem.buildertek__Option__c != quoteOption && quoteItem.buildertek__Option__c != 'All' && 
                            String.isNotBlank(quoteItem.buildertek__Option__c);
            obj.put('IsRed', isRed);

            objList.add(obj);
        }
        return objList;
    }

    private Map<String, Object> getGroupingToObjectMap(Set<String> Grouping){
        Map<String, Object> groupingtoobj = new Map<String, Object>();
        for (String grp : Grouping){
            List<Object> innerobjList = new List<Object>();
            for (Object obj : finalObj){
                System.debug('obj ' + obj);
                if (((Map<String, Object>)obj).get('Grouping') == grp){
                    innerobjList.add(obj);
                }
            }
            groupingtoobj.put(grp, innerobjList);
        }
        return groupingtoobj;
    }

    private Map<String, Map<String, String>> getNestedGroupingCategoryTotalMap(Set<String> Grouping, Set<String> Categories) {
        Map<String, Map<String, String>> groupingCatTotalMap = new Map<String, Map<String, String>>();

        for (String grp : Grouping) {
            Map<String, String> categoryTotalMap = new Map<String, String>();
        
            for (String category : Categories) {
                Decimal total = 0;
        
                for (buildertek__Quote_Item__c quoteItem : allQuoteLineList) {
                    if (quoteItem.buildertek__Grouping__r.Name == grp && quoteItem.buildertek__Category__r.Name == category) {
                        // Only include in total if the item belongs to the selected option, 'All', or has no option
                        if(!isOptionsEnabled || String.isBlank(quoteOption) || quoteOption == 'All' || 
                           quoteItem.buildertek__Option__c == quoteOption || quoteItem.buildertek__Option__c == 'All' || 
                           String.isBlank(quoteItem.buildertek__Option__c)){
                            total += quoteItem.buildertek__Net_Unit__c;
                        }
                    }
                }
        
                if (total == 0) {
                    categoryTotalMap.put(category, '');  // Blank for 0 total
                } else {
                    Decimal rA = total;
                    Double doubVal = rA.doublevalue();
                    List<String> argss = new String[]{'0','number','⌗⌗⌗,⌗⌗⌗,⌗⌗⌗,⌗⌗⌗0.00'};
                    String ss = String.format(doubVal.format(), argss);
                    if(!ss.contains('.')){
                        ss= ss + '.00';
                    }
                    categoryTotalMap.put(category, orgCurr + ' ' + ss);                }
            }
        
            groupingCatTotalMap.put(grp, categoryTotalMap);
        }

        return groupingCatTotalMap;
    }    

    // Method to populate dynamicFields based on tableFooterFieldsAPINames
    public void populateDynamicFields() {
        dynamicFields = new List<FieldInfo>();
        
        if (String.isNotBlank(tableFooterFieldsAPINames)) {
            List<String> fieldApiNames = tableFooterFieldsAPINames.split(',');
            String queryFields = 'Id';
            Map<String, Schema.SObjectField> fieldsMap = Schema.SObjectType.buildertek__Quote__c.fields.getMap();
            for (String apiName : fieldApiNames) {
                apiName = apiName.trim();
                if (fieldsMap.containsKey(apiName)) {
                    Schema.DescribeFieldResult fieldDescribe = fieldsMap.get(apiName).getDescribe();
                    queryFields += ', ' + apiName;
                    dynamicFields.add(new FieldInfo(apiName, fieldDescribe.getLabel(), fieldDescribe.getType()));
                }
            }
            if (String.isNotBlank(quoteId) && dynamicFields.size() > 0) {
                String query = 'SELECT ' + queryFields + ' FROM buildertek__Quote__c WHERE Id = :quoteId LIMIT 1';
                quote = (buildertek__Quote__c) Database.query(query);
            }
        }
    }

    public class FieldInfo {
        public String apiName { get; set; }
        public String label { get; set; }
        public Schema.DisplayType fieldType { get; set; }
        
        public FieldInfo(String apiName, String label, Schema.DisplayType fieldType) {
            this.apiName = apiName;
            this.label = label;
            this.fieldType = fieldType;
        }
    }

}