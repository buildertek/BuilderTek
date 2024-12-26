({
    doInit: function (component, event, helper) {
        var myPageRef = component.get("v.pageReference");
        var budgetId = myPageRef.state.c__budgetId;
        component.set("v.budgetId", budgetId);

        var workspaceAPI = component.find("workspace");
        workspaceAPI.getEnclosingTabId().then((response) => {
            let opendTab = response.tabId;
            workspaceAPI.setTabLabel({
                tabId: opendTab,
                label: 'Mass Update Budget Lines'
            });
            workspaceAPI.setTabIcon({
                tabId: opendTab,
                icon: 'custom:custom5',
                iconAlt: 'Mass Update Budget Lines'
            });
        });
        helper.getBudgetItemData(component, event, helper);
    },

    handleChange: function (component, event, helper) {
        var selectedValue = event.getSource().get("v.value");
        
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();
        
        let data = component.get("v.allData");
        let filteredData;

        if (selectedValue == 'All') {
            filteredData = data;
        } else {
            // Filter by category
            // filteredData = data.map(function(group) {
            //     let filteredItems = group.items.filter(item => item.buildertek__Category__c == selectedValue);
            //     if (filteredItems.length > 0) {
            //         return {
            //             groupName: group.groupName,
            //             groupId: group.groupId,
            //             items: filteredItems
            //         };
            //     }
            // }).filter(function(group) {
            //     return group !== undefined;
            // });

            // Filter by group
            filteredData = data.filter(function(group) {
                return group.groupId == selectedValue;
            });

            filteredData = JSON.parse(JSON.stringify(filteredData));
            filteredData.forEach(function(group) {
                group.items.forEach(function(item, index) {
                    item.Number = index + 1;
                });
            });
        }
        component.set("v.data", JSON.parse(JSON.stringify(filteredData)));

        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "HIDE"
        }).fire();
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

        var budgetItems = component.get("v.budgetItems");
        var isValid = true;

        for (var i = 0; i < budgetItems.length; i++) {
            if (!budgetItems[i].hasOwnProperty('Name') || budgetItems[i].Name === '') {
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
                isValid = false;
                helper.showToast("Error", "The Budget Item Name must be populated.", "error");
                break;
            }
        }

        console.log('budgetItems:', budgetItems);
        debugger;

        if (isValid) {
            helper.updateBudgetItem(component, event, helper);
        }
    },

    handleLookUpEvent: function (component, event, helper) {
        console.log('SelectedHandler');
    },

    clearSelectedHandler: function (component, event, helper) {
        console.log('clearSelectedHandler');
    },

    handleAddItem : function(component, event, helper) {
        console.log('handleAddItem');
        var groupName = event.currentTarget.dataset.id;
        console.log('Group ID:', groupName);
        // var groupid = event.getSource().get("v.name");
        // console.log("Group Name:", groupid);
        var budgetItems = component.get("v.budgetItems");
        var data = component.get("v.data");
        // console.log("Data:", data);
        //iterate through the data and find the groupName and add the item
        for (var i = 0; i < data.length; i++) {
            console.log("Group Name:", data[i].groupName);
            if (data[i].groupName === groupName) {
                // console.log("Group Name:", data[i].groupName);
                // console.log("Group Items:", data[i].items);
                var groupItems = data[i].items;
                var groupingId = groupItems[groupItems.length - 1].buildertek__Group__c ;
                var newItem = {
                    "buildertek__Group__c": groupingId,
                    "buildertek__Quantity__c": 1,
                    "buildertek__Budget__c": component.get("v.budgetId"),
                }; 
                groupItems.unshift(newItem);
                // Find the index where the group starts in budgetItems
                var insertIndex = budgetItems.length;
                for (var j = 0; j < budgetItems.length; j++) {
                    if (budgetItems[j].buildertek__Grouping__c === groupingId) {
                        insertIndex = j;
                        break;
                    }
                }
                budgetItems.splice(insertIndex, 0, newItem);
                data[i].items = groupItems;
                component.set("v.data", data);
                break;
            }
        }
        var data = component.get("v.data");
        // console.log("Data:", data);handleAddItem
        
        var budgetItems = component.get("v.budgetItems");
        // console.log("Quote Items:", budgetItems);
        

    },

    removeItem : function(component, event, helper) {
        var budgetItems = component.get("v.budgetItems");
        var data = component.get("v.data");
        var index = event.getSource().get("v.name");
        var grouping = event.getSource().get("v.value");
        // console.log('budgetItems:', budgetItems);
        // console.log('data:', data);
        // console.log('index:', index);
        console.log('grouping:', grouping);

        //iterate over the data and if data[i].groupId === grouping then remove the index from data[i].items
        for (var i = 0; i < data.length; i++) {
            if (data[i].groupId === grouping) {
                var groupItems = data[i].items;
                groupItems.splice(index, 1);
                data[i].items = groupItems;
                component.set("v.data", data);
                break;
            }
        }

        //iterate over the budgetItems and from where the buildertek__Grouping__c === grouping, consider it as the starting index and remove the index from budgetItems
        var start = -1;
        for (var i = 0; i < budgetItems.length; i++) {
            if (budgetItems[i].buildertek__Group__c === grouping) {
                start = i;
                break;
            }
        }
        budgetItems.splice(start + parseInt(index), 1);
        component.set("v.budgetItems", budgetItems);
        // console.log('budgetItems:', budgetItems);
        // console.log('data:', data);
    },
})