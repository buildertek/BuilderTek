({
	handleSuccessResponse: function (component, helper, result) {
        if (result === "Success") {
            console.log('We are here in success');
            $A.get("e.force:closeQuickAction").fire();
            var workspaceAPI = component.find("workspace");
            workspaceAPI.getFocusedTabInfo().then(function (response) {
                var focusedTabId = response.tabId;
                workspaceAPI.closeTab({ tabId: focusedTabId });
            }).catch(function (error) {
                console.log(error);
            });
    
            var urlEvent = $A.get("e.force:navigateToURL");
            urlEvent.setParams({
                url: '/lightning/r/buildertek__Purchase_Order__c/' + component.get("v.recordId") + '/view'
            });
            urlEvent.fire();
            setTimeout(function () {
                $A.get("e.force:refreshView").fire();
            }, 1800);
        } else {
            helper.showToast("Error", result, "error");
			component.set("v.Spinner", false);
        }
    },

	showToast: function (title, message, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: title,
            message: message,
            duration: 5000,
            key: "info_alt",
            type: type,
            mode: "pester"
        });
        toastEvent.fire();
    },

    getPicklistValues: function (component, event, helper) {
        var action = component.get("c.getPicklistValues");
        action.setParams({
            objectApiName: 'buildertek__Purchase_Order_Item__c',
            fieldApiName: 'buildertek__Location_Delivered2__c'
        });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var picklistValues = response.getReturnValue();
                var options = [];
                for (var i = 0; i < picklistValues.length; i++) {
                    options.push({
                        label: picklistValues[i].label,
                        value: picklistValues[i].value
                    });
                }
                console.log('picklistValues', options);
                component.set("v.option", options);
            }
        });
        $A.enqueueAction(action);
    }
})