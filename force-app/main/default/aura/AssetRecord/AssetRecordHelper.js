({
    getFields : function(component, event, helper, recordId) {

        var action = component.get("c.getAsset");
        action.setParams({
            "assetId": recordId
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var fields = response.getReturnValue();
                console.log('fields', fields);
                component.set("v.fieldList", fields);
                var fieldListLeft = [];
                var fieldListRight = [];
                fields.forEach(function(field, index) {
                    if (index % 2 === 0) {
                        fieldListLeft.push(field);
                    } else {
                        fieldListRight.push(field);
                    }
                });
                component.set("v.fieldListLeft", fieldListLeft);
                component.set("v.fieldListRight", fieldListRight);
                component.set("v.Spinner", false);
            }
            else {
                console.log('Failed with state: ' + state);
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "type": "Error",
                    "title": "Error!",
                    "message": "Error in calling method."
                });
                toastEvent.fire();
                component.set("v.Spinner", false);
            }
        });
        $A.enqueueAction(action);
    },

    getProducts : function(component, event, helper) {
        var action = component.get("c.getProductValues");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                // console.log('products', response.getReturnValue());
                component.set("v.products", response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
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

    saveRecord : function(component, event, helper, assetRecord) {
        var action = component.get("c.updateAsset");
        action.setParams({
            "assetRecord": assetRecord
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                console.log('result', result);
                if(result == 'Success'){
                    $A.get('e.force:refreshView').fire();
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "type": "Success",
                        "title": "Success!",
                        "message": "Record Updated Successfully."
                    });
                    toastEvent.fire();
                    component.set("v.viewMode", true);
                }else{
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "type": "Error",
                        "title": "Error!",
                        "message": result
                    });
                    toastEvent.fire();
                }
            }
            else {
                console.log('Failed with state: ' + state);
            }
        });
        $A.enqueueAction(action);
    }
})