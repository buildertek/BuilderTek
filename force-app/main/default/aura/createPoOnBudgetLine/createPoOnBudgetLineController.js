({
	doInit: function(component, event, helper) {
		var action = component.get("c.createPoOnBudgetLine");
        action.setParams({
            recordId: component.get("v.recordId")
        });

        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS"){
                var result = response.getReturnValue();
            	if(result.Message == 'Success') {
            		$A.get("e.force:closeQuickAction").fire();
            		component.find('notifLib').showNotice({
			            "variant": "success",
			            "header": "Success",
			            "message": "PO created.",
			            closeCallback: function() {
			            	$A.get('e.force:refreshView').fire();
			            	var event = $A.get('e.force:navigateToSObject' );
			            	event.setParams({
					            'recordId' : result.RecordId
					        }).fire();
			            }
			        });
            	}else if(result.Message == 'Vendor is required'){
                    component.find('notifLib').showNotice({
    			            "variant": "warning",
    			            "header": "Warning",
    			            "message": result.Message,
    			            closeCallback: function() {
    			            	$A.get('e.force:refreshView').fire();
    			            	var event = $A.get('e.force:navigateToSObject' );
    			            	event.setParams({
    					            'recordId' : component.get("v.recordId")
    					        }).fire();
    			            }
    			        });    
                }else{
                    component.find('notifLib').showNotice({
    			            "variant": "error",
    			            "header": "Error",
    			            "message": result.Message,
    			            closeCallback: function() {
    			            	$A.get('e.force:refreshView').fire();
    			            	var event = $A.get('e.force:navigateToSObject' );
    			            	event.setParams({
    					            'recordId' : component.get("v.recordId")
    					        }).fire();
    			            }
    			        });    
                }
            }
        });
        
        $A.enqueueAction(action);
    },
})