({
    getQuoteItemData: function (component, event, helper) {
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();

        var action = component.get("c.fetchDataAndFieldSetValues");
        action.setParams({
            "RecordId": component.get("v.quoteId"),
            "sObjectName": "buildertek__Quote_Item__c",
            "fieldSetName": "buildertek__BT_Mass_Update_Quote_Item"
        });

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                if (result) {
                    component.set("v.quoteItems", result.quoteItemList);
                    component.set("v.quoteName", result.quoteItemList[0].buildertek__Quote__r.Name);
                    component.set("v.fieldSetValues", result.FieldSetValues);

                    let groupingOption = [];
                    for (let i = 0; i < result.QuoteItemGroupList.length; i++) {
                        groupingOption.push({ label: result.QuoteItemGroupList[i].Name, value: result.QuoteItemGroupList[i].Id });
                    }
                    component.set("v.availableGroupingOption", groupingOption);
                    // component.set("v.categoryOptions", result.categoryList);
                    helper.groupQuoteItems(component, event, helper);
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
    },

    groupQuoteItems: function (component, event, helper) {
        var quoteItem = component.get("v.quoteItems");
        var groupedData = {};
        var counter = 1;
        var groupNames = [];

        quoteItem.forEach(item => {
            var groupName = item.buildertek__Grouping__r ? item.buildertek__Grouping__r.Name : 'No Grouping';
            var groupId = item.buildertek__Grouping__r ? item.buildertek__Grouping__r.Id : 'no-group';
            item.Number = counter++;

            if (!groupedData[groupId]) {
                groupedData[groupId] = {
                    groupName: groupName,
                    groupId: groupId,
                    items: []
                };
            }

            if (!groupNames.includes(groupName)) {
                groupNames.push(groupName);
            }

            if (!groupNames.includes('--All--')) {
                groupNames.unshift('--All--');
            }
            

            groupedData[groupId].items.push(item);
        });

        component.set("v.groupNames", groupNames );
        component.set("v.data", JSON.parse(JSON.stringify(Object.values(groupedData))));
        component.set("v.allData", JSON.parse(JSON.stringify(Object.values(groupedData))));
        // let quoteItemData = Object.values(groupedData);
        // var fieldSetValues = component.get("v.fieldSetValues");

        // quoteItemData.forEach(group => {
        //     group.items.forEach(item => {
        //         fieldSetValues.forEach(field => {
        //             item[field.name] = item[field.name] || '';
        //         });
        //     });
        // });

        // component.set("v.preprocessedData", quoteItemData);
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

    updateQuoteItem: function (component, event, helper) {
        var quoteItems = component.get("v.quoteItems");

        var data = component.get("v.data");
        console.log('data:', data);

        //iterate through data to get all items and add them to a new array
        var quoteallItems = [];
        data.forEach(function (group) {
            group.items.forEach(function (item) {
                quoteallItems.push(item);
            }
            );
        });
        console.log('quoteallItems:', quoteallItems);
        quoteItems = quoteallItems;

        var action = component.get("c.updateQuoteItemsList");
        action.setParams({
            "updateQuoteItems": quoteItems
        });

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                if (result === "Success") {
                    helper.showToast("Success", "Quote Items updated successfully.", "success");

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