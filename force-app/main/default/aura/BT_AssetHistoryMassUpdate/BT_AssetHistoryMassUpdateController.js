({
    doInit: function (component, event, helper) {
        component.set('v.isLoading', true);
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");
        var pageRef = component.get("v.pageReference");
        if (pageRef != undefined) {
            var state = pageRef.state;
            if (state != undefined && state.c__Id != undefined) {
                component.set("v.recordId", state.c__Id);
            }
            if (state != undefined && state.buildertek__Id != undefined) {
                component.set("v.recordId", state.buildertek__Id);
            }
        }
        helper.getTableFieldSet(component, event, helper);

        window.setTimeout(
            $A.getCallback(function () {
                helper.getTotalRecord(component, event, helper);
                //window.setTimeout(
                    //$A.getCallback(function () {
                        helper.getTableRows(component, event, helper, pageNumber, pageSize);
                   // }), 100
               // );
                component.set('v.isLoading', false);
            }), 1500
        );
    },

    onAddClick: function (component, event, helper) {
        var fields = component.get('v.fieldSetValues');
        var list = component.get('v.listOfRecords');
        var obj = {};
        for (var i in fields) {
            obj[fields[i].name] = '';
            if (fields[i].type == 'BOOLEAN') {
                obj[fields[i].name] = false;
            } 
            
            if (fields[i].name == 'buildertek__Asset_Manager__c') {
                obj[fields[i].name] = component.get('v.recordId');
            }
        }
        list.unshift(obj);
        component.set('v.listOfRecords', list);
    },

    onMassUpdate: function (component, event, helper) {
        component.set('v.isLoading', true);
        helper.updateMassRecords(component, event, helper);
    },

    onMassUpdateCancel: function (component, event, helper) {
        component.set('v.isCancelModalOpen', false);
        var redirectUrl = '/one/one.app?#/sObject/' + component.get('v.recordId') + '/view';
        $A.get("e.force:navigateToURL").setParams({
            "url": redirectUrl,
            "isredirect": true
        }).fire();
        $A.get('e.force:refreshView').fire();
    },

    deleteRecord: function (component, event, helper) {
        var target = event.target;
        var index = target.getAttribute("data-index");
        var records = component.get('v.listOfRecords');
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

    handleDelete: function (component, event, helper) {
        var records = component.get('v.listOfRecords');
        var index = component.get('v.selectedRecordIndex');
         if (records[index].Id != undefined) {
            component.set('v.listOfRecords', records);
            component.set('v.isModalOpen', false);
            helper.deleteRecord(component, event, helper, records[index].Id);
        }
    },

    handleNext: function (component, event, helper) {
        component.set('v.isLoading', true);
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");
        pageNumber++;
        helper.getTableRows(component, event, helper, pageNumber, pageSize);
    },

    handlePrev: function (component, event, helper) {
        component.set('v.isLoading', true);
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");
        pageNumber--;
        helper.getTableRows(component, event, helper, pageNumber, pageSize);
    },

    searchKeyChange: function (component, event, helper) {
        component.set('v.isLoading', true);
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");
        helper.getTableRows(component, event, helper, pageNumber, pageSize);
        component.set('v.isLoading', false);
    },
})