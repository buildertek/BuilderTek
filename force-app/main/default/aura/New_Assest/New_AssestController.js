({
    doInit : function(component, event, helper) {
        console.log('doInit New Assest');
        component.set("v.Spinner", true);
        helper.getProjectId(component, event, helper);
        helper.getRecordTypes(component, event, helper);
        helper.getProducts(component, event, helper);
        helper.getPriceBooks(component, event, helper);
    },

    closeModel : function(component, event, helper) {
        var workspaceAPI = component.find("workspace");
        workspaceAPI.getFocusedTabInfo().then(function(response) {
            var focusedTabId = response.tabId;
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

    handleNext : function(component, event, helper) {
        component.set("v.Spinner", true);
        var selectedRecordType = component.get("v.selectedRecordType");
        console.log('selectedRecordType', selectedRecordType);

        if (selectedRecordType == null || selectedRecordType == undefined || selectedRecordType == '') {
            component.set("v.Spinner", false);
            helper.showToast("Error", "Please select a record type", "error");
            return;
        }

        var selectedRecordTypeName = helper.getSelectedRecordTypeName(component, selectedRecordType);
        console.log('selectedRecordTypeName', selectedRecordTypeName);

        if (selectedRecordTypeName != null && selectedRecordTypeName != undefined && selectedRecordTypeName != '') {
            helper.handleRecordTypeSelection(component, event, helper, selectedRecordTypeName);
        } else {
            component.set("v.Spinner", false);
            helper.showToast("Error", "Please select a record type", "error");
        }
    },

    handleBack : function(component, event, helper) {
        component.set("v.recordTypePage", true);
        component.set("v.MainContainer", false);
    },

    handleSubmit : function(component, event, helper) {
        component.set("v.Spinner", true);
        event.preventDefault();
        var fields = event.getParam('fields');
        fields['RecordTypeId'] = component.get("v.selectedRecordType");
        fields['buildertek__Price_Book__c'] = component.get("v.selectedPricebookId");
        fields['buildertek__Asset_Product__c'] = component.get("v.selectedProductId");
        if (fields['buildertek__Hourly_Rate__c'] == null || fields['buildertek__Hourly_Rate__c'] == undefined || fields['buildertek__Hourly_Rate__c'] == '') {
            fields['buildertek__Hourly_Rate__c'] = component.get("v.hourlyRate");
        }
        var data = JSON.stringify(fields);
        helper.createAsset(component, event, helper, data);
    },

    onchangeofProduct : function(component, event, helper) {
        var selectedProductId = event.getSource().get("v.value");
        var selectedProductId = event.getSource().get("v.value");
        if (!selectedProductId) return; // Exit if no selection is made
        
        var productMap = component.get("v.productMap");
        if (!productMap) {
            console.error('Product map is not initialized');
            return;
        }

        var selectedProduct = productMap[selectedProductId];
        if (selectedProduct) {
            var name = selectedProduct.Name;
            name = name.length > 79 ? name.substring(0, 76) + '...' : name;
            component.set("v.productName", name);
        } else {
            console.warn('Selected product not found in the map');
        }
    },

    onchangeofPriceBook : function(component, event, helper) {
        var selectedPriceBookId = event.getSource().get("v.value");
        if (!selectedPriceBookId) return; // Exit if no selection is made

        console.log('selectedPriceBookId', selectedPriceBookId);
        component.set("v.selectedPricebookId", selectedPriceBookId);
        helper.getProductFamily(component, event, helper, selectedPriceBookId);
    },

    onchangeofProductFamily : function(component, event, helper) {
        var selectedProductFamily = event.getSource().get("v.value");
        if (!selectedProductFamily) return; // Exit if no selection is made

        console.log('selectedProductFamily', selectedProductFamily);
        component.set("v.selectedProductFamily", selectedProductFamily);
        helper.getProducts2(component, event, helper);
    },

    handleComponentEvent: function (component, event, helper) {
        var productSearchResults = component.get("v.productSearchResults");
        console.log('productSearchResults', { productSearchResults });

        var selectedAccountGetFromEvent = event.getParam("recordByEvent");
        console.log('selectedAccountGetFromEvent', selectedAccountGetFromEvent);

        if (selectedAccountGetFromEvent) {
            var priceBookEntry = productSearchResults.find(function (product) {
                return product.Id === selectedAccountGetFromEvent.Id;
            });

            priceBookEntry = priceBookEntry.Name;

            if (priceBookEntry) {

                var hourlyRate = priceBookEntry.buildertek__Hourly_Rate__c;
                console.log('hourlyRate', hourlyRate);

                if (hourlyRate) {
                    component.set("v.hourlyRate", hourlyRate);
                }

                component.set("v.selectedProductId", selectedAccountGetFromEvent.Id);
                component.set("v.selectedProductName", selectedAccountGetFromEvent.Name);

                var name = selectedAccountGetFromEvent.Name;
                name = name.length > 79 ? name.substring(0, 76) + '...' : name;
                component.set("v.productName", name);
            } else {
                console.warn('Selected product not found in the search results');
            }
        }
    },

    handleComponentEvents: function (component, event, helper) {
        console.log('handleComponentEvents');
    },


})