global without sharing class QuotelineswithGroupingNameQOController {
    global string quoteid;
    global string RollupAllGroupName {get; set;}
    global string queryfields;
    global string tableHeaderDynamicColor {get; set;}
    global list <buildertek__Quote_Item__c> dynamicQuoteItem {get; set;}
    global list <buildertek__Quote_Item__c> QuoteItem;
    global list <buildertek__Quote_Line_Group__c> Quotelinegroup;
    global map <id, list < buildertek__Quote_Item__c>> quotegroupingmap;
    global decimal Totalquotelineamount {get; set;}
    global list <wrapperClass> wrapperlst {get; set;}
    global list <buildertek__Quote__c> quotesList {get; set;}
    global integer colomspanvalue {get; set;}
    global list <string> sorlableslst {get; set;}
    global String mylabel;
    global list <string> lablevalueslst {get; set;}
    global list <string> lableslst {get; set;}
    global map <string, string> sortlablevalueMap {get; set;}
    global string selectedQuoteOption{ get; set; }
    global Decimal total {get;set;}
    global Decimal subTotal {get;set;}
    global Decimal markupAmount {get;set;}
    global Decimal tax {get;set;}
    global Decimal discount {get;set;}
    global Decimal shippingHandling {get;set;}
    global Decimal additionalFee {get;set;}
    global Decimal grandTotal {get;set;}
    global Boolean isOptionsEnabled {get;set;}
    global buildertek__Quote__c quote{ get; set; }
    global string tableFooterFieldsAPINames {get;set;}
    public List<FieldInfo> dynamicFields { get; set; }

    global QuotelineswithGroupingNameQOController() {
        quotesList = new list < buildertek__Quote__c > ();
        QuoteItem = new list < buildertek__Quote_Item__c > ();
        dynamicQuoteItem = new list < buildertek__Quote_Item__c > ();
        Quotelinegroup = new list < buildertek__Quote_Line_Group__c > ();
        buildertek__Admin_Interface_Node_Configuration__c adminInterfaceNodeConfigurations = [Select Id, buildertek__Color_code__c, buildertek__Display_Quote_Options__c from buildertek__Admin_Interface_Node_Configuration__c WHERE Name =: 'Quote Configuration'];
        if (adminInterfaceNodeConfigurations != null && String.isNotBlank(adminInterfaceNodeConfigurations.buildertek__Color_code__c)) {
            tableHeaderDynamicColor = adminInterfaceNodeConfigurations.buildertek__Color_code__c;
        } else {
            tableHeaderDynamicColor = '#1B5397';
        }
        if(adminInterfaceNodeConfigurations.buildertek__Display_Quote_Options__c == true){
            isOptionsEnabled = true;
        } else{
            isOptionsEnabled = false;
        }
    }

    global void setquerystring(string querystring) {
        this.queryfields = querystring;
        //Quotelinegroupingdata();
    }

    global string getquerystring() {
        return queryfields;
    }

    global void setquoteOption(string quoteOption){
        this.selectedQuoteOption = quoteOption;
    }

    global string getquoteOption(){
        return selectedQuoteOption;
    }

    global void setrelatedToId(string Id) {
        this.quoteid = Id;
        Quotelinegroupingdata();
    }

    global string getrelatedToId() {
        return quoteid;
    }

    global string gettableFooterFieldsName(){
        return tableFooterFieldsAPINames;
    }

    global void settableFooterFieldsName(string tableFooterFieldsName){
        this.tableFooterFieldsAPINames = tableFooterFieldsName;
        populateDynamicFields();
    }

    global void Quotelinegroupingdata() {
        try {
            // if (String.isNotBlank(selectedQuoteOption)) {
            //     Map<String, String> selectedOptionMap = (Map<String, String>)JSON.deserialize(selectedQuoteOption, Map<String, String>.class);
            //     selectedQuoteOption = selectedOptionMap.get('SelectedOption');
            // }
            lablevalueslst = new list < string > ();
            sortlablevalueMap = new map < string, string > ();
            system.debug('quoteid------>' + quoteid);
            system.debug('querystringfields--------------->' + queryfields);

            wrapperlst = new list < wrapperClass > ();
            Totalquotelineamount = 0.0;

            string query = 'Select Name, buildertek__Item_Name__c, buildertek__Description__c, buildertek__Quantity__c, buildertek__Unit_Price__c, buildertek__Total_Cost__c, buildertek__Quote__c, buildertek__Cost_Code__c, buildertek__Auto_Number__c, buildertek__RFQ__c, buildertek__Product__c, buildertek__Grouping__c, buildertek__UOM__c, buildertek__Vendor__c, buildertek__List_Unit_Price__c, buildertek__Markup__c, buildertek__Additional_Discount__c, buildertek__Unit_Cost__c, buildertek__List_Total__c, buildertek__Net_Total_Price__c, buildertek__Net_Unit__c, buildertek__Applied_Markup__c, buildertek__Net_Total__c, buildertek__MFG_Discount__c, buildertek__Pricing_Method__c, buildertek__Discount__c, buildertek__Profit_Margin__c, buildertek__Gross_Profit__c, buildertek__Notes__c, buildertek__Purchase_Order__c, buildertek__Status__c, buildertek__Sub_Group__c, buildertek__Margin__c, buildertek__Priority__c, buildertek__Not_Customer_Visible__c, buildertek__Tax__c, buildertek__Markup_Amount__c, buildertek__Tax_Amount__c, buildertek__Discount_Amount__c, buildertek__Margin_To_Markup__c, buildertek__Margin_Amount__c, buildertek__Sales_Tax_Amount_Manual__c, buildertek__BOM_Tax__c, buildertek__Total_Pre_Tax_Amount__c, buildertek__BOM_Line__c, buildertek__Division_Lookup__c, buildertek__Markup_to_Margin__c, buildertek__Build_Phase__c, buildertek__Build_Reference_1__c, buildertek__Product_Family__c, buildertek__Location_Picklist__c, buildertek__Location_Detailed_Area__c, buildertek__Location_Detail_Reference_1__c, buildertek__BL_SERVICE_CATEGORY__c, buildertek__Base_Location__c, buildertek__Additional_Costs__c, buildertek__SubTotal_Sales_Price__c ';

            string statusval = 'Accept';
            query += ' from buildertek__Quote_Item__c where buildertek__Quote__c = \'' + quoteid + '\' AND buildertek__Status__c =\'' + statusval + '\'' ; 

            query += ' Order By buildertek__Priority__c ASC NULLS LAST, Name ASC';
            system.debug('query---->' + query);
            lableslst = queryfields.split(',');
            colomspanvalue = lableslst.size() - 1;
            //String type= 'buildertek__Quote_Item__c';  // Say,this is my object
            system.debug('lableslst--->' + lableslst);

            String type = 'buildertek__Quote_Item__c'; // Say,this is my object
            Map < String, Schema.SObjectType > schemaMap = Schema.getGlobalDescribe();
            Schema.SObjectType leadSchema = schemaMap.get(type);
            Map < String, Schema.SObjectField > fieldMap = leadSchema.getDescribe().fields.getMap();
            for (String fieldName: fieldMap.keySet()) {
                String mylabel = fieldMap.get(fieldName).getDescribe().getLabel();
                for (String lablerec: lableslst) {
                    if (lablerec == fieldName) {
                        lablevalueslst.add(mylabel);
                        sortlablevalueMap.put(lablerec, mylabel);
                    }
                }
            }

            if (query != null) {
                dynamicQuoteItem = Database.query(query);
            }
            quotesList = [SELECT id, buildertek__Project__c, buildertek__Roll_Up__c, buildertek__Rollup_by_Group__c, buildertek__Subtotal__c, buildertek__Total__c, buildertek__Markup_Amount__c, buildertek__Tax__c, buildertek__Grand_Total__c, buildertek__Discount__c, buildertek__Additional_Fees__c, buildertek__Shipping_and_Handling__c FROM buildertek__Quote__c WHERE id =: quoteid limit 1 ];

            tax = (quotesList[0].buildertek__Tax__c != null) ? quotesList[0].buildertek__Tax__c : 0;
            discount = (quotesList[0].buildertek__Discount__c != null) ? quotesList[0].buildertek__Discount__c : 0;
            shippingHandling = (quotesList[0].buildertek__Shipping_and_Handling__c != null) ? quotesList[0].buildertek__Shipping_and_Handling__c : 0;
            additionalFee = (quotesList[0].buildertek__Additional_Fees__c != null) ? quotesList[0].buildertek__Additional_Fees__c : 0;
            markupAmount = (quotesList[0].buildertek__Markup_Amount__c != null) ? quotesList[0].buildertek__Markup_Amount__c : 0;

            // Initialize setup variables
            String objectName = 'buildertek__Quote_Item__c'; // modify as needed
            String quoteitemquery = 'SELECT';
            Map < String, Schema.SObjectField > objectFields = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();

            // Grab the fields from the describe method and append them to the queryString one by one.
            for (String s: objectFields.keySet()) {
                quoteitemquery += ' ' + s + ', ';
            }

            // Manually add related object's fields that are needed.
            quoteitemquery += 'buildertek__Grouping__r.Name,buildertek__Cost_Code__r.Name,buildertek__Quote__r.Name,buildertek__Product__r.Name,buildertek__Purchase_Order__r.Name,buildertek__Vendor__r.Name'; // modify as needed

            // Strip off the last comma if it exists.
            if (quoteitemquery.subString(quoteitemquery.Length() - 1, quoteitemquery.Length()) == ',') {
                quoteitemquery = quoteitemquery.subString(0, quoteitemquery.Length() - 1);
            }
            quoteitemquery += ' FROM ' + objectName;
            quoteitemquery += ' WHERE buildertek__Quote__c = \'' + quoteid + '\' AND buildertek__Status__c =\'' + statusval + '\' AND buildertek__Not_Customer_Visible__c = false';

            // Remove the filtering based on option
            // if(isOptionsEnabled == true){
            //     if (String.isNotBlank(selectedQuoteOption) && selectedQuoteOption != 'All') {
            //         quoteitemquery += ' AND ( buildertek__Option__c = :selectedQuoteOption OR buildertek__Option__c = \'All\' )';
            //     } 
            // }
            
            quoteitemquery += ' Order BY buildertek__Priority__c ASC NULLS LAST, Name ASC';

            QuoteItem = database.query(quoteitemquery);

            system.debug('QuoteItem---->' + QuoteItem.size());
            set < Id > groupid = new set < Id > ();
            quotegroupingmap = new map < id, list < buildertek__Quote_Item__c >> ();
            subTotal = 0;
            Boolean noGroupRow = false;
            for (buildertek__Quote_Item__c qutitem: QuoteItem) {
                if (!quotegroupingmap.containsKey(qutitem.buildertek__Grouping__c)) {
                    quotegroupingmap.put(qutitem.buildertek__Grouping__c, new list < buildertek__Quote_Item__c > ());
                }
                quotegroupingmap.get(qutitem.buildertek__Grouping__c).add(qutitem);

                if (qutitem.buildertek__Grouping__c != null) {
                    groupid.add(qutitem.buildertek__Grouping__c);
                    if(qutitem.buildertek__Grouping__r.Name == 'No Grouping'){
                        noGroupRow = true;
                    }
                }
            }

            Quotelinegroup = [Select Id, Name, buildertek__Sort_Id__c from buildertek__Quote_Line_Group__c where Id =: groupId AND Name != 'No Grouping' order by buildertek__Sort_Id__c ASC NULLS LAST, Name ASC];
            buildertek__Quote_Line_Group__c noGroup = [Select Id, Name from buildertek__Quote_Line_Group__c where Name = 'No Grouping' limit 1];

            if (noGroup != null && noGroupRow == true) {
                if(Quotelinegroup.size() > 0){
                    Quotelinegroup.add(0, noGroup);
                } else{
                    Quotelinegroup.add(noGroup);
                }
            }

            subTotal = 0;
            for (buildertek__Quote_Line_Group__c quotelinegrouprec: Quotelinegroup) {
                decimal quoteitemNetunitprice = 0.0;
                decimal quoteitemlistTotal = 0.0;
                wrapperClass wrap = new wrapperClass();
                wrap.quotelineitemlist = new List<QuoteItemWrapper>();
                Integer counter = 0;
                for (buildertek__Quote_Item__c quoteitemrec: quotegroupingmap.get(quotelinegrouprec.Id)) {
                    QuoteItemWrapper qiWrapper = new QuoteItemWrapper(quoteitemrec);
                    
                    // Check if the quote item belongs to the selected option
                    if (isOptionsEnabled && String.isNotBlank(selectedQuoteOption) && selectedQuoteOption != 'All') {
                        qiWrapper.isIncluded = (quoteitemrec.buildertek__Option__c == selectedQuoteOption || quoteitemrec.buildertek__Option__c == 'All' || quoteitemrec.buildertek__Option__c == null);
                    } else {
                        qiWrapper.isIncluded = true;
                    }
                    
                    if (qiWrapper.isIncluded) {
                        if (quoteitemrec.buildertek__Net_Unit__c != null) {
                            quoteitemNetunitprice += quoteitemrec.buildertek__Net_Unit__c;
                        }
                        if (quoteitemrec.buildertek__Net_Total_Price__c != null) {
                            quoteitemlistTotal += quoteitemrec.buildertek__Net_Total_Price__c;
                            subTotal += quoteitemrec.buildertek__Net_Total_Price__c;
                        }
                    }
                    
                    if (quoteitemrec.Not_Customer_Visible__c == false && counter == 0) {
                        wrap.groupName = quoteitemrec.buildertek__Grouping__r.Name;
                        counter = 1;
                    }
                    wrap.quotelineitemlist.add(qiWrapper);
                }
                wrap.netunitprice = quoteitemNetunitprice;
                wrap.listTotal = quoteitemlistTotal;

                wrapperlst.add(wrap);
            }

            // Recalculate total and grandTotal based on the new subTotal
            total = (subTotal - (subTotal*(discount/100))) + markupAmount;
            grandTotal = (total + (total*(tax/100))) + shippingHandling + additionalFee;

            system.debug(wrapperlst.size() + 'wrapperlst----->' + wrapperlst);    
        } catch (Exception ex) {
            BT_ExceptionHandler.Store_Exception(ex);
        }
        
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

    global class wrapperClass {
        global String groupName {get; set;}
        global decimal netunitprice {get; set;}
        global decimal listTotal {get; set;}
        global list <buildertek__Quote_Item__c> quotelineitemlst {get; set;}
        global list <QuoteItemWrapper> quotelineitemlist {get; set;}
        global list <string> labelnames {get; set;}
        global list <string> fieldsapiname {get; set;}
    }

    global class QuoteItemWrapper {
        global buildertek__Quote_Item__c quoteItem {get; set;}
        global Boolean isIncluded {get; set;}

        global QuoteItemWrapper(buildertek__Quote_Item__c qi) {
            this.quoteItem = qi;
            this.isIncluded = true;
        }

    }
}