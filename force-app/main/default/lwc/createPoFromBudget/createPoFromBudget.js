import {api, track, wire, LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { EnclosingTabId, getTabInfo, openSubtab } from 'lightning/platformWorkspaceApi';
import createPOs from '@salesforce/apex/CreatePOFromBudgetController.createPOs';
import checkIfPOExists from '@salesforce/apex/CreatePOFromBudgetController.checkIfPOExists';

export default class CreatePoFromBudget extends LightningElement {
    @api budgetId;
    @api budgetLineList = [];
    @track isLoading = false;

    @wire(EnclosingTabId) tabId;

    connectedCallback(){
        this.checkIfPOExists();
    }

    checkIfPOExists(){
        this.isLoading = true;
        checkIfPOExists({
            budgetLineList: JSON.stringify(this.budgetLineList)        
        }).then(response => {
            console.log(response);
            if(response == 'No PO lines found for the provided budget lines.'){
                this.createPOs();
            } else {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    // message: 'Purchase Order already exists for selected these budget lines \"'+ response + '\" Please select different budget line.',
                    message: 'One of the lines you chose has already been assigned to a Purchase Order. Please select different budget lines.',
                    variant: 'error'
                }));
                this.isLoading = false;
                this.dispatchEvent(new CustomEvent('close', { detail: { refresh: false } }));
            }
        }).catch(error => {
            console.log(error);
            this.isLoading = false;
        })
    }

    createPOs(){
        this.isLoading = true;
        console.log(this.budgetLineList);
        console.log(this.budgetId);
        createPOs({
            budgetId: this.budgetId,
            budgetLineList: JSON.stringify(this.budgetLineList)
        }).then( async response => {
            console.log(response);
            if(response.length == 18){
                const tabInfo = await getTabInfo(this.tabId);
                const primaryTabId = tabInfo.isSubtab ? tabInfo.parentTabId : tabInfo.tabId;
                await openSubtab(primaryTabId, { recordId: response, focus: true });
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Purchase Order created successfully',
                    variant: 'success'
                }));
                this.closeModal();
            } else{
                console.log({response});
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: 'Something went wrong.',
                    variant: 'error'
                }));
            }
        }).catch(error=>{
            console.log(error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error,
                variant: 'error'
            }));
        }).finally(()=>{
            this.isLoading = false;
        });
    }

    closeModal() {
        this.dispatchEvent(new CustomEvent('close', { detail: { refresh: true } }));
    }
}