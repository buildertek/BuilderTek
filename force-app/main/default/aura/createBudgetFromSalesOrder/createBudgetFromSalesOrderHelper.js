({
    showToast: function (title, message, type) {
		var toastEvent = $A.get("e.force:showToast");
		toastEvent.setParams({
			"title": title,
			"message": message,
			"type": type
		});
		toastEvent.fire();
	},

	createBudgetFromSalesOrder: function (component, helper) {
		var action = component.get("c.createBudgetFromSalesOrder");
		action.setParams({ salesOrderId: component.get("v.recordId") });

		action.setCallback(this, function (response) {
			var state = response.getState();
			if (state == "SUCCESS") {
				var result = response.getReturnValue();
                console.log({result});
				$A.get("e.force:closeQuickAction").fire();

                this.showToast('Success', 'Budget Created Successfully', 'Success');
                $A.get('e.force:refreshView').fire();

                var workspaceAPI = component.find("workspace"); //get the workspace component
                workspaceAPI.getFocusedTabInfo().then(function(response) {
                    var focusedTabId = response.tabId;
                    //Opening New Tab
                    workspaceAPI.openSubtab({ //open sub tab
                        focus: true, //make the tab in focus
                        parentTabId : focusedTabId, //parent tab
                        pageReference: {
                            "type": "standard__recordPage",
                            "attributes": {
                                "recordId": result,
                                "actionName":"view"
                            }
                        },
                    }) 
                    .catch(function(error) {
                        console.log('error in inner block ',error);
                    });
                })
                .catch(function(error) {
                    console.log(error);
                }); 
			} else if (state == "ERROR") {
				this.showToast('Error', result, 'Error');
			}
			$A.get("e.c:BT_SpinnerEvent").setParams({
				"action": "HIDE"
			}).fire();
		});
		$A.enqueueAction(action);
	},
})