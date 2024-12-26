import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCreditMemos from "@salesforce/apex/BudgetDAO.getCreditMemos";
import addCreditMemoToBudget from "@salesforce/apex/BudgetDAO.addCreditMemoToBudget";
import getcurrency from "@salesforce/apex/BudgetDAO.getcurrency";

export default class AddCreditMemoFromBudget extends LightningElement {
    @api budgetId;
    @api budgetLineList = [];

    @track budgetLineId = '';
    @track cmRecordList = [];
    @track selectedCM = [];
    @track currencycode = 'USD';

    @track isLoading = false;

    get allSelected() {
        return this.cmRecordList && this.cmRecordList.length > 0 && this.selectedCM.length === this.cmRecordList.length;
    }

    get showEmptyState() {
        console.log("this.cmRecordList==>", this.cmRecordList);
        return this.cmRecordList && this.cmRecordList.length === 0;
    }

    connectedCallback() {
        this.isLoading = true;
        if (this.budgetLineList.length > 0) {
            this.budgetLineId = this.budgetLineList[0].Id;
        }
        this.getCurrency();
        this.fetchCMList();
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

    fetchCMList() {
        getCreditMemos({RecId: this.budgetId})
        .then(result => {
            this.cmRecordList = result;
            if (this.cmRecordList.length > 0) {
                this.cmRecordList.forEach((memo, index) => {
                    memo.orderNumber = index + 1;
                });
            }
            this.isLoading = false;
        }).catch(error => {
            console.log("error==>", error);
            this.isLoading = false;
        })
    }
    checkAllCreditMemo(event) {
        this.selectedCM = [];
        let checked = event.target.checked;
        this.cmRecordList.forEach(item => {
            if (checked) {
                this.selectedCM.push({Id: item.Id});
                item.Selected = true;
            } else {
                item.Selected = false;
            }
        });
    }

    checkCreditMemo(event) {
        let checked = event.target.checked;
        if (checked) {
            this.selectedCM.push({Id: event.target.dataset.id});
        } else {
            this.selectedCM.splice(this.selectedCM.findIndex(item => item.Id == event.target.dataset.id), 1);
        }
    }

    UpdateCM() {
        if (this.selectedCM && this.selectedCM.length > 0) {
            this.isLoading = true;
            addCreditMemoToBudget({ selectedCM: this.selectedCM, recId: this.budgetId})
            .then(result => {
                this.isLoading = false;
                if (result == 'Success') {
                    this.dispatchEvent(new CustomEvent('close', { detail: { refresh: true } }));
                }
            }).catch(error => {
                this.isLoading = false;
                console.log("error==>", error);
            })
        } else {
            this.showToast('Error', 'Please Select Credit Memo First', 'error');
        }
    }

    closeAddCM(event) {
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