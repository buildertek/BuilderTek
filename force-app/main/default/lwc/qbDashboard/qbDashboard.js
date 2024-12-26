import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QbDashboard extends LightningElement {

    @api recordid;
    @track isLoading = true;

    connectedCallback() {
        
    }

}