import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addAssetToBudgetLine from "@salesforce/apex/AddAssetFromBudgetController.addAssetToBudgetLine";
import addAssetToBudget from "@salesforce/apex/AddAssetFromBudgetController.addAssetToBudget";
import getAssetData from "@salesforce/apex/AddAssetFromBudgetController.getAssetData";
import getcurrency from "@salesforce/apex/AddAssetFromBudgetController.getcurrency";

export default class AddAssetFromBudget extends LightningElement {
    @api budgetId;
    @api budgetLineList = [];
    @track budgetLineId = '';
    @track assetRecordList = [];
    @track selectedAsset = [];
    @track currencycode = 'USD';
    @track isLoading = false;

    connectedCallback() {
        this.isLoading = true;
        if (this.budgetLineList.length > 0) {
            this.budgetLineId = this.budgetLineList[0].Id;
        }
        this.getCurrency();
        this.getAssetData();
    }

    getCurrency() {
        getcurrency()
        .then(result => {
            this.currencycode = result;
        }).catch(error => {
            console.log("error in getCurrency ==>", error);
        })
    }

    getAssetData() {
        getAssetData({ budgetId: this.budgetId})
            .then(result => {
                if (result) {
                    this.assetRecordList = result.length > 0 ? result : null;
                    console.log("this.assetRecordList==>", this.assetRecordList);
                    this.isLoading = false;
                }
            }).catch(error => {
                this.isLoading = false;
                console.log("error in getAssetData==>", error);
            })
    }

    checkAsset(event) {
        let checked = event.target.checked;
        if (checked) {
            console.log('this.selectedAsset.length ==> ', this.selectedAsset.length);
            this.selectedAsset.push({Id: event.target.dataset.id});
            console.log("selectedAsset ==> ", this.selectedAsset);
        } else {
            this.selectedAsset.splice(this.selectedAsset.findIndex(item => item.Id == event.target.dataset.id), 1);
        }
    }

    UpdateAsset() {
        if (this.selectedAsset && this.selectedAsset.length > 0) {
            this.isLoading = true;
            if (this.budgetLineId != '') {
                console.log(this.budgetLineId);
                console.log(this.selectedAsset);
                console.log(this.budgetId);
                addAssetToBudgetLine ({ selectedBudgetLine: this.budgetLineId, selectedAsset: this.selectedAsset, budgetId: this.budgetId})
                    .then(result => {
                        this.isLoading = false;
                        this.showToast('Success', 'Selected Asset has been added successfully to Budget Line', 'Success');
                        this.dispatchEvent(new CustomEvent('close', { detail: { refresh: true } }));
                    }).catch(error => {
                        this.isLoading = false;
                        this.showToast('Error', error , 'error');
                        console.log("error in addAssetToBudgetLine==>", error);
                    })
            } else {
                addAssetToBudget ({ selectedAsset: this.selectedAsset, budgetId: this.budgetId})
                    .then(result => {
                        this.isLoading = false;
                        this.showToast('Success', 'Budget Line with selected Asset has been created successfully', 'Success');
                        this.dispatchEvent(new CustomEvent('close', { detail: { refresh: true } }));
                    }).catch(error => {
                        this.isLoading = false;
                        this.showToast('Error', error , 'error');
                        console.log("error in addAssetToBudget==>", error);
                    })
            }
        } else {
            this.showToast('Error', 'Please Select Asset First', 'error');
        }
    }

    closeAddAsset(event) {
        this.dispatchEvent(new CustomEvent('close', { detail: { refresh: false } }));
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            dissmissible: true,
            duration: 3000
        });
        this.dispatchEvent(event);
    }
}