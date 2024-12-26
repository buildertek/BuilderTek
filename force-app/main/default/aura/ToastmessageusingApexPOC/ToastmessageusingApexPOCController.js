// AsyncOperationComponentController.js
({
    doAsyncOperation : function(component, event, helper) {
        // Get the URL parameter (if any)
        // var inputParam = component.get("v.pageReference").state.c__inputParam;
        
        // Call the Apex future method
        var action = component.get("c.performAsyncOperation");
        action.setParams({ inputParam: 10 });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.statusMessage", "Async operation successful!");
                helper.showToast("Async operation successful!", "success");
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error(errors);
                component.set("v.statusMessage", "Async operation failed. Check the console for details.");
                helper.showToast("Async operation failed. Check the console for details.", "error");
            }
        });
        
        $A.enqueueAction(action);
    }
})