({
    getVendorReviewLines : function(component, event, helper) {
        var action = component.get("c.getVendorReviewLines");
        action.setParams({
            vendorReviewId: component.get("v.recordId")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var vendorReviewLines = response.getReturnValue();
                component.set("v.vendorReviewLines", vendorReviewLines);
                component.set("v.Spinner", false);
            }
        });
        $A.enqueueAction(action);

    },
})