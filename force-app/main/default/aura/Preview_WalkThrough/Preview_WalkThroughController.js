({
    init: function (component, event, helper) {
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();
        var dbAction = component.get("c.getWTTemplates");
        dbAction.setParams({
            recordId: component.get("v.recordId")
        });
        dbAction.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var templates = response.getReturnValue();
                if (templates.length === 1) {
                    component.set("v.selectedTemplate", templates[0].Id);
                    component.set("v.isTemplateSelected", true);
                    $A.enqueueAction(component.get('c.previewEmailTemplate'));
                }
                component.set("v.templates", templates);
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
            } else {
                console.error("Failed to retrieve templates", response.getError());
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
            }
        });
        $A.enqueueAction(dbAction);
    },

    previewEmailTemplate: function (component, event, helper) {
        var selectedTemplate = component.get("v.selectedTemplate");
        if (selectedTemplate != undefined) {
            component.set("v.isTemplateSelected", true);
            helper.getContactDetails(component, event);
            helper.getTemplateBody(component, event, helper);

            setTimeout(function () {
                var wrapper = document.getElementById("signature-pad");
                if (wrapper) {
                    var canvas = wrapper.querySelector("canvas");
                    function resizeCanvas() {
                        var ratio = Math.max(window.devicePixelRatio || 1, 1);
                        canvas.width = canvas.offsetWidth * ratio;
                        canvas.height = canvas.offsetHeight * ratio;
                        canvas.getContext("2d").scale(ratio, ratio);
                    }

                    window.onresize = resizeCanvas;
                    resizeCanvas();

                    window.signaturePad = new SignaturePad(canvas);

                    document.getElementById("btnClear").onclick = function (event) {
                        event.preventDefault();
                        console.log(window.signaturePad);
                        window.signaturePad.clear();
                    }
                }
            }, 3000);
        }
    },

    closeModel: function (component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    },

    sendEmail: function (component, event, helper) {
        try {
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "SHOW"
            }).fire();
            var Files = component.get("v.attachedFile");
            var toIds = [];
            var ccIds = [];
            var to = component.get("v.selectedToContact");
            var cc = component.get("v.selectedCcContact");
            var subject = component.get("v.subject");
            to.forEach(function (v) { toIds.push(v.Id) });
            cc.forEach(function (v) { ccIds.push(v.Id) });
            var subject = component.get("v.subject");

            if (toIds.length != 0) {
                if (!subject || subject == "") {
                    $A.get("e.c:BT_SpinnerEvent").setParams({
                        "action": "HIDE"
                    }).fire();
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error!",
                        "type": 'error',
                        "message": "Please enter a Subject for the email."
                    });
                    toastEvent.fire();
                    return;
                }
                var action = component.get("c.sendWalkThroughEmail");
                action.setParams({
                    htmlBody: component.get("v.templateBody"),
                    recordId: component.get("v.recordId"),
                    templateId: component.get("v.selectedTemplate"),
                    to: toIds,
                    cc: ccIds,
                    fileid: component.get("v.fileimageId"),
                    attacheDocs: Files,
                    emailSubject: subject,
                    ccCurrentUser: component.get("v.ccCurrentUser")
                });
                action.setCallback(this, function (response) {
                    var state = response.getState();
                    var result = response.getReturnValue();
                    console.log('Result =>', { result });
                    if (state === "SUCCESS") {
                        if (result === 'Success') {
                            $A.get("e.c:BT_SpinnerEvent").setParams({
                                "action": "HIDE"
                            }).fire();
                            $A.get("e.force:closeQuickAction").fire();
                            var toastEvent = $A.get("e.force:showToast");
                            toastEvent.setParams({
                                "title": "Success!",
                                "type": 'success',
                                "message": "Email Sent Successfully"
                            });
                            toastEvent.fire();
                        } else {
                            $A.get("e.force:closeQuickAction").fire();
                            var toastEvent = $A.get("e.force:showToast");
                            toastEvent.setParams({
                                "type": 'error',
                                "message": 'Something Went Wrong'
                            });
                            toastEvent.fire();
                        }
                        $A.get('e.force:refreshView').fire();
                    }
                });
                $A.enqueueAction(action);
            } else {
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "type": 'error',
                    "message": "Please select To Address to send Email"
                });
                toastEvent.fire();
            }

        } catch (error) {
            console.log('Error =>', error.message);
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();
        }
    },


    acceptandSendMethodCall: function (component, event, helper) {
        helper.acceptandsendemailhelper(component, event);
    },

    AcceptandsendEmail: function (component, event, helper) {
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();
        var toIds = [];
        var ccIds = [];
        var to = component.get("v.selectedToContact");
        var cc = component.get("v.selectedCcContact");
        to.forEach(function (v) { toIds.push(v.Id) });
        cc.forEach(function (v) { ccIds.push(v.Id) });
        var subject = component.get("v.subject");

        if (toIds.length != 0) {
            if (!subject || subject == "") {
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "type": 'error',
                    "message": "Please  enter a Subject for the email."
                });
                toastEvent.fire();
                return;
            }
            if (!signaturePad.isEmpty()) {
                helper.AcceptSignature(component, event);
            } else {
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "type": 'error',
                    "message": "Please Sign and Accept"
                });
                toastEvent.fire();
            }
        } else {
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "type": 'error',
                "message": "Please select To Address to send Email"
            });
            toastEvent.fire();
        }

    },

    rejectSendEmail: function (component, event, helper) {
        var toIds = [];
        var ccIds = [];
        var to = component.get("v.selectedToContact");
        var cc = component.get("v.selectedCcContact");
        to.forEach(function (v) { toIds.push(v.Id) });
        cc.forEach(function (v) { ccIds.push(v.Id) });
        if (toIds.length != 0) {
            if (!signaturePad.isEmpty()) {
                component.set('v.isRejected', true);
                component.set('v.isEmailSend', true);
            } else {
                component.set('v.isRejected', false);
                component.set('v.isEmailSend', false);
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "type": 'error',
                    "message": "Please Sign"
                });
                toastEvent.fire();
            }
        } else {
            component.set('v.isRejected', false);
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();
            component.set('v.isEmailSend', false);
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "type": 'error',
                "message": "Please select To Address to send Email"
            });
            toastEvent.fire();
        }
    },

    closeModelReason: function (component, event, helper) {
        component.set('v.isRejected', false);
    },

    rejectSendEmailWithReason: function (component, event, helper) {
        $A.get("e.c:BT_SpinnerEvent").setParams({
            "action": "SHOW"
        }).fire();
        var rejectionReason = component.get('v.rejectReason');
        if (rejectionReason) {
            helper.rejectSignature(component, event);
        } else {
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "type": 'error',
                "message": "Please enter reason"
            });
            toastEvent.fire();
        }
    },

    Acceptandclose: function (component, event, helper) {
        if (!signaturePad.isEmpty()) {
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "SHOW"
            }).fire();
            helper.getuploadSignature(component, event);

        } else {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "type": 'error',
                "message": "Please Sign and Accept"
            });
            toastEvent.fire();
        }
    },

    rejectAndClose: function (component, event, helper) {
        if (signaturePad != undefined && signaturePad) {
            component.set('v.isClose', true);
            component.set("v.isRejected", true);
        } else {
            component.set('v.isClose', false);
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "type": 'error',
                "message": "Please Sign and Reject"
            });
            toastEvent.fire();
        }
    },

    rejectAndSave: function (component, event, helper) {
        var rejectionReason = component.get('v.rejectReason');
        if (rejectionReason) {
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "SHOW"
            }).fire();
            component.set('v.isClose', true);
            helper.getRejectAndClose(component, event);
        } else {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "type": 'error',
                "message": "Please enter reason"
            });
            toastEvent.fire();
        }
    },

    handleUploadFinished: function (component, event, helper) {
        var uploadedFiles = event.getParam("files");

        var fileDocsId = [];
        var fileName = [];
        uploadedFiles.forEach(element => {
            console.log(element.name);

            var maxCharacters = 25; // Define the maximum number of characters to display
            if (element.name.length > maxCharacters) {
                fileName.push(element.name.slice(0, maxCharacters) + "...");
            } else {
                fileName.push(element.name);
            }
            fileDocsId.push(element.documentId);

        });

        component.set("v.uploadedFileName", fileName);
        component.set("v.attachedFile", fileDocsId);
    },

    ccCurrentUserChange: function (component, event, helper) {
        component.set("v.ccCurrentUser", event.getSource().get("v.checked"));
    }

})