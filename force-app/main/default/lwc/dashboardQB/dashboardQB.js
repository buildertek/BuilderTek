import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getDetails from '@salesforce/apex/qbDash.getDetails';
import removeQBDetails from '@salesforce/apex/qbDash.removeQBDetails';
import syncSAInvoice from '@salesforce/apex/QBIntegrationQueue.sync_Invoice_in_QB_AuraCallout';
import syncCOInvoice from '@salesforce/apex/QBIntegrationQueue.sync_Contractor_Invoice_to_Bill_in_QB_AuraCallout';
import syncExpense from '@salesforce/apex/QBIntegrationQueue.sync_Expense_in_QB_AuraCallout';
import syncCustomer from '@salesforce/apex/QBIntegrationQueue.sync_Customer_In_QB_AuraCallout';
import syncVendor from '@salesforce/apex/QBIntegrationQueue.sync_Vendor_In_QB_AuraCallout';
import sendEmail from '@salesforce/apex/qbDash.sendEmail';
import getLineDetails from '@salesforce/apex/qbDash.getLineDetails';
import syncVendorCredit from '@salesforce/apex/QBIntegrationQueue.sync_Vendor_Credit_in_QB_AuraCallout';


export default class DashboardQB extends LightningElement {

    @api recordId;
    @api objectApiName;
    @track isLoading = true;
    @track jsonData;
    @track isSynced = false;
    @track messagefromQB;
    @track syncToken;
    @track QBurl;
    @track hasError = false;
    @track noData = false;
    @track lineJSON;


    connectedCallback() {
        console.log('RecordId---> ', this.recordId);
        console.log('ObjectApiName---> ', this.objectApiName);
        this.getrecordDetails();
    }

    getrecordDetails(){
        getDetails( {recordId: this.recordId, ObjectName: this.objectApiName})
        .then(result => {
            if(result == null || result == ''){
                this.noData = true;
            }
            this.jsonData = result;
            console.log('jsonData---> ', this.jsonData);
            this.jsonData = JSON.parse(this.jsonData);
            this.isLoading = false;
            console.log('jsonData---> ', this.jsonData);
            this.validateJsonData(this.jsonData);
        }).catch(error => {
            this.isLoading = false; 
            console.log('Error---> ', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while getting data',
                    message: error.message,
                    variant: 'error'
                }),
            );

        });
        if(this.objectApiName == 'buildertek__Account_Payable__c'){
            this.getLineData();
        }
    }

    getLineData(){
        getLineDetails( {recordId: this.recordId, ObjectName: this.objectApiName})
        .then(result => {
            if(result == null || result == ''){
                this.noData = true;
            }
            this.lineJSON = result;
            console.log('lineJSON---> ', this.lineJSON);
            this.lineJSON = JSON.parse(this.lineJSON);
            this.lineJSON = this.lineJSON.map(item => {
                return {Id: item.Id, buildertek__Cost_Code__c: item.buildertek__Cost_Code__c, Name: item.Name};
            }
            );
            console.log('lineJSON---> ', this.lineJSON);
        }).catch(error => {
            this.isLoading = false; 
            console.log('Error---> ', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while getting data',
                    message: error.message,
                    variant: 'error'
                }),
            );
        });
    }

    validateJsonData(jsonData){
        for(var key in jsonData){
            if(key.indexOf('SyncToken') > -1){
                this.syncToken = jsonData[key];
            }
            if(key.indexOf('Message') > -1){
                this.messagefromQB = jsonData[key];
                console.log('messagefromQB---> ', this.messagefromQB);
            }
            if(key.indexOf('URL') > -1){
                this.QBurl = jsonData[key];
                console.log('QBurl---> ', this.QBurl);
            }

            if(this.syncToken != null && this.syncToken != '' && this.messagefromQB == 'Integrated Successfully'){
                this.isSynced = true;
            }else if(this.messagefromQB != null && this.messagefromQB != ''){
                this.isSynced = false;
                this.hasError = true;
            }else{
                this.isSynced = false;
                this.hasError = false;
            }
        }
    }

    handleReSync(){
        this.getrecordDetails();
        console.log('Resyncing....');
        if(this.objectApiName == 'buildertek__Billings__c'){
            this.syncInvoice('syncSAInvoice');
        }else if(this.objectApiName == 'buildertek__Account_Payable__c'){
            if(this.validateCOInvoice()){
                this.syncInvoice('syncCOInvoice');
            }
        }else if(this.objectApiName == 'buildertek__Expense__c'){
            this.syncExp();
            
        }else if(this.objectApiName == 'Account'){
            this.syncAccount();
        }else if(this.objectApiName == 'buildertek__Credit_Memo__c'){
            console.log('Syncing Credit Memo....');
            console.log('this.jsonData---> ', this.jsonData.RecordType.DeveloperName);
            if(this.jsonData.RecordType.DeveloperName == 'Vendor'){
                this.syncVendorCredit();
            }else if(this.jsonData.RecordType.DeveloperName == 'Customer'){
                this.syncCreditMemo();
                this.workinProgress();
            }

        }
    }

    syncVendorCredit(){
        console.log('Syncing Vendor Credit....');
        syncVendorCredit({recordId: this.recordId, SyncObjName: this.objectApiName})
        .then(result => {
            console.log('result---> ', result);
            if(result == 'success'){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Wait a while',
                        message: 'We are syncing...',
                        variant: 'warning'
                    }),
                );
                setTimeout(() => {
                    window.location.reload();
                }, 2000);

            }else{
                this.isSynced = false;
                this.hasError = true;
                this.messagefromQB = result;
                //show toast message error
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while Syncing',
                        message: result,
                        variant: 'error'
                    }),
                );

            }
            this.getrecordDetails();
        }).catch(error => {
            console.log('error---> ', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while getting data',
                    message: error.message,
                    variant: 'error'
                }),
            );

        });

        
    }

    syncCreditMemo(){
        console.log('Syncing Credit Memo....');
    }

    workinProgress(){
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Work In Progress',
                message: 'Developer is working on it',
                variant: 'warning'

            }),
        );
    }

    validateCOInvoice(){
        console.log('Validating CO Invoice....');
        const { buildertek__Status__c, buildertek__Vendor__c, buildertek__Vendor__r, buildertek__QB_Line_Type__c } = this.jsonData;
        const today = new Date();

        if(buildertek__Status__c !== 'Approved'){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while Syncing',
                    message: 'Status should be Approved',
                    variant: 'error'
                }),
            );
            return false;
        }

        if(buildertek__Vendor__c && buildertek__Vendor__r){
            const { buildertek__Commercial_GL_Expiration_Date__c, buildertek__General_Liability_License_Expiration__c, buildertek__Worker_s_Compensation_License_Expiration__c, buildertek__Umbrella_Policy_Expiration_Date__c } = buildertek__Vendor__r;

            if (buildertek__Commercial_GL_Expiration_Date__c && new Date(buildertek__Commercial_GL_Expiration_Date__c) < today) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while Syncing',
                        message: 'Commercial GL Expiration Date should be greater than today',
                        variant: 'error'
                    }),
                );
                return false;
            }

            if (buildertek__General_Liability_License_Expiration__c && new Date(buildertek__General_Liability_License_Expiration__c) < today) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while Syncing',
                        message: 'General Liability License Expiration should be greater than today',
                        variant: 'error'
                    }),
                );
                return false;
            }

            if (buildertek__Worker_s_Compensation_License_Expiration__c && new Date(buildertek__Worker_s_Compensation_License_Expiration__c) < today) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while Syncing',
                        message: 'Worker\'s Compensation License Expiration should be greater than today',
                        variant: 'error'
                    }),
                );
                return false;
            }

            if (buildertek__Umbrella_Policy_Expiration_Date__c && new Date(buildertek__Umbrella_Policy_Expiration_Date__c) < today) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while Syncing',
                        message: 'Umbrella Policy Expiration Date should be greater than today',
                        variant: 'error'
                    }),
                );
                return false;
            }
        }


        if(buildertek__QB_Line_Type__c == 'Cost Codes'){
            var lineJSON = this.lineJSON;
            for(var i=0; i<lineJSON.length; i++){
                if(lineJSON[i].buildertek__Cost_Code__c == null || lineJSON[i].buildertek__Cost_Code__c == ''){
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error while Syncing',
                            message: `Cost Code is required for line ${lineJSON[i].Name}`,
                            variant: 'error'
                        }),
                    );
                    return false;
                }
            }
        }



        return true;
    }

    syncExp(){
        console.log('Syncing Expense....');
        syncExpense({recordId: this.recordId, SyncObjName: this.objectApiName})
        .then(result => {
            console.log('result---> ', result);
            if(result == 'success'){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Wait a while',
                        message: 'We are syncing...',
                        variant: 'warning'
                    }),
                );
                debugger;
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
            }else{
                this.isSynced = false;
                this.hasError = true;
                this.messagefromQB = result;
                //show toast message error
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while Syncing',
                        message: result,
                        variant: 'error'
                    }),
                );
            }
            this.getrecordDetails();
        }).catch(error => {
            console.log('error---> ', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while getting data',
                    message: error.message,
                    variant: 'error'
                }),
            );
        });
    }

    syncInvoice(apexMethod){
        const syncMethod = apexMethod === 'syncSAInvoice' ? syncSAInvoice : syncCOInvoice;
        const params = { recordId: this.recordId };
        if (apexMethod === 'syncCOInvoice') {
            params.SyncObjName = this.objectApiName;
        } else {
            params.ObjectName = this.objectApiName;
        }
        syncMethod(params)
        .then(result => {
            console.log('result---> ', result);
            if(result == 'success'){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Wait a while',
                        message: 'We are syncing...',
                        variant: 'warning'
                    }),
                );
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
            }else{
                this.isSynced = false;
                this.hasError = true;
                this.messagefromQB = result;
                //show toast message error
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while Syncing',
                        message: result,
                        variant: 'error'
                    }),
                );
            }
            this.getrecordDetails();
        }).catch(error => {
            console.log('error---> ', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while getting data',
                    message: error.message,
                    variant: 'error'
                }),
            );
        });
    }

    syncAccount(){
        console.log('Syncing Account....');
        var accType = this.jsonData['buildertek__BT_Account_Type__c'];
        console.log('accType---> ', accType);
        if(accType == 'Customer'){
            this.syncCustomer();
        }else if(accType == 'Vendor'){
            this.syncVendor();
        }else{
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while Syncing',
                    message: 'Account Type should be Customer or Vendor',
                    variant: 'error'
                }),
            );
            return;
        }

    }

    syncCustomer(){
        console.log('Syncing Customer....');
        syncCustomer({recordId: this.recordId, SyncObjName: this.objectApiName})
        .then(result => {
            console.log('result---> ', result);
            if(result == 'Completed'){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Wait a while',
                        message: 'We are syncing...',
                        variant: 'warning'
                    }),
                );
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
            }else{
                this.isSynced = false;
                this.hasError = true;
                this.messagefromQB = result;
                //show toast message error
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while Syncing',
                        message: result,
                        variant: 'error'
                    }),
                );
            }
            this.getrecordDetails();
        }).catch(error => {
            console.log('error---> ', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while getting data',
                    message: error.message,
                    variant: 'error'
                }),
            );
        });

    }

    syncVendor(){
        console.log('Syncing Vendor....');
        syncVendor({recordId: this.recordId, SyncObjName: this.objectApiName})
        .then(result => {
            console.log('result---> ', result);
            if(result == 'Completed'){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Wait a while',
                        message: 'We are syncing...',
                        variant: 'warning'
                    }),
                );
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
            }else{
                this.isSynced = false;
                this.hasError = true;
                this.messagefromQB = result;
                //show toast message error
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while Syncing',
                        message: result,
                        variant: 'error'
                    }),
                );
            }
            this.getrecordDetails();
        }).catch(error => {
            console.log('error---> ', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while getting data',
                    message: error.message,
                    variant: 'error'
                }),
            );
        });
    }



    handleRedirect(){
        console.log('Redirecting....');
        if(this.QBurl == null || this.QBurl == ''){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while redirecting',
                    message: 'Please try again',
                    variant: 'error'

                }),
            );
            return;
        }
        window.open(this.QBurl, "_blank");
       
    }

    handleDeLink(){
        console.log('DeLinking....');
        removeQBDetails({recordId: this.recordId, ObjectName: this.objectApiName})
        .then(result => {
            console.log('result---> ', result);
            this.isSynced = false;
            this.hasError = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Successfully De-Linked',
                    message: result,
                    variant: 'success'

                }),
            );
            window.location.reload();

        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while De-Linking',
                    message: error.message,
                    variant: 'error'
                }),
            );
        });

    }

    handlesendEmail(){
        console.log('Sending Email....');
        console.log('messagefromQB---> ', this.messagefromQB);
        sendEmail({recordId: this.recordId, ObjectName: this.objectApiName, QBMessage: this.messagefromQB})
        .then(result => {
            console.log('result---> ', result);
            this.isSynced = false;
            this.hasError = true;
            this.dispatchEvent(
            new ShowToastEvent({
                title: 'Successfully Sent Email',
                 message: result,
                 variant: 'success'
            }),
            );

        }).catch(error => {
            this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error while Sending Email',
                message: error.message,
                variant: 'error'
            }),
            );
        });
    }

}