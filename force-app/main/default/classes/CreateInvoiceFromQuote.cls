public with sharing class CreateInvoiceFromQuote {
    @AuraEnabled
    public Static ResponseBase CreateInvoiceMethod(string QuoteId){
        ResponseBase response = new ResponseBase();
        try {
            buildertek__Quote__c quoteRec;
            /* if(Schema.sObjectType.buildertek__Contract__c.fields.Id.isAccessible()&&
                Schema.sObjectType.buildertek__Contract__c.fields.Name.isAccessible()&&
                Schema.sObjectType.buildertek__Contract__c.fields.buildertek__Project__c.isAccessible() &&
                Schema.sObjectType.buildertek__Contract__c.fields.buildertek__Change_Order_Amount__c.isAccessible() &&
                Schema.sObjectType.buildertek__Contract__c.fields.buildertek__Change_Order__c.isAccessible() &&
                Schema.sObjectType.buildertek__Contract__c.fields.buildertek__Status__c.isAccessible() &&
                Schema.sObjectType.buildertek__Contract__c.fields.buildertek__Vendor__c.isAccessible() &&
                Schema.sObjectType.buildertek__Change_Order__c.fields.Name.isAccessible() &&
                Schema.sObjectType.buildertek__Change_Order__c.fields.Tax_Rate__c.isAccessible()){*/
                                        quoteRec= [select Id, 
                                                 Name, 
                                                 buildertek__Project__c, 
                                                 buildertek__Customer_Account__c,
                                                 buildertek__Tax__c,
                                                 buildertek__Status__c 
                                                 from buildertek__Quote__c 
                                                 where Id =: QuoteId];
               // }
            buildertek__Billings__c AR = new buildertek__Billings__c();
            AR.buildertek__Customer_Account__c = quoteRec.buildertek__Customer_Account__c;
            AR.buildertek__Project__c = quoteRec.buildertek__Project__c;
            AR.buildertek__Status__c = 'Open';
          //  AR.buildertek__Customer_Account__c = quoteRec.buildertek__Vendor__c;
           // AR.Change_order__c = quoteRec.buildertek__Change_Order__c;
            AR.Tax_Rate__c = quoteRec.buildertek__Tax__c;
           // AR.buildertek__Approved_CO__c = quoteRec.buildertek__Change_Order_Amount__c;
            Ar.Name = quoteRec.Name;
            Ar.buildertek__Quote__c = quoteRec.Id;
           /* if(Schema.sObjectType.Billings__c.isCreateable() &&
            Schema.sObjectType.Billings__c.fields.buildertek__Project__c.isCreateable() &&
            Schema.sObjectType.Billings__c.fields.buildertek__Status__c.isCreateable() &&
            Schema.sObjectType.Billings__c.fields.buildertek__Customer_Account__c.isCreateable() &&
            Schema.sObjectType.Billings__c.fields.Change_order__c.isCreateable()&&
            Schema.sObjectType.Billings__c.fields.Tax_Rate__c.isCreateable() &&
            Schema.sObjectType.Billings__c.fields.buildertek__Approved_CO__c.isCreateable() &&
            Schema.sObjectType.Billings__c.fields.Name.isCreateable() &&
            Schema.sObjectType.Billings__c.fields.Contract__c.isCreateable()){*/
            insert AR;
           // }
            
            List<Billable_Lines__c> arLines = new List<Billable_Lines__c>();
            List<buildertek__Quote_Item__c> quoteItemList;
           /* if(Schema.sObjectType.buildertek__Contract_Item__c.fields.id.isAccessible()
                && Schema.sObjectType.buildertek__Contract_Item__c.fields.Name.isAccessible()
                && Schema.sObjectType.buildertek__Contract_Item__c.fields.Cost_Code__c.isAccessible()
                && Schema.sObjectType.buildertek__Contract_Item__c.fields.Description__c.isAccessible()
                && Schema.sObjectType.buildertek__Contract_Item__c.fields.Item_Name__c.isAccessible()
                && Schema.sObjectType.buildertek__Contract_Item__c.fields.Product__c.isAccessible()
                && Schema.sObjectType.buildertek__Contract_Item__c.fields.Quantity__c.isAccessible()
                && Schema.sObjectType.buildertek__Contract_Item__c.fields.Unit_Price__c.isAccessible()
                && Schema.sObjectType.buildertek__Contract_Item__c.fields.buildertek__Contract__c.isAccessible()){*/
                quoteItemList =  [select Id, 
                                         Name,
                                         buildertek__Cost_Code__c,
                                         buildertek__Description__c,
                                         buildertek__Item_Name__c,
                                         buildertek__Product__c,
                                         buildertek__Quantity__c,
                                         buildertek__Unit_Price__c,
                                         buildertek__Tax__c,
                                         buildertek__Status__c,
                                         buildertek__Notes__c,buildertek__Net_Unit__c
                                         from buildertek__Quote_Item__c 
                                         where buildertek__Quote__c =: QuoteId and buildertek__Status__c = 'Accept'];   
           // }
            for(buildertek__Quote_Item__c quoteItem : quoteItemList){
                
                Billable_Lines__c arItem = new Billable_Lines__c();
                arItem.buildertek__Item_Name__c = quoteItem.Name;
                arItem.buildertek__Billings__c = AR.Id;
                arItem.buildertek__Line_Title__c = quoteItem.buildertek__Item_Name__c;
                arItem.buildertek__Cost_Code__c = quoteItem.buildertek__Cost_Code__c;
                arItem.Description__c = quoteItem.Name;
                //arItem.buildertek__Description__c = quoteItem.buildertek__Description__c;
                arItem.buildertek__Product__c = quoteItem.buildertek__Product__c;
                arItem.buildertek__Unit_Price__c = quoteItem.buildertek__Net_Unit__c;
                arItem.buildertek__Quantity__c = quoteItem.buildertek__Quantity__c;
                arItem.buildertek__Notes__c = quoteItem.buildertek__Notes__c;
                arItem.buildertek__Tax_Rate__c = quoteItem.buildertek__Tax__c;
                arItem.buildertek__Quote_Line__c = quoteItem.Id;
                arLines.add(arItem);
            }
             /*if(Schema.sObjectType.Billable_Lines__c.isCreateable() &&
            Schema.sObjectType.Billable_Lines__c.fields.Billings__c.isCreateable() &&
            Schema.sObjectType.Billable_Lines__c.fields.Line_Title__c.isCreateable() &&
            Schema.sObjectType.Billable_Lines__c.fields.Description__c.isCreateable() &&
            Schema.sObjectType.Billable_Lines__c.fields.Cost_Code__c.isCreateable()&&
            Schema.sObjectType.Billable_Lines__c.fields.Product__c.isCreateable() &&
            Schema.sObjectType.Billable_Lines__c.fields.Contract_Line__c.isCreateable() &&
            Schema.sObjectType.Billable_Lines__c.fields.Quantity__c.isCreateable() &&
            Schema.sObjectType.Billable_Lines__c.fields.Unit_Price__c.isCreateable()){*/
            insert arLines;
            //}
            response.strMessage = 'Success';
            response.strRecordId = AR.Id;
            
            return response;
        } 
        catch(Exception ex){
            system.debug(ex + ' ex.getMessage() ' + ex.getMessage());
            response.strMessage = ex.getMessage();
            return response;
        }
    }

    @AuraEnabled
    public static dataWrapper getdata(String recordId){
        try{
            buildertek__Quote__c quoteRec;
            quoteRec= [select Id, 
                         Name, 
                         buildertek__Project__c, 
                         buildertek__Customer_Account__c,
                         buildertek__Tax__c,
                         buildertek__Status__c 
                         from buildertek__Quote__c 
                         where Id =: recordId];
                         
            List<buildertek__Quote_Item__c> quoteItemList;
            quoteItemList =  [select Id, 
                                Name,
                                buildertek__Cost_Code__c,
                                buildertek__Description__c,
                                buildertek__Item_Name__c,
                                buildertek__Product__c,
                                buildertek__Quantity__c,
                                buildertek__Unit_Price__c,
                                buildertek__Tax__c,
                                buildertek__Status__c,
                                buildertek__Notes__c,
                                buildertek__Net_Unit__c,
                                buildertek__Invoiced_Unit_Price__c
                                from buildertek__Quote_Item__c 
                                where buildertek__Quote__c =: recordId and buildertek__Status__c = 'Accept' and buildertek__Not_Customer_Visible__c = false
                                ORDER BY buildertek__Grouping__r.buildertek__Sort_Id__c NULLS Last, 
                                         buildertek__Grouping__r.Name, 
                                         buildertek__Priority__c ASC NULLS Last, 
                                         Name ASC];
            //if buildertek__Invoiced_Unit_Price__c is null then set it 0
            for(buildertek__Quote_Item__c quoteItem : quoteItemList){
                if(quoteItem.buildertek__Invoiced_Unit_Price__c == null){
                    quoteItem.buildertek__Invoiced_Unit_Price__c = 0;
                }
            }

            List<buildertek__Billings__c> billingsList;
            billingsList = [select Id, Name, buildertek__Project__c, buildertek__Customer_Account__c, buildertek__Status__c, Tax_Rate__c, buildertek__Total_Amount_Tax__c from buildertek__Billings__c where buildertek__Quote__c =: recordId];
            
            List<Billable_Lines__c> billableLinesList;
            billableLinesList = [select Id, Name, buildertek__Item_Name__c, buildertek__Line_Title__c, buildertek__Cost_Code__c, Description__c, buildertek__Product__c, buildertek__Unit_Price__c, buildertek__Quantity__c, buildertek__Notes__c, buildertek__Tax_Rate__c, buildertek__Quote_Line__c, buildertek__Total__c from Billable_Lines__c where buildertek__Billings__c in: billingsList];
            
            
            dataWrapper data = new dataWrapper();
            data.orgwideCurrency = UserInfo.getDefaultCurrency();
            data.quoteRec = quoteRec;
            data.quoteItemList = quoteItemList;
            data.billingsList = billingsList;
            data.billableLinesList = billableLinesList;
            data.msg = 'Success';
            return data;        
        }
        catch(Exception ex){
            system.debug(ex + ' ex.getMessage() ' + ex.getMessage());
            System.debug(LoggingLevel.ERROR, 'Line number: ' + ex.getLineNumber());
            dataWrapper data = new dataWrapper();
            data.msg = ex.getMessage();
            return data;
        }
    }

    @AuraEnabled
    public static string createInvoiceDB(List<Billable_Lines__c> inLines, String QuoteId){
        try{
            System.debug('QuoteId: ' + QuoteId);
            buildertek__Quote__c quoteRec = [SELECT Id, 
                                              Name, 
                                              buildertek__Project__c, 
                                              buildertek__Customer_Account__c,
                                              buildertek__Tax__c,
                                              buildertek__Status__c 
                                              FROM buildertek__Quote__c 
                                              WHERE Id =: QuoteId];

            buildertek__Billings__c AR = new buildertek__Billings__c();
            AR.buildertek__Customer_Account__c = quoteRec.buildertek__Customer_Account__c;
            AR.buildertek__Project__c = quoteRec.buildertek__Project__c;
            AR.buildertek__Status__c = 'Open';
            AR.Tax_Rate__c = quoteRec.buildertek__Tax__c;
            AR.Name = quoteRec.Name;
            AR.buildertek__Quote__c = quoteRec.Id;
            insert AR;

            for (Billable_Lines__c line : inLines) {
                line.buildertek__Billings__c = AR.Id;
            }
            insert inLines;

            return AR.Id;
        }catch(Exception ex){
            system.debug(ex + ' ex.getMessage() ' + ex.getMessage());
            return ex.getMessage();
        }
    }

    public virtual class dataWrapper{
        @AuraEnabled public buildertek__Quote__c quoteRec;
        @AuraEnabled public List<buildertek__Quote_Item__c> quoteItemList;
        @AuraEnabled public List<buildertek__Billings__c> billingsList;
        @AuraEnabled public List<Billable_Lines__c> billableLinesList;
        @AuraEnabled public String orgwideCurrency;
        @AuraEnabled public String msg;
    }
    
    public virtual class ResponseBase {
        @AuraEnabled public Boolean isSuccess;
        @AuraEnabled public String strMessage;
        @AuraEnabled public String strRecordId;
    }

}