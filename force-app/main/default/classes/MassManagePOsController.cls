public without sharing class MassManagePOsController {

    @AuraEnabled(cacheable=true)
    public static List<buildertek__Purchase_Order__c> getPurchaseOrders(String searchTerm, String poNumberSearch, String projectSearch, String vendorSearch, String costCodeSearch, String statusSearch, String descriptionSearch) {
        String query = 'SELECT Id, Name,buildertek__Description__c,buildertek__Vendor__c, buildertek__Vendor__r.Name, buildertek__Project__c, buildertek__Cost_Code__c, buildertek__Cost_Code__r.buildertek__Cost_Code_Name__c,buildertek__Project__r.Name, buildertek__Status__c, buildertek__PO_Total__c FROM buildertek__Purchase_Order__c WHERE buildertek__Status__c = \'Open\'';
        query += ' AND Id IN (SELECT buildertek__Purchase_Order__c FROM buildertek__Purchase_Order_Item__c WHERE buildertek__Product__c != null) AND buildertek__PO_Total__c != 0.00 ';
        // if (String.isNotBlank(searchTerm)) {
            // String searchTermWithWildcards = '%' + searchTerm + '%';
            if (String.isNotBlank(poNumberSearch)) {
                query += ' AND Name LIKE \'%' + String.escapeSingleQuotes(poNumberSearch) + '%\'';
            }
            if (String.isNotBlank(projectSearch)) {
                query += ' AND buildertek__Project__r.Name LIKE \'%' + String.escapeSingleQuotes(projectSearch) + '%\'';
            }
            if (String.isNotBlank(vendorSearch)) {
                query += ' AND buildertek__Vendor__r.Name LIKE \'%' + String.escapeSingleQuotes(vendorSearch) + '%\'';
            }
            if (String.isNotBlank(costCodeSearch)) {
                query += ' AND buildertek__Cost_Code__r.buildertek__Cost_Code_Name__c LIKE \'%' + String.escapeSingleQuotes(costCodeSearch) + '%\'';
            }
            if (String.isNotBlank(descriptionSearch)) {
                query += ' AND buildertek__Description__c LIKE \'%' + String.escapeSingleQuotes(descriptionSearch) + '%\'';
            }
        // }
        query += ' ORDER BY buildertek__Vendor__r.Name ASC NULLS LAST, Name DESC, buildertek__Project__r.Name ASC NULLS LAST';

        List<buildertek__Purchase_Order__c> PORecs = Database.query(query);
        System.debug(PORecs);

        List<Id> poIds = new List<Id>();
        for (buildertek__Purchase_Order__c poRec : PORecs) {
            poIds.add(poRec.Id);
        }

        List<POItemWrapperList> POItemResult = new List<POItemWrapperList>();
        List<buildertek__Purchase_Order_Item__c> poItems = [
                SELECT Id, Name, buildertek__Purchase_Order__c, buildertek__Unit_Price__c, buildertek__Product__c, CurrencyIsoCode, buildertek__Pricebook__c, buildertek__Pricebook__r.Name
                FROM buildertek__Purchase_Order_Item__c WHERE buildertek__Purchase_Order__c IN :poIds AND buildertek__Purchase_Order__c != null ];
        
        Set<Id> productIds = new Set<Id>();
        for (buildertek__Purchase_Order_Item__c poItem : poItems) {
            if (poItem.buildertek__Product__c != null) {
                productIds.add(poItem.buildertek__Product__c);
            }
        }

        Map<Id, List<PricebookEntryWrapper>> productPBEMap = new Map<Id, List<PricebookEntryWrapper>>();
        for (PricebookEntry pbe : [SELECT Id, Name, UnitPrice, buildertek__Unit_Cost__c, Product2Id, Pricebook2Id, Pricebook2.Name, Product2.Name, CurrencyIsoCode 
                                    FROM PricebookEntry WHERE Product2Id IN :productIds]) {
            if (!productPBEMap.containsKey(pbe.Product2Id)) {
                productPBEMap.put(pbe.Product2Id, new List<PricebookEntryWrapper>());
            }
            productPBEMap.get(pbe.Product2Id).add(new PricebookEntryWrapper(
                pbe.Id, pbe.Name, pbe.Pricebook2Id, pbe.Pricebook2.Name, pbe.Product2Id, pbe.Product2.Name, pbe.buildertek__Unit_Cost__c));
        }

        Set<Id> poWithUnitCostMismatch = new Set<Id>();

        // Compare PO line unit costs with pricebook entry unit costs
        for (buildertek__Purchase_Order_Item__c poItem : poItems) {
            if (poItem.buildertek__Product__c != null && productPBEMap.containsKey(poItem.buildertek__Product__c)) {
                List<PricebookEntryWrapper> relatedPBEs = productPBEMap.get(poItem.buildertek__Product__c);

                // Check if the PO line has an associated pricebook
                if (poItem.buildertek__Pricebook__c != null) {
                    // Search only the related pricebook entry with matching PricebookId
                    for (PricebookEntryWrapper pbeWrapper : relatedPBEs) {
                        if (pbeWrapper.PricebookId == poItem.buildertek__Pricebook__c) {
                            Decimal roundedPOUnitCost = poItem.buildertek__Unit_Price__c != null ? poItem.buildertek__Unit_Price__c.setScale(2) : null;
                            Decimal roundedPBEUnitCost = pbeWrapper.unitCost != null ? pbeWrapper.unitCost.setScale(2) : null;

                            if (roundedPBEUnitCost != null && roundedPOUnitCost != roundedPBEUnitCost) {
                                poWithUnitCostMismatch.add(poItem.buildertek__Purchase_Order__c);
                            }
                            break; // Only one match needed, exit the loop
                        }
                    }
                } else {
                    // If no pricebook is associated, compare with all pricebook entries
                    for (PricebookEntryWrapper pbeWrapper : relatedPBEs) {
                        Decimal roundedPOUnitCost = poItem.buildertek__Unit_Price__c != null ? poItem.buildertek__Unit_Price__c.setScale(2) : null;
                        Decimal roundedPBEUnitCost = pbeWrapper.unitCost != null ? pbeWrapper.unitCost.setScale(2) : null;

                        if (roundedPBEUnitCost != null && roundedPOUnitCost != roundedPBEUnitCost) {
                            poWithUnitCostMismatch.add(poItem.buildertek__Purchase_Order__c);
                            break; // No need to check further once a mismatch is found
                        }
                    }
                }
            }
        }


        // Filter the purchase orders to return only those with mismatched unit costs
        List<buildertek__Purchase_Order__c> filteredPOs = new List<buildertek__Purchase_Order__c>();
        for (buildertek__Purchase_Order__c po : PORecs) {
            if (poWithUnitCostMismatch.contains(po.Id)) {
                filteredPOs.add(po);
            }
        }

        return filteredPOs;
    }

    @AuraEnabled
    public static String getOrgCurrency() {
        return UserInfo.getDefaultCurrency();
    }

    @AuraEnabled(cacheable=true)
    public static List<POItemWrapperList> getPOLinesDetails(List<Id> poList) {
        List<POItemWrapperList> POItemResult = new List<POItemWrapperList>();

        try {
            List<buildertek__Purchase_Order__c> purchaseOrders = [SELECT Id, Name, buildertek__Description__c FROM buildertek__Purchase_Order__c WHERE Id IN :poList ORDER BY buildertek__Vendor__r.Name ASC NULLS LAST, Name DESC, buildertek__Project__r.Name ASC NULLS LAST];

            List<buildertek__Purchase_Order_Item__c> poItems = [
                SELECT Id, Name, buildertek__Purchase_Order__c, buildertek__Unit_Price__c, buildertek__Product__c, CurrencyIsoCode, buildertek__Pricebook__c, buildertek__Pricebook__r.Name
                FROM buildertek__Purchase_Order_Item__c WHERE buildertek__Purchase_Order__c IN :poList AND buildertek__Purchase_Order__c != null ];

            Set<Id> productIds = new Set<Id>();
            for (buildertek__Purchase_Order_Item__c poItem : poItems) {
                if (poItem.buildertek__Product__c != null) {
                    productIds.add(poItem.buildertek__Product__c);
                }
            }

            Map<Id, List<PricebookEntryWrapper>> productPBEMap = new Map<Id, List<PricebookEntryWrapper>>();
            for (PricebookEntry pbe : [SELECT Id, Name, UnitPrice, buildertek__Unit_Cost__c, Product2Id, Pricebook2Id, Pricebook2.Name, Product2.Name, CurrencyIsoCode 
                                        FROM PricebookEntry WHERE Product2Id IN :productIds]) {
                if (!productPBEMap.containsKey(pbe.Product2Id)) {
                    productPBEMap.put(pbe.Product2Id, new List<PricebookEntryWrapper>());
                }
                productPBEMap.get(pbe.Product2Id).add(new PricebookEntryWrapper(
                    pbe.Id, pbe.Name, pbe.Pricebook2Id, pbe.Pricebook2.Name, pbe.Product2Id, pbe.Product2.Name, pbe.buildertek__Unit_Cost__c));
            }

            for (buildertek__Purchase_Order__c po : purchaseOrders) {
                POItemWrapperList POItemWrapperRec = new POItemWrapperList(po.Id, po.Name, po.buildertek__Description__c, new List<POItemDetails>());
                
                for (buildertek__Purchase_Order_Item__c poItem : poItems) {
                    if (poItem.buildertek__Purchase_Order__c == po.Id) {
                        POItemDetails POItemDetails = new POItemDetails();
                        POItemDetails.Id = poItem.Id;
                        POItemDetails.Name = poItem.Name;
                        POItemDetails.POId = poItem.buildertek__Purchase_Order__c;
                        POItemDetails.POLineUnitPrice = poItem.buildertek__Unit_Price__c;
                        POItemDetails.CurrencyIsoCode = poItem.CurrencyIsoCode;
                        POItemDetails.PricebookId = poItem.buildertek__Pricebook__c;
                        POItemDetails.PricebookName = poItem.buildertek__Pricebook__r.Name;

                        // Add all relevant pricebook entries for the product
                        if (productPBEMap.containsKey(poItem.buildertek__Product__c)) {
                            POItemDetails.pricebookEntries = productPBEMap.get(poItem.buildertek__Product__c);
                        } else {
                            POItemDetails.pricebookEntries = new List<PricebookEntryWrapper>();
                        }
                        POItemWrapperRec.poDescription = po.buildertek__Description__c;
                        POItemWrapperRec.poLines.add(POItemDetails);
                    }
                }

                POItemResult.add(POItemWrapperRec);
            }

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return POItemResult;
    }

    @AuraEnabled
    public static String updateUnitCost(List<POUpdateRequest> poLines) {
        try {
            List<buildertek__Purchase_Order_Item__c> updatedLines = new List<buildertek__Purchase_Order_Item__c>();

            for (POUpdateRequest line : poLines) {
                buildertek__Purchase_Order_Item__c pol = [SELECT Id, buildertek__Unit_Price__c FROM buildertek__Purchase_Order_Item__c WHERE Id = :line.poLineId LIMIT 1];
                pol.buildertek__Unit_Price__c = line.newUnitCost;
                updatedLines.add(pol);
            }
            System.debug('updatedLines ==> ' + updatedLines);
            if (!updatedLines.isEmpty()) {
                update updatedLines;
                return 'Selected POs are updated successfully';
            } else{
                return 'No POs to update';
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // Class for the request object
    public class POUpdateRequest {
        @AuraEnabled
        public Id poLineId { get; set; }
        
        @AuraEnabled
        public Decimal newUnitCost { get; set; }
    }

    // Wrapper classes for the combined result
    public class POItemWrapperList {
        @AuraEnabled public Id poId { get; set; }
        @AuraEnabled public String poName { get; set; }
        @AuraEnabled public String poDescription { get; set; }
        @AuraEnabled public List<POItemDetails> poLines { get; set; }
        
        public POItemWrapperList(Id poId, String poName, String poDescription, List<POItemDetails> poLines) {
            this.poId = poId;
            this.poName = poName;
            this.poDescription = poDescription;
            this.poLines = poLines;
        }
    }

    public class POItemDetails {
        @AuraEnabled public Id Id { get; set; }
        @AuraEnabled public String Name { get; set; }
        @AuraEnabled public Id POId { get; set; }
        @AuraEnabled public Decimal POLineUnitPrice { get; set; }
        @AuraEnabled public String CurrencyIsoCode { get; set; }
        @AuraEnabled public String PricebookId { get; set; }
        @AuraEnabled public String PricebookName { get; set; }
        @AuraEnabled public List<PricebookEntryWrapper> pricebookEntries { get; set; }
    }

    public class PricebookEntryWrapper {
        @AuraEnabled public Id Id { get; set; }
        @AuraEnabled public String Name { get; set; }
        @AuraEnabled public Id PricebookId { get; set; }
        @AuraEnabled public String PricebookName { get; set; }
        @AuraEnabled public Id ProductId { get; set; }
        @AuraEnabled public String ProductName { get; set; }
        @AuraEnabled  public Decimal UnitCost { get; set; }
    
        public PricebookEntryWrapper(Id Id, String Name, Id PricebookId, String PricebookName, Id ProductId, String ProductName, Decimal UnitCost) {
            this.Id = Id;
            this.Name = Name;
            this.PricebookId = PricebookId;
            this.PricebookName = PricebookName;
            this.ProductId = ProductId;
            this.ProductName = ProductName;
            this.UnitCost = UnitCost;
        }
    }
}