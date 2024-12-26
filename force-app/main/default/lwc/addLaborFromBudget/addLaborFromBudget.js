import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateTimeCardLaborPrice from '@salesforce/apex/AddLaborControllerOnBudget.updateTimeCards';
import updateTimeSheetEntryLaborPrice from '@salesforce/apex/AddLaborControllerOnBudget.updateTimeSheetEntry';
import getTimeCardAndTimeSheetEntryData from '@salesforce/apex/AddLaborControllerOnBudget.getTimeCardAndTimeSheetEntryData';
import getcurrency from '@salesforce/apex/BudgetDAO.getcurrency';

export default class AddLaborFromBudget extends LightningElement {
    @track isLoading;
    @track orgCurrency;
    @track selectedOption = 'Time Card';
    @track initialScreen = true;
    @track showTC = false;
    @track showTSE = false;
    @track timeCardList;
    @track timesheetEntryList;
    @track selectedRows = [];
    @api budgetId;
    @api budgetLineList = [];
    budgetLineId;

    get availableOptions() {
        return [
            { label: 'Time Card', value: 'Time Card' },
            { label: 'Time Sheet Entry', value: 'Time Sheet Entry' },
        ];
    }

    connectedCallback() {
        this.budgetLineId = this.budgetLineList[0]?.Id;
        this.fetchPOData();
        this.getOrgCurrency();
    }

    // Error handling function
    returnErrorMsg(error) {
        console.error('An error occurred:', error);

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

    getOrgCurrency() {
        getcurrency()
            .then(result => {
                if (result) {
                    this.orgCurrency = result;
                }
            })
            .catch(error => {
                console.error('Error in fetching currency data', error);
                this.showToast('Error', 'Error in fetching currency data', 'error');
            });
    }

    handleOptionChange(event) {
        this.selectedOption = event.detail.value;
    }

    closeModal() {
        this.showTC = false;
        this.showTSE = false;
        this.dispatchEvent(new CustomEvent('close', { detail: { refresh: false } }));
    }

    nextModal() {
        if (this.selectedOption === 'Time Card') {
            this.showTC = true;
            this.showTSE = false;
        } else {
            this.showTC = false;
            this.showTSE = true;
        }
        this.initialScreen = false;
    }

    fetchPOData() {
        this.isLoading = true;

        getTimeCardAndTimeSheetEntryData({ RecId: this.budgetId })
            .then(result => {
                if (result) {
                    console.log('result of getTimeCardData ', result);
                    this.timeCardList = result.timeCardList.length > 0 ? result.timeCardList : undefined;
                    this.timesheetEntryList = result.timesheetEntryList.length > 0 ? result.timesheetEntryList : undefined;
                }
            })
            .catch(error => {
                console.error('Error in fetching Labor data', error);
                this.showToast('Error', 'Error in fetching Labor data', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    backtoChoosePoAndPoLine() {
        this.initialScreen = true;
        this.showTC = false;
        this.showTSE = false;
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

    handleCheckboxClick(event) {
        const recordId = event.target.dataset.id;
        if (event.target.checked) {
            this.selectedRows.push({ Id: recordId });
        } else {
            this.selectedRows = this.selectedRows.filter(record => record.Id !== recordId);
        }
    }

    UpdateTCandTSE(event) {
        if (this.selectedRows.length === 0) {
            console.error('No selected rows');
            this.showToast('Error', 'Please select atleast one row.', 'error');
            return;
        }
        this.isLoading = true;
        if (event.target.dataset.name === 'TC') {
            let timeCardList = this.selectedRows;
            timeCardList.forEach(element => {
                element.buildertek__Budget__c = this.budgetId;
                element.buildertek__Budget_Line__c = this.budgetLineId;
            });        

            updateTimeCardLaborPrice({ timeCardList: timeCardList })
                .then(() => {
                    this.showToast('Success', 'Time Card added successfully', 'success');
                    this.dispatchEvent(new CustomEvent('close', { detail: { refresh: true } }));
                })
                .catch(error => {
                    const { errorMessage, errorObject } = this.returnErrorMsg(error);
                    console.error('Error in updating Time Card:', errorObject);
                    this.showToast('Error', `Error in updating time card : ${errorMessage}`, 'error');
                })
                .finally(() => {
                    this.isLoading = false;
                });
        } else {
            let timesheetEntryList = this.selectedRows;
            timesheetEntryList.forEach(element => {
                element.buildertek__BT_Budget__c = this.budgetId;
                element.buildertek__BT_Budget_Line__c = this.budgetLineId;
            });

            console.log('timesheetEntryList ',JSON.parse(JSON.stringify(timesheetEntryList)));

            updateTimeSheetEntryLaborPrice({ timeSheetEntryList: timesheetEntryList })
                .then(() => {
                    this.showToast('Success', 'Timesheet Entry added successfully', 'success');
                    this.dispatchEvent(new CustomEvent('close', { detail: { refresh: true } }));
                })
                .catch(error => {
                    const { errorMessage, errorObject } = this.returnErrorMsg(error);
                    console.error('Error in updating Timesheet Entry:', errorObject);
                    this.showToast('Error', `Error in updating time sheet entry : ${errorMessage}`, 'error');
                })
                .finally(() => {
                    this.isLoading = false;
                });
        }
    }
}