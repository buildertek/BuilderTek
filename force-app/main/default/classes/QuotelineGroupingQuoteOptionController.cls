global without sharing class QuotelineGroupingQuoteOptionController {

    global string quoteid;
    global string RollupAllGroupName{ get; set; }
    global string selectedQuoteOption{ get; set; }
    global list<buildertek__Quote_Item__c> QuoteItem;
    global list<buildertek__Quote_Line_Group__c> Quotelinegroup;
    global list<buildertek__Cost_Codes__c> QuotelineCostCode;
    global map<id, list<buildertek__Quote_Item__c>> quotegroupingmap;
    global map<id, list<buildertek__Quote_Item__c>> quoteCostCodemap;

    global decimal Totalquotelineamount{ get; set; }
    global list<wrapperClass> wrapperlst{ get; set; }
    global list<buildertek__Quote__c> quotesList{ get; set; }

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

    global void setquoteOption(string quoteOption){
        this.selectedQuoteOption = quoteOption;
    }

    global string getquoteOption(){
        return selectedQuoteOption;
    }

    global void setrelatedToId(string Id){
        this.quoteid = Id;
        Quotelinegroupingdata();
    }

    global string getrelatedToId(){
        return quoteid;
    }

    global string gettableFooterFieldsName(){
        return tableFooterFieldsAPINames;
    }

    global void settableFooterFieldsName(string tableFooterFieldsName){
        this.tableFooterFieldsAPINames = tableFooterFieldsName;
        populateDynamicFields();
    }

    global void Quotelinegroupingdata(){
        // if (String.isNotBlank(selectedQuoteOption)) {
        //     Map<String, String> selectedOptionMap = (Map<String, String>)JSON.deserialize(selectedQuoteOption, Map<String, String>.class);
        //     selectedQuoteOption = selectedOptionMap.get('SelectedOption');
        // }
        buildertek__Admin_Interface_Node_Configuration__c adminInterfaceNodeConfigurations = [Select Id, buildertek__Color_code__c, buildertek__Display_Quote_Options__c from buildertek__Admin_Interface_Node_Configuration__c WHERE Name =: 'Quote Configuration'];
        if(adminInterfaceNodeConfigurations.buildertek__Display_Quote_Options__c == true){
            isOptionsEnabled = true;
        } else{
            isOptionsEnabled = false;
        }
        wrapperlst = new list<wrapperClass>();
        Totalquotelineamount = 0.0;
        quotesList = [SELECT Id, buildertek__Project__c, buildertek__Roll_Up__c, buildertek__Rollup_by_Group__c, buildertek__Roll_Up_All_Lines_by_Cost_Code__c, buildertek__Subtotal__c, buildertek__Total__c, buildertek__Markup_Amount__c, buildertek__Tax__c, buildertek__Grand_Total__c, buildertek__Discount__c, buildertek__Additional_Fees__c, buildertek__Shipping_and_Handling__c FROM buildertek__Quote__c WHERE id = :quoteid limit 1];

        tax = (quotesList[0].buildertek__Tax__c != null) ? quotesList[0].buildertek__Tax__c : 0;
        discount = (quotesList[0].buildertek__Discount__c != null) ? quotesList[0].buildertek__Discount__c : 0;
        shippingHandling = (quotesList[0].buildertek__Shipping_and_Handling__c != null) ? quotesList[0].buildertek__Shipping_and_Handling__c : 0;
        additionalFee = (quotesList[0].buildertek__Additional_Fees__c != null) ? quotesList[0].buildertek__Additional_Fees__c : 0;
        markupAmount = (quotesList[0].buildertek__Markup_Amount__c != null) ? quotesList[0].buildertek__Markup_Amount__c : 0;

        String query = 'SELECT Id, Name, buildertek__Product__c, buildertek__Quote__c, buildertek__Quote__r.name, buildertek__Grouping__c, buildertek__Cost_Code__c, buildertek__Grouping__r.Name, buildertek__Unit_Cost__c, buildertek__Unit_Price__c, buildertek__Net_Unit__c, buildertek__Total_Cost__c, buildertek__List_Total__c, buildertek__Net_Total_Price__c, buildertek__Gross_Profit__c, buildertek__Quantity__c, buildertek__Status__c, buildertek__Discount__c FROM buildertek__Quote_Item__c';
        query += ' WHERE buildertek__Quote__c = :quoteid AND buildertek__Status__c = \'Accept\' AND buildertek__Not_Customer_Visible__c = false';
        
        if(isOptionsEnabled == true){
            if (String.isNotBlank(selectedQuoteOption) && selectedQuoteOption != 'All') {
                query += ' AND ( buildertek__Option__c = :selectedQuoteOption OR buildertek__Option__c = \'All\' )';
            }
        }
        
        QuoteItem = Database.query(query);

        // Roll-Up All Lines by Group
        if (quotesList[0].buildertek__Rollup_by_Group__c == true && quotesList[0].buildertek__Roll_Up__c != true){
            set<Id> groupid = new set<Id>();
            quotegroupingmap = new map<id, list<buildertek__Quote_Item__c>>();
            for (buildertek__Quote_Item__c qutitem : QuoteItem){
                if (!quotegroupingmap.containsKey(qutitem.buildertek__Grouping__c)){
                    quotegroupingmap.put(qutitem.buildertek__Grouping__c, new list<buildertek__Quote_Item__c>());
                }
                quotegroupingmap.get(qutitem.buildertek__Grouping__c).add(qutitem);

                if (qutitem.buildertek__Grouping__c != null){
                    groupid.add(qutitem.buildertek__Grouping__c);
                }
            } 

            Quotelinegroup = [SELECT Id, Name,buildertek__Sort_Id__c FROM buildertek__Quote_Line_Group__c WHERE Id =: groupId ORDER BY buildertek__Sort_Id__c ASC NULLS LAST, Name ASC];
            for (buildertek__Quote_Line_Group__c quotelinegrouprec : Quotelinegroup){
                decimal quoteitemNetunitprice = 0.0;
                decimal quoteitemlistTotal = 0.0;
                wrapperClass wrap = new wrapperClass();
                wrap.groupName = quotelinegrouprec.Name;
                for (buildertek__Quote_Item__c quoteitemrec : quotegroupingmap.get(quotelinegrouprec.Id)){
                    if (quoteitemrec.buildertek__Net_Unit__c != null){
                        quoteitemNetunitprice += quoteitemrec.buildertek__Net_Unit__c;
                    }
                    if (quoteitemrec.buildertek__Net_Total_Price__c != null){
                        quoteitemlistTotal += quoteitemrec.buildertek__Net_Total_Price__c;
                    }
                }
                wrap.netunitprice = quoteitemNetunitprice;
                wrap.listTotal = quoteitemlistTotal;
                wrapperlst.add(wrap);
            }

            if (quotegroupingmap.containsKey(null) &&  quotegroupingmap.get(null).size() > 0) {
                wrapperClass wrap = new wrapperClass();
                wrap.groupName = 'Grouping None';
                decimal quoteitemNetunitprice = 0.0;
                decimal quoteitemlistTotal = 0.0;
                for (buildertek__Quote_Item__c quoteLineWithNullCostCode : quotegroupingmap.get(null)) {
                    if (quoteLineWithNullCostCode != null) {
                        if (quoteLineWithNullCostCode.buildertek__Net_Unit__c != null){
                            quoteitemNetunitprice += quoteLineWithNullCostCode.buildertek__Net_Unit__c;
                        }
                        if (quoteLineWithNullCostCode.buildertek__Net_Total_Price__c != null){
                            quoteitemlistTotal += quoteLineWithNullCostCode.buildertek__Net_Total_Price__c;
                        }
                    }
                }
                wrap.netunitprice = quoteitemNetunitprice;
                wrap.listTotal = quoteitemlistTotal;
                wrapperlst.add(wrap);
            }

            system.debug(wrapperlst.size() + 'wrapperlst----->' + wrapperlst);
            subTotal = 0;
            for(wrapperClass wrc : wrapperlst){
                subTotal += wrc.listTotal;
            }
            total = (subTotal - (subTotal*(discount/100))) + markupAmount;
            grandTotal = (total + (total*(tax/100))) + shippingHandling + additionalFee;
            System.debug('grandTotal ==> '+grandTotal);
        }

        // Roll-Up All Lines
        if (((quotesList[0].buildertek__Roll_Up__c == true && quotesList[0].buildertek__Rollup_by_Group__c == true) || quotesList[0].buildertek__Roll_Up__c == true)){
            wrapperClass wrap = new wrapperClass();
            for (buildertek__Quote_Item__c qutitem : QuoteItem){
                Totalquotelineamount += qutitem.buildertek__Net_Total_Price__c;
            }
            wrap.groupName = 'All Work and Material';
            wrap.listTotal = Totalquotelineamount;
            wrapperlst.add(wrap);

            subTotal = 0;
            for(wrapperClass wrc : wrapperlst){
                subTotal += wrc.listTotal;
            }
            total = (subTotal - (subTotal*(discount/100))) + markupAmount;
            grandTotal = (total + (total*(tax/100))) + shippingHandling + additionalFee;
            System.debug('grandTotal ==> '+grandTotal);
        }

        // Roll-Up All Lines by Cost Code
        if (quotesList[0].buildertek__Roll_Up_All_Lines_by_Cost_Code__c == true){
            system.debug('QuoteItem---->' + QuoteItem.size());
            set<Id> costCodeId = new set<Id>();
            quoteCostCodemap = new map<id, list<buildertek__Quote_Item__c>>();
            for (buildertek__Quote_Item__c qutitem : QuoteItem){
                if (!quoteCostCodemap.containsKey(qutitem.buildertek__Cost_Code__c)){
                    quoteCostCodemap.put(qutitem.buildertek__Cost_Code__c, new list<buildertek__Quote_Item__c>());
                }
                quoteCostCodemap.get(qutitem.buildertek__Cost_Code__c).add(qutitem);

                if (qutitem.buildertek__Cost_Code__c != null){
                    costCodeId.add(qutitem.buildertek__Cost_Code__c);
                }
            }

            QuotelineCostCode = [Select Id, Name, buildertek__Major_Description__c
                              from buildertek__Cost_Codes__c
                              where Id = :costCodeId ORDER BY Name];
            system.debug('QuotelineCostCodesize---->' + QuotelineCostCode.size());

            for (buildertek__Cost_Codes__c quotelinegrouprec : QuotelineCostCode){
                decimal quoteitemNetunitprice = 0.0;
                decimal quoteitemlistTotal = 0.0;
                wrapperClass wrap = new wrapperClass();
                wrap.groupName = quotelinegrouprec.Name;
                wrap.groupMajorDescription = quotelinegrouprec.buildertek__Major_Description__c;
                for (buildertek__Quote_Item__c quoteitemrec : quoteCostCodemap.get(quotelinegrouprec.Id)){
                    if (quoteitemrec.buildertek__Net_Unit__c != null){
                        quoteitemNetunitprice += quoteitemrec.buildertek__Net_Unit__c;
                    }
                    if (quoteitemrec.buildertek__Net_Total_Price__c != null){
                        quoteitemlistTotal += quoteitemrec.buildertek__Net_Total_Price__c;
                    }
                }
                wrap.netunitprice = quoteitemNetunitprice;
                wrap.listTotal = quoteitemlistTotal;
                wrapperlst.add(wrap);
            }

            if (quoteCostCodemap.containsKey(null) &&  quoteCostCodemap.get(null).size() > 0) {
                wrapperClass wrap = new wrapperClass();
                wrap.groupName = 'No Cost Code';
                decimal quoteitemNetunitprice = 0.0;
                decimal quoteitemlistTotal = 0.0;
                for (buildertek__Quote_Item__c quoteLineWithNullCostCode : quoteCostCodemap.get(null)) {
                    if (quoteLineWithNullCostCode != null) {
                        if (quoteLineWithNullCostCode.buildertek__Net_Unit__c != null){
                            quoteitemNetunitprice += quoteLineWithNullCostCode.buildertek__Net_Unit__c;
                        }
                        if (quoteLineWithNullCostCode.buildertek__Net_Total_Price__c != null){
                            quoteitemlistTotal += quoteLineWithNullCostCode.buildertek__Net_Total_Price__c;
                        }
                    }
                }
                wrap.netunitprice = quoteitemNetunitprice;
                wrap.listTotal = quoteitemlistTotal;
                wrapperlst.add(wrap);
            }
            system.debug(wrapperlst.size() + 'wrapperlst----->' + wrapperlst);

            subTotal = 0;
            for(wrapperClass wrc : wrapperlst){
                subTotal += wrc.listTotal;
            }
            total = (subTotal - (subTotal*(discount/100))) + markupAmount;
            grandTotal = (total + (total*(tax/100))) + shippingHandling + additionalFee;
            System.debug('grandTotal ==> '+grandTotal);
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

    global class wrapperClass{
        global String groupName{ get; set; }
        global decimal netunitprice{ get; set; }
        global decimal listTotal{ get; set; }
        global String groupMajorDescription{ get; set; }
    }

}