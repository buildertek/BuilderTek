({
    doInit: function (component, event, helper) {
        component.set("v.isLoading", true);
        var recordId = component.get("v.recordId");
        var action = component.get("c.getsalesOrderLines");
        action.setParams({ salesOrderId: recordId });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var salesOrderLines = response.getReturnValue();
                salesOrderLines.forEach((sol) => {
                    if (sol.buildertek__Quantity__c === null) sol.buildertek__Quantity__c = 0;
                    if (sol.buildertek__Unit_Cost__c === null) sol.buildertek__Unit_Cost__c = 0;
                    if (sol.buildertek__Discount__c != null) sol.buildertek__Discount__c = sol.buildertek__Discount__c / 100;
                    if (sol.buildertek__Markup__c != null) sol.buildertek__Markup__c = sol.buildertek__Markup__c / 100;
                    if (sol.buildertek__Product__c != null) sol.productName = sol.buildertek__Product__r.Name;
                });
                console.log("Sales Lines: ", salesOrderLines);
                component.set("v.salesOrderLines", salesOrderLines);
            } else {
                console.error("Error in doInit: " + response.getError()[0].message);
            }
            component.set("v.isLoading", false);
        });
        $A.enqueueAction(action);

        component.set("v.columns", [
            { label: 'Name', fieldName: 'Name', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'left' } },
            { label: 'Product', fieldName: 'productName', type: 'text', initialWidth: 100, hideDefaultActions: true, cellAttributes: { alignment: 'left' } },
            { label: 'Description', fieldName: 'buildertek__Description__c', type: 'text', initialWidth: 100, hideDefaultActions: true, cellAttributes: { alignment: 'left' } },
            { label: 'Quantity', fieldName: 'buildertek__Quantity__c', type: 'number', initialWidth: 100, hideDefaultActions: true, cellAttributes: { alignment: 'left' } },
            { label: 'Unit Cost', fieldName: 'buildertek__Unit_Cost__c', type: 'currency', initialWidth: 100, hideDefaultActions: true, cellAttributes: { alignment: 'left' } },
            { label: 'Discount', fieldName: 'buildertek__Discount__c', type: 'percent', initialWidth: 100, hideDefaultActions: true, cellAttributes: { alignment: 'left' }, typeAttributes: { minimumFractionDigits: 2, maximumFractionDigits: 2 } },
            { label: 'Markup', fieldName: 'buildertek__Markup__c', type: 'percent', initialWidth: 100, hideDefaultActions: true, cellAttributes: { alignment: 'left' }, typeAttributes: { minimumFractionDigits: 2, maximumFractionDigits: 2 } }
        ]);
    },

    handleRowSelection: function (component, event, helper) {
        var selectedRows = event.getParam('selectedRows');
        component.set("v.selectedRows", selectedRows);
    },

    saveModel: function (component, event, helper) {
        component.set("v.isLoading", true);
        var selectedRows = component.get("v.selectedRows");

        //if selectedRows is empty, show error message
        if (selectedRows.length === 0) {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error",
                "message": "Please select at least one row",
                "type": "error"
            });
            toastEvent.fire();
            component.set("v.isLoading", false);
            return;
        }

        console.log("Selected Rows:", selectedRows);

        var action = component.get("c.createPurchaseOrders");
        action.setParams({
            salesOrderLines: selectedRows,
            salesOrderId: component.get("v.recordId")
        });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var purchaseOrderId = response.getReturnValue();
                $A.get("e.force:closeQuickAction").fire();

                // var navEvt = $A.get("e.force:navigateToSObject");
                // navEvt.setParams({
                //     "recordId": purchaseOrderId,
                //     "slideDevName": "detail"
                // });
                // navEvt.fire();
                var workspaceAPI = component.find("workspace"); //get the workspace component
                workspaceAPI.getFocusedTabInfo().then(function (response) {
                    var focusedTabId = response.tabId;
                    //Opening New Tab
                    workspaceAPI.openSubtab({ //open sub tab
                        focus: true, //make the tab in focus
                        parentTabId: focusedTabId, //parent tab
                        pageReference: {
                            "type": "standard__recordPage",
                            "attributes": {
                                "recordId": purchaseOrderId,
                                "actionName": "view"
                            }
                        },
                    })
                        .catch(function (error) {
                            console.log('error in inner block ', error);
                        });
                })
                    .catch(function (error) {
                        console.log(error);
                    });

            } else {
                console.log("Error while creating PO: " + response.getError()[0].message);
            }
            component.set("v.isLoading", false);
        });
        $A.enqueueAction(action);
    },

    closeModel: function (component, event, helper) {
        var recordId = component.get("v.recordId");
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": recordId,
            "slideDevName": "detail"
        });
        navEvt.fire();
    }
})