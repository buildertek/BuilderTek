({
    doInit: function (component, event, helper) {
        component.set("v.Spinner", true);
        window.setTimeout(
            $A.getCallback(function () {
                console.log('vendor review Id:', component.get('v.recordId'));
                helper.getVendorReviewLines(component, event, helper);
            }),
            2000
        );
    },
})