public with sharing class CreateQuoteFromBOMController {
    
    @AuraEnabled
    public static string createQuote(String recordId) {
        
        try {            
            List<buildertek__Select_Sheet__c> BOMLineList = [SELECT Id, Name, buildertek__Product__c, buildertek__Product__r.Name, buildertek__Product_Name__c, 
            buildertek__Category__c,buildertek__Sort_Id__c, buildertek__Tax_Percent__c,buildertek__Quantity__c, buildertek__BL_MARKUP__c, buildertek__BL_UNIT_COST__c, 
            buildertek__Vendor__c, buildertek__Build_Phase__c, buildertek__Build_Phase__r.Name, buildertek__Selection_Sheet_Takeoff__r.buildertek__Name__c, buildertek__BL_LIST_PRICE_F__c,
            buildertek__Selection_Sheet_Takeoff__r.buildertek__Project__c, buildertek__Cost_Code__c FROM buildertek__Select_Sheet__c WHERE buildertek__Selection_Sheet_Takeoff__c = :RecordId];
            
            List<buildertek__Quote_Line_Group__c> groupList = [SELECT Id, Name FROM buildertek__Quote_Line_Group__c];
            
            Map<String, buildertek__Quote_Line_Group__c> groupMap = new Map<String, buildertek__Quote_Line_Group__c>();

            for (buildertek__Quote_Line_Group__c phaseGroup : groupList) {
                groupMap.put(phaseGroup.Name, phaseGroup);
            }

            if(groupMap.get('No Grouping') == null){
                buildertek__Quote_Line_Group__c noGroup = new buildertek__Quote_Line_Group__c();
                noGroup.Name = 'No Grouping';
                insert noGroup;
                groupMap.put(noGroup.Name, noGroup);
            }

            buildertek__Quote__c quote = new buildertek__Quote__c();
            if (BOMLineList.size() > 0) {
                quote.buildertek__Bill_of_Material__c = recordId;
                quote.Name = BOMLineList[0].buildertek__Selection_Sheet_Takeoff__r.buildertek__Name__c;
                quote.buildertek__Project__c = BOMLineList[0].buildertek__Selection_Sheet_Takeoff__r.buildertek__Project__c;
                insert quote;
            } else {
                buildertek__Project_Selection_Sheet_Takeoff__c BOMRecord = [SELECT Id, buildertek__Name__c, buildertek__Project__c FROM buildertek__Project_Selection_Sheet_Takeoff__c WHERE Id = :RecordId]; 
                quote.buildertek__Bill_of_Material__c = recordId;
                quote.Name = BOMRecord.buildertek__Name__c;
                quote.buildertek__Project__c = BOMRecord.buildertek__Project__c;
                insert quote;
            }

            if (BOMLineList.size() > 0) {
                List<buildertek__Quote_Item__c> quoteLineList = new List<buildertek__Quote_Item__c>();

                for (buildertek__Select_Sheet__c BOMLine : BOMLineList) {
                    buildertek__Quote_Item__c quoteLine = new buildertek__Quote_Item__c();
                    quoteLine.buildertek__Quote__c = quote.Id;
                    quoteLine.buildertek__Product__c = BOMLine.buildertek__Product__c;
                    quoteLine.Name = BOMLine.Name;
                    quoteLine.buildertek__Item_Name__c = BOMLine.buildertek__Product__r.Name;
                    quoteLine.buildertek__Quantity__c = BOMLine.buildertek__Quantity__c;
                    //quoteLine.buildertek__Markup__c = BOMLine.buildertek__BL_MARKUP__c;
                    quoteLine.buildertek__Unit_Cost__c = BOMLine.buildertek__BL_LIST_PRICE_F__c;
                    quoteLine.buildertek__Vendor__c = BOMLine.buildertek__Vendor__c;
                    quoteLine.buildertek__Build_Phase__c = BOMLine.buildertek__Build_Phase__c;
                    quoteLine.buildertek__Category__c = BOMLine.buildertek__Category__c;
                    quoteLine.buildertek__Priority__c = BOMLine.buildertek__Sort_Id__c;
                    quoteline.buildertek__Cost_Code__c = BOMLine.buildertek__Cost_Code__c;
                    //quoteLine.buildertek__Tax__c = BOMLine.buildertek__Tax_Percent__c;                                        
                    
                    if (groupMap.get(BOMLine.buildertek__Build_Phase__r.Name) != null){
                        quoteLine.buildertek__Grouping__c = groupMap.get(BOMLine.buildertek__Build_Phase__r.Name).Id;
                    } else{
                        quoteLine.buildertek__Grouping__c = groupMap.get('No Grouping').Id;
                    }

                    quoteLineList.add(quoteLine);
                }
                
                if (quoteLineList.size() > 0){
                    QuoteItemTriggerHandler.isInsertCostCodeExecuted = false;
                    insert quoteLineList;
                    QuoteItemTriggerHandler.isInsertCostCodeExecuted = true;
                }

                List<buildertek__Quote_Item__c> updateQuoteLine = new List<buildertek__Quote_Item__c>();
                
                for (buildertek__Quote_Item__c quoteLine : quoteLineList) {
                    quoteLine.buildertek__Description__c = quoteLine.Name;
                    updateQuoteLine.add(quoteLine);
                }

                if (updateQuoteLine.size() > 0){
                    QuoteItemTriggerHandler.isInsertCostCodeExecuted = false;
                    update updateQuoteLine;
                    QuoteItemTriggerHandler.isInsertCostCodeExecuted = true;
                }

                buildertek__Project_Selection_Sheet_Takeoff__c BOMRecord = new buildertek__Project_Selection_Sheet_Takeoff__c();
                BOMRecord.Id = RecordId;
                BOMRecord.buildertek__BT_Quote__c = quote.Id;
                update BOMRecord;
            }
            return quote.Id;

        } catch (Exception e) {
            List<buildertek__Exception_Log_Store_Option__c> StoreExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
            if(!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true){
                BT_ExceptionHandler.Store_Exception(e);
            }
            return null;
        }
    }
           
}