({
    doInit : function(component, event, helper) {
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();
        helper.getAdminValues(component, event, helper);

    },
   
})