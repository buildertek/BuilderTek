import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addChangeOrdertoBudget from "@salesforce/apex/BudgetDAO.addChangeOrdertoBudget";
import addChangeOrdertoBudgetonly from "@salesforce/apex/BudgetDAO.addChangeOrdertoBudgetonly";
import getCoData from "@salesforce/apex/BudgetDAO.getCoData";
import getcurrency from "@salesforce/apex/BudgetDAO.getcurrency";

export default class AddCOFromBudget extends LightningElement {
    @api budgetId;
    @api budgetLineList = [];

    @track budgetLineId = '';
    @track coRecordList = [];
    @track selectedCO = [];
    @track currencycode = 'USD';

    @track isLoading = false;

    get allSelected() {
        return this.coRecordList && this.coRecordList.length > 0 && this.selectedCO.length === this.coRecordList.length;
    }

    connectedCallback() {
        this.isLoading = true;
        if (this.budgetLineList.length > 0) {
            this.budgetLineId = this.budgetLineList[0].Id;
        }
        this.getCurrency();
        this.fetchCOList();
    }
    renderedCallback() {

    }

    getCurrency() {
        getcurrency()
        .then(result => {
            this.currencycode = result;
        }).catch(error => {
            console.log("error==>", error);
        })
    }

    fetchCOList() {
        getCoData({ RecId: this.budgetId})
        .then(result => {
            if (result) {
                this.coRecordList = result.length > 0 ? result : null;
                console.log("this.coRecordList==>", this.coRecordList);
                this.isLoading = false;
            }
        }).catch(error => {
            this.isLoading = false;
            console.log("error==>", error);
        })
    }
    checkAllChangeOrder(event) {
        console.log(1);
        this.selectedCO = [];
        let checked = event.target.checked;
        this.coRecordList.forEach(item => {
            if (checked) {
                this.selectedCO.push({Id: item.Id});
                item.Selected = true;
            } else {
                item.Selected = false;
            }
        });
    }

    checkChangeOrder(event) {
        let checked = event.target.checked;
        if (checked) {
            console.log("event.target==>", event.target);
            console.log("event.target.Id==>", event.target.dataset.id);
            this.selectedCO.push({Id: event.target.dataset.id});
        } else {
            this.selectedCO.splice(this.selectedCO.findIndex(item => item.Id == event.target.dataset.id), 1);
        }
    }

    UpdateCO() {
        console.log("this.selectedCO==>", this.selectedCO);
        if (this.selectedCO && this.selectedCO.length > 0) {
            this.isLoading = true;
            if (this.budgetLineId != '') {
                addChangeOrdertoBudget({ selectedRecords: [this.budgetLineId], selectedCO: this.selectedCO, recId: this.budgetId})
                .then(result => {
                    this.isLoading = false;
                    this.dispatchEvent(new CustomEvent('close', { detail: { refresh: true } }));
                }).catch(error => {
                    this.isLoading = false;
                    console.log("error==>", error);
                })
            } else {
                addChangeOrdertoBudgetonly({ selectedCO: this.selectedCO, recId: this.budgetId})
                .then(result => {
                    this.isLoading = false;
                    this.dispatchEvent(new CustomEvent('close', { detail: { refresh: true } }));
                }).catch(error => {
                    this.isLoading = false;
                    console.log("error==>", error);
                })
            }
        } else {
            this.showToast('Error', 'Please Select CO First', 'error');
        }
    }

    closeAddCO(event) {
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