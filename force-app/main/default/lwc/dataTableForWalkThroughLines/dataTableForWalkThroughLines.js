import { LightningElement, track, wire } from 'lwc';
import fetchWalkthroughLineData from '@salesforce/apex/DTForWalkThroughLineController.fetchWalkthroughLineData';
import getRelatedRecords from '@salesforce/apex/WTLRelatedListController.getRelatedRecords';
import getFieldSet from '@salesforce/apex/DTForWalkThroughLineController.getFieldSetValues';
import { updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from "lightning/navigation";
import { subscribe, unsubscribe, onError } from 'lightning/empApi';

const actions = [
    { label: 'Edit', name: 'edit' },
    { label: 'N/A', name: 'na' },
];

export default class DataTableForWalkThroughLines extends NavigationMixin(LightningElement) {
    @track data;
    @track data1;
    @track columns;
    @track error;
    fldsItemValues = [];
    isInitalRender = true;
    isEditable = true;
    @track isUpdate = false;
    @track reloadVar = true;
    showNewModel = false;

    subscription = {};
    CHANNEL_NAME = '/event/Refresh_Related_List__e';

    renderedCallback() {
        if (this.isInitalRender) {
            const body = document.querySelector("body");

            const style = document.createElement('style');
            style.innerText = `
                .datatable_class .slds-cell-fixed{
                    background: #0678FF1A !important;
                }
            `;

            body.appendChild(style);
            this.isInitalRender = false;
        }
    }

    connectedCallback() {
        console.log('connectedCallback');
        subscribe(this.CHANNEL_NAME, -1, this.refreshList).then(response => {
            this.subscription = response;
        });
        onError(error => {
            console.error('Server Error--->'+error);
        });
    }

    refreshList = ()=> {
        this.getRelatedRecords();
    }

    disconnectedCallback() {
        unsubscribe(this.subscription, () => {
            console.log('Unsubscribed Channel');
        });
    }

    getRelatedRecords() {
        getRelatedRecords()
            .then(result => {
                console.log('result--->',result);
                this.reloadVar = false;
                this.data = result;
                this.reloadVar = true;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.data = undefined;
            });
    }

    @wire(getFieldSet, { sObjectName: 'buildertek__Walk_Through_Line_Items__c', fieldSetName: 'buildertek__FieldsForDT' })
    wiredFields({ error, data }) {
        if (data) {
            console.log('data',data);
            data = JSON.parse(data);
            console.log(data);
            let cols = [];
            data.forEach(currentItem => {
                let col = { label: currentItem.label, fieldName: currentItem.name, type: currentItem.type};
                cols.push(col);
            });
            cols.push({type: 'action', typeAttributes: { rowActions: actions }})
            this.columns = cols;
            console.log('this.columns-->',this.columns);
        } else if (error) {
            console.log(error);
            this.error = error;
            this.columns = undefined;
        }
    }

    @wire(fetchWalkthroughLineData, {})
    wiredAccounts({ error, data }) {
        if (data) {
            this.data = data;
            this.data1 = data.map(row => {
                return {
                    ...row,
                    buildertek__Description__c: row.buildertek__Description__c ? row.buildertek__Description__c : '-',
                    buildertek__Details__c: row.buildertek__Details__c ? row.buildertek__Details__c : '-',
                    buildertek__Quantity__c: row.buildertek__Quantity__c ? row.buildertek__Quantity__c : '-',
                    buildertek__Price__c: row.buildertek__Price__c ? row.buildertek__Price__c : '-',
                    buildertek__Anticipated_Start_Date__c: row.buildertek__Anticipated_Start_Date__c ? row.buildertek__Anticipated_Start_Date__c : '-',
                    buildertek__Anticipated_Finish_Date__c: row.buildertek__Anticipated_Finish_Date__c ? row.buildertek__Anticipated_Finish_Date__c : '-',
                    buildertek__Notes__c: row.buildertek__Notes__c ? row.buildertek__Notes__c : '-'
                };
            });
            console.log(this.data);
            console.log(this.data1);
        } else if (error) {
            console.error(error);
            this.error = error;
            this.data = undefined;
        }
    }

    get isColumnsDataAvailable() {
        return this.data && this.columns;
    }

    saveHandleAction(event) {
        this.fldsItemValues = event.detail.draftValues;
        const inputsItems = this.fldsItemValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
       
        const promises = inputsItems.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!!',
                    variant: 'success'
                })
            );
            this.fldsItemValues = [];
            return this.refresh();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An Error Occured!!',
                    variant: 'error'
                })
            );
        }).finally(() => {
            this.fldsItemValues = [];
        });
    }

    async refresh() {
        await refreshApex(this.accObj);
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        const recordId = row.Id;
        switch (actionName) {
            case 'edit':
                this.openEditModel(recordId);
                break;
            case 'na':
                console.log('na is pressed');
                break;
            default:
        }
    }

    openEditModel(recordId){
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'edit',
            },
        });
    }

    handleClick() {
        this.showNewModel = true;
    }
}