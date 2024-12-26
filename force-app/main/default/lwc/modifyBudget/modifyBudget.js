import { LightningElement, track, api } from 'lwc';
import fetchBudgetModification from '@salesforce/apex/BudgetPage.fetchBudgetModification';
import fetchBudgetLine from '@salesforce/apex/BudgetPage.fetchBudgetLine';
import createBudgetModificationDetails from '@salesforce/apex/BudgetPage.createBudgetModificationDetails';
import getcurrency from '@salesforce/apex/BudgetDAO.getcurrency';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ModifyBudget extends LightningElement {

    @api budgetId;

    @track isLoading = false;
    @track isInitialScreen = true;
    @track selectedOption = 'selectExistingBudgetModification';
    @track budgetModificationSheets;
    @track showExistingBudgetModification = false;
    @track showCreateNewBudgetModification = false;
    @track isShowBMSTable = false;
    @track selectedBMSId;
    @track orgCurrency;
    @track budgetLineList = [];
    @track nonZeroAllowableModificationList = [];
    @track zeroAllowableModificationList = [];
    @track budgetLineOptions = [];
    @track nonZeroAllowableModificationOptions = [];
    @track budgetModificationLines = [];
    @track baseToOptions = [];
    @track baseFromOptions = [];

    get availableOptions() {
        return [
            { label: 'Select an Existing Budget Modification Sheet', value: 'selectExistingBudgetModification' },
            { label: 'Create a New Budget Modification Sheet', value: 'createNewBudgetModification' }
        ];
    }

    connectedCallback() {
        this.getOrgCurrency();
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
        this.selectedOption = event.target.value;
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('close', { detail: { refresh: false } }));
    }

    handleNext() {
        this.isInitialScreen = false;
        if (this.selectedOption === 'selectExistingBudgetModification') {
            this.showExistingBudgetModification = true;
            this.getExistingBudgetModification();
        } else if (this.selectedOption === 'createNewBudgetModification') {
            this.showCreateNewBudgetModification = true;
        }
    }

    getExistingBudgetModification() {
        this.isLoading = true;
        fetchBudgetModification({ budgetId: this.budgetId })
            .then(result => {
                if (result) {
                    result.forEach(record => {
                        record.Account = record.buildertek__Account__c ? record.buildertek__Account__r.Name : '';
                        record.Approver = record.buildertek__Approver__c ? record.buildertek__Approver__r.Name : '';
                    });
                }
                this.budgetModificationSheets = result.length > 0 ? result : undefined;
            })
            .catch(error => {
                this.returnErrorMsg(error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleRadioClick(event) {
        this.selectedBMSId = event.target.dataset.id;
    }

    backtoChooseOption() {
        this.isInitialScreen = true;
        this.showExistingBudgetModification = false;
        this.showCreateNewBudgetModification = false;
    }

    showBMSTable() {
        if (this.selectedBMSId) {
            this.showExistingBudgetModification = false;
            this.showCreateNewBudgetModification = false;
            this.getBudgetLineDetails();
            this.isShowBMSTable = true;
        } else {
            this.showToast('Error', 'Please select a Budget Modification Sheet', 'error');
        }
    }

    generateUniqueKey() {
        return Date.now() + Math.random().toString(36).substring(2);
    }

    getBudgetLineDetails() {
        this.isLoading = true;
        fetchBudgetLine({ budgetId: this.budgetId })
            .then(result => {
                if (result && result.length > 0) {
                    this.budgetLineList = result;

                    // Store base options
                    this.baseToOptions = [
                        { label: '--None--', value: '' },
                        ...result.map(line => ({
                            label: line.Name,
                            value: line.Id
                        }))
                    ];

                    this.baseFromOptions = [
                        { label: '--None--', value: '' },
                        ...result
                            .filter(line => line.buildertek__Allowable_Modification__c > 0)
                            .map(line => ({
                                label: line.Name,
                                value: line.Id
                            }))
                    ];

                    // Initialize with one empty line
                    this.budgetModificationLines = [{
                        key: this.generateUniqueKey(),
                        fromBudgetLine: '',
                        toBudgetLine: '',
                        transferAmount: null,
                        notes: '',
                        fromOptions: this.baseFromOptions,
                        toOptions: this.baseToOptions
                    }];
                }
            })
            .catch(error => {
                console.error('Error fetching budget lines:', error);
                this.showToast('Error', 'Error fetching budget lines', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleNotesChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const value = event.target.value;
        this.budgetModificationLines[index].notes = value;
    }

    createBudgetModificationDetails(event) {
        this.isLoading = true;
        console.log('budgetModificationLines::', this.budgetModificationLines);
        debugger;
        this.budgetModificationLines.forEach(line => {
            if (!line.fromBudgetLine || !line.transferAmount || !line.toBudgetLine) {
                this.showToast('Error', 'From Budget Line, Transfer Amount and To Budget Line are required', 'error');
                return;
            }
            line.BudgetModificationSheetId = this.selectedBMSId;
        });
        console.log('modified budget details::', this.budgetModificationLines);
        createBudgetModificationDetails({ budgetId: this.budgetId, budgetModificationLines: JSON.stringify(this.budgetModificationLines) })
            .then(result => {
                console.log('result::', result);
                this.showToast('Success', 'Budget Modification Sheet created successfully', 'success');
                this.dispatchEvent(new CustomEvent('close', { detail: { refresh: true } }));
            })
            .catch(error => {
                this.returnErrorMsg(error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

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

    handleSuccess(event) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Budget Modification Sheet created successfully',
                variant: 'success'
            })
        );
        this.selectedBMSId = event.detail.id;
        this.showBMSTable();
    }

    handleError(event) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: event.detail.message,
                variant: 'error'
            })
        );
    }

    handleSave() {
        this.template.querySelector('lightning-record-edit-form').submit();
    }

    handleAddLine() {
        this.budgetModificationLines = [
            ...this.budgetModificationLines,
            {
                key: this.generateUniqueKey(),
                fromBudgetLine: '',
                toBudgetLine: '',
                allowableModification: 0,
                transferAmount: null,
                notes: '',
                fromOptions: this.baseFromOptions,
                toOptions: this.baseToOptions
            }
        ];
    }

    handleDeleteLine(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.budgetModificationLines = this.budgetModificationLines.filter((_, i) => i !== index);

        // Add a new line if all lines are deleted
        if (this.budgetModificationLines.length === 0) {
            this.handleAddLine();
        }
    }

    handleBudgetLineChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const field = event.target.dataset.field;
        const value = event.target.value;

        if (index >= 0 && index < this.budgetModificationLines.length) {
            const line = this.budgetModificationLines[index];

            if (field === 'from') {
                line.fromBudgetLine = value;
                
                // Update allowable modification amount
                const selectedLine = this.budgetLineList.find(line => line.Id === value);
                line.allowableModification = selectedLine ? selectedLine.buildertek__Allowable_Modification__c : 0;

                // Reset transfer amount if it exceeds new allowable modification
                if (line.transferAmount > line.allowableModification) {
                    line.transferAmount = null;
                }

                // Update 'to' options to exclude selected 'from' value
                line.toOptions = this.baseToOptions.filter(option => 
                    option.value === '' || option.value !== value
                );
            } else {
                line.toBudgetLine = value;
                
                // Update 'from' options to exclude selected 'to' value
                line.fromOptions = this.baseFromOptions.filter(option => 
                    option.value === '' || option.value !== value
                );
            }

            // Force refresh
            this.budgetModificationLines = [...this.budgetModificationLines];
        }
    }

    handleTransferAmountChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const value = parseFloat(event.target.value);

        if (index >= 0 && index < this.budgetModificationLines.length) {
            const line = this.budgetModificationLines[index];

            // Validate against allowable modification
            if (value > line.allowableModification) {
                this.showToast('Error', 'Transfer amount cannot exceed allowable modification', 'error');
                event.target.value = line.transferAmount || null;
                return;
            }

            line.transferAmount = value;
            this.budgetModificationLines = [...this.budgetModificationLines];
        }
    }
}