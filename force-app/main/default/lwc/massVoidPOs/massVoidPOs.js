import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { setTabLabel, getFocusedTabInfo, setTabIcon } from "lightning/platformWorkspaceApi";
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPurchaseOrders from '@salesforce/apex/massVoidPOController.getPurchaseOrders';
import createVoidPOs from '@salesforce/apex/massVoidPOController.createVoidPOs';
import getOrgCurrency from '@salesforce/apex/massVoidPOController.getOrgCurrency';
export default class MassVoidPOs extends NavigationMixin(LightningElement) {

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

    // Void PO Modal
    @track showTextAreaModal = false;
    @track voidReason = '';

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

    @wire(getPurchaseOrders, { 
        poNumberSearch: '$pONumberSearch', 
        projectSearch: '$projectSearch', 
        vendorSearch: '$vendorSearch', 
        costCodeSearch: '$costCodeSearch',
        descriptionSearch: '$descriptionSearch'
    })
    wiredPurchaseOrders(result) {
        this.currentPage = 1;
        this.wiredPOResult = result;
        const { data, error } = result;
        this.isLoading = true;
        if (data) {
            this.poData = data.map((po, index) => ({
                rowNumber: this.startIndex + index,
                id: po.Id,
                name: po.Name,
                projectName: po.buildertek__Project__c ? po.buildertek__Project__r.Name : '',
                vendorName: po.buildertek__Vendor__c ? po.buildertek__Vendor__r.Name : '',
                costCodeDescription: po.buildertek__Cost_Code__c ? po.buildertek__Cost_Code__r.buildertek__Cost_Code_Name__c : '',
                status: po.buildertek__Status__c,
                description: po.buildertek__Description__c ? po.buildertek__Description__c : '',
                statusClass: `status-pill status-${po.buildertek__Status__c.toLowerCase()}`,
                total: po.buildertek__PO_Total__c,
                isSelected: false,
            }));
            this.updateShownData();
        } else if (error) {
            console.error('Error fetching purchase orders:', error);
        }
        this.isLoading = false;
    }

    connectedCallback() {
        this.fetchCurrency();
        getFocusedTabInfo().then((tabInfo) => {
            setTabLabel(tabInfo.tabId, "Mass Void PO");
            setTabIcon(tabInfo.tabId, "custom:custom55");
        });
    }

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
                isSelected: this.selectedPOs.includes(po.id)
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

    handleVoidPOs() {
        console.log('Selected POs:', JSON.parse(JSON.stringify(this.selectedPOs)));
        if (this.selectedPOs.length == 0) {
            this.showToast('error', 'Please select at least one PO to void', 'Error');
        } else {
            this.showTextAreaModal = true;
        }
    }

    handleCloseModal() {
        this.showTextAreaModal = false;
        this.voidReason = '';
    }

    handleVoidReasonSubmit() {
        if (this.voidReason == '' || this.voidReason == null) {
            this.showToast('error', 'Please enter void reason', 'Error');
            return;
        }
        this.isLoading = true;
        createVoidPOs({ recordIds: this.selectedPOs, voidReason: this.voidReason })
            .then(() => {
                this.showToast('success', 'PO(s) voided successfully', 'Success');
                this.refreshView();
            })
            .catch((error) => {
                console.error('Error voiding PO(s):', error);
                this.showToast('error', error.message, 'Error');
            })
            .finally(() => {
                this.handleCloseModal();
                this.isLoading = false;
                this.allSelected = false;
            });
    }

    handleVoidReasonTextAreaChange(event) {
        this.voidReason = event.target.value;
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