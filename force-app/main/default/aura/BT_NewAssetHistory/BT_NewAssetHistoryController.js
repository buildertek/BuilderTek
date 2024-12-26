({
	doInit: function (component, event, helper) {
		helper.fetchAssetHistory(component);
	},

	handleDateChange: function (component, event, helper) {
		var index = event.getSource().get("v.name");
		var assetHistoryList = component.get("v.assetHistoryList");
		assetHistoryList[index].buildertek__Date_off_Job__c = event.getSource().get("v.value");
		component.set("v.assetHistoryList", assetHistoryList);
	},

	handleSave: function (component, event, helper) {
		helper.saveAssetHistory(component);
	},

	closeQuickAction: function (component, event, helper) {
		$A.get("e.force:closeQuickAction").fire();
	}
});