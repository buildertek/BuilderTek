import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import myResource from '@salesforce/resourceUrl/addProductLwcOnQuoteExternalCss';
import fetchPricebookList from '@salesforce/apex/QuoteDAO.getPricebookList';
import fetchProductFamilyList from '@salesforce/apex/QuoteDAO.getProductFamily';
import fetchTableDataList from '@salesforce/apex/QuoteDAO.getProductsthroughPriceBook2';
import fetchQuoteLineGroupList from '@salesforce/apex/QuoteDAO.getQuoteLineGroups';
import performDMLForQuoteLine from '@salesforce/apex/QuoteDAO.QuoteLinesInsert';
import fetchVendorsList from '@salesforce/apex/QuoteDAO.getVendors';
import fetchProductsThroughVendorList from '@salesforce/apex/QuoteDAO.getProductsthroughVendor';
import getFieldsetData from '@salesforce/apex/QuoteDAO.getFieldSetData';


const columns = [
	{ label: 'Product Name', fieldName: 'productUrl', type: 'url', typeAttributes: { label: { fieldName: 'Name' } }, sortable: false, hideDefaultActions: true, initialWidth: 500 },
	{ label: 'Product Family', fieldName: 'Family', type: 'text', hideDefaultActions: true },
	{ label: 'Product Description', fieldName: 'Description', type: 'text', hideDefaultActions: true },
	{ label: 'Notes', fieldName: 'Notes', type: 'text', hideDefaultActions: true },
	{ label: 'Cost Code', fieldName: 'CostCode', type: 'text', hideDefaultActions: true },
	{ label: 'Vendor', fieldName: 'Vendor', type: 'text', hideDefaultActions: true },
	{
		label: 'Unit Cost', fieldName: 'UnitCost', type: 'currency',
		typeAttributes: { currencyCode: { fieldName: 'CurrencyIso' }, currencyDisplayAs: "code" }, cellAttributes: { alignment: 'left' }, hideDefaultActions: true, initialWidth: 100
	},
	{
		label: 'List Price', fieldName: 'UnitPrice', type: 'currency',
		typeAttributes: { currencyCode: { fieldName: 'CurrencyIso' }, currencyDisplayAs: "code" }, cellAttributes: { alignment: 'left' }, hideDefaultActions: true, initialWidth: 100
	}
];

const columnsForVendorsDataTable = [
	{ label: 'Pricebook', fieldName: 'PriceBookName', type: 'text', sortable: false, hideDefaultActions: true },
	{ label: 'Product Name', fieldName: 'productUrl', type: 'url',typeAttributes: { label: { fieldName: 'Name' } }, sortable: false, hideDefaultActions: true, initialWidth: 500},
	{ label: 'Product Family', fieldName: 'Family', type: 'text', hideDefaultActions: true },
	{ label: 'Product Description', fieldName: 'Description', type: 'text', hideDefaultActions: true },
	{ label: 'Notes', fieldName: 'Notes', type: 'text', hideDefaultActions: true },
	{ label: 'Cost Code', fieldName: 'CostCode', type: 'text', hideDefaultActions: true },
	{ label: 'Vendor', fieldName: 'Vendor', type: 'text', hideDefaultActions: true },
	{
		label: 'Unit Cost', fieldName: 'UnitCost', type: 'currency',
		typeAttributes: { currencyCode: { fieldName: 'CurrencyIso' }, currencyDisplayAs: "code" }, cellAttributes: { alignment: 'left' }, hideDefaultActions: true, initialWidth: 100
	},
	{
		label: 'List Price', fieldName: 'UnitPrice', type: 'currency',
		typeAttributes: { currencyCode: { fieldName: 'CurrencyIso' }, currencyDisplayAs: "code" }, cellAttributes: { alignment: 'left' }, hideDefaultActions: true, initialWidth: 100
	}
];

const columnsForVendorList = [
	{ label: 'VENDOR NAME', fieldName: 'Name', type: 'text', sortable: false, hideDefaultActions: true },
];

export default class AddProductLwcCmp extends LightningElement {
    @api quoteId;
    showSpinner = false;
    isForVendorFlow = false;
    isComboScreen = true;
    isPriceBookSelected = false;
    isVendorSelected = false;
    isVendorSelectionScreen = false;
    isProductSelectedFromPricebook = false;
    isBackForPricebook = false;
    isBackForVendor = false;
    btnName = 'Next';
    btnValue = 'Next';
    btnNameVendorFlow = 'Next';
    btnValueVendorFlow = 'Next';
    columns = columns;
    columnsForVendorList = columnsForVendorList;
    columnsForVendorsDataTable = columnsForVendorsDataTable;
    priceBookValue = '';
    productFamilyValue;
    @api productFamilyFromParent;
    pickerValue = 'pricebook';
    filteredData = [];
    filteredData2 = [];
    data = [];
    quoteLineGroupList = [];
    noGroupingObj = {};
    pricebookOptions = [];
    productFamilyOptions = [];
    vendorList = [];
    vendorId;
    @track selectedQuoteLineRecords = [];
    heading_title = 'Choose Filter';
    @track quoteLineFields = [];

    @wire(fetchQuoteLineGroupList)
    wiredQuoteLineGroup({ error, data }) {
        if (data) {
            data.forEach(ele => {
                let obj = {};
                obj.id = ele.Id;
                obj.title = ele.Name;
                obj.subtitle = 'Grouping';
                if (ele.Name == 'No Grouping') {
                    this.noGroupingObj = obj;
                }
                this.quoteLineGroupList.push(obj);
            });
            console.log('check your grouping here ',JSON.parse(JSON.stringify(this.quoteLineGroupList)));
            this.error = undefined;
        } else if (error) {
            console.log('check your error here ',JSON.parse(JSON.stringify(error)));
            this.error = error;
            this.quoteLineGroupList = undefined;
        }
    }

    get options() {
        return [
            { label: 'PriceBook', value: 'pricebook' },
            { label: 'Vendor', value: 'vendor' },
        ];
    }

    connectedCallback() {
		loadStyle(this, myResource);
        console.log('check your productFamilyFromParent ',this.productFamilyFromParent);
        this.productFamilyValue = this.productFamilyFromParent || '-- All Product Family --';
	}

    handleChangeInPicker(event) {
        this.pickerValue = event.detail.value;
    }

    handlePricebookChangeForVendor(event){
        console.log('calling handlePricebookChangeForVendor');
        this.priceBookValue = event.detail.value;
        this.productFamilyValue = '-- All Product Family --';
        this.filteredData3 = [];
        let searchKey = event.target.value;
		searchKey = searchKey.toLowerCase();
        if (searchKey == '-- all pricebook --' || searchKey == '' || searchKey == undefined) {
			this.filteredData = this.data;
			return;
		}
        this.filteredData = this.data.filter(ele => {
            return ele.PriceBookName?.toLowerCase().includes(searchKey);
        });
        this.filteredData2 = this.filteredData;
    }

    handleProductFamilyChangeForVendor(event){
        try {
            this.productFamilyValue = event.detail.value;
            let searchKey = event.target.value
            searchKey = searchKey.toLowerCase();

            if (this.priceBookValue?.toLowerCase() === '-- all pricebook --' || this.priceBookValue == '' || this.priceBookValue == undefined) {
                if (searchKey == '-- all product family --' || searchKey == '' || searchKey == undefined) {
                    this.filteredData = this.data;
                    this.filteredData3 = [];
                } else {
                    this.filteredData = this.data.filter(ele => {
                        return ele.Family?.toLowerCase().includes(searchKey);
                    });
                    this.filteredData3 = this.filteredData;
                }
                return;
            }

            if (searchKey == '-- all product family --' || searchKey == '' || searchKey == undefined) {
                this.filteredData = this.filteredData2;
                this.filteredData3 = this.filteredData;
                return;
            }

            this.filteredData = this.filteredData2.filter(ele => {
                return ele.Family?.toLowerCase().includes(searchKey);
            });
            this.filteredData3 = this.filteredData;

        } catch (error) {
            console.log('error ',error);
        }
    }

    handleProductNameSearchForVendor(event){
        console.log('calling handleProductNameSearchForVendor');
        let searchKey = event.target.value
        searchKey = searchKey.toLowerCase();

        if (searchKey == '') {
            if (this.filteredData3?.length > 0) {
                this.filteredData = this.filteredData3;
                return;
            }else if (this.filteredData2?.length > 0) {
                this.filteredData = this.filteredData2;
                return;
            }
            this.filteredData = this.data;
            return;
        }
        this.filteredData = this.filteredData.filter(ele => {
            return ele.Name?.toLowerCase().includes(searchKey);
        });
    }

    async handlePricebookChange(event) {
        try {
            this.showSpinner = true;
            this.priceBookValue = event.detail.value;
            this.productFamilyValue = '-- All Product Family --';
            await this.callApexForProdcutFamilyList();
            this.showSpinner = false;
        } catch (error) {
            console.log('error ',error);
        }
    }

    handleProductFamilyChange(event) {
        this.productFamilyValue = event.detail.value;
        let searchKey = event.target.value
		searchKey = searchKey.toLowerCase();
		if (searchKey == '-- all product family --' || searchKey == '' || searchKey == undefined) {
			this.filteredData = this.data;
			return;
		}
        this.filteredData = this.data.filter(ele => {
            return ele.Family?.toLowerCase().includes(searchKey);
        });
        this.filteredData2 = this.filteredData;
    }

    async goToNextScreen(){
        console.log('calling goToNextScreen', JSON.stringify(this.pickerValue));
        this.showSpinner = true;

        if (this.btnValue === 'Next') {
            this.isComboScreen = false;
            if (this.pickerValue === 'pricebook') {
                this.template.querySelector('.customWidth').classList.add('myCustomStyle');
                await this.callApexForPricebookList();
                await this.callApexForProdcutFamilyList();
                this.heading_title = 'Products';
                this.filterProducts();
                this.isPriceBookSelected = true;
            } else if(this.pickerValue === 'vendor') {
                await this.callApexForVendorsList();
                this.heading_title = 'Vendors';
                this.isForVendorFlow = true;
                this.isVendorSelectionScreen = true;
            }
            this.btnName = 'Next';
            this.btnValue = 'Edit';
			this.showSpinner = false;
        } else if (this.btnValue === 'Edit') {
            this.doEditOperationForPriceBook();
			this.showSpinner = false;
        } else if (this.btnValue === 'Save') {
            if (this.selectedQuoteLineRecords?.length == 0) {
                this.showSpinner = false;
				this.showToastMsg('Error', 'Please select at least one Product.', 'error');
				return;
			}
            console.log('check your selectedQuoteLineRecords here ',JSON.parse(JSON.stringify(this.selectedQuoteLineRecords)));
            await this.saveQuoteLineItems();
            this.showSpinner = false;
        }
    }

    filterProducts() {
        let searchKey = this.productFamilyValue;
        searchKey = searchKey.toLowerCase();
    
        let isExist = this.productFamilyOptions.find(ele => ele.value.toLowerCase() === searchKey);
    
        if (!isExist) {
            searchKey = '-- all product family --';
            this.productFamilyValue = '-- All Product Family --';
        }
    
        if (searchKey === '-- all product family --' || searchKey === '' || searchKey === undefined) {
            this.filteredData = this.data;
            return;
        }
    
        this.filteredData = this.data.filter(ele => {
            return ele.Family?.toLowerCase().includes(searchKey);
        });
        this.filteredData2 = this.filteredData;
    }

    async goToNextScreenVendorFlow(){
        console.log('calling goToNextScreenForVendorFlow',this.productFamilyValue);
        this.showSpinner = true;
        if (this.btnValueVendorFlow === 'Next') {
            if (this.vendorId == undefined || this.vendorId == '') {
                this.showSpinner = false;
				this.showToastMsg('Error', 'Please select at least one Vendor.', 'error');
				return;
			}
            this.isVendorSelectionScreen = false;
            this.isVendorSelected = true;
            this.isBackForVendor = true;
            this.template.querySelector('.customWidth').classList.remove('myCustomStyle2');
            this.template.querySelector('.customWidth').classList.add('myCustomStyle');
            await this.callApexForProductsThroughVendorsList();
            this.btnValueVendorFlow = 'Edit';
            this.showSpinner = false;
        } else if (this.btnValueVendorFlow === 'Edit') {
            this.doEditOperationForVendor();
            this.showSpinner = false;
        } else if (this.btnValueVendorFlow === 'Save') {
            if (this.selectedQuoteLineRecords?.length == 0) {
                this.showSpinner = false;
				this.showToastMsg('Error', 'Please select at least one Product.', 'error');
				return;
			}
            await this.saveQuoteLineItems();
            this.showSpinner = false;
        }
        this.filterProductFamilyForVendor();
    }

    filterProductFamilyForVendor() {
        let searchKey = this.productFamilyValue.toLowerCase();

        let isExist = this.data.some(ele => ele.Family?.toLowerCase() === searchKey);

        if (!isExist) {
            searchKey = '-- all product family --';
            this.productFamilyValue = '-- All Product Family --';
        }

        if (!this.priceBookValue || this.priceBookValue.toLowerCase() === '-- all pricebook --') {
            if (searchKey === '-- all product family --') {
                this.filteredData = this.data;
            } else {
                this.filteredData = this.data.filter(ele => ele.Family?.toLowerCase().includes(searchKey));
            }
            this.filteredData3 = this.filteredData;
            return;
        }

        if (searchKey === '-- all product family --') {
            this.filteredData = this.filteredData2;
        } else {
            this.filteredData = this.filteredData2.filter(ele => ele.Family?.toLowerCase().includes(searchKey));
        }
        this.filteredData3 = this.filteredData;
    }    

    doEditOperationForPriceBook() {
        let selectedRecords = this.template.querySelector("lightning-datatable").getSelectedRows();
        let selectedQuoteLineRecords = [];
        if (selectedRecords?.length == 0) {
            this.showSpinner = false;
            this.showToastMsg('Error', 'Please select at least one Product.', 'error');
            return;
        }
        console.log({selectedRecords});
		
        getFieldsetData({})
            .then((result)=>{
                this.quoteLineFields = result.map(field => {
                    if (field.type === 'reference') {
                        field.isReference = true;
                        field.referenceObjectAPIName = field.referenceObjectName;
                    } else if (field.type === 'number' || field.type === 'double') {
                        field.isNumber = true;
                    } else if (field.type === 'currency') {
                        field.isCurrency = true;
                    } else if (field.type === 'string' || field.type === 'textarea') {
                        field.isString = true;
                    } else if (field.type === 'picklist') {
                        field.isPicklist = true;
                        field.picklistOptions = field.pickListValuesList.map(option => ({
                            label: option,
                            value: option
                        }));
                    } else if(field.type === 'boolean'){
                        field.isBoolean = true;
                    } else if (field.type === 'date') {
                        field.isDate = true;
                    } else if (field.type === 'datetime') {
                        field.isDateTime = true;
                    }
                    return field;
                });
                console.log(this.quoteLineFields); 
                selectedRecords.forEach(row => {
        
                    let listTopassInChild = [];
                    let defaultGrouping = this.quoteLineGroupList.find(ele => ele.title == row.Family);
                    if (defaultGrouping) {
                        listTopassInChild.push(defaultGrouping);
                    } else{
                        listTopassInChild.push(this.noGroupingObj);
                    }
        
                    let obj = {};
                    obj.Id = row.Id;
                    obj.Name = row.Name;
                    obj.priceBookId = row.PriceBookId;
                    obj.family = row.Family;
                    obj.fields = [];

                    this.quoteLineFields.forEach(field => {
                        let fieldData = {
                            fieldAPIName: field.fieldName,
                            fieldLabel: field.label,
                            fieldValue: '',
                            lookUpObject: '',
                            isReference: false,
                            isString: false,
                            isNumber: false,
                            isPercent: false,
                            isCurrency: false,
                            isBoolean: false,
                            isDate: false,
                            isDateTime: false,
                            isPicklist: false,
                            picklistOptions: field.isPicklist ? field.picklistOptions : [],
                            isDisabled: false
                        };

                        if (field.fieldName === 'buildertek__Price_Book__c') {
                            if(row.Size){
                                fieldData.fieldValue = row.Size;
                            }
                            fieldData.isString = true;
                            fieldData.isDisabled = true;
                        } else if (field.fieldName === 'buildertek__Unit_Price__c') {
                            fieldData.fieldValue = row.UnitPrice;
                            fieldData.isCurrency = true;
                        } else if (field.fieldName === 'buildertek__Unit_Cost__c') {
                            fieldData.fieldValue = row.UnitCost ? row.UnitCost : row.UnitPrice;
                            fieldData.isCurrency = true;
                        } else if (field.fieldName === 'buildertek__Grouping__c') {
                            fieldData.fieldValue = listTopassInChild;
                            fieldData.lookUpObject = field.referenceObjectAPIName;
                            fieldData.isReference = true;
                        } else if (field.fieldName === 'buildertek__Additional_Discount__c') {
                            fieldData.fieldValue = row.Discount ? row.Discount : 0;
                            fieldData.isNumber = true;
                        } else if (field.fieldName === 'buildertek__Cost_Code__c') {
                            fieldData.fieldValue = row.CostCode;
                            fieldData.isString = true;
                            fieldData.isDisabled = true;
                        } else if (field.fieldName === 'buildertek__Margin__c') {
                            fieldData.fieldValue = row.Margin ? row.Margin : 0;
                            fieldData.isPercent = true;
                        } else if (field.fieldName === 'buildertek__Markup__c') {
                            fieldData.fieldValue = row.MarkUp ? row.MarkUp : 0;
                            fieldData.isPercent = true;
                        } else if (field.fieldName === 'buildertek__Product__c') {
                            fieldData.fieldValue = row.Name;
                            fieldData.isString = true;
                            fieldData.isDisabled = true;
                        } else if (field.fieldName === 'buildertek__Quantity__c') {
                            fieldData.fieldValue = 1;
                            fieldData.isNumber = true;
                        } else if (field.fieldName === 'buildertek__Description__c') {
                            fieldData.fieldValue = row.Description ? row.Description : row.Name;
                            fieldData.isString = true;
                        } else if (field.fieldName === 'buildertek__Product_Family__c') {
                            fieldData.fieldValue = row.Family ? row.Family : 'No Grouping';
                            fieldData.isString = true;
                            fieldData.isDisabled = true;
                        } else if (field.fieldName === 'buildertek__Notes__c') {
                            fieldData.fieldValue = row.Notes;
                            fieldData.isString = true;
                        } else if (field.fieldName === 'buildertek__UOM__c') {
                            fieldData.fieldValue = row.QuantityUnitOfMeasure;
                            fieldData.isString = true;
                        } else if(field.isPicklist == true && field.picklistOptions.length > 0){
                            fieldData.isPicklist = true;
                            fieldData.fieldValue = field.picklistOptions[0].value;
                        } else if(field.isBoolean == true){
                            fieldData.isBoolean = true;
                            fieldData.fieldValue = false;
                        } else if (field.isDate == true) {
                            fieldData.isDate = true;
                            const currentDate = new Date().toISOString().split('T')[0];
                            fieldData.fieldValue = currentDate;
                        } else if (field.isDateTime === true) {
                            fieldData.isDateTime = true;
                            const currentDateTime = new Date().toISOString();
                            fieldData.fieldValue = currentDateTime;
                        } else if(field.isReference == true) {
                            fieldData.value = null;
                            fieldData.isReference = true;
                            fieldData.lookUpObject = field.referenceObjectAPIName;
                        } else if(field.isNumber = true){
                            fieldData.fieldValue = null;
                            fieldData.isNumber = true;
                        } else if(field.isPercent == true){
                            fieldData.fieldValue = null;
                            fieldData.isPercent = true;
                        } else if(field.isCurrency == true){
                            fieldData.fieldValue = null;
                            fieldData.isCurrency = true;
                        } else if(field.isString == true){
                            fieldData.fieldValue = null;
                            fieldData.isString = true;
                        } 
                        obj.fields.push(fieldData);
                    });
                    console.log({obj});
                    this.selectedQuoteLineRecords.push(obj);
                });
            })
            
        this.selectedQuoteLineRecords = [...selectedQuoteLineRecords]
        this.isPriceBookSelected = false;
        this.isVendorSelected = false;
        this.removeClasses();
        this.isProductSelectedFromPricebook = true;
        this.isBackForPricebook = true;
        this.heading_title = 'Edit Selected Quote Line Items';
        this.btnName = 'Save';
        this.btnValue = 'Save';
        this.btnNameVendorFlow = 'Save';
        this.btnValueVendorFlow = 'Save';
    }

    doEditOperationForVendor() {
        let selectedRecords = this.template.querySelector("lightning-datatable").getSelectedRows();
        let selectedQuoteLineRecords = [];
        if (selectedRecords?.length == 0) {
            this.showSpinner = false;
            this.showToastMsg('Error', 'Please select at least one Product.', 'error');
            return;
        }

        getFieldsetData({})
            .then((result)=>{
                this.quoteLineFields = result.map(field => {
                    if (field.type === 'reference') {
                        field.isReference = true;
                        field.referenceObjectAPIName = field.referenceObjectName;
                    } else if (field.type === 'number' || field.type === 'double') {
                        field.isNumber = true;
                    } else if (field.type === 'currency') {
                        field.isCurrency = true;
                    } else if (field.type === 'string' || field.type === 'textarea') {
                        field.isString = true;
                    } else if (field.type === 'picklist') {
                        field.isPicklist = true;
                        field.picklistOptions = field.pickListValuesList.map(option => ({
                            label: option,
                            value: option
                        }));
                    } else if(field.type === 'boolean'){
                        field.isBoolean = true;
                    } else if (field.type === 'date') {
                        field.isDate = true;
                    } else if (field.type === 'datetime') {
                        field.isDateTime = true;
                    }
                    return field;
                });
                console.log(this.quoteLineFields); 
                selectedRecords.forEach(row => {
        
                    let listTopassInChild = [];
                    let defaultGrouping = this.quoteLineGroupList.find(ele => ele.title == row.Family);
                    if (defaultGrouping) {
                        listTopassInChild.push(defaultGrouping);
                    } else{
                        listTopassInChild.push(this.noGroupingObj);
                    }
        
                    let obj = {};
                    obj.Id = row.Id;
                    obj.Name = row.Name;
                    obj.priceBookId = row.PriceBookId;
                    obj.family = row.Family;
                    obj.fields = [];

                    this.quoteLineFields.forEach(field => {
                        let fieldData = {
                            fieldAPIName: field.fieldName,
                            fieldLabel: field.label,
                            fieldValue: '',
                            lookUpObject: '',
                            isReference: false,
                            isString: false,
                            isNumber: false,
                            isPercent: false,
                            isCurrency: false,
                            isBoolean: false,
                            isPicklist: false,
                            isDate: false,
                            isDateTime: false,
                            picklistOptions: field.isPicklist ? field.picklistOptions : [],
                            isDisabled: false
                        };

                        if (field.fieldName === 'buildertek__Price_Book__c') {
                            if(row.Size){
                                fieldData.fieldValue = row.Size;
                            }
                            fieldData.isString = true;
                            fieldData.isDisabled = true;
                        } else if (field.fieldName === 'buildertek__Unit_Price__c') {
                            fieldData.fieldValue = row.UnitPrice;
                            fieldData.isCurrency = true;
                        } else if (field.fieldName === 'buildertek__Unit_Cost__c') {
                            fieldData.fieldValue = row.UnitCost ? row.UnitCost : row.UnitPrice;
                            fieldData.isCurrency = true;
                        } else if (field.fieldName === 'buildertek__Grouping__c') {
                            fieldData.fieldValue = listTopassInChild;
                            fieldData.lookUpObject = field.referenceObjectAPIName;
                            fieldData.isReference = true;
                        } else if (field.fieldName === 'buildertek__Additional_Discount__c') {
                            fieldData.fieldValue = row.Discount ? row.Discount : 0;
                            fieldData.isNumber = true;
                        } else if (field.fieldName === 'buildertek__Cost_Code__c') {
                            fieldData.fieldValue = row.CostCode;
                            fieldData.isString = true;
                            fieldData.isDisabled = true;
                        } else if (field.fieldName === 'buildertek__Margin__c') {
                            fieldData.fieldValue = row.Margin ? row.Margin : 0;
                            fieldData.isPercent = true;
                        } else if (field.fieldName === 'buildertek__Markup__c') {
                            fieldData.fieldValue = row.MarkUp ? row.MarkUp : 0;
                            fieldData.isPercent = true;
                        } else if (field.fieldName === 'buildertek__Product__c') {
                            fieldData.fieldValue = row.Name;
                            fieldData.isString = true;
                            fieldData.isDisabled = true;
                        } else if (field.fieldName === 'buildertek__Quantity__c') {
                            fieldData.fieldValue = 1;
                            fieldData.isNumber = true;
                        } else if (field.fieldName === 'buildertek__Description__c') {
                            fieldData.fieldValue = row.Description ? row.Description : row.Name;
                            fieldData.isString = true;
                        } else if (field.fieldName === 'buildertek__Product_Family__c') {
                            fieldData.fieldValue = row.Family ? row.Family : 'No Grouping';
                            fieldData.isString = true;
                            fieldData.isDisabled = true;
                        } else if (field.fieldName === 'buildertek__Notes__c') {
                            fieldData.fieldValue = row.Notes;
                            fieldData.isString = true;
                        } else if (field.fieldName === 'buildertek__UOM__c') {
                            fieldData.fieldValue = row.QuantityUnitOfMeasure;
                            fieldData.isString = true;
                        } else if(field.isPicklist == true && field.picklistOptions.length > 0){
                            fieldData.isPicklist = true;
                            fieldData.fieldValue = field.picklistOptions[0].value;
                        } else if(field.isBoolean == true){
                            fieldData.isBoolean = true;
                            fieldData.fieldValue = false;
                        } else if (field.isDate == true) {
                            fieldData.isDate = true;
                            const currentDate = new Date().toISOString().split('T')[0];
                            fieldData.fieldValue = currentDate;
                        } else if (field.isDateTime === true) {
                            fieldData.isDateTime = true;
                            const currentDateTime = new Date().toISOString();
                            fieldData.fieldValue = currentDateTime;
                        } else if(field.isReference == true) {
                            fieldData.value = null;
                            fieldData.isReference = true;
                            fieldData.lookUpObject = field.referenceObjectAPIName;
                        } else if(field.isNumber = true){
                            fieldData.fieldValue = null;
                            fieldData.isNumber = true;
                        } else if(field.isPercent == true){
                            fieldData.fieldValue = null;
                            fieldData.isPercent = true;
                        } else if(field.isCurrency == true){
                            fieldData.fieldValue = null;
                            fieldData.isCurrency = true;
                        } else if(field.isString == true){
                            fieldData.fieldValue = null;
                            fieldData.isString = true;
                        } 
                        obj.fields.push(fieldData);
                    });
                    this.selectedQuoteLineRecords.push(obj);
                });
            })
            .catch((error)=>{
                console.error('Something went wrong', error);
            })
        
        console.log(this.selectedQuoteLineRecords);
        this.selectedQuoteLineRecords = [...selectedQuoteLineRecords]
        this.isPriceBookSelected = false;
        this.isVendorSelected = false;
        this.removeClasses();
        this.isProductSelectedFromPricebook = true;
        this.heading_title = 'Edit Selected Quote Line Items';
        this.btnName = 'Save';
        this.btnValue = 'Save';
        this.btnNameVendorFlow = 'Save';
        this.btnValueVendorFlow = 'Save';
    }

    removeQuoteLine(event){
        try {
            console.log('calling removeQuoteLine');
            let rowId =  event.target.dataset;
            for (let i = 0; i < this.selectedQuoteLineRecords.length; i++) {
                let ele = this.selectedQuoteLineRecords[i];
                if (ele.Id == rowId.id) {
                    this.selectedQuoteLineRecords.splice(i, 1);
                    break;
                }
            }
        } catch (error) {
            console.log('error ',error);
        }
    }

    hideModalBox() {
        this.dispatchEvent(new CustomEvent('closechildscreen', { detail: { refresh: false } }));
    }

    goBackToPriceBookDatatable(){
        this.isPriceBookSelected = true;
        this.isVendorSelected = false;
        this.isProductSelectedFromPricebook = false;
        this.isBackForPricebook = false;
        this.heading_title = 'Products';
        this.btnName = 'Next';
        this.btnValue = 'Edit';
        this.addClasses();
    }

    goBackToVendorDatatable(){
        console.log('calling goBackToVendorDatatable');
        if (this.btnValueVendorFlow === 'Edit') {
            this.removeClasses();
            this.template.querySelector('.customWidth').classList.remove('myCustomStyle');
            this.template.querySelector('.customWidth').classList.add('myCustomStyle2');
            this.isVendorSelectionScreen = true;
            this.isVendorSelected = false;
            this.isProductSelectedFromPricebook = false;
            this.isBackForVendor = false;
            this.heading_title = 'Vendors';
            this.btnNameVendorFlow = 'Next';
            this.btnValueVendorFlow = 'Next';
            this.vendorId = undefined;
        } else if (this.btnValueVendorFlow === 'Save') {
            this.addClasses();
            this.isVendorSelectionScreen = false;
            this.isVendorSelected = true;
            this.isProductSelectedFromPricebook = false;
            this.isBackForVendor = true;
            this.heading_title = 'Products';
            this.btnNameVendorFlow = 'Next';
            this.btnValueVendorFlow = 'Edit';
        }
        this.callApexForVendorsList();
        this.productFamilyValue = this.productFamilyFromParent || '-- All Product Family --';
    }

    handleSelected(event) {
		let rowId =  event.target.dataset;
		let selectedGrouping = event.detail;
        console.log({selectedGrouping});
        const subtitleValue = selectedGrouping.length > 0 ? selectedGrouping[0].subtitle : null;
        for (let i = 0; i < this.selectedQuoteLineRecords.length; i++) {
			let ele = this.selectedQuoteLineRecords[i];
			if (ele.Id == rowId.id) {
                for (let field of ele.fields) {
                    if (field.lookUpObject === subtitleValue) {
                        field.fieldValue = selectedGrouping.length > 0 ? [selectedGrouping[0]] : [];
                    }
                }				
                break;
			}
		}
	}

    handleInputChange(event) {
		const { id, field } = event.target.dataset;
		const value = event.target.value;
		const updatedItem = this.selectedQuoteLineRecords.find(item => item.Id === id);
		if (updatedItem) {
            for (let fieldObj of updatedItem.fields) {
                if (fieldObj.fieldAPIName === field) {
                    if (fieldObj.isReference && Array.isArray(fieldObj.fieldValue)) {
                        fieldObj.fieldValue = value ? [{ id: value }] : [];
                    } else {
                        fieldObj.fieldValue = value;
                    }
                    break;
                }
            }
        }
    }

    handlePicklistChange(event) {
        const recordId = event.target.dataset.id;
        const fieldAPIName = event.target.dataset.field;
        const selectedValue = event.detail.value;
    
        this.selectedQuoteLineRecords = this.selectedQuoteLineRecords.map(record => {
            if (record.Id === recordId) {
                record.fields = record.fields.map(field => {
                    if (field.fieldAPIName === fieldAPIName) {
                        field.fieldValue = selectedValue;
                    }
                    return field;
                });
            }
            return record;
        });
    }

    handleCheckboxChange(event) {
        const fieldAPIName = event.target.dataset.field;
        const quoteId = event.target.dataset.id;
        const value = event.target.checked;
        
        const updatedQuote = this.selectedQuoteLineRecords.find(quote => quote.Id === quoteId);
        const fieldToUpdate = updatedQuote.fields.find(field => field.fieldAPIName === fieldAPIName);
        if (fieldToUpdate) {
            fieldToUpdate.fieldValue = value;
        }
    }

    handleKeyUp(evt) {
		let searchKey = evt.target.value
		searchKey = searchKey.toLowerCase();

		if (searchKey == '' && this.productFamilyValue != '-- All Product Family --' && this.productFamilyValue != '') {
			this.filteredData = this.filteredData2;
			return;
		} else if(searchKey == '') {
            this.filteredData = this.data;
            return;
        }

		if (evt.target.name == 'enter-name') {
            if (this.productFamilyValue != '-- All Product Family --' && this.productFamilyValue != '') {
                this.filteredData = this.filteredData2.filter(ele => {
                    return ele.Name?.toLowerCase().includes(searchKey);
                });
            } else {
                this.filteredData = this.data.filter(ele => {
                    return ele.Name?.toLowerCase().includes(searchKey);
                });
            }
		} else if (evt.target.name == 'enter-Vendor') {
            if (this.productFamilyValue != '-- All Product Family --' && this.productFamilyValue != '') {
                this.filteredData = this.filteredData2.filter(ele => {
                    return ele.Vendor?.toLowerCase().includes(searchKey);
                });
            } else {
                this.filteredData = this.data.filter(ele => {
                    return ele.Vendor?.toLowerCase().includes(searchKey);
                });
            }
		}
	}

    removeClasses() {
        const modalContent = this.template.querySelector('.myCls');
        if (modalContent) {
            modalContent.classList.remove('slds-p-around_medium');
        }
    }

    addClasses() {
        const modalContent = this.template.querySelector('.myCls');
        if (modalContent) {
            modalContent.classList.add('slds-p-around_medium');
        }
    }

    // vendor datatable single record selection logic
    handleRowSelection = event => {
        try {
            var selectedRows = event.detail.selectedRows;
            if (selectedRows.length == 0) {
                this.vendorId = '';
                return;
            }
            console.log(' selectedRows ',JSON.parse(JSON.stringify(selectedRows)));
            if (selectedRows.length > 1) {
                var el = this.template.querySelector('lightning-datatable');
                this.vendorId = selectedRows[1].Id;
                selectedRows = el.selectedRows = el.selectedRows.slice(1);
                event.preventDefault();
                // Need to get vendorId from the datatable
                return;
            }
            this.vendorId = selectedRows[0].Id;
        } catch (error) {
            console.log('error in handle Row selection ',error);
        }
    }

    //handle search in vendorList screen
    handleKeyUpForVendors(evt){
        console.log('calling handleKeyUpForVendors');
        let searchKey = evt.target.value
		searchKey = searchKey.toLowerCase();

		if (searchKey == ''){
            this.vendorList = this.data;
            const dataTable = this.template.querySelector('lightning-datatable');
            if (dataTable) {
                dataTable.selectedRows = [];
            }
            this.vendorId = null;
            return;
        }

        this.vendorList = this.data.filter(ele => {
            return ele.Name?.toLowerCase().includes(searchKey);
        });
    }

    // apex callouts
    async callApexForPricebookList() {
        try {
            const result = await fetchPricebookList({ recordId: this.quoteId });
            console.log('result', JSON.stringify(result));
            this.priceBookValue = result[0]?.defaultValue.Id;
            this.pricebookOptions = result[0]?.priceWrapList.map(item => ({ label: item.Name, value: item.Id }));
            this.isShowMargin = result[0]?.showmargin;

        } catch (error) {
            console.log('error in callApexForPricebookList ', {error});
            let { errorMessage, errorObject} = this.returnErrorMsg(error);
            this.showToastMsg('Error', errorMessage, 'error');
        }
    }

    async callApexForProdcutFamilyList() {
        try {
            console.log("Calling apexforprodcutfamilylist");
            
            let priceBookId = this.priceBookValue;
            const result = await fetchProductFamilyList({ pbookId: priceBookId });
            result.unshift('-- All Product Family --');
            console.log('result', JSON.stringify(result));
            this.productFamilyOptions = result.map(item => ({ label: item, value: item}));
            await this.callApexForTableDataList();
        } catch (error) {
            console.log('error in callApexForProdcutFamilyList ', {error});
            let { errorMessage, errorObject} = this.returnErrorMsg(error);
            this.showToastMsg('Error', errorMessage, 'error');
        }
    }

    async callApexForTableDataList() {
        try {
            let priceBookId = this.priceBookValue;
            const result = await fetchTableDataList({ pbookId: priceBookId });
            console.log('result', JSON.stringify(result));
            this.data = result;
            this.filteredData = result;
            this.data.forEach(product => {
                product.productUrl = '/lightning/r/Product2/'+product.Id+'/view'; 
            });
            this.filteredData.forEach(product => {
                product.productUrl = '/lightning/r/Product2/'+product.Id+'/view';
            });

        } catch (error) {
            console.log('error in callApexForTableDataList ', {error});
            let { errorMessage, errorObject} = this.returnErrorMsg(error);
            this.showToastMsg('Error', errorMessage, 'error');
        }
    }

    async callApexForVendorsList() {
        try {
            const result = await fetchVendorsList({});
            console.log('result', JSON.stringify(result));
            this.vendorList = result.vendorList;
            this.data = result.vendorList;

        } catch (error) {
            console.log('error in callApexForVendorsList ', {error});
            let { errorMessage, errorObject} = this.returnErrorMsg(error);
            this.showToastMsg('Error', errorMessage, 'error');
        }
    }

    async callApexForProductsThroughVendorsList() {
        try {
            console.log('check your vendor id ', JSON.parse(JSON.stringify(this.vendorId)));
            const result = await fetchProductsThroughVendorList({ vendorId: this.vendorId});
            console.log('result', JSON.stringify(result));
            let pricebookSet = new Set();
            result.forEach(element => {
                if (element.PriceBookName != undefined && element.PriceBookName != '') {
                    pricebookSet.add(element.PriceBookName);
                }
            });

            this.pricebookOptions = pricebookSet.size > 0 ? Array.from(pricebookSet).map(item => ({ label: item, value: item })) : [];
            this.pricebookOptions.unshift({ label: '-- All PriceBook --', value: '-- All PriceBook --' });
            this.priceBookValue = '-- All PriceBook --';

            let productFamilySet = new Set();
            result.forEach(element => {
                if (element.Family != undefined && element.Family != '') {
                    productFamilySet.add(element.Family);
                }
            });

            this.productFamilyOptions = productFamilySet.size > 0 ? Array.from(productFamilySet).map(item => ({ label: item, value: item })) : [];
            this.productFamilyOptions.unshift({ label: '-- All Product Family --', value: '-- All Product Family --' });
            this.productFamilyValue = this.productFamilyValue || '-- All Product Family --';

            this.filteredData = result;
            this.data = result;

            this.data.forEach(product => {
                product.productUrl = '/lightning/r/Product2/'+product.Id+'/view'; 
            });
            this.filteredData.forEach(product => {
                product.productUrl = '/lightning/r/Product2/'+product.Id+'/view';
            });


        } catch (error) {
            console.log('error in callApexForProductsThroughVendorsList ', {error});
            let { errorMessage, errorObject} = this.returnErrorMsg(error);
            this.showToastMsg('Error', errorMessage, 'error');
        }
    }

    async saveQuoteLineItems() {
        try {
            this.showSpinner = true;
            let quoteId = this.quoteId;
            let quoteLineItemsToSave = this.selectedQuoteLineRecords.map(record => {
                let quoteLine = {};  
        
                this.quoteLineFields.forEach(field => {
                    let fieldValue = this.getFieldValue(record, field.fieldName);               
                    if(field.fieldName == 'buildertek__Cost_Code__c'){
                        // quoteLine['buildertek__Cost_Code__c'] = record.costCodeId;
                    } else if (field.isReference && fieldValue && Array.isArray(fieldValue) && fieldValue.length > 0) {
                        quoteLine[field.fieldName] = fieldValue[0].id;  
                    } else if (field.isNumber || field.isCurrency || field.type === 'percent') {
                        fieldValue = parseFloat(fieldValue);
                        quoteLine[field.fieldName] = fieldValue;
                    } else {
                        quoteLine[field.fieldName] = fieldValue;
                    }
                    //console log the selected pricebook id
                    console.log('selected pricebook id', this.priceBookValue);
                    quoteLine['Name'] = record.Name.length >= 80 ? record.Name.substring(0,76) + '...' : record.Name;
                    quoteLine['buildertek__Item_Name__c'] = record.Name;
                    quoteLine['buildertek__Product__c'] = record.Id;
                    quoteLine['buildertek__Price_Book__c'] = record.priceBookId ? record.priceBookId : this.priceBookValue;
                    quoteLine['buildertek__Product_Family__c'] = record.family;
                    quoteLine['buildertek__Quote__c'] = quoteId;
                });
                return quoteLine;  
            });
            console.log({quoteLineItemsToSave});
            debugger;
            performDMLForQuoteLine({ quoteLineItems: quoteLineItemsToSave})
                .then(result => {
                    this.showSpinner = true;
                    if(result == 'Success'){
                        this.showToastMsg('Success', 'Quote Line Items saved successfully.', 'success');
                        this.showSpinner = false;
                        this.dispatchEvent(new CustomEvent('closechildscreen', { detail: { refresh: true } }));
                    } else{
                        this.showToastMsg('Error', result, 'error');
                    }
                })
                .catch(error => {
                    console.error('Error saving quote line items:', error);
                });
        } catch (error) {
            let { errorMessage, errorObject} = this.returnErrorMsg(error);
            this.showToastMsg('Error', errorMessage, 'error');
            this.showSpinner = false;
        } finally {
            this.showSpinner = false;
        }
    }

    getFieldValue(record, fieldName) {
        const field = record.fields ? record.fields.find(f => f.fieldAPIName === fieldName) : null;
        return field ? field.fieldValue : null;  
    }

    showToastMsg(title, message, variant) {
		this.dispatchEvent(
			new ShowToastEvent({
				title: title,
				message: message,
				variant: variant
			})
		);
	}

    returnErrorMsg(error) {
        // console.error('An error occurred:', error);
    
        let errorMessage = 'Unknown error';
        if (error && error.body) {
            if (error.body.message) {
                errorMessage = error.body.message;
            } else if (error.body.pageErrors && error.body.pageErrors.length > 0) {
                errorMessage = error.body.pageErrors[0].message;
            }
        } else if (error && error.message) {
            errorMessage = error.message;
        }
    
        return { errorMessage, errorObject: error };
    }
}