import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import attachPdfToRecord from '@salesforce/apex/Preview_Checklist_Answer_Controller.attachPdfToRecord';


export default class Preview_Checklist_Answer_Lwc extends LightningElement {

    @api checkListResId;

    get vfPageUrl() {
        return `/apex/html2pdfOperation?recordId=${this.checkListResId}`;
    }

    connectedCallback() {
        console.log('connectedCallback');
        console.log('checkListResId ', this.checkListResId);
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    handleMessage(event) {

        if (event.data.type === 'pdfData') {
            const pdfBase64 = event.data.data;
            attachPdfToRecord({ recordId: this.checkListResId, base64Pdf: pdfBase64 })
                .then(() => {
                    console.log('PDF successfully attached to record.');
                    this.showToast('Success', 'PDF successfully attached to record.', 'success');
                })
                .catch(error => {
                    console.error('Error attaching PDF:', error);
                    const { errorMessage } = this.returnErrorMsg(error);
                    this.showToast('Error', errorMessage, 'error');
                })
                .finally( () => {
                    const event = new CustomEvent('closeaction');
                    this.dispatchEvent(event);
                });
        }
    }

    returnErrorMsg(error) {
        console.log('An error occurred:', error);

        let errorMessage = 'Unknown error';
        if (error?.body?.message) {
            errorMessage = error.body.message;
        } else if (error?.body?.pageErrors?.[0]?.message) {
            errorMessage = error.body.pageErrors[0].message;
        } else if (error?.message) {
            errorMessage = error.message;
        }

        return { errorMessage, errorObject: error };
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}