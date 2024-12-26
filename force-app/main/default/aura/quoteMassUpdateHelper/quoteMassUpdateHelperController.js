({
    doInit: function (component, event, helper) {
        var myPageRef = component.get("v.pageReference");
        var quoteId = myPageRef.state.c__quoteId;
        component.set("v.quoteId", quoteId);

        var workspaceAPI = component.find("workspace");
        workspaceAPI.getEnclosingTabId().then((response) => {
            let opendTab = response.tabId;
            workspaceAPI.setTabLabel({
                tabId: opendTab,
                label: 'Mass Update Quote Lines'
            });
            workspaceAPI.setTabIcon({
                tabId: opendTab,
                icon: 'custom:custom5',
                iconAlt: 'Mass Update Quote Lines'
            });
        });
        helper.getQuoteItemData(component, event, helper);
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
            // filter by category
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
        console.log("filteredData==>", filteredData);

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

        var quoteItems = component.get("v.quoteItems");
        console.log('quoteItems:', quoteItems);
        var data = component.get("v.data");
        console.log('data:', data);
        debugger;
        var isValid = true;

        for (var i = 0; i < quoteItems.length; i++) {
            if (!quoteItems[i].hasOwnProperty('Name') || quoteItems[i].Name === '') {
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
                isValid = false;
                helper.showToast("Error", "The Quote Item Name must be populated.", "error");
                break;
            }
        }

        if (isValid) {
            helper.updateQuoteItem(component, event, helper);
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
        var quoteItems = component.get("v.quoteItems");
        var data = component.get("v.data");
        // console.log("Data:", data);
        //iterate through the data and find the groupName and add the item
        for (var i = 0; i < data.length; i++) {
            console.log("Group Name:", data[i].groupName);
            if (data[i].groupName === groupName) {
                // console.log("Group Name:", data[i].groupName);
                // console.log("Group Items:", data[i].items);
                var groupItems = data[i].items;
                var groupingId = groupItems[groupItems.length - 1].buildertek__Grouping__c ;
                var newItem = {
                    "buildertek__Grouping__c": groupingId,
                    "buildertek__Quantity__c": 1,
                    "buildertek__Quote__c": component.get("v.quoteId"),
                }; 
                groupItems.unshift(newItem);
                // Find the index where the group starts in quoteItems
                var insertIndex = quoteItems.length;
                for (var j = 0; j < quoteItems.length; j++) {
                    if (quoteItems[j].buildertek__Grouping__c === groupingId) {
                        insertIndex = j;
                        break;
                    }
                }
                quoteItems.splice(insertIndex, 0, newItem);
                data[i].items = groupItems;
                component.set("v.data", data);
                break;
            }
        }
        var data = component.get("v.data");
        // console.log("Data:", data);handleAddItem
        
        var quoteItems = component.get("v.quoteItems");
        // console.log("Quote Items:", quoteItems);
        

    },

    removeItem : function(component, event, helper) {
        var quoteItems = component.get("v.quoteItems");
        var data = component.get("v.data");
        var index = event.getSource().get("v.name");
        var grouping = event.getSource().get("v.value");
        // console.log('quoteItems:', quoteItems);
        // console.log('data:', data);
        // console.log('index:', index);
        // console.log('grouping:', grouping);

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

        //iterate over the quoteItems and from where the buildertek__Grouping__c === grouping, consider it as the starting index and remove the index from quoteItems
        var start = -1;
        for (var i = 0; i < quoteItems.length; i++) {
            if (quoteItems[i].buildertek__Grouping__c === grouping) {
                start = i;
                break;
            }
        }
        quoteItems.splice(start + parseInt(index), 1);
        component.set("v.quoteItems", quoteItems);
        // console.log('quoteItems:', quoteItems);
        // console.log('data:', data);
    },
})