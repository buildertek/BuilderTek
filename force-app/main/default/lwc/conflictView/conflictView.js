import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { loadStyle } from 'lightning/platformResourceLoader';
import myResource from '@salesforce/resourceUrl/ScheduleLWCCss';
import fetchScheduleData from '@salesforce/apex/conflictViewController.fetchScheduleData';
import getScheduleData from "@salesforce/apex/GetProjectAndScheduleForGanttCmp.getScheduleData";

export default class ConflictView extends NavigationMixin(LightningElement) {
    @api recordId;
    @track isLoading = false;
    @track tableData = [];
    @track isScheduleSelected = false;
    @track scheduleWithoutProjectList = [];
    @track projectOptions = [];
    @track mapOfSchedulesOptionsByProject = {};
    @track SchedulesOptions = [];
    @track ProjectNameSet = [];
    @track selectedProjectId;
    @track selectedScheduleId;
    @track selectedScheduleIdForJS;
    @track editRecordId;
    @track selectedVendorId;
    @track selectedVendorResources1 = '';
    @track selectedVendorResources2 = '';
    @track selectedVendorResources3 = '';
    @track vendorOptions = [];
    @track selectedInternalResourceId = '';
    @track internalResourcesOption = [];
    @track vendorResourcesOptions = [];
    @track scheduleDataWrapper = {};
    @track vendorResourcesMap = {};
    @track vendorResourceConflictJSON = {};
    @track internalResourceConflictJSON = {};
    @track isConflict = false;
    @track conflictingSchedules = [];
    @track intialConflictList = [];
    @track existingConflictScheduleMap = {};
    @track isShowConflictCalled = false;

    connectedCallback() {   
        
        console.log(window.location.hash);
        
        const urlHash = window.location.hash;
        if (urlHash.includes('id=')) {
            const params = new URLSearchParams(urlHash.slice(1)); // Remove the # from the hash
            this.id = params.get('id'); // Get the 'id' parameter
            const decoded = atob(this.id); // Decode the base64 string
            this.decodedTaskId = JSON.parse(decoded); // Parse the JSON string back into an object
            this.recordId = this.decodedTaskId;
        }        
        loadStyle(this, myResource)
        // Calls scheduleData if recordId is provided, else calls getScheduleList
        this.recordId ? (this.scheduleData(), this.isScheduleSelected = true) : this.getScheduleList();
    }

    //* Method to fetch the list of schedules
    getScheduleList() {
        this.isLoading = true;
        getScheduleData()
            .then((result) => {
                console.log('result', result);
                this.scheduleWithoutProjectList = result.scheduleWithoutProjectList;
                this.mapOfSchedulesOptionsByProject = result.mapOfSchedulesByProject;
                this.ProjectNameSet.push({ label: 'No Project', value: '' })
                for (let key in this.mapOfSchedulesOptionsByProject) {
                    this.ProjectNameSet.push({ label: this.mapOfSchedulesOptionsByProject[key][0].buildertek__Project__r.Name, value: this.mapOfSchedulesOptionsByProject[key][0].buildertek__Project__r.Id });
                }
                this.projectOptions = this.ProjectNameSet;
                console.log('this.projectOptions', this.projectOptions);
            })
            .catch((error) => {
                console.error('Error in getting schedule list', error);
                this.showToast('Error', 'Failed to retrieve the schedule list. Please try again later.', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    //* Event handler for change in dropdown selection
    // handleChange(event) {
    //     var scheduleWithoutProjectList = [];
    //     this.callscheduleComponent = false;
    //     if (event.target.name === 'project') {
    //         this.selectedProjectId = event.detail.value;
    //         this.isDisabled = true;
    //     } else if (event.target.name === 'schedule') {
    //         this.selectedScheduleIdForJS = event.detail.value;
    //         this.selectedScheduleId = event.detail.value;
    //         this.isDisabled = false;
    //     }

    //     if (this.selectedProjectId === '') {
    //         this.scheduleWithoutProjectList.forEach(ele => {
    //             scheduleWithoutProjectList.push({ label: ele.buildertek__Description__c, value: ele.Id });
    //         });
    //         this.SchedulesOptions = scheduleWithoutProjectList;
    //     } else {
    //         this.mapOfSchedulesOptionsByProject[this.selectedProjectId].forEach(ele => {
    //             scheduleWithoutProjectList.push({ label: ele.buildertek__Description__c, value: ele.Id });
    //         })
    //         this.SchedulesOptions = scheduleWithoutProjectList;
    //     }
    // }

    //* Method to fetch schedule Item data
    scheduleData() {
        this.isLoading = true;
        const scheduleId = this.recordId || this.selectedScheduleId || this.selectedScheduleIdForJS;
        console.log('schedule id'+scheduleId);
        

        fetchScheduleData({ scheduleId })
            .then((result) => {
                if (result) {
                    // console.log('schedule Data:', JSON.stringify(result));
                    this.scheduleDataWrapper = result;
                    console.log('logging result',result);
                    
                    this.tableData = this.scheduleDataWrapper.conflictingSchedulesList.map(task => {
                        return {
                            id: task.Id,
                            project: task.buildertek__Schedule__r?.buildertek__Project__r?.Name || '',
                            schedule: task.buildertek__Schedule__r?.buildertek__Description__c || '',
                            scheduleId: task.buildertek__Schedule__c,
                            taskName: task.Name,
                            internalResource: task.buildertek__Resource__r?.Name || '',
                            internalResourceId: task.buildertek__Resource__r?.Id || '',
                            internalResource1: task.buildertek__Internal_Resource_1__r?.Name || '',
                            internalResourceId1: task.buildertek__Internal_Resource_1__r?.Id || '',
                            internalResource2: task.buildertek__Internal_Resource_3__r?.Name || '',
                            internalResourceId2: task.buildertek__Internal_Resource_3__r?.Id || '',
                            internalResource3: task.buildertek__Internal_Resource_4__r?.Name || '',
                            internalResourceId3: task.buildertek__Internal_Resource_4__r?.Id || '',
                            vendor: task.buildertek__Contractor__r?.Name || '',
                            vendorId: task.buildertek__Contractor__r?.Id || '',
                            vendorResources1: task.buildertek__Contractor_Resource_1__r?.Name || '',
                            vendorResources1Id: task.buildertek__Contractor_Resource_1__r?.Id || '',
                            vendorResources2: task.buildertek__Contractor_Resource_2__r?.Name || '',
                            vendorResources2Id: task.buildertek__Contractor_Resource_2__r?.Id || '',
                            vendorResources3: task.buildertek__Contractor_Resource_3__r?.Name || '',
                            vendorResources3Id: task.buildertek__Contractor_Resource_3__r?.Id || '',
                            startDate: task.buildertek__Start__c,
                            endDate: task.buildertek__Finish__c,
                            hasConflict: true,
                        };
                    });
                    // console.log('tableData:', JSON.parse(JSON.stringify(this.tableData)));
                }
                this.processScheduleDataWrapper();
            })
            .catch((error) => {
                console.error('Error ==>', error);
                this.showToast('Error', 'There was an error while retrieving the schedule data. Please contact the administrator to resolve this issue.', 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }


    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(toastEvent);
    }

    //* Method to handle click on edit button
    editResource(event) {
        this.isLoading = true;

        this.editRecordId = event.currentTarget.dataset.id;
        let currentVendorId = event.currentTarget.dataset.vendorid;
        // Enable the edit mode for the selected record and disable for others
        this.tableData = this.tableData.map(row => ({
            ...row,
            isEditing: row.id === this.editRecordId
        }));

        const selectedRecord = this.tableData.find(row => row.id === this.editRecordId);
        if (selectedRecord.isEditing) {
            this.selectedVendorId = currentVendorId ? this.vendorOptions.find(option => option.label === selectedRecord.vendor)?.value : '';

            this.vendorResourcesOptions = [{ label: 'None', value: '' }];
            if (this.selectedVendorId) {
                if (this.vendorResourcesMap[this.selectedVendorId]) {
                    this.vendorResourcesOptions = this.vendorResourcesOptions.concat(
                        this.vendorResourcesMap[this.selectedVendorId].map(ele => ({
                            label: ele.label,
                            value: ele.value
                        }))
                    );
                }
            }

            // Set the selected values for the internal resource, vendor and vendor resources
            selectedRecord.selectedVendorId = this.selectedVendorId;

            ['1', '2', '3'].forEach(index => {
                const fieldName = `vendorResources${index}`;
                const fieldValue = selectedRecord[fieldName];
                selectedRecord[`selectedVendorResources${index}`] = fieldValue ? this.vendorResourcesOptions.find(option => option.label === fieldValue)?.value : '';
            });
        }
        selectedRecord['selectedInternalResourceId'] = selectedRecord.internalResource ? this.internalResourcesOption.find(option => option.label === selectedRecord.internalResource)?.value : '';

        console.log(`Selected Vendor Id: ${this.selectedVendorId}, Selected Vendor Resources 1: ${selectedRecord.selectedVendorResources1}, Selected Vendor Resources 2: ${selectedRecord.selectedVendorResources2}, Selected Vendor Resources 3: ${selectedRecord.selectedVendorResources3} Selected Internal Resource: ${selectedRecord.selectedInternalResourceId}`);

        this.selectedVendorResources1 = selectedRecord.selectedVendorResources1;
        this.selectedVendorResources2 = selectedRecord.selectedVendorResources2;
        this.selectedVendorResources3 = selectedRecord.selectedVendorResources3;
        this.selectedInternalResourceId = selectedRecord.selectedInternalResourceId;
        this.isLoading = false;
    }

    closeEditFields() {
        this.isLoading = true;
        this.tableData = this.tableData.map(row => {
            return { ...row, isEditing: false };
        });
        this.isLoading = false;
    }

    //* Method to handle vendor change
    vendorChange(event) {
        this.selectedVendorId = event.target.value;

        // Nullify vendorResources
        this.selectedVendorResources1 = '';
        this.selectedVendorResources2 = '';
        this.selectedVendorResources3 = '';

        this.vendorResourcesOptions = [];
        if (this.selectedVendorId && this.selectedVendorId !== 'None') {
            if (this.vendorResourcesMap[this.selectedVendorId]) {
                this.vendorResourcesOptions = this.vendorResourcesMap[this.selectedVendorId].map(ele => ({
                    label: ele.label,
                    value: ele.value
                }));
            }
        }
    }

    //* Method to handle vendor resources change
    vendorResourcesChange(event) {
        console.log('Selected Vendor Resources', event.target.value);
        const fieldName = event.target.dataset.field;

        if (fieldName === 'selectedVendorResources1') {
            this.selectedVendorResources1 = event.target.value;
        } else if (fieldName === 'selectedVendorResources2') {
            this.selectedVendorResources2 = event.target.value;
        } else if (fieldName === 'selectedVendorResources3') {
            this.selectedVendorResources3 = event.target.value;
        }
    }

    // * Method to create a map of conflict data
    processScheduleDataWrapper() {
        this.vendorOptions = this.scheduleDataWrapper.contractorAndResourcesList
            ? [{ label: 'None', value: '' }, ...this.scheduleDataWrapper.contractorAndResourcesList.map(ele => ({
                label: ele.Name,
                value: ele.Id
            }))]
            : [{ label: 'None', value: '' }];


        if (this.scheduleDataWrapper.contractorAndResourcesList) {
            this.scheduleDataWrapper.contractorAndResourcesList.forEach(vendor => {
                const vendorId = vendor.Id;
                const resources = [];
                if (vendor.Contacts) {
                    vendor.Contacts.forEach(resource => {
                        resources.push({ label: resource.Name, value: resource.Id });
                    });
                }
                this.vendorResourcesMap[vendorId] = resources;
            });
        }

        this.internalResourcesOption = this.scheduleDataWrapper.internalResourcesList
            ? [{ label: 'None', value: '' }, ...this.scheduleDataWrapper.internalResourcesList.map(ele => ({
                label: ele.Name,
                value: ele.Id
            }))]
            : [{ label: 'None', value: '' }];

        // Creating Possible VendorResourcesConflict and internalResourceConflict JSON Data 
        for (const contractorAndResource of this.scheduleDataWrapper.contractorAndResourcesList) {
            const vendorId = contractorAndResource.Id;
            this.vendorResourceConflictJSON[vendorId] = {};
            this.internalResourceConflictJSON = {};

            for (const scheduleItem of this.scheduleDataWrapper.conflictingSchedulesList) {
                const resourceId1 = scheduleItem.buildertek__Contractor_Resource_1__c;
                const resourceId2 = scheduleItem.buildertek__Contractor_Resource_2__c;
                const resourceId3 = scheduleItem.buildertek__Contractor_Resource_3__c;
                const internalResourceId = scheduleItem.buildertek__Internal_Resource_1__c;

                if (scheduleItem.buildertek__Contractor__c === vendorId) {
                    if (resourceId1) {
                        if (!this.vendorResourceConflictJSON[vendorId][resourceId1]) {
                            this.vendorResourceConflictJSON[vendorId][resourceId1] = {};
                        }
                        this.vendorResourceConflictJSON[vendorId][resourceId1][scheduleItem.Id] = {
                            StartDate: scheduleItem.buildertek__Start__c,
                            EndDate: scheduleItem.buildertek__Finish__c,
                            resourceId1: resourceId1,
                            resourceName: scheduleItem?.buildertek__Contractor_Resource_1__r?.Name || '',
                            scheduleName: scheduleItem.buildertek__Schedule__r.buildertek__Description__c,
                            projectName: scheduleItem?.buildertek__Schedule__r?.buildertek__Project__r?.Name || '',
                            taskName: scheduleItem.Name
                        };
                    }

                    if (resourceId2) {
                        if (!this.vendorResourceConflictJSON[vendorId][resourceId2]) {
                            this.vendorResourceConflictJSON[vendorId][resourceId2] = {};
                        }
                        this.vendorResourceConflictJSON[vendorId][resourceId2][scheduleItem.Id] = {
                            StartDate: scheduleItem.buildertek__Start__c,
                            EndDate: scheduleItem.buildertek__Finish__c,
                            resourceId2: resourceId2,
                            resourceName: scheduleItem?.buildertek__Contractor_Resource_2__r?.Name || '',
                            scheduleName: scheduleItem.buildertek__Schedule__r.buildertek__Description__c,
                            projectName: scheduleItem?.buildertek__Schedule__r?.buildertek__Project__r?.Name || '',
                            taskName: scheduleItem.Name
                        };
                    }

                    if (resourceId3) {
                        if (!this.vendorResourceConflictJSON[vendorId][resourceId3]) {
                            this.vendorResourceConflictJSON[vendorId][resourceId3] = {};
                        }
                        this.vendorResourceConflictJSON[vendorId][resourceId3][scheduleItem.Id] = {
                            StartDate: scheduleItem.buildertek__Start__c,
                            EndDate: scheduleItem.buildertek__Finish__c,
                            resourceId3: resourceId3,
                            resourceName: scheduleItem?.buildertek__Contractor_Resource_3__r?.Name || '',
                            scheduleName: scheduleItem.buildertek__Schedule__r.buildertek__Description__c,
                            projectName: scheduleItem?.buildertek__Schedule__r?.buildertek__Project__r?.Name || '',
                            taskName: scheduleItem.Name
                        };
                    }
                }
                if (internalResourceId) {
                    if (!this.internalResourceConflictJSON[internalResourceId]) {
                        this.internalResourceConflictJSON[internalResourceId] = {};
                    }
                    this.internalResourceConflictJSON[internalResourceId][scheduleItem.Id] = {
                        StartDate: scheduleItem.buildertek__Start__c,
                        EndDate: scheduleItem.buildertek__Finish__c,
                        internalResourceId: internalResourceId,
                        resourceName: scheduleItem.buildertek__Internal_Resource_1__r.Name,
                        scheduleName: scheduleItem.buildertek__Schedule__r.buildertek__Description__c,
                        projectName: scheduleItem?.buildertek__Schedule__r?.buildertek__Project__r?.Name || '',
                        taskName: scheduleItem.Name
                    };
                }
            }
        }
        this.internalResourceConflictJSON = Object.fromEntries(
            Object.entries(this.internalResourceConflictJSON)
                .filter(([, value]) => Object.keys(value).length > 0)
        );

        this.vendorResourceConflictJSON = Object.fromEntries(
            Object.entries(this.vendorResourceConflictJSON)
                .filter(([, value]) => Object.keys(value).length > 0)
        );

        // console.log('this.internalResourceConflictJSON:', JSON.stringify(this.internalResourceConflictJSON));
        // console.log('vendorResourceConflictJSON:', JSON.stringify(this.vendorResourceConflictJSON));
        // this.getCurrentConflictingSchedules();
    }

}