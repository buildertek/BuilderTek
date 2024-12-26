({
    doInit : function(component, event, helper) {
        // component.set("v.Spinner", true);
        var recordId = component.get("v.recordId");
        helper.getFields(component, event, helper, recordId);
        helper.getProducts(component, event, helper);
    },

    editRecord : function(component, event, helper) {
        component.set("v.viewMode", false);
    },

    leaveEditForm : function(component, event, helper) {
        $A.get('e.force:refreshView').fire();
        component.set("v.viewMode", true);
    },

    handlechangeofProduct : function(component, event, helper) {
        var productId = event.getSource().get("v.value");
        console.log('productId', productId);
        if (productId == null || productId == undefined || productId == '' || productId == ' ') {
            console.log('productId is null');
        }else{
            var productList = component.get("v.products");
            var selectedProduct = productList.find(product => product.Id === productId);
            var name = selectedProduct.Name;
            if (name.length > 79) {
                name = name.substring(0, 76) + '...';
            }
            component.set("v.productName", name);
            console.log('productName', name);
        }
    },

    updateAssetRecord : function(component, event, helper) {
        var fieldName = event.getSource().get("v.fieldName");
        var fieldValue = event.getSource().get("v.value");

        console.log('fieldName', fieldName);
        console.log('fieldValue', fieldValue);

        if (fieldName == 'buildertek__Asset_Product__c') {
            helper.handlechangeofProduct(component, event, helper);
        }

        //save it to assetRecord
        var assetRecord = component.get("v.assetRecord");
        assetRecord[fieldName] = fieldValue;
        component.set("v.assetRecord", assetRecord);
    },

    saveRecord: function (component, event, helper) {
        try {
            var assetRecord = component.get("v.assetRecord");
            //remove sobjectType
            delete assetRecord.sobjectType;
            assetRecord.Id = component.get("v.recordId");
            console.log('assetRecord', assetRecord);
            helper.saveRecord(component, event, helper, assetRecord);
        } catch (error) {
            console.error("Error in saveRecord: ", error);
        }
    },
})