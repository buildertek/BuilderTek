import { LightningElement, track, api, wire } from "lwc";
import getQuoteDataFromServer from "@salesforce/apex/ImportRfqLineController.getAllApprovedRFQ";
import saveData from "@salesforce/apex/ImportRfqLineController.createQuoteItem";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadStyle } from "lightning/platformResourceLoader";
import myResource from "@salesforce/resourceUrl/newImportRfqOnQuoteExternalCss";

const columns = [
  {
    label: "Name",
    fieldName: "Name",
    type: "text",
    sortable: false,
    hideDefaultActions: true,
  },
  {
    label: "RFQ Details",
    fieldName: "buildertek__RFQ_Details__c",
    type: "text",
    hideDefaultActions: true,
  },
  {
    label: "Project",
    fieldName: "projectName",
    type: "text",
    hideDefaultActions: true,
  },
  {
    label: "Vendor",
    fieldName: "vendorName",
    type: "text",
    hideDefaultActions: true,
  },
  {
    label: "Contractor Ammount",
    fieldName: "buildertek__Vendor_Quote__c",
    type: "currency",
    typeAttributes: {
      currencyCode: { fieldName: "CurrencyIso" },
      currencyDisplayAs: "code",
    },
    cellAttributes: { alignment: "left" },
    hideDefaultActions: true,
  },
  {
    label: "Status",
    fieldName: "buildertek__Status__c",
    type: "text",
    hideDefaultActions: true,
  },
];

export default class ImportRfqLineLwcCmp extends LightningElement {
  @track isNextScreen = false;
  showSpinner = false;
  @api quoteId;
  @track data = [];
  @track filteredData = [];
  @track selectedQuoteLineRecords = [];
  columns = columns;
  @track btnName = "Next";
  @track isBackBtn = false;
  rfqLineQuoteLineSyncMap = {};

  connectedCallback() {
    loadStyle(this, myResource);
    this.fetchQuoteData();
  }

  fetchQuoteData() {
    getQuoteDataFromServer({ quotId: this.quoteId })
      .then((result) => {
        result.forEach((ele) => {
            console.log('ele ',ele);
            
          ele["vendorName"] = ele.buildertek__Vendor__r?.Name;
          ele["projectName"] = ele.buildertek__Project__r?.Name;
        });
        this.data = result;
        this.filteredData = result;
        this.error = undefined;
      })
      .catch((error) => {
        this.error = error;
        this.data = undefined;
      });
  }

  resetValues() {
    this.isNextScreen = false;
    this.btnName = "Next";
    this.selectedQuoteLineRecords = [];
    this.filteredData = [];
    this.data = [];
  }

  hideModalBox() {
    this.closeChildScreen(false);
  }

  handleKeyUp(evt) {
    let searchKey = evt.target.value;
    searchKey = searchKey.toLowerCase();

    if (searchKey == "") {
      this.filteredData = this.data;
      return;
    }

    if (evt.target.name == "enter-name") {
      this.filteredData = this.data.filter((ele) => {
        return ele.Name?.toLowerCase().includes(searchKey);
      });
    } else if (evt.target.name == "enter-project") {
      this.filteredData = this.data.filter((ele) => {
        return ele.projectName?.toLowerCase().includes(searchKey);
      });
    } else if (evt.target.name == "enter-vendor") {
      this.filteredData = this.data.filter((ele) => {
        return ele.vendorName?.toLowerCase().includes(searchKey);
      });
    }
  }

  goToNextScreen() {
    this.showSpinner = true;
    if (this.btnName === "Next") {
      let selectedRecords = this.template
        .querySelector("lightning-datatable")
        .getSelectedRows();
      let selectedQuoteLineRecords = [];
      if (selectedRecords?.length == 0) {
        console.log("in if  ");
        this.showSpinner = false;
        this.showToastMsg("Error", "Please select at least one RFQ.", "error");
        return;
      }

      try {
        
          selectedRecords.forEach((row) => {
            console.log('row selected ',row);
            row.buildertek__RFQ_Items__r.forEach((rfqLine) => {
                let obj = {};
                if (rfqLine.buildertek__BT_Quote_Line_Group__c) {
                    rfqLine.buildertek__BT_Quote_Line_Group__r['title'] = rfqLine.buildertek__BT_Quote_Line_Group__r.Name;
                    rfqLine.buildertek__BT_Quote_Line_Group__r['subtitle'] = 'phase';
                    rfqLine.buildertek__BT_Quote_Line_Group__r['id'] = rfqLine.buildertek__BT_Quote_Line_Group__c;
                }
                obj.Id = rfqLine.Id;
                obj.buildertek__RFQ__c = row.Id;
                obj.Name = rfqLine.Name;
                obj.buildertek__Item_Name__c = rfqLine.Name;
                obj.buildertek__Description__c = rfqLine.buildertek__Description__c;
                obj.buildertek__Quantity__c = 1;
                obj.buildertek__Cost_Code__c = rfqLine.buildertek__Cost_Code__c;
                obj.buildertek__Grouping__c = rfqLine.buildertek__BT_Quote_Line_Group__c;
                // obj.buildertek__Grouping__r = rfqLine.buildertek__BT_Quote_Line_Group__c ? [rfqLine.buildertek__BT_Quote_Line_Group__r] : [];
                obj.buildertek__Unit_Price__c = rfqLine.buildertek__Unit_Price__c;
                obj.buildertek__Unit_Cost__c = rfqLine.buildertek__Unit_Price__c;
                obj.buildertek__Markup__c = 0;
                obj.buildertek__Quote__c = this.quoteId;
                obj.buildertek__RFQ_Lines__c = rfqLine.Id;
                // ! quick hack for storing rfq line id 
                this.rfqLineQuoteLineSyncMap[rfqLine.Id] = obj;
                console.log('counter ');
                selectedQuoteLineRecords.push(obj);
            });
          });
      } catch (error) {
        console.log('error ',error);
        
      }
      
      this.selectedQuoteLineRecords = [...selectedQuoteLineRecords];
      this.isNextScreen = true;
      this.isBackBtn = true;
      this.btnName = "Save";
      this.showSpinner = false;
    } else if (this.btnName === "Save") {
      // do apex callout here
      let listOfQuoteLines = this.selectedQuoteLineRecords;

      for (let i = 0; i < listOfQuoteLines.length; i++) {
        let ele = listOfQuoteLines[i];
        if (ele.Name == "" || ele.Name == undefined) {
          this.showToastMsg("Error", "Please enter QuoteLine Name.", "error");
          this.showSpinner = false;
          return;
        }
      }

      this.callApexSaveData();
    }
  }

  callApexSaveData() {
      this.selectedQuoteLineRecords.forEach(quoteLines => {
            quoteLines.Id = null;
          delete quoteLines.buildertek__Grouping__r;
        });
        console.log('this.selectedQuoteLineRecords ',JSON.parse(JSON.stringify(this.selectedQuoteLineRecords)));
    saveData({ quoteItemsJSON: JSON.stringify(this.selectedQuoteLineRecords), stringMap: JSON.stringify(this.rfqLineQuoteLineSyncMap) })
      .then((result) => {
        if (result == "Success") {
          this.showToastMsg(
            "Success",
            "Quote Line Created Successfully.",
            "success"
          );
          this.closeChildScreen(true);
        } else {
          this.showToastMsg("Error", result, "error");
        }
        this.showSpinner = false;
      })
      .catch((error) => {
        console.log(error);
        this.showToastMsg("Error", error[0].message, "error");
      });
  }

  handleSelected(event) {
    let rowId = event.target.dataset.id;
    let selectedGrouping = event.detail;
    
    // Find the quote line record that matches the rowId
    let updatedItem = this.selectedQuoteLineRecords.find(item => item.Id === rowId);
    console.log('updatedItem ',JSON.parse(JSON.stringify(updatedItem)));
    if (updatedItem) {
        updatedItem.buildertek__Grouping__c = selectedGrouping.length > 0 ? selectedGrouping[0].id : null;
    }
    console.log('Updated selectedQuoteLineRecords:', JSON.parse(JSON.stringify(this.selectedQuoteLineRecords)));
  }

  handleInputChange(event) {
    const { id, field } = event.target.dataset;
    const value = event.target.value;
    const updatedItem = this.selectedQuoteLineRecords.find(
      (item) => item.Id === id
    );
    if (updatedItem) {
      updatedItem[field] = value;
    }
  }

  goBack() {
    this.isNextScreen = false;
    this.isBackBtn = false;
    this.btnName = "Next";
  }

  closeChildScreen(isRefresh) {
    this.resetValues();
    if (isRefresh) {
      this.dispatchEvent(
        new CustomEvent("closechildscreen", { detail: { refresh: true } })
      );
      return;
    }
    this.dispatchEvent(
      new CustomEvent("closechildscreen", { detail: { refresh: false } })
    );
  }

  showToastMsg(title, message, variant) {
    this.dispatchEvent(
      new ShowToastEvent({
        title: title,
        message: message,
        variant: variant,
      })
    );
  }
}