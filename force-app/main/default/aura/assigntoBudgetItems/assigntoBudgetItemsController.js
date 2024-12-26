({
    init : function(component, event, helper) {
        component.set("v.IsSpinner", true);
        component.set("v.selectedBudgetItem", null);
        var recordId = component.get("v.recordId");
        console.log('init');
        var action = component.get("c.getdataforABI");
        action.setParams({
            "recordId": component.get("v.recordId")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('success');
                component.set("v.IsSpinner", false);
                component.set("v.showmodal", true);
                var result = response.getReturnValue();
                console.log('result', result);
                var budgetItems = result.budgetItems;
                component.set("v.budgetItems", budgetItems);
                component.set("v.filteredBudgetItems", budgetItems); // set filtered items initially
                var po = result.purchaseOrder;
                //if buildertek__Budget__c, buildertek__Budget_Line__c are not null in PO, then show toast message and close modal
                if (po.buildertek__Budget__c != null && po.buildertek__Budget_Line__c != null) {
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error",
                        "message": "Budget and Budget Line are already assigned to this Purchase Order",
                        "type": "error",
                        "duration": 3000
                        });
                    toastEvent.fire();
                    component.set("v.IsSpinner", false);
                    component.set("v.showmodal", false);
                    $A.get("e.force:closeQuickAction").fire();
                    return;
                }

            } else {
                console.log('error');
            }
        });
        $A.enqueueAction(action);
    },

    handleSearchChange: function(component, event, helper) {
        var searchKeyword = component.get("v.searchKeyword").toLowerCase();
        var allBudgetItems = component.get("v.budgetItems");
        
        if (searchKeyword) {
            var filteredItems = allBudgetItems.filter(function(item) {
                return item.Name && item.Name.toLowerCase().includes(searchKeyword);
            });
            component.set("v.filteredBudgetItems", filteredItems);
        } else {
            component.set("v.filteredBudgetItems", allBudgetItems); // reset when search is cleared
        }
    },

    handleBudgetItemChange : function(component, event, helper) {
        var Id = event.getSource().get("v.value");
        console.log('Id', Id);
        component.set("v.selectedBudgetItem", Id);
    },

    assignBudgetItem : function(component, event, helper) {
        component.set("v.IsSpinner", true);
        var selectedBudgetItem = component.get("v.selectedBudgetItem");
        if (selectedBudgetItem == null) {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error",
                "message": "Please select Budget Item",
                "type": "error",
                "duration": 3000
            });
            toastEvent.fire();
            component.set("v.IsSpinner", false);
            return;
        }

        var budgetItemrec = component.get("v.budgetItems").find(budgetItem => budgetItem.Id == selectedBudgetItem);
        var purchaseOrder = {
            "Id": component.get("v.recordId"),
            "buildertek__Budget__c": budgetItemrec.buildertek__Budget__c,
            "buildertek__Budget_Line__c": budgetItemrec.Id
        };
        var action = component.get("c.assignBudgetItemDB");
        action.setParams({
            "purchaseOrder": purchaseOrder
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                if (result === "Success") {
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Success",
                        "message": "Budget Item assigned successfully",
                        "type": "success"
                    });
                    toastEvent.fire();
                    $A.get("e.force:closeQuickAction").fire();
                    $A.get('e.force:refreshView').fire();
                } else {
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error",
                        "message": "Failed to assign Budget Item",
                        "type": "error"
                    });
                    toastEvent.fire();
                }
                component.set("v.IsSpinner", false);
            } else {
                console.log('error');
            }
        });
        $A.enqueueAction(action);
    },

    closeModel : function(component, event, helper) {
        component.set("v.showmodal", false);
        $A.get("e.force:closeQuickAction").fire();
    }
})