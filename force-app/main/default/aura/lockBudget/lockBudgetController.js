({
    handleLockBudget: function (component, event, helper) {
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();
        var action = component.get("c.lockBudget");
        action.setParams({
            budgetId: component.get("v.recordId")
        });
        action.setCallback(this, $A.getCallback((response) => {
            console.log('response', response.getReturnValue());
            if (response.getReturnValue() === "Success") {
                helper.showToast("Success", "Budget locked successfully", "success");
            } else if (response.getReturnValue() === "Budget is already locked") {
                helper.showToast("Error", "Budget is already locked", "error");
            } else {
                helper.showToast("Error", "Failed to lock budget: " + response.getReturnValue(), "error");
            }
            $A.get("e.force:closeQuickAction").fire();
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();
        }));
        $A.enqueueAction(action);
    },

    handleCancel: function (component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    }
})