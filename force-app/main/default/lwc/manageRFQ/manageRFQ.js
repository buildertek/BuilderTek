import { LightningElement, track, api } from 'lwc';
import { setTabLabel, getFocusedTabInfo, setTabIcon } from "lightning/platformWorkspaceApi";

export default class ManageRFQ extends LightningElement {

    @track showEmailRFQs = true;

    connectedCallback() {
        getFocusedTabInfo().then((tabInfo) => {
            setTabLabel(tabInfo.tabId, "Manage RFQ");
            setTabIcon(tabInfo.tabId, "standard:order");
        });
    }

    switchTab(event) {
        const selectedTabId = event.currentTarget.dataset.id;
        console.log(selectedTabId);
        
        this.template.querySelectorAll('.tab-button').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.id === selectedTabId);
        });

        
    }

}