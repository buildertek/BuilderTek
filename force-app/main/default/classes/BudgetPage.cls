public without sharing class BudgetPage {

    @AuraEnabled
    public static string deleteBudgetLine(Id budgetItemId) {

        try{
            buildertek__Budget_Item__c budgetItem = new buildertek__Budget_Item__c();
            budgetItem.Id = budgetItemId;
            delete budgetItem;
        
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
    public static allData getallData(Id budgetId) {

        try{

            allData ad = new allData();

            buildertek__Admin_Interface_Node_Configuration__c adminInterfaceNodeConfigurations = [SELECT Id, buildertek__Hide_Global_Margin__c, buildertek__Hide_Global_Markup__c 
                FROM buildertek__Admin_Interface_Node_Configuration__c 
                WHERE Name = 'Budget Configuration'];

            // Boolean checkSingleQLine = adminInterfaceNodeConfigurations.buildertek__Remove_Single_Quote_Line_Option__c ;
            // Boolean checkButtonMargin = adminInterfaceNodeConfigurations.buildertek__Hide_Global_Margin__c;
            // Boolean checkButtonMarkup = adminInterfaceNodeConfigurations.buildertek__Hide_Global_Markup__c;

            // ad.checkSingleQLine = adminInterfaceNodeConfigurations.buildertek__Remove_Single_Quote_Line_Option__c;
            ad.checkButtonMargin = adminInterfaceNodeConfigurations.buildertek__Hide_Global_Margin__c;
            ad.checkButtonMarkup = adminInterfaceNodeConfigurations.buildertek__Hide_Global_Markup__c;


            List<buildertek__Budget_Line_Group__c> BudgetItemGroupList = [SELECT Id, Name FROM buildertek__Budget_Line_Group__c ORDER BY Name];
            ad.BudgetItemGroupList = BudgetItemGroupList;

            ad.OrgCurrency = UserInfo.getDefaultCurrency();

            List<BT_Lightning_Utils.dataTableFields> Budgetcolumn = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Budget__c', 'buildertek__BudgetPage');
            ad.Budgetcolumns = Budgetcolumn;

            List<BT_Lightning_Utils.dataTableFields> BudgetLinecolumn = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Budget_Item__c', 'buildertek__BT_Detail_Page_Fields');
            ad.BudgetLineFields = BudgetLinecolumn;

            String budgetFields = '';
            for(BT_Lightning_Utils.dataTableFields dt : Budgetcolumn){
                if(dt.fieldName != 'Id' && dt.fieldName != 'Name' && dt.fieldName != 'buildertek__Project__r.Name'){
                    budgetFields += dt.fieldName + ',';
                }
            }
            budgetFields = budgetFields.removeEnd(',');

            String budgetQuery = 'SELECT Id, Name, buildertek__Project__r.Name, ' + budgetFields;
            budgetQuery += ' FROM buildertek__Budget__c WHERE Id =\'' + budgetId + '\'';
            System.debug('budgetQuery: ' + budgetQuery);

            buildertek__Budget__c  budget = Database.query(budgetQuery);
            ad.Budget = budget;
    
            String apiString = '';
    
            List<BT_Lightning_Utils.dataTableFields> column = BT_Lightning_Utils.getFieldSetForDataTable('buildertek__Budget_Item__c', 'buildertek__BT_Related_List_View_Fields');
            System.debug('column: ' + column);
            ad.columns = column;
    
            for(BT_Lightning_Utils.dataTableFields s : column){
                if(s.type == 'Reference'){
                    s.fieldName = s.fieldName.substringBefore('__c')+'__r.Name';
                }
                apiString += s.fieldName + ', ';
            }
    
            String query = 'SELECT Id, ' + apiString;
            query += 'buildertek__Group__c, buildertek__Group__r.Name, buildertek__Group__r.buildertek__Sort_Id__c FROM buildertek__Budget_Item__c WHERE buildertek__Budget__c =\'' + budgetId + '\'';
            query += ' ORDER BY buildertek__Group__r.buildertek__Sorting_Id__c NULLS Last, buildertek__Group__r.Name, buildertek__Sort_Id__c ASC NULLS Last, Name ASC';
            System.debug('query: ' + query);
    
            List<buildertek__Budget_Item__c> budgetLineList = Database.query(query);
            System.debug('budgetLineList: ' + budgetLineList);
            ad.budgetLineList = budgetLineList;

            ad.Status = 'Success';
            
            ad.dynamicFields = getFieldset();
            return ad;
        }catch(Exception ex){
            System.debug('Error: ' + ex.getMessage());
            List<buildertek__Exception_Log_Store_Option__c> StoreExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
            if (!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true) {
                BT_ExceptionHandler.Store_Exception(ex);
            }
            allData ad = new allData();
            ad.Status = 'Error' + ex.getMessage() + ex.getStackTraceString();
            return ad;
        }

    }

    @AuraEnabled
    public static string saveBL(buildertek__Budget_Item__c BL ){
        try{
            upsert BL;
            return 'Success';
        }catch(Exception ex){
            System.debug('Error: ' + ex.getMessage());
            List<buildertek__Exception_Log_Store_Option__c> StoreExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
            if (!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true) {
                BT_ExceptionHandler.Store_Exception(ex);
            }
            return ex.getMessage();
        }
    }

    @AuraEnabled
    public static massUpdateBudgetItemWrapper massUpdateBudget(String Budget) {
        massUpdateBudgetItemWrapper BIWrapper = new massUpdateBudgetItemWrapper();
        try {
            List<buildertek__Budget_Item__c> budgetLineList = [SELECT Id, Name, buildertek__Group__c, buildertek__Group__r.Name, buildertek__Budget__r.Name, buildertek__Quantity__c, buildertek__Unit_Price__c, buildertek__Markup__c, buildertek__Tax__c, buildertek__Forecast_To_Complete__c FROM buildertek__Budget_Item__c WHERE buildertek__Budget__c =: Budget ORDER BY buildertek__Group__r.buildertek__Sorting_Id__c NULLS Last, buildertek__Group__r.Name,buildertek__Sort_Id__c ASC NULLS LAST, Name ASC];
            BIWrapper.BudgetItemList = budgetLineList;
            
            List<buildertek__Budget_Line_Group__c> groupingList = [SELECT Id, Name FROM buildertek__Budget_Line_Group__c ORDER BY Name];
            BIWrapper.BudgetItemGroupList = groupingList;
            
            return BIWrapper;
        } catch(Exception e) {
            System.debug(e.getMessage());
            BT_ExceptionHandler.Store_Exception(e);
            BIWrapper.BudgetItemList = new List<buildertek__Budget_Item__c>();
            BIWrapper.BudgetItemGroupList = new List<buildertek__Budget_Line_Group__c>();
            return BIWrapper;
        }
    }

    @AuraEnabled
    public static String massUpdateBudgetItem(String BudgetItems) {
        try {
            List<BudgetItemWrapper> budgetItemsList = (List<BudgetItemWrapper>) JSON.deserialize(BudgetItems, List<BudgetItemWrapper>.class);
            List<buildertek__Budget_Item__c> budgetItemList = new List<buildertek__Budget_Item__c>();

            for (BudgetItemWrapper BudgetItemWrapper : budgetItemsList) {
                buildertek__Budget_Item__c budgetItem = new buildertek__Budget_Item__c();
                budgetItem.Id = BudgetItemWrapper.BudgetItemId;
                budgetItem.Name = BudgetItemWrapper.Name;
                budgetItem.buildertek__Quantity__c = BudgetItemWrapper.Quantity;
                budgetItem.buildertek__Unit_Price__c = BudgetItemWrapper.UnitCost;
                budgetItem.buildertek__Markup__c = BudgetItemWrapper.Markup;
                budgetItem.buildertek__Tax__c = BudgetItemWrapper.Tax;
                budgetItem.buildertek__Forecast_To_Complete__c = BudgetItemWrapper.ForeToComplete;

                budgetItemList.add(budgetItem);
            }
            
            update budgetItemList;

            return 'Success';

        } catch(Exception e) {
            System.debug('Error: ' + e.getMessage());
            BT_ExceptionHandler.Store_Exception(e);
            return 'Error: ' + e.getMessage();
        }
    }

    @AuraEnabled
    public static poDataTableWrapper getPOData(String budgetId) {
        poDataTableWrapper poData = new poDataTableWrapper();

        try {
            buildertek__Budget__c budgetRec = [SELECT Id, Name, buildertek__Project__c FROM buildertek__Budget__c WHERE Id = :budgetId LIMIT 1];

            Boolean isMultiCurrency = UserInfo.isMultiCurrencyOrganization();

            if (isMultiCurrency) {
                String status = 'Master';
                poData.poList = [SELECT Id, Name, buildertek__Status__c, buildertek__Project__c, buildertek__Project__r.Name, buildertek__PO_Type__c, buildertek__Description__c, buildertek__Vendor__c, buildertek__Vendor__r.Name, buildertek__PO_Total__c FROM buildertek__Purchase_Order__c WHERE buildertek__Budget__c = null AND buildertek__Budget_Line__c = null AND buildertek__Project__c = :budgetRec.buildertek__Project__c AND buildertek__Vendor__c != null AND buildertek__PO_Type__c != :status AND buildertek__Status__c != 'Canceled' AND buildertek__Status__c != 'Vendor Rejected' AND Id NOT IN (SELECT buildertek__Purchase_Order__c FROM buildertek__Purchase_Order_Item__c WHERE buildertek__BT_Budget__c != null ) ORDER BY Name ASC];
            } else {
                poData.poList = [SELECT Id, Name, buildertek__Status__c, buildertek__Project__c, buildertek__Project__r.Name, buildertek__PO_Type__c, buildertek__Description__c, buildertek__Vendor__c, buildertek__Vendor__r.Name, buildertek__PO_Total__c FROM buildertek__Purchase_Order__c WHERE buildertek__Budget__c = null AND buildertek__Budget_Line__c = null AND buildertek__Project__c = :budgetRec.buildertek__Project__c AND buildertek__Vendor__c != null AND buildertek__PO_Type__c != 'Master' AND buildertek__Status__c != 'Canceled' AND buildertek__Status__c != 'Vendor Rejected' AND Id NOT IN (SELECT buildertek__Purchase_Order__c FROM buildertek__Purchase_Order_Item__c WHERE buildertek__BT_Budget__c != null ) ORDER BY Name ASC];
            }

            poData.poItemList = [SELECT Id, Name, buildertek__Purchase_Order__r.Name, buildertek__Purchase_Order__r.buildertek__Description__c, buildertek__Purchase_Order__r.buildertek__Project__r.Name, buildertek__Purchase_Order__r.buildertek__PO_Type__c, buildertek__Purchase_Order__r.buildertek__Vendor__c, buildertek__Purchase_Order__r.buildertek__Vendor__r.Name, buildertek__Purchase_Order__r.buildertek__Project__c, buildertek__Total_Amount_Tax__c FROM buildertek__Purchase_Order_Item__c WHERE buildertek__Purchase_Order__r.buildertek__Project__c = :budgetRec.buildertek__Project__c AND buildertek__Purchase_Order__r.buildertek__Vendor__c != null AND buildertek__BT_Budget__c = null AND buildertek__Budget_Item__c = null AND buildertek__Purchase_Order__r.buildertek__Budget_Line__c = null AND buildertek__Purchase_Order__r.buildertek__Budget__c = null AND buildertek__Purchase_Order__r.buildertek__PO_Type__c != 'Master' ORDER BY buildertek__Purchase_Order__r.Name, Name NULLS Last];
        } catch (Exception e) {
            System.debug('Exception occurred: ' + e.getMessage());
            BT_ExceptionHandler.Store_Exception(e);
            poData = null;
        }
        return poData;
    }

    // @AuraEnabled
    // public static string addGlobalMargin(Id budgetId, Decimal margin) {
    //     try{
    //         List<buildertek__Budget_Item__c> budgetItemList = [SELECT Id, Name, buildertek__Markup__c  FROM buildertek__Budget_Item__c WHERE buildertek__Budget__c = :budgetId];
    //         for(buildertek__Budget_Item__c budgetItem : budgetItemList){
    //             if(budgetItem.buildertek__Markup__c == null || budgetItem.buildertek__Markup__c == 0 ){
    //                 budgetItem.buildertek__Markup__c = margin;
    //             }
    //         }

    //         update budgetItemList;
    //         return 'Success';
    //     } catch(Exception ex){
    //         System.debug('Error: ' + ex.getMessage());
    //         BT_ExceptionHandler.Store_Exception(ex);
    //         return ex.getMessage();
    //     }
    // }


    @AuraEnabled
    public static string addGlobalMarkup(Id budgetId, Decimal markup) {
        try{
            List<buildertek__Budget_Item__c> budgetItemList = [SELECT Id, Name, buildertek__Markup__c  FROM buildertek__Budget_Item__c WHERE buildertek__Budget__c = :budgetId];
            for(buildertek__Budget_Item__c budgetItem : budgetItemList){
                if(budgetItem.buildertek__Markup__c == null || budgetItem.buildertek__Markup__c == 0 ){
                    budgetItem.buildertek__Markup__c = markup;
                }
            }

            update budgetItemList;
            return 'Success';
        } catch(Exception ex){
            System.debug('Error: ' + ex.getMessage());
            BT_ExceptionHandler.Store_Exception(ex);
            return ex.getMessage();
        }
    }

    public static List<Map<String,Object>> getFieldset(){
        List<Map<String, Object>> returnMap = new List<Map<String, Object>>();
        try {
            Schema.FieldSet fieldSet = Schema.SObjectType.buildertek__Budget_Item__c.fieldSets.getMap().get('buildertek__Single_Line_Budget_Fields');
            for (Schema.FieldSetMember fieldSetMember : fieldSet.getFields()) {
                Map<String, Object> fieldMap = new Map<String, Object>();

                String label = fieldSetMember.getLabel();
                fieldMap.put('label', label);   

                String type = String.valueOf(fieldSetMember.getType());
                if (type == 'PICKLIST' || label == 'Phase') {
                    fieldMap.put('isPicklist', true);
                    fieldMap.put('isReference', false);

                    if (label != 'Phase') {
                        Schema.SObjectType objSobjectType = Schema.getGlobalDescribe().get('buildertek__Budget_Item__c') ;
                        Schema.DescribeSObjectResult objDescribeSobject = objSobjectType.getDescribe() ;
                        Map<String,Schema.SObjectField> fields = objDescribeSobject.fields.getMap() ;
                        Schema.DescribeFieldResult fieldResult = fields.get(String.valueOf(fieldSetMember.getFieldPath())).getDescribe();
                        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
                        List<Map<String,String>> picklistOptions = new List<Map<String,String>>();
                        for(Schema.PicklistEntry pickListVal : ple){
                            picklistOptions.add(new Map<String,String>{
                                'label' => pickListVal.getLabel(),
                                'value' => pickListVal.getValue()
                            });
                        }
                        fieldMap.put('option', picklistOptions);
                    }
                }  else if (type == 'REFERENCE') {
                    fieldMap.put('isPicklist', false);
                    fieldMap.put('isReference', true);

                    Schema.DescribeFieldResult field = Schema.getGlobalDescribe().get('buildertek__Budget_Item__c').getDescribe().fields.getMap().get(fieldSetMember.getFieldPath()).getDescribe();
                    fieldMap.put('parent', String.valueOf(field.getReferenceTo()[0]));

                    if (label == 'Category' ) {
                        fieldMap.put('icon', 'standard:crypto_product_category_wallet_role');
                    } else if (label == 'Cost Code') {
                        fieldMap.put('icon', 'standard:dataset');
                    } else {
                        fieldMap.put('icon', 'standard:custom_notification');
                    }
                } else {
                    fieldMap.put('isPicklist', false);
                    fieldMap.put('isReference', false);
                }
                if (type == 'DOUBLE' || type == 'PERCENT' || type == 'CURRENCY') {
                    fieldMap.put('type', 'number');
                } else {
                    fieldMap.put('type', 'text');
                }
                if (type == 'CURRENCY' ) {
                    fieldMap.put('formatter', 'currency');
                }

                fieldMap.put('name', fieldSetMember.getFieldPath());
                fieldMap.put('required', fieldSetMember.getRequired());

                // default values 
                if (label == 'Phase') {
                    fieldMap.put('value', 'No Grouping');
                } else if (label == 'Quantity') {
                    fieldMap.put('value', 1);
                } else if (label == 'Unit Cost') {
                    fieldMap.put('value', 0.00);
                    fieldMap.put('step', '0.01');
                } else if (label == 'Markup (%)') {
                    fieldMap.put('step', '0.01');
                }

                returnMap.add(fieldMap);
            }

        } catch (Exception e) {
            System.debug('Exception in getFieldset==>' + e.getMessage() + e.getLineNumber());
        }
        return returnMap;
    }

    @AuraEnabled
    public static string lockBudget(Id budgetId) {
        try{
            buildertek__Budget__c budget = [SELECT Id, buildertek__Original_Budget__c, buildertek__Total_Sales_Price__c, buildertek__Is_Budget_Locked__c, buildertek__Original_Budget_Currency__c, buildertek__Original_Sales_Price__c FROM buildertek__Budget__c WHERE Id = :budgetId];
            
            List<buildertek__Budget_Item__c> budgetItemList = [SELECT Id, Name, buildertek__Markup__c, buildertek__Quantity__c, buildertek__Unit_Price__c FROM buildertek__Budget_Item__c WHERE buildertek__Budget__c =: budgetId];

            if(budget.buildertek__Original_Budget_Currency__c == null || budget.buildertek__Original_Sales_Price__c == null){
                budget.buildertek__Original_Budget_Currency__c = budget.buildertek__Original_Budget__c;
                budget.buildertek__Original_Sales_Price__c = budget.buildertek__Total_Sales_Price__c;
                update budget;
                if (budgetItemList.size() > 0) {
                    for (buildertek__Budget_Item__c budgetItem : budgetItemList) {
                        budgetItem.buildertek__Original_Unit_Cost__c = budgetItem.buildertek__Unit_Price__c;
                        budgetItem.buildertek__Original_Quantity__c = budgetItem.buildertek__Quantity__c;
                        budgetItem.buildertek__Original_Markup__c = budgetItem.buildertek__Markup__c;
                    }
                    update budgetItemList;
                }
                return 'Success';
            } else {
                return 'Budget is already locked';
            }
        } catch(Exception ex){
            System.debug('Error: ' + ex.getMessage());
            BT_ExceptionHandler.Store_Exception(ex);
            return ex.getMessage();
        }
    }

    @AuraEnabled
    public static List<buildertek__Budget_Modification_Sheet__c> fetchBudgetModification(Id budgetId) {
        try {
            String projectId = [SELECT Id, buildertek__Project__c FROM buildertek__Budget__c WHERE Id = :budgetId].buildertek__Project__c;
            return [SELECT Id, Name, buildertek__Total_Amount_Transferred__c, buildertek__Account__c, buildertek__Account__r.Name, buildertek__Approver__c, buildertek__Approver__r.Name FROM buildertek__Budget_Modification_Sheet__c WHERE buildertek__Project__c = :projectId ORDER BY Name ASC];
        } catch (Exception e) {
            System.debug('Exception occurred: ' + e.getMessage());
            BT_ExceptionHandler.Store_Exception(e);
            return null;
        }
    }

    @AuraEnabled
    public static String getOrgCurrency() {
        return UserInfo.getDefaultCurrency();
    }

    @AuraEnabled
    public static List<buildertek__Budget_Item__c> fetchBudgetLine(Id budgetId) {
        return [SELECT Id, Name, buildertek__Allowable_Modification__c FROM buildertek__Budget_Item__c WHERE buildertek__Budget__c = :budgetId ORDER BY Name ASC];
    }

    @AuraEnabled
    public static String createBudgetModificationDetails(Id budgetId, String budgetModificationLines) {
        try {
            List<BudgetModificationLineWrapper> newBudgetModificationLines = (List<BudgetModificationLineWrapper>) JSON.deserialize(budgetModificationLines, List<BudgetModificationLineWrapper>.class);
            List<buildertek__BT_Budget_Modification_Detail__c> budgetModificationSheetDetails = new List<buildertek__BT_Budget_Modification_Detail__c>();
            String budgetModificationSheetId = newBudgetModificationLines[0].BudgetModificationSheetId;

            Map<Id, buildertek__Budget_Item__c> budgetItemMap = new Map<Id, buildertek__Budget_Item__c>([SELECT Id, Name, buildertek__Budget_Modifications__c FROM buildertek__Budget_Item__c WHERE buildertek__Budget__c = :budgetId ORDER BY Name ASC]);
            
            for (BudgetModificationLineWrapper budgetModificationLine : newBudgetModificationLines) {
                buildertek__BT_Budget_Modification_Detail__c budgetModificationSheetDetail = new buildertek__BT_Budget_Modification_Detail__c();
                budgetModificationSheetDetail.buildertek__Budget_Modification_Sheet__c = budgetModificationSheetId;
                budgetModificationSheetDetail.buildertek__Line_To_Move_Money_From__c = budgetModificationLine.fromBudgetLine;
                budgetModificationSheetDetail.buildertek__Line_To_Move_Money_To__c = budgetModificationLine.toBudgetLine;
                budgetModificationSheetDetail.buildertek__Notes__c = budgetModificationLine.notes;
                budgetModificationSheetDetail.buildertek__Amount_To_Transfer__c = 0 - budgetModificationLine.transferAmount;
                budgetModificationSheetDetail.buildertek__Budget__c = budgetId;
                budgetItemMap.get(budgetModificationLine.fromBudgetLine).buildertek__Budget_Modifications__c -= budgetModificationLine.transferAmount;
                if (budgetItemMap.get(budgetModificationLine.toBudgetLine).buildertek__Budget_Modifications__c == null || budgetItemMap.get(budgetModificationLine.toBudgetLine).buildertek__Budget_Modifications__c == 0) {
                    budgetItemMap.get(budgetModificationLine.toBudgetLine).buildertek__Budget_Modifications__c = budgetModificationLine.transferAmount;
                } else {
                    budgetItemMap.get(budgetModificationLine.toBudgetLine).buildertek__Budget_Modifications__c += budgetModificationLine.transferAmount;
                }
                budgetModificationSheetDetails.add(budgetModificationSheetDetail);
            }
            insert budgetModificationSheetDetails;

            update budgetItemMap.values();
            return 'Success';
        } catch (Exception e) {
            System.debug('Exception occurred: ' + e.getMessage());
            BT_ExceptionHandler.Store_Exception(e);
            return 'Error: ' + e.getMessage();
        }
    }

    public class BudgetModificationLineWrapper {
        @AuraEnabled public String fromBudgetLine;
        @AuraEnabled public String toBudgetLine;
        @AuraEnabled public Decimal transferAmount;
        @AuraEnabled public Decimal allowableModification;
        @AuraEnabled public String notes;
        @AuraEnabled public String BudgetModificationSheetId;
    }

    public class allData{

        @AuraEnabled
        public List<BT_Lightning_Utils.dataTableFields> BudgetLineFields;

        @AuraEnabled
        public boolean checkSingleQLine;

        @AuraEnabled
        public boolean checkButtonMargin;

        @AuraEnabled
        public boolean checkButtonMarkup;

        @AuraEnabled
        public List<buildertek__Quote_Line_Group__c> QuoteItemGroupList;

        @AuraEnabled
        public List<buildertek__Budget_Line_Group__c> BudgetItemGroupList;

        @AuraEnabled
        public string OrgCurrency;

        @AuraEnabled
        public List<BT_Lightning_Utils.dataTableFields> Budgetcolumns;

        @AuraEnabled
        public buildertek__Quote__c Quote;

        @AuraEnabled
        public List<buildertek__Quote_Item__c> quoteLineList;

        @AuraEnabled
        public buildertek__Budget__c Budget;

        @AuraEnabled
        public List<buildertek__Budget_Item__c> budgetLineList;

        @AuraEnabled
        public List<BT_Lightning_Utils.dataTableFields> columns;

        @AuraEnabled
        public string status;

        @AuraEnabled
        public List<Map<String,Object>> dynamicFields;
    }

    public class BudgetItemWrapper {
        @AuraEnabled public String BudgetItemId;
        @AuraEnabled public String Name;
        @AuraEnabled public Decimal Quantity;
        @AuraEnabled public Decimal UnitCost;
        @AuraEnabled public Decimal Markup;
        @AuraEnabled public Decimal Tax;
        @AuraEnabled public Decimal ForeToComplete;
    }

    public class massUpdateBudgetItemWrapper {

        @AuraEnabled 
        public List<buildertek__Budget_Item__c> BudgetItemList;
        
        @AuraEnabled
        public List<buildertek__Budget_Line_Group__c> BudgetItemGroupList;
    }

    public class poDataTableWrapper {
        @AuraEnabled
        public List<buildertek__Purchase_Order__c> poList{ get; set; }

        @AuraEnabled
        public List<buildertek__Purchase_Order_Item__c> poItemList{ get; set; }
    }
}