({
	doInit : function(component, event, helper) {
        component.set("v.IsSpinner", true);
        var recordId = component.get("v.recordId");
        console.log("Record ID: ", recordId);
        var action = component.get("c.getQuoteLines");
        action.setParams({ Id: recordId });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
            var quoteLines = response.getReturnValue();
            //iterate over quoteLines and make a new field costcodeName = buildertek__Cost_Code__r.Name
            quoteLines.forEach(function(quoteLine) {
                if (quoteLine.buildertek__Cost_Code__c) {
                    quoteLine.costcodeName = quoteLine.buildertek__Cost_Code__r.Name;
                }
                if (quoteLine.buildertek__Vendor__c) {
                    quoteLine.vendorName = quoteLine.buildertek__Vendor__r.Name;
                }
            });
            console.log("Quote Lines: ", quoteLines);
            component.set("v.quoteLines", quoteLines);
            component.set("v.IsSpinner", false);
            } else {
            console.error("Failed with state: " + state);
            }
        });
        $A.enqueueAction(action);

        component.set("v.columns", [
            { label: 'Name', fieldName: 'Name', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'left' } },
            { label: 'Quantity', fieldName: 'buildertek__Quantity__c', type: 'number', initialWidth: 100, hideDefaultActions: true, cellAttributes: { alignment: 'left' } },
            { label: 'Unit Price', fieldName: 'buildertek__Unit_Cost__c', type: 'currency', initialWidth: 100, hideDefaultActions: true, cellAttributes: { alignment: 'left' } },
            { label: 'Cost Code', fieldName: 'costcodeName', type: 'text', initialWidth: 120, hideDefaultActions: true, cellAttributes: { alignment: 'left' } },
            { label: 'Description', fieldName: 'buildertek__Description__c', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'left' } },
            { label: 'Vendor', fieldName: 'vendorName', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'left' } }
        ]);


	},

    handleRowSelection: function(component, event, helper) {
        var selectedRows = event.getParam('selectedRows');
        component.set("v.selectedRows", selectedRows);
    },

    saveModel: function(component, event, helper) {
        //IsSpinner
        component.set("v.IsSpinner", true);
        var selectedRows = component.get("v.selectedRows");
        //remove the quoteLine.costcodeName from all selectedRows if exist
        selectedRows.forEach(function(row) {
            if (row.hasOwnProperty('costcodeName')) {
                delete row.costcodeName;
            }
        });
        console.log("Selected Rows:", selectedRows);

        //if selectedRows is empty, show error message
        if (selectedRows.length === 0) {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error",
                "message": "Please select at least one row",
                "type": "error"
            });
            toastEvent.fire();
            component.set("v.IsSpinner", false);
            return;
        }


        var action = component.get("c.createPurchaseOrders");
        action.setParams({ 
            quoteItems: selectedRows,
            quoteId: component.get("v.recordId")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var purchaseOrder = response.getReturnValue();
                console.log("Purchase Order: ", purchaseOrder);

                //force close quick action and open the purchase order record
                $A.get("e.force:closeQuickAction").fire();

                var navEvt = $A.get("e.force:navigateToSObject");
                navEvt.setParams({ 
                    "recordId": purchaseOrder, 
                    "slideDevName": "detail"
                });
                navEvt.fire();
                component.set("v.IsSpinner", false);

            } else {
                console.error("Failed with state: " + state);
                component.set("v.IsSpinner", false);
            }
        });
        $A.enqueueAction(action);


    },
    
    closeModel: function(component, event, helper) {
        var recordId = component.get("v.recordId");
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({ 
            "recordId": recordId, 
            "slideDevName": "detail"
        }); 
        navEvt.fire();
    },
    
    saveModel1: function(component, event, helper) {
        helper.createPurchaseOrder(component, event, helper);
       
    },
})