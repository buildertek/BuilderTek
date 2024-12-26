global without sharing class QuoteImageSortController {
    
    global String quoteId; 
    global List<buildertek__Proposal_Images__c> proposalImages { get; set; }
    global boolean displayTitle { get; set; }

    global QuoteImageSortController() {
        proposalImages = new List<buildertek__Proposal_Images__c>();
    }

    global void setQuoteId(Id quoteId) {
        this.quoteId = quoteId;
        proposalImages = [SELECT Id, buildertek__Image__c, buildertek__Image_Name__c, buildertek__Description__c, 
            buildertek__Proposal__c, buildertek__Order_Id__c, buildertek__Include_Image__c 
            FROM buildertek__Proposal_Images__c 
            WHERE buildertek__Proposal__c = :quoteId 
            AND buildertek__Include_Image__c = true 
            AND buildertek__Image__c != null
            ORDER BY buildertek__Order_Id__c ASC NULLS LAST];

        if (proposalImages.size() > 0) {
            displayTitle = true;
        } else {
            displayTitle = false;
        }
    }

    global String getQuoteId(){
        return quoteId;
    }
}