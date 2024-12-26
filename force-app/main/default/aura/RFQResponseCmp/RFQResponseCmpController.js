({
    doInit: function (component, event, helper) {
        // Get the current URL and extract the 'id' parameter
        var url = window.location.href;
        var urlParams = new URLSearchParams(window.location.search);
        var recordId = urlParams.get('id');

        // Set the recordId attribute on the component
        component.set("v.recordId", recordId);
        console.log('recordId==>', recordId);
        
       
        var action = component.get("c.getallData");
        console.log('==do init', component.get("v.recordId"));
        
        action.setParams({
            rfqVen: component.get("v.recordId"),
        });

        action.setCallback(this, function (response) {
            console.log('in action');
            console.log('statecode==>', response.getState());
            
            if (response.getState() === "SUCCESS") {
                console.log('inside loop in status code');
                
                // Set the retrieved data to the 'data' attribute
                component.set("v.data", response.getReturnValue());
                console.log('set value');
                
                // Process the data for display
                helper.processData(component);
                console.log('last response==>', response.getState());
                
            } else {
                console.error('Error:', response.getError());
            }
        });

        // Enqueue the action to send the request
        console.log('do this after do setcallback ');
        $A.enqueueAction(action);
    },

    chanageGetdata: function(component, event) {
        var field = event.getSource().get("v.fieldName");
        var value = event.getParam('value');
        var data = component.get("v.data") || [];
        var recordId = component.get("v.recordId");
    console.log('recordId',recordId);
    
        // Find the existing record in the data array
        var existingRecord = data.find(item => item.Id === recordId);
        console.log(existingRecord);
        
        if (existingRecord) {
            // Update the existing record with the new value
            existingRecord[field] = value;
        } else {
            // Create a new record if it doesn't exist
            var newRecord = { Id: recordId };
            newRecord[field] = value;
            data.push(newRecord);
        }
    
        component.set("v.data", data);
    }    
,
    
    
SaveRFQ: function (component, event, helper) {
    var action = component.get("c.saveRFQResponse");
    var data = component.get("v.data");

    console.log('Data to save:', JSON.stringify(data)); // Convert data to JSON string

    action.setParams({
        rfqData: JSON.stringify(data) // Ensure data is passed as JSON string
    });

    action.setCallback(this, function (response) {
        if (response.getState() === "SUCCESS") {
            $A.get("e.force:showToast").setParams({
                "title": "Success!",
                "message": "RFQ Saved Successfully.",
                "type": "success"
            }).fire();
        } else {
            console.error("Error saving RFQ data: ", response.getError());
            $A.get("e.force:showToast").setParams({
                "title": "Error",
                "message": "Error saving RFQ data.",
                "type": "error"
            }).fire();
        }
    });

    $A.enqueueAction(action);
}


    
})