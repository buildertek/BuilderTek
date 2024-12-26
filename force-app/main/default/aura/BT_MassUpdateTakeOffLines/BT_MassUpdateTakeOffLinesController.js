({
    doInit: function (component, event, helper) {
        var pageRef = component.get("v.pageReference");
        // console.log('pageRef--',JSON.stringify(pageRef));
        if (pageRef != undefined) {
            var state = pageRef.state; // state holds any query params	        
            // console.log('state = ' + JSON.stringify(state));
            if (state != undefined && state.c__Id != undefined) {
                component.set("v.recordId", state.c__Id);
            }
            if (state != undefined && state.buildertek__Id != undefined) {
                component.set("v.recordId", state.buildertek__Id);
            }
        }

        var workspaceAPI = component.find("workspace");
        workspaceAPI.getEnclosingTabId().then((response) => {
            let opendTab = response.tabId;
            workspaceAPI.setTabLabel({
                tabId: opendTab,
                label: 'Mass Update'
            });
            workspaceAPI.setTabIcon({
                tabId: opendTab,
                icon: 'custom:custom91',
                iconAlt: 'Mass Update'
            });
        });
        // Optimized code for fast rendering...
        helper.takeoffRelatedInfo(component, event, helper);
        helper.getPhasesList(component, event, helper);
        helper.getRelatedPhasesList(component, event, helper);
        helper.helpergetProductPhase_BuildPhase(component, event, helper);
        // var pageNumber = component.get("v.PageNumber");
        // var pageSize = component.get("v.pageSize");
        // var SearchProductType = component.find("SearchProductType").get("v.value");
        // var searchLocation = component.find("searchLocation").get("v.value");
        // var searchCategory = component.find("searchCategory").get("v.value");
        // var searchTradeType = component.find("searchTradeType").get("v.value");
        // var searchCostCode = component.find("searchCostCode").get("v.value");
        // var searchVendor = component.find("searchVendor").get("v.value");
        // var searchPhase = component.find("searchPhase").get("v.value");
        // helper.getTableRows(component, event, helper, pageNumber, pageSize, SearchProductType, searchLocation, searchCategory, searchTradeType, searchCostCode, searchVendor, searchPhase);
        // helper.getTableFieldSet(component, event, helper);
        // console.log('recID--',component.get('v.recordId'));
        
        window.setTimeout(
            $A.getCallback(function () {
            }), 2000
        );
    },

    refreshPage: function (component, event, helper) {
        var focusedTabId = event.getParam('currentTabId');
        var workspaceAPI = component.find("workspace");

        workspaceAPI.getEnclosingTabId().then(function (tabId) {
                // console.log(tabId)
                if (tabId == focusedTabId) {
                    setTimeout(function () {
                        location.reload()
                    }, 1000);
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    },

    onAddClick: function (component, event, helper) {
        var fields = component.get('v.fieldSetValues');
        var list = component.get('v.listOfRecords');
        var groupId = event.currentTarget.dataset.id;

        // Create a new empty takeoff line object
        var newTakeoffLine = {};
        fields.forEach((field) => {
            newTakeoffLine[field.name] = field.type === 'BOOLEAN' ? false : '';
        });

        if (groupId != 'NoGrouping') {
            newTakeoffLine.buildertek__Build_Phase__c = groupId;
        }

        newTakeoffLine.buildertek__Project_Takeoff__c = component.get("v.recordId");

        var currentGroup = list.find(group => group.buildPhaseId === groupId);
        currentGroup.takeoffLines.unshift(newTakeoffLine);

        component.set('v.listOfRecords', list);
    },

    onAddWithPhaseClick: function (component, event, helper) {
        component.set("v.selectedPhaseId", null);
        component.set("v.showPhaseModal", true);
    },

    closeScreen: function (component, event, helper) {
        var theBomId = component.get('v.bomId');
        // console.log('theBomId--',theBomId);
        component.set('v.isCancelModalOpen', false);
        if(theBomId == null || theBomId == undefined)
        {
            var redirectUrl = '/one/one.app?#/sObject/' + component.get('v.recordId') + '/view';
            $A.get("e.force:navigateToURL").setParams({
                "url": redirectUrl,
                "isredirect": true
            }).fire();
            $A.get('e.force:refreshView').fire();
        }
        else if(theBomId != null && theBomId != undefined && theBomId != '')
        {
            component.find("goToPrevious").navigate({
                type: "standard__component",
                attributes: {
                    componentName: "buildertek__DuplicateSSTLFromProducts",
                    attributes: {
                        "recordId": theBomId
                    } 
                },
                // state: { 
                //     "c__recordId": component.get("v.recordId")
                // }
            });
        }
        
    },

    closeCancelModal: function (component, event, helper) {
        component.set('v.isCancelModalOpen', false);
    },

    onMassUpdate: function (component, event, helper) {
        component.set('v.isLoading', true);
        var SearchProductType = component.find("SearchProductType").get("v.value");
        var searchLocation = component.find("searchLocation").get("v.value");
        var searchCategory = component.find("searchCategory").get("v.value");
        var searchTradeType = component.find("searchTradeType").get("v.value");
        helper.updateMassRecords(component, event, helper, SearchProductType, searchLocation, searchCategory, searchTradeType);
    },

    onMassUpdateCancel: function (component, event, helper) {
        if (component.get('v.massUpdateEnable')) {
            component.set('v.isCancelModalOpen', true);
        }
    },

    deleteRecord: function (component, event, helper) {
        var target = event.target;
        var index = target.getAttribute("data-index");
        var records = component.get('v.listOfRecords');
      //  alert(records);
        if (records[index].Id != undefined) {
            component.set('v.selectedRecordIndex', index);
            component.set('v.quoteLineName', records[index].Name);
            component.set('v.isModalOpen', true);
        } else if (records[index].Id == undefined) {
            records.splice(index, 1);
            component.set('v.listOfRecords', records);
        }
    },

    handleCancel: function (component, event, helper) {
        component.set('v.isModalOpen', false);
    },

    deleteSingleRecord: function (component, event, helper) {
        component.set('v.isLoading', true);
        var recordId = event.currentTarget.dataset.id;
        var index = event.currentTarget.dataset.index;
        var buildPhaseId = event.currentTarget.dataset.groupid;
        var records = component.get('v.listOfRecords');

        if (recordId) {
            var action = component.get("c.deleteTakeOffLineRecord");
            action.setParams({
                "takeoffLineId": recordId
            });
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var result = response.getReturnValue(); 
                    if (result === 'Success') {
                        
                        $A.get("e.force:showToast").setParams({
                            "title": "Success",
                            "message": "Record deleted successfully.",
                            "type": "success"
                        }).fire();
                        var pageNumber = component.get("v.PageNumber");
                        var pageSize = component.get("v.pageSize");
                        var SearchProductType = component.find("SearchProductType").get("v.value");
                        var searchLocation = component.find("searchLocation").get("v.value");
                        var searchCategory = component.find("searchCategory").get("v.value");
                        var searchTradeType = component.find("searchTradeType").get("v.value");
                        var searchCostCode = component.find("searchCostCode").get("v.value");
                        var searchVendor = component.find("searchVendor").get("v.value");
                        var searchPhase = component.find("searchPhase").get("v.value");
                        helper.getTableRows(component, event, helper, pageNumber, pageSize, SearchProductType, searchLocation, searchCategory, searchTradeType, searchCostCode, searchVendor, searchPhase);
                    } else {
                        console.log('Error: ', result);
                        $A.get("e.force:showToast").setParams({
                            "title": "Error",
                            "message": "An error occurred while deleting the record.",
                            "type": "error"
                        }).fire();
                    }
                } else {
                    console.log('Error deleting record:', response.getError());
                    $A.get("e.force:showToast").setParams({
                        "title": "Error",
                        "message": "An error occurred while deleting the record.",
                        "type": "error"
                    }).fire();
                }
                component.set('v.isLoading', false);
            });
            $A.enqueueAction(action);
        } else {
            // If the recordId is not present, just remove it from the local group
            var currentGroup = records.find(group => group.buildPhaseId === buildPhaseId);
            if (currentGroup) {
                currentGroup.takeoffLines.splice(index, 1);
                if (currentGroup.takeoffLines.length === 0) {
                    var groupIndex = records.findIndex(group => group.buildPhaseId === buildPhaseId);
                    if (groupIndex !== -1) {
                        records.splice(groupIndex, 1);
                    }
                }
            }
            component.set('v.listOfRecords', records);
            component.set('v.isLoading', false);
        }
    },

    handleDelete: function (component, event, helper) {
        var records = component.get('v.listOfRecords');
      //  alert(records)
        var index = component.get('v.selectedRecordIndex');
        var SearchProductType = component.find("SearchProductType").get("v.value");
        var searchLocation = component.find("searchLocation").get("v.value");
        var searchCategory = component.find("searchCategory").get("v.value");
        var searchTradeType = component.find("searchTradeType").get("v.value");
        var searchCostCode = component.find("searchCostCode").get("v.value");
        var searchVendor = component.find("searchVendor").get("v.value");
        var searchPhase = component.find("searchPhase").get("v.value");
        if (records[index].Id != undefined) {
            component.set('v.listOfRecords', records);
            component.set('v.isModalOpen', false);
            helper.deleteRecord(component, event, helper, records[index].Id, SearchProductType, searchLocation, searchCategory, searchTradeType, searchVendor, searchCostCode, searchPhase);
        }
    },

    handleNext: function (component, event, helper) {
        var SearchProductType = component.find("SearchProductType").get("v.value");
        var searchLocation = component.find("searchLocation").get("v.value");
        var searchCategory = component.find("searchCategory").get("v.value");
        var searchTradeType = component.find("searchTradeType").get("v.value");
        var searchCostCode = component.find("searchCostCode").get("v.value");
        var searchVendor = component.find("searchVendor").get("v.value");
        var searchPhase = component.find("searchPhase").get("v.value");
        component.set('v.isLoading', true);
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");
        pageNumber++;
        helper.getTableRows(component, event, helper, pageNumber, pageSize, SearchProductType, searchLocation, searchCategory, searchTradeType, searchCostCode, searchVendor, searchPhase);
    },

    handlePrev: function (component, event, helper) {
        var SearchProductType = component.find("SearchProductType").get("v.value");
        var searchLocation = component.find("searchLocation").get("v.value");
        var searchCategory = component.find("searchCategory").get("v.value");
        var searchTradeType = component.find("searchTradeType").get("v.value");
        var searchVendor = component.find("searchVendor").get("v.value");
        var searchCostCode = component.find("searchCostCode").get("v.value");
        var searchPhase = component.find("searchPhase").get("v.value");

        component.set('v.isLoading', true);
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");
        pageNumber--;
        helper.getTableRows(component, event, helper, pageNumber, pageSize, SearchProductType, searchLocation, searchCategory, searchTradeType, searchCostCode, searchVendor, searchPhase);
    },

    searchKeyChange: function (component, event, helper) {
        component.set('v.isLoading', true);
        var SearchProductType = component.find("SearchProductType").get("v.value");
        var searchLocation = component.find("searchLocation").get("v.value");
        var searchCategory = component.find("searchCategory").get("v.value");
        var searchTradeType = component.find("searchTradeType").get("v.value");
        var searchCostCode = component.find("searchCostCode").get("v.value");
        var searchVendor = component.find("searchVendor").get("v.value");
        var searchPhase = component.find("searchPhase").get("v.value");
        var pageNumber = 1;
        var pageSize = component.get("v.pageSize");
        helper.getTableRows(component, event, helper, pageNumber, pageSize, SearchProductType, searchLocation, searchCategory, searchTradeType, searchCostCode, searchVendor, searchPhase);
    },

    redirectTakeOff: function (component, event, helper) {
        // debugger;
        var projectRecId = component.get("v.parentId");
        if(projectRecId){
            var evt = $A.get("e.force:navigateToRelatedList");
            evt.setParams({
                "relatedListId": "buildertek__Project_Takeoffs__r",
                "parentRecordId": component.get('v.parentId')
            });
            evt.fire(); 
        }
        else{
            var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error!",
                        "message": 'This TakeOff doesn\'t have Project',
                        "type": 'Error'
                    });
                    toastEvent.fire(); 
        }
        
        
    },

    gotoURL: function (component, event, helper) {
        var recordId = component.get("v.recordId");
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": '/one/one.app?#/sObject/' + recordId + '/view'
        });
        urlEvent.fire();
    },
    
    selectAllRfq : function (component, event, helper) {
        // debugger;
        var checkStatus = event.getSource().get("v.checked");
        var rfqRecordList = JSON.parse(JSON.stringify(component.get("v.listOfRecords")));
        var getAllId = component.find("checkRFQ");
        var recordIds = [];
        if(checkStatus){
            if(rfqRecordList.length){
                if (!Array.isArray(getAllId)) {
                    component.find("checkRFQ").set("v.checked", true);
                    var Id = component.find("checkRFQ").get("v.name");
                    if(recordIds.indexOf(Id) == -1){
                        recordIds.push(Id)
                    }
                }else{
                    for (var i = 0; i < getAllId.length; i++) {
                        component.find("checkRFQ")[i].set("v.checked", true);
                        var Id = component.find("checkRFQ")[i].get("v.name");
                        if(recordIds.indexOf(Id) == -1){
                            recordIds.push(Id)
                        }
                    }
                }
                component.set("v.listOfSelectedTakeOffIds",recordIds);
            }
        }else{
            if(rfqRecordList.length){
                if (!Array.isArray(getAllId)) {
                    component.find("checkRFQ").set("v.checked", false);
                    var Id = component.find("checkRFQ").get("v.name");
                    if(recordIds.indexOf(Id) > -1){
                        var index = recordIds.indexOf(Id);
                        recordIds.splice(index,1);
                    }
                }else{
                    for (var i = 0; i < getAllId.length; i++) {
                        component.find("checkRFQ")[i].set("v.checked", false);
                        var Id = component.find("checkRFQ")[i].get("v.name");
                        if(recordIds.indexOf(Id) > -1){
                            var index = recordIds.indexOf(Id);
                            recordIds.splice(index,1);
                        }
                    }
                }
                component.set("v.listOfSelectedTakeOffIds",recordIds);
            }
        }
        // console.log(recordIds);
           
    },
    
    selectRfq: function (component, event, helper) {
        var checkbox = event.getSource();
        var selectedTakeoffIds = component.get("v.listOfSelectedTakeOffIds") || [];
        var getAllId = component.find("checkRFQ");
        var isChecked = checkbox.get("v.checked");
        var takeoffName = checkbox.get("v.name");
        
        var checkboxes = Array.isArray(getAllId) ? getAllId : [getAllId];
        
        if (isChecked) {
            if (!selectedTakeoffIds.includes(takeoffName)) {
                selectedTakeoffIds.push(takeoffName);
            }
            if (checkboxes.length === selectedTakeoffIds.length) {
                var headCheckbox = component.find("headCheckRFQ");
                if (headCheckbox && !headCheckbox.get("v.checked")) {
                    headCheckbox.set("v.checked", true);
                }
            }
        } else {
            var headCheckbox = component.find("headCheckRFQ");
            if (headCheckbox && headCheckbox.get("v.checked")) {
                headCheckbox.set("v.checked", false);
            }
            var index = selectedTakeoffIds.indexOf(takeoffName);
            if (index > -1) {
                selectedTakeoffIds.splice(index, 1);
            }
        }
        component.set("v.listOfSelectedTakeOffIds", selectedTakeoffIds);
    },
    
    onClickDelete : function(component, event, helper){
        // debugger;

        
        var selectedSOVLines = component.get("v.listOfSelectedTakeOffIds");
        console.log(`selectedSOVLines : ${selectedSOVLines}`);
        if(selectedSOVLines.length > 0){
            
            component.set("v.isMassDeleteClick", true);
        }else{
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title : "Error!",
                message : 'Please Select atleast One TakeOff Line.',
                type: 'error',
                duration: '1000',
                key: 'info_alt',
                mode: 'pester'
            });
            toastEvent.fire(); 
        }
        
        
    },
    
    confirmDelete: function (component, event, helper) {
        //var selectedSovLineIds = component.get("v.listOfSelectedSOVIds");
        var action = component.get("c.DeleteMassTakeOffLines");
        action.setParams({
            "sovLineIds": component.get("v.listOfSelectedTakeOffIds")         
        });
        action.setCallback(this, function (response) {
            if (response.getState() == 'SUCCESS') {
                 component.set('v.isMassDeleteClick', false);
                
              var  result = response.getReturnValue();
                
                if(result == 'success'){
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        mode: 'sticky',
                        message: 'TakeOff Lines are Deleted Successfully.',
                        type: 'success',
                        duration: '5000',
                        mode: 'dismissible'
                    });
                    toastEvent.fire();
                }
                
                // $A.get('e.force:refreshView').fire();
                helper.refreshDataWithPhase(component, event, helper, component.get("v.selectedTakeOffPhaseId"));
            } 
            else {
                console.log('Error');
            }
        });
        $A.enqueueAction(action);
        
    },

    cancelDelete: function (component, event, helper) {
        component.set('v.isMassDeleteClick', false);
    },

    handleLookUpEvent: function(component, event, helper){
        try {
            
            var selectedRecordId = event.getParam("selectedRecordId");
            var index = event.getParam('index');
            var groupIndex = event.getParam('phaseIndex');
            
            if(event.getParam("fieldName") == 'buildertek__Price_Book__c'){
            //   component.set("v.isLoading", true);
              var listOfRecords = component.get("v.listOfRecords");
              listOfRecords[index].buildertek__Price_Book__c = selectedRecordId[0];
              component.set("v.rerender", !component.get("v.rerender"));
              component.set("v.listOfRecords", listOfRecords);

            //   var setProduct = false;   // Clear product...
            //   helper.setProduct(component, event, helper, setProduct, index, groupIndex);
            }
        } catch (error) {
            console.log(' error in handleLookUpEvent: ', error.stack);
        }
    },

    clearSelectedHandler :  function(component, event, helper){
        var phaseIndex = event.getParam("phaseIndex");
        var index = event.getParam("index");
        console.log(`clearSelectedHandler field: ${event.getParam("fieldName")} Phase: ${phaseIndex} Index: ${index}`);
        // var groupIndex = event.getParam("phaseIndex");
        // console.log('field : ', event.getParam("fieldName"));
        if(event.getParam("fieldName") == 'product'){ 
            // undefiend when function call from "BT_LightningLookup" component...
            // component.set("v.isLoading", true);

            var setPriceBook = false;   // Clear product...
            helper.setPriceBook(component, event, helper, index, phaseIndex, setPriceBook, event.getParam("fieldName"));
        }
    },

    ProductSelectHandler: function(component, event, helper){
        component.set("v.isLoading", true);
        var index = event.getParam("index");
        var setProduct = true;
        var setPriceBook = true;
        var phaseIndex = event.getParam("phaseIndex");
        var fieldName = event.getParam("fieldName");
        console.log(`Takeoff ${fieldName} selected...`);
        // to avoid lag after set product...
        window.setTimeout(
            $A.getCallback(function () {
                helper.setPriceBook(component, event, helper, index, phaseIndex, setPriceBook, fieldName);
              }),
          100
        );

    },

    closeModal: function (component, event, helper) {
        component.set("v.showPhaseModal", false);
    },
    
    handlePhaseChange: function(component, event, helper) {
        var selectedPhaseId = event.getSource().get("v.value");
        component.set("v.selectedPhaseId", selectedPhaseId);
    },
    
    saveSelectedPhase: function(component, event, helper) {
        component.set("v.showPhaseModal", false);
        var selectedPhaseId = component.get("v.selectedPhaseId");
        var selectPhaseName = component.get("v.phases").find(phase => phase.Id === selectedPhaseId).Name;
        
        var fields = component.get('v.fieldSetValues');
        var list = component.get('v.listOfRecords');
        
        // Create a new takeoff line
        var newTakeoffLine = {};
        fields.forEach((field) => {
            newTakeoffLine[field.name] = field.type === 'BOOLEAN' ? false : '';
        });
        newTakeoffLine.buildertek__Build_Phase__c = selectedPhaseId;
        newTakeoffLine.buildertek__Project_Takeoff__c = component.get("v.recordId");
    
        // Find and remove the current group if it exists
        var groupIndex = list.findIndex(group => group.buildPhaseId === selectedPhaseId);
        var currentGroup;
    
        if (groupIndex > -1) {
            currentGroup = list.splice(groupIndex, 1)[0];
        } else {
            // If the group does not exist, create a new one
            currentGroup = {
                buildPhaseId: selectedPhaseId,
                buildPhaseName: selectPhaseName,
                takeoffLines: []
            };
        }
    
        currentGroup.takeoffLines.unshift(newTakeoffLine);
    
        list.unshift(currentGroup);
    
        component.set('v.listOfRecords', list);
    },

    handleArrowClick: function(component, event, helper) {
        let clickedHeaderField = event.currentTarget.dataset.header;
        let headers = component.get("v.headers");
		let sortDirection = 'asc';

        headers.forEach(header => {
            if (header.fieldName === clickedHeaderField) {
                header.sortDirection = (header.sortDirection === 'down') ? 'up' : 'down';
                header.iconName = (header.sortDirection === 'down') ? 'utility:arrowdown' : 'utility:arrowup';
				sortDirection = (header.sortDirection === 'down') ? 'asc' : 'desc';
            } else {
                header.sortDirection = 'down';
                header.iconName = 'utility:arrowdown';
            }
        });

		component.set("v.headers", headers);
		component.set("v.clickedHeaderField", clickedHeaderField);
		component.set("v.sortDirection", sortDirection);

        // Call the helper method
        helper.sortData(component, event, helper, clickedHeaderField, sortDirection);
    },

})