({
    doSearchHelper: function (component, event, helper) {
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();

        var action = component.get("c.fetchSOVForQuote");
        action.setParams({
            'searchKeyword': component.get('v.searchKeyword'),
            'quoteId': component.get("v.recordId")
        });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                component.set("v.SOVList", result);
            } else {
                var error = response.getError();
                console.log('Error =>', { error });
                this.showToast('Error', 'Error', error.message , '5000');

            }
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();
        });
        $A.enqueueAction(action);
    },

    showToast: function (type, title, message) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "type": type,
            "message": message,
            "duration": 3000
        });
        toastEvent.fire();
    },
})