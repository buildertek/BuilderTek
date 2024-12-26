({
    handlePricebookSelection : function(component, event, helper) {
        // Extract pricebook ID from the event
        var selectedPricebook = event.getParam("pricebook");
        
        // Clear previous selection
        component.set("v.selectedProduct", null);
        component.set("v.searchResults", []);
        
        console.log('selectedPricebook.Id', selectedPricebook.Id);
        // Set the pricebook ID
        if (selectedPricebook) {
            component.set("v.pricebookId", selectedPricebook.Id);
        } else {
            component.set("v.pricebookId", null);
        }
    },
    
    searchProducts : function(component, event, helper) {
        // Get the search term
        var searchTerm = event.getSource().get("v.value");
        var pricebookId = component.get("v.pricebookId");
        
        // Only search if term is at least 2 characters
        if (searchTerm.length < 2) {
            component.set("v.searchResults", []);
            return;
        }
        
        // Call the server-side method to search products
        var action = component.get("c.searchProductsByPricebook");
        action.setParams({
            "searchTerm": searchTerm,
            "pricebookId": pricebookId
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.searchResults", response.getReturnValue());
            } else {
                console.error("Error searching products");
                var errors = response.getError();
                console.error(JSON.stringify(errors));
            }
        });
        
        $A.enqueueAction(action);
    },
    
    selectProduct : function(component, event, helper) {
        // Get the selected product details
        var selectedItem = event.currentTarget;
        var productId = selectedItem.getAttribute("data-recordid");
        var productName = selectedItem.getAttribute("data-name");
        var productCode = selectedItem.getAttribute("data-productcode");
        
        // Create a full product object
        var selectedProduct = {
            'sobjectType': 'Product2',
            'Id': productId,
            'Name': productName,
            'ProductCode': productCode
        };
        
        // Set the selected product
        component.set("v.selectedProduct", selectedProduct);
        component.set("v.searchResults", []);
        
        // Fire a product selected application event
        var productSelectedEvent = $A.get("e.c:ProductSelectedApplicationEvent");
        productSelectedEvent.setParams({
            "product": selectedProduct
        });
        productSelectedEvent.fire();
    },
    
    clearSelection : function(component, event, helper) {
        // Clear the selected product
        component.set("v.selectedProduct", null);
        
        // Fire a product selected application event with null to indicate clearing
        var productSelectedEvent = $A.get("e.c:ProductSelectedApplicationEvent");
        productSelectedEvent.setParams({
            "product": null
        });
        productSelectedEvent.fire();
    }
})