({
    createRFQ: function (component, helper) {
        var action = component.get("c.createRFQFromWT");
        action.setParams({ walkThroughId: component.get("v.recordId") });

        action.setCallback(this, function (response) {
            var state = response.getState();

            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                $A.get("e.force:closeQuickAction").fire();
                if (result.Status === 'Success') {
                    component.find('notifLib').showNotice({
                        "variant": "success",
                        "header": "Success",
                        "message": result.Message,
                        closeCallback: function () {
                            $A.get('e.force:refreshView').fire();
                            // var event = $A.get('e.force:navigateToSObject');
                            // event.setParams({
                            //     'recordId': result.newRecordId
                            // }).fire();
                            if (result.projectId) {
                                window.location.href = '/lightning/r/buildertek__Project__c/' + result.projectId + '/related/buildertek__RFQs__r/view?'

                            } else {
                                window.location.href = '/lightning/o/buildertek__RFQ__c/list?';
                            }
                        }
                    });
                } else {
                    component.find('notifLib').showNotice({
                        "variant": "error",
                        "header": "Error",
                        "message": result.Message
                    });
                }
            }
        });

        $A.enqueueAction(action);
    },

    groupTradeTypeHelper: function (component, selectedValue, helper, classMethodExecutionNumber) {
        var action = component.get("c.groupRrqTradeType");
        action.setParams({ walkThroughId: component.get("v.recordId"), grpType: selectedValue, classMethodExecutionNumber: classMethodExecutionNumber });
        if (!component.get("v.initialLoad")) {
            $A.get("e.c:BT_SpinnerEvent").setParams({ "action": "SHOW" }).fire();
        }
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                if (result.Status === 'Success') {
                    $A.get("e.force:closeQuickAction").fire();
                    component.find('notifLib').showNotice({
                        "variant": "success",
                        "header": "Success",
                        "message": result.Message,
                        closeCallback: function () {
                            $A.get('e.force:refreshView').fire();
                            if (result.projectId) {
                                window.location.href = '/lightning/r/buildertek__Project__c/' + result.projectId + '/related/buildertek__RFQs__r/view?'
                            } else {
                                window.location.href = '/lightning/o/buildertek__RFQ__c/list?';
                            }
                        }
                    });
                } else if (result.Status === 'Warning') {
                    component.set("v.optionSelected", false);
                    component.set("v.initialLoad", false);
                    component.set("v.missingCostCode", selectedValue === 'costCode');
                    component.set("v.missingSection", selectedValue === 'section');
                    component.set("v.missingTradeType", selectedValue === 'tradeType');
                    component.set("v.walkThroughLines", result.walkThroughLines);
                } else {
                    $A.get("e.force:closeQuickAction").fire();
                    component.find('notifLib').showNotice({
                        "variant": "error",
                        "header": "Error",
                        "message": result.Message
                    });
                }
            }
            $A.get("e.c:BT_SpinnerEvent").setParams({ "action": "HIDE" }).fire();
        });

        $A.enqueueAction(action);
    },
})