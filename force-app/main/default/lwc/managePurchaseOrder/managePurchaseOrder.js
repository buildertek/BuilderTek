import { LightningElement, track, api } from 'lwc';
import { setTabLabel, getFocusedTabInfo, setTabIcon } from "lightning/platformWorkspaceApi";

export default class ManagePurchaseOrder extends LightningElement {
    @track showMassVoidPOs = false;
    @track showPOManage = false;
    @track showEmailPOs = false;
    @track viewPO = true;

    connectedCallback() {
        getFocusedTabInfo().then((tabInfo) => {
            setTabLabel(tabInfo.tabId, "Manage Purchase Order");
            setTabIcon(tabInfo.tabId, "standard:order");
        });
    }

    switchTab(event) {
        const selectedTabId = event.currentTarget.dataset.id;
        console.log(selectedTabId);
        
        this.template.querySelectorAll('.tab-button').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.id === selectedTabId);
        });

        this.showPOManage = selectedTabId === 'manage-po';
        this.showMassVoidPOs = selectedTabId === 'mass-void-po';
        this.showEmailPOs = selectedTabId === 'email-po';
        this.viewPO = selectedTabId === 'view-po';
    }
}