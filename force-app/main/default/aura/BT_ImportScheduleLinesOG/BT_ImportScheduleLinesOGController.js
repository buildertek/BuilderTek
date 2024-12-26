({

    onFileSelected: function (component, event, helper) {
        try {
            var fullPath = document.getElementById("file-upload-input-01").value;
            var split = fullPath.split(/(\\|\/)/g).pop();
            document.getElementById("fileName").innerHTML = split;
            var fileInput = component.find("file").getElement();
            var file = fileInput.files[0];
            var reader = new FileReader();

            reader.onload = function(e) {
                var fileContent = e.target.result;
                console.log("File Content:", fileContent);
                component.set("v.files", fileContent);
            };
            reader.readAsText(file);
        } catch (error) {
            helper.showToast(component, "error", error);
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();
        }
        
    },
    
    
    downloadCsv : function(component,event,helper){
        try {
            var csv = helper.convertArrayOfObjectsToCSV(component,event,helper);   
            if (csv == null){return;}   
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_self'; 
            hiddenElement.download = 'Import Schedules.csv';
            document.body.appendChild(hiddenElement);
            hiddenElement.click();
        } catch (error) {
            helper.showToast(component, "error", error);
        }
        
    }, 
   
    
    closeModel: function (component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();       
    },

    CreateRecord: function(component, event, helper) {
        try {
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "SHOW"
            }).fire();
            var fileInput = component.find("file").getElement();
            console.log('fileInput-->',fileInput);
            console.log('fileInput.length--->',fileInput.length);
            console.log('fileInput.files[0]--->',fileInput.files[0]);
            if (fileInput.files[0] === undefined || fileInput.length === 0) {
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
                helper.showToast(component, "error", "Please insert a proper csv file to import.");
            } else {
                var file = fileInput.files[0];
                if (file) {
                    var csv = component.get("v.files");
                    console.log("csv ----> " + csv);
                    var result = helper.CSV2JSON(component, csv);
                    console.log('result :', result);
                    if (result !== undefined && result !== "" && result !== 'Error' && result !== 'Invalid') {
                        window.setTimeout(
                            $A.getCallback(function() {
                                helper.CreateAccount(component, result);
                            }), 1000
                        );
                    } else if (result == 'Error') {
                        helper.showToast(component, "error", "Something went wrong.");
                        $A.get("e.c:BT_SpinnerEvent").setParams({
                            "action": "HIDE"
                        }).fire();
                        return '';
                    } else if (result == 'Invalid') {
                        helper.showToast(component, "error", "Invalid Date format !!!");
                        $A.get("e.c:BT_SpinnerEvent").setParams({
                            "action": "HIDE"
                        }).fire();
                        return '';
                    } else {
                        var CircularDependencyName = component.get("v.CircularDependencyName");;
                        helper.showToast(component, "error", "Circular Dependency!");
                        $A.get("e.c:BT_SpinnerEvent").setParams({
                            "action": "HIDE"
                        }).fire();
                        return '';
                    }
                }
            }
        } catch (error) {
            helper.showToast(component, "error", error);
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();
        }
        
    }
});