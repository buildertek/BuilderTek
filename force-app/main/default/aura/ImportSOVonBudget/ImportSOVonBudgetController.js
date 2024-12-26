({
	doInit : function(component, event, helper) {
         $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();
	    helper.doSearchHelper(component, event, helper);
	},
	
	handleCheck : function(component, event, helper) {
        var checkbox = event.getSource();  
        var Submittals = component.get("v.sovList");
	    
	    for(var i=0 ; i < Submittals.length;i++){
	        if(Submittals[i].sovRecord != null){
	            if(Submittals[i].sovRecord.Id == checkbox.get("v.text") && Submittals[i].sovCheck == false){
    	            Submittals[i].sovCheck = true;
    	        }
    	        else if(Submittals[i].sovRecord.Id == checkbox.get("v.text") && Submittals[i].sovCheck == true){
    	             Submittals[i].sovCheck = false;
    	        }    
	        }else if(Submittals[i].sovRecord != null){
	            if(Submittals[i].sovRecord.Id == checkbox.get("v.text") && Submittals[i].sovCheck == false){
    	            Submittals[i].sovCheck = true;
    	        }
    	        else if(Submittals[i].sovRecord.Id == checkbox.get("v.text") && Submittals[i].sovCheck == true){
    	             Submittals[i].sovCheck = false;
    	        }
	        }
	    }
    },
	
	closeModel : function(component, event, helper){
	    $A.get("e.force:closeQuickAction").fire();    
	},
	
	importSOV : function(component, event, helper){
        helper.importSOV(component, event, helper);
	},
	
    onSearch: function (component, event, helper) {
        helper.doSearchHelper(component, event, helper);
    },
})