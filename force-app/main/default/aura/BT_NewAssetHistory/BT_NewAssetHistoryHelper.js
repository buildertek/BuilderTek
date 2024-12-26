({
	fetchAssetHistory: function (component) {
		$A.get("e.c:BT_SpinnerEvent").setParams({
			"action": "SHOW"
		}).fire();
		
		var action = component.get("c.fetchAssetDateoffJob");
		action.setParams({
			assetId: component.get("v.recordId")
		});
	
		action.setCallback(this, function (response) {
			var state = response.getState();
			if (state === "SUCCESS") {
				var result = response.getReturnValue();
				var assetHistoryList = result.assetHistoryList;
				var assetManager = result.assetManager;
	
				// Set Asset Manager details
				if (assetManager.buildertek__Current_Project__c ) {
					component.set("v.projectId", assetManager.buildertek__Current_Project__c);
				}
				if (assetManager.buildertek__Hourly_Rate__c) {
					component.set("v.hourlyRate", assetManager.buildertek__Hourly_Rate__c);
				}
	
				if (assetHistoryList.length > 0) {
					// check if all dates are filled if not, set the assetHistoryList to the missing date records to display in the modal
					let missingDateRecords = assetHistoryList.filter(item => !item.buildertek__Date_off_Job__c);
					
					if (missingDateRecords.length === 0) {
						// call quick action to create new asset history record since all dates are filled
						this.callQuickAction(component);
						$A.get("e.force:closeQuickAction").fire();
					} else {
						component.set("v.assetHistoryList", missingDateRecords);
					}
				} else {
					this.callQuickAction(component);
					$A.get("e.force:closeQuickAction").fire();
				}
			} else {
				this.showToast("Error", "Error fetching records", "error");
				console.log('Response:', response.getReturnValue());
				var errors = response.getError();
				if (errors && errors[0] && errors[0].message) {
					console.log("Error message: ", errors[0].message);
				}
			}
			
			$A.get("e.c:BT_SpinnerEvent").setParams({
				"action": "HIDE"
			}).fire();
		});
		
		$A.enqueueAction(action);
	},

	saveAssetHistory: function (component) {
		var assetHistoryList = component.get("v.assetHistoryList");
		// check if all dates are filled if not, show toast and return
		var allDatesFilled = assetHistoryList.every(function (record) {
			return record.buildertek__Date_off_Job__c;
		});

		if (!allDatesFilled) {
			this.showToast("Error", "Please fill all Date Off Job fields", "error");
			return;
		}

		$A.get("e.c:BT_SpinnerEvent").setParams({
			"action": "SHOW"
		}).fire();

		var action = component.get("c.updateAssetHistory");
		action.setParams({
			assetHistoryList: assetHistoryList
		});

		action.setCallback(this, function (response) {
			var state = response.getState();
			console.log('Result', response.getReturnValue());
			if (state === "SUCCESS") {
				this.showToast("Success", "Records updated successfully", "success");
				this.callQuickAction(component);
			} else {
				this.showToast("Error", "Error updating records", "error");
			}
			$A.get("e.c:BT_SpinnerEvent").setParams({
				"action": "HIDE"
			}).fire();
		});
		$A.enqueueAction(action);
	},

	callQuickAction: function (component) {
		var createRecordEvent = $A.get("e.force:createRecord");
		createRecordEvent.setParams({
			"entityApiName": "buildertek__Asset_History__c",
			"defaultFieldValues": {
				"buildertek__Asset_Manager__c": component.get("v.recordId"),
				"buildertek__Project__c": component.get("v.projectId"),
				"buildertek__Cost__c" : component.get("v.hourlyRate")
			}
		});
		createRecordEvent.fire();
	},

	showToast: function (title, message, type) {
		var toastEvent = $A.get("e.force:showToast");
		toastEvent.setParams({
			"title": title,
			"message": message,
			"type": type,
			"duration": 5000
		});
		toastEvent.fire();
	},
})