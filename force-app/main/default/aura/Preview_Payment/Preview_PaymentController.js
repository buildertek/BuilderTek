/*({
	init : function(component, event, helper) {
		var recordId = component.get("v.recordId");
		var action = component.get("c.getPaymentLines");
		action.setParams({
			recordId : recordId
		});
		action.setCallback(this, function(response){
			var state = response.getState();
			if(state === "SUCCESS"){
				var result =  response.getReturnValue();
				component.set("v.paymentLines", result);
			}
		});
		$A.enqueueAction(action);
	}
}) */

({
	init: function (component, event, helper) {
		$A.get("e.c:BT_SpinnerEvent").setParams({
			"action": "SHOW"
		}).fire();
		var dbAction = component.get("c.getTemplates");
		dbAction.setParams({
			recordId: component.get("v.recordId")
		});
		dbAction.setCallback(this, function (response) {
			var state = response.getState();
			if (state === "SUCCESS") {
				component.set("v.templates", response.getReturnValue());
				$A.get("e.c:BT_SpinnerEvent").setParams({
					"action": "HIDE"
				}).fire();
			}
		});
		$A.enqueueAction(dbAction);
	},

	preiewEmailTemplate: function (component, event, helper) {
		var selectedTemplate = component.get("v.selectedTemplate");

		if (selectedTemplate != undefined) {
			component.set("v.isTemplateSelected", true);

			helper.getTemplateBody(component, event, helper);
		}
	},

	closeModel: function (component, event, helper) {
		$A.get("e.force:closeQuickAction").fire();
	},

	sendEmail: function (component, event, helper) {
		$A.get("e.c:BT_SpinnerEvent").setParams({
			"action": "SHOW"
		}).fire();
		var toIds = [];
		var ccIds = [];
		var to = component.get("v.selectedToContact");
		var cc = component.get("v.selectedCcContact");
		to.forEach(function (v) { toIds.push(v.Id) });
		cc.forEach(function (v) { ccIds.push(v.Id) });
		if (toIds.length != 0) {
			var action = component.get("c.sendProposal");
			action.setParams({
				htmlBody: component.get("v.paymentLines"),
				recordId: component.get("v.recordId"),
				templateId: component.get("v.selectedTemplate"),
				to: toIds,
				cc: ccIds,
				ccCurrentUser: component.get("v.ccCurrentUser")
			});
			action.setCallback(this, function (response) {
				var state = response.getState();
				var subject = 'Payment[ref:' + component.get("v.recordId") + ']';
				if (state === "SUCCESS") {
					var result = response.getReturnValue();
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
						/* var taskaction = component.get("c.createTask");
						 taskaction.setParams({
						   "whatId" : component.get("v.recordId"),
						   "emailSubject" : subject
					   });
					   $A.enqueueAction(taskaction);*/
					} else {
						$A.get("e.force:closeQuickAction").fire();
						var toastEvent = $A.get("e.force:showToast");
						toastEvent.setParams({
							"type": 'error',
							"message": result
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
	},

	ccCurrentUserChange: function (component, event, helper) {
		component.set("v.ccCurrentUser", event.getSource().get("v.checked"));
	}
})