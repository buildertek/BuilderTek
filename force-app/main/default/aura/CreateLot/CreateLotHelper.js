({
    getCommunity : function(component, event, helper) {
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();
        var action = component.get("c.getCommunityRec");  
	    action.setParams({
	        "recordId" : component.get("v.recordId")
	    });
        action.setCallback(this, function (response) {
            if (response.getState() == 'SUCCESS' && response.getReturnValue()) {
                console.log(response.getReturnValue());
                component.set("v.communityRecord", response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "HIDE"
        }).fire();
    }
})