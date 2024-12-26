({
    // getTakeOffName: function (component, event, helper) {
    //     var action = component.get("c.getName");
    //     action.setParams({
    //         recordId: component.get('v.recordId')
    //     });
    //     action.setCallback(this, function (response) {
    //         component.set('v.takeoff', response.getReturnValue());
    //         console.log('takeoff Name:::', response.getReturnValue());
    //     })
    //     $A.enqueueAction(action);
    // },

    // getTakeOffParentId: function (component, event, helper) {
    //     var action = component.get("c.getParentId");
    //     action.setParams({
    //         recordId: component.get('v.recordId')
    //     });
    //     action.setCallback(this, function (response) {
    //         component.set('v.parentId', response.getReturnValue());
    //         console.log('parentId Id:::', response.getReturnValue());
    //     })
    //     $A.enqueueAction(action);
    // },

    // getTotalRecord: function (component, event, helper) {
    //     if(component.get('v.recordId') != undefined){
    //         var action = component.get("c.getCount");
    //         action.setParams({
    //             recordId: component.get('v.recordId'),
    //         });
    //         action.setCallback(this, function (response) {
    //             if (response.getState() == 'SUCCESS' && response.getReturnValue()) {
    //                 // debugger;
    //                 component.set("v.TotalRecords", response.getReturnValue());
    //                 console.log('Total record', response.getReturnValue());
    //             }
    //         })
    //         $A.enqueueAction(action);
    //     }
       
    // },

    takeoffRelatedInfo: function (component, event, helper) {
        // console.log('in takeoffRelatedInfo');
        if(component.get('v.recordId') != undefined){
            var action = component.get("c.getTakeoffInfo");
            action.setParams({
                recordId: component.get('v.recordId'),
            });
            action.setCallback(this, function (response) {
                var result = response.getReturnValue();
                if (result.status == 'SUCCESS') {
                    // debugger;
                    component.set("v.TotalRecords", result.count);
                    component.set('v.parentId', result.parentId);
                    component.set('v.takeoff', result.name);
                    component.set('v.takeoffName', result.TakeOffName);
                }
            })
            $A.enqueueAction(action);
        }
    },

    helpergetProductPhase_BuildPhase: function(component, event, helper){
        var action = component.get("c.get_ProductPhase_BuildPhase");
        action.setParams({
            recordId: component.get('v.recordId'),
        });
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

            var dynamicHeaders = fieldSetObj.map((field) => {
                return {
                    'label': field.label,
                    'fieldName': field.name,
                    'type': field.type,
                    'sortable': true,
                    'sortDirection': 'down',
                    'iconName': 'utility:arrowdown'
                };
            });

            component.set("v.headers", dynamicHeaders);
            // var pageNumber = component.get("v.PageNumber");
            // var pageSize = component.get("v.pageSize");
            // var SearchProductType = component.find("SearchProductType").get("v.value");
            // var searchLocation = component.find("searchLocation").get("v.value");
            // var searchCategory = component.find("searchCategory").get("v.value");
            // var searchTradeType = component.find("searchTradeType").get("v.value");
            // helper.getTableRows(component, event, helper, pageNumber, pageSize, SearchProductType, searchLocation, searchCategory, searchTradeType);

        })
        $A.enqueueAction(action);
    },

    getTableRows: function (component, event, helper, pageNumber, pageSize, productType, searchLocation, searchCategory, searchTradeType, searchCostCode, searchVendor, searchPhase) {
        console.log('getTableRows : ', pageNumber, pageSize);
        component.set('v.isLoading', true);
        var action = component.get("c.getRecords");
        var fieldSetValues = component.get("v.fieldSetValues");
        // console.log('@@fieldSetValues-- ', JSON.parse(JSON.stringify(fieldSetValues)));
        // var setfieldNames = new Set();

        // for (var c = 0, clang = fieldSetValues.length; c < clang; c++) {
        //     if (!setfieldNames.has(fieldSetValues[c].name)) {
        //         setfieldNames.add(fieldSetValues[c].name);
        //         if (fieldSetValues[c].type == 'REFERENCE') {
        //             if (fieldSetValues[c].name.indexOf('__c') == -1) {
        //                 setfieldNames.add(fieldSetValues[c].name.substring(0, fieldSetValues[c].name.indexOf('Id')) + '.Name');
        //             } else {
        //                 setfieldNames.add(fieldSetValues[c].name.substring(0, fieldSetValues[c].name.indexOf('__c')) + '__r.Name');
        //             }
        //         }
        //     }
        // }

        var arrfieldNames = [];
        // setfieldNames.forEach(v => arrfieldNames.push(v));
        // console.log('@@arrfieldNames-- ', arrfieldNames);
        // component.set('v.arrfieldNames', arrfieldNames);
        action.setParams({
            recordId: component.get('v.recordId'),
            fieldNameJson: JSON.stringify(arrfieldNames),
            pageNumber: pageNumber,
            pageSize: pageSize,
            productType: productType,
            searchLocation: searchLocation,
            searchCategory: searchCategory,
            searchTradeType: searchTradeType,
            searchCostCode: searchCostCode,
            searchVendor: searchVendor,
            searchPhase: searchPhase
        });
        action.setCallback(this, function (response) {
            if (response.getState() == 'SUCCESS' && response.getReturnValue()) {
                var list = JSON.parse(response.getReturnValue());
                if (list.length > 0) {
                    var groupedData = helper.groupByBuildPhase(list);
                    component.set("v.listOfRecords", groupedData);
                    component.set("v.cloneListOfRecords", list);
                    component.set('v.numberOfItems', list.length);
                    component.set("v.PageNumber", pageNumber);
                    component.set("v.RecordStart", (pageNumber - 1) * pageSize + 1);
                    component.set("v.RecordEnd", (list.length + 3) * pageNumber);
                    component.set("v.TotalPages", Math.ceil(list.length / component.get('v.TotalRecords')));
                    // debugger;
                    if (component.get('v.numberOfItems') < pageSize) {
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
                        "message": 'This TakeOff doesn\'t have any takeoff line!',
                        "type": 'Error',
                        "duration" : 5000
                    });
                    toastEvent.fire();
                }
                window.setTimeout(
                    $A.getCallback(function () {
                      component.set('v.isLoading', false);
                    }),
                    300
                );
            } else {
                component.set("v.listOfRecords", []);
                component.set("v.cloneListOfRecords", []);
            }
        })
        $A.enqueueAction(action);
        helper.sortData(component, event, helper, component.get('v.clickedHeaderField'), component.get('v.sortDirection'));
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
                    takeoffLines: []
                };
            }
            grouped[buildPhaseId].takeoffLines.push(record);
        });

        var sortedGrouped = Object.values(grouped).sort(function(a, b) {
            return a.buildPhaseName.localeCompare(b.buildPhaseName);
        });
        return sortedGrouped;
    },       

    updateMassRecords: function (component, event, helper, productType, searchLocation, searchCategory, searchTradeType, searchVendor, searchPhase, searchCostCode) {
        component.set('v.isLoading', true);
        var searchPhaseID = component.get("v.selectedTakeOffPhaseId"); 
        var listOfRecords = component.get('v.listOfRecords');
        var flattenedTakeoffLines = listOfRecords.flatMap(buildPhase => buildPhase.takeoffLines || []);
        flattenedTakeoffLines.forEach(takeoffLine => {
            if (takeoffLine.buildertek__Build_Phase__r && !takeoffLine.Name) {
                delete takeoffLine.buildertek__Build_Phase__r;
            }
        });
        console.log('flattenedTakeoffLines : 1', JSON.parse(JSON.stringify(flattenedTakeoffLines)));
        var action = component.get("c.updateRecords");
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");
        component.set('v.listOfRecords', []);
        action.setParams({
            recordId: component.get('v.recordId'),
            updatedRecords: JSON.stringify(flattenedTakeoffLines),
            fieldSetName: JSON.stringify(component.get('v.arrfieldNames')),
            pageNumber: pageNumber,
            pageSize: pageSize,
            productType: productType,
            searchLocation: searchLocation,
            searchCategory: searchCategory,
            searchTradeType: searchTradeType,
            searchVendor: searchVendor,
            searchCostCode: searchCostCode,
            searchPhase: searchPhase
        });

        action.setCallback(this, function (response) {
            var state = response.getState();

            if (state === "SUCCESS") {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success!",
                    "message": 'Record Save Successfully.',
                    "type": 'Success'
                });
                toastEvent.fire();
                helper.refreshDataWithPhase(component, event, helper, searchPhaseID);
            } else if (state === "ERROR") {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "message": 'Something went wrong!',
                    "type": 'error'
                });
                toastEvent.fire();
                console.log(`Error: ${JSON.stringify(response.getError())}`);
            } else {
                helper.refreshDataWithPhase(component, event, helper, searchPhaseID);
            }
            component.set('v.isLoading', false);
        });
        $A.enqueueAction(action);
    },    

    deleteRecord: function (component, event, helper, deleteRecordId, productType, searchLocation, searchCategory, searchTradeType, searchVendor, searchCostCode, searchPhase) {
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");

        var action = component.get("c.deleteProject");
        action.setParams({
            deleteRecordId: deleteRecordId,
            recordId: component.get('v.recordId'),
            fieldSetName: JSON.stringify(component.get('v.arrfieldNames')),
            pageNumber: pageNumber,
            pageSize: pageSize,
            productType: productType,
            searchLocation: searchLocation,
            searchCategory: searchCategory,
            searchTradeType: searchTradeType,
            searchVendor: searchVendor,
            searchCostCode: searchCostCode,
            searchPhase: searchPhase
        });

        action.setCallback(this, function (response) {
            var state = response.getState();
          //  alert(JSON.parse(response.getReturnValue()));
      
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
                console.log(`Error: ${JSON.stringify(response.getError())}`);
            }
        });
        $A.enqueueAction(action);
    },

    setProduct: function(component, event, helper, setProduct, index){
        try {
            // var index = event.getParam("index");
            // var listOfRecords = JSON.parse(JSON.stringify(component.get("v.listOfRecords")));
            var listOfRecords = component.get("v.listOfRecords");
            
            if(setProduct){
                // console.log("product : ", JSON.parse(JSON.stringify(event.getParam("recordByEvent"))));
                var product = event.getParam("recordByEvent");
                if(product){
                    var ProductPhase_Vs_BuildPhase = component.get("v.ProductPhase_Vs_BuildPhase");
                    // console.log('selected phase : ', product.buildertek__Quote_Group__c);
                    // console.log('current phase : ', ProductPhase_Vs_BuildPhase[product.buildertek__Quote_Group__c]);
                    listOfRecords[index].buildertek__Price_Book__c = product;
                    listOfRecords[index].buildertek__Price_Book__r = product.Id;
                    listOfRecords[index].buildertek__Description__c = product.Name;
                    listOfRecords[index].buildertek__Vendor__c = product.buildertek__Vendor__c;
                    listOfRecords[index].buildertek__Cost_Code__c = product.buildertek__Cost_Code__c;
                    listOfRecords[index].buildertek__Build_Phase__c = ProductPhase_Vs_BuildPhase[product.buildertek__Quote_Group__c] ? ProductPhase_Vs_BuildPhase[product.buildertek__Quote_Group__c] : null;
                    listOfRecords[index].buildertek__Quantity__c = 1;
                    listOfRecords[index].buildertek__Categories__c = product.buildertek__Category__c;

                }
              }
              else {
                listOfRecords[index].buildertek__Product__r = null;
                listOfRecords[index].buildertek__Product__c = null;
                listOfRecords[index].buildertek__Description__c = null;
                listOfRecords[index].buildertek__Vendor__c = null;
                listOfRecords[index].buildertek__Cost_Code__c = null;
                listOfRecords[index].buildertek__Build_Phase__c = null;
                listOfRecords[index].buildertek__Quantity__c = 0;
                listOfRecords[index].buildertek__Categories__c = null;
                listOfRecords[index].buildertek__Price_Book__c = null;
                listOfRecords[index].buildertek__Price_Book__r = null;
              }

            //   v.currectModifiedIndex & v.rerender used to Rerender FieldSetMass Update child Component (BUIL-3824)... 
            // these attribue used to rerendr only perticualar index's field...
            component.set("v.currectModifiedIndex", index);
            component.set("v.rerender", true);
            component.set("v.listOfRecords", listOfRecords);
            component.set("v.rerender", false);
            // console.log('listOfRecords After Update >> ', JSON.parse(JSON.stringify(listOfRecords)));

            window.setTimeout(
                $A.getCallback(function () {
                    component.set("v.isLoading", false);
                }), 500
            );
        } catch (error) {
            // var toastEvent = $A.get("e.force:showToast");
            // toastEvent.setParams({
            //     "title": "Error!",
            //     "message": 'Error in setPriceBook!',
            //     "type": 'error'
            // });
            // toastEvent.fire();
            // component.set("v.isLoading", false);
            console.log('error in setProduct : ', error.stack);
        }
    },

    setPriceBook: function (component, event, helper, index, phaseIndex, setPriceBook, fieldName) {
        try {
            var listOfRecords = component.get("v.listOfRecords");
            if (setPriceBook) {
                if (fieldName == 'product') {
                    let Product = event.getParam("recordByEvent");
                    listOfRecords[phaseIndex]['takeoffLines'][index].buildertek__Product__c = Product.Id;
                    listOfRecords[phaseIndex]['takeoffLines'][index].buildertek__Product__r = Product;
                    listOfRecords[phaseIndex]['takeoffLines'][index].buildertek__Description__c = Product.Name;
                    listOfRecords[phaseIndex]['takeoffLines'][index].buildertek__Vendor__c = Product.buildertek__Vendor__c;
                } else if (fieldName == 'pricebook') {
                    let Pricebook = event.getParam("recordByEvent");
                    listOfRecords[phaseIndex]['takeoffLines'][index].buildertek__Price_Book__c = Pricebook.Id;
                    listOfRecords[phaseIndex]['takeoffLines'][index].buildertek__Price_Book__r = Pricebook;
                }
            } else {
                listOfRecords[phaseIndex]['takeoffLines'][index].buildertek__Price_Book__c = null;
                listOfRecords[phaseIndex]['takeoffLines'][index].buildertek__Price_Book__r = null;
                listOfRecords[phaseIndex]['takeoffLines'][index].buildertek__Product__c = null;
                listOfRecords[phaseIndex]['takeoffLines'][index].buildertek__Product__r = null;
                listOfRecords[phaseIndex]['takeoffLines'][index].buildertek__Description__c = null;
                listOfRecords[phaseIndex]['takeoffLines'][index].buildertek__Vendor__c = null;
            }
            component.set("v.currectModifiedIndex", index);

            component.set("v.rerender", true);
            component.set("v.listOfRecords", listOfRecords);
            component.set("v.rerender", false);

            window.setTimeout(
                $A.getCallback(function () {
                    component.set("v.isLoading", false);
                }), 500
            );
        } catch (error) {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "message": 'Error in setPriceBook!',
                "type": 'error'
            });
            toastEvent.fire();
            component.set("v.isLoading", false);
            console.log('error in setPriceBook : ', error.stack);
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
    },

    getRelatedPhasesList: function(component, event, helper) {
        var action = component.get("c.getTakeOffPhases");
        action.setParams({
            takeOffId: component.get('v.recordId')
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.phasesList", response.getReturnValue());
                if (!component.get("v.selectedTakeOffPhaseId")) {
                    component.set('v.selectedTakeOffPhaseId', response.getReturnValue()[0].Id);
                }

                var pageNumber = component.get("v.PageNumber");
                var pageSize = component.get("v.pageSize");
                var SearchProductType = component.find("SearchProductType").get("v.value");
                var searchLocation = component.find("searchLocation").get("v.value");
                var searchCategory = component.find("searchCategory").get("v.value");
                var searchTradeType = component.find("searchTradeType").get("v.value");
                var searchCostCode = component.find("searchCostCode").get("v.value");
                var searchVendor = component.find("searchVendor").get("v.value");
                // var searchPhase = component.find("searchPhase").get("v.value");
                
                var searchPhase = component.get('v.selectedTakeOffPhaseId');
                this.getTableRows(component, event, helper, pageNumber, pageSize, SearchProductType, searchLocation, searchCategory, searchTradeType, searchCostCode, searchVendor, searchPhase);
                this.getTableFieldSet(component, event, helper);

            } else {
                console.error("Failed to fetch phases: " + response.getError());
            }
        });
        $A.enqueueAction(action);
    },

    sortData: function (component, event, helper, sortField, sortOrder) {
        let listOfRecords = component.get("v.listOfRecords");
        let fieldSetValues = component.get("v.fieldSetValues");

        if (sortField && sortOrder) {
            // Find the field definition in the fieldset
            let fieldDef = fieldSetValues.find(field => field.name === sortField);

            listOfRecords.forEach(group => {
                group.takeoffLines.sort((a, b) => {
                    let aValue = this.getFieldValue(a, sortField, fieldDef);
                    let bValue = this.getFieldValue(b, sortField, fieldDef);

                    return this.compareValues(aValue, bValue, fieldDef.type, sortOrder);
                });
            });
        }
        component.set("v.listOfRecords", listOfRecords);
    },

    getFieldValue: function (record, fieldName, fieldDef) {
        if (fieldDef.type === 'REFERENCE') {
            let relationshipField = fieldName.replace('__c', '__r');
            return record[relationshipField] ? record[relationshipField].Name : '';
        } else {
            return record[fieldName];
        }
    },

    compareValues: function (aValue, bValue, fieldType, sortOrder) {
        let comparison = 0;

        aValue = aValue == null ? 0 : aValue;
        bValue = bValue == null ? 0 : bValue;

        switch (fieldType) {
            case 'NUMBER':
            case 'CURRENCY':
            case 'PERCENT':
            case 'DOUBLE':
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
                comparison = aValue - bValue;
                break;
            case 'DATE':
            case 'DATETIME':
                aValue = aValue ? new Date(aValue).getTime() : 0;
                bValue = bValue ? new Date(bValue).getTime() : 0;
                comparison = aValue - bValue;
                break;
            case 'BOOLEAN':
                comparison = (aValue === bValue) ? 0 : aValue ? -1 : 1;
                break;
            default:
                aValue = (aValue || '').toString().toLowerCase();
                bValue = (bValue || '').toString().toLowerCase();
                if (!isNaN(aValue) && !isNaN(bValue)) {
                    comparison = parseFloat(aValue) - parseFloat(bValue);
                } else {
                    comparison = aValue.localeCompare(bValue);
                }
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    },

    refreshDataWithPhase: function (component, event, helper, selectedPhaseId) {
        component.set("v.selectedTakeOffPhaseId", selectedPhaseId);
        var pageNumber = component.get("v.PageNumber");
        var pageSize = component.get("v.pageSize");
        var SearchProductType = component.find("SearchProductType").get("v.value");
        var searchLocation = component.find("searchLocation").get("v.value");
        var searchCategory = component.find("searchCategory").get("v.value");
        var searchTradeType = component.find("searchTradeType").get("v.value");
        var searchCostCode = component.find("searchCostCode").get("v.value");
        var searchVendor = component.find("searchVendor").get("v.value");
        helper.getTableRows(component, event, helper, pageNumber, pageSize, SearchProductType, searchLocation, searchCategory, searchTradeType, searchCostCode, searchVendor, selectedPhaseId);
    },

})