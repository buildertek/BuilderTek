global without sharing class WalkthroughComponentController {
    global String recordId { get; set; }
    global string wtId;
    global Map<String, List<buildertek__Walk_Through_Line_Items__c>> groupedWalkThroughItems { get; set; }
    global String currencySymbol { get; set; }

    global void setrelatedToId(String Id) {
        this.wtId = Id;
        WalkthroughComponentController1();
        getcurrency();
    }

    global String getrelatedToId() {
        return wtId;
    }

    global void WalkthroughComponentController1() {
        groupedWalkThroughItems = new Map<String, List<buildertek__Walk_Through_Line_Items__c>>();
        List<buildertek__Walk_Through_Line_Items__c> walkThroughItemList = [
            SELECT Id, Name, buildertek__Total_Price__c, buildertek__Price__c, buildertek__Quantity__c, 
                   buildertek__BT_Category__c, buildertek__BT_Category__r.Name 
            FROM buildertek__Walk_Through_Line_Items__c 
            WHERE buildertek__Walk_Through_List__c = :wtId
            ORDER BY buildertek__BT_Category__r.Name NULLS LAST
        ];
        
        for (buildertek__Walk_Through_Line_Items__c wtItem : walkThroughItemList) {
            String category = wtItem.buildertek__BT_Category__c != null ? wtItem.buildertek__BT_Category__r.Name : 'No Grouping';
            if (!groupedWalkThroughItems.containsKey(category)) {
                groupedWalkThroughItems.put(category, new List<buildertek__Walk_Through_Line_Items__c>());
            }
            groupedWalkThroughItems.get(category).add(wtItem);
        }
    }

    global void getcurrency() {
        currencySymbol = UserInfo.getDefaultCurrency();
    }
}