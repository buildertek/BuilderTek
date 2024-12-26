import { LightningElement,track,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createRecordsFromCSV from '@salesforce/apex/csvUploaderController.createRecordsFromCSV';

export default class Assesment_task extends LightningElement {
    @track uploadedFiles;
    @api recordId;

    handleUploadFinished(event) {
        this.uploadedFiles = event.detail.files;
        console.log(this.recordId);
    }

    createRecords() {
        if (this.uploadedFiles.length > 0) {
            const fileId = this.uploadedFiles[0].documentId;
            createRecordsFromCSV({ fileId:fileId, recordId:this.recordId })
                .then(result => {
                    const toastEvent = new ShowToastEvent({
                        title: 'Success',
                        message: 'Records are being processed in background.',
                        variant: 'success'
                    });
                    console.log('Records inserted.');
                    this.dispatchEvent(toastEvent);
                })
                .catch(error => {
                    const toastEvent = new ShowToastEvent({
                        title: 'Error',
                        message: `An error occurred while creating records ->  ${error}`,
                        variant: 'error'
                    });
                    this.dispatchEvent(toastEvent);
                });
        }
    }
}