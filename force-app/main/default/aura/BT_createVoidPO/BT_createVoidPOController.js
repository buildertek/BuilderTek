({
    doInit : function(component, event, helper) {
        console.log("record ID --> "+component.get("v.recordId"));
        var action = component.get("c.getVoidReason");
        action.setParams({
            recordId : component.get("v.recordId")
        });
        action.setCallback(this, function(response){
            var result = response.getReturnValue();
            // console.log("result --> "+result);
            if(result != null){
                console.log('Success fully');
                component.set("v.voidReason",result);
            }else{
                console.log("result --> "+result);
            }
        });

        $A.enqueueAction(action);

    },

    validateFields : function(component, event) {
        console.log("Inside validate");
        var allValid = component.find('voidReason').get('v.validity').valid;
        console.log("Validate fiedl called.");
        if (!allValid) {
            component.find('voidReason').showHelpMessageIfInvalid();
            return false;
        }
        return true;
    },

    saveProcess : function(component, event, helper){
    console.log('save');
        var allValid = component.find('voidReason').get('v.validity').valid;
        console.log("Validate fiedl called.");
        if (!allValid) {
            component.find('voidReason').showHelpMessageIfInvalid();
            console.log('Not Valid');
            return;
        }

        console.log('Valid');


        // Showing Spinner
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();

        console.log("Spinner Start");
        console.log("Void Reason Value --> "+component.get("v.voidReason"));

        var action = component.get("c.createVoidPO");
        action.setParams({
            recordId : component.get("v.recordId"),
            voidReason : component.get("v.voidReason"),
        });
        action.setCallback(this, function(response){
            var result = response.getReturnValue();
            if(result.status == 'success'){
                // var sObjectEvent = $A.get("e.force:navigateToSObject");
                // sObjectEvent.setParams({
                //     "recordId": result.createRecordId
                // })
                // sObjectEvent.fire();

                var workspaceAPI = component.find("workspace"); //get the workspace component
                workspaceAPI.getFocusedTabInfo()
                    .then(function(response) {
                        var focusedTabId = response.tabId;
                        //Opening New Tab
                        workspaceAPI.openSubtab({ //open sub tab
                            focus: true, //make the tab in focus
                            parentTabId : focusedTabId, //parent tab
                            pageReference: {
                            "type": "standard__recordPage",
                            "attributes": {
                                "recordId": result.createRecordId,
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
                        .catch(function(error) {
                            console.log('error in inner block ',error);
                        });
                    })
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();

                helper.showToastHelper(component, event, helper,result.status , result.message , result.status , 3000 );
            }else if(result.status == 'error'){

                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();

                helper.showToastHelper(component, event, helper,result.status , result.message , result.status , 3000 )
            }

            $A.get("e.force:closeQuickAction").fire();
        });
        $A.enqueueAction(action);

    },

    cancelProcess : function(component, event, helper){
        console.log("Cancel Btn Called!");
        $A.get("e.force:closeQuickAction").fire();
    }

})