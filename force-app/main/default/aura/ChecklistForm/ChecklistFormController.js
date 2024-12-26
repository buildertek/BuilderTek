({
    doInit: function (component, event, helper) {
        //Site Url Get
        var url = window.location.href;
        var siteUrl = url.split('?');
        var conId = helper.getParameterByName('contactId', url);
        var checklistName = helper.getParameterByName('selectCheckListName', url);
        component.set("v.checkListType", checklistName);
        component.set("v.contactId", conId);
        if (siteUrl[0] != '' && siteUrl[0] != undefined) {
            component.set("v.siteUrl", siteUrl[0].replace('/buildertek__ChecklistForm', ''));
        }
        else {
            component.set("v.siteUrl", '/');
        }

        var action = component.get("c.getAttachmentData");
        action.setParams({
            "recordId": component.get("v.recordId")
        });
        action.setCallback(this, function (a) {
            if (a.getState() === 'SUCCESS') {
                var result = a.getReturnValue();

                component.set("v.imgUrl", component.get("v.siteUrl") + "/servlet/servlet.FileDownload?file=" + result);
            }
        });
        $A.enqueueAction(action);

        var recId = component.get("v.selectedValue");
        var action = component.get("c.getQuestions");
        action.setParams({
            "CheckQuestionId": recId
        });
        action.setCallback(this, function (a) {
            if (a.getState() === 'SUCCESS') {
                component.set("v.showchecklist", true);
                var result = a.getReturnValue();
                console.log('result', result);
                component.set("v.Questions", result);
            }
        });
        $A.enqueueAction(action);


        var action3 = component.get("c.getProjectName");
        action3.setParams({
            "Ids": component.get("v.recordId"),
            "contactId": component.get("v.contactId")
        });
        action3.setCallback(this, function (c) {
            if (c.getState() === 'SUCCESS') {

                var result = c.getReturnValue();
                console.log('result', result);
                // debugger;
                //  alert(result)
                if (result != 'error') {
                    component.set('v.DynamiccheckListName', result);
                }
            }
            else {
                console.log(c.getError());
            }
        });
        $A.enqueueAction(action3);
    },

    getcheckboxlist: function (component, event, helper) {
        var Questions = component.get("v.Questions");
        var label = event.getSource().get('v.label');
        for (var i = 0; i < Questions.length; i++) {
            for (var j = 0; j < Questions[i].QuestionsInnerclasslist.length; j++) {
                if (label == Questions[i].QuestionsInnerclasslist[j].QuestionName) {
                    Questions[i].QuestionsInnerclasslist[j].QuestionValues = event.getSource().get('v.value');
                }
            }

        }
        component.set("v.Questions", Questions);
    },

    handleUploadFinished: function (cmp, event) {
        // Get the list of uploaded files
        var uploadedFiles = event.getParam("files");

        // Get the file name
        uploadedFiles.forEach(file => console.log(file.name));
    },
  
    nameOnchange: function (component, event, helper) {
        if (component.get("v.DynamiccheckListName") != undefined && component.get("v.DynamiccheckListName") != null && component.get("v.DynamiccheckListName") != "") {
            component.set("v.ischecklistNameError", false);
        }
        else {
            component.set("v.ischecklistNameError", true);
        }
    },

    handleClick: function (component, event, helper) {
        helper.handleSubmit(component, event, helper);
    },

    closePage: function (component, event, helper) {
        window.close('/apex/buildertek__Pre_QualProcess_VF');
    },

    handleSectionFileChange: function(component, event, helper){
        try {
            var uploadedFiles = component.get("v.uploadedFiles");
            var remainingFileSize = component.get("v.remainingFileSize");
            console.log('remainingFileSize before in KB :: ' , remainingFileSize);
            var fileInput = event.getSource().get("v.files");
            var file = fileInput[0];
            var fileSizeMB = file.size / 1024;
            var sectionName = event.getSource().get("v.name");
            console.log('sectionName:', sectionName);
    
            console.log('file:', file);
            if(file){
                if (fileSizeMB > remainingFileSize) {
                    alert('Overall File size cannot exceed 3MB.');
                } else {
                    var objFileReader = new FileReader();
                    // set onload function of FileReader object
                    objFileReader.onload = $A.getCallback(function () {
                        var fileContents = objFileReader.result;
                        var base64 = 'base64,';
                        var dataStart = fileContents.indexOf(base64) + base64.length;
                        fileContents = fileContents.substring(dataStart);
                        
                        uploadedFiles.push({
                            fileName: file.name,
                            base64Data: encodeURIComponent(fileContents),
                            contentType: file.type,
                            size: fileSizeMB
                        });
                        component.set("v.uploadedFiles", uploadedFiles);
                        component.set("v.uploadedFileNumber", component.get("v.uploadedFiles").length);
                        // console.log(JSON.stringify(uploadedFiles));
                        component.set("v.remainingFileSize", remainingFileSize - fileSizeMB);
                        console.log('remainingFileSize after in KB :: ' , component.get("v.remainingFileSize"));
    
                        console.log(component.get("v.uploadedFiles").length);

                        var currentfileName = file.name;
                        // var truncatedFileName = file.name.length > 6 ? file.name.substring(0, 8) + '..' : file.name;
                        // console.log('truncatedFileName :: ',truncatedFileName, ' :: fullFileName :: ', file.name);
                        if(component.get("v.uploadedFiles").length <= 1){
                            component.set("v.fileName", currentfileName );
                            // component.set("v.truncatedFileName", truncatedFileName );
                            component.set("v.uploadedFileText", 'Uploaded Files : ' + component.get("v.uploadedFiles").length + '. Tap to view.' );
                        } else{
                            component.set("v.fileName", component.get("v.fileName") + ' ,' + currentfileName );
                            // component.set("v.truncatedFileName", component.get("v.truncatedFileName") + ' ,' + truncatedFileName );
                            component.set("v.uploadedFileText", 'Uploaded Files : ' + component.get("v.uploadedFiles").length + '. Tap to view.' );
                        }
                    });
                    objFileReader.readAsDataURL(file);
                }
            }
        } catch (error) {
            console.log('error in handleSectionFileChange Controller :: ' , error);
        }
    },

    handleShowUploadedFiles: function(component, event, helper){
        console.log('name div clicked');
        component.set("v.showUploadedFiles", true);
    },

    closeUploadedFileSection: function(component, event, helper){
        console.log('closeUploadedFileSection clicked');
        component.set("v.showUploadedFiles", false);
    },

    removeFile: function(component, event, helper) {
        console.log('removeFile clicked');
        try {
            // Get the index of the file to remove
            var index = event.getSource().get("v.value");
            console.log('File index to be removed:', index);

            var uploadedFiles = component.get("v.uploadedFiles");

            var fileToRemove = uploadedFiles[index];
            console.log(fileToRemove);
            // Update the remaining size
            console.log('remainingFileSize before removing in KB :: ' , component.get("v.remainingFileSize"));
            var remainingSize = component.get("v.remainingFileSize");
            var fileSize = fileToRemove.size; // Assuming each file object has a size property
            console.log('filesize ::' , fileSize);
            component.set("v.remainingFileSize", remainingSize + fileSize);
            console.log('remainingFileSize after removing in KB :: ' , component.get("v.remainingFileSize"));

            // Remove the file from the uploadedFiles array
            uploadedFiles.splice(index, 1);
            console.log(uploadedFiles);
            // Update the component attribute
            component.set("v.uploadedFiles", uploadedFiles);
            component.set("v.uploadedFileNumber", component.get("v.uploadedFiles").length);

            // update file number
            if(component.get("v.uploadedFiles").length < 1){
                component.set("v.uploadedFileText", 'No File Selected.' );
            } else{
                component.set("v.uploadedFileText", 'Uploaded Files : ' + component.get("v.uploadedFiles").length + '. Tap to view.' );
            }
            console.log(component.get("v.uploadedFiles"));
            console.log(component.get("v.uploadedFiles").length);
        } catch (error) {
            console.log('error in removeFile :: ' , error.stack);
        }
    }
})