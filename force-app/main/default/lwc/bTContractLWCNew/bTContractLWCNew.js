import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import getContractData from '@salesforce/apex/ContractPageNew.getContractData';
import getPricebook from '@salesforce/apex/ContractPageNew.getPricebook';
import getPricebookValue from '@salesforce/apex/ContractPageNew.getPricebookValue';
import getProductPrice from '@salesforce/apex/ContractPageNew.getProductPrice';
import getProductfamilyRecords from '@salesforce/apex/ContractPageNew.getProductfamilyRecords';
import deleteContractLine from '@salesforce/apex/ContractPageNew.deleteContractLine';
import deleteSelectedItems from '@salesforce/apex/ContractPageNew.deleteSelectedItems';
import saveContractLineItem from '@salesforce/apex/ContractPageNew.saveContractLineItem';

export default class BTContractLWCNew extends NavigationMixin(LightningElement) {
    @wire(CurrentPageReference) pageRef;
    isInitalRender = true;
    @track data = [];
    @track isLoading = false;
    @api recordId;
    @track contractHeader;
    @track columns;
    @track fieldSetRecords;
    @track groups;
    @track records;
    @track grandTotalList = [];
    @track EditrecordId;
    @track isEditModal = false;
    @track deleteRecordId;
    @track showdeleteModalSingle = false;
    @track showdeleteModalMultiple = false;
    @track fields = {
        Name: '',
        buildertek__Contract__c: '',
        buildertek__Product__c: '',
        buildertek__Contract_Item_Group__c: '',
        buildertek__Unit_Price__c: 0.00,
        buildertek__Unit_Cost__c: 0.00,
        buildertek__Quantity__c: 1,
        buildertek__Cost_Code__c: '',
        buildertek__Discount__c: 0.00
    };
    @track pricebookOptions = [];
    @track costCodeMap = [];
    @track groupsMap = [];
    @track productMap = [];
    @track costCodeId;
    @track groupId;
    @track groupsValues = [];
    @track selectedPricebook = 'None';
    @track priceBookName;
    @track productfamilyOptions = [];
    @track selectedProductFamily;
    @track contractLineValue;
    @track quantityValue = 1;
    @track unitPriceValue;
    @track unitCostValue;
    @track discountValue;
    @track productId;
    selectedLineObj = {};
    selectedTableData = [];

    connectedCallback(){
        console.log(this.recordId);
        this.recordId = this.pageRef.attributes.recordId;
        console.log(this.recordId);
        this.getData();
        this.handleMassUpdate = this.handleMassUpdate.bind(this);
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('message', this.handleMessage.bind(this));
    }

    renderedCallback() {
        if (this.isInitalRender) {
            const body = document.querySelector("body");

            const style = document.createElement('style');
            style.innerText = `
                .contract-table .slds-cell-fixed{
                    background: #e0ebfa !important;
                    color:#0176d3;
                }

                .total-table .slds-cell-fixed{
                    background: #e0ebfa !important;
                    color:#0176d3;
                }

                .lastRowsCSS table tr:last-child {
                    font-weight: 700;
                }
                
                .lastRowsCSS table tr:first-child th:nth-child(1) span,
                .lastRowsCSS table tr:last-child td:nth-child(1) span,
                .lastRowsCSS table tr:last-child td:nth-child(2) span,
                .lastRowsCSS table tr:last-child td:nth-child(3) span,
                .lastRowsCSS table tr:last-child td:nth-child(4) span,
                .lastRowsCSS table tr:last-child td:nth-child(5) span,
                .lastRowsCSS table tr:last-child td:nth-child(7) span{
                    display: none;
                }
                
                .lastRowsCSS table tbody tr:last-child th button{
                    display: none;
                }

                .editForm {
                    position: relative;
                    height: unset !important;
                    max-height: unset !important;
                }

                .editForm .slds-modal__container {
                    max-width: 42rem !important;
                    width: 70% !important;
                }

                .editForm .cuf-content {
                    padding:  0rem !important;
                }

                .editForm .slds-p-around--medium {
                    padding: 0rem !important;
                }

                .editForm .slds-input {
                    padding-left: 10px;
                }
            `;

            body.appendChild(style);
            this.isInitalRender = false;
        }

    }

    getData(){
        try {
            this.isLoading = true;
            getContractData({contractId: this.recordId})
                .then(result => {
                    console.log('result :: ', result);
                    this.fieldSetRecords = result.fieldSetRecords;
                    this.contractHeader = result.contractRec.Name;

                    let cols = [
                        {
                            label: '',
                            fieldName: 'viewButton',
                            type: 'button-icon',
                            fixedWidth: 25,
                            typeAttributes: {
                                iconName: 'utility:edit',
                                name: 'edit_called',
                                title: 'Edit Icon',
                                variant: 'bare',
                                alternativeText: 'Edit Icon'
                            },
                            hideDefaultActions: true
                        },
                        {
                            label: '',
                            fieldName: 'deleteButton',
                            type: 'button-icon',
                            fixedWidth: 25,
                            typeAttributes: {
                                iconName: 'utility:delete',
                                name: 'delete_called',
                                title: 'Delete Icon',
                                variant: 'bare',
                                alternativeText: 'Delete Icon'
                            },
                            hideDefaultActions: true
                        },
                        {
                            label: '',
                            fieldName: 'navigateButton',
                            type: 'button-icon',
                            fixedWidth: 25,
                            typeAttributes: {
                                iconName: 'utility:new_window',
                                name: 'navigate_called',
                                title: 'Navigate Icon',
                                variant: 'bare',
                                alternativeText: 'Navigate Icon'
                            },
                            hideDefaultActions: true
                        },
                    ];
                    result.columns = cols.concat(result.columns);
                    result.columns.unshift({
                        fieldName: 'Number',
                        type: 'string',
                        editable: false,
                        initialWidth: 50,
                        hideDefaultActions: true,
                        cellAttributes: { alignment: 'center' },
                    });
                    this.columns = result.columns;
                    for (var i = 0; i < this.columns.length; i++) {
                        if (result.columns[i].label === 'Cost Code') {
                            result.columns[i].fieldName = 'CostCode';
                            result.columns[i].type = 'string';
                        }
                        if (result.columns[i].label === 'Product') {
                            result.columns[i].fieldName = 'Product';
                            result.columns[i].type = 'string';
                        }
                        if (result.columns[i].label === 'Phase') {
                            result.columns[i].fieldName = 'Phase';
                            result.columns[i].type = 'string';
                        }
                        if (result.columns[i].label === 'Contract Line Group') {
                            result.columns[i].fieldName = 'ContractLineGroup';
                            result.columns[i].type = 'string';
                        }

                        this.columns[i].hideDefaultActions = true;
                        this.columns[i].editable = false;
                        this.columns[i].cellAttributes = {alignment: 'left'};
                        if (this.columns[i].label) {
                            this.columns[i].initialWidth = this.columns[i].label.length * 15;
                        }
                    }
                    this.groups = result.groups;
                    this.records = result.records;

                    for (let i = 0; i < this.records.length; i++) {
                        if (this.records[i].buildertek__Cost_Code__c != null) {
                            this.records[i].CostCode = this.records[i].buildertek__Cost_Code__r.Name;
                        }
                        if (this.records[i].buildertek__Product__c != null) {
                            this.records[i].Product = this.records[i].buildertek__Product__r.Name;
                        }
                        if (this.records[i].buildertek__Contract_Item_Group__c != null) {
                            this.records[i].Phase = this.records[i].buildertek__Contract_Item_Group__r.Name;
                        } else {
                            // Add the missing Contract Item Group attributes
                            this.records[i].buildertek__Contract_Item_Group__c = result.noGrouping.Id;
                            this.records[i].buildertek__Contract_Item_Group__r = {
                                Name: result.noGrouping.Name,
                                Id: result.noGrouping.Id
                            };
                        }
                        if (this.records[i].buildertek__Contract_Line_Group__c != null) {
                            this.records[i].ContractLineGroup = this.records[i].buildertek__Contract_Line_Group__r.Name;
                        }
                    }
                    let Number = 1;
                    this.groups.forEach(group => {
                        // Filter items that belong to the current group
                        const groupItems = this.records.filter(
                            record => record.buildertek__Contract_Item_Group__c === group.Id
                        );

                        try {
                            // Assign row numbers to each item in the group
                            groupItems.forEach(item => {
                                item.Number = Number++; // Assign and increment row number

                                // Use ternary operator to set default values if fields are missing
                                item.buildertek__Quantity__c = item.buildertek__Quantity__c ? item.buildertek__Quantity__c : 0;
                                item.buildertek__Unit_Cost__c = item.buildertek__Unit_Cost__c ? item.buildertek__Unit_Cost__c : 0;
                                item.buildertek__Unit_Price__c = item.buildertek__Unit_Price__c ? item.buildertek__Unit_Price__c : 0;
                                item.buildertek__Tax__c = item.buildertek__Tax__c ? parseFloat(item.buildertek__Tax__c).toFixed(2) + '%' : '0.00%';
                                item.buildertek__Tax_Amount__c = item.buildertek__Tax_Amount__c ? item.buildertek__Tax_Amount__c : 0;
                                item.buildertek__Total_Cost__c = item.buildertek__Total_Cost__c ? item.buildertek__Total_Cost__c : 0;
                                item.buildertek__Total_Price__c = item.buildertek__Total_Price__c ? item.buildertek__Total_Price__c : 0;
                            });
                        } catch (error) {
                            console.log(error);
                        }
            
                        // Push the group along with its items into the data array
                        this.data.push({
                            groupName: group.Name,
                            groupId: group.Id,
                            items: groupItems
                        });
                    });
                    console.log('data ::', this.data);
                    this.calculateTotal(this.data);
                })
                .catch(error => {
                    this.isLoading = false;
                    console.log(error);
                })
                .finally(() => {
                    this.isLoading = false;
                });
            
            getPricebook({contractId: this.recordId})
                .then(result => {
                    console.log('result getPricebook', result);
                    this.priceBookName = result;
                    if(result != null){
                        this.selectedPricebook = result;
                        this.handlePB_PF();
                    }
                })
                .catch(error => {
                    this.isLoading = false;
                    console.log('error in getPricebook', error);
                })

            getPricebookValue()
                .then(result => {
                    console.log('result getPricebookValue', result);
                    let pricebookOptions = [{label: 'None', value: 'None'}];
                    for (const [key, value] of Object.entries(result)) {
                        pricebookOptions.push({ label: key, value: value });
                    }
                    console.log(pricebookOptions);
                    this.pricebookOptions = pricebookOptions;
                })
                .catch(error => {
                    this.isLoading = false;
                    console.log('error in getPricebookValue', error);
                })
        } catch (error) {
            console.log('error in getData ==> ' , error.stack);
            this.isLoading = false;
        }
    }

    calculateTotal(data) {
        let columns = this.columns;
        console.log('Columns :: ' , columns);
        let totalColumns = columns.filter(col => col.type === 'number' || col.type === 'currency');
        let grandTotal = {};

        data.forEach(item => {
            let subtotalList = [];
            let subTotal = {};
            totalColumns.forEach(col => {
                subTotal[col.fieldName] = item.items.reduce((acc, currentItem) => acc + currentItem[col.fieldName], 0);
                if (grandTotal[col.fieldName]) {
                    grandTotal[col.fieldName] += subTotal[col.fieldName];
                } else {
                    grandTotal[col.fieldName] = subTotal[col.fieldName];
                }
            });
            subTotal['Name'] = 'Subtotal';
            item.items.push(subTotal);
            subtotalList.push(subTotal);
            item.subtotal = subtotalList;
            item.isVisible = true;
        });
        this.grandTotalList = [grandTotal];
    }

    handleRowAction(event){
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        const recordId = row.Id;

        switch(actionName){
            case 'edit_called':
                this.handleEdit(recordId);
                break;
            case 'delete_called':
                this.handleDelete(recordId);
                break;
            case 'navigate_called':
                this.handleNavigate(recordId);
                break;
            default:
                break;
        }
    }

    handleEdit(recordId) {
        this.EditrecordId = recordId;
        this.isEditModal = true;
    }

    closeEditModal(){
        this.isEditModal = false;
        this.EditrecordId = null;
    }

    handleSubmit(event){
        try {
            this.isLoading = true;
            event.preventDefault();
            const fields = event.detail.fields;
            console.log('fields :: ',JSON.stringify(fields));

            let isValid = true;
            let message = '';

            // Validate 'Name' is not null or empty
            if (!fields.Name || fields.Name.trim() === '') {
                isValid = false;
                message = 'The Name field must be populated.';
            } else if (fields.buildertek__Quantity__c < 0) {
                isValid = false;
                message = 'The Quantity must be a positive number.';
            } else if (fields.buildertek__Unit_Cost__c < 0) {
                isValid = false;
                message = 'The Unit Cost must be a positive number.';
            } else if (fields.buildertek__Unit_Price__c < 0) {
                isValid = false;
                message = 'The Sales Price must be a positive number.';
            } else if (fields.buildertek__Tax__c !== null && fields.buildertek__Tax__c < 0) {
                isValid = false;
                message = 'The Tax must be a positive number.';
            }
            

            // If validation fails, show error toast
            if (!isValid) {
                this.isLoading = false;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: message,
                    variant: 'error'
                }));
            } else {
                fields.Id = this.EditrecordId;
                this.isEditModal = false;
                this.template.querySelector('lightning-record-edit-form').submit(fields);
            }            
        } catch (error) {
            console.log(error.stack);
        }
    }

    submitDetails2(){
        const btn = this.template.querySelector( ".hidden" );
        if(btn){ 
            btn.click();
        }
    }

    handleSucess(){
        this.isLoading = false;
        this.refreshData();
        var message = 'Record updated successfully';
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success'
        }));
    }

    refreshData() {
        this.data = [];
        this.selectedTableData = [];
        this.contractLineValue = null;
        this.unitPriceValue = null;
        this.costCodeMap = [];
        this.groupsMap = [];
        this.productMap = [];
        this.getData();
    }

    handleError(event){
        this.isLoading = false;
        console.log('event error ',JSON.parse(JSON.stringify(event.detail)));
        var message = event.detail?.detail || 'Error updating record';
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: message,
            variant: 'error'
        }));
    }

    handleDelete(recordId) {
        this.showdeleteModalSingle = true;
        this.deleteRecordId = recordId;
    }

    getSelectedLines(event){
        try {
            console.log(event.detail);
            let selectedTempTableData = [];
            let selectedRows = event.detail.selectedRows;
            this.selectedLineObj[event.target.dataset.id] = selectedRows;

            Object.keys(this.selectedLineObj).forEach(key => {
                selectedTempTableData = [...selectedTempTableData, ...this.selectedLineObj[key]];
            });

            this.selectedTableData = selectedTempTableData;
        } catch (error) {
            console.log('error ',error);
        }
    }

    cancelDelete(){
        this.showdeleteModalSingle = false;
        this.deleteRecordId = null;
    }

    deleteContractLine(){
        var recordId = this.deleteRecordId;
        console.log('deleteRecordId' , recordId);
        if(recordId){
            this.isLoading = true;
            this.cancelDelete();
            deleteContractLine({
                contractItemId: recordId
            }).then(result => {
                if(result == "Sucess"){
                    var message = 'Record deleted successfully';
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: message,
                        variant: 'success'
                    }));
                    this.refreshData();
                    this.isLoading = false;
                }else{
                    var message = 'Error deleting record';
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error',
                        message: message,
                        variant: 'error'
                    }));
                    this.isLoading = false;
                }
            });
        }else{
            var message = 'Please select a record to delete';
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: message,
                variant: 'error'
            }));
            this.isLoading = false;
        }
    }

    handleNavigate(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'buildertek__Contract_Item__c',
                actionName: 'view'
            }
         });
    }

    dropdownHandler(event) {
        var groupId = event.target.dataset.id;
        var data = this.data;
        for (var i = 0; i < data.length; i++) {
            if (data[i].groupId === groupId) {
                data[i].isVisible = !data[i].isVisible;
            }
        }
    }

    handlePricebookChange(event){
        this.selectedPricebook = event.target.value;
        console.log('selectedPricebook :: ' , this.selectedPricebook);
        this.contractLineValue = null;
        this.quantityValue = 1;
        this.productMap = [];
        this.costCodeMap = [];
        this.groupsMap = [];
        this.unitPriceValue = null;
        this.unitCostValue = null;
        if(this.selectedPricebook == 'None'){
            this.productfamilyOptions = [];
            this.selectedProductFamily = null;
        } else{
            this.handlePB_PF();
        }
    }

    handlePB_PF(){
        getProductfamilyRecords({ parentId: this.selectedPricebook })
            .then(result => {
                console.log('PF result :: ', result);
                if(result.length > 0){
                    let productfamilyOptions = [];
                    result.forEach(item => {
                        productfamilyOptions.push({ 
                            label: item.productfamilyvalues, 
                            value: item.productfamilyvalues 
                        });
                    });
                    this.productfamilyOptions = productfamilyOptions;
                    this.selectedProductFamily = productfamilyOptions[0].value;
                }
            });
    }

    handleProductFamilyChange(event){
        this.selectedProductFamily = event.target.value;
        console.log('selectedProductFamily :: ', this.selectedProductFamily);
        console.log('selectedPricebook :: ', this.selectedPricebook);
        this.contractLineValue = null;
        this.quantityValue = 1;
        this.productMap = [];
        this.costCodeMap = [];
        this.groupsMap = [];
        this.unitPriceValue = null;
        this.unitCostValue = null;
    }

    handleContractLineNameChange(event){
        console.log(event.target.value);
        this.contractLineValue = event.target.value;
    }
    
    handleQuantityChange(event){
        this.quantityValue = event.target.value;
    }

    handleUnitPriceChange(event){
        this.unitPriceValue = event.target.value;
    }

    handleProductSelected(event){
        console.log(event.detail);
        if(event.detail.length > 0){
            this.productId = event.detail[0]?.id;
            this.contractLineValue = event.detail[0]?.title;

            if(this.productId != null){
                getProductPrice({productId: this.productId})
                    .then(result => {
                        console.log(result);
                        this.unitPriceValue = result.buildertek__Unit_Cost__c;
                        this.unitCostValue  = result.UnitPrice;
                        this.discountValue = result.buildertek__Discount__c;
                        console.log(result.Product2.buildertek__Cost_Code__r);
                        if(result.Product2.buildertek__Cost_Code__r != null){
                            this.costCodeId = result.Product2.buildertek__Cost_Code__r.Id;
                            let costCodeArr = [{
                                id: result.Product2.buildertek__Cost_Code__r.Id, 
                                title: result.Product2.buildertek__Cost_Code__r.Name,
                                subtitle: 'Costcode'
                            }];
                            this.costCodeMap = [...costCodeArr];
                        }

                        if(result.Product2.buildertek__Quote_Group__r != null){
                            this.groupId = result.Product2.buildertek__Quote_Group__r.Id;
                            let groupArr = [{
                                id: result.Product2.buildertek__Quote_Group__r.Id, 
                                title: result.Product2.buildertek__Quote_Group__r.Name,
                                subtitle: 'Group'
                            }];
                            this.groupsMap = [...groupArr];
                        }
                    })
                    .catch(error => {
                        console.log('error in getProductPrice :: ' , error);
                    }) 
            }
        } else{
            this.productId = null;
            this.productMap = [];
            this.contractLineValue = null;
            this.quantityValue = 1;
            this.unitPriceValue = null;
            this.costCodeMap = [];
            this.groupsMap = [];
        }
    }

    handleCostCodeSelected(event){
        console.log(event.detail);
        this.costCodeId = event.detail[0]?.id;
    }

    handleGroupSelected(event){
        console.log(event.detail);
        this.groupId = event.detail[0]?.id;
    }

    handleSingleLineSave(event){
        if (this.contractLineValue != null && this.contractLineValue != '') {
            this.fields.Name = this.contractLineValue;

            if (this.productId != null) {
                this.fields.buildertek__Product__c = this.productId;
            }
            if (this.costCodeId != null) {
                this.fields.buildertek__Cost_Code__c = this.costCodeId;
            }
            if (this.groupId != null) {
                this.fields.buildertek__Contract_Item_Group__c = this.groupId;
            }
            if (this.quantityValue != null) {
                this.fields.buildertek__Quantity__c = parseFloat(this.quantityValue).toFixed(2); // 2 decimal places
            }
            if (this.unitPriceValue != null) {
                this.fields.buildertek__Unit_Price__c = parseFloat(this.unitPriceValue).toFixed(2); // 2 decimal places
            }
            if (this.unitCostValue != null) {
                this.fields.buildertek__Unit_Cost__c = parseFloat(this.unitCostValue).toFixed(2); // 2 decimal places
            }
            if (this.discountValue != null) {
                this.fields.buildertek__Discount__c = parseFloat(this.discountValue).toFixed(2); // 2 decimal places
            }
            
            // Always set the contract field
            this.fields.buildertek__Contract__c = this.recordId;
    
            console.log(JSON.stringify(this.fields));
    
            saveContractLineItem({contractRecord: JSON.stringify(this.fields)})
                .then(result => {
                    console.log(result);
                    var message = 'Record created successfully';
                        this.dispatchEvent(new ShowToastEvent({
                            title: 'Success',
                            message: message,
                            variant: 'success'
                        }));
                        this.refreshData();
                        this.fields = {
                            Name: '',
                            buildertek__Contract__c: '',
                            buildertek__Product__c: '',
                            buildertek__Contract_Item_Group__c: '',
                            buildertek__Unit_Price__c: 0.00,
                            buildertek__Unit_Cost__c: 0.00,
                            buildertek__Quantity__c: 1,
                            buildertek__Cost_Code__c: '',
                            buildertek__Discount__c: 0.00
                        };
                        this.productId = null;
                        this.contractLineValue = null;
                        this.costCodeId = null;
                        this.groupId = null;
                        this.quantityValue = 1;
                        this.unitPriceValue = null;
                        this.unitCostValue = null;
                        this.discountValue = null;
                })
                .catch(error => {
                    console.log(error);
                })
        } else{
            var message = 'Please enter Contract Line Name';
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: message,
                variant: 'error'
            }));
        }
    }

    deleteSelectedContractItem(event){
        console.log('deleteSelectedcontractItem');
		if (this.selectedTableData.length > 0) {
			this.showdeleteModalMultiple = true;
		} else {
			this.dispatchEvent(
				new ShowToastEvent({
					title: 'Error',
					message: 'Please select the Contract Line you would like to delete.',
					variant: 'error'
				})
			);
		}
    }

    deleteContractLines(){
		this.isLoading = true;
		let recordIds = this.selectedTableData.map(item => item.Id);
		deleteSelectedItems({
			recordIds: recordIds
		})
		.then(result => {
			if(result == "success"){
				let message = 'Contract Lines deleted successfully';
				this.dispatchEvent(new ShowToastEvent({
					title: 'Success',
					message: message,
					variant: 'success'
				}));
			}else{
				this.dispatchEvent(new ShowToastEvent({
					title: 'Error',
					message: result,
					variant: 'error'
				}));
			}
			this.refreshData();
            this.isLoading = false;
		})
		.catch(error => {
			const { errorMessage, errorObject } = this.returnErrorMsg(error);
			this.dispatchEvent(new ShowToastEvent({
				title: "Error",
				message: errorMessage,
				variant: "error"
			}));
            this.isLoading = false;
		})
		.finally(() => {
			this.isLoading = false;
			this.showdeleteModalMultiple = false;
		});
	}

    returnErrorMsg(error){
        let errorMessage = 'Unknown error';
        if (error && error.body) {
            if (error.body.message) {
                errorMessage = error.body.message;
            } else if (error.body.pageErrors && error.body.pageErrors.length > 0) {
                errorMessage = error.body.pageErrors[0].message;
            }
        } else if (error && error.message) {
            errorMessage = error.message;
        }

        return { errorMessage, errorObject: error };
    }

    closeMultipleDeleteModel(){
        this.showdeleteModalMultiple = false;
    }

    handleMassUpdate() {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'buildertek__contractMassUpdate',
            },
            state: {
                c__contractId: this.recordId,
            }
        });
    }

    handleMessage(event) {
        if (event.origin !== window.location.origin) {
            return;
        }
        if (event.data.action === 'closeSubtab') {
            this.refreshData();
        }
    }
}