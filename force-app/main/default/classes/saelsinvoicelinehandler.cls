public with sharing class saelsinvoicelinehandler {
    public saelsinvoicelinehandler() {

    }

    public void onAfterInsert(List<buildertek__Billable_Lines__c> newSalesInvoiceLines, Map<Id, buildertek__Billable_Lines__c> oldSalesInvoiceLines) {
        Set<Id> quoteLineIds = new Set<Id>();
        for(buildertek__Billable_Lines__c sil : newSalesInvoiceLines) {
            quoteLineIds.add(sil.buildertek__Quote_Line__c);
        }
        updateQuoteLines(quoteLineIds);
    }

    public void onAfterUpdate(List<buildertek__Billable_Lines__c> oldSalesInvoiceLines, List<buildertek__Billable_Lines__c> newSalesInvoiceLines, Map<Id, buildertek__Billable_Lines__c> newSalesInvoiceLinesMap, Map<Id, buildertek__Billable_Lines__c> oldSalesInvoiceLinesMap) {
        Set<Id> quoteLineIds = new Set<Id>();
        for(buildertek__Billable_Lines__c sil : newSalesInvoiceLines) {
            quoteLineIds.add(sil.buildertek__Quote_Line__c);
        }
        for(buildertek__Billable_Lines__c sil : oldSalesInvoiceLines) {
            quoteLineIds.add(sil.buildertek__Quote_Line__c);
        }
        updateQuoteLines(quoteLineIds);
    }

    public void onBeforeDelete(List<buildertek__Billable_Lines__c> oldSalesInvoiceLines, Map<Id, buildertek__Billable_Lines__c> oldSalesInvoiceLinesMap) {
        Set<Id> quoteLineIds = new Set<Id>();
        for(buildertek__Billable_Lines__c sil : oldSalesInvoiceLines) {
            quoteLineIds.add(sil.buildertek__Quote_Line__c);
        }
        List<buildertek__Quote_Item__c> quoteLines = [SELECT Id, buildertek__Invoiced_Unit_Price__c FROM buildertek__Quote_Item__c WHERE Id IN :quoteLineIds];

        for(buildertek__Billable_Lines__c sil : oldSalesInvoiceLines) {
            for(buildertek__Quote_Item__c quoteLine : quoteLines) {
                if(quoteLine.Id == sil.buildertek__Quote_Line__c && quoteLine.buildertek__Invoiced_Unit_Price__c >= sil.buildertek__Unit_Price__c) {
                    quoteLine.buildertek__Invoiced_Unit_Price__c -= sil.buildertek__Unit_Price__c;
                    System.debug('quoteLine.buildertek__Invoiced_Unit_Price__c: ' + quoteLine.buildertek__Invoiced_Unit_Price__c);
                }
            }
        }

        if (!quoteLines.isEmpty()) {
            update quoteLines;
        }
        
    }
    


    public void updateQuoteLines(Set<Id> quoteLineIds) {
        //remove null from the set of quoteLineIds
        quoteLineIds.remove(null);
        List<buildertek__Billable_Lines__c> salesInvoiceLines = [SELECT Id, buildertek__Quote_Line__c, buildertek__Unit_Price__c FROM buildertek__Billable_Lines__c WHERE buildertek__Quote_Line__c IN :quoteLineIds];

        Map<Id, Decimal> quoteLineIdToInvoicedUnitPrice = new Map<Id, Decimal>();
        for(buildertek__Billable_Lines__c sil : salesInvoiceLines) {
            if(quoteLineIdToInvoicedUnitPrice.containsKey(sil.buildertek__Quote_Line__c)) {
                quoteLineIdToInvoicedUnitPrice.put(sil.buildertek__Quote_Line__c, quoteLineIdToInvoicedUnitPrice.get(sil.buildertek__Quote_Line__c) + sil.buildertek__Unit_Price__c);
            } else {
                quoteLineIdToInvoicedUnitPrice.put(sil.buildertek__Quote_Line__c, sil.buildertek__Unit_Price__c);
            }
        }

        List<buildertek__Quote_Item__c> quoteLinesToUpdate = new List<buildertek__Quote_Item__c>();
        for(Id quoteLineId : quoteLineIdToInvoicedUnitPrice.keySet()) {
            buildertek__Quote_Item__c quoteLine = new buildertek__Quote_Item__c(Id = quoteLineId, buildertek__Invoiced_Unit_Price__c = quoteLineIdToInvoicedUnitPrice.get(quoteLineId));
            quoteLinesToUpdate.add(quoteLine);
        }

        // Perform the update operation
        if (!quoteLinesToUpdate.isEmpty()) {
            update quoteLinesToUpdate;
        }
    }
}