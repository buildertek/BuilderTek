({
    processData: function (component) {
        var data = component.get("v.data");
        var fieldObject ={};
        console.log('Data object:', data);  
        const staticFields = ['Name', 'buildertek__RFQ_Details__c','buildertek__Description__c'];
       
        
        // Check if data is an array and has at least one element
        if (data && Array.isArray(data) && data.length > 0) {
            var firstDataItem = data[0];  // Access the first object in the array
            
            console.log('RFQFields within firstDataItem:', firstDataItem.RFQFields);
            console.log('RFQData within firstDataItem:', firstDataItem.RFQData);
            
            if (firstDataItem.RFQFields && firstDataItem.RFQData) {
                var RFQFields = firstDataItem.RFQFields;
                var RFQData = firstDataItem.RFQData;

                //for data table 
                var VandorRFQColumn = firstDataItem.vendorRFQItemColumns;
               component.set('v.columns',VandorRFQColumn);
                console.log('VandorRFQColumn',VandorRFQColumn);
                var vendorRFQItems = firstDataItem.vendorRFQItems;
               //component.set('v.columns',VandorRFQColumn);
               component.set('v.processedData',vendorRFQItems);

                console.log(component.get('v.processedData'));
              
                console.log('vendorRFQItems',vendorRFQItems);
                
                console.log('RFQDATA===>', RFQData);
                console.log('RFQFields===>', RFQFields);
                
                // Split the RFQFields into left and right columns
                var leftColumnFields = [];     
                var rightColumnFields = [];
                

               var fieldMap = new Map();
                RFQFields.forEach(function (field, index) {
                    var fieldName = field.fieldName;
                    console.log(fieldName);
                    var fieldValue = RFQData[fieldName];
                    console.log('fv::',fieldValue);
                   var fieldLabel = field.label;
                   console.log('fieldLabel==>',fieldLabel);
                   
                    fieldMap.set(fieldName,fieldValue);
                    var isStatic = staticFields.includes(fieldName);
                    fieldObject = {
                        label: fieldLabel,
                        apiName: fieldName,
                        value: fieldValue
                    };
                    if (index % 2 === 0) {
                        leftColumnFields.push(fieldObject);
                    } else {
                        rightColumnFields.push(fieldObject);
                    }
                });
                

                component.set("v.leftColumnFields", leftColumnFields);
                component.set("v.rightColumnFields", rightColumnFields);
                console.log('left column==>', leftColumnFields);
                console.log('left column==>', rightColumnFields);
                
            } else {
                console.error('RFQFields or RFQData is undefined');
            }
        } else {
            console.error('Data is not an array or is empty:', data);
        }
    },

    updateData: function (component, rowIndex, fieldName, value) {
        var data = component.get("v.data");
        
        if (data && Array.isArray(data) && data.length > 0) {
            var firstDataItem = data[0];
            var RFQData = firstDataItem.RFQData;

            // Update the specific item in RFQData
            RFQData[fieldName] = value; 

            // Update the component's data attribute
            component.set("v.data", data);
        } else {
            console.error('Data is not an array or is empty:', data);
        }
    },

    deleteFile: function (component, fileId) {
        var action = component.get("c.deleteFile");
        action.setParams({ fileId: fileId });

        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS") {
                // Handle success scenario, such as refreshing the file list
            }
        });
        $A.enqueueAction(action);
    }
})