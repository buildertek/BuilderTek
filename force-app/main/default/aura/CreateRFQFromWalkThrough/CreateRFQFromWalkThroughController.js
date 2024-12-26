({
    doInit: function (component, event, helper) {
        var options = [
            { value: 'all', label: 'All' },
            { value: 'tradeType', label: 'Trade Type' },
            { value: 'costCode', label: 'Cost Code' },
            { value: 'section', label: 'Section' }
        ];
        component.set("v.statusOptions", options);
    },

    handleOptionSelected: function (component, event, helper) {
        component.set("v.optionSelected", true);
        let selectedOptionValue = event.getParam("value");
        console.log('selectedOptionValue: ', selectedOptionValue);
        if (selectedOptionValue === 'all') {
            helper.createRFQ(component, helper);
        } else {
            helper.groupTradeTypeHelper(component, selectedOptionValue, helper, 1);
        }
    },

    handleCancel: function (component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    },

    handleSave: function (component, event, helper) {
        var walkThroughLines = component.get("v.walkThroughLines");
        var action = component.get("c.updateWalkThroughLines");
        action.setParams({ walkThroughLines: walkThroughLines });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                if (result === 'Success') {
                    if (component.get("v.missingCostCode")) {
                        helper.groupTradeTypeHelper(component, 'costCode', helper, 2);
                    } else if (component.get("v.missingSection")) {
                        helper.groupTradeTypeHelper(component, 'section', helper, 2);
                    } else if (component.get("v.missingTradeType")) {
                        helper.groupTradeTypeHelper(component, 'tradeType', helper, 2);
                    }
                } else {
                    component.find('notifLib').showNotice({
                        "variant": "error",
                        "header": "Error",
                        "message": result
                    });
                }
            } else {
                console.log('error: ', response.getError());
                component.find('notifLib').showNotice({
                    "variant": "error",
                    "header": "Error",
                    "message": response.getError()[0].message
                });
            }
        });
        $A.enqueueAction(action);
    },

    handleLookUpEvent: function (component, event, helper) {
        var selectedRecordId = event.getParam("selectedRecordId");
        var index = event.getParam('index');
        var walkThroughLines = component.get("v.walkThroughLines");
        if (component.get("v.missingCostCode")) {
            walkThroughLines[index].buildertek__BT_Cost_Code__c = selectedRecordId && selectedRecordId.length > 0 ? selectedRecordId[0] : null;
        } else if (component.get("v.missingSection")) {
            walkThroughLines[index].buildertek__BT_Category__c = selectedRecordId && selectedRecordId.length > 0 ? selectedRecordId[0] : null;
        } else if (component.get("v.missingTradeType")) {
            walkThroughLines[index].buildertek__Trade_Type__c = selectedRecordId && selectedRecordId.length > 0 ? selectedRecordId[0] : null;
        }
        component.set("v.walkThroughLines", walkThroughLines);
    },

    clearSelectedHandler: function (component, event, helper) {
        var index = event.getParam('index');
        var walkThroughLines = component.get("v.walkThroughLines");
        if (component.get("v.missingCostCode")) {
            walkThroughLines[index].buildertek__BT_Cost_Code__c = null;
        } else if (component.get("v.missingSection")) {
            walkThroughLines[index].buildertek__BT_Category__c = null;
        } else if (component.get("v.missingTradeType")) {
            walkThroughLines[index].buildertek__Trade_Type__c = null;
        }
        component.set("v.walkThroughLines", walkThroughLines);
    }
})