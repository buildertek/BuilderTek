public with sharing class ImportRfqLineController {

    @AuraEnabled
    public static List<buildertek__RFQ__c> getAllApprovedRFQ(String quotId){
        buildertek__Quote__c quote;
        if (Schema.sObjectType.Quote__c.fields.Id.isAccessible() && Schema.sObjectType.Quote__c.fields.Project__c.isAccessible()){
            quote = [Select Id, buildertek__Project__c
                     from buildertek__Quote__c
                     where Id = :quotId];
        }

        List<buildertek__Quote_Item__c> QuoteItemList = [Select Id, buildertek__Quote__c, buildertek__RFQ__c
                                                         from buildertek__Quote_Item__c LIMIT 50000];

        //get buildertek__RFQ__c Ids from QuoteItemList
        Set<Id> rfqIds = new Set<Id>();
        for (buildertek__Quote_Item__c quoteItem : QuoteItemList){
            if (quoteItem.buildertek__RFQ__c != null){
                rfqIds.add(quoteItem.buildertek__RFQ__c);
            }
        }
        System.debug('rfqIds--->>>' + rfqIds);

        // return [Select Id, Name,RFQ_Details__c,Status__c, Vendor__r.Name, Vendor_Quote__c from RFQ__c where project__c =:quote.Project__c and status__c = 'Awarded'];
        // return [Select Id, Name, RFQ_Details__c, Status__c, Vendor__r.Name, Vendor_Quote__c
        //   from RFQ__c
        //  where project__c = :quote.Project__c and status__c = 'Accepted'];
        System.debug('quote ==> ' + quote.buildertek__Project__c);
        list<buildertek__RFQ__c> rfqlist = new list<buildertek__RFQ__c>();
        list<buildertek__RFQ__c> rfqsToReturn = new list<buildertek__RFQ__c>();
        string status = 'Accepted';
        string status2 = 'Awarded';
        if (UserInfo.isMultiCurrencyOrganization()){

            String projectId = '';
            if (quote.buildertek__Project__c != null){
                projectId = quote.buildertek__Project__c;
            }
            //append that id of rfq should not be in rfqIds
            String rfqItemrecords = 'Select Id, Name, buildertek__RFQ_Details__c, buildertek__Status__c, buildertek__Vendor__r.Name, buildertek__Vendor_Quote__c,CurrencyIsoCode, buildertek__Project__c, buildertek__Project__r.Name, (SELECT Id, Name, buildertek__Description__c, buildertek__Unit_Price__c, buildertek__BT_Quote_Line_Group__r.Name, buildertek__Cost_Code__c FROM buildertek__RFQ_Items__r) from buildertek__RFQ__c' + 
                                    ' where buildertek__Added_to_Quote__c = null and buildertek__project__c =\'' + projectId + '\' and (buildertek__status__c =\'' + status + '\' OR buildertek__status__c =\'' + status2 + '\') and Id NOT IN :rfqIds ORDER BY Name Asc';
            system.debug('rfqItemrecords' + rfqItemrecords);
            rfqlist = Database.query(rfqItemrecords);
            for (buildertek__RFQ__c rfq : rfqlist) {
                System.debug('single rfq in loop '+rfq);
                if (rfq.buildertek__RFQ_Items__r.size() > 0) {
                    rfqsToReturn.add(rfq);
                }
            }
            System.debug('rfqsToReturn in if '+rfqsToReturn);
            return rfqsToReturn;
        } else{
            // return [Select Id, Name,RFQ_Details__c,Status__c, Vendor__r.Name, Vendor_Quote__c from RFQ__c where project__c =:quote.Project__c and status__c = 'Awarded'];
            List<buildertek__RFQ__c> rfqlist1 = [Select Id, Name, buildertek__RFQ_Details__c, buildertek__Status__c, buildertek__Vendor__r.Name, buildertek__Vendor_Quote__c, buildertek__Project__c, buildertek__Project__r.Name, (SELECT Id, Name, buildertek__Description__c, buildertek__Unit_Price__c, buildertek__BT_Quote_Line_Group__r.Name, buildertek__Cost_Code__c FROM buildertek__RFQ_Items__r)
                                                 from buildertek__RFQ__c
                                                 where buildertek__project__c = :quote.buildertek__Project__c and (buildertek__status__c = 'Accepted' or buildertek__status__c = 'Awarded') and ID NOT IN:rfqIds
                                                 ORDER BY Name Asc];
            for (buildertek__RFQ__c rfq : rfqlist) {
                System.debug('single rfq in loop '+rfq);
                if (rfq.buildertek__RFQ_Items__r.size() > 0) {
                    rfqsToReturn.add(rfq);
                }
            }
            System.debug('rfqsToReturn in else '+rfqsToReturn);
            return rfqsToReturn;
        }
    }

    @AuraEnabled
    public static string createQuoteItem(String quoteItemsJSON, String stringMap){
        try{
            List<String> groupIds = new List<String>();
            map<String, String> quoteIdByGroupId = new map<String, String>();
            map<String, String> quoteRfqLineMap = new map<String, String>();
            set<Id> newQuoteWithoutGroup = new set<Id>();
            List<buildertek__Quote_Item__c> quoteItemsToInsert = (List<buildertek__Quote_Item__c>)System.JSON.deserialize(quoteItemsJSON, List<buildertek__Quote_Item__c>.class);
            Map<String, buildertek__Quote_Item__c> rfqLineIdMap = (Map<String, buildertek__Quote_Item__c>) JSON.deserialize(stringMap, Map<String, buildertek__quote_item__c>.class);
            //insert (List<Quote_Item__c>)System.JSON.deserialize(quoteItemsJSON, List<Quote_Item__c>.class);

            String QuoteId = quoteItemsToInsert[0].buildertek__Quote__c;

            List<String> rfqIds = new List<String>();
            Map<String, String> poMap = new Map<String, String>();

            system.debug('quoteItemsToInsert ----------> ' + quoteItemsToInsert);
            for (buildertek__Quote_Item__c qutItem : rfqLineIdMap.values()){
                system.debug('qutItem.Grouping__c --------> ' + qutItem.Grouping__c);
                if (qutItem.Grouping__c != null){
                    groupIds.add(qutItem.Grouping__c);
                    quoteIdByGroupId.put(qutItem.Id, qutItem.Grouping__c);
                    quoteRfqLineMap.put(qutItem.Id, qutItem.buildertek__BOM_Line__c);
                }
                if (qutItem.buildertek__RFQ__c != null){
                    rfqIds.add(qutItem.buildertek__RFQ__c);
                }
            }

            list<buildertek__RFQ__c> rfqList = [SELECT Id, Name, buildertek__Added_to_Quote__c
                                                FROM buildertek__RFQ__c
                                                WHERE Id IN :rfqIds];
            for (buildertek__RFQ__c rfq : rfqList){
                rfq.buildertek__Added_to_Quote__c = QuoteId;
            }
            RFQTriggerHandler.blnSkipRFQUpdateTrigger=true;
            update rfqList;
            RFQTriggerHandler.blnSkipRFQUpdateTrigger=false;


            List<buildertek__Purchase_Order__c> purchaseOrderRecs;
            if (Schema.sObjectType.buildertek__Purchase_Order__c.fields.Id.isAccessible() && Schema.sObjectType.buildertek__Purchase_Order__c.fields.Name.isAccessible() && Schema.sObjectType.buildertek__Purchase_Order__c.fields.buildertek__RFQ__c.isAccessible()){
                purchaseOrderRecs = [select id, name, buildertek__RFQ__c
                                     from buildertek__Purchase_Order__c
                                     where buildertek__RFQ__c In :rfqIds
                                     order by createddate desc];
            }
            for (buildertek__Purchase_Order__c po : purchaseOrderRecs){
                if (!poMap.containsKey(po.buildertek__RFQ__c)){
                    poMap.put(po.buildertek__RFQ__c, po.id);
                }
            }

            string qutgrpid;
            List<Quote_Line_Group__c> qutGrouping = [SELECT Id
                                                     FROM Quote_Line_Group__c
                                                     WHERE Name = 'No Grouping'
                                                     limit 1];

            if (qutGrouping.size() > 0){
                qutgrpid = qutGrouping[0].Id;
            } else{
                Quote_Line_Group__c quotGroup = new Quote_Line_Group__c();
                quotGroup.Name = 'No Grouping';
                insert quotGroup;
                qutgrpid = quotGroup.Id;
            }

            system.debug('Is Empty ----------> ' + groupIds.isEmpty());
            if (!groupIds.isEmpty()){
                system.debug('Not Empty ----------> ' + groupIds);

                for (buildertek__Quote_Item__c qItem : rfqLineIdMap.values()){

                    system.debug('qItem----------> ' + qItem.Id);
                    if (qItem.Id != null){
                        qItem.Grouping__c = quoteIdByGroupId.get(qItem.Id);
                    }
                    if (qItem.Grouping__c == null){
                        qItem.Grouping__c = qutgrpid;
                    }
                    system.debug('qItem--qItem.Grouping__c--------> ' + qItem.Grouping__c);
                    if (poMap.containsKey(qItem.buildertek__RFQ__c)){
                        qItem.buildertek__Purchase_Order__c = poMap.get(qItem.buildertek__RFQ__c);
                    }
                }
            } else{
                List<Quote_Line_Group__c> qutGroup;
                if (Schema.sObjectType.buildertek__Quote_Line_Group__c.fields.Id.isAccessible() && Schema.sObjectType.buildertek__Quote_Line_Group__c.fields.Name.isAccessible()){
                    qutGroup = [SELECT Id
                                FROM Quote_Line_Group__c
                                WHERE Name = 'No Grouping'];
                }
                system.debug('qutGroup ----------> ' + qutGroup);
                if (qutGroup.size() > 0){
                    for (buildertek__Quote_Item__c qItem : rfqLineIdMap.values()){
                        if (qItem.Grouping__c == null){
                            qItem.Grouping__c = qutGroup[0].Id;
                        }
                        if (poMap.containsKey(qItem.buildertek__RFQ__c)){
                            qItem.buildertek__Purchase_Order__c = poMap.get(qItem.buildertek__RFQ__c);
                        }
                    }
                } else{
                    Quote_Line_Group__c quoteGroup = new Quote_Line_Group__c();
                    if (Schema.sObjectType.Quote_Line_Group__c.fields.Name.isCreateable()){
                        quoteGroup.Name = 'No Grouping';
                    }
                    if (Schema.sObjectType.Quote_Line_Group__c.isCreateable() && Schema.sObjectType.Quote_Line_Group__c.fields.Name.isCreateable()){
                        insert quoteGroup;
                    }
                    system.debug('quoteGroup ----------> ' + quoteGroup);
                    for (buildertek__Quote_Item__c qItem : rfqLineIdMap.values()){
                        qItem.Grouping__c = quoteGroup.Id;
                        if (poMap.containsKey(qItem.buildertek__RFQ__c)){
                            qItem.buildertek__Purchase_Order__c = poMap.get(qItem.buildertek__RFQ__c);
                        }
                    }
                }
            }

            insert rfqLineIdMap.values();

            List<buildertek__RFQ_Item__c> rfqLineListToUpdate = new List<buildertek__RFQ_Item__c>();

            for (String rfqId : rfqLineIdMap.keyset()) {
                buildertek__RFQ_Item__c rfqLine = new buildertek__RFQ_Item__c();
                rfqLine.Id = rfqId;
                rfqLine.buildertek__Quote_Item__c = rfqLineIdMap.get(rfqId).Id;
                rfqLineListToUpdate.add(rfqLine);
            }

            update rfqLineListToUpdate;

            return 'Success';
        } catch (Exception ex){
            return ex.getMessage();
        }
    }
}