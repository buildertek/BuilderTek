({
    searchHelper: function (component, event, getInputkeyWord) {
        if (component.get("v.searchTimeout")) {
            clearTimeout(component.get("v.searchTimeout"));
        }

        var timeout = setTimeout($A.getCallback(function () {
            if (component.get("v.isAccountAVendor") == true) {
                if (component.get("v.objectAPIName") == 'Contact') {
                    var apexCall = component.get("c.fetchContactList");
                } else {
                    var apexCall = component.get("c.fetchVendorList");
                }
                apexCall.setParams({ 'searchKeyWord': getInputkeyWord });
                apexCall.setCallback(this, function (response) {
                    $A.util.removeClass(component.find("mySpinner"), "slds-show");
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        var storeResponse = response.getReturnValue();
                        console.log('storeResponse ==> ', { storeResponse });
                        if (storeResponse.length == 0) {
                            component.set("v.Message", 'No Result Found...');
                        } else {
                            component.set("v.Message", '');
                        }
                        component.set("v.listOfSearchRecords", storeResponse);
                    }

                });
                $A.enqueueAction(apexCall);
            } else {
                var action = component.get("c.fetchLookUpValues");
                action.setParams({
                    'searchKeyWord': getInputkeyWord,
                    'ObjectName': component.get("v.objectAPIName"),
                    'parentRecordId': component.get("v.parentRecordId")
                });
                action.setCallback(this, function (response) {
                    $A.util.removeClass(component.find("mySpinner"), "slds-show");
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        var storeResponse = response.getReturnValue();
                        console.log('storeResponse ==> ', { storeResponse });
                        if (storeResponse.length == 0) {
                            component.set("v.Message", 'No Result Found...');
                        } else {
                            component.set("v.Message", '');
                        }
                        component.set("v.listOfSearchRecords", storeResponse);
                    }

                });
                $A.enqueueAction(action);
            }
        }), 500);
        component.set("v.searchTimeout", timeout);
    },
})