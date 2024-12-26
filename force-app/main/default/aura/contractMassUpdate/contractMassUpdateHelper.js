({
    getContractItemData: function (component, event, helper) {
        try {
            
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "SHOW"
            }).fire();
            
            var action = component.get("c.fetchDataAndFieldSetValues");
            action.setParams({
                "RecordId": component.get("v.contractId"),
                "sObjectName": "buildertek__Contract_Item__c",
                "fieldSetName": "buildertek__Contract_Line_Field_Set"
            });
            
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var result = response.getReturnValue();
                    console.log('fetchDataAndFieldSetValues :: ' , result);
                    if (result) {
                        console.log('in if');
                        component.set("v.contractItems", result.contractItemList);
                        component.set("v.contractName", result.contractItemList[0].buildertek__Contract__r.Name);
                        component.set("v.fieldSetValues", result.FieldSetValues);

                        var actionGroup = component.get("c.getNoGroupingData");
                        actionGroup.setCallback(this, function(responsegroup){
                            var groupData = responsegroup.getReturnValue();
                            console.log('groupData :: ',groupData.Id);

                            component.set("v.noGroupingId", groupData.Id);
                            component.set("v.noGroupingName", groupData.Name);
                            helper.groupContractItems(component, event, helper);
                        })
                        $A.enqueueAction(actionGroup);
                    }
                } else {
                    var errors = response.getError();
                    var message = 'Unknown error';
                    if (errors && Array.isArray(errors) && errors.length > 0) {
                        message = errors[0].message;
                    }
                    helper.showToast("Error", message, "error");
                }
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
            });
                
            $A.enqueueAction(action);
        } catch (error) {
            console.log(error);
        }
    },

    groupContractItems: function (component, event, helper) {
        var contractItem = component.get("v.contractItems");
        console.log(contractItem);
        var groupedData = {};
        // var counter = 1;

        contractItem.forEach(item => {
            var groupName = item.buildertek__Contract_Item_Group__r ? item.buildertek__Contract_Item_Group__r.Name : component.get("v.noGroupingName");
            var groupId = item.buildertek__Contract_Item_Group__c ? item.buildertek__Contract_Item_Group__c : component.get("v.noGroupingId");
            // item.Number = counter++;

            if (!groupedData[groupId]) {
                groupedData[groupId] = {
                    groupName: groupName,
                    groupId: groupId,
                    items: []
                };
            }

            groupedData[groupId].items.push(item);
        });

        var counter = 1;
        Object.keys(groupedData).forEach(groupId => {
            groupedData[groupId].items.forEach(item => {
                item.Number = counter++;
            });
        });
        
        console.log(JSON.stringify(groupedData));
        component.set("v.data", Object.values(groupedData));
        let contractItemData = Object.values(groupedData);
        var fieldSetValues = component.get("v.fieldSetValues");

        contractItemData.forEach(group => {
            group.items.forEach(item => {
                fieldSetValues.forEach(field => {
                    item[field.name] = item[field.name] || '';
                });
            });
        });

        component.set("v.preprocessedData", contractItemData);
    },

    showToast: function (title, message, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type
        });
        toastEvent.fire();
    },

    updateContractItem: function (component, event, helper) {
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();
        var contractItems = component.get("v.contractItems");

        var action = component.get("c.updateContractItemsList");
        action.setParams({
            "updateContractItems": contractItems
        });

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                if (result === "Success") {
                    helper.showToast("Success", "Contract Items updated successfully.", "success");

                    var workspaceAPI = component.find("workspace");
                    workspaceAPI.getEnclosingTabId().then(function (tabId) {
                        window.postMessage({ action: 'closeSubtab' }, window.location.origin);
                        workspaceAPI.closeTab({ tabId: tabId });
                    });

                } else {
                    helper.showToast("Error", result, "error");
                }
            } else if (state === "ERROR") {
                var errors = response.getError();
                var message = 'Unknown error';
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    message = errors[0].message;
                }
                helper.showToast("Error", message, "error");
            }

            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();
        });

        $A.enqueueAction(action);
    }
})