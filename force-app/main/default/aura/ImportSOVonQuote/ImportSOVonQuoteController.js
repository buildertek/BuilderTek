({
    doInit: function (component, event, helper) {
        helper.doSearchHelper(component, event, helper);
    },

    closeModal: function (component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    },

    onSearch: function (component, event, helper) {
        helper.doSearchHelper(component, event, helper);
    },

    handleCheckedSOV: function (component, event, helper) {
        var checkedIds = component.get("v.checkedRecordIds") || [];
        var recordId = event.getSource().get("v.value");
        var isChecked = event.getSource().get("v.checked");
        
        if (isChecked) {
            if (!checkedIds.includes(recordId)) {
                checkedIds.push(recordId);
            }
        } else {
            checkedIds = checkedIds.filter(id => id !== recordId);
        }

        component.set("v.checkedRecordIds", checkedIds);
    },

    importSOV: function (component, event, helper) {
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();
        var selectedSOV = component.get("v.checkedRecordIds");
        if (!selectedSOV) {
            helper.showToast('Error', 'Error', 'Please select a SOV to import');
            return;
        } else {
            var action = component.get("c.importSOVOnQuote");
            action.setParams({
                'quoteId': component.get("v.recordId"),
                'sovId': component.get("v.checkedRecordIds")
            });
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var result = response.getReturnValue();
                    helper.showToast('Success', 'Success', 'SOV imported successfully');
                } else {
                    var error = response.getError();
                    console.log('Error =>', { error });
                    helper.showToast('Error', 'Error', error.message);
                }
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
                window.location.reload();
                $A.get("e.force:closeQuickAction").fire();
            });
            $A.enqueueAction(action);
        }
    },
})