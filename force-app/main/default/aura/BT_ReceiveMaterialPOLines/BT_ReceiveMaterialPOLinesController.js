({
    doInit : function(component, event, helper) {
        helper.getPicklistValues(component, event, helper);
        var recordId = component.get("v.pageReference.state.buildertek__parentId");
        component.set('v.recordId', recordId);
        var myPageRef = component.get("v.pageReference");
       // var pageSize = component.get("v.pageSize");
          var pageSize = component.get("v.pageSize");
        var paginationList = [];
        var action =component.get("c.getProducts");
        action.setParams({
            "recordId" : JSON.parse(JSON.stringify(component.get("v.recordId")))
        });
        action.setCallback(this, function(a){ 
            console.log(a.getReturnValue());
            var result = a.getReturnValue();
            var obj = JSON.parse(JSON.stringify(a.getReturnValue()))
            obj['quantity_recieved'] = ''
            obj['quantity_return'] = ''
            component.set("v.rfqRecordList", obj);
            component.set("v.totalRecords", component.get("v.rfqRecordList").length);
            var pageNumber = component.get("v.totalRecords");
            component.set("v.startPage", 0);
            component.set("v.endPage", pageSize - 1);
            for (var i = 0; i < pageSize; i++) {
                if (component.get("v.rfqRecordList").length > i)
                    paginationList.push(obj[i]);
            }
            console.log(paginationList);
            component.set('v.paginationList', paginationList);
        });
        $A.enqueueAction(action);

        var action1 = component.get("c.checkforCOInvoice");
        action1.setParams({
            "recordId" : JSON.parse(JSON.stringify(component.get("v.recordId"))
            )
        });
        action1.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                console.log('result ==> '+result);
                //if result is true v.isVisible should be false and vice versa
                if(result == true){
                    component.set("v.isVisible", false);
                } else{
                    component.set("v.isVisible", true);
                }
                
            }
        });
        $A.enqueueAction(action1);
          var workspaceAPI = component.find("workspace");
        workspaceAPI.getEnclosingTabId().then((response) => {
            let opendTab = response.tabId;
            workspaceAPI.setTabLabel({
            tabId: opendTab,
            label: "Receive Material"
        });
        workspaceAPI.setTabIcon({
            tabId: opendTab,
            icon: 'custom:custom18',
            iconAlt: 'Receive Material'
        });
    });
    
    },

    handleTabChange: function(component, event, helper) {
        var selectedTab = event.getSource().get('v.id');
        console.log('selectedTab ==> ',selectedTab);
        // if(selectedTab == 'tab1'){
        //     component.set("v.pageSize", 5);
        // }else{
        //     component.set("v.pageSize", 7);
        // }
        component.set("v.Spinner", true);
        console.log('handleTabChange');
        var pageSize = component.get("v.pageSize");
        var paginationList = [];
        var action =component.get("c.getProducts");
        action.setParams({
            "recordId" : JSON.parse(JSON.stringify(component.get("v.recordId")))
        });
        action.setCallback(this, function(a){ 
            var obj = JSON.parse(JSON.stringify(a.getReturnValue()))
            obj['quantity_recieved'] = ''
            obj['quantity_return'] = ''
            component.set("v.rfqRecordList", obj);
            
             component.set("v.totalRecords", component.get("v.rfqRecordList").length);
             var pageNumber = component.get("v.totalRecords");
                component.set("v.startPage", 0);
                var endpage = pageSize - 1;
                endpage = parseInt(endpage);
                component.set("v.endPage", endpage);
                
                for (var i = 0; i < pageSize; i++) {
                    if (component.get("v.rfqRecordList").length > i)
                        paginationList.push(obj[i]);
                }
                console.log(paginationList);
                component.set('v.paginationList', paginationList);
                component.set('v.duppaginationList', paginationList);
                component.set("v.Spinner", false);
                
        });
        $A.enqueueAction(action);
    },
    
    //this method is no more use
    getData: function(component, event, helper) {
        var pageSize = component.get("v.pageSize");
        var paginationList = [];
        var action =component.get("c.getProducts");
        action.setParams({
            "recordId" : JSON.parse(JSON.stringify(component.get("v.recordId")))
        });
        action.setCallback(this, function(a){ 
            var obj = JSON.parse(JSON.stringify(a.getReturnValue()))
            obj['quantity_recieved'] = ''
           // alert(JSON.stringify(obj.length));
            component.set("v.rfqRecordList", obj);
            
             component.set("v.totalRecords", component.get("v.rfqRecordList").length);
             var pageNumber = component.get("v.totalRecords");
                component.set("v.startPage", 0);
                component.set("v.endPage", pageSize - 1);
                for (var i = 0; i < pageSize; i++) {
                    if (component.get("v.rfqRecordList").length > i)
                        paginationList.push(obj[i]);
                }
                console.log(paginationList);
                component.set('v.paginationList', paginationList);
                component.set('v.duppaginationList', paginationList);
                
        });
        $A.enqueueAction(action);
    },
    
    //this method is no more use
    addToPOLines: function (component, event, helper, ProductsList) {
        var isCorrection = component.get("v.isCorrection");
        console.log('isCorrection ==> '+isCorrection);
        var  purchaseId = component.get("v.recordId");
        var rfqlist= component.get("v.rfqRecordList");
        console.log(rfqlist);
        for(var i=0;i<rfqlist.length;i++){
            if(rfqlist[i].quantity_recieved != null && isCorrection == false){
                console.log(rfqlist[i].quantity_recieved);
                if(rfqlist[i].quantity_recieved < 0 ){
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'Error',
                        message: 'Quantity received should not be in negative.',
                        duration: ' 5000',
                        key: 'info_alt',
                        type: 'error',
                        mode: 'pester'
                    });
                    toastEvent.fire();
                    return;
                }
                if(rfqlist[i].quantity_recieved % 1 != 0){
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'Error',
                        message: 'Quantity received should not be in decimal.',
                        duration: ' 5000',
                        key: 'info_alt',
                        type: 'error',
                        mode: 'pester'
                    });
                    toastEvent.fire();
                    return;
                }
                if(isNaN(rfqlist[i].quantity_recieved)){
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'Error',
                        message: 'Quantity received should be a number.',
                        duration: ' 5000',
                        key: 'info_alt',
                        type: 'error',
                        mode: 'pester'
                    });
                    toastEvent.fire();
                    return;
                }
                if (rfqlist[i].quantity_recieved > rfqlist[i].buildertek__Quantity__c || rfqlist[i].quantity_recieved > rfqlist[i].buildertek__Quantity_Remaining__c) {
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'Error',
                        message: 'Items Delivered must be less or equal to Quantity remaining. ',
                        duration: ' 5000',
                        key: 'info_alt',
                        type: 'error',
                        mode: 'pester'
                    });
                    toastEvent.fire();
                    return;
                }
            }

            if(isCorrection == true && rfqlist[i].quantity_return != null){
                //conver buildertek__Quantity_Received__c from string to number
                rfqlist[i].quantity_return = parseInt(rfqlist[i].quantity_return);
                //if it is NaN then set it to 0
                if(isNaN(rfqlist[i].quantity_return)){
                    rfqlist[i].quantity_return = 0;
                }
                //remove buildertek__Quantity_Remaining__c from rfqlist
                delete rfqlist[i].buildertek__Quantity_Remaining__c;

                 if(rfqlist[i].quantity_return < 0 ){
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'Error',
                        message: 'Quantity returned should not be in negative.',
                        duration: ' 5000',
                        key: 'info_alt',
                        type: 'error',
                        mode: 'pester'
                    });
                    toastEvent.fire();
                    return;
                }
                if(rfqlist[i].quantity_return % 1 != 0){
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'Error',
                        message: 'Quantity returned should not be in decimal.',
                        duration: ' 5000',
                        key: 'info_alt',
                        type: 'error',
                        mode: 'pester'
                    });
                    toastEvent.fire();
                    return;
                }
                if (rfqlist[i].quantity_return > rfqlist[i].buildertek__Quantity_Received__c) {
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'Error',
                        message: 'Items Returned must be less or equal to Quantity Received. ',
                        duration: ' 5000',
                        key: 'info_alt',
                        type: 'error',
                        mode: 'pester'
                    });
                    toastEvent.fire();
                    return;
                }

                rfqlist[i].buildertek__Quantity_Received__c = rfqlist[i].buildertek__Quantity_Received__c - rfqlist[i].quantity_return;
                if(rfqlist[i].buildertek__Returned__c == null){
                    rfqlist[i].buildertek__Returned__c = 0;
                }
                rfqlist[i].buildertek__Returned__c = rfqlist[i].buildertek__Returned__c + rfqlist[i].quantity_return;
                // rfqlist[i].buildertek__Returned__c =  rfqlist[i].quantity_return;
                delete rfqlist[i].quantity_return;
                console.log('rfqlist[i] ==> ',rfqlist[i]);
            }

        }

        if (isCorrection) {

            console.log('rfqlist ==> ',rfqlist);
            debugger;

            var action =component.get("c.addProductsCorrection");
            action.setParams({
                "ProductsList" : JSON.stringify(rfqlist),
            })
            component.set("v.Spinner", true);
            component.set("v.showMessage", true);
            
            action.setCallback(this,function(response){

                var state = response.getState();
                if (state === "SUCCESS") {
                    component.set("v.Spinner", false);
                    component.set("v.showMessage", false);
                    var result = response.getReturnValue();

                    if(result){
                        component.set("v.rfqList", result);
                        var recordId = component.get("v.recordId");
                        $A.get("e.force:closeQuickAction").fire();
                        var workspaceAPI = component.find("workspace");
                        var Spinner = component.get("v.spinner",true);
                        workspaceAPI.getFocusedTabInfo().then(function(response) {
                            var focusedTabId = response.tabId;
                            workspaceAPI.closeTab({tabId: focusedTabId});
                        })

                        .catch(function(error) {
                            console.log(error);
                        });
                        // setTimeout(function(){ location.reload(); }, 1800);
                        component.set("v.Spinner", false);
                        component.set("v.showMessage", false);
                        // alert(recordId);
                        /*   $A.get("e.force:navigateToSObject").setParams({
                            "recordId": recordId,
                            "slideDevName": "detail"
                        }).fire();*/
                        
                        var urlEvent = $A.get("e.force:navigateToURL");
                        urlEvent.setParams({
                            "url": '/lightning/r/buildertek__Purchase_Order__c/'+recordId+'/view'
                        });
                        urlEvent.fire();
                        setTimeout(function(){
                            $A.get('e.force:refreshView').fire();
                        }
                                      , 1800);
                    }
                    else{
                        component.set("v.Spinner", false);
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            title: 'Error',
                            message: 'Quantity received should not be in negative.',
                            duration: ' 5000',
                            key: 'info_alt',
                            type: 'error',
                            mode: 'pester'
                        });
                        toastEvent.fire();
                    }
                }
            }
                                    );
            $A.enqueueAction(action);

        }else{
          
            var action = component.get("c.addProducts");
            let productIdList = [];
            var productList = [];

            for (var i = 0; i < rfqlist.length; i++) {
                if (rfqlist[i].buildertek__Product__c != null) {
                    productIdList.push(rfqlist[i].buildertek__Product__c);
                    if (rfqlist[i].quantity_recieved != null && rfqlist[i].quantity_recieved != 0) {
                        productList.push({
                            prodId: rfqlist[i].buildertek__Product__c,
                            quantity_recieved: rfqlist[i].quantity_recieved,
                            polineId: rfqlist[i].Id,
                            ContentDocumnetIdList: rfqlist[i].ContentDocumnetIdList
                        });
                    }
                } else if (rfqlist[i].quantity_recieved != null && rfqlist[i].quantity_recieved != 0) {
                    productList.push({
                        quantity_recieved: rfqlist[i].quantity_recieved,
                        polineId: rfqlist[i].Id,
                        ContentDocumnetIdList: rfqlist[i].ContentDocumnetIdList

                    });
                }
            }

            action.setParams({
                productId: productIdList,
                ProductsList: JSON.stringify(productList)
            });

            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var result = response.getReturnValue();
                    if (result === "Success") {
                        $A.get("e.force:closeQuickAction").fire();
                        var workspaceAPI = component.find("workspace");
                        workspaceAPI.getFocusedTabInfo().then(function(response) {
                            var focusedTabId = response.tabId;
                            workspaceAPI.closeTab({tabId: focusedTabId});
                        })
                        .catch(function(error) { 
                            console.log(error);
                        });


                        var urlEvent = $A.get("e.force:navigateToURL");
                        urlEvent.setParams({
                            url: '/lightning/r/buildertek__Purchase_Order__c/' + component.get("v.recordId") + '/view'
                        });
                        urlEvent.fire();
                        setTimeout(function () {
                            $A.get("e.force:refreshView").fire();
                        }, 1800);
                    } else {
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            title: "Error",
                            message: result,
                            duration: 5000,
                            key: "info_alt",
                            type: "error",
                            mode: "pester"
                        });
                        toastEvent.fire();
                    }
                } else {
                    console.error(response.getError());
                }
            });

            $A.enqueueAction(action);
        }
        
    },

    addToPOLinesForCorrection: function (component, event, helper) {
        console.log('addToPOLinesForCorrection');
        var rfqlist = component.get("v.rfqRecordList");
        var quantityBeforeSubtractionMap = new Map();
        for (var i = 0; i < rfqlist.length; i++) {
            if (rfqlist[i].quantity_return != null) {
                // rfqlist[i].quantity_return = parseInt(rfqlist[i].quantity_return) || 0;
                delete rfqlist[i].buildertek__Quantity_Remaining__c;
    
                if (rfqlist[i].quantity_return < 0) {
                    helper.showToast('Error', 'Quantity returned should not be in negative.', 'error');
                    return;
                }
                if (rfqlist[i].quantity_return % 1 !== 0) {
                    helper.showToast('Error', 'Quantity returned should not be in decimal.', 'error');
                    return;
                }
                if (rfqlist[i].quantity_return > rfqlist[i].buildertek__Quantity_Received__c) {
                    helper.showToast('Error', 'Items Returned must be less or equal to Quantity Received.', 'error');
                    return;
                }
                quantityBeforeSubtractionMap.set(rfqlist[i].Id, rfqlist[i].buildertek__Quantity_Received__c);
                rfqlist[i].buildertek__Quantity_Received__c -= rfqlist[i].quantity_return;
                rfqlist[i].buildertek__Returned__c = (rfqlist[i].buildertek__Returned__c || 0) + rfqlist[i].quantity_return;
                if(rfqlist[i].return_reason != null){
                    if(rfqlist[i].buildertek__Return_Reason__c != null){
                        rfqlist[i].buildertek__Return_Reason__c = rfqlist[i].buildertek__Return_Reason__c + ' ' + rfqlist[i].return_reason;
                    }else{
                        rfqlist[i].buildertek__Return_Reason__c = rfqlist[i].return_reason;
                    }
                }else{
                    helper.showToast('Error', 'Please enter return reason for line ' + (i + 1), 'error');
                    return;
                }

                // delete rfqlist[i].quantity_return;
                console.log('rfqlist[i] ==> ', rfqlist[i]);
            }
        }
        console.log('quantityBeforeSubtractionMap ==> ', quantityBeforeSubtractionMap);
        console.log('rfqlist ==> ', rfqlist);

        if (quantityBeforeSubtractionMap.size === 0) {
            helper.showToast('Error', 'Please enter quantity returned for at least one item.', 'error');
            return;
        }
        
        var inventoryManagementList = [];
        quantityBeforeSubtractionMap.forEach((value, key) => {
            inventoryManagementList.push({
                // buildertek__Initial_Stock__c : value,
                buildertek__Returned_Stock__c : rfqlist.find(item => item.Id === key).quantity_return,
                buildertek__Product_Name__c : rfqlist.find(item => item.Id === key).buildertek__Product__c,
                buildertek__BT_Purchase_Order_Line__c : key,
                buildertek__Project__c : rfqlist.find(item => item.Id === key).buildertek__Purchase_Order__r.buildertek__Project__c,
                buildertek__Action__c : 'Returned'
            });
        });
        debugger;

         var action2 = component.get("c.addInventoryManagement");
        action2.setParams({
            "ProductsList": JSON.stringify(inventoryManagementList),
        });
        action2.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('response.getReturnValue() ==> ', response.getReturnValue());
            } else {
                console.error(response.getError());
            }
        });
        $A.enqueueAction(action2);

    
        var action = component.get("c.addProductsCorrection");
        action.setParams({
            "ProductsList": JSON.stringify(rfqlist),
        });
        component.set("v.Spinner", true);
        component.set("v.showMessage", true);
    
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                helper.handleSuccessResponse(component, helper, response.getReturnValue());
            }else{
                component.set("v.Spinner", false);
            }
        });
    
        $A.enqueueAction(action);
    },
    
    addToPOLinesForAddition: function (component, event, helper) {
        console.log('addToPOLinesForAddition');
        var rfqlist = component.get("v.rfqRecordList");
        console.log('rfqlist ==> ', rfqlist);
        let productIdList = [];
        let productList = [];
    
        for (var i = 0; i < rfqlist.length; i++) {
            if (rfqlist[i].quantity_recieved != null) {
                if(rfqlist[i].quantity_recieved < 0 ){
                    helper.showToast('Error', 'Quantity received should not be in negative.', 'error');
                    return;
                }
                if(rfqlist[i].quantity_recieved % 1 != 0){
                    helper.showToast('Error', 'Quantity received should not be in decimal.', 'error');
                    return;
                }
                if(isNaN(rfqlist[i].quantity_recieved)){
                    helper.showToast('Error', 'Quantity received should be a number.', 'error');
                    return;
                }
                if(rfqlist[i].buildertek__Ready_to_Ship__c != null && rfqlist[i].buildertek__Ready_to_Ship__c != 0 && rfqlist[i].buildertek__Ready_to_Ship__c != ''){
                    if(rfqlist[i].quantity_recieved > rfqlist[i].buildertek__Ready_to_Ship__c){
                        helper.showToast('Error', 'Items Delivered must be less or equal to Quantity ready to ship.', 'error');
                        return;
                    }
                }else{
                    if (rfqlist[i].quantity_recieved > rfqlist[i].buildertek__Quantity__c || rfqlist[i].quantity_recieved > rfqlist[i].buildertek__Quantity_Remaining__c) {
                        helper.showToast('Error', 'Items Delivered must be less or equal to Quantity remaining.', 'error');
                        return;
                    }
                }
            }
            if (rfqlist[i].quantity_recieved != null && rfqlist[i].quantity_recieved !== 0 && rfqlist[i].quantity_recieved != '') {
                if (rfqlist[i].buildertek__Product__c) {
                    productIdList.push(rfqlist[i].buildertek__Product__c);
                }
                productList.push({
                    prodId: rfqlist[i].buildertek__Product__c,
                    quantity_recieved: rfqlist[i].quantity_recieved,
                    polineId: rfqlist[i].Id,
                    ContentDocumnetIdList: rfqlist[i].ContentDocumnetIdList,
                });
                if(rfqlist[i].buildertek__Ready_to_Ship__c != null && rfqlist[i].buildertek__Ready_to_Ship__c != 0 && rfqlist[i].buildertek__Ready_to_Ship__c != ''){
                    productList[productList.length - 1].readytoship = rfqlist[i].buildertek__Ready_to_Ship__c - rfqlist[i].quantity_recieved;
                }
                if(rfqlist[i].locationReceived != null && rfqlist[i].locationReceived != 'none'){
                    productList[productList.length - 1].locationReceived = rfqlist[i].locationReceived;
                }else{
                    helper.showToast('Error', 'Please select location received for line ' + (i + 1), 'error');
                    return;
                }
            }
        }

        if (productIdList.length === 0) {
            helper.showToast('Error', 'Please enter quantity received for at least one item.', 'error');
            return;
        }
    
        var action = component.get("c.addProducts");
        action.setParams({
            productId: productIdList,
            ProductsList: JSON.stringify(productList)
        });
    
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('response.getReturnValue() ==> ', response.getReturnValue());
                helper.handleSuccessResponse(component, helper, response.getReturnValue());
            } else {
                console.error(response.getError());
            }
        });
    
        $A.enqueueAction(action);
    },

    addshipping : function(component, event, helper) {
        var rfqlist = component.get("v.rfqRecordList");
        console.log('rfqlist ==> ',rfqlist);

        for(var i=0;i<rfqlist.length;i++){
            if(rfqlist[i].buildertek__Ready_to_Ship__c != null){
                if(rfqlist[i].buildertek__Ready_to_Ship__c < 0 ){
                    helper.showToast('Error', 'Quantity received should not be in negative.', 'error');
                    return;
                }
                if(rfqlist[i].buildertek__Ready_to_Ship__c % 1 != 0){
                    helper.showToast('Error', 'Quantity received should not be in decimal.', 'error');
                    return;
                }
                if(isNaN(rfqlist[i].buildertek__Ready_to_Ship__c)){
                    helper.showToast('Error', 'Quantity received should be a number.', 'error');
                    return;
                }
                if (rfqlist[i].buildertek__Ready_to_Ship__c > rfqlist[i].buildertek__Quantity_Remaining__c || rfqlist[i].buildertek__Quantity_Remaining__c > rfqlist[i].buildertek__Quantity__c) {
                    helper.showToast('Error', 'Items ready to ship must be less or equal to Quantity remaining.', 'error');
                    return;
                }
            }else{
                rfqlist[i].buildertek__Ready_to_Ship__c = 0;
            }
        }

        var action = component.get("c.addProductsCorrection");
        action.setParams({
            "ProductsList": JSON.stringify(rfqlist),
        });
        component.set("v.Spinner", true);
        component.set("v.showMessage", true);
    
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                helper.handleSuccessResponse(component, helper, response.getReturnValue());
            }else{
                component.set("v.Spinner", false);
            }
        });
    
        $A.enqueueAction(action);


    },
    
    showToast: function (title, message, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: title,
            message: message,
            duration: 5000,
            key: "info_alt",
            type: type,
            mode: "pester"
        });
        toastEvent.fire();
    },
    
    closeModal: function (component, event, helper) {
        var workspaceAPI = component.find("workspace");
        var Spinner = component.get("v.spinner",true);
        workspaceAPI.getFocusedTabInfo().then(function(response) {
            var focusedTabId = response.tabId;
            workspaceAPI.closeTab({tabId: focusedTabId});
        })
        
        .catch(function(error) {
            console.log(error);
        });
        //component.get("v.onCancel")(); 
    },
    
    handleBlur : function(component, event, helper) {

        var inputField = event.getSource();

        var paginationList = component.get("v.paginationList");
        console.log('paginationList ==> ',paginationList);

        var Index = event.getSource().get("v.name");
        console.log('Index ==> '+Index);
        console.log('paginationList[Index].quantity_recieved ==> '+paginationList[Index].quantity_recieved);
        if((paginationList[Index].quantity_recieved > paginationList[Index].buildertek__Quantity__c) || (paginationList[Index].quantity_recieved > paginationList[Index].buildertek__Quantity_Remaining__c)) {
            inputField.setCustomValidity("Items Delivered must be less or equal to Quantity remaining");
            component.find("submit").set("v.disabled", true);
        }else if(paginationList[Index].buildertek__Ready_to_Ship__c != 0  && paginationList[Index].quantity_recieved > paginationList[Index].buildertek__Ready_to_Ship__c){
            console.log('paginationList[Index].buildertek__Ready_to_Ship__c ==> '+paginationList[Index].buildertek__Ready_to_Ship__c);
            inputField.setCustomValidity("Items Delivered must be less or equal to Quantity ready to ship");
            component.find("submit").set("v.disabled", true);
        } 
        else if (paginationList[Index].quantity_recieved < 0){
            inputField.setCustomValidity("Items Delivered must be greater than 0");
            component.find("submit").set("v.disabled", true);
        } else{
            console.log('Done');
            inputField.setCustomValidity("");
            component.find("submit").set("v.disabled", false);
        }

    },
    
    handleBlur2 : function(component, event, helper) {

        var inputField = event.getSource();

        var paginationList = component.get("v.paginationList");

        var Index = event.getSource().get("v.name");
        console.log('Index ==> ' + Index);

        console.log('paginationList[Index].quantity_return ==> ' + paginationList[Index].quantity_return);

        //if paginationList[Index].quantity_return > paginationList[Index].buildertek__Quantity_Received__c then make submit field disabled
        if (paginationList[Index].quantity_return > paginationList[Index].buildertek__Quantity_Received__c) {
            inputField.setCustomValidity("Quantity returned must be less or equal to Quantity received");
            component.find("submit").set("v.disabled", true);
        } else if (paginationList[Index].quantity_return < 0){
            inputField.setCustomValidity("Items Delivered must be greater than 0");
            component.find("submit").set("v.disabled", true);
        }else {
            inputField.setCustomValidity("");
            component.find("submit").set("v.disabled", false);
        }
    },
    
    next: function (component, event, helper) {
        var sObjectList = component.get("v.rfqRecordList");
        var end = component.get("v.endPage");
        var start = component.get("v.startPage");
        var pageSize = component.get("v.pageSize");
        var paginationList = [];
        var counter = 0;
        for (var i = end + 1; i < end + pageSize + 1; i++) {
            if (sObjectList.length > i) {
                paginationList.push(sObjectList[i]);
            }
            counter++;
        }
        start = start + counter;
        end = end + counter;
        component.set("v.startPage", start);
        component.set("v.endPage", end);
        component.set('v.paginationList', paginationList);
    },
    previous: function (component, event, helper) {
        var sObjectList = component.get("v.rfqRecordList");
         var end = component.get("v.endPage");
        var start = component.get("v.startPage");
        var pageSize = component.get("v.pageSize");
        var paginationList = [];
        var counter = 0;
        for (var i = start - pageSize; i < start; i++) {
            if (i > -1) {
                paginationList.push(sObjectList[i]);
                counter++;
            } else {
                start++;
            }
        }
        start = start - counter;
        end = end - counter;
        component.set("v.startPage", start);
        component.set("v.endPage", end);
        component.set('v.paginationList', paginationList);
    },

    handleUploadFinished: function(component, event, helper) {
        var Index = event.getSource().get("v.name");
        console.log('Index ==> '+Index);
        console.log('handleUploadFinished');
        var uploadedFiles = event.getParam("files");
        console.log('file data--->',uploadedFiles);
        var paginationList = component.get("v.paginationList");
        if(paginationList[Index].filesNameList == undefined){
            paginationList[Index].filesNameList = [];
        }
        var FileNameList = paginationList[Index].filesNameList;
        if(paginationList[Index].ContentDocumnetIdList == undefined){
            paginationList[Index].ContentDocumnetIdList = [];
        }
        var ContentDocumnetId = paginationList[Index].ContentDocumnetIdList;
        for(var i=0; i<uploadedFiles.length; i++) {
            FileNameList.push({
                'documentName' : uploadedFiles[i].name,
                'documentId' : uploadedFiles[i].documentId
            })
            ContentDocumnetId.push(uploadedFiles[i].documentId);
        }
        paginationList[Index].filesNameList = FileNameList;
        paginationList[Index].ContentDocumnetIdList = ContentDocumnetId;
        component.set("v.paginationList", paginationList);
        console.log('paginationList ==> ',paginationList); 

    },

    clear : function(component, event, helper) {
        var documentId = event.getSource().get("v.name");
        console.log('documentId ==> '+documentId);
        var action = component.get("c.deleteDocument");
        action.setParams({
            "documentId": documentId
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log('state==>',state);
        });
        $A.enqueueAction(action);
        var paginationList = component.get("v.paginationList");
        for(var i=0; i<paginationList.length; i++) {
            if(paginationList[i].ContentDocumnetIdList != undefined){
                for(var j=0; j<paginationList[i].ContentDocumnetIdList.length; j++) {
                    if(paginationList[i].ContentDocumnetIdList[j] == documentId){
                        paginationList[i].ContentDocumnetIdList.splice(j,1);
                        paginationList[i].filesNameList.splice(j,1);
                    }
                }
            }
        }
        component.set("v.paginationList", paginationList);
        console.log('paginationList ==> ',paginationList);
        
         
    },

    handleReasonChange : function(component, event, helper) {
        // Get the index of the row being edited
        var index = event.getSource().get("v.name");
        
        // Get the new value from the textarea input
        var returnReason = event.getSource().get("v.value");
        
        // Get the current list of items (paginationList)
        var items = component.get("v.paginationList");
        
        // Update the return reason for the specific item in the list
        if (index !== undefined) {
            items[index].return_reason = returnReason;
        }
        
        // Set the updated list back to the component
        component.set("v.paginationList", items);
    },
    
    
})