import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { setTabLabel, getFocusedTabInfo, setTabIcon} from "lightning/platformWorkspaceApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPurchaseOrders from '@salesforce/apex/massEmailPOController.getPurchaseOrders';
import getOrgCurrency from '@salesforce/apex/massEmailPOController.getOrgCurrency';
import sendEmailWithPOAttachments from '@salesforce/apex/massEmailPOController.sendEmailWithPOAttachments';
import getTemplatesPO from '@salesforce/apex/CreatePDFFromBudget.getTemplatesPO';
import createPoPDFAndStoreInFiles from '@salesforce/apex/CreatePDFFromBudget.createPoPDFAndStoreInFiles';
import createPoPDFsAndStoreInFiles from '@salesforce/apex/massEmailPOController.createPoPDFAndStoreInFiles';
import getPicklistValues from '@salesforce/apex/viewPOsController.getPicklistValues';

export default class MassVoidPOs extends NavigationMixin(LightningElement) {
    @track statusOptions = [];
    @track pONumberSearch = '';
    @track projectSearch = '';
    @track vendorSearch = '';
    @track costCodeSearch = '';
    @track statusSearch = '';
    @track descriptionSearch = '';

    // PO Data
    @track poData = [];
    @track shownpoData = [];
    @track searchTerm = '';
    @track selectedPOs = [];
    @track selectedPOsforPDF = [];
    @track isLoading = false;
    @track posByVendorObj = {};
    @track vendorName = '';
    @track vendorEmail = '';

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

    //Email details
    @track to = [];
    @track cc = [];
    @track showEmailModal = false;
    @track subject = 'Purchase Order';
    @track emailBody = 'Please find attached Purchase Order(s) related to your Account.';

    //PDF details
    @track templateList = [];
    @track selectedTemplateId;
    @track poIdForDownload = '';

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

    handlePONumberSearch(event) {
        this.pONumberSearch = event.target.value;
        this.handleSearch();
    }

    handleProjectSearch(event) {
        this.projectSearch = event.target.value;
        console.log('Project Search:', this.projectSearch);
        this.handleSearch();
    }

    handleVendorSearch(event) {
        this.vendorSearch = event.target.value;
        this.handleSearch();
    }

    handleCostCodeSearch(event) {
        this.costCodeSearch = event.target.value;
        this.handleSearch();
    }

    handleStatusSearch(event) {
        this.statusSearch = event.target.value;
        this.handleSearch();
    }

    handleDescriptionSearch(event) {
        this.descriptionSearch = event.target.value;
        this.handleSearch();
    }

    connectedCallback() {
        this.fetchCurrency();
        this.fetchPurchaseOrders();
        this.fetchPicklistValues();
        getFocusedTabInfo().then((tabInfo) => {
            setTabLabel(tabInfo.tabId, "Email PO");
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

    fetchPurchaseOrders() {
        this.isLoading = true;
        this.selectedPOs = [];
        this.selectedPOsforPDF = [];
        this.currentPage = 1;
        getPurchaseOrders({ 
            pONumber: this.pONumberSearch,
            project: this.projectSearch,
            vendor: this.vendorSearch,
            costCode: this.costCodeSearch,
            status: this.statusSearch,
            description: this.descriptionSearch
         })
            .then((data) => {
                console.log({data});
                this.poData = data.map((po, index) => ({
                    rowNumber: this.startIndex + index,
                    id: po.Id,
                    name: po.Name,
                    projectName: po.buildertek__Project__c ? po.buildertek__Project__r.Name : '',
                    vendorName: po.buildertek__Vendor__c ? po.buildertek__Vendor__r.Name : '',
                    vendorId: po.buildertek__Vendor__c ? po.buildertek__Vendor__r.Id : '',
                    vendorEmail: po.buildertek__Vendor__c ? po.buildertek__Vendor__r.buildertek__Email_Address__c : '',
                    costCodeDescription: po.buildertek__Cost_Code__c ? po.buildertek__Cost_Code__r.buildertek__Cost_Code_Name__c : '',
                    status: po.buildertek__Status__c,
                    description: po.buildertek__Description__c ? po.buildertek__Description__c : '',
                    statusClass: `status-pill status-${po.buildertek__Status__c.includes(' ') ? po.buildertek__Status__c.split(' ')[0].toLowerCase() : po.buildertek__Status__c.toLowerCase()}`,
                    total: po.buildertek__PO_Total__c,
                    isSelected: false,
                    isPdfAttached: po.buildertek__Has_PO_PDF_Attached__c
                }))
                .sort((a, b) => a.vendorName.localeCompare(b.vendorName, undefined, { sensitivity: 'base' }));

                this.updateShownData();
            })
            .catch((error) => {
                console.error('Error fetching purchase orders:', error);
            })
            .finally(()=>{
                this.isLoading = false;
            })
    }

    fetchCurrency() {
        getOrgCurrency().then((data) => {
            this.orgCurrency = data;
        });
    }

    handleSearch() {
        this.fetchPurchaseOrders();
    }

    updateShownData() {
        try {
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
            this.shownpoData = this.poData.slice(startIndex, endIndex).map(po => ({
                ...po,
                isSelected: this.selectedPOs.includes(po.id) || this.selectedPOsforPDF.includes(po.id)
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

    handlePDFCheckboxChange(event){
        try {
            var poid = event.target.dataset.id;
            var isChecked = event.target.checked;
            
            this.shownpoData = this.shownpoData.map(po => 
                po.id === poid ? { ...po, isSelected: isChecked && !po.isPdfAttached } : po
            );
            
            if (isChecked) {
                this.selectedPOsforPDF.push(poid);
            } else {
                this.selectedPOsforPDF = this.selectedPOsforPDF.filter(id => id !== poid);
            }

            // Update allSelected based on whether all checkboxes are checked
            this.allSelected = this.shownpoData.every(po => po.isSelected);

            // Update the "check all" checkbox in the UI
            const checkAllCheckbox = this.template.querySelector('lightning-input[data-id="checkAll"]');
            if (checkAllCheckbox) {
                checkAllCheckbox.checked = this.allSelected;
            }
        } catch (error) {
            console.log('error in handlePDFCheckboxChange :: ' , error);
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
        this.selectedPOs = this.allSelected ? this.shownpoData.filter(po => po.isPdfAttached).map(po => po.id) : [];
        this.selectedPOsforPDF = this.allSelected ? this.shownpoData.filter(po => !po.isPdfAttached).map(po => po.id) : [];
    }

    handleSubjectChange(event) {
        this.subject = event.target.value;
    }

    handleBodyChange(event) {
        this.emailBody = event.target.value;
    }

    handleCloseModal() {
        this.showEmailModal = false;
        this.subject = 'Purchase Order';
        this.emailBody = '';
    }

    handleEmailPos(event){
        console.log('Selected POs:', JSON.parse(JSON.stringify(this.selectedPOs)));
        if (this.selectedPOs.length == 0) {
            if(this.selectedPOsforPDF.length != 0){
                this.showToast('error', 'Please select POs which have PO PDF attached for sending email', 'Error');
                return;
            } else {
                this.showToast('error', 'Please select at least one PO to email', 'Error');
                return;
            }
        }

        const posByVendor = new Map();
        let uniqueVendorIds = new Set();

        this.poData.forEach(po => {
            if (this.selectedPOs.includes(po.id)) {
                uniqueVendorIds.add(po.vendorId); 
                this.vendorName = po.vendorName;
                this.vendorEmail = po.vendorEmail;
                
                if (uniqueVendorIds.size > 1) {
                    this.showToast('error', 'Please select POs associated with the same vendor in order to send email.', 'Error');
                    return;
                }

                if (!posByVendor.has(po.vendorId)) {
                    posByVendor.set(po.vendorId, []);
                }
                posByVendor.get(po.vendorId).push(po.id);
            }
        });

        if(uniqueVendorIds.size == 1){
            this.posByVendorObj = Object.fromEntries(posByVendor);
            this.emailBody = `Hi ${this.vendorName}, <br/><br/>Please find attached Purchase Order(s) related to your Account.`;
            this.showEmailModal = true;
        } else{
            this.showToast('error', 'Please select POs associated with the same vendor in order to send email.', 'Error');
        }
    }

    handleSendEmail(event) {
        if (this.subject == '') {
            this.showToast('error', 'Please add subject for the email', 'Error');
            return;
        }
        this.isLoading = true;

        sendEmailWithPOAttachments({ posByVendor: this.posByVendorObj, subject: this.subject, emailBody: this.emailBody, toIds: this.to, ccIds: this.cc })
            .then((result) => {
                if(result == 'success'){
                    this.showToast('success', 'Email sent successfully', 'Success');
                    this.handleCloseModal();
                    this.pONumberSearch = '';
                    this.projectSearch = '';
                    this.vendorSearch = '';
                    this.costCodeSearch = '';
                    this.statusSearch = '';
                    this.descriptionSearch = '';
                    this.fetchPurchaseOrders();
                    this.searchTerm = '';
                } else{
                    this.showToast('error', 'Something went wrong, Mail not sent', 'Error');
                }
            })
            .catch(error => {
                this.showToast('error', 'Error sending emails: ' + error.body.message, 'Error');
                console.log(error);
            })
            .finally(() => {
                this.isLoading = false;
            })
    }

    handleDownloadPDF(event) {
        const poId = event.target.dataset.id;
        this.poIdForDownload = poId;
        console.log(`PDF icon clicked for PO ID: ${poId}`);
        this.getPoTemplate(poId);
    }

    getPoTemplate() {
        this.isLoading = true;

        getTemplatesPO()
            .then(result => {
                if (!result || result.length === 0) {
                    this.showToast('Error', 'No template available for download', 'error');
                    this.isLoading = false;
                } else {
                    this.templateList = result;
                    this.selectedTemplateId = result[0].Id;
                    if (result.length == 1) {
                        this.createPDF();
                    } else{
                        this.showToast('Error', 'Something went wrong while fetching templates', 'error');
                        this.isLoading = false;
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching templates:', error);
                this.showToast('Error', 'An error occurred while fetching the templates', 'error');
                this.isLoading = false;
            })
    }

    createPDF() {
        this.isLoading = true;

        createPoPDFAndStoreInFiles({ templateId: this.selectedTemplateId, poId: this.poIdForDownload })
            .then(result => {
                if (result === 'Success') {
                    this.showToast('Success', 'PDF created successfully.', 'success');
                    //reset all the search fields
                    this.pONumberSearch = '';
                    this.projectSearch = '';
                    this.vendorSearch = '';
                    this.costCodeSearch = '';
                    this.statusSearch = '';
                    this.descriptionSearch = '';
                    this.fetchPurchaseOrders();
                } else {
                    this.showToast('Error', result, 'error');
                }
            })
            .catch(error => {
                console.error('Error creating PDF:', error);
                this.showToast('Error', 'An error occurred while creating the PDF', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleSelectionTo(event) {
        const selectedRecords = event.detail;
        selectedRecords.forEach(contact => {
            if (!this.to.includes(contact.id)) {
                this.to = [...this.to, contact.id];
            }
        });
        console.log('Updated Selected contact IDs:', this.to);
    }

    handleSelectionCc(event) {
        const selectedRecords = event.detail;
        selectedRecords.forEach(contact => {
            if (!this.cc.includes(contact.id)) {
                this.cc = [...this.cc, contact.id];
            }
        });
        console.log('Updated Selected contact:', this.cc);
    }

    handleCreatePoPDFs(event){
        console.log('Selected POs:', JSON.parse(JSON.stringify(this.selectedPOsforPDF)));
        if (this.selectedPOsforPDF.length == 0) {
            if(this.selectedPOs.length != 0){
                this.showToast('error', 'Please select POs which do not have PO PDF attached for creating PDF', 'Error');
                return;
            } else {
                this.showToast('error', 'Please select at least one PO for creating PDF', 'Error');
                return;
            }
        }

        getTemplatesPO()
            .then(result => {
                this.isLoading = true;
                if (!result || result.length === 0) {
                    this.showToast('Error', 'No template available for download', 'error');
                    this.isLoading = false;
                } else {
                    this.templateList = result;
                    this.selectedTemplateId = result[0].Id;
                    if (result.length == 1) {
                        createPoPDFsAndStoreInFiles({ templateId: this.selectedTemplateId, poIds: this.selectedPOsforPDF })
                            .then(result => {
                                if (result === 'Success') {
                                    this.showToast('Success', 'PDF created successfully.', 'success');
                                    this.pONumberSearch = '';
                                    this.projectSearch = '';
                                    this.vendorSearch = '';
                                    this.costCodeSearch = '';
                                    this.statusSearch = '';
                                    this.descriptionSearch = '';
                                    this.fetchPurchaseOrders();
                                } else {
                                    this.showToast('Error', result, 'error');
                                    this.isLoading = false;
                                }
                            })
                            .catch(error => {
                                console.error('Error creating PDF:', error);
                                this.showToast('Error', 'An error occurred while creating the PDF', 'error');
                                this.isLoading = false;
                            })
                    } else{
                        this.showToast('Error', 'Something went wrong while fetching templates', 'error');
                        this.isLoading = false;
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching templates:', error);
                this.showToast('Error', 'An error occurred while fetching the templates', 'error');
                this.isLoading = false;
            })
    }
}