({
    doInit: function (component, event, helper) {
        var pageRef = component.get("v.pageReference");
        if (pageRef != undefined) {
            var state = pageRef.state; // state holds any query params	        
            if (state != undefined && state.c__Id != undefined) {
                component.set("v.recordId", state.c__Id);
            }
            if (state != undefined && state.buildertek__Id != undefined) {
                component.set("v.recordId", state.buildertek__Id);
            }
        }

        component.set('v.isLoading', true);
        helper.bomRelatedInfo(component, event, helper);
        helper.helpergetProductPhase_BuildPhase(component, event, helper);
        var pageNumber = component.get("v.PageNumber");
            var pageSize = component.get("v.pageSize");
            var SearchProductType = component.find("SearchProductType").get("v.value");
            var searchLocation = component.find("searchLocation").get("v.value");
            var searchCategory = component.find("searchCategory").get("v.value");
            var searchTradeType = component.find("searchTradeType").get("v.value");
        helper.getTableRows(component, event, helper, pageNumber, pageSize, SearchProductType, searchLocation, searchCategory, searchTradeType);
        helper.getPhasesList(component, event, helper);
        helper.getTableFieldSet(component, event, helper);
        
        window.setTimeout(
            $A.getCallback(function () {
            }), 2000
        );
    },

    refreshPage: function (component, event, helper) {
        var focusedTabId = event.getParam('currentTabId');
        var workspaceAPI = component.find("workspace");

        workspaceAPI.getEnclosingTabId().then(function (tabId) {
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

        // Create a new empty bomline object
        var newbomLines = {};
        fields.forEach((field) => {
            newbomLines[field.name] = field.type === 'BOOLEAN' ? false : '';
        });

        if (groupId != 'NoGrouping') {
            newbomLines.buildertek__Build_Phase__c = groupId;
        }

        newbomLines.buildertek__Selection_Sheet_Takeoff__c = component.get("v.recordId");

        var currentGroup = list.find(group => group.buildPhaseId === groupId);
        currentGroup.BOMLines.unshift(newbomLines);

        component.set('v.listOfRecords', list);
    },

    deleteSingleRecord: function (component, event, helper) {
        component.set('v.isLoading', true);
        var recordId = event.currentTarget.dataset.id;
        var index = event.currentTarget.dataset.index;
        var buildPhaseId = event.currentTarget.dataset.groupid;
        var records = component.get('v.listOfRecords');

        if (recordId) {
            var action = component.get("c.deleteBOMLineRecord");
            action.setParams({
                "bomLineID": recordId
            });
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var result = response.getReturnValue();
                    console.log('result:', result);
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

                        helper.getTableRows(component, event, helper, pageNumber, pageSize, SearchProductType, searchLocation, searchCategory, searchTradeType);
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
                currentGroup.BOMLines.splice(index, 1);
                if (currentGroup.BOMLines.length === 0) {
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

    closeScreen: function (component, event, helper) {
        component.set('v.isCancelModalOpen', false);
        var redirectUrl = '/one/one.app?#/sObject/' + component.get('v.recordId') + '/view';
        $A.get("e.force:navigateToURL").setParams({
            "url": redirectUrl,
            "isredirect": true
        }).fire();
        $A.get('e.force:refreshView').fire();
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
        if (!component.get('v.massUpdateEnable')) {
            component.set('v.massUpdateEnable', true);
            component.set('v.isLoading', false);
        } else if (component.get('v.massUpdateEnable')) {
            component.set('v.isLoading', true);
            component.set('v.massUpdateEnable', false);
            helper.updateMassRecords(component, event, helper, SearchProductType, searchLocation, searchCategory, searchTradeType);
        }
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
        if (records[index].Id != undefined) {
            component.set('v.selectedRecordIndex', index);
            component.set('v.bomLineName', records[index].Name);
            component.set('v.isModalOpen', true);
        } else if (records[index].Id == undefined) {
            records.splice(index, 1);
            component.set('v.listOfRecords', records);
        }
    },

    handleCancel: function (component, event, helper) {
        component.set('v.isModalOpen', false);
    },

    handleDelete: function (component, event, helper) {
        var records = component.get('v.listOfRecords');
        var index = component.get('v.selectedRecordIndex');
        var SearchProductType = component.find("SearchProductType").get("v.value");
        var searchLocation = component.find("searchLocation").get("v.value");
        var searchCategory = component.find("searchCategory").get("v.value");
        var searchTradeType = component.find("searchTradeType").get("v.value");
        if (records[index].Id != undefined) {
            component.set('v.listOfRecords', records);
            component.set('v.isModalOpen', false);
            helper.deleteRecord(component, event, helper, records[index].Id, SearchProductType, searchLocation, searchCategory, searchTradeType);
        }
    },

    handleNext: function (component, event, helper) {
        var SearchProductType = component.find("SearchProductType").get("v.value");
        var searchLocation = component.find("searchLocation").get("v.value");
        var searchCategory = component.find("searchCategory").get("v.value");
        var searchTradeType = component.find("searchTradeType").get("v.value");
        component.set('v.isLoading', true);
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");
        pageNumber++;
        helper.getTableRows(component, event, helper, pageNumber, pageSize, SearchProductType, searchLocation, searchCategory, searchTradeType);
    },

    handlePrev: function (component, event, helper) {
        var SearchProductType = component.find("SearchProductType").get("v.value");
        var searchLocation = component.find("searchLocation").get("v.value");
        var searchCategory = component.find("searchCategory").get("v.value");
        var searchTradeType = component.find("searchTradeType").get("v.value");
        component.set('v.isLoading', true);
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");
        pageNumber--;
        helper.getTableRows(component, event, helper, pageNumber, pageSize, SearchProductType, searchLocation, searchCategory, searchTradeType);
    },

    searchKeyChange: function (component, event, helper) {
        component.set('v.isLoading', true);
        var SearchProductType = component.find("SearchProductType").get("v.value");
        var searchLocation = component.find("searchLocation").get("v.value");
        var searchCategory = component.find("searchCategory").get("v.value");
        var searchTradeType = component.find("searchTradeType").get("v.value");
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");
        helper.getTableRows(component, event, helper, pageNumber, pageSize, SearchProductType, searchLocation, searchCategory, searchTradeType);
        component.set('v.isLoading', false);
    },

    redirectBOM: function (component, event, helper) {
        var projectRecId = component.get("v.parentId");
        if(projectRecId){
            var evt = $A.get("e.force:navigateToRelatedList");
            evt.setParams({
                "relatedListId": "buildertek__Project_Selection_Sheet_Takeoff__r",
                "parentRecordId": component.get('v.parentId')
            });
            evt.fire(); 
        }
        else{
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "message": 'This BOM doesn\'t have Project',
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
    
    selectAllBomLines : function (component, event, helper) {
        var checkStatus = event.getSource().get("v.checked");
        var rfqRecordList = JSON.parse(JSON.stringify(component.get("v.listOfRecords")));
        var getAllId = component.find("checkBOM");
        var recordIds = [];
        if(checkStatus){
            if(rfqRecordList.length){
                if (!Array.isArray(getAllId)) {
                    component.find("checkBOM").set("v.checked", true);
                    var Id = component.find("checkBOM").get("v.name");
                    if(recordIds.indexOf(Id) == -1){
                        recordIds.push(Id)
                    }
                }else{
                    for (var i = 0; i < getAllId.length; i++) {
                        component.find("checkBOM")[i].set("v.checked", true);
                        var Id = component.find("checkBOM")[i].get("v.name");
                        if(recordIds.indexOf(Id) == -1){
                            recordIds.push(Id)
                        }
                    }
                }
                component.set("v.listOfSelectedBomIds",recordIds);
            }
        }else{
            if(rfqRecordList.length){
                if (!Array.isArray(getAllId)) {
                    component.find("checkBOM").set("v.checked", false);
                    var Id = component.find("checkBOM").get("v.name");
                    if(recordIds.indexOf(Id) > -1){
                        var index = recordIds.indexOf(Id);
                        recordIds.splice(index,1);
                    }
                }else{
                    for (var i = 0; i < getAllId.length; i++) {
                        component.find("checkBOM")[i].set("v.checked", false);
                        var Id = component.find("checkBOM")[i].get("v.name");
                        if(recordIds.indexOf(Id) > -1){
                            var index = recordIds.indexOf(Id);
                            recordIds.splice(index,1);
                        }
                    }
                }
                component.set("v.listOfSelectedBomIds",recordIds);
            }
        }
    },
    
    selectBom: function (component, event, helper) {
        var checkbox = event.getSource();
        var selectedBomIds = component.get("v.listOfSelectedBomIds") || [];
        var getAllId = component.find("checkBOM");
        var isChecked = checkbox.get("v.checked");
        var bomName = checkbox.get("v.name");
    
        var checkboxes = Array.isArray(getAllId) ? getAllId : [getAllId];
    
        if (isChecked) {
            if (!selectedBomIds.includes(bomName)) {
                selectedBomIds.push(bomName);
            }
            if (checkboxes.length === selectedBomIds.length) {
                var headCheckbox = component.find("headCheckBOM");
                if (headCheckbox && !headCheckbox.get("v.checked")) {
                    headCheckbox.set("v.checked", true);
                }
            }
        } else {
            var headCheckbox = component.find("headCheckBOM");
            if (headCheckbox && headCheckbox.get("v.checked")) {
                headCheckbox.set("v.checked", false);
            }
            var index = selectedBomIds.indexOf(bomName);
            if (index > -1) {
                selectedBomIds.splice(index, 1);
            }
        }
        component.set("v.listOfSelectedBomIds", selectedBomIds);
    },    
    
    onClickDelete : function(component, event, helper){ 
        var selectedSOVLines = component.get("v.listOfSelectedBomIds");
       
        if(selectedSOVLines.length > 0){
            component.set("v.isMassDeleteClick", true);
        }else{
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title : "Error!",
                message : 'Please Select atleast One BOM Line.',
                type: 'error',
                duration: '1000',
                key: 'info_alt',
                mode: 'pester'
            });
            toastEvent.fire(); 
        }   
    },
    
    confirmDelete: function (component, event, helper) {
        var action = component.get("c.DeleteMassBOMLines");
        let selectedBOMLines = component.get("v.listOfSelectedBomIds");
        selectedBOMLines = selectedBOMLines.filter(function (el) {
            return el != null;
        });
        component.set("v.listOfSelectedBomIds", selectedBOMLines);
        action.setParams({
            "bomLineIds": component.get("v.listOfSelectedBomIds")         
        });
        action.setCallback(this, function (response) {
            if (response.getState() == 'SUCCESS') {
                component.set('v.isMassDeleteClick', false);
                
                var  result = response.getReturnValue();
                
                if(result == 'success'){
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        mode: 'sticky',
                        message: 'BOM Lines are Deleted Successfully.',
                        type: 'success',
                        duration: '5000',
                        mode: 'dismissible'
                    });
                    toastEvent.fire();
                }
                else{
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error!",
                        "message": 'Something went wrong!',
                        "type": 'error'
                    });
                    toastEvent.fire();
                    console.log('Error', JSON.stringify(response.getError()));        
                }
                $A.get('e.force:refreshView').fire();
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
            var groupIndex = event.getParam("phaseIndex");
            if(event.getParam("fieldName") == 'buildertek__BT_Price_Book__c'){
              var listOfRecords = component.get("v.listOfRecords");
              listOfRecords[groupIndex].BOMLines[index].buildertek__BT_Price_Book__c = selectedRecordId[0];
              component.set("v.rerender", !component.get("v.rerender"));
              component.set("v.listOfRecords", listOfRecords);

              var setProduct = false;   // Clear product...
              helper.setProduct(component, event, helper, setProduct, index, groupIndex);
            }
        } catch (error) {
            console.log(' error in handleLookUpEvent: ', error.stack);
        }
    },

    clearSelectedHandler :  function(component, event, helper){
        var index = event.getParam("index");
        var groupIndex = event.getParam("phaseIndex");
        console.log('field : ', event.getParam("fieldName"));
        if(event.getParam("fieldName") == 'buildertek__BT_Price_Book__c' || event.getParam("fieldName") == undefined){ 
            var setProduct = false;   // Clear product...
            helper.setProduct(component, event, helper, setProduct, index, groupIndex);
        }
    },

    ProductSelectHandler: function(component, event, helper){
        component.set("v.isLoading", true);
        var index = event.getParam("index");
        var groupIndex = event.getParam("phaseIndex");
        var setProduct = true;    
        window.setTimeout(
            $A.getCallback(function () {
              helper.setProduct(component, event, helper, setProduct, index, groupIndex);
          }),
          100
        );
    },
    
    onAddWithPhaseClick: function (component, event, helper) {
        component.set("v.selectedPhaseId", null);
        component.set("v.showPhaseModal", true);
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

        // Create a new BOM line
        var newBOMLine = {};
        fields.forEach((field) => {
            newBOMLine[field.name] = field.type === 'BOOLEAN' ? false : '';
        });
        newBOMLine.buildertek__Build_Phase__c = selectedPhaseId;
        newBOMLine.buildertek__Selection_Sheet_Takeoff__c = component.get("v.recordId");
    
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
                BOMLines: []
            };
        }
    
        currentGroup.BOMLines.unshift(newBOMLine);    
        list.unshift(currentGroup);
        component.set('v.listOfRecords', list);
    }
    
})