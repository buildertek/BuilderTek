({
	createBudget: function (component, event, helper) {
		$A.get("e.c:BT_SpinnerEvent").setParams({
			"action": "SHOW"
		}).fire();
		var budgetType = component.get("v.budgetType");

		if (budgetType === "Detailed") {
			helper.createDetailedBudget(component, helper);
		} else {
			var groupType = component.get("v.groupBudgetType");
			helper.createGroupBudget(component, helper, groupType);
		}
	},

	cancel: function (component, event, helper) {
		$A.get("e.force:closeQuickAction").fire();
	}
})