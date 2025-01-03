({
    // cloned component from SchedulePO
	doInit : function(component, event, helper) {
        helper.checkWeekend(component, event, helper);
        helper.getFieldsetValue(component, event, helper);
        helper.initializeDates(component);
	},
	
    closeModel: function(component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    },

    serachPredecessor:function(component, event, helper) {
        component.set('v.diplayPredecessorlist' , true);
        var action = component.get('c.getPredecessorList');
        action.setParams({
            scheduleId:component.get('v.selectedValue')
        });
        action.setCallback(this, function(response){
            var state=response.getState();
            var result=response.getReturnValue();
            console.log('serachPredecessor result :: ' , result);

            if(state === 'SUCCESS'){
                const keyValueArray = Object.entries(result).map(([key, value]) => ({ key, value }));
                component.set('v.allPredecessorValue' , keyValueArray);
                component.set('v.predecessorList' , keyValueArray);
            }
        });
        $A.enqueueAction(action);
        console.log(component.get('v.predecessorList'));
    },

    clickPredecessorValue:function(component, event, helper) {
        var record = event.currentTarget.dataset.value;
        var recordId = event.currentTarget.dataset.id;
        component.set("v.selectedPredecessor", record);
        component.set('v.diplayPredecessorlist' , false);
        component.set('v.selectedPredecessorId' , recordId);
        console.log({recordId});
    },

    handleScheduleChange:function(component, event, helper) {
        component.set('v.diplayPredecessorlist' , false);
        component.set('v.selectedPredecessor' , '');
        component.set('v.selectedPredecessorId' , '');
    },

    onkeyUp:function(component, event, helper) {
        var getkeyValue= event.getSource().get('v.value').toLowerCase();
        var getAllPredecessorValue= component.get('v.allPredecessorValue');
        var tempArray = [];
        for (var i = 0; i < getAllPredecessorValue.length; i++) {
            if ((getAllPredecessorValue[i].value.toLowerCase().indexOf(getkeyValue) != -1)) {
                    tempArray.push(getAllPredecessorValue[i]);
            }else{
                component.set("v.selectedPredecessorId" , '');
            }
        }
        console.log({tempArray});
        component.set('v.predecessorList' , tempArray);
    },

    hideList:function(component, event, helper){
        component.set('v.diplayPredecessorlist' , false);
    },

    handleSubmit: function (component, event, helper) {
        component.set("v.isDisabled", true);
		component.set("v.Spinner", true);
        event.preventDefault(); // Prevent default submit
        var fields = event.getParam("fields");
        console.log('fields in handleSubmit :: ' , fields);

        var name = component.get("v.selectedTaskName");
        console.log(name);
        if (name != null && name != '' && name!= undefined) {
            fields["Name"] = name;
        }

        var serReqId = component.get("v.recordId");
        if (serReqId != null && serReqId != '' && serReqId != undefined) {
            fields["buildertek__Service_Request__c"] = serReqId;
        }

        var scheduleId = component.get("v.selectedValue");
        if (scheduleId != null && scheduleId != '' && scheduleId != undefined) {
            fields["buildertek__Schedule__c"] = scheduleId;
        }

        var PredecessorId = component.get("v.selectedPredecessorId");
        if (PredecessorId != null && PredecessorId != '' && PredecessorId != undefined) {
            fields["buildertek__Dependency__c"] = PredecessorId;
        }

        var startDate = component.get("v.StartDate");
        if (startDate != null && startDate != '' && startDate != undefined) {
            fields["buildertek__Start__c"] = startDate;
        }

        var finishDate = component.get("v.FinishDate");
        if (finishDate != null && finishDate != '' && finishDate != undefined) {
            fields["buildertek__Finish__c"] = finishDate;
        }

        var phase = component.get("v.selectedPhase");
        if (phase != null && phase != '' && phase != undefined) {
            fields["buildertek__Phase__c"] = phase;
        }

        var allData = JSON.stringify(fields);
        console.log(allData);

        var action = component.get("c.saveData");
        action.setParams({
            allData : allData,
            recordId : serReqId,
            scheduleId : scheduleId
        });
        action.setCallback(this, function(response){
            if(response.getState() == 'SUCCESS') {            
                var result = response.getReturnValue();
                console.log({result});
                if (result.Status == 'Success') {
                    var workspaceAPI = component.find("workspace");
                    var focusedTabId = response.tabId;
                    //timeout
                    window.setTimeout(
                        $A.getCallback(function() {
                            workspaceAPI.getFocusedTabInfo().then(function(response) {
                                workspaceAPI.closeTab({tabId: focusedTabId});
                                component.set("v.Spinner", false);
                            })
                        }), 1000
                        );
                    var navEvt = $A.get("e.force:navigateToSObject");
                    navEvt.setParams({
                        "recordId": result.RecordId,
                        "slideDevName": "Detail"
                    });
                    navEvt.fire();
                    
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Success!",
                        "message": "Service Request scheduled successfully",
                        "type": "success"
                    });
                    toastEvent.fire();
                    component.set("v.isDisabled", false);
                } else {
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error!",
                        "message": result.Message,
                        "type": "error"
                    });
                    toastEvent.fire();
                    component.set("v.isDisabled", false);
                    component.set("v.Spinner", false);
                }
            }else{
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "message": "Something went wrong. Please try again.",
                    "type": "error"
                });
                toastEvent.fire();
                component.set("v.isDisabled", false);
                component.set("v.Spinner", false);
            }
        });
        $A.enqueueAction(action);
    },

    preventHide: function(component, event, helper) {
        event.preventDefault();
    },

    changeProject:function(component, event, helper) {
        var projectId = event.getSource().get('v.value');
        console.log('projectId-->',projectId);
        if(projectId != null && projectId != '' && projectId != undefined){
            console.log('Inside If');
            var action = component.get("c.getProjectSchedules"); 
            action.setParams({
                "projectId" : projectId[0]
            });
            action.setCallback(this, function (response) {
                if (response.getState() === "SUCCESS") {  
                    var result = response.getReturnValue();
                    console.log('changeProject result :: ',result);
                    component.set("v.Schedules", result);
                } 
            });  
            $A.enqueueAction(action);
        } else{
            component.set('v.selectedValue' , '');
            component.set('v.Schedules' , []);
        }
    },

    changeFinishDate: function(component, event, helper) {
        var includeWeekends = component.get('v.includeWeekends');
        var startDate = component.get('v.StartDate');
        var duration = parseInt(event.getSource().get('v.value'));

        if(includeWeekends){
            if (!isNaN(duration) && duration > 0){
                var durationFinal = duration - 1;
                var finishDate = new Date(startDate);
                finishDate.setDate(finishDate.getDate() + durationFinal);
                let t = new Date(finishDate.toUTCString());
                let yyyyMMdd = t.toISOString().slice(0, 10);
                component.set('v.FinishDate', yyyyMMdd);
    
                // Reset any custom validity
                var inputField = component.find('finishDate');
                inputField.setCustomValidity('');
                inputField.reportValidity();
            }else {
                component.set('v.FinishDate', null);
            }
        }else{
            if (!isNaN(duration) && duration > 0) {
                var finishDate = new Date(startDate);
                var daysToAdd = duration - 1;
        
                // Loop through each day to calculate finish date
                while (daysToAdd > 0) {
                    // Move to the next day
                    finishDate.setDate(finishDate.getDate() + 1);
        
                    // Check if the day is not a weekend (Saturday or Sunday)
                    if (finishDate.getDay() !== 0 && finishDate.getDay() !== 6) {
                        daysToAdd--;
                    }
                }
        
                let t = new Date(finishDate.toUTCString());
                let yyyyMMdd = t.toISOString().slice(0, 10);
                component.set('v.FinishDate', yyyyMMdd);
        
                // Reset any custom validity
                var inputField = component.find('finishDate');
                inputField.setCustomValidity('');
                inputField.reportValidity();
            } else {
                component.set('v.FinishDate', null);
            }
        }
    },
    
    changeDuration: function(component, event, helper) {
        var includeWeekends = component.get('v.includeWeekends');
        if(includeWeekends){
            var finishDate = event.getSource().get('v.value');
            if (finishDate != null){
                var startDate = component.get('v.StartDate');
                var start = new Date(startDate);
                var finish = new Date(finishDate);
                console.log('start--->',start);
                console.log('finish--->',finish);  
                var diffMs = finish - start;
                var diffDays = diffMs / (1000 * 60 * 60 * 24);
                diffDays = diffDays+1;
                console.log('diffDays--->',diffDays);
                component.set('v.durationNum', diffDays);
            }else{
                component.set('v.durationNum', '');
            }
        }else{
            try {
                var startDate = component.get('v.StartDate');
                var finishDate = event.getSource().get('v.value');
                console.log('finishDate--->',finishDate);
                if (finishDate != null) {
                    var inputField = component.find('finishDate');
                    if (finishDate < startDate) {
                        inputField.setCustomValidity('Finish Date must be after Start Date');
                        inputField.reportValidity();
                    } else {
                        inputField.setCustomValidity('');
                        inputField.reportValidity();
                        var escapeWeekendDays = helper.modifyDate(finishDate);
                        var formattedFinishDate = escapeWeekendDays.getFullYear() + '-' + 
                                                ('0' + (escapeWeekendDays.getMonth() + 1)).slice(-2) + '-' + 
                                                ('0' + escapeWeekendDays.getDate()).slice(-2);
                        console.log('finishDate-->',formattedFinishDate);
                        component.set('v.FinishDate', formattedFinishDate);
                        var start = new Date(startDate);
                        var finish = new Date(formattedFinishDate);
                        var workingDays = 0;
                        
                        // Loop through each day between start and finish dates
                        while (start <= finish) {
                            // Check if the day is not a weekend (Saturday or Sunday)
                            if (start.getDay() !== 0 && start.getDay() !== 6) {
                                workingDays++;
                            }
                            // Move to the next day
                            start.setDate(start.getDate() + 1);
                        }
                        console.log('workingDays--->',workingDays);
                        component.set('v.durationNum', workingDays);
                    }
                } else {
                    component.set('v.durationNum', '');
                }
            } catch (error) {
                console.log('error--->',error);
            }
        }
    },

    enbleFinishAndDuration: function(component, event, helper) {
        var startDate = event.getSource().get('v.value');
        var inputField = component.find('finishDate');
        inputField.setCustomValidity('');
        inputField.reportValidity();
        if (startDate != null) {
            component.set('v.disablefields', false);
            component.set('v.durationNum', '');
            component.set('v.FinishDate', '');
        } else {
            component.set('v.disablefields', true);
            component.set('v.durationNum', '');
            component.set('v.FinishDate', '');
        }
    },
})