import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { setTabLabel, getFocusedTabInfo, setTabIcon} from "lightning/platformWorkspaceApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOrgCurrency from '@salesforce/apex/massEmailRFQ.getOrgCurrency';
import getRFQs from '@salesforce/apex/massEmailRFQ.getRFQs';
import getRfqToVendorsMap from '@salesforce/apex/massEmailRFQ.getRfqToVendorsMap';
import sendRFQEmailToVendor from '@salesforce/apex/RFQDAO.sendRFQEmailToVendor';
import updateContact from '@salesforce/apex/massEmailRFQ.updateContact';
export default class MassEmailRFQs extends NavigationMixin(LightningElement) {

    //RFQ Data
    @track rfqData = [];
    @track showrfqData = [];
    @track searchTerm = '';
    @track selectedRFQs = [];
    @track isLoading = false;
    @track selectedRFQforEmail = [];


    @track rfqList = [];
    @track showPopUpModal = false;
    @track emailMap = {};

    
    // Pagination
    @track isPrevDisabled = true;
    @track isNextDisabled = false;
    @track pageNumber = 1;
    @track pageSize = 50;
    @track currentPage = 1;
    @track visiblePages = 3;

    //ORG Currencey
    @track orgCurrency;
    @track allSelected;

    get totalItems() {
        return this.rfqData.length;
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

    connectedCallback() {
        // this.isLoading = true;
        this.fetchCurrency();
        this.fetchRFQs(this.searchTerm);
        getFocusedTabInfo().then((tabInfo) => {
            setTabLabel(tabInfo.tabId, "Email RFQs");
            setTabIcon(tabInfo.tabId, "custom:custom55");
        });
    }

    fetchCurrency() {
        getOrgCurrency().then((data) => {
            this.orgCurrency = data;
        });
    }

    fetchRFQs(searchTerm) {
        // this.isLoading = true;
        getRFQs({ searchTerm: searchTerm }).then((data) => {
            console.log({data});
            this.rfqData = data.map((rfq, index) =>({
                rowNumber: this.startIndex + index,
                id : rfq.Id,
                rfqNumber : rfq.buildertek__Auto_Number__c,
                dueDate : rfq.buildertek__Due_Date__c,
                name : rfq.Name,
                projectName : rfq.buildertek__Project__c ? rfq.buildertek__Project__r.Name : '',
                tradetype : rfq.buildertek__Trade_Type__c ? rfq.buildertek__Trade_Type__r.Name : '',
                status : rfq.buildertek__Status__c,
                description : rfq.buildertek__Description__c,
                statuscClass : rfq.buildertek__Status__c === 'Draft' ? 'slds-text-color_success' : rfq.buildertek__Status__c === 'Sent' ? 'slds-text-color_warning' : 'slds-text-color_error',
                isSelected : false
            }))
            .sort((a, b) => a.rowNumber - b.rowNumber);
            this.updateShownData();
        })
        .catch((error) => {
            console.log('Error fetchRFQs->' + error);
            this.isLoading = false;
        });
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
        console.log('searchTerm->' + this.searchTerm);
        this.fetchRFQs(this.searchTerm);
    }

    updateShownData() {
        try {
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
            this.showrfqData = this.rfqData.slice(startIndex, endIndex).map(rfq =>({
                ...rfq,
                isSelected : this.selectedRFQs.includes(rfq.id)
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
        const rfqId = event.target.dataset.id;
        const checked = event.target.checked;

        this.showrfqData = this.showrfqData.map(rfq => 
            rfq.id === rfqId ? {...rfq, isSelected : checked} : rfq
        );
        
        if(checked){
            this.selectedRFQs.push(rfqId);
        } else {
            this.selectedRFQs = this.selectedRFQs.filter(id => id !== rfqId);
        }

        this.allSelected = this.showrfqData.every(rfq => rfq.isSelected);

        const checkAllCheckbox = this.template.querySelector('lightning-input[data-id="checkAll"]');
        if(checkAllCheckbox){
            checkAllCheckbox.checked = this.allSelected;
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    navigateToRFQ(event) {
        event.preventDefault();
        const recordId = event.target.dataset.id;
        console.log('recordId->' + recordId);
        try{
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: recordId,
                    actionName: 'view'
                }
            });
        }catch(error){
            console.log('Error navigateToRFQ->' + error);
        }
    }

    handleSelectAll(event) {
        this.allSelected = event.target.checked;
        this.showrfqData = this.showrfqData.map(rfq => ({
            ...rfq,
            isSelected: this.allSelected
        }));
        this.selectedRFQs = this.allSelected ? this.showrfqData.map(rfq => rfq.id) : [];
    }

    handleEmailrfqs(){
        console.log('selectedRFQs->' + this.selectedRFQs);
        if(this.selectedRFQs.length === 0){
            this.showToast('Error', 'Please select atleast one RFQ to send email', 'error');
        } else {
            this.isLoading = true;
           this.fetchVendorRFQs();
           this.showPopUpModal = true;
           //turn on the new pop up
        }
    }

    fetchVendorRFQs(){
        console.log('fetchVendorRFQs');
        getRfqToVendorsMap({ rfqIds : this.selectedRFQs }).then((data) => {
            console.log({data});
            //data is a map where key is RFQ Id and value is list of vendors, create a object where we have fields such as rfqid, rfqstatus, rfqname, isOpen, isSelected, List<buildertek__RFQ_To_Vendor__c> 
            const rfqToVendors = [];
            for(let key in data){
                const rfq = this.rfqData.find(rfq => rfq.id === key);
                rfqToVendors.push({
                    id : key,
                    label : rfq.name,
                    status : rfq.status,
                    isOpen : true,
                    isSelected : true,
                    iconName: 'utility:chevrondown',
                    vendors : data[key]
                });
            }
            this.rfqList = rfqToVendors;
            this.selectedRFQforEmail = this.rfqList.filter(rfq => rfq.isSelected).map(rfq => rfq.id);
            console.log({rfqToVendors});
        })
        .catch((error) => {
            console.log('Error fetchVendorRFQs->' + error);
        })
        .finally(() => {
            this.isLoading = false;
        });

        
    }

    handleCloseModal() {
        this.showPopUpModal = false;
    }

    handleAccordionToggle(event) {
        try {
            const targetCategory = event.currentTarget.dataset.category;
            const targetDiv = this.template.querySelector(`[data-tablist="${targetCategory}"]`);
            const targetedCate = this.rfqList.find(ele => ele.id === targetCategory);
            
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

    handleSelectedPOs(event) {
        const poId = event.target.name;
        const checked = event.target.checked;
        const poIndex = this.rfqList.findIndex(po => po.id === poId);

        if (poIndex !== -1) {
            this.rfqList[poIndex].isSelected = checked;
            if (checked) {
                this.selectedRFQforEmail.push(poId);
            } else {
                this.selectedRFQforEmail = this.selectedRFQforEmail.filter(id => id !== poId);  // Remove if unchecked
            }
        }
        console.log('Updated Selected PO Ids:', this.selectedRFQforEmail);
    }

    handleSendEmail(){
        this.isLoading =  true;
        //selectedRFQforEmail console log
        console.log('selectedRFQforEmail->' + this.selectedRFQforEmail);
        //iterate over rfqList and get vendors for selected RFQs
        const selectedRFQs = this.rfqList.filter(rfq => this.selectedRFQforEmail.includes(rfq.id));
        console.log({selectedRFQs});

        var isReturn = false;
        
        //create a list of string where each string is a vendor Id
        const vendorIds = [];
        selectedRFQs.forEach(rfq => {
            rfq.vendors.forEach(vendor => {
                if (vendor.buildertek__Contact__c && vendor.buildertek__Contact__r.Email) {
                    vendorIds.push(vendor.Id);
                }else{
                    var toastEvent = new ShowToastEvent({
                        title: "Error",
                        message: `Email not found for vendor ${vendor.buildertek__Vendor__r.Name}`,
                        variant: "error"
                    });
                    this.dispatchEvent(toastEvent);
                    isReturn = true;
                    
                }
            });
        });

        console.log({vendorIds});
        if(isReturn){
            this.isLoading = false;
            return;
        }

        //call apex method to send email
        sendRFQEmailToVendor({ rfqToVendorLinkIds : JSON.stringify(vendorIds) }).then((data) => {
            console.log({data});
            this.showToast('Success', 'Email sent successfully', 'success');
            this.showPopUpModal = false;
            this.fetchRFQs();
            this.selectedRFQs = [];
            this.selectedRFQforEmail = [];
            this.allSelected = false;
            this.currentPage = 1;
            this.searchTerm = '';
            

        })
        .catch((error) => {
            console.log('Error handleSendEmail->' + error);
            this.showToast('Error', 'Error while sending email', 'error');
        })
        .finally(() => {
            this.isLoading = false;
        });


    }

    handleEmailInput(event) {
        const contactId = event.target.dataset.id;
        const email = event.target.value;
    
        // Store the entered email in memory or a local map (for simplicity)
        if (!this.emailMap) {
            this.emailMap = {};
        }
        this.emailMap[contactId] = email;
    }

    handleEmailSubmit(event) {
        const contactId = event.target.dataset.id;
        const email = this.emailMap ? this.emailMap[contactId] : null;
        const mailregex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

        //validate email
        if (!email) {
            var toastEvent = new ShowToastEvent({
                title: "Error",
                message: "Email cannot be empty",
                variant: "error"
            });
            this.dispatchEvent(toastEvent);
            return;
        }

        if (!mailregex.test(email)) {
            var toastEvent = new ShowToastEvent({
                title: "Error",
                message: "Please enter a valid email",
                variant: "error"
            });
            this.dispatchEvent(toastEvent);
            return;
        }
    
        if (email) {
            // Call your server-side method here or handle the email submission
            this.updateEmail(contactId, email);
        } 
    }

    updateEmail(contactId, email) {
        console.log('contactId->' + contactId);
        console.log('email->' + email);

        updateContact({ contactId: contactId, contactEmail: email }).then((data) => {
            console.log({data});
            this.showToast('Success', 'Email updated successfully', 'success');
        }
        )
        .catch((error) => {
            console.log('Error updateEmail->' + error);
            this.showToast('Error', 'Error while updating email', 'error');
        }).finally(() => {
            this.fetchVendorRFQs();
        }
        );
        
    }
    









}