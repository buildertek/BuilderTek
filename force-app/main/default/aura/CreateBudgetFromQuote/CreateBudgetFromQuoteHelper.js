({
	showToast: function (title, message, type) {
		var toastEvent = $A.get("e.force:showToast");
		toastEvent.setParams({
			"title": title,
			"message": message,
			"type": type
		});
		toastEvent.fire();
	},

	createDetailedBudget: function (component, helper) {
		var action = component.get("c.createBudgetFromQuote");
		action.setParams({ QuoteId: component.get("v.recordId") });

		action.setCallback(this, function (response) {
			var state = response.getState();

			if (state === "SUCCESS") {
				var result = response.getReturnValue();
				$A.get("e.force:closeQuickAction").fire();
				if (result.strMessage === 'success') {
					this.showToast('Success', 'Budgets Created Successfully', result.strMessage);
					$A.get('e.force:refreshView').fire();
					var event = $A.get('e.force:navigateToSObject');
					event.setParams({
						'recordId': result.newRecordId
					}).fire();
				} else {
					this.showToast('Error', 'Error Creating Budgets', result.strMessage);
				}

			} else if (state === "ERROR") {
				var errors = response.getError();
				var errorMessage = "Unknown error";
				if (errors && errors[0] && errors[0].message) {
					errorMessage = errors[0].message;
				}
				this.showToast('Error', 'Error Creating Budgets', errorMessage);
			}
			$A.get("e.c:BT_SpinnerEvent").setParams({
				"action": "HIDE"
			}).fire();
		});

		$A.enqueueAction(action);
	},

	createGroupBudget: function (component, helper, groupType) {
		var action = component.get("c.createGroupBudgetFromQuote");
		action.setParams({ QuoteId: component.get("v.recordId"), groupByType: groupType });
		action.setCallback(this, function (response) {
			var state = response.getState();
			if (state === "SUCCESS") {
				var result = response.getReturnValue();
				$A.get("e.force:closeQuickAction").fire();
				console.log('Create Group Budget Result: ', result);
				if (result.isSuccess) {
					this.showToast('Success', 'Budgets Created Successfully', result.strMessage);
					var event = $A.get('e.force:navigateToSObject');
					event.setParams({
						'recordId': result.newRecordId
					}).fire();
				} else {
					this.showToast('Error', 'Error Creating Budgets', result.strMessage);
				}
			} else if (state === "ERROR") {
				var errors = response.getError();
				var errorMessage = "Unknown error";
				if (errors && errors[0] && errors[0].message) {
					errorMessage = errors[0].message;
				}
				this.showToast('Error', 'Error Creating Budgets', errorMessage);
			}
			$A.get("e.c:BT_SpinnerEvent").setParams({
				"action": "HIDE"
			}).fire();
		});

		$A.enqueueAction(action);
	},

})