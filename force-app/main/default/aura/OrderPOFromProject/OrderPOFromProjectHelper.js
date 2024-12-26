({
    getPurchaseOrders : function(component, event, helper, pageNumber, pageSize) {
        component.set("v.Spinner", true);
        component.set("v.isExpanded", false);
        var purchaseOrderFilter = component.get("v.searchPOFilter");
        var descriptionValue = component.get("v.searchDescriptionFilter");
        var permitValue = component.get("v.searchPermitFilter");
        component.set("v.searchStatusFilter", 'All');
        component.set("v.searchTradeTypeFilter", 'All');
        component.set("v.searchVendorFilter", 'All');
        component.set("v.searchProductCodeFilter", 'All');
        component.find("checkContractors").set("v.value", false);

        var action = component.get("c.getMasterBudgets");
        action.setParams({
            recId : component.get("v.recordId"),
            "pageNumber": pageNumber,
            "pageSize": pageSize,
            "poFilter" : purchaseOrderFilter,
            "poLineFilter" : descriptionValue,
            "productFilter" : '',
            "permitFilter" : permitValue
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                var result = response.getReturnValue();
                console.log({result});
                if(result != null && result.length > 0){
                    component.set("v.allPurchaseOrders", result);
                    component.set("v.PageNumber", result[0].pageNumber);
                    component.set("v.TotalRecords", result[0].totalRecords);
                    component.set("v.RecordEnd", result[0].recordEnd);
                    component.set("v.orgCurr", result[0].orgCurr);

                    let statusSet = new Set(); 
                    let tradeTypeSet = new Set(); 
                    let productCodeSet = new Set(); 
                    let vendorSet = new Set(); 
                    if (result[0].poRecInner != undefined) {
                        for (let i = 0; i < result[0].poRecInner.length; i++) {
                            if (result[0].poRecInner[i].poRecord.hasOwnProperty('buildertek__Vendor__r')) {
                                let name = result[0].poRecInner[i].poRecord.buildertek__Vendor__r.Name;
                                if (name != undefined && name.length > 40) {
                                    result[0].poRecInner[i].poRecord.buildertek__Vendor__r.Name = name.slice(0, 40) + '...';
                                }
                                vendorSet.add(name);
                                if (result[0].poRecInner[i].poRecord.buildertek__Vendor__r.hasOwnProperty('buildertek__Trade_Type_Lookup__r')) {
                                    let tradeTypeLookup = result[0].poRecInner[i].poRecord.buildertek__Vendor__r.buildertek__Trade_Type_Lookup__r.Name;
                                    if (tradeTypeLookup != undefined) {
                                        tradeTypeSet.add(tradeTypeLookup);
                                    }
                                }
                            }
                            if (result[0].poRecInner[i].poRecord.hasOwnProperty('buildertek__Status__c')) {
                                statusSet.add(result[0].poRecInner[i].poRecord.buildertek__Status__c);
                            }     
                            if (result[0].poRecInner[i].poRecord.hasOwnProperty('buildertek__Purchase_Order_Items__r')) {
                                for (let j = 0; j < result[0].poRecInner[i].poRecord.buildertek__Purchase_Order_Items__r.length; j++) {
                                    if (result[0].poRecInner[i].poRecord.buildertek__Purchase_Order_Items__r[j].hasOwnProperty('buildertek__Product__r')) {
                                        if (result[0].poRecInner[i].poRecord.buildertek__Purchase_Order_Items__r[j].buildertek__Product__r.hasOwnProperty('ProductCode')) {
                                            let productCode = result[0].poRecInner[i].poRecord.buildertek__Purchase_Order_Items__r[j].buildertek__Product__r.ProductCode;
                                            productCodeSet.add(productCode);
                                        }
                                    }
                                }
                            }       
                        }
                    }

                    let statusOptions = Array.from(statusSet)
                        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) // Sort numbers first, then alphabetically
                        .map(status => ({ label: status, value: status }));
                    statusOptions.unshift({ label: 'All', value: 'All' });
                    component.set("v.statusOptions", statusOptions);

                    let tradeTypeOptions = Array.from(tradeTypeSet)
                        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
                        .map(tradeType => ({ label: tradeType, value: tradeType }));
                    tradeTypeOptions.unshift({ label: 'All', value: 'All' });
                    component.set("v.tradeTypeOptions", tradeTypeOptions);

                    let productCodeOptions = Array.from(productCodeSet)
                        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
                        .map(productCode => ({ label: productCode, value: productCode }));
                    productCodeOptions.unshift({ label: 'All', value: 'All' });
                    component.set("v.productCodeOptions", productCodeOptions);

                    let vendorOptions = Array.from(vendorSet)
                        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
                        .map(vendorCode => ({ label: vendorCode, value: vendorCode }));
                    vendorOptions.unshift({ label: 'All', value: 'All' });
                    component.set("v.vendorOptions", vendorOptions);

                    component.set("v.TotalPages", Math.ceil(result[0].poRecInner.length / component.get("v.pageSize")));
                    var TotalPages = component.get("v.TotalPages");

                    component.set("v.clickedHeaderField", "PONumber");
                    component.set("v.sortDirection", "desc");
                    helper.sortData(component, helper, component.get("v.clickedHeaderField"), component.get("v.sortDirection"), result, false);
                    component.set("v.Spinner", false);
                }else{
                    component.set("v.Spinner", false);
                    component.set("v.PaginationList", []);
                }
            }else{
                 component.set("v.Spinner", false);
            }
        });
        $A.enqueueAction(action);
        helper.getPOListDetails(component, event, helper);
    },

    sortData: function(component, helper, sortField, sortOrder, data, isFilter) {
        if(sortField != undefined && sortOrder != undefined){
            data.forEach(group => {
                if (group.poRecInner) {
                    group.poRecInner.sort((a, b) => {
                        let aValue, bValue;
        
                        if (sortField === 'Vendor') {
                            aValue = a.poRecord.buildertek__Vendor__r ? a.poRecord.buildertek__Vendor__r.Name : '';
                            bValue = b.poRecord.buildertek__Vendor__r ? b.poRecord.buildertek__Vendor__r.Name : '';
                        } else if (sortField === 'PONumber') {
                            aValue = a.poRecord.Name || '';
                            bValue = b.poRecord.Name || '';
                        } else if (sortField === 'Status') {
                            aValue = a.poRecord.buildertek__Status__c || '';
                            bValue = b.poRecord.buildertek__Status__c || '';
                        } else if (sortField === 'POTotal') {
                            aValue = a.poRecord.buildertek__PO_Total__c || 0;
                            bValue = b.poRecord.buildertek__PO_Total__c || 0;
                        } else if (sortField === 'PaidAmount') {
                            aValue = a.poRecord.buildertek__Paid_Amount__c || 0;
                            bValue = b.poRecord.buildertek__Paid_Amount__c || 0;
                        } else if (sortField === 'POBalance') {
                            aValue = a.poRecord.buildertek__PO_Balance__c || 0;
                            bValue = b.poRecord.buildertek__PO_Balance__c || 0;
                        }
        
                        // Handle string comparison (case insensitive)
                        if (typeof aValue === 'string' && typeof bValue === 'string') {
                            aValue = aValue.toLowerCase();
                            bValue = bValue.toLowerCase();
                        }
        
                        // Compare values
                        let compare = 0;
                        if (aValue > bValue) {
                            compare = 1;
                        } else if (aValue < bValue) {
                            compare = -1;
                        }
        
                        return sortOrder === 'asc' ? compare : -compare;
                    });
                }
            });
        }
        if(!isFilter){
            component.set("v.allPurchaseOrders", data);
            helper.paginateRecords(component, 1, data);  
        } else{
            component.set("v.PaginationList", data);
        }
    },

    getPOListDetails : function(component, event, helper) {
        component.set("v.Spinner", true);
        var action = component.get("c.getPORecListDetails");
        action.setParams({
            recId : component.get("v.recordId")
        });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                console.log({result});
                component.set("v.totalPOs", result.totalPOs);
                component.set("v.totalPOAmount", result.totalPOAmount);
                component.set("v.totalPaidAmount", result.totalPaidAmount);
                // component.set("v.totalRemainingAmount", result.totalRemainingAmount);
                component.set("v.totalRemainingAmount", (result.totalPOAmount - result.totalPaidAmount));   // Changes for BUIL - 3638
                component.set("v.orderedPercent", result.orderedPercent);
                // component.set("v.paidPercent", result.paidPercent);
                component.set("v.paidPercent", (result.totalPaidAmount/result.totalPOAmount)*100);          // Changes for BUIL - 3638
            } else{
                component.set("v.Spinner", false);
            }
        });
        $A.enqueueAction(action);
    },
    
    paginateRecords: function (component, pageNumber, allRecords) {
        var pageSize = component.get("v.pageSize");
        console.log({ allRecords });
        let totalRecords = 0;
        let filteredRecords = [];

        let startIdx = (pageNumber - 1) * pageSize;
        let endIdx = startIdx + pageSize;

        allRecords.forEach(record => {
            let filteredInner = record.poRecInner ? record.poRecInner.slice(startIdx, endIdx) : [];
            if (filteredInner.length > 0) {
                filteredRecords.push({
                    expanded: record.expanded,
                    poCheck: record.poCheck,
                    poRecord: record.poRecord,
                    poRecInner: filteredInner 
                });
            }
        });

        totalRecords = allRecords.reduce((acc, record) => {
            return acc + (record.poRecInner ? record.poRecInner.length : 0);
        }, 0);

        component.set("v.PaginationList", filteredRecords);
        component.set("v.PageNumber", pageNumber);
        component.set("v.RecordStart", startIdx + 1);
        component.set("v.RecordEnd", endIdx);
    },

    readFiles2: function(component, event, helper, file, poId) {
        let maxSize = 4194304;
        // let maxSize = 2097152;
        let filesList = component.get("v.fileData2");
        let reader = new FileReader();

        reader.onload = () => {
            let base64 = reader.result.split(',')[1];
            let fileData2 = {
                'fileName': file.name,
                'fileContent': base64,
                'POId': poId
            };
            let existingFilesSize = 0;

            for (let i = 0; i < component.get("v.fileData2").length; i++) {
                existingFilesSize += component.get("v.fileData2")[i].fileContent.length;
            }

            let totalFileSize = existingFilesSize + file.size;

            if (totalFileSize < maxSize) {
                component.get("v.fileData2").push(fileData2);
                component.set("v.fileData2", component.get("v.fileData2"));
            } else {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "type": "Error",
                    "title": "File Size Exceeded",
                    "message": "The uploaded file exceeds the limit. Please upload a smaller file."
                });
                toastEvent.fire();
                return;
            }

            let names = [];

            for (let i = 0; i < component.get("v.fileData2").length; i++) {
                let name = {
                    'FileName': component.get("v.fileData2")[i].fileName,
                    'poId': component.get("v.fileData2")[i].POId
                };
                names.push(name);
            }

            component.set("v.FileNameList", names);
            component.set("v.fileBody", filesList.fileName);
        };

        reader.readAsDataURL(file);
    },

    settempId : function(component, poId){
        component.set("v.Spinner", true);
        var action = component.get("c.addEmailTemplateId");
        action.setParams({
            POIDs: poId
        });
        action.setCallback(this, function (response) {
            var state = response.getState();
            var toastEvent = $A.get("e.force:showToast");
            if (state === "SUCCESS") {
                component.set("v.Spinner", false);
            } else if (state === "ERROR") {
                var errors = response.getError();
                if (errors && errors[0]) {
                    var errorMessage = 'Unknown error';
    
                    // Check for fieldErrors first
                    if (errors[0].fieldErrors) {
                        var fieldErrorMessages = [];
                        for (var fieldName in errors[0].fieldErrors) {
                            errors[0].fieldErrors[fieldName].forEach(function(errorDetail) {
                                fieldErrorMessages.push(errorDetail.message);
                            });
                        }
                        errorMessage = fieldErrorMessages.join(', ');
                    } else if (errors[0].message) {
                        errorMessage = errors[0].message;
                    }
    
                    console.log('error-->', errorMessage);
                    toastEvent.setParams({
                        "type": "error",
                        "title": "Error",
                        "message": "Error: " + errorMessage
                    });
                    toastEvent.fire();
                } else {
                    console.log('Unknown error', JSON.stringify(errors));
                    toastEvent.setParams({
                        "type": "error",
                        "title": "Error",
                        "message": "An unknown error occurred: " + JSON.stringify(errors)
                    });
                    toastEvent.fire();
                }
                component.set("v.Spinner", false);
            } else if (state === "INCOMPLETE") {
                console.log('Server request incomplete');
                component.set("v.Spinner", false);
            }
        });
        $A.enqueueAction(action);
    },

    updatePoCheck : function(component, helper, POId){
        var posList = component.get("v.masterposList");
        if (posList != null && posList != undefined) {
			for (var i = 0; i < posList.length; i++) {
				if (posList[i].poRecInner != undefined) {
					for (var j = 0; j < posList[i].poRecInner.length; j++) {
						if (posList[i].poRecInner[j].poRecord.Id == POId) {
							posList[i].poRecInner[j].poCheck = false;
						}
					}
				}
			}
		}
		component.set("v.allPurchaseOrders", posList);
    },
    
    showToast: function(title, message, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type
        });
        toastEvent.fire();
    }
})