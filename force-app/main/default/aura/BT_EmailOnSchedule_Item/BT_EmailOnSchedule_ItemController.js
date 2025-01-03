({
	
	doInit : function(component, event, helper) {
        var objectName = component.get("v.sObjectName");
        var dbAction = component.get("c.getsubject");
        // var objApiName ;
        // if (objectName) {
        //     objApiName = component.get("v.objectAPI");
        // }
        // else{
        //     objApiName = component.get("v.sObjectName");
        // }

        var aktaction= component.get("c.getbody")
        aktaction.setParams({
            ObjectApiName : component.get("v.sObjectName"), 
            recordId: component.get("v.recordId")
        });
        aktaction.setCallback(this,function(response){
            var state = response.getState();
            if  (state === "SUCCESS") {
                component.set("v.templateBody", response.getReturnValue());
                console.log('done');
            }
            else{
               console.log("Failed with state to fetch body: " + state);
            }
        })
        $A.enqueueAction(aktaction);

        var  action = component.get("c.getdefaultTO")
         action.setParams({
            ObjectName: component.get("v.sObjectName"),
            recId: component.get("v.recordId")
        });
          action.setCallback(this,function(response){
              var state = response.getState();
               if (state === "SUCCESS") {
                    if(objectName == 'buildertek__Project_Task__c'){
                    component.set("v.selectedToContact", response.getReturnValue());
                }}
                else{
                           console.log('Failed with state: ' + state);
                }
             })
           $A.enqueueAction(action);
           
        dbAction.setParams({
            recordId : component.get("v.recordId"),
            objectAPIName: component.get("v.sObjectName"),
        });
        dbAction.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                if(objectName == 'buildertek__Change_Order__c'){
                    component.set("v.subject", '');
                }else{

                    component.set("v.subject", response.getReturnValue());
                }
            }
        });
        $A.enqueueAction(dbAction);
        console.log({objectName});
        // console.log(objApiName);

        if(objectName == 'buildertek__Submittal__c'){
             component.set("v.showTemplate", false);
             helper.getFiles(component, event, helper);
             helper.getContact(component, event, helper);    
        }
        else if (objectName == 'buildertek__RFI__c') {
            // component.set("v.showBodyTemplate",true);
            helper.getFiles(component, event, helper);
            helper.getContact(component, event, helper);
            helper.getTemplate(component, event, helper);
        }
        else if (objectName == 'buildertek__Quote__c') {
            helper.getBody(component, event, helper);
            helper.getTemplate(component, event, helper);
        }
        else {
            if(objectName == 'buildertek__Account_Payable__c' || objectName == 'buildertek__Billings__c'){
                component.set("v.showBodyTemplate",true);
                helper.getbodyTemplate(component, event, helper);
            }
            
            helper.getTemplate(component, event, helper);
        }
        helper.getProjectName(component, event, helper);    
       

       
	},
    emailTemplate : function(component, event, helper) {
        var objectName = component.get("v.objectAPI");
         // alert('component.get("v.selectedbodyTemplateItem")'+component.get("v.selectedbodyTemplateItem"));
          /*  if(objectName == 'buildertek__Account_Payable__c'){
                component.set("v.showBodyTemplate",true);
                helper.getbodyTemplate(component, event, helper);
            }*/
            helper.getBodyContent(component,component.get("v.selectedbodyTemplateItem"));
           // helper.getBodyContent(component, event, helper);
    },   
	sendemail : function(component, event, helper) {
		console.log("selectedToContact--->",component.get("v.selectedToContact"));
		console.log("selectedVendorResources--->",component.get("v.selectedVendorResources"));
		console.log("selectedCcContact--->",component.get("v.selectedCcContact"));
		console.log("selectedfiles--->",component.get("v.selectedFiles"));
		 //alert('selected Users-------'+JSON.stringify(component.get("v.selectedFiles")));        
	    if(component.get("v.selectedToContact") != ''){ 
            // if(component.get("v.selectedfilesFill").length>0) {
                // $A.get("e.c:BT_SpinnerEvent").setParams({"action" : "SHOW" }).fire();

                // helper.uploadHelper(component, event, component.get("v.recordId"),helper);    
            // }else{
                $A.get("e.c:BT_SpinnerEvent").setParams({"action" : "SHOW" }).fire();
                helper.send(component, event, helper);
            // }
           
        }else{
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                mode: 'sticky',
                message: 'Please Select To Address',
                type : 'error',
                duration: '5000',
                mode: 'dismissible'
            });
            toastEvent.fire();  
        }
	},
	uploadFileAdd : function(component, event, helper) {
        console.log(component.get("v.selectedFiles"));
        console.log(component.get("v.objectAPI"));

		$A.createComponents(
            [
                ["aura:html", {
                    "tag": "h2",
                    "body": "Upload File",
                    "HTMLAttributes": { 
                        "class": "slds-text-heading_medium slds-hyphenate" 
                    }
                }],
                ["c:BT_AddFiles", {
                    "mainObjectFieldAPI": component.get("v.objectAPI"),
                    "mainObjectId": component.get("v.recordId"),
                    "selectedFiles": component.get("v.selectedFiles"),
                    "onCancel":function(){
                    	 component.get('v.modalPromise').then(function (modal) {
	                        modal.close();
	                        //$A.enqueueAction(component.get("c.doInit"));
	                    });
                    },
                    "onSuccess":function(file){
                    	 component.get('v.modalPromise').then(function (modal) {
	                        modal.close();
	                        //$A.enqueueAction(component.get("c.doInit"));
	                    });
	                    
	                    //alert('file --------> '+file);
	                    var selectedFiles = [];
	                    for(var i=0; i<file.length; i++){
	                        selectedFiles.push({
	                            "Id" : file[i].Id,
	                            "Name" : file[i].Name
	                        });    
	                    }
	                    //alert('selectedFiles ---------> '+selectedFiles.length);
			            component.set("v.selectedFiles", selectedFiles);
                    }
                }], 
                
            ], function(components, status) {
                if (status === 'SUCCESS') {
                    
                   var modalPromise = component.find('overlay').showCustomModal({
                        header: components[0],
                        body: components[1],
                        footer:components[1].find("footer") ,
                        showCloseButton: true,
                        cssClass: '',
                        closeCallback: function() {
                            
                        }
                    });
                    component.set("v.modalPromise", modalPromise);
                }
            });
	},
	
	cancel:function(component, event, helper){
		component.get("v.onCancel")();
	},
     onEmailChange: function (component, event, helper) {
        var emailId = component.find('emailForm').get('v.value');
        var emailIds = component.get('v.emailIds');
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (emailId.charAt(emailId.length - 1) == ';') {
            emailId = emailId.replace(';', '');
            if (reg.test(emailId)) {
                component.set("v.toEmail", '');
                if (!emailIds.includes(emailId)) {
                    emailIds.push(emailId);
                }
            }
        }
        if(emailIds != null && emailIds != ''){
          component.set('v.emailIds', emailIds);  
        }else{
            component.set('v.emailIds', emailId);
        }
        
    },
        onAddEmail: function(component, event, helper) {
        var emailId = component.find('emailForm').get('v.value');
        console.log('emailId', emailId)
        var emailIds = component.get('v.emailIds');
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (reg.test(emailId)) {
            component.set("v.toEmail", '');
            if (!emailIds.includes(emailId)) {
                emailIds.push(emailId);
            }
        }
        component.set('v.emailIds', emailIds);
    },
     handleEmailRemove: function (component, event, helper) {
        var removeIndex = event.getSource().get("v.name");
        var emailIds = component.get('v.emailIds');
        emailIds.splice(removeIndex, 1);
        component.set('v.emailIds', emailIds);
    },
    
	handleFilesChange: function(component, event, helper) {
        console.log('handleFilesChange');
        var fileName = 'No File Selected..';                
            //alert(event.getSource().get("v.files").length);
        if (event.getSource().get("v.files").length > 0) {
            // fileName = event.getSource().get("v.files")[0]['name'];
        }
        component.set("v.selectedfileslist",event.getSource().get("v.files"));

        var fileCount=event.getSource().get("v.files").length;

        
        var files='';
        var mapData = [];
        if (fileCount > 0) {
            for (var i = 0; i < fileCount; i++) 
            {
                fileName = event.getSource().get("v.files")[i]["name"];
                var obj = {};
                obj['Name'] = fileName;                
                if(i == 0){
                	files=fileName;    
                }else{
                    files=files+','+fileName;
                }
                mapData.push(obj);                
            }
        }
        else
        {
            files=fileName;
        }
        component.set("v.fileName", files);            
        component.set("v.selectedfilesFill",mapData);

        console.log(component.get("v.fileName"));
        console.log(component.get("v.selectedfilesFill"));

    },                 
    clear :function(component,event,heplper){
        helper.clearPillValues(component, event, helper);
    },                
    closeWindow: function(component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    },
     openPopupModel:function(component, event, helper) {
        $A.get("e.c:BT_SpinnerEvent").setParams({"action" : "SHOW" }).fire();    
        var selectedFile = component.get("v.selectedFile");
        component.set("v.selectedFile", selectedFile);
        helper.getFileList(component, event, helper);
    },    
    closeFileModel : function (component,event,helper) {
        var selectedFiles = component.get("v.selectedFiles") || [];
        var selectedFiles2 = component.get("v.selectedFiles2") || [];

        selectedFiles = selectedFiles.filter(function(file) {
            return !selectedFiles2.includes(file);
        });
        component.set("v.selectedFiles", selectedFiles);
        component.set("v.selectedFiles2", []);
        console.log('selectedFiles after cancel:', selectedFiles);
        component.set("v.showModel",false);
    },  
    handleSaveButtonClick: function(component, event, helper) {
        helper.saveButton(component, event, helper);
    },

    handleCheckboxChange: function(component, event, helper) {
        helper.onChecboxChanges(component, event, helper);
    },
    handleFileChange: function(component, event, helper) {
        helper.standardFileUploderFileChange(component, event, helper);
    },
                
})