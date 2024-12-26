({
	handleSubmit: function (component, event, helper) {
		component.set("v.isDisableButton", false);
		component.set("v.Spinner", true);
		console.log(component.get("v.uploadedFiles").length);
		if (component.get("v.uploadedFiles").length > 0) {
			helper.handleRecordWithFiles(component, event, helper);
		} else {
			helper.doSubmitHeloper(component, event, helper);
		}
	},

	doSubmitHeloper: function (component, event, helper) {
    var Questions = component.get("v.Questions");
    let finaleArray = [];
    Questions.forEach( innerRow => {
        innerRow.subsectionWrapperList.forEach( row => {
          finaleArray = finaleArray.concat(row.QuestionsInnerclasslist);
        })
      innerRow.QuestionsInnerclasslist = finaleArray;
      finaleArray = [];
    });
		var today = new Date();
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = today.getFullYear();

		today = yyyy + '/' + mm + '/' + dd;
		var nameDate = component.get("v.DynamiccheckListName");
		if (nameDate != undefined) {
			nameDate = nameDate + '-' + today;
		}
		else {
			nameDate = today;
		}
		component.set("v.DynamiccheckListName", nameDate)
		var action = component.get("c.createchecklistquestion");
		action.setParams({
			"QuestionString": JSON.stringify(Questions),
			"recordId": component.get("v.recordId"),
			"checkName": nameDate,
			"conId": component.get("v.contactId") || null,
			"checkListType": component.get("v.checkListType") || null
		});

		action.setCallback(this, function (a) {

			if (a.getState() === 'SUCCESS') {
				var result = a.getReturnValue();
				//alert(result);
				if (result == 'Success') {
					component.set("v.Spinner", false);
					component.set("v.SuccessMessage", true);
				}
			}
			else {
				console.log("Error ", a.getError());
			}
		});
		var getName1 = component.get("v.DynamiccheckListName");
		if (getName1 != undefined && getName1 != null && getName1 != "") {

			if (getName1.trim() != "") {
				component.set("v.ischecklistNameError", false);
				$A.enqueueAction(action);
			}
			else {
				component.set("v.isDisableButton", true);
				component.set("v.Spinner", false);
				component.set("v.ischecklistNameError", true);
			}
		} else {
			component.set("v.isDisableButton", true);
			component.set("v.Spinner", false);
			component.set("v.ischecklistNameError", true);
		}
	},

	getParameterByName: function (name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	},

	handleRecordWithFiles: function(component, event, helper){
		try {
			var uploadedFiles = component.get("v.uploadedFiles");
			console.log(uploadedFiles.length);
			var filesJson = JSON.stringify(uploadedFiles);
			// console.log(filesJson);

			var Questions = component.get("v.Questions");
			var finaleArray = [];
			Questions.forEach( innerRow => {
				innerRow.subsectionWrapperList.forEach( row => {
					finaleArray = finaleArray.concat(row.QuestionsInnerclasslist);
				})
				innerRow.QuestionsInnerclasslist = finaleArray;
				finaleArray = [];
			});

			var today = new Date();
			var dd = String(today.getDate()).padStart(2, '0');
			var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
			var yyyy = today.getFullYear();
			today = yyyy + '/' + mm + '/' + dd;
			var nameDate = component.get("v.DynamiccheckListName");
			if (nameDate != undefined) {
				nameDate = nameDate + '-' + today;
			}
			else {
				nameDate = today;
			}
			console.log(nameDate);
			component.set("v.DynamiccheckListName", nameDate);

			var action = component.get("c.createChecklistWithFilesAndQuestion");
			action.setParams({
				"QuestionString":JSON.stringify(Questions),
				"recordId": component.get("v.recordId"),
				"checkName": nameDate,
				"filesJson": filesJson,
				"conId": component.get("v.contactId") || null,
				"checkListType": component.get("v.checkListType") || null
			});
			action.setCallback(this, function (a) {
				if (a.getState() === 'SUCCESS') {
					var result = a.getReturnValue();
					if (result == 'Success') {
						component.set("v.Spinner", false);
						component.set("v.SuccessMessage", true);
					} else {
						console.log("Error ", a.getError());
						component.set("v.Spinner", false);
					}
				} else {
					console.log("Error ", a.getError());
					component.set("v.Spinner", false);
				}
			});

			var getName1 = component.get("v.DynamiccheckListName");
			if (getName1 != undefined && getName1 != null && getName1 != "") {
				if (getName1.trim() != "") {
					component.set("v.ischecklistNameError", false);
					$A.enqueueAction(action);
				}
				else {
					component.set("v.isDisableButton", true);
					component.set("v.Spinner", false);
					component.set("v.ischecklistNameError", true);
				}
			} else {
				component.set("v.isDisableButton", true);
				component.set("v.Spinner", false);
				component.set("v.ischecklistNameError", true);
			}
		} catch (error) {
				console.log('error ' , error);
		}
	}
})