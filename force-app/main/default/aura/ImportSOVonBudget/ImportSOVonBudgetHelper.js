({
	doSearchHelper : function(component, event, helper) {
        var action = component.get("c.getSOVs");
        action.setParams({		
            'recordId': component.get("v.recordId"),	
            'searchKeyword' : component.get('v.searchKeyword')
        });
		action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                var result = response.getReturnValue();
                component.set("v.sovList", result);
            } else{
                var error = response.getError();
                this.showToast('Error', 'Error', error.message);
            }
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();
        });
        $A.enqueueAction(action);
    },

    importSOV : function(component, event, helper){
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();
        var SOVsList = component.get("v.sovList");
        var sovIds = [];
        for(var i=0 ; i < SOVsList.length;i++){
            if(SOVsList[i].sovCheck == true){
                if(SOVsList[i].sovRecord != null){
                    sovIds.push(SOVsList[i].sovRecord.Id);    
                }else if(SOVsList[i].sovRecord != null){
                    sovIds.push(SOVsList[i].sovRecord.Id);    
                }
            }
        }

        if(sovIds.length > 0){
            var action = component.get("c.importSOVs");  
            action.setParams({
                sovIds : sovIds,
                recordId : component.get("v.recordId")
            });
            action.setCallback(this, function(response){
                var state = response.getState();
                if(state === "SUCCESS"){
                    var result = response.getReturnValue();  
                    if(result == 'SOV Imported Successfully'){
                        helper.showToast('Success', 'Success', 'SOV Imported Successfully');
                    }else{
                        helper.showToast('Error', 'Error', result);
                    }
                    $A.get("e.c:BT_SpinnerEvent").setParams({
                        "action": "HIDE"
                    }).fire();
                    window.location.reload();
                    $A.get("e.force:closeQuickAction").fire();  
                }
            });
            $A.enqueueAction(action);
        }else {
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();
            helper.showToast('Error', 'Error', "Please Select atleast One SOV record.");
        }
	},

	showToast: function(type, title, message) {
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