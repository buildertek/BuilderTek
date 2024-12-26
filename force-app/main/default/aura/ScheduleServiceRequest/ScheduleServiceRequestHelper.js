({
	getSRDetails : function(component, event, helper) {
	    var action = component.get("c.getServiceRequestData");  
	    action.setParams({
	        "recordId" : component.get("v.recordId")
	    });
        action.setCallback(this, function (response) {
        	if (response.getState() === "SUCCESS") {  
        	    var result = response.getReturnValue();
                console.log('getSRDetails result :: ',result);
        	    if(result.buildertek__Project__c != null){
                    component.set("v.selectedProjectId", result.buildertek__Project__c);
                }
                if(result.buildertek__Subject__c != null){
                    let taskName = result.buildertek__Subject__c;
                    // Trim the task name to 80 characters if it exceeds the limit
                    if (taskName.length > 80) {
                        taskName = taskName.substring(0, 80);
                    }
                    component.set("v.selectedTaskName", taskName);
                }
                if(result.buildertek__Vendor__c != null){
                    component.set("v.selectedVendorId",result.buildertek__Vendor__c);
                }
                helper.getSchedules(component, event, helper);
        	} 
        });  
        $A.enqueueAction(action);    
	}, 

    checkWeekend:function(component, event, helper){
        console.log('checkWeekend--->');
        var action = component.get("c.checkIncludeWeekend");
        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS") {
                var result = response.getReturnValue();
                console.log('checkWeekend result :: ',result);
                component.set("v.includeWeekends", result);
            }});    
        $A.enqueueAction(action);
    },

	getSchedules : function(component, event, helper) {
        window.setTimeout(
            $A.getCallback(function () {
                component.set("v.Spinner", false);
            }), 2000
        );
		var action = component.get("c.getSchedulelist"); 
		action.setParams({
		    "recordId" : component.get("v.recordId")
		});
        action.setCallback(this, function (response) {
        	if (response.getState() === "SUCCESS") {  
                console.log('getSchedules result :: ' , response.getReturnValue());
        	    var result = response.getReturnValue();
        		component.set("v.Schedules", result);
        	} 
        });  
        $A.enqueueAction(action);
	},

    getFieldsetValue : function(component, event, helper) {
        component.set("v.Spinner", true);
		var action = component.get("c.getFieldSet");
        action.setParams({
            objectName: 'buildertek__Project_Task__c',
            fieldSetName: 'buildertek__New_Fieldset_For_Po'
        });
        action.setCallback(this, function (response) {
            if (response.getState() == 'SUCCESS' && response.getReturnValue()) {
                var listOfFields = JSON.parse(response.getReturnValue());
                console.log({listOfFields});
                var phaseField = listOfFields.find(field => field.name === 'buildertek__Phase__c');
                if(phaseField != null && phaseField != undefined){
                    // console.log('phaseField.pickListValuesList--->', phaseField.pickListValuesList);

                    component.set("v.phaseOptions", phaseField.pickListValuesList);
                    if (phaseField.pickListValuesList.includes("No Phase")) {
                        // Set "No Phase" as the selected phase
                        component.set("v.selectedPhase", "No Phase");
                    }
                }
                component.set("v.listOfFields", listOfFields);
            }
        });
        $A.enqueueAction(action);
        helper.getSRDetails(component, event, helper);
	},

    modifyDate: function(inputDate) {
        // Convert the inputDate to a JavaScript Date object
        var dt = new Date(inputDate);
        
        // Check if the inputDate is Saturday (6) or Sunday (0)
        var dayOfWeek = dt.getDay();
        if (dayOfWeek === 6) { // Saturday
            dt.setDate(dt.getDate() + 2); // Add 2 days
        } else if (dayOfWeek === 0) { // Sunday
            dt.setDate(dt.getDate() + 1); // Add 1 day
        }
        // Return the modified date
        return dt;
    },

    initializeDates: function(component) {
        // Set startDate & FinishDate to today's date
        var startDate = new Date();
        let t = new Date(startDate.toUTCString());
        let yyyyMMdd = t.toISOString().slice(0, 10);
        component.set("v.StartDate", yyyyMMdd);
        component.set("v.FinishDate", yyyyMMdd);
        component.set("v.durationNum", 1);
    },
})