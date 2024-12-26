import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { setTabLabel, getFocusedTabInfo, setTabIcon, IsConsoleNavigation, refreshTab } from "lightning/platformWorkspaceApi";
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPurchaseOrders from '@salesforce/apex/MassManagePOsController.getPurchaseOrders';
import getPOLinesDetails from '@salesforce/apex/MassManagePOsController.getPOLinesDetails';
import updateUnitCost from '@salesforce/apex/MassManagePOsController.updateUnitCost';
import getOrgCurrency from '@salesforce/apex/MassManagePOsController.getOrgCurrency';
import getPicklistValues from '@salesforce/apex/viewPOsController.getPicklistValues';

export default class MassManagePOs extends NavigationMixin(LightningElement) {

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
        searchTerm: '$searchTerm',
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
            this.poData = data.map((po, index) => ({
                rowNumber: this.startIndex + index,
                id: po.Id,
                name: po.Name,
                projectName: po.buildertek__Project__c ? po.buildertek__Project__r.Name : '',
                vendorName: po.buildertek__Vendor__c ? po.buildertek__Vendor__r.Name : '',
                costCodeDescription: po.buildertek__Cost_Code__c ? po.buildertek__Cost_Code__r.buildertek__Cost_Code_Name__c : '',
                description: po.buildertek__Description__c ? po.buildertek__Description__c : '',
                status: po.buildertek__Status__c,
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

    @wire(IsConsoleNavigation) isConsoleNavigation;

    connectedCallback() {
        this.fetchPicklistValues();
        this.fetchCurrency();
        getFocusedTabInfo().then((tabInfo) => {
            setTabLabel(tabInfo.tabId, "Update PO Pricing");
            setTabIcon(tabInfo.tabId, "custom:custom55");
        });
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

    handlePOs() {
        console.log('Selected POs:', JSON.parse(JSON.stringify(this.selectedPOs)));
        if (this.selectedPOs.length == 0) {
            this.showToast('error', 'Please select at least one PO to update', 'Error');
        } else {
            this.showPopUpModal = true;
            this.fetchPOLines();
        }
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

    fetchPOLines() {
        this.isLoading = true;
        getPOLinesDetails({ poList: this.selectedPOs })
            .then(result => {
                console.log({result});
                this.poList = [];
                
                result.forEach(poWrapper => {
                    const poObject = {
                        id: poWrapper.poId,
                        label: poWrapper?.poName,
                        description: poWrapper?.poDescription,
                        isOpen: true,
                        isSelected: true, // Add this line
                        iconName: 'utility:chevrondown',
                        poLines: []
                    };

                    poWrapper.poLines.forEach((item, index) => {
                        let oldUnitPrice = (item?.POLineUnitPrice && item?.POLineUnitPrice != null) ? item.POLineUnitPrice : 0.00;
                        let newUnitPrice = 0.00;
                        let options = [];
                        let selectedPricebook = null;

                        let isPriceBookAssociated = (item?.PricebookId && item?.PricebookId != null) ? true : false;
                        if(isPriceBookAssociated){
                            if(item.pricebookEntries.length > 0){
                                let associatedPricebookEntry = item.pricebookEntries.find(entry => entry.PricebookId === item.PricebookId);

                                if (associatedPricebookEntry) {
                                    options.push({
                                        label: associatedPricebookEntry.PricebookName,
                                        value: associatedPricebookEntry.PricebookId
                                    });
                                    selectedPricebook = associatedPricebookEntry.PricebookId;
                                    newUnitPrice = associatedPricebookEntry?.UnitCost ?? 0.00;
                                }
                            }
                        } else{
                            options = item.pricebookEntries.map(entry => {
                                return {
                                    label: entry.PricebookName,
                                    value: entry.PricebookId
                                };
                            });
                            if (options.length > 0) {
                                selectedPricebook = options[0].value;
                                let firstEntry = item.pricebookEntries.find(entry => entry.PricebookId === selectedPricebook);
                                if (firstEntry) {
                                    newUnitPrice = firstEntry?.UnitCost ?? 0.00;
                                }
                            }
                        }

                        let priceDifference = (oldUnitPrice !== newUnitPrice);
                        poObject.poLines.push({
                            id: item.Id,
                            rowNumber: index + 1,
                            poItem: item.Name,
                            newUnitPrice: newUnitPrice,
                            oldUnitPrice: oldUnitPrice,
                            options: options,
                            selectedPricebook: selectedPricebook,
                            pricebookEntries: item.pricebookEntries,
                            rowClass: priceDifference ? 'slds-hint-parent red-text' : 'slds-hint-parent'
                        });
                    });
                    this.poList.push(poObject);
                });

                this.selectedPOForUpdate = this.poList.filter(po => po.isSelected).map(po => po.id);
            })
            .catch(error => {
                console.error('Error fetching PO Lines: ', error);
            })
            .finally(() => {
                this.isLoading = false; 
            });
    }

    handleChange(event) {
        try {
            const selectedValue = event.detail.value; 
            const poLineIndex = event.target.dataset.index; 
            const poIndex = event.target.dataset.poIndex;
        
            this.poList[poIndex].poLines[poLineIndex].selectedPricebook = selectedValue;

            const pricebookEntries = this.poList[poIndex].poLines[poLineIndex].pricebookEntries;
            const selectedPricebookEntry = pricebookEntries.find(
                entry => entry.PricebookId === selectedValue
            );
        
            // If the entry is found, update the newUnitPrice
            if (selectedPricebookEntry) {
                this.poList[poIndex].poLines[poLineIndex].newUnitPrice = selectedPricebookEntry.UnitCost ?? 0.00;
                console.log(`Updated New Unit Cost: ${selectedPricebookEntry.UnitCost}`);
            } else {
                // If no matching entry is found, set the newUnitPrice to 0.00 as a fallback
                this.poList[poIndex].poLines[poLineIndex].newUnitPrice = 0.00;
                console.log('No matching pricebook entry found. Set newUnitPrice to 0.00');
            }

            // Get the oldUnitPrice for comparison
            const oldUnitPrice = this.poList[poIndex].poLines[poLineIndex].oldUnitPrice;
            const newUnitPrice = this.poList[poIndex].poLines[poLineIndex].newUnitPrice;
            const priceDifference = oldUnitPrice !== newUnitPrice;
            this.poList[poIndex].poLines[poLineIndex].rowClass = priceDifference ? 'slds-hint-parent red-text' : 'slds-hint-parent';
        } catch (error) {
            console.log(error);
        }
    }
    
    handleSelectedPOs(event) {
        const poId = event.target.name;
        const checked = event.target.checked;
        const poIndex = this.poList.findIndex(po => po.id === poId);

        if (poIndex !== -1) {
            this.poList[poIndex].isSelected = checked;
            if (checked) {
                this.selectedPOForUpdate.push(poId);
            } else {
                this.selectedPOForUpdate = this.selectedPOForUpdate.filter(id => id !== poId);  // Remove if unchecked
            }
        }
        console.log('Updated Selected PO Ids:', this.selectedPOForUpdate);
    }

    handleUpdatePOUnitCost() {
        console.log('Selected POs for Update:', this.selectedPOForUpdate);
        if (this.selectedPOForUpdate.length == 0) {
            this.showToast('error', 'Please select at least one PO to update', 'Error');
        } else {
            this.isLoading = true;
            const updates = [];
            this.poList.forEach(poRec => {
                if (this.selectedPOForUpdate.includes(poRec.id)) {
                    // Loop through each PO Line
                    poRec.poLines.forEach(pol => {
                        const updateObj = {
                            poLineId: pol.id,
                            oldUnitCost: pol.oldUnitPrice,
                            newUnitCost: pol.newUnitPrice
                        };
                        updates.push(updateObj);
                    });
                }
            });
            console.log({updates});
            // Call the Apex method to update the PO Lines
            if (updates.length > 0) {
                this.isLoading = true;
                updateUnitCost({ poLines: updates })
                    .then(result => {
                        console.log({result});
                        if (result === 'Selected POs are updated successfully') {
                            this.showToast('success', 'POs Updated Successfully', 'Success');
                            this.showPopUpModal = false;
                            this.refreshTab();
                        } else {
                            this.showToast('error', result, 'Error');
                            this.showPopUpModal = false;
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        this.showPopUpModal = false;
                    })
                    .finally(() => {
                        this.isLoading = false;
                        this.allSelected = false;
                    });
            } else {
                console.log('No PO Lines selected for update.');
            }
        }
    }

    handleAccordionToggle(event) {
        try {
            const targetCategory = event.currentTarget.dataset.category;
            const targetDiv = this.template.querySelector(`[data-tablist="${targetCategory}"]`);
            const targetedCate = this.poList.find(ele => ele.id === targetCategory);
            
            targetedCate.isOpen = !targetedCate.isOpen;
            targetedCate.iconName = targetedCate.isOpen ? 'utility:chevronup' : 'utility:chevrondown';
            
            if (targetedCate.isOpen) {
                targetDiv.setAttribute('data-selected', 'true');
            } else {
                targetDiv.setAttribute('data-selected', 'false');
            }
        } catch (error) {
            console.error(`Error in handleAccordionToggle: ${error.message}`);
        }
    }

    handleCloseModal() {
        this.showPopUpModal = false;
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