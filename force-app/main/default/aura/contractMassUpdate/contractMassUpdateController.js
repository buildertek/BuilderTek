({
    doInit : function(component, event, helper) {
        var myPageRef = component.get("v.pageReference");
        var contractId = myPageRef.state.c__contractId;
        component.set("v.contractId", contractId);

        var workspaceAPI = component.find("workspace");
        workspaceAPI.getEnclosingTabId().then((response) => {
            let opendTab = response.tabId;
            workspaceAPI.setTabLabel({
                tabId: opendTab,
                label: 'Mass Update Contract Lines'
            });
            workspaceAPI.setTabIcon({
                tabId: opendTab,
                icon: 'custom:custom16',
                iconAlt: 'Mass Update Contract Lines'
            });
        });
        helper.getContractItemData(component, event, helper);
    },

    handleCancel: function (component, event, helper) {
        component.set("v.isCancelModalOpen", true);
    },

    closeScreen: function (component, event, helper) {
        var workspaceAPI = component.find("workspace");
        workspaceAPI.getEnclosingTabId().then(function (tabId) {
            workspaceAPI.closeTab({ tabId: tabId });
        });
    },

    closeCancelModal: function (component, event, helper) {
        component.set("v.isCancelModalOpen", false);
    },

    onMassUpdate: function (component, event, helper) {
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();

        var contractItems = component.get("v.contractItems");
        var isValid = true;

        for (var i = 0; i < contractItems.length; i++) {
            if (!contractItems[i].hasOwnProperty('Name') || contractItems[i].Name === '') {
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
                isValid = false;
                helper.showToast("Error", "The Contract Item Name must be populated.", "error");
                break;
            }
            if (!contractItems[i].hasOwnProperty('buildertek__Quantity__c') || contractItems[i].buildertek__Quantity__c < 0) {
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
                isValid = false;
                helper.showToast("Error", "The Quantity must be a positive number greater or equals to 0.", "error");
                break;
            }
            if (!contractItems[i].hasOwnProperty('buildertek__Unit_Cost__c') || contractItems[i].buildertek__Unit_Cost__c < 0) {
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
                isValid = false;
                helper.showToast("Error", "The Unit Cost must be a positive number greater or equals to 0.", "error");
                break;
            }
            if (!contractItems[i].hasOwnProperty('buildertek__Unit_Price__c') || contractItems[i].buildertek__Unit_Price__c < 0) {
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
                isValid = false;
                helper.showToast("Error", "The Unit Price must be a positive number greater or equals to 0.", "error");
                break;
            }
            if (!contractItems[i].hasOwnProperty('buildertek__Tax__c') || contractItems[i].buildertek__Tax__c < 0) {
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
                isValid = false;
                helper.showToast("Error", "The Tax must be a positive number greater or equals to 0.", "error");
                break;
            }
        }

        if (isValid) {
            helper.updateContractItem(component, event, helper);
        }
    },

    handleLookUpEvent: function (component, event, helper) {
        console.log('SelectedHandler');
    },

    clearSelectedHandler: function (component, event, helper) {
        console.log('clearSelectedHandler');
    }
})