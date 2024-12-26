({  
    doInit:function(component,event,helper){  
       //helper.getuploadedFiles(component);
       
       component.set("v.recordId", component.get("v.recordId"));
        
    },       
    
    UploadFinished : function(component, event, helper) {  
        component.set("v.Spinner", true);
        var uploadedFiles = event.getParam("files"); 
        var documentIds = [];
        for(var i=0;i<uploadedFiles.length;i++){
        	documentIds.push(uploadedFiles[i].documentId);    
        }
        component.set("v.documentIds", documentIds);
        component.set("v.Spinner", false);
        var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success!",
                    "message": "File uploded successfully",
                    "type": "success",
                    "duration": 5000
                });
                toastEvent.fire();
        var dismissActionPanel = $A.get("e.force:closeQuickAction");
         dismissActionPanel.fire();

        // var evt = $A.get("e.force:navigateToComponent");
        // evt.setParams({
        //     componentDef : "c:OCRFieldMapping",
        //     componentAttributes: {
        //         fileId : documentIds
        //     }
        // });
        // evt.fire();
    },
    closeModel : function(component, event, helper) {
        var dismissActionPanel = $A.get("e.force:closeQuickAction");
         dismissActionPanel.fire();
        component.set("v.currentStep", '1');
    },
    
 })