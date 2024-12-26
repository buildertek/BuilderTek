global without sharing class BudgetlineswithGroupingNameController{
    global string budgetId;

    global string queryfields;

    global string tableHeaderDynamicColor{ get; set; }

    global list<buildertek__Budget_Item__c> budgetItem;

    global list<buildertek__Budget_Line_Group__c> BudgetLineGroup;

    global map<id, list<buildertek__Budget_Item__c>> budgetgroupingmap;

    global list<wrapperClass> wrapperlst{ get; set; }

    global integer colomspanvalue{ get; set; }

    global BudgetlineswithGroupingNameController(){
        budgetItem = new list<buildertek__Budget_Item__c>();
        BudgetLineGroup = new list<buildertek__Budget_Line_Group__c>();
        buildertek__Admin_Interface_Node_Configuration__c adminInterfaceNodeConfigurations = [Select Id, buildertek__Color_code__c
                                                                                              from buildertek__Admin_Interface_Node_Configuration__c
                                                                                              WHERE Name = :'Quote Configuration'];
        if (adminInterfaceNodeConfigurations != null && String.isNotBlank(adminInterfaceNodeConfigurations.buildertek__Color_code__c)){
            tableHeaderDynamicColor = adminInterfaceNodeConfigurations.buildertek__Color_code__c;
        } else{
            tableHeaderDynamicColor = '#1B5397';
        }
    }

    global void setquerystring(string querystring){
        this.queryfields = querystring;
    }

    global string getquerystring(){
        return queryfields;
    }

    global void setrelatedToId(string Id){
        if (this.budgetId == Id) {
            return;
        }
        this.budgetId = Id;
        budgetLineGroupingData();
    }

    global string getrelatedToId(){
        return budgetId;
    }

    global String mylabel;

    global list<string> lablevalueslst{ get; set; }

    global list<string> lableslst{ get; set; }

    global map<string, string> sortlablevalueMap{ get; set; }

    global void budgetLineGroupingData(){
        lablevalueslst = new list<string>();
        sortlablevalueMap = new map<string, string>();

        wrapperlst = new list<wrapperClass>();

        lableslst = queryfields.split(',');
        colomspanvalue = lableslst.size() - 1;

        String type = 'buildertek__Budget_Item__c';  // Say,this is my object
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Schema.SObjectType leadSchema = schemaMap.get(type);
        Map<String, Schema.SObjectField> fieldMap = leadSchema.getDescribe().fields.getMap();
        Map<String, String> APITypeMap = new Map<String, String>();
        for (String fieldName : fieldMap.keySet()){
            String mylabel = fieldMap.get(fieldName).getDescribe().getLabel();
            String mytype = fieldMap.get(fieldName).getDescribe().getType().name();
            String APIName = fieldMap.get(fieldName).getDescribe().getName();
            // System.debug('mylabel: ' + mylabel);
            // System.debug('mytype: ' + mytype);
            // System.debug('fieldName: ' + fieldName);

            for (String lablerec : lableslst){
                if (lablerec == fieldName){
                    APITypeMap.put(mylabel, mytype);
                    lablevalueslst.add(mylabel);
                    sortlablevalueMap.put(lablerec, mylabel);
                }
            }
        }

        System.debug('APITypeMap: ' + APITypeMap);


        // Initialize setup variables
        String objectName = 'buildertek__Budget_Item__c';  // modify as needed
        String budgetitemquery = 'SELECT';
        Map<String, Schema.SObjectField> objectFields = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();

        // Grab the fields from the describe method and append them to the queryString one by one.
        for (String s : objectFields.keySet()){
            budgetitemquery += ' ' + s + ', ';
        }

        // Manually add related object's fields that are needed.
        budgetitemquery += 'buildertek__Group__r.Name,buildertek__Cost_Code__r.Name,buildertek__Budget__r.Name,buildertek__Product__r.Name,buildertek__Purchase_Order__r.Name,buildertek__Contractor__r.Name'; // modify as needed

        // Strip off the last comma if it exists.
        if (budgetitemquery.subString(budgetitemquery.Length() - 1, budgetitemquery.Length()) == ','){
            budgetitemquery = budgetitemquery.subString(0, budgetitemquery.Length() - 1);
        }

        // Add FROM statement
        budgetitemquery += ' FROM ' + objectName;

        // Add on a WHERE/ORDER/LIMIT statement as needed
        budgetitemquery += ' WHERE buildertek__Budget__c = \'' + budgetId + '\' Order BY Name ASC NULLS LAST'; // modify as needed

        try{
            budgetItem = database.query(budgetitemquery);
        } catch (QueryException e){
            //perform exception handling
        }

        set<Id> groupid = new set<Id>();
        budgetgroupingmap = new map<id, list<buildertek__Budget_Item__c>>();
        for (buildertek__Budget_Item__c singleBudgetItem : budgetItem){
            if (!budgetgroupingmap.containsKey(singleBudgetItem.buildertek__Group__c)){
                budgetgroupingmap.put(singleBudgetItem.buildertek__Group__c, new list<buildertek__Budget_Item__c>());
            }
            budgetgroupingmap.get(singleBudgetItem.buildertek__Group__c).add(singleBudgetItem);

            if (singleBudgetItem.buildertek__Group__c != null){
                groupid.add(singleBudgetItem.buildertek__Group__c);
            }
        }

        BudgetLineGroup = [Select Id, Name, buildertek__Sort_Id__c
                          from buildertek__Budget_Line_Group__c
                          where Id = :groupId AND Name != 'No Grouping'
                          order by buildertek__Sorting_Id__c NULLS Last, Name];
        List<buildertek__Budget_Line_Group__c> noGroupList = [Select Id, Name
                                                   from buildertek__Budget_Line_Group__c
                                                   where Name = 'No Grouping' AND Id = :groupid
                                                   limit 1];

        if (!noGroupList.isEmpty()){
            if(BudgetLineGroup.isEmpty()){
                BudgetLineGroup.add(noGroupList[0]);
            }
            else{
                BudgetLineGroup.add(0, noGroupList[0]);
            }
        }
        
        

        for (buildertek__Budget_Line_Group__c budgetlinegrouprec : BudgetLineGroup){
            decimal quoteitemlistTotal = 0.0;
            wrapperClass wrap = new wrapperClass();
            wrap.budgetlineitemlst = budgetgroupingmap.get(budgetlinegrouprec.Id);
            Integer counter = 0;
            for (buildertek__Budget_Item__c quoteitemrec : budgetgroupingmap.get(budgetlinegrouprec.Id)){

                if (quoteitemrec.buildertek__Unit_Price__c != null){
                    quoteitemlistTotal += quoteitemrec.buildertek__Unit_Price__c;
                }
                if (counter == 0){
                    wrap.groupName = quoteitemrec.buildertek__Group__r.Name;
                    counter = 1;
                }
            }

            wrap.listTotal = quoteitemlistTotal;
            Map<String, String> lableValueMap = new Map<String, String>();
            for (String lable : lableslst){
                if (lable == 'Name'){
                    lableValueMap.put(lable, 'SubTotal');
                    continue;
                }
                String type0 = APITypeMap.get(sortlablevalueMap.get(lable));
                System.debug('type: ' + type0);
                decimal totalValue = 0.0;
                for (buildertek__Budget_Item__c quoteitemrec : budgetgroupingmap.get(budgetlinegrouprec.Id)){
                    if (quoteitemrec.get(lable) != null){
                        totalValue += (Decimal)quoteitemrec.get(lable);
                    }
                }
                String totalValueStr;
                if (type0 == 'Currency'){
                    //get org currency
                    String orgCurrency = UserInfo.getDefaultCurrency();
                    totalValueStr = orgCurrency + ' ' + string.valueOf(totalValue);
                    
                }else{
                    totalValueStr = String.valueOf(totalValue);
                }
                lableValueMap.put(lable, totalValueStr);
            }

            List<totalWrapper> totalWrapList = new List<totalWrapper>();

            for (String key : lableValueMap.keySet()) {
                totalWrapper totalWrap = new totalWrapper();
                totalWrap.fieldApiName = key;
                totalWrap.fieldTotalValue = lableValueMap.get(key);
                totalWrapList.add(totalWrap);
            }

            wrap.totalWrapperList = totalWrapList;

            wrapperlst.add(wrap);
        }

        wrapperClass wrap = new wrapperClass();
        wrap.groupName = 'Total';
        wrap.totalWrapperList = new List<totalWrapper>();
        list<buildertek__Budget_Item__c> totalBudgetItemList = new list<buildertek__Budget_Item__c>();
        for(wrapperClass w : wrapperlst){
            totalBudgetItemList.addAll(w.budgetlineitemlst);
        }
        Map<String, String> lableValueMap = new Map<String, String>();
        for (String lable : lableslst){
            if (lable == 'Name'){
                lableValueMap.put(lable, 'Total');
                continue;
            }
            String type0 = APITypeMap.get(sortlablevalueMap.get(lable));
            System.debug('type: ' + type0);
            decimal totalValue = 0.0;
            for (buildertek__Budget_Item__c quoteitemrec : totalBudgetItemList){
                if (quoteitemrec.get(lable) != null){
                    totalValue += (Decimal)quoteitemrec.get(lable);
                }
            }
            String totalValueStr;
            if (type0 == 'Currency'){
                //get org currency
                String orgCurrency = UserInfo.getDefaultCurrency();
                totalValueStr = orgCurrency + ' ' + string.valueOf(totalValue.format());
                
            }else{
                totalValueStr = String.valueOf(totalValue.format());
            }
            lableValueMap.put(lable, totalValueStr);
        }

        List<totalWrapper> totalWrapList = new List<totalWrapper>();

        for (String key : lableValueMap.keySet()) {
            totalWrapper totalWrap = new totalWrapper();
            totalWrap.fieldApiName = key;
            totalWrap.fieldTotalValue = lableValueMap.get(key);
            totalWrapList.add(totalWrap);
        }

        wrap.totalWrapperList = totalWrapList;
            
        wrapperlst.add(wrap);




    }

    global class wrapperClass{
        global String groupName{ get; set; }

        global decimal listTotal{ get; set; }

        global list<buildertek__Budget_Item__c> budgetlineitemlst{ get; set; }

        global list<totalWrapper> totalWrapperList{ get; set; }
    }

    global class totalWrapper{
        global String fieldApiName { get; set; }

        global String fieldTotalValue{ get; set; }

    }
}