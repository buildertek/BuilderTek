import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { setTabLabel, getFocusedTabInfo, setTabIcon, IsConsoleNavigation, refreshTab } from "lightning/platformWorkspaceApi";
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// import getPurchaseOrders from '@salesforce/apex/MassManagePOsController.getPurchaseOrders';
import getPurchaseOrders from '@salesforce/apex/viewPOsController.getPurchaseOrdersd';
import getOrgCurrency from '@salesforce/apex/MassManagePOsController.getOrgCurrency';
import getPicklistValues from '@salesforce/apex/viewPOsController.getPicklistValues';
import getPOLineItems from '@salesforce/apex/viewPOsController.getPOLineItems';

export default class ViewPOs extends NavigationMixin(LightningElement) {

    @track pONumberSearch = '';
    @track projectSearch = '';
    @track vendorSearch = '';
    @track costCodeSearch = '';
    @track statusSearch = 'Open';
    @track descriptionSearch = '';

    // PO Data
    @track poData = [];
    @track shownpoData = [];
    @track searchTerm = '';
    @track selectedPOs = [];
    @track isLoading = false;
    @track selectedPOForUpdate = [];
    @track statusOptions = [];

    // PO Modal
    @track showPopUpModal = false;
    @track poList = [];

    // Pagination
    @track isPrevDisabled = true;
    @track isNextDisabled = false;
    @track pageNumber = 1;
    @track pageSize = 50;
    @track currentPage = 1;
    @track visiblePages = 3;

    // Org Currency
    @track orgCurrency;
    @track allSelected = false;
    @track expandedRows = new Set();
    @track poLineItems = {};

    async handleRowToggle(event) {
        const poId = event.currentTarget.dataset.id;
        
        // Toggle the row's expanded state
        if (this.expandedRows.has(poId)) {
            this.expandedRows.delete(poId);
        } else {
            // Add the current row to expanded rows
            this.expandedRows.add(poId);
            
            // Fetch PO lines if not already fetched
            if (!this.poLineItems[poId]) {
                try {
                    this.isLoading = true;
                    const result = await getPOLineItems({ purchaseOrderId: poId });
                    this.poLineItems = {
                        ...this.poLineItems,
                        [poId]: result
                    };
                } catch (error) {
                    console.error('Error fetching PO lines:', error);
                    this.showToast('error', 'Error loading PO line items', 'Error');
                } finally {
                    this.isLoading = false;
                }
            }
        }

        // Update the shown data to reflect expansion state
        this.updateShownData();
    }

    navigateToLineItem(event) {
        event.preventDefault();
        const recordId = event.target.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }


    // Getter to check if a specific row is expanded
    isRowExpanded(poId) {
        return this.expandedRows.has(poId);
    }

    get totalItems() {
        return this.poData.length;
    }

    get totalPages() {
        return Math.ceil(this.totalItems / this.pageSize);
    }

    get showEllipsis() {
        return Math.ceil(this.totalItems / this.pageSize) > this.visiblePages;
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === Math.ceil(this.totalItems / this.pageSize);
    }

    get startIndex() {
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    get endIndex() {
        return Math.min(this.currentPage * this.pageSize, this.totalItems);
    }

    get pageNumbers() {
        try {
            const totalPages = this.totalPages;
            const currentPage = this.currentPage;
            const visiblePages = this.visiblePages;

            let pages = [];

            if (totalPages <= visiblePages) {
                // If the total pages are less than or equal to the visible pages, show all
                for (let i = 1; i <= totalPages; i++) {
                    pages.push({
                        number: i,
                        isEllipsis: false,
                        className: `pagination-button ${i === currentPage ? 'active' : ''}`
                    });
                }
            } else {
                // Always show the first page
                pages.push({
                    number: 1,
                    isEllipsis: false,
                    className: `pagination-button ${currentPage === 1 ? 'active' : ''}`
                });

                if (currentPage > 3) {
                    // Show ellipsis if the current page is greater than 3
                    pages.push({ isEllipsis: true });
                }

                // Show the middle pages
                let start = Math.max(2, currentPage - 1);
                let end = Math.min(currentPage + 1, totalPages - 1);

                for (let i = start; i <= end; i++) {
                    pages.push({
                        number: i,
                        isEllipsis: false,
                        className: `pagination-button ${i === currentPage ? 'active' : ''}`
                    });
                }

                if (currentPage < totalPages - 2) {
                    // Show ellipsis if the current page is less than totalPages - 2
                    pages.push({ isEllipsis: true });
                }

                // Always show the last page
                pages.push({
                    number: totalPages,
                    isEllipsis: false,
                    className: `pagination-button ${currentPage === totalPages ? 'active' : ''}`
                });
            }

            return pages;
        } catch (error) {
            console.log('Error pageNumbers->' + error);
            return null;
        }
    }

    getStatusColor(status) {
        // Create a hash of the status string
        let hash = 0;
        for (let i = 0; i < status.length; i++) {
            hash = status.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Generate HSL color with consistent saturation and lightness
        // Using HSL ensures readable, visually distinct colors
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 70%, 35%)`; // 70% saturation, 35% lightness for good contrast
    }

    @wire(getPurchaseOrders, { 
        poNumberSearch: '$pONumberSearch', 
        projectSearch: '$projectSearch', 
        vendorSearch: '$vendorSearch', 
        costCodeSearch: '$costCodeSearch',
        statusSearch: '$statusSearch',
        descriptionSearch: '$descriptionSearch'
    })
    wiredPurchaseOrders(result) {
        this.currentPage = 1;
        this.wiredPOResult = result;
        const { data, error } = result;
        this.isLoading = true;
        if (data) {
            console.log('Data:', data);
            this.poData = data.map((po, index) => ({
                rowNumber: this.startIndex + index,
                id: po.Id,
                name: po.Name,
                projectName: po.buildertek__Project__c ? po.buildertek__Project__r.Name : '',
                vendorName: po.buildertek__Vendor__c ? po.buildertek__Vendor__r.Name : '',
                costCodeDescription: po.buildertek__Cost_Code__c ? po.buildertek__Cost_Code__r.buildertek__Cost_Code_Name__c : '',
                description: po.buildertek__Description__c ? po.buildertek__Description__c : '',
                status: po.buildertek__Status__c,
                statusStyle: `background-color: ${this.getStatusColor(po.buildertek__Status__c)}`,
                statusClass: 'status-pill', // Only use the base class
                total: po.buildertek__PO_Total__c,
                isSelected: false,
            }));
            this.updateShownData();
        } else if (error) {
            console.error('Error fetching purchase orders:', error);
        }
        this.isLoading = false;
    }

    // New search handler methods
    handlePONumberSearch(event) {
        this.pONumberSearch = event.target.value;
    }

    handleProjectSearch(event) {
        this.projectSearch = event.target.value;
        console.log('Project Search:', this.projectSearch);
    }

    handleVendorSearch(event) {
        this.vendorSearch = event.target.value;
    }

    handleCostCodeSearch(event) {
        this.costCodeSearch = event.target.value;
    }

    handleStatusSearch(event) {
        this.statusSearch = event.target.value;
    }

    handleDescriptionSearch(event) {
        this.descriptionSearch = event.target.value;
    }

    @wire(IsConsoleNavigation) isConsoleNavigation;

    connectedCallback() {
        this.fetchPicklistValues();
        this.fetchCurrency();
        getFocusedTabInfo().then((tabInfo) => {
            setTabLabel(tabInfo.tabId, "View POs");
            setTabIcon(tabInfo.tabId, "custom:custom55");
        });
    }

    fetchPicklistValues() {
        getPicklistValues({ objectApiName: 'buildertek__Purchase_Order__c', fieldApiName: 'buildertek__Status__c' })
            .then(result => {
                console.log('Picklist Values:', result);
                this.statusOptions = result;
                this.statusOptions.unshift({ label: 'All', value: '' });
            })
            .catch(error => {
                console.error('Error fetching picklist values:', error);
            }
        );
    }

    fetchCurrency() {
        getOrgCurrency().then((data) => {
            this.orgCurrency = data;
        });
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
    }

    updateShownData() {
        try {
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
            this.shownpoData = this.poData.slice(startIndex, endIndex).map(po => ({
                ...po,
                isExpanded: this.expandedRows.has(po.id),
                iconClass: this.expandedRows.has(po.id) ? 'expanded' : 'collapsed',
                rowClass: this.expandedRows.has(po.id) ? 'expanded-row' : '', 
                lineItems: this.expandedRows.has(po.id) ? this.poLineItems[po.id] : [],
                lineItemsKey: `${po.id}-items` // Add this line to create a unique key for line items row

            }));
        } catch (error) {
            console.log('Error updateShownData->' + error);
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateShownData();
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updateShownData();
        }
    }

    handlePageChange(event) {
        const selectedPage = parseInt(event.target.getAttribute('data-id'), 10);
        if (selectedPage !== this.currentPage) {
            this.currentPage = selectedPage;
            this.updateShownData();
        }
    }

    handleCheckboxChange(event) {
        const poId = event.target.dataset.id;
        const checked = event.target.checked;
        
        this.shownpoData = this.shownpoData.map(po => 
            po.id === poId ? { ...po, isSelected: checked } : po
        );

        if (checked) {
            this.selectedPOs.push(poId);
        } else {
            this.selectedPOs = this.selectedPOs.filter(id => id !== poId);
        }

        // Update allSelected based on whether all checkboxes are checked
        this.allSelected = this.shownpoData.every(po => po.isSelected);

        // Update the "check all" checkbox in the UI
        const checkAllCheckbox = this.template.querySelector('lightning-input[data-id="checkAll"]');
        if (checkAllCheckbox) {
            checkAllCheckbox.checked = this.allSelected;
        }
    }

    showToast(variant, message, title) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }

    handlePOs() {
        console.log('Selected POs:', JSON.parse(JSON.stringify(this.selectedPOs)));
        if (this.selectedPOs.length == 0) {
            this.showToast('error', 'Please select at least one PO to update', 'Error');
        } else {
            // Replace modal logic with a work in progress toast
            this.showToast('warning', 'Unit Cost Update is currently in development. This feature will be available soon.', 'Work in Progress');
        }
    }

    async refreshTab() {
        this.selectedPOs = [];
        this.selectedPOForUpdate = [];
        this.poList = [];
        if (!this.isConsoleNavigation) {
            return;
        }
        const { tabId } = await getFocusedTabInfo();
        await refreshTab(tabId, {
            includeAllSubtabs: true
        });
    }

    refreshView() {
        return refreshApex(this.wiredPOResult).then(() => {
            this.selectedPOs = [];
            this.currentPage = 1;
            this.updateShownData();
        });
    }

    navigateToPO(event) {
        event.preventDefault();
        const recordId = event.target.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }

    handleSelectAll(event) {
        this.allSelected = event.target.checked;
        this.shownpoData = this.shownpoData.map(po => ({
            ...po,
            isSelected: this.allSelected
        }));
        this.selectedPOs = this.allSelected ? this.shownpoData.map(po => po.id) : [];
    }


}