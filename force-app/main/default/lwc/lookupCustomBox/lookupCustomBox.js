import { LightningElement , api} from 'lwc';
import getProductsByPriceBook from '@salesforce/apex/QuoteDAO.getProductsByPriceBook';


export default class LookupCustomBox extends LightningElement {

    @api selectedIconName = "";
    @api objectApiName = "";
    @api searchString = "";
    @api selectedRecordId = "";
    @api parentRecordId;
    @api parentFieldApiName;
    @api parentId;
    @api productFamily;
    showRecentRecords=false;
    recordsList=[];
    totalRecountCount = 0;
    items = [];
    data = [];
    recordCount = 20;





   //getting the default selected record
   connectedCallback() {
        // if (this.selectedRecordId) {
            // this.fetchSobjectRecords(true);
        // }
    }

    //call the apex method
    handleClick(loadEvent) {
        this.showRecentRecords= true;

        getProductsByPriceBook({
            ObjectName: this.objectApiName,
            pricebookId: this.parentId,
            productFamily: this.productFamily,
        }).then(result => {
            result = JSON.parse(JSON.stringify(result));
            console.log({result});

            // result.forEach(record => {
            //     record.linkAccount = '/' + record.Id;
            // });
            this.totalRecountCount = result.length;
            console.log(this.totalRecountCount);
            this.items = [...this.items, ...result];
            this.data = this.items.slice(0, this.recordCount); 

            this.recordCount = (this.recordCount > this.totalRecountCount) ? this.totalRecountCount : this.recordCount; 
            console.log(this.recordCount);
            this.data = this.items.slice(0, this.recordCount);      

            

            this.recordsList=this.data;
        }).catch(error => {
            console.log(error);
        })
    }

    handleLoadMore(event) {
        event.preventDefault();
        // increase the record Count by 20 on every loadmore event
        this.recordCount = this.recordCount + 20;
        //Display a spinner to signal that data is being loaded
        // event.target.isLoading = true;
        //Set the onloadmore event taraget to make it visible to imperative call response to apex.
        this.targetDatatable = event.target;
        //Display "Loading" when more data is being loaded
        this.loadMoreStatus = 'Loading';
        // Get new set of records and append to this.data
        this.handleClick();
    }



}