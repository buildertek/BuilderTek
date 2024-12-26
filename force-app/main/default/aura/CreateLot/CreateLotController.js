({
    doInit : function(component, event, helper) {
        helper.getCommunity(component, event, helper);
	},

    closeModel: function(component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    },

    handleSubmit: function (component, event, helper) {
        component.set("v.isDisabled", true);
		$A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();

        event.preventDefault();
        var fields = event.getParam("fields");

        var allData = JSON.stringify(fields);

        var action = component.get("c.saveData");
        action.setParams({
            allData : allData,
        });
        action.setCallback(this, function(response){
            if(response.getState() == 'SUCCESS') {          
                var result = response.getReturnValue();
                console.log({result});
                if (result.Status == 'Success') {
                    var workspaceAPI = component.find("workspace"); //get the workspace component
                    workspaceAPI.getFocusedTabInfo()
                        .then(function(response1) {
                            var focusedTabId = response1.tabId;
                            //Opening New Tab
                            workspaceAPI.openSubtab({ //open sub tab
                                focus: true, //make the tab in focus
                                parentTabId : focusedTabId, //parent tab
                                pageReference: {
                                    "type": "standard__recordPage",
                                    "attributes": {
                                        "recordId": result.RecordId,
                                        "actionName":"view"
                                    }
                                },
                            }) 
                            .then(function(subTabId) {
                                // Once the subtab is opened, refresh the parent tab
                                workspaceAPI.refreshTab({
                                    tabId: focusedTabId, // Refresh the parent tab
                                    includeAllSubtabs: false
                                });
                            })
                        })
                    
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Success!",
                        "message": "Lot Item created successfully",
                        "type": "success"
                    });
                    toastEvent.fire();
                    component.set("v.isDisabled", false);
                } else {
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error!",
                        "message": result.Message,
                        "type": "error"
                    });
                    toastEvent.fire();
                    component.set("v.isDisabled", false);
                    $A.get("e.c:BT_SpinnerEvent").setParams({
                        "action": "HIDE"
                    }).fire();
                }
            }else{
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "message": "Something went wrong. Please try again.",
                    "type": "error"
                });
                toastEvent.fire();
                component.set("v.isDisabled", false);
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
            }
        });
        $A.enqueueAction(action);

    }
})