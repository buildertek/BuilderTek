import { LightningElement, track, api } from 'lwc';

export default class SelectRfqFlowQuoteCmp extends LightningElement {
    @api quoteId;
    pickerValue = 'rfq';
    isOptionSelectScreen = true;
    isNextModalRfq = false;
    isNextModalRfqLines = false;

    get options() {
        return [
            { label: 'RFQ', value: 'rfq' },
            { label: 'RFQ Lines', value: 'rfqlines' },
        ];
    }

    handleChangeInPicker(event){
        this.pickerValue = event.detail.value;
    }

    nextModal(){
        this.isOptionSelectScreen = false;
        if (this.pickerValue === 'rfq') {
            this.isNextModalRfq = true;
        } else if (this.pickerValue === 'rfqlines') {
            this.isNextModalRfqLines = true;
        }
    }

    hideModalBox() {
        this.closeChildScreen(false);
    }

    handleCustomEventForClose(event){
        this.closeChildScreen(event.detail.refresh);
    }

    closeChildScreen(isRefresh) {
        if (isRefresh) {
          this.dispatchEvent(
            new CustomEvent("closechildscreen", { detail: { refresh: true } })
          );
          return;
        }
        this.dispatchEvent(
          new CustomEvent("closechildscreen", { detail: { refresh: false } })
        );
    }
}