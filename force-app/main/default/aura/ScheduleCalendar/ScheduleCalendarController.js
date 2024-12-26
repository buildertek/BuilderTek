({
    afterScriptsLoaded: function (component, event, helper) {
        helper.getAllActiveProjects(component, event, helper);
        var eventArr = [];
        var defaultDate = new Date()
        $('#calendar').fullCalendar('addEventSource', eventArr, true);
        helper.loadCalendar(component, event, helper, eventArr, defaultDate);
    },

    handleSelectionProject: function (component, event, helper) {
        try {
            var selectedRecords = event;
            var tpRecords = selectedRecords.Tp || {};
            let projectIds = [];
            if (Object.keys(tpRecords).length == 0) {
                component.set("v.ProjectRecordList", []);
            } else {
                for (let key in tpRecords) {
                    if (tpRecords.hasOwnProperty(key) && tpRecords[key].id) {
                        projectIds.push(tpRecords[key].id);
                    }
                }
            }
            if (component.get("v.TasksRecordList").length > 0) {
                component.set("v.showTaskLookup", false);
                component.set("v.TasksRecordList", []);

                component.set("v.ProjectRecordList", projectIds);
                setTimeout(function () {
                    component.set("v.showTaskLookup", true);
                }, 100);
            } else {
                component.set("v.ProjectRecordList", projectIds);
            }
            document.getElementById('noProjectSelected').style.display = projectIds.length > 0 ? 'none' : 'block';
        } catch (error) {
            console.log('error in handleSelectionProject :: ', error);
        }
    },

    handleSelectionProjectTasks: function (component, event, helper) {
        try {
            var selectedRecords = event;
            var tpRecords = selectedRecords.Tp || {};
            let projectTaskIds = [];
            if (Object.keys(tpRecords).length == 0) {
                component.set("v.TasksRecordList", []);
            } else {
                for (let key in tpRecords) {
                    if (tpRecords.hasOwnProperty(key) && tpRecords[key].id) {
                        projectTaskIds.push(tpRecords[key].id);
                    }
                }
            }
            component.set("v.TasksRecordList", projectTaskIds);
        } catch (error) {
            console.log('error in handleSelectionProjectTasks :: ', error);
        }
    },

    handleSelectionTradeType: function (component, event, helper) {
        try {
            var selectedRecords = event;
            var tpRecords = selectedRecords.Tp || {};
            if (Object.keys(tpRecords).length == 0) {
                component.set("v.selectedTradeTypeId", "");
            } else {
                component.set("v.selectedTradeTypeId", tpRecords[0].id);
            }
        } catch (error) {
            console.log('error in handleSelectionTradeType :: ', error);
        }
    },

    handleSelectionVendor: function (component, event, helper) {
        try {
            var selectedRecords = event;
            var tpRecords = selectedRecords.Tp || {};
            if (Object.keys(tpRecords).length == 0) {
                component.set("v.selectedVendorId", "");
            } else {
                component.set("v.selectedVendorId", tpRecords[0].id);
            }
            console.log(component.get("v.selectedVendorId"));
        } catch (error) {
            console.log('error in handleSelectionVendor :: ', error);
        }
    },


    startDateChange: function (component, event, helper) {
        component.set("v.Spinner", true);
        var recordId = component.get("v.recordId");
        var eventDate = component.get("v.finishDate");
        var action = component.get("c.updateDate");
        action.setParams({
            'recordId': recordId,
            'endDate': eventDate
        });
        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS") {
                component.set("v.defaultDate", response.getReturnValue());
                $('#calendar').fullCalendar('removeEvents', function () { return true; });
                helper.getActiveProjects(component, event, helper);
            } else {
                component.set("v.Spinner", false);
            }
        });
        $A.enqueueAction(action);
    },

    endDateChange: function (component, event, helper) {
        component.set("v.Spinner", true);
        var recordId = component.get("v.recordId");
        var eventDate = component.get("v.endDate");
        var action = component.get("c.updateEndDate");
        action.setParams({
            'recordId': recordId,
            'endDate': eventDate
        });
        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS") {
                component.set("v.defaultDate", response.getReturnValue());
                $('#calendar').fullCalendar('removeEvents', function () { return true; });
                helper.getActiveProjects(component, event, helper);
            } else {
                component.set("v.Spinner", false);
            }
        });
        $A.enqueueAction(action);
    },

    handleRecordListEvent: function (component, event, helper) {
        var recordListByEvent = event.getParam("recordListByEvent");
        component.set("v.ProjectRecordList", recordListByEvent);
    },

    handleSearch: function (component, event, helper) {
        if (component.get("v.searchTimeout")) {
            clearTimeout(component.get("v.searchTimeout"));
        }

        var timeout = setTimeout($A.getCallback(function () {
            var searchType = event.getSource().get("v.name");
            var searchValue = event.getParam("value")
            var searchList = searchValue.split(',')
                .map(item => `%${item.trim()}%`)
                .filter(item => item !== '%%');

            if (searchType == 'taskNameInput') {
                component.set("v.searchTaskName", searchValue);
                component.set("v.searchTaskList", searchList);
            } else if (searchType == 'tradeTypeInput') {
                component.set("v.searchTradeTypeName", searchValue);
                component.set("v.searchTradeTypeList", searchList);
            } else if (searchType == 'vendorInput') {
                component.set("v.searchVendorName", searchValue);
                component.set("v.searchVendorList", searchList);
            } else if (searchType == 'projectInput') {
                component.set("v.searchProjectName", searchValue);
                component.set("v.searchProjectList", searchList);
            }
            $('#calendar').fullCalendar('removeEvents', function () { return true; });
            if (searchValue !== '' || component.get("v.searchTaskList").length > 0 || component.get("v.searchTradeTypeList").length > 0 || component.get("v.searchVendorList").length > 0 || component.get("v.searchProjectList").length > 0) {
                helper.getActiveProjects(component, event, helper);
            }
        }), 500);

        component.set("v.searchTimeout", timeout);
    }
})