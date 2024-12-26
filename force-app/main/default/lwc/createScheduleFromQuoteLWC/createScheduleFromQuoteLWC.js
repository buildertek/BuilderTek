import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { EnclosingTabId, getTabInfo, openSubtab } from 'lightning/platformWorkspaceApi';
import createScheduleLine from '@salesforce/apex/CreateScheduleFromQuoteController.createScheduleLineNew';
import getQuoteProject from '@salesforce/apex/CreateScheduleFromQuoteController.getQuoteProject';

export default class CreateScheduleFromQuoteLWC extends LightningElement {
    @api quoteId; // Passed record ID
    @api quoteLineList; // Passed quote line data
    @track quoteLineIds = [];
    @track isLoading = false;
    @track isDisabled = false;
    scheduleId;
    @track project;
    @wire(EnclosingTabId) tabId;

    connectedCallback(){
        console.log('in child');
        console.log(this.quoteId);
        if(this.quoteId){
            this.isLoading = true;
            getQuoteProject({ quoteId: this.quoteId })
            .then(result => {
                if(result != null){
                    console.log(result);
                    this.project = result;
                }
            })
            this.isLoading = false;
        }
        console.log(this.quoteLineList);
        this.quoteLineIds = this.quoteLineList.map(item => item.Id);
        console.log(this.quoteLineIds);
    }

    handleSubmit(event){
        event.preventDefault();
        this.isLoading = true;
        const fields = event.detail.fields;
        console.log({fields});
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleSuccess(event){
        this.scheduleId = event.detail.id;
        console.log(this.scheduleId);

        createScheduleLine({scheduleId: this.scheduleId, quoteLineIds: this.quoteLineIds})
        .then(result => {
            console.log(result);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Schedule created successfully',
                variant: 'success'
            }));
            this.dispatchEvent(new CustomEvent('close', { detail: { refresh: true } }));
            this.handleNavigate(this.scheduleId);
            this.isLoading = false;
        })
        .catch(error => {
            console.log(error);
            const evt = new ShowToastEvent({
                title: 'Error',
                message: error,
                variant: 'error'
            });
            this.dispatchEvent(evt);
            this.isLoading = false;
        });
    }

    async handleNavigate(schId) {
        if (!this.tabId) {
          return;
        }
    
        const tabInfo = await getTabInfo(this.tabId);
        const primaryTabId = tabInfo.isSubtab ? tabInfo.parentTabId : tabInfo.tabId;
    
        // Open a record as a subtab of the current tab
        await openSubtab(primaryTabId, { recordId: schId, focus: true });
      }

    closeModal() {
        this.dispatchEvent(new CustomEvent('close', { detail: { refresh: false } }));
    }
}