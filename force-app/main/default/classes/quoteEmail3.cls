global without sharing class quoteEmail3{
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
    global String querystrings { get; set; }
    global Boolean noCategory { get; set; }
    global quoteEmail3(){
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

        // if(adminInterfaceNodeConfigurations.buildertek__Display_Quote_Options__c == true){
        //     isOptionsEnabled = true;
        // } else{
        //     isOptionsEnabled = false;
        // }
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

    global string querystrings(){
        return this.querystrings;
    }

    global void setquerystrings(string querystrings){
        this.querystrings = querystrings;
    }

    global void setrelatedToId(string Id){
        this.quoteId = Id;
        if (runCls){
            runCls = false;
            getQuoteItemData();
        }
    }

    global void getQuoteItemData(){
        String quoteId = this.quoteId;
        System.debug('quoteId ==> ' + quoteId);
        System.debug('this.colsApiLst ==> ' + colsApiLst);

        List<String> fieldNames = getFieldNames();
        System.debug('fieldNames ==> ' + fieldNames);

        allQuoteLineList = getQuoteItems(quoteId);
        System.debug('allQuoteLineList ==> ' + allQuoteLineList);

        Set<String> Category = getCategorySet();
        System.debug('Category ==> ' + Category);
        totalcat = Category.size();
        havenull = checkForNullCategory(Category);

        categoryList = getCategoryList(Category);

        Set<String> Grouping = getGroupingSet();
        System.debug('Grouping ==> ' + Grouping);
        groupingList = new List<String>(Grouping);
        System.debug('groupingList ==> ' + groupingList);

        groupingTotalMap = getGroupingTotalMap(Grouping);
        System.debug('groupingTotalMap ==> ' + groupingTotalMap);
        
        groupingTotalCatMap = getCategoryTotalMap(Category);
        System.debug('groupingTotalCatMap ==> ' + groupingTotalCatMap);

        finalObj = getFinalObjectList(Category);
        System.debug('objList ==> ' + finalObj);

        groupingtoobj = getGroupingToObjectMap(Grouping);
        System.debug('groupingtoobj ==> ' + groupingtoobj);

        getNestedGroupingCategoryTotalMap = getNestedGroupingCategoryTotalMap(Grouping, Category);
        System.debug('getNestedGroupingCategoryTotalMap ==> ' + getNestedGroupingCategoryTotalMap);
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
        // quotesList = [SELECT id, buildertek__Markup_Amount__c, buildertek__Tax__c, buildertek__Discount__c, buildertek__Additional_Fees__c, buildertek__Shipping_and_Handling__c FROM buildertek__Quote__c WHERE id =: quoteid limit 1 ];

        // tax = (quotesList[0].buildertek__Tax__c != null) ? quotesList[0].buildertek__Tax__c : 0;
        // discount = (quotesList[0].buildertek__Discount__c != null) ? quotesList[0].buildertek__Discount__c : 0;
        // shippingHandling = (quotesList[0].buildertek__Shipping_and_Handling__c != null) ? quotesList[0].buildertek__Shipping_and_Handling__c : 0;
        // additionalFee = (quotesList[0].buildertek__Additional_Fees__c != null) ? quotesList[0].buildertek__Additional_Fees__c : 0;
        // markupAmount = (quotesList[0].buildertek__Markup_Amount__c != null) ? quotesList[0].buildertek__Markup_Amount__c : 0;

        String query = 'SELECT Id,';
        for (String fieldName : colsApiLst){
            query += fieldName + ',';
        }
        query += ' buildertek__Category__c, buildertek__Category__r.Name, buildertek__Grouping__c, buildertek__Grouping__r.Name, buildertek__Grouping__r.buildertek__Sort_Id__c FROM buildertek__Quote_Item__c WHERE buildertek__Quote__c = :quoteId';

        // if(isOptionsEnabled == true){
        //     if (String.isNotBlank(querystrings) && querystrings != 'All') {
        //         query += ' AND ( buildertek__Option__c = :querystrings OR buildertek__Option__c = \'All\' ) AND buildertek__Not_Customer_Visible__c = false';
        //     }
        // }

        query += ' ORDER BY buildertek__Grouping__r.buildertek__Sort_Id__c NULLS Last, buildertek__Grouping__r.Name';
        
        List<buildertek__Quote_Item__c> quoteItems = Database.query(query);
        System.debug('quoteItems ==> ' + quoteItems);
        subTotal = 0;
        for (buildertek__Quote_Item__c item : quoteItems){
            if (item.buildertek__Category__c == null){
                item.buildertek__Category__r = new buildertek__Category__c(
                    Name = 'No Category'
                );
            }
            // if(item.buildertek__Net_Unit__c != null){
            //     subTotal += item.buildertek__Net_Unit__c;
            // }
        }

        // total = (subTotal - (subTotal*(discount/100))) + markupAmount;
        // quoteTotal = (total + (total*(tax/100))) + shippingHandling + additionalFee;
        // System.debug('quoteTotal ==> '+quoteTotal);
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
                    total += quoteItem.buildertek__Net_Total_Price__c;
                }
            }
            groupingTotalMap.put(grp, total);
        }
        return groupingTotalMap;
    }

    private Map<String, Decimal> getCategoryTotalMap(Set<String> Grouping){
        Map<String, Decimal> groupingCatTotalMap = new Map<String, Decimal>();
        for (String grp : Grouping){
            Decimal total = 0;
            for (buildertek__Quote_Item__c quoteItem : allQuoteLineList){
                if (quoteItem.buildertek__Category__r.Name == grp){
                    total += quoteItem.buildertek__Net_Unit__c;
                }
            }
            groupingCatTotalMap.put(grp, total);
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
                    s= s + '.00';
                }
                obj.put(obj.get('Category') + 'UnitPrice', orgCurr + ' ' + s);
            } else{
                obj.put(obj.get('Category') + 'UnitPrice', 0);
            }            for (String cat : Category){
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
                        total += quoteItem.buildertek__Net_Unit__c;
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
                    categoryTotalMap.put(category, orgCurr + ' ' + ss);  // Prefix with currency and format the total
                }
            }
        
            groupingCatTotalMap.put(grp, categoryTotalMap);
        }

        return groupingCatTotalMap;
    }    

}