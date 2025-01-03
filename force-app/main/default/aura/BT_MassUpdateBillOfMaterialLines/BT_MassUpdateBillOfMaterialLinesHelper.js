({

    bomRelatedInfo: function (component, event, helper) {
        if(component.get('v.recordId') != undefined){
            var action = component.get("c.getBOMInfo");
            action.setParams({
                recordId: component.get('v.recordId'),
            });
            action.setCallback(this, function (response) {
                var result = response.getReturnValue();
                if (result.status == 'SUCCESS') {
                    component.set("v.TotalRecords", result.count);
                    component.set('v.parentId', result.parentId);
                    component.set('v.bom', result.name);
                    component.set('v.bomName', result.BOMName);
                }
            })
            $A.enqueueAction(action);
        }
    },

    helpergetProductPhase_BuildPhase: function(component, event, helper){
        var action = component.get("c.get_ProductPhase_BuildPhase");
        action.setCallback(this, function (response) {
            var result = response.getReturnValue();
            console.log('helpergetProductPhase_BuildPhase : ', result);
            if(result !=  null){
                component.set("v.ProductPhase_Vs_BuildPhase", result);
            }
        })
        $A.enqueueAction(action);
    },

    getTableFieldSet: function (component, event, helper) {
        var action = component.get("c.getFieldSet");
        action.setCallback(this, function (response) {
            var fieldSetObj = JSON.parse(response.getReturnValue());
            component.set("v.fieldSetValues", fieldSetObj);
            console.log('@@fieldSetValues-- ', JSON.parse(JSON.stringify(fieldSetValues)));
        })
        $A.enqueueAction(action);
    },

    getTableRows: function (component, event, helper, pageNumber, pageSize, productType, searchLocation, searchCategory, searchTradeType) {
        component.set('v.isLoading', true);
        var action = component.get("c.getRecords");
        var fieldSetValues = component.get("v.fieldSetValues");
        var arrfieldNames = [];
        action.setParams({
            recordId: component.get('v.recordId'),
            fieldNameJson: JSON.stringify(arrfieldNames),
            pageNumber: pageNumber,
            pageSize: pageSize,
            productType: productType,
            searchLocation: searchLocation,
            searchCategory: searchCategory,
            searchTradeType: searchTradeType
        });
        action.setCallback(this, function (response) {
            if (response.getState() == 'SUCCESS' && response.getReturnValue()) {
                var list = JSON.parse(response.getReturnValue());
                if (list.length > 0) {
                    console.log('@@list-- ', list);
                    var groupedData = helper.groupByBuildPhase(list);
                    component.set("v.listOfRecords", groupedData);
                    component.set("v.cloneListOfRecords", list);
                    component.set('v.numberOfItems', list.length);
                    component.set("v.PageNumber", pageNumber);
                    component.set("v.RecordStart", (pageNumber - 1) * pageSize + 1);
                    component.set("v.RecordEnd", (list.length + 3) * pageNumber);
                    component.set("v.TotalPages", Math.ceil(list.length / component.get('v.TotalRecords')));
                  
                    if (component.get('v.TotalRecords') < pageNumber * pageSize) {
                        component.set("v.isNextDisabled", true);
                    } else {
                        component.set("v.isNextDisabled", false);
                    }
                } else {
                    component.set("v.listOfRecords", []);
                    component.set("v.cloneListOfRecords", []);
                    component.set('v.numberOfItems', 0);
                    component.set("v.PageNumber", 1);
                    component.set("v.RecordStart", 0);
                    component.set("v.RecordEnd", 0);
                    component.set("v.TotalPages", 0);
                    component.set("v.isNextVisible", true);

                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error!",
                        "message": 'This BOM doesn\'t have any BOM line!',
                        "type": 'Error',
                        "duration" : 5000
                    });
                    toastEvent.fire();
                }
                window.setTimeout(
                    $A.getCallback(function () {
                      component.set('v.isLoading', false);
                    }),
                    3000
                );
            } else {
                component.set("v.listOfRecords", []);
                component.set("v.cloneListOfRecords", []);
            }
        })
        $A.enqueueAction(action);
    },

    groupByBuildPhase: function(records) {
        var grouped = {};
        var noGroupingKey = 'NoGrouping';
    
        records.forEach(function(record) {
            var buildPhaseId = record.buildertek__Build_Phase__c || noGroupingKey;
            var buildPhaseName = record.buildertek__Build_Phase__r ? record.buildertek__Build_Phase__r.Name : 'No Grouping';
    
            if (!grouped[buildPhaseId]) {
                grouped[buildPhaseId] = {
                    buildPhaseId: buildPhaseId,
                    buildPhaseName: buildPhaseName,
                    BOMLines: []
                };
            }
            grouped[buildPhaseId].BOMLines.push(record);
        });

        var sortedGrouped = Object.values(grouped).sort(function(a, b) {
            return a.buildPhaseName.localeCompare(b.buildPhaseName);
        });        
        return sortedGrouped;
    },

    updateMassRecords: function (component, event, helper, productType, searchLocation, searchCategory, searchTradeType) {
        component.set('v.isLoading', true);
        var listOfRecords = component.get('v.listOfRecords');
        var flattenedBOMLines = listOfRecords.flatMap(buildPhase => buildPhase.BOMLines || []);
        flattenedBOMLines.forEach(BOMLines => {
            if (BOMLines.buildertek__Build_Phase__r && !BOMLines.Name) {
                delete BOMLines.buildertek__Build_Phase__r;
            }
        });

        var action = component.get("c.updateRecords");
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");
        component.set('v.listOfRecords', []); 
        action.setParams({
            recordId: component.get('v.recordId'),
            updatedRecords: JSON.stringify(flattenedBOMLines),
            fieldSetName: JSON.stringify(component.get('v.arrfieldNames')),
            pageNumber: pageNumber,
            pageSize: pageSize,
            productType: productType,
            searchLocation: searchLocation,
            searchCategory: searchCategory,
            searchTradeType: searchTradeType
        });

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS" && response.getReturnValue() == 'Success') {
                component.set('v.isCancelModalOpen', false);
                // $A.get("e.force:refreshView").fire();
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success!",
                    "message": 'Record Save Successfully.',
                    "type": 'Success'
                });
                toastEvent.fire(); 
                // var redirectUrl = '/one/one.app?#/sObject/' + component.get('v.recordId') + '/view';
                // $A.get("e.force:navigateToURL").setParams({
                //     "url": redirectUrl,
                //     "isredirect": true
                // }).fire();
                $A.get('e.force:refreshView').fire();
            } else if (state === "ERROR") {
                component.set('v.isLoading', false);
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "message": 'Something went wrong!',
                    "type": 'error'
                });
                toastEvent.fire();
                console.log('A Problem Occurred: ' + JSON.stringify(response.getError()));
            }
        });
        $A.enqueueAction(action);
    },

    deleteRecord: function (component, event, helper, deleteRecordId, productType, searchLocation, searchCategory, searchTradeType) {
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");

        var action = component.get("c.deleteBomLines");
        action.setParams({
            deleteRecordId: deleteRecordId,
            recordId: component.get('v.recordId'),
            fieldSetName: JSON.stringify(component.get('v.arrfieldNames')),
            pageNumber: pageNumber,
            pageSize: pageSize,
            productType: productType,
            searchLocation: searchLocation,
            searchCategory: searchCategory,
            searchTradeType: searchTradeType
        });

        action.setCallback(this, function (response) {
            var state = response.getState();      
            if (state === "SUCCESS") {
                var list = JSON.parse(response.getReturnValue());
                if(list){
                     component.set('v.listOfRecords', list);
                component.set('v.numberOfItems', list.length);
                component.set('v.cloneListOfRecords', list);
                component.set('v.isLoading', false);
                component.set("v.PageNumber", pageNumber);
                component.set("v.RecordStart", (pageNumber - 1) * pageSize + 1);
                component.set("v.RecordEnd", (list.length + 3) * pageNumber);
                component.set("v.TotalPages", Math.ceil(list.length / component.get('v.TotalRecords')));
                }
                $A.get('e.force:refreshView').fire();
               
            } else if (state === "ERROR") {
                component.set('v.isLoading', false);
                console.log('A Problem Occurred: ' + JSON.stringify(response.error));
            }
        });
        $A.enqueueAction(action);
    },

    setProduct: function(component, event, helper, setProduct, index, groupIndex) {
        try {
            var listOfRecords = component.get("v.listOfRecords");
            if(setProduct){
                var product = event.getParam("recordByEvent");
                var pricebookEntry = event.getParam("PricebookEntryrecordByEvent");
                // console.log("Price book Entries :-> " ,JSON.parse(JSON.stringify(pricebookEntry)));
                if(product){
                    var ProductPhase_Vs_BuildPhase = component.get("v.ProductPhase_Vs_BuildPhase");
                    listOfRecords[groupIndex].BOMLines[index].buildertek__Product__r = product;
                    listOfRecords[groupIndex].BOMLines[index].buildertek__Product__c = product.Id;
                    listOfRecords[groupIndex].BOMLines[index].buildertek__Description__c = product.Name;
                    listOfRecords[groupIndex].BOMLines[index].Name = product.Name;
                    listOfRecords[groupIndex].BOMLines[index].buildertek__Vendor__c = product.buildertek__Vendor__c;
                    listOfRecords[groupIndex].BOMLines[index].buildertek__Cost_Code__c = product.buildertek__Cost_Code__c;
                    // listOfRecords[groupIndex].BOMLines[index].buildertek__Build_Phase__c = ProductPhase_Vs_BuildPhase[product.buildertek__Quote_Group__c] ? ProductPhase_Vs_BuildPhase[product.buildertek__Quote_Group__c] : null;
                    listOfRecords[groupIndex].BOMLines[index].buildertek__Quantity__c = 1;
                    listOfRecords[groupIndex].BOMLines[index].buildertek__Category__c = product.buildertek__Category__c;
                    if(pricebookEntry && pricebookEntry.hasOwnProperty('buildertek__Unit_Cost__c')){
                        listOfRecords[groupIndex].BOMLines[index].buildertek__BL_UNIT_COST__c = pricebookEntry.buildertek__Unit_Cost__c;
                    }else{
                        listOfRecords[groupIndex].BOMLines[index].buildertek__BL_UNIT_COST__c = 0;                    
                    }
                }
            }
            else {
                listOfRecords[groupIndex].BOMLines[index].buildertek__Product__r = null;
                listOfRecords[groupIndex].BOMLines[index].buildertek__Product__c = null;
                listOfRecords[groupIndex].BOMLines[index].buildertek__Description__c = null;
                listOfRecords[groupIndex].BOMLines[index].Name = null;
                listOfRecords[groupIndex].BOMLines[index].buildertek__Vendor__c = null;
                listOfRecords[groupIndex].BOMLines[index].buildertek__Cost_Code__c = null;
                // listOfRecords[groupIndex].BOMLines[index].buildertek__Build_Phase__c = null;
                listOfRecords[groupIndex].BOMLines[index].buildertek__Quantity__c = 0;
                listOfRecords[groupIndex].BOMLines[index].buildertek__Category__c = null;
                listOfRecords[groupIndex].BOMLines[index].buildertek__BL_UNIT_COST__c = 0;

            }
            component.set("v.currectModifiedIndex", index);
            component.set("v.rerender", true);
            component.set("v.listOfRecords", listOfRecords);
            component.set("v.rerender", false);
          window.setTimeout(
              $A.getCallback(function () {
                  component.set("v.isLoading", false);
            }),500
        );
        } catch (error) {
            console.log('error in setProduct : ', error.stack);
            component.set("v.isLoading", false);
        }
    },

    getPhasesList: function(component) {
        var action = component.get("c.getPhases");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.phases", response.getReturnValue());
            } else {
                console.error("Failed to fetch phases: " + response.getError());
            }
        });
        $A.enqueueAction(action);
    }
})