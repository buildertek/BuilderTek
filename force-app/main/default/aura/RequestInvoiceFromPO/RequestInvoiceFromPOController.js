({
    doInit : function(component, event, helper) {
        //fetching the name of the vendor
        $A.get("e.c:BT_SpinnerEvent").setParams({"action": "SHOW"}).fire();
        var recordId = component.get("v.recordId");
        var action = component.get("c.fetchVendorName");
        action.setParams({
            recordId: recordId,
        });
        action.setCallback(this, function (response) {

            var result = response.getReturnValue();
            console.log('Result of Vendor =>', { result });

            if (result.status == 'SUCCESS') {
                component.set("v.vendorName", result.message);
            } else {
                component.set("v.vendorName", result.message);
            }
            $A.get("e.c:BT_SpinnerEvent").setParams({"action": "HIDE"}).fire();
        });
        $A.enqueueAction(action);
    },


    sendmailtovendor: function (component, event, helper) {
        $A.get("e.c:BT_SpinnerEvent").setParams({"action": "SHOW"}).fire();
        var recordId = component.get("v.recordId");
        var action = component.get("c.sendMailtoVendor");
        action.setParams({
            recordId: recordId,
            quickActionName: 'RequestInvoice'
        });
        action.setCallback(this, function (response) {
            var result = response.getReturnValue();
            console.log('Result =>', { result });
            $A.get("e.c:BT_SpinnerEvent").setParams({"action": "HIDE"}).fire();
            $A.get("e.force:closeQuickAction").fire();
            if (result.status == 'SUCCESS') {
                helper.showToastHelper(component, event, helper,result.status , result.message , result.status , 3000);
            } else {
                helper.showToastHelper(component, event, helper,result.status , result.message , result.status , 3000);
            }
        });
        $A.enqueueAction(action);
    },    

    closeModal: function (component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    }
})