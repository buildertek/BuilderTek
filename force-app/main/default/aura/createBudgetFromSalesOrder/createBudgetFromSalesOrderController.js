({
    createBudget: function (component, event, helper) {
		$A.get("e.c:BT_SpinnerEvent").setParams({
			"action": "SHOW"
		}).fire();

        helper.createBudgetFromSalesOrder(component, helper);
	},

	cancel: function (component, event, helper) {
		$A.get("e.force:closeQuickAction").fire();
	}
})