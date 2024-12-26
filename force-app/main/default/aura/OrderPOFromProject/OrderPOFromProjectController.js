({
	doInit: function (component, event, helper) {
		var pageSize = component.get("v.pageSize");
		var pageNumber = component.get("v.PageNumber");
		helper.getPurchaseOrders(component, event, helper, pageNumber, pageSize);
	},

	toggle: function (component, event, helper) {
		// debugger;
		var parentItems = component.get("v.PaginationList"),
			pathIndex = event.getSource().get("v.title").split('_'),
			grpIndex = Number(pathIndex[1]),
			rowIndex = Number(pathIndex[0])

		parentItems[grpIndex].poRecInner[rowIndex].expanded = !parentItems[grpIndex].poRecInner[rowIndex].expanded;
		var childItems = parentItems[grpIndex].poRecInner[rowIndex]['poLinesWrapper']
		for (var i = 0; i < childItems.length; i++) {
			parentItems[grpIndex].poRecInner[rowIndex]['poLinesWrapper'][i].expanded = !parentItems[grpIndex].poRecInner[rowIndex]['poLinesWrapper'][i].expanded;
		}
		component.set("v.PaginationList", parentItems);
	},

	next: function (component, event, helper) {
		var pageNumber = component.get("v.PageNumber");
		pageNumber++;
		var allRecords = component.get("v.allPurchaseOrders");
		component.set("v.searchStatusFilter", 'All');
		component.set("v.searchTradeTypeFilter", 'All');
		helper.paginateRecords(component, pageNumber, allRecords);
	},

	previous: function (component, event, helper) {
		// debugger;
		var pageNumber = component.get("v.PageNumber");
		pageNumber--;
		var allRecords = component.get("v.allPurchaseOrders");
		component.set("v.searchStatusFilter", 'All');
		component.set("v.searchTradeTypeFilter", 'All');
		helper.paginateRecords(component, pageNumber, allRecords);
	},

	handleCheck: function (component, event, helper) {
		// debugger;
		var checkbox = event.getSource();
		var Submittals = component.get("v.PaginationList");
		var selectedHeaderCheck;
		if (Submittals != undefined) {
			for (var i = 0; i < Submittals.length; i++) {
				if (Submittals[i].poRecInner != undefined) {
					for (var j = 0; j < Submittals[i].poRecInner.length; j++) {
						if (Submittals[i].poRecInner != null) {
							if (Submittals[i].poRecInner[j].poRecord.Id == checkbox.get("v.name") && Submittals[i].poRecInner[j].poCheck == false) {
								Submittals[i].poRecInner[j].poCheck = true;
								selectedHeaderCheck = true;
							}
							else if (Submittals[i].poRecInner[j].poRecord.Id == checkbox.get("v.name") && Submittals[i].poRecInner[j].poCheck == true) {
								Submittals[i].poRecInner[j].poCheck = false;
								selectedHeaderCheck = false;
							}
						}
					}
				}
			}
		}
		component.set("v.PaginationList", Submittals);
		if (selectedHeaderCheck == false) {
			component.set("v.isSelected", true);
		}
		else {
			component.set("v.isSelected", false);
		}

		var pathIndex = checkbox.get("v.id").split('_'),
			grpIndex = Number(pathIndex[1]),
			rowIndex = Number(pathIndex[0])

		var Submittals = component.get("v.PaginationList");
		if (Submittals != undefined) {
			if (Submittals.length > 0) {
				if (selectedHeaderCheck == true) {
					if (Submittals[grpIndex]['poRecInner'][rowIndex]['poLinesWrapper']) {
						var poLines = Submittals[grpIndex]['poRecInner'][rowIndex]['poLinesWrapper']
						if (poLines != undefined) {
							for (var i = 0; i < poLines.length; i++) {
								poLines[i].poLineCheck = true;
							}
						}
					}
				} else {
					if (Submittals[grpIndex]['poRecInner'][rowIndex]['poLinesWrapper']) {
						var poLines = Submittals[grpIndex]['poRecInner'][rowIndex]['poLinesWrapper']
						if (poLines != undefined) {
							for (var i = 0; i < poLines.length; i++) {
								poLines[i].poLineCheck = false;
							}
						}
					}
				}
			}
			component.set("v.PaginationList", Submittals);
		}
	},

	selectAll: function (component, event, helper) {
		// debugger;
		var selectedHeaderCheck = event.getSource().get("v.value");
		var Submittals = component.get("v.PaginationList");
		var getAllId = component.find("checkContractor");
		if (getAllId != undefined && Submittals != undefined) {
			if (Submittals.length > 0) {
				if (!Array.isArray(getAllId)) {
					if (selectedHeaderCheck == true) {
						component.find("checkContractor").set("v.value", true);
						component.set("v.isSelected", false)
						component.set("v.selectedCount", 1);
					} else {
						component.find("checkContractor").set("v.value", false);
						component.set("v.isSelected", true)
						component.set("v.selectedCount", 0);
					}
				}
				else {
					if (selectedHeaderCheck == true) {
						for (var i = 0; i < getAllId.length; i++) {
							component.find("checkContractor")[i].set("v.value", true);
							component.find("checkContractor")[i].set("v.checked", true);
						}
						for (var i = 0; i < Submittals.length; i++) {
							if (Submittals[i].poRecInner != undefined) {
								for (var j = 0; j < Submittals[i].poRecInner.length; j++) {
									if (Submittals[i].poRecInner[j].poRecord.buildertek__Status__c != 'Ordered') {
										Submittals[i].poRecInner[j].poCheck = true;
									}
									var poLines = Submittals[i]['poRecInner'][j]['poLinesWrapper'];
									if (poLines != undefined) {
										for (var k = 0; k < poLines.length; k++) {
											poLines[k].poLineCheck = true;
										}
									}
								}
							}
						}
						var checkPOLineClass = document.querySelectorAll(".checkPOLineClass");
						for (let i = 0; i < checkPOLineClass.length; i++) {
							checkPOLineClass[i].checked = true;
						}
						component.set("v.isSelected", false)
					}
					else {
						for (var i = 0; i < getAllId.length; i++) {
							component.find("checkContractor")[i].set("v.value", false);
							component.find("checkContractor")[i].set("v.checked", false);

						}
						for (var i = 0; i < Submittals.length; i++) {
							if (Submittals[i].poRecInner != undefined) {
								for (var j = 0; j < Submittals[i].poRecInner.length; j++) {
									if (Submittals[i].poRecInner[j].poRecord.buildertek__Status__c != 'Ordered') {
										Submittals[i].poRecInner[j].poCheck = false;
									}
									var poLines = Submittals[i]['poRecInner'][j]['poLinesWrapper'];
									if (poLines != undefined) {
										for (var k = 0; k < poLines.length; k++) {
											poLines[k].poLineCheck = false;
										}
									}
								}
							}
						}
						var checkPOLineClass = document.querySelectorAll(".checkPOLineClass");
						for (let i = 0; i < checkPOLineClass.length; i++) {
							checkPOLineClass[i].checked = false;
						}
						component.set("v.isSelected", true)
					}
				}
			} else {
				var i = 0;
				if (selectedHeaderCheck == true) {
					component.find("checkContractor").set("v.value", true);
					component.set("v.selectedCount", 1);
					component.set("v.isSelected", false);
					Submittals[i].poCheck = true;
				} else {
					component.find("checkContractor").set("v.value", false);
					component.set("v.selectedCount", 0);
					component.set("v.isSelected", true);
					Submittals[i].poCheck = false;
				}
			}
		}
		component.set("v.PaginationList", Submittals)
	},

	closeModel: function (component, event, helper) {
		$A.get('e.force:refreshView').fire();
	},

	clear: function (component, event, heplper) {
		// debugger;
		event.stopPropagation();
		event.preventDefault();
		var selectedPillId = event.getSource().get("v.name");
		var selectedPillIndex = selectedPillId.split("_")[0];
		var selectedPillPo = selectedPillId.split("_")[1];
		var allFileList = component.get("v.fileData2");
		
		if (allFileList.length != undefined) {
			for (var i = 0; i < allFileList.length; i++) {
				if (allFileList[i].POId == selectedPillPo && i == Number(selectedPillIndex)) {
					allFileList.splice(i, 1);
				}
			}
		}
		component.set("v.fileData2", allFileList);

		var names = []

		if (component.get("v.fileData2") != undefined) {
			for (var i = 0; i < component.get("v.fileData2").length; i++) {
				var name = {};
				name['FileName'] = [];
				name['poId'] = JSON.parse(JSON.stringify(component.get("v.fileData2")[i])).POId
				name['FileName'] = JSON.parse(JSON.stringify(component.get("v.fileData2")[i]))["fileName"];
				names.push(name);
			}
		}
		component.set("v.FileNameList", names);
	},

	handleEmailChange: function (component, event, helper) {
		window.setTimeout($A.getCallback(function() {
			let email = event.getSource().get("v.value");
			let poID = event.getSource().getElement().dataset.id;
			let emailMap = component.get("v.emailMap") || {};
			emailMap[poID] = email;
			component.set("v.emailMap", emailMap);
		}), 0);
	},

	UpdateEmailAndConfirmOrderPO: function (component, event, helper) {
		component.set("v.Spinner2", true);
		component.set("v.Spinner", true);
		let emailMap = component.get("v.emailMap") || {};
		let poList = component.get("v.SelectedPurchaseOrders");

		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		let hasInvalidEmail = false;
		
		for (let element of poList) {
			if (emailMap[element.Id]) {
				let email = emailMap[element.Id];
				if (!emailRegex.test(email)) {
					helper.showToast("Invalid Email!", `The email address ${email} is not valid. Please enter a valid email address.`, "error");
					component.set("v.Spinner2", false);
					component.set("v.Spinner", false);	
					hasInvalidEmail = true;
					break;
				}
				element.buildertek__Vendor__r.buildertek__Email_Address__c = email;
			}
		}

		if (hasInvalidEmail) {
			return;
		}

		let emailAction = component.get("c.saveEmailUpdates");
		emailAction.setParams({
			poList: poList
		});

		emailAction.setCallback(this, function (response) {
			let state = response.getState();
			if (state === "SUCCESS") {
				let result = response.getReturnValue();
				if (result === 'Success') {
					component.set("v.emailMap", {});
					var confirmOrderPO = component.get("c.confirmOrderPO");
					$A.enqueueAction(confirmOrderPO);
				}
			} else {
				console.log('Error:', response.getError());
				helper.showToast("Error!", "An error occurred while updating email addresses.", "error");
			}
		});
		$A.enqueueAction(emailAction);
	},

	confirmOrderPO: function (component, event, helper) {
		component.set("v.Spinner2", true);
		component.set("v.Spinner", true);
		var poList = component.get("v.allPurchaseOrders");
		var poIds = [];
		if (poList != null && poList != undefined) {
			for (var i = 0; i < poList.length; i++) {
				if (poList[i].poRecInner != undefined) {
					for (var j = 0; j < poList[i].poRecInner.length; j++) {
						if (poList[i].poRecInner != null) {
							if (poList[i].poRecInner[j].poCheck == true) {
								poIds.push(poList[i].poRecInner[j].poRecord.Id);
							}
						}
					}
				}
			}
		}

		if (poIds.length > 0) {
			window.setTimeout(
				$A.getCallback(function () {
					component.set("v.selectedPOList", false);
				}), 1000);

			let fileData = JSON.stringify(component.get("v.fileData2"));
			console.log('fileData.length => ' + fileData.length);
			component.set("v.selectedobjInfo", poIds);

			if (fileData.length > 4194304) {
				component.set("v.Spinner", false);
				component.set("v.Spinner2", false);
				component.set("v.selectedPOList", false);
				var toastEvent = $A.get("e.force:showToast");
				toastEvent.setParams({
					"type": "Error",
					"title": "File Size Exceeded",
					"message": "The uploaded file exceeds the limit. Please upload a smaller file."
				});
				toastEvent.fire();
			} else {
				var action = component.get("c.sendMail");
				action.setParams({
					poIds: poIds,
					filedata: fileData
				});
				action.setCallback(this, function (response) {
					var state = response.getState();
					if (state === "SUCCESS") {
						var result = response.getReturnValue();
						if (result.Status === 'Success') {
							component.set("v.selectedPOList", false);
							var toastEvent = $A.get("e.force:showToast");
							toastEvent.setParams({
								"title": "Success!",
								"message": result.Message,
								"type": 'Success'
							});
							toastEvent.fire();

							$A.get("e.force:closeQuickAction").fire();
							window.setTimeout(
								$A.getCallback(function () {
									var action1 = component.get("c.getMasterBudgets");
									action1.setParams({
										recId: component.get("v.recordId"),
										"pageNumber": component.get("v.PageNumber"),
										"pageSize": component.get("v.pageSize"),
										"poFilter": '',
										"poLineFilter": '',
										"tradeTypeFilter": '',
										"projectFilter": '',
										"productFilter": '',
										"permitFilter": ''
									});
									action1.setCallback(this, function (response) {
										var state = response.getState();
										if (state === "SUCCESS") {
											var pageSize = component.get("v.pageSize");
											var result = response.getReturnValue();
											component.set("v.allPurchaseOrders", result);
											component.set("v.totalRecords", component.get("v.allPurchaseOrders").length);
											component.set("v.startPage", 0);
											component.set("v.endPage", pageSize - 1);
											var PaginationList = [];
											for (var i = 0; i < pageSize; i++) {
												if (component.get("v.allPurchaseOrders").length > i)
													PaginationList.push(result[i]);
											}
											component.set("v.clickedHeaderField", "PONumber");
											component.set("v.sortDirection", "desc");
											helper.sortData(component, helper, component.get("v.clickedHeaderField"), component.get("v.sortDirection"), result, false);
											component.set("v.Spinner2", false);
											component.set("v.Spinner", false);
										} else {
											component.set("v.Spinner2", false);
											component.set("v.Spinner", false);
										}
									});
									$A.enqueueAction(action1);
								}), 1000
							);
						} else {
							component.set("v.Spinner", false);
							component.set("v.Spinner2", false);
							component.set("v.selectedPOList", false);
							var toastEvent = $A.get("e.force:showToast");
							toastEvent.setParams({
								"title": "Error!",
								"message": result.Message,
								"type": 'Error'
							});
							toastEvent.fire();
						}
					} else{
						component.set("v.Spinner2", false);
						component.set("v.Spinner", false);
					}
				});
				$A.enqueueAction(action);
			}
		}
	},

	orderPO: function (component, event, helper) {
		component.set("v.Spinner", true);
		var poList = component.get("v.PaginationList");
		console.log('PaginationList',{ poList });
		var poIds = [];
		var poId = [];
		if (poList != null) {
			for (var i = 0; i < poList.length; i++) {
				if (poList[i].poRecInner != undefined) {
					for (var j = 0; j < poList[i].poRecInner.length; j++) {
						if (poList[i].poRecInner != null) {
							if (poList[i].poRecInner[j].poCheck == true) {
								poIds.push(poList[i].poRecInner[j].poRecord);
								poId.push(poList[i].poRecInner[j].poRecord.Id);
							}
						}
					}
				}
			}
		}

		var disableBtn = false;
		poIds.forEach(element => {
			console.log('element.buildertek__Vendor__c ==> ' + element.buildertek__Vendor__c);
			if (element.buildertek__Vendor__c != null && element.buildertek__Vendor__c != '') {
				if (element.buildertek__Vendor__r.buildertek__Email_Address__c == null || element.buildertek__Vendor__r.buildertek__Email_Address__c == '') {
					disableBtn = true;
				}
			} else {
				disableBtn = true;
			}
		});
		component.set("v.disableOrder", disableBtn);
		component.set("v.SelectedPurchaseOrders", poIds);
		if (poIds.length > 0) {
			component.set("v.Spinner", true);
			component.set("v.selectedPOList", true);
			helper.settempId(component, poId);
		} else {
			component.set("v.Spinner", false);
			var toastEvent = $A.get("e.force:showToast");
			toastEvent.setParams({
				title: 'Error',
				message: 'Please select at least 1 Purchase Order.',
				duration: "5000",
				key: "info_alt",
				type: "error",
			});
			toastEvent.fire();
		}
	},

	closePOListPopUp: function (component, event, helper) {
		// debugger;
		component.set("v.selectedPOList", false);
		component.set("v.fileData2", []);
		var selectedHeaderCheck = component.find("checkContractors").get("v.value");
		var Submittals = component.get("v.allPurchaseOrders");
		var getAllId = component.find("checkContractor");
		if (getAllId != undefined && Submittals != undefined) {
			if (Submittals.length > 0) {
				if (!Array.isArray(getAllId)) {
					if (selectedHeaderCheck == true) {
						component.find("checkContractor").set("v.value", true);
						component.set("v.selectedCount", 1);
					} else {
						component.find("checkContractor").set("v.value", false);
						component.set("v.selectedCount", 0);
					}
				}
				else {
					if (selectedHeaderCheck == true) {
						for (var i = 0; i < getAllId.length; i++) {
							component.find("checkContractor")[i].set("v.value", false);
							component.find("checkContractor")[i].set("v.checked", false);
						}
						for (var i = 0; i < Submittals.length; i++) {
							if (Submittals[i].poRecInner != undefined) {
								for (var j = 0; j < Submittals[i].poRecInner.length; j++) {
									if (Submittals[i].poRecInner[j].poRecord.buildertek__Status__c != 'Ordered') {
										Submittals[i].poRecInner[j].poCheck = false;
									}
								}
							}
						}
					}
					else {
						for (var i = 0; i < getAllId.length; i++) {
							component.find("checkContractor")[i].set("v.value", false);
							component.find("checkContractor")[i].set("v.checked", false);
						}
						for (var i = 0; i < Submittals.length; i++) {
							if (Submittals[i].poRecInner != undefined) {
								for (var j = 0; j < Submittals[i].poRecInner.length; j++) {
									if (Submittals[i].poRecInner[j].poRecord.buildertek__Status__c != 'Ordered') {
										Submittals[i].poRecInner[j].poCheck = false;
									}
								}
							}
						}
					}
				}
			} else {
				var i = 0;
				if (selectedHeaderCheck == true) {
					component.find("checkContractor").set("v.value", true);
					component.set("v.selectedCount", 1);
					Submittals[i].poCheck = true;
				} else {
					component.find("checkContractor").set("v.value", false);
					component.set("v.selectedCount", 0);
					Submittals[i].poCheck = false;
				}
			}
		}
		component.set("v.allPurchaseOrders", Submittals)
		component.find("checkContractors").set("v.value", false);
	},

	handleFilesChange2: function (component, event, helper) {
		var fileName = "No File Selected..";
		var fileCount = event.target.files;
		var POId = event.currentTarget.dataset.index;
		var files = '';

		if (fileCount.length > 0) {
			component.set("v.uploadFile", true);
			for (var i = 0; i < fileCount.length; i++) {
				fileName = fileCount[i]["name"];
				if (files == '') {
					files = fileName;
				} else {
					files = files + ',' + fileName;
				}
				helper.readFiles2(component, event, helper, fileCount[i], event.currentTarget.dataset.index);
			}
		}
		component.set("v.fileName2", files);
	},

	unSelect: function (component, event, helper) {
		try {
			component.set("v.isSelected", true);
			var records = component.get("v.PaginationList");

			function uncheckCheckboxes(checkboxes) {
				if (Array.isArray(checkboxes)) {
					checkboxes.forEach(function (checkbox) {
						checkbox.set("v.checked", false);
					});
				} else {
					checkboxes.set("v.checked", false);
				}
			}

			records.forEach(function (record) {
				record.poRecInner.forEach(function (innerRecord) {
					innerRecord.poCheck = false;
					innerRecord.poLinesWrapper.forEach(function (nestedrec) {
						nestedrec.poLineCheck = false;
					});
				});
			});

			component.set("v.PaginationList", records);
			component.find("checkContractors").set("v.value", false);
			uncheckCheckboxes(component.find("checkContractor"));
			uncheckCheckboxes(component.find("checkPOLine"));
			component.set("v.selectedCount", 0);
		} catch (error) {
			console.log('error--->', error);
		}
	},

	massUpdate: function (component, event, helper) {
		component.set("v.enableMassUpdate", true);
	},

	cancelMassUpdate: function (component, event, helper) {
		component.set("v.enableMassUpdate", false);
	},

	saveMassUpdate: function (component, event, helper) {
		var unitCost = component.get("v.UnitCostValue");
		if (unitCost != undefined) {
			component.set("v.Spinner", true);
			var poIds = [];
			var poList = component.get("v.allPurchaseOrders")
			if (poList != null && poList != undefined) {
				for (var i = 0; i < poList.length; i++) {
					if (poList[i].poRecInner != undefined) {
						if (poList[i].poRecInner != undefined) {
							for (var j = 0; j < poList[i].poRecInner.length; j++) {
								if (poList[i].poRecInner[j].poLinesWrapper != undefined) {
									for (var k = 0; k < poList[i].poRecInner[j].poLinesWrapper.length; k++) {
										if (poList[i].poRecInner != null) {
											if (poList[i].poRecInner[j].poLinesWrapper[k].poLineCheck == true && poList[i].poRecInner[j].poLinesWrapper[k].PORow == false) {
												poIds.push(poList[i].poRecInner[j].poLinesWrapper[k].RecordId);
											}
										}
									}
								}
							}
						}
					}
				}
			}

			console.log({ poIds });
			if (poIds.length > 0) {
				var action = component.get("c.updatePOLines");
				action.setParams({
					poLineIds: poIds,
					unitCostValue: unitCost
				});
				action.setCallback(this, function (response) {
					var state = response.getState();
					var error = response.getError();
					if (state === "SUCCESS") {
						component.set("v.enableMassUpdate", false);
						var toastEvent = $A.get("e.force:showToast");
						toastEvent.setParams({
							"type": "success",
							"title": "",
							"message": "Unit Cost is Updated Successfully."
						});
						toastEvent.fire();
						component.set("v.Spinner", false);
						$A.get('e.force:refreshView').fire();
						console.log(response.getReturnValue())
					}
					else {
						component.set("v.Spinner", false);
						var error = ""
						if (response.getError() != null) {
							if (response.getError()[0].pageErrors != undefined) {
								error = JSON.stringify(response.getError()[0].pageErrors[0].message);
							} else if (response.getError()[0].message != null) {
								error = response.getError()[0].message;
							}
						}

						if (error.includes('Required fields are missing: [Vendor]')) {
							var toastEvent = $A.get("e.force:showToast");
							toastEvent.setParams({
								title: 'Error',
								message: error,
								duration: "5000",
								key: "info_alt",
								type: "error",
							});
							toastEvent.fire();
						} else {
							var toastEvent = $A.get("e.force:showToast");
							toastEvent.setParams({
								title: 'Error',
								message: error,
								duration: "5000",
								key: "info_alt",
								type: "error",
							});
							toastEvent.fire();
						}
					}
				});
				$A.enqueueAction(action);
			} else {
				component.set("v.Spinner", false);
				var toastEvent = $A.get("e.force:showToast");
				toastEvent.setParams({
					title: 'Error',
					message: 'Please select at least 1 Purchase Order Item.',
					duration: "5000",
					key: "info_alt",
					type: "error",
				});
				toastEvent.fire();
			}
		} else {
			component.set("v.Spinner", false);
			var toastEvent = $A.get("e.force:showToast");
			toastEvent.setParams({
				title: 'Error',
				message: 'Please enter Unit Cost.',
				duration: "5000",
				key: "info_alt",
				type: "error",
			});
			toastEvent.fire();
		}
	},

	doSearch: function (component, event, helper) {
		var pageNumber = component.get("v.PageNumber");
		var pageSize = component.get("v.pageSize");
		let headers = component.get("v.headers");
        headers.forEach(header => {
			if(header.fieldName == 'PONumber'){
				header.sortDirection = 'up';
				header.iconName = 'utility:arrowup';
			} else{
				header.sortDirection = 'down';
				header.iconName = 'utility:arrowdown';
			}
        });
		component.set("v.headers", headers);
		helper.getPurchaseOrders(component, event, helper, pageNumber, pageSize);
	},

	filterRecordsByPicklist: function(component, event, helper) {
		const nameAttribute = event.getSource().get("v.name");
		console.log({nameAttribute});
		var allRecords = component.get("v.allPurchaseOrders"); 
		var selectedTradeType = component.get("v.searchTradeTypeFilter"); 
		var selectedStatus = component.get("v.searchStatusFilter"); 
		var selectedProductCode = component.get("v.searchProductCodeFilter"); 
		var selectedVendor = component.get("v.searchVendorFilter"); 
		var filteredRecords = [];
	
		if (selectedTradeType != 'All' || selectedStatus != 'All' || selectedProductCode != 'All' || selectedVendor != 'All') {
			allRecords.forEach(function(recordWrapper) {
				var defaultRecordWrapper = {
					"expanded": recordWrapper.expanded || false,
					"orgCurr": recordWrapper.orgCurr || "USD",
					"pageNumber": recordWrapper.pageNumber || 1,
					"pageSize": recordWrapper.pageSize || 30,
					"poCheck": recordWrapper.poCheck || false,
					"poRecInner": [],
					"recordEnd": recordWrapper.recordEnd || 0,
					"totalRecords": recordWrapper.totalRecords || 0
				};
				
				if (recordWrapper.poRecInner && recordWrapper.poRecInner.length > 0) {
					recordWrapper.poRecInner.forEach(function(porec) {
						if(nameAttribute == 'tradeTypeFilter'){
							component.set("v.searchStatusFilter", 'All');
							component.set("v.searchVendorFilter", 'All');
							component.set("v.searchProductCodeFilter", 'All');
							if (porec.poRecord.hasOwnProperty('buildertek__Vendor__r')) {
								if (porec.poRecord.buildertek__Vendor__r.hasOwnProperty('buildertek__Trade_Type_Lookup__r')) {
									if (porec.poRecord.buildertek__Vendor__r.buildertek__Trade_Type_Lookup__r.Name === selectedTradeType) {
										defaultRecordWrapper.poRecInner.push(porec);
									}
								}
							}
						}

						if(nameAttribute == 'statusFilter'){
							component.set("v.searchTradeTypeFilter", 'All');
							component.set("v.searchVendorFilter", 'All');
							component.set("v.searchProductCodeFilter", 'All');
							if (porec.poRecord.buildertek__Status__c === selectedStatus) {
								defaultRecordWrapper.poRecInner.push(porec);
							}
						}

						if(nameAttribute == 'productCodeFilter'){
							component.set("v.searchStatusFilter", 'All');
							component.set("v.searchTradeTypeFilter", 'All');
							component.set("v.searchVendorFilter", 'All');
							if (porec.poRecord.hasOwnProperty('buildertek__Purchase_Order_Items__r')) {
								for (let i = 0; i < porec.poRecord.buildertek__Purchase_Order_Items__r.length; i++) {
									if (porec.poRecord.buildertek__Purchase_Order_Items__r[i].hasOwnProperty('buildertek__Product__r')) {
										if (porec.poRecord.buildertek__Purchase_Order_Items__r[i].buildertek__Product__r.hasOwnProperty('ProductCode')) {
											if (porec.poRecord.buildertek__Purchase_Order_Items__r[i].buildertek__Product__r.ProductCode === selectedProductCode) {
												defaultRecordWrapper.poRecInner.push(porec);
											}
										}
									}
								}
							}
						}

						if(nameAttribute == 'vendorFilter'){
							component.set("v.searchStatusFilter", 'All');
							component.set("v.searchTradeTypeFilter", 'All');
							component.set("v.searchProductCodeFilter", 'All');
							if (porec.poRecord.hasOwnProperty('buildertek__Vendor__r')) {
								if (porec.poRecord.buildertek__Vendor__r.Name === selectedVendor) {
									defaultRecordWrapper.poRecInner.push(porec);
								}
							}
						}
					});
				}
	
				if (defaultRecordWrapper.poRecInner.length > 0) {
					filteredRecords.push(defaultRecordWrapper);
				}
			});
		} else {
			filteredRecords = allRecords;
		}
	
		console.log("Filtered Records: ", {filteredRecords});
		component.set("v.PaginationList", filteredRecords);

		let headers = component.get("v.headers");
        headers.forEach(header => {
			if(header.fieldName == 'PONumber'){
				header.sortDirection = 'up';
				header.iconName = 'utility:arrowup';
			} else{
				header.sortDirection = 'down';
				header.iconName = 'utility:arrowdown';
			}
        });
		component.set("v.headers", headers);
		component.set("v.clickedHeaderField", 'PONumber');
		component.set("v.sortDirection", 'desc');
		helper.sortData(component, helper, component.get("v.clickedHeaderField"), component.get("v.sortDirection"), filteredRecords, true);

		if(selectedTradeType == 'All' && selectedStatus == 'All' && selectedProductCode == 'All' && selectedVendor == 'All') {
			component.set("v.TotalPages", Math.ceil(filteredRecords[0].poRecInner.length / component.get("v.pageSize")));
			helper.paginateRecords(component, 1, filteredRecords);
		} else{
			component.set("v.TotalPages", 1);
		}
	},

	handleBlur: function (component, event, helper) {
		var inputField = event.getSource();
		var unitCost = event.getSource().get("v.value");
		var count = 0;
		if (unitCost >= 1) ++count;
		while (unitCost / 10 >= 1) {
			unitCost /= 10;
			++count;
		}
		if (count > 16) {
			inputField.setCustomValidity("You cannot enter more that 16 digits");
			component.set("v.isSave", true);
		} else {
			inputField.setCustomValidity("");
			component.set("v.isSave", false);
		}
	},

	selectAllPOLines: function (component, event, helper) {
		var selectedHeaderCheck = event.getSource().get("v.value");
		var pathIndex = event.getSource().get("v.name").split('_'),
			grpIndex = Number(pathIndex[1]),
			rowIndex = Number(pathIndex[0])
		var Submittals = component.get("v.PaginationList");
		var getAllId = component.find("checkPOLine");
		if (getAllId != undefined && Submittals != undefined) {
			if (Submittals.length > 0) {
				if (selectedHeaderCheck == true) {
					if (Submittals[grpIndex]['poRecInner'][rowIndex]['poLinesWrapper']) {
						var poLines = Submittals[grpIndex]['poRecInner'][rowIndex]['poLinesWrapper']
						if (poLines != undefined) {
							for (var i = 0; i < poLines.length; i++) {
								poLines[i].poLineCheck = true;
							}
						}
					}
				} else {
					if (Submittals[grpIndex]['poRecInner'][rowIndex]['poLinesWrapper']) {
						var poLines = Submittals[grpIndex]['poRecInner'][rowIndex]['poLinesWrapper']
						if (poLines != undefined) {
							for (var i = 0; i < poLines.length; i++) {
								poLines[i].poLineCheck = false;
							}
						}
					}
				}
			}
			component.set("v.PaginationList", Submittals)
		}

	},

	handleCheckPoLine: function (component, event, helper) {
		var id = event.target.id;
		var Submittals = component.get("v.PaginationList");
		for (var i = 0; i < Submittals.length; i++) {
			if (Submittals[i].poRecInner != null) {
				for (var j = 0; j < Submittals[i].poRecInner.length; j++) {
					if (Submittals[i].poRecInner[j].poLinesWrapper != null) {
						for (var k = 0; k < Submittals[i].poRecInner[j].poLinesWrapper.length; k++) {
							if (j + '-' + i + '-' + k == id) {
								Submittals[i].poRecInner[j].poLinesWrapper[k].poLineCheck = !Submittals[i].poRecInner[j].poLinesWrapper[k].poLineCheck;
							}
						}
					}
				}
			}
		}
		component.set("v.PaginationList", Submittals);
	},

	handleArrowClick: function(component, event, helper) {
        let clickedHeaderField = event.currentTarget.dataset.header;
        let headers = component.get("v.headers");
		let sortDirection = 'asc';

        headers.forEach(header => {
            if (header.fieldName === clickedHeaderField) {
                header.sortDirection = (header.sortDirection === 'down') ? 'up' : 'down';
                header.iconName = (header.sortDirection === 'down') ? 'utility:arrowdown' : 'utility:arrowup'; // Update icon name
				sortDirection = (header.sortDirection === 'down') ? 'asc' : 'desc';
            } else {
                header.sortDirection = 'down';
                header.iconName = 'utility:arrowdown';
            }
        });

		component.set("v.headers", headers);
		component.set("v.clickedHeaderField", clickedHeaderField);
		component.set("v.sortDirection", sortDirection);

		var allRecords = component.get("v.allPurchaseOrders"); 
		var paginatedRecs = component.get("v.PaginationList"); 
		var selectedTradeType = component.get("v.searchTradeTypeFilter"); 
		var selectedStatus = component.get("v.searchStatusFilter"); 
		var selectedProductCode = component.get("v.searchProductCodeFilter"); 
		var selectedVendor = component.get("v.searchVendorFilter"); 
		if(selectedTradeType == 'All' && selectedStatus == 'All' && selectedProductCode == 'All' && selectedVendor == 'All'){
			helper.sortData(component, helper, clickedHeaderField, sortDirection, allRecords, false);
		} else {
			helper.sortData(component, helper, clickedHeaderField, sortDirection, paginatedRecs, true);
		}
  },

	maintoggle: function (component, event, helper) {
		var parentItems = component.get("v.PaginationList")
		var isExpanded = component.get("v.isExpanded");
		if (isExpanded) {
			if (parentItems != undefined) {
				for (var i = 0; i < parentItems.length; i++) {
					if (parentItems[i].poRecInner != undefined) {
						for (var j = 0; j < parentItems[i].poRecInner.length; j++) {
							parentItems[i].poRecInner[j].expanded = !isExpanded;
							if (parentItems[i].poRecInner[j]['poLinesWrapper'] != undefined) {
								for (var k = 0; k < parentItems[i].poRecInner[j]['poLinesWrapper'].length; k++) {
									parentItems[i].poRecInner[j]['poLinesWrapper'][k].expanded = !isExpanded;
								}
							}
						}
					}
				}
			}
		} else {
			if (parentItems != undefined) {
				for (var i = 0; i < parentItems.length; i++) {
					if (parentItems[i].poRecInner != undefined) {
						for (var j = 0; j < parentItems[i].poRecInner.length; j++) {
							parentItems[i].poRecInner[j].expanded = !isExpanded;
							if (parentItems[i].poRecInner[j]['poLinesWrapper'] != undefined) {
								for (var k = 0; k < parentItems[i].poRecInner[j]['poLinesWrapper'].length; k++) {
									parentItems[i].poRecInner[j]['poLinesWrapper'][k].expanded = !isExpanded;
								}
							}
						}
					}
				}
			}
		}

		component.set("v.PaginationList", parentItems);
		isExpanded = !isExpanded;
		component.set("v.isExpanded", isExpanded);
	},

	removePO: function (component, event, helper) {
		var POId = event.currentTarget.dataset.index;
		var vendorList = component.get("v.SelectedPurchaseOrders");
		var updatedVendorList = vendorList.filter(function(item) {
			return item.Id !== POId;
		});
		component.set("v.SelectedPurchaseOrders", updatedVendorList);

		helper.updatePoCheck(component, helper, POId);

		var disableBtn = false;
		if (updatedVendorList.length > 0) {
			updatedVendorList.forEach(element => {
				console.log('element.buildertek__Vendor__c ==> ' + element.buildertek__Vendor__c);
				if (element.buildertek__Vendor__c != null && element.buildertek__Vendor__c != '') {
					if (element.buildertek__Vendor__r.buildertek__Email_Address__c == null || element.buildertek__Vendor__r.buildertek__Email_Address__c == '') {
						disableBtn = true;
					}
				} else {
					disableBtn = true;
				}
			});
		} else {
			// disableBtn = false;
			component.set("v.selectedPOList", false);
			var a = component.get('c.closePOListPopUp');
			$A.enqueueAction(a);
		}
		component.set("v.disableOrder", disableBtn);
	},
})