import { LightningElement, track, api } from 'lwc';
export default class AssetRecordPage extends LightningElement {

    @api recordId;

    connectedCallback() {
        console.log(recordId);
    }

}