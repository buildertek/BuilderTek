({
    init : function(component, event, helper) {
        component.set("v.IsSpinner", true);
        var recordId = component.get('v.recordId');
        console.log('recordId: ' + recordId);
        var action = component.get("c.getdata");
        action.setParams({
            "recordId": recordId
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('response.getReturnValue(): ', response.getReturnValue());
                var allData = response.getReturnValue();
                var salesinvoiceLines = allData.billableLinesList;
                var salesinvoice = allData.billingsList;
                var quoterec = allData.quoteRec;
                var quoteLines = allData.quoteItemList;
                var orgwideCurrency = allData.orgwideCurrency;

                component.set("v.orgCurrency", orgwideCurrency);

                var isnotBillable = true;
                for(var i=0; i<quoteLines.length; i++){
                    if(quoteLines[i].buildertek__Invoiced_Unit_Price__c < quoteLines[i].buildertek__Net_Unit__c){
                        isnotBillable = false;
                    }
                }
                if(isnotBillable){
                    //show toast message
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: "Warning",
                        message: "All of the Quote Lines have been Invoiced",
                        type: "warning",
                        duration: 3000
                    });
                    toastEvent.fire();
                    component.set("v.IsSpinner", false);
                    $A.get("e.force:closeQuickAction").fire();
                }else{
                    component.set("v.showmodal", true);
                    //create an object to store data and show in table
                    var data = [];
                    for(var i=0; i<quoteLines.length; i++){
                        var obj = {};
                        obj.Id = quoteLines[i].Id;
                        obj.Name = quoteLines[i].Name;
                        obj.buildertek__Item_Name__c = quoteLines[i].buildertek__Item_Name__c;
                        obj.buildertek__Cost_Code__c = quoteLines[i].buildertek__Cost_Code__c;
                        obj.buildertek__Product__c = quoteLines[i].buildertek__Product__c;
                        obj.UnitPrice = parseFloat(quoteLines[i].buildertek__Net_Unit__c).toFixed(2);
                        obj.buildertek__Tax__c = quoteLines[i].buildertek__Tax__c;
                        obj.buildertek__Notes__c = quoteLines[i].buildertek__Notes__c;
                        obj.Quantity = quoteLines[i].buildertek__Quantity__c;
                        obj.Total = (obj.UnitPrice * obj.Quantity).toFixed(2);
                        obj.InvoicedUnitPrice = quoteLines[i].buildertek__Invoiced_Unit_Price__c;
                        obj.InvoicedTotal = (obj.InvoicedUnitPrice * obj.Quantity).toFixed(2);
                        obj.RemainingUnitPrice = obj.UnitPrice - obj.InvoicedUnitPrice;
                        obj.percentageinv ;
                        obj.isInvoiceable = obj.RemainingUnitPrice > 0 ? true : false;
                        data.push(obj);
                    }
                    console.log('data: ', data);
                    component.set("v.quoteLineData", data);
                    component.set("v.IsSpinner", false);
                }
            }
        }
        );
        $A.enqueueAction(action);
    },

    closeModel: function(component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
        //remove class slds-modal__container


    },

    handlePercentageChange: function(component, event, helper) {
        var Id = event.getSource().get("v.name");
        var percentage = event.getSource().get("v.value");
        console.log('Id: ', Id);
        console.log('percentage: ', percentage);
        var quoteLineData = component.get("v.quoteLineData");
        for(var i=0; i<quoteLineData.length; i++){
            if(quoteLineData[i].Id == Id){
                quoteLineData[i].percentageinv = percentage;
                break;
            }
        }
        component.set("v.quoteLineData", quoteLineData);
    },

    createInvoice : function(component, event, helper) {
        component.set("v.IsSpinner", true);
        var quoteLineData = component.get("v.quoteLineData");
        var isPercentageValid = true;
        for(var i=0; i<quoteLineData.length; i++){
            if(quoteLineData[i].percentageinv > 100){
                isPercentageValid = false;
                break;
            }
        }
        if(!isPercentageValid){
            //show toast message
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title: "Error",
                message: "Percentage should be less than or equal to 100",
                type: "error",
                duration: 3000
            });
            toastEvent.fire();
        }
        var finalData = [];
        for(var i=0; i<quoteLineData.length; i++){
            if(quoteLineData[i].percentageinv > 0){
                var obj = {};
                obj.buildertek__Item_Name__c = quoteLineData[i].Name;
                obj.buildertek__Line_Title__c = quoteLineData[i].buildertek__Item_Name__c;
                obj.buildertek__Cost_Code__c = quoteLineData[i].buildertek__Cost_Code__c;
                obj.buildertek__Description__c = quoteLineData[i].Name;
                obj.buildertek__Product__c = quoteLineData[i].buildertek__Product__c;
                obj.buildertek__Unit_Price__c = quoteLineData[i].RemainingUnitPrice * (quoteLineData[i].percentageinv / 100);
                obj.buildertek__Quantity__c = quoteLineData[i].Quantity;
                obj.buildertek__Notes__c = quoteLineData[i].buildertek__Notes__c;
                obj.buildertek__Tax_Rate__c = quoteLineData[i].buildertek__Tax__c
                obj.buildertek__Quote_Line__c = quoteLineData[i].Id;
                finalData.push(obj);
            }
        }
        console.log('finalData: ', finalData);

        var recordId = component.get('v.recordId');
        console.log('recordId: ' + recordId);
        
        //createInvoice(List<Billable_Lines__c> inLines, String QuoteId){ 
        var action = component.get("c.createInvoiceDB");
        action.setParams({
            "inLines": finalData,
            "QuoteId": recordId
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.IsSpinner", false);
                console.log('response.getReturnValue(): ', response.getReturnValue());

                var navEvt = $A.get("e.force:navigateToSObject");
                navEvt.setParams({
                    "recordId": response.getReturnValue(),
                    "slideDevName": "detail"
                });
                navEvt.fire();
                $A.get("e.force:closeQuickAction").fire();
            }else{
                component.set("v.IsSpinner", false);
                console.log('error: ', response.getError());
                //show toast message
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    title: "Error",
                    message: "Error in creating Invoice",
                    type: "error",
                    duration: 3000
                });
                toastEvent.fire();
            }
        }
        );
        $A.enqueueAction(action);

    },

    handleSetAllPercentage: function(component, event, helper) {
        var value = event.getSource().get("v.value");
        console.log('value: ', value);
        //if the value is greater than 100 then show error message
        if(value > 100){
            //show toast message
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title: "Error",
                message: "Percentage should be less than or equal to 100",
                type: "error",
                duration: 3000
            });
            toastEvent.fire();
            return;
        }
        component.set("v.allPercentage", value);
    },

    onclickSetAll: function(component, event, helper) {
        var allPercentage = component.get("v.allPercentage");
        var quoteLineData = component.get("v.quoteLineData");
        for(var i=0; i<quoteLineData.length; i++){
            if (quoteLineData[i].isInvoiceable) {
                quoteLineData[i].percentageinv = allPercentage;
            }
        }
        component.set("v.quoteLineData", quoteLineData);
    }
})