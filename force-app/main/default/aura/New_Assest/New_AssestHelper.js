({
    getRecordTypes : function(component, event, helper) {
        var action = component.get("c.getRecordTypeValues");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('recordTypes', response.getReturnValue());
                var recordTypes = response.getReturnValue();
                var recordTypeOptions = [];
                recordTypes.forEach(function(recordType) {
                    recordTypeOptions.push({
                        label: recordType.Name,
                        value: recordType.Id
                    });
                });
                component.set("v.recordTypeOptions", recordTypeOptions);
                component.set("v.Spinner", false);

            }
        });
        $A.enqueueAction(action);
    },

    getPriceBooks : function(component, event, helper) {
        var action = component.get("c.getPriceBookValues");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('priceBooks', response.getReturnValue());
                // pricebookOptions
                var priceBooks = response.getReturnValue();
                var pricebookOptions = [];
                priceBooks.forEach(function(pricebook) {
                    pricebookOptions.push({
                        label: pricebook.Name,
                        value: pricebook.Id
                    });
                });
                component.set("v.pricebookOptions", pricebookOptions);

            }
        });
        $A.enqueueAction(action);
    },

    getProductFamily : function(component, event, helper, selectedPriceBookId) {
        var action = component.get("c.getProductFamilyValues");
        action.setParams({
            pbookId: selectedPriceBookId
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('productFamily', response.getReturnValue());
                // productFamilyOptions
                var productFamily = response.getReturnValue();
                var productFamilyOptions = [];
                productFamily.forEach(function(product) {
                    productFamilyOptions.push({
                        label: product,
                        value: product
                    });
                });
                component.set("v.productFamilyOptions", productFamilyOptions);
                component.set("v.selectedProductFamily", "");

            }
        });
        $A.enqueueAction(action);
    },

    getProducts2 : function(component, event, helper) {
        var pricebookId = component.get("v.selectedPricebookId");
        var productFamily = component.get("v.selectedProductFamily");
        var action = component.get("c.getProductsbyNameandFamily");
        action.setParams({
            pbookId: pricebookId,
            pName : null,
            pfId: productFamily
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('products', response.getReturnValue());
                var products = response.getReturnValue();
                var filteredProducts = [];
                for (var key in products) {
                    filteredProducts.push({
                        Name: products[key],
                        Id: key
                    });
                }
                component.set("v.productSearchResults", filteredProducts);
            }
            console.log('Product map created');
        }
        );
        $A.enqueueAction(action);
    },

    getProducts3 : function(component, searchTerm) {
        var pricebookId = component.get("v.selectedPricebookId");
        var productFamily = component.get("v.selectedProductFamily");
        var action = component.get("c.getProductsbyNameandFamily");
        action.setParams({
            pbookId: pricebookId,
            pName : searchTerm,
            pfId: productFamily
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('products', response.getReturnValue());
                var products = response.getReturnValue();
                var filteredProducts = [];
                for (var key in products) {
                    filteredProducts.push({
                        Name: products[key],
                        Id: key
                    });
                }
                component.set("v.productSearchResults", filteredProducts);
            }
            console.log('Product map created');
        }
        );
        $A.enqueueAction(action);
    },

    

    showToast: function(title, message, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: title,
            message: message,
            type: type
        });
        toastEvent.fire();
    },

    getSelectedRecordTypeName: function(component, selectedRecordType) {
        var recordTypeOptions = component.get("v.recordTypeOptions");
        for (var i = 0; i < recordTypeOptions.length; i++) {
            if (recordTypeOptions[i].value === selectedRecordType) {
                component.set("v.selectedRecordTypeName", recordTypeOptions[i].label);
                return recordTypeOptions[i].label;
            }
        }
        return null;
    },

    handleRecordTypeSelection: function(component, event, helper, selectedRecordTypeName) {
        if (selectedRecordTypeName == 'Rental') {
            helper.getFieldSet(component, event, helper, 'buildertek__Rental');
        } else if (selectedRecordTypeName == 'Company Owned') {
            helper.getFieldSet(component, event, helper, 'buildertek__Company_Owned');
        }else{
            helper.showToast("Error", "Please select a valid record type", "error");
            component.set("v.Spinner", false);
        }
        component.set("v.recordTypePage", false);
        component.set("v.MainContainer", true);
    },

    getFieldSet : function(component, event, helper, fieldSetName) {
        var action = component.get("c.getFieldSetValues");
        action.setParams({
            objectName: 'buildertek__Asset_Manager__c',
            fieldSetName: fieldSetName
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('fieldSet', response.getReturnValue());
                var fieldSet = response.getReturnValue();
                //listOfFields0
                var listOfFields = [];
                fieldSet.forEach(function(field) {
                    listOfFields.push({
                        label: field.label,
                        value: field.fieldName
                    });
                });
                component.set("v.listOfFields0", listOfFields);
                console.log('listOfFields0', component.get("v.listOfFields0"));
                component.set("v.Spinner", false);
            }
        });
        $A.enqueueAction(action);
    },

    createAsset : function(component, event, helper, data) {
        console.log('data', data);
        var action = component.get("c.createAssetRecord");
        action.setParams({
            assetRecord: data
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                console.log('result', result);
                if (result.includes('Error')) {
                    component.set("v.Spinner", false);
                    helper.showToast("Error", result, "error");
                } else {
                    component.set("v.Spinner", false);
                    helper.showToast("Success", "Asset created successfully", "success");
                    helper.navigateToRecord(component, event, helper, result);
                }
            } else {
                component.set("v.Spinner", false);
                helper.showToast("Error", "Error in creating asset", "error");
            }
        });
        $A.enqueueAction(action);
    },

    navigateToRecord : function(component, event, helper, recordId) {
        var workspaceAPI = component.find("workspace");
        workspaceAPI.getFocusedTabInfo().then(function(response) {
            var focusedTabId = response.tabId;
            workspaceAPI.openTab({
                url: '/lightning/r/buildertek__Asset_Manager__c/' + recordId + '/view',
                focus: true
            });
            workspaceAPI.closeTab({tabId: focusedTabId});
        })
        .catch(function(error) {
            console.log(error);
        });
        $A.get("e.force:closeQuickAction").fire();
        window.setTimeout(
            $A.getCallback(function () {
                $A.get('e.force:refreshView').fire();
            }), 1000
        );
        
    },

    getProducts : function(component, event, helper) {        
        var action = component.get("c.getProductValues");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                // console.log('products', response.getReturnValue());
                component.set("v.products", response.getReturnValue());
                var productMap = {};
                response.getReturnValue().forEach(product => {
                    productMap[product.Id] = product;
                });
                component.set("v.productMap", productMap);
            }
            console.log('Product map created');
        });
        $A.enqueueAction(action);
    },

    getProjectId : function(component, event, helper) {
        var url = window.location.href;
        console.log('url', url);
        //if url contains %2Fbuildertek__Project__c%2F then untill next %2F get the project id
        var projectId = '';
        if (url.includes('%2Fbuildertek__Project__c%2F')) {
            var splitUrl = url.split('%2Fbuildertek__Project__c%2F');
            if (splitUrl.length > 1) {
            projectId = splitUrl[1].split('%2F')[0];
            }
            console.log('projectId', projectId);
            component.set("v.parentprojectRecordId", projectId);
        }
    },
})