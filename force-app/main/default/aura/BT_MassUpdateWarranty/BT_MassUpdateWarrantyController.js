({
    doInit: function (component, event, helper) {
        var pageNumber = component.get("v.pageNumber");
        var pageSize = component.get("v.pageSize");
        helper.getTableRows(component, event, helper, pageNumber, pageSize);
    },
    refreshPage: function (component, event, helper) {
        var focusedTabId = event.getParam('currentTabId');
        var workspaceAPI = component.find("workspace");

        workspaceAPI.getEnclosingTabId().then(function (tabId) {
            if (tabId == focusedTabId) {
                setTimeout(function () {
                    //location.reload()
                }, 1000);
            }
        }).catch(function (error) {
            console.log(error);
        });
    },
    onAddClick: function (component, event, helper) {
        var fields = component.get('v.fieldSetValues');
        var list = component.get('v.listOfRecords');
        var obj = {};
        for (var i in fields) {
            obj[fields[i].name] = null;
            if (fields[i].type == 'BOOLEAN') {
                obj[fields[i].name] = false;
            }
        }
        list.unshift(obj);
        component.set('v.listOfRecords', list);
    },
    closeScreen: function (component, event, helper) {
        component.set('v.isCancelModalOpen', false);
        var workspaceAPI = component.find("workspace");
        workspaceAPI.getFocusedTabInfo().then(function (response) {
            var focusedTabId = response.tabId;
            workspaceAPI.closeTab({ tabId: focusedTabId }).then(function (response) {
                workspaceAPI.openTab({
                    recordId: component.get('v.recordId'),
                    focus: true
                });
            })
                .catch(function (error) {
                    console.log(error);
                });
        })
            .catch(function (error) {
                console.log(error);
            });
    },
    closeCancelModal: function (component, event, helper) {
        component.set('v.isCancelModalOpen', false);
    },
    onMassUpdate: function (component, event, helper) {
        component.set('v.isLoading', true);
        if (!component.get('v.massUpdateEnable')) {
            component.set('v.massUpdateEnable', true);
            component.set('v.isLoading', false);
        } else if (component.get('v.massUpdateEnable')) {
            helper.updateMassRecords(component, event, helper);
        }
    },

    onMassUpdateCancel: function (component, event, helper) {
        component.get('v.massUpdateEnable') ? component.set('v.isCancelModalOpen', true) : '';
    },

    deleteRecord: function (component, event, helper) {
        var target = event.target;
        var index = target.getAttribute("data-index");
        var records = component.get('v.listOfRecords');
        if (records[index].Id != undefined) {
            component.set('v.selectedRecordIndex', index);
            component.set('v.warrantyItemName', records[index].Name);
            component.set('v.isModalOpen', true);
        } else if (records[index].Id == undefined) {
            records.splice(index, 1);
            component.set('v.isModalOpen', false);
            component.set('v.listOfRecords', records);
        }
    },

    handleCancel: function (component, event, helper) {
        component.set('v.isModalOpen', false);
    },

    handleDelete: function (component, event, helper) {
        var records = component.get('v.listOfRecords');
        var index = component.get('v.selectedRecordIndex');
        if (records[index].Id != undefined) {
            helper.deleteRecord(component, event, helper, records[index].Id);
        }
    },

    handleNext: function (component, event, helper) {
        var pageNumber = component.get("v.pageNumber");
        var pageSize = component.get("v.pageSize");
        pageNumber++;
        helper.getTableRows(component, event, helper, pageNumber, pageSize);
    },

    handlePrev: function (component, event, helper) {
        var pageNumber = component.get("v.pageNumber");
        var pageSize = component.get("v.pageSize");
        pageNumber--;
        helper.getTableRows(component, event, helper, pageNumber, pageSize);
    },

    redirectWarranty: function (component, event, helper) {
        var evt = $A.get("e.force:navigateToRelatedList");
        evt.setParams({
            "relatedListId": "buildertek__Warranty_s__r",
            "parentRecordId": component.get('v.parentId')
        });
        evt.fire();
    },

    gotoURL: function (component, event, helper) {
        var recordId = component.get("v.recordId");
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": '/one/one.app?#/sObject/' + recordId + '/view'
        });
        urlEvent.fire();
    },

    selectAllWarrantyItem: function (component, event, helper) {
        var checkStatus = event.getSource().get("v.checked");
        var warrantyRecordsList = component.get("v.listOfRecords");
        var getAllId = component.find("checkWarrantyItem");
        var recordIds = [];

        if (checkStatus) {
            // Select all records
            warrantyRecordsList.forEach(function(record) {
                if (record.Id) {
                    recordIds.push(record.Id);
                }
            });
        }

        // Update checkbox states
        if (Array.isArray(getAllId)) {
            getAllId.forEach(function(checkbox) {
                checkbox.set("v.checked", checkStatus);
            });
        } else if (getAllId) {
            getAllId.set("v.checked", checkStatus);
        }

        // Update the list of selected IDs
        component.set("v.listOfSelectedWarrantyItemIDs", recordIds);
    },

    selectWarrantyItem: function (component, event, helper) {
        var checkbox = event.getSource();
        var listSelectedRecords = component.get("v.listOfSelectedWarrantyItemIDs");
        var getAllId = component.find("checkWarrantyItem");

        if (checkbox.get("v.checked")) {
            if (listSelectedRecords.indexOf(checkbox.get("v.name")) == -1) {
                listSelectedRecords.push(checkbox.get("v.name"));
            }
            if (!Array.isArray(getAllId)) {
                if (!component.find("selectAllWarrantyItem").get("v.checked")) {
                    component.find("selectAllWarrantyItem").set("v.checked", true);
                }
            } else {
                if (listSelectedRecords.length == getAllId.length) {
                    if (!component.find("selectAllWarrantyItem").get("v.checked")) {
                        component.find("selectAllWarrantyItem").set("v.checked", true);
                    }
                }
            }
        } else {
            if (component.find("selectAllWarrantyItem").get("v.checked")) {
                component.find("selectAllWarrantyItem").set("v.checked", false);
            }
            if (listSelectedRecords.indexOf(checkbox.get("v.name")) > -1) {
                var index = listSelectedRecords.indexOf(checkbox.get("v.name"));
                listSelectedRecords.splice(index, 1);
            }
        }
        component.set("v.listOfSelectedWarrantyItemIDs", listSelectedRecords);
    },

    onClickDelete: function (component, event, helper) {
        var listOfSelectedWarrantyItemIDs = component.get("v.listOfSelectedWarrantyItemIDs");
        console.log('listOfSelectedWarrantyItemIDs', listOfSelectedWarrantyItemIDs);
        if (listOfSelectedWarrantyItemIDs.length) {
            component.set("v.isMassDeleteClick", true);
        } else {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title: "Error!",
                message: 'Please Select atleast One Warranty Item.',
                type: 'error',
                duration: '1000',
                key: 'info_alt',
                mode: 'pester'
            });
        }
    },

    cancelDelete: function (component, event, helper) {
        component.set("v.isMassDeleteClick", false);
        component.set("v.listOfSelectedWarrantyItemIDs", []);
    },

    confirmDelete: function (component, event, helper) {
        try {
            var action = component.get("c.DeleteMassWarrantyItems");
            action.setParams({
                "warrantyItemIds": component.get("v.listOfSelectedWarrantyItemIDs")
            });
            action.setCallback(this, function (response) {
                if (response.getState() == 'SUCCESS') {
                    component.set('v.isMassDeleteClick', false);
                    var result = response.getReturnValue();
                    if (result == 'success') {
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            mode: 'sticky',
                            message: 'Warranty Items are Deleted Successfully.',
                            type: 'success',
                            duration: '5000',
                            mode: 'dismissible'
                        });
                        toastEvent.fire();
                    }

                    $A.get('e.force:refreshView').fire();
                } else {
                    throw new Error(response.getError());
                }
            });
            $A.enqueueAction(action);
        } catch (error) {
            console.error('Error in confirmDelete:', error);
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                mode: 'sticky',
                message: 'Error: ' + error.message,
                type: 'error',
                duration: '5000',
                mode: 'dismissible'
            });
            toastEvent.fire();
        }
    },
})