({
    init: function(component, event, helper) {
         $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "SHOW"
            }).fire();
        var dbAction = component.get("c.getTemplates");
        dbAction.setParams({
            recordId: component.get("v.recordId")
        });
        dbAction.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var templates = response.getReturnValue();
                if (templates.length === 1) {
                    component.set("v.selectedTemplate", templates[0].Id);
                    component.set("v.isTemplateSelected", true);
                    $A.enqueueAction(component.get('c.preiewEmailTemplate'));
                    // helper.getContact(component, event, helper);
                    // helper.getTemplateBody(component, event, helper);
                }
                component.set("v.templates", templates);
            } else {
                console.error("Failed to retrieve templates");
            }
             $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();

        });
        $A.enqueueAction(dbAction);
    },

    preiewEmailTemplate: function(component, event, helper) {
        var selectedTemplate = component.get("v.selectedTemplate");
        if (selectedTemplate != undefined) {
            component.set("v.isTemplateSelected", true);
            helper.getContact(component, event, helper);
            helper.getTemplateBody(component, event, helper);
        }
    },

    closeModel: function(component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    },

    sendEmail: function(component, event, helper) {
         $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "SHOW"
            }).fire();
        var toIds = [];
        var ccIds = [];
        var noToIds = [];
        var war = '';
        var to = component.get("v.selectedToContact");
        var cc = component.get("v.selectedCcContact");
        console.log(to);
        to.forEach(function(v) {
            if (v.Email != null && v.Email != undefined) {
                toIds.push(v.Id)
            } else {
                noToIds.push(v.Name);
                war += v.Name
            }

        });
        cc.forEach(function(v) {
            ccIds.push(v.Id)
        });

        if (toIds.length != 0) {
            if (noToIds != undefined && to.length != undefined) {
                if (toIds.length != to.length) {
                    /*  var toastEvent = $A.get("e.force:showToast");
                      toastEvent.setParams({
                          title : 'Warning',
                          message: war+' does not have email address.',
                          duration:' 5000',
                          key: 'info_alt',
                          type: 'warning',
                          mode: 'sticky'
                      });
                      toastEvent.fire(); */
                }
            }

            var updateAction = component.get("c.updateMemo");
            updateAction.setParams({
                recordId: component.get("v.recordId"),
                memoValue: component.get("v.invoiceMemo"),
            });
            updateAction.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var action = component.get("c.sendProposal");
                    action.setParams({
                        htmlBody: component.get("v.invoiceLines"),
                        recordId: component.get("v.recordId"),
                        templateId: component.get("v.selectedTemplate"),
                        to: toIds,
                        cc: ccIds,
                        ccCurrentUser: component.get("v.ccCurrentUser")
                    });
                    action.setCallback(this, function(response1) {
                        var state = response1.getState();
                        var subject = 'Invoice[ref:' + component.get("v.recordId") + ']';
                        if (state === "SUCCESS") {
                            var result1 = response1.getReturnValue();
                            if (result1 === 'Success') {
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
                                    "message": result1
                                });
                                toastEvent.fire();
                            }
                            $A.get('e.force:refreshView').fire();
                        }
                    });
                    $A.enqueueAction(action);
                }
            });
            $A.enqueueAction(updateAction);
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

    ccCurrentUserChange: function(component, event, helper) {
        component.set("v.ccCurrentUser", event.getParam("checked"));
    }
})