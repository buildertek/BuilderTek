({
	doInit : function(component, event, helper) {
	    component.set("v.Spinner", true);

        // >>>>>>>>>>>>>> CHB - 78, 80 <<<<<<<<<<<<<<<<<<<
        var action1 = component.get("c.CheckUserAccess");
        action1.setParams({
            AccessType: 'Create'
        });
        action1.setCallback(this, function(response) {
            console.log('CheckUserHaveAcces >> ',response.getReturnValue());
            if(response.getReturnValue() == 'True'){
               component.set("v.HaveCreateAccess", true);
            }
            else if(response.getReturnValue() == 'False'){
                component.set("v.HaveCreateAccess", false);
            }
        });
        $A.enqueueAction(action1);

        var action = component.get("c.getMasterQuotes");        
        action.setParams({
            searchQuoteByKeyword: component.get("v.searchKeyword")
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                var pageSize = component.get("v.pageSize");
                var result = response.getReturnValue();
                component.set("v.masterQuotesList",result);
                component.set("v.totalRecords", component.get("v.masterQuotesList").length);
                component.set("v.startPage",0);
                component.set("v.endPage",pageSize);
                var PaginationList = [];
                for(var i=0; i< pageSize; i++){
                    if(component.get("v.masterQuotesList").length> i)
                        PaginationList.push(result[i]);    
                }
                //alert('PaginationList Length ------> '+PaginationList.length);
                component.set('v.PaginationList', PaginationList);
                component.set("v.Spinner", false);
            }
        });
	    $A.enqueueAction(action);
	},
	
	handleSelectAll : function (component, event, helper) {
        var checkvalue = component.find("selectAll").get("v.value");
        var checkQuoteItem = component.find("checkQuoteItem"); 
        if(checkvalue == true){
            for(var i=0; i<checkQuoteItem.length; i++){
                checkQuoteItem[i].set("v.value",true);
            }
        }
        else{ 
            for(var i=0; i<checkQuoteItem.length; i++){
                checkQuoteItem[i].set("v.value",false); 
            }
        }    
    },
    
    unCheckAll : function (component, event, helper) {
        var checkvalue = component.find("selectAll");
        var selectedRec = event.getSource().get("v.value");  
        if (selectedRec == false) {
            checkvalue.set("v.value", false);    
        }
    },
	
	/*handleCheck : function(component, event, helper) {
        var checkbox = event.getSource();  
        var Submittals = component.get("v.masterQuotesList");
	    for(var i=0 ; i < Submittals.length;i++){
	        console.log('=========> ',i +' '+ Submittals.length);
	        if(Submittals[i].quoteRecord.Id == checkbox.get("v.text") && Submittals[i].quoteCheck == false){
	            Submittals[i].quoteCheck = true;
	            if(Submittals.length > 1){
	                component.find("checkContractor").set("v.value", true);
	            }
	            else{
	                component.find("checkContractor").set("v.value", true);
	            }
	        }
	        else if(Submittals[i].quoteRecord.Id == checkbox.get("v.text") && Submittals[i].quoteCheck == true){
	             Submittals[i].quoteCheck = false;
	             component.find("checkContractors").set("v.value", false);
	        }
	    }
    },
    
    selectAll : function(component, event, helper) {        
        var selectedHeaderCheck = event.getSource().get("v.value"); 
		var Submittals = component.get("v.masterQuotesList");
        var getAllId = component.find("checkContractor"); 
        if(Submittals != null){
            if(Submittals.length > 1){
                if(! Array.isArray(getAllId)){
                   if(selectedHeaderCheck == true){ 
                      component.find("checkContractor").set("v.value", true); 
                   }else{
                       component.find("checkContractor").set("v.value", false);
                   }
                }
                else{ 
                    if (selectedHeaderCheck == true) {
                        for (var i = 0; i < getAllId.length; i++) {
        					component.find("checkContractor")[i].set("v.value", true); 
        					var checkbox = component.find("checkContractor")[i].get("v.text");  
                    	        Submittals[i].quoteCheck = true;
                    	    
                        }
                    } 
                    else{
                        for (var i = 0; i < getAllId.length; i++) {
            				component.find("checkContractor")[i].set("v.value", false); 
            				
            				var checkbox = component.find("checkContractor")[i].get("v.text"); 
            				var Submittals = component.get("v.masterQuotesList");
            	                Submittals[i].quoteCheck = false;
                       }
                   } 
                } 
            }
            else{
                var i=0;
                    if (selectedHeaderCheck == true) {
                        	component.find("checkContractor").set("v.value", true); 
        					var checkbox = component.find("checkContractor").get("v.text");  
                    	        Submittals[i].quoteCheck = true;
                    	    
                        
                    } 
                    else{
                       		component.find("checkContractor").set("v.value", false); 
            				
            				var checkbox = component.find("checkContractor").get("v.text"); 
            				var Submittals = component.get("v.masterQuotesList");
            	                Submittals[i].quoteCheck = false;
                       
                   } 
            }
        }
     
    },*/
	
	closeModel : function(component, event, helper){
	    $A.get("e.force:closeQuickAction").fire();    
	},
	
	importQuote : function(component, event, helper){
        if(component.get("v.HaveCreateAccess")){

            component.set("v.Spinner", true);
            var quotesList = component.get("v.masterQuotesList");
            var QuoteIds = [];
            var getAllId = component.find("checkQuoteItem");
            if(! Array.isArray(getAllId)){
                if (getAllId.get("v.value") == true) {
                    QuoteIds.push(getAllId.get("v.text"));
                }
            }else{
                for (var i = 0; i < getAllId.length; i++) {
                    if (getAllId[i].get("v.value") == true) {
                        QuoteIds.push(getAllId[i].get("v.text"));
                    }
                }
            }
            /*for(var i=0 ; i < quotesList.length;i++){
                //alert('quoteCheck -------> '+quotesList[i].quoteCheck);
                if(quotesList[i].quoteCheck == true){
                    quoteIds.push(quotesList[i].quoteRecord.Id);
                }
            }*/
            //alert('quoteLines --> '+quoteIds);
            if(QuoteIds.length > 0){

                var action = component.get("c.importMasterQuoteLines");  
                action.setParams({
                    quoteIds : QuoteIds,
                    recordId : component.get("v.recordId")
                });
                action.setCallback(this, function(response){
                    var state = response.getState();
                    if(state === "SUCCESS"){
                        var result = response.getReturnValue();  
                        if(result.Status === 'Success'){
                            var toastEvent = $A.get("e.force:showToast");
                            toastEvent.setParams({
                                "title": "Success!",
                                "message": result.Message,
                                "type": 'Success'
                            });
                            toastEvent.fire(); 
                            component.set("v.Spinner", false);
                            $A.get("e.force:closeQuickAction").fire();  
                            window.setTimeout(
                                $A.getCallback(function() {
                                    document.location.reload(true);    
                                }), 1000
                            );
                        }else{
                            component.set("v.Spinner", false);
                            var toastEvent = $A.get("e.force:showToast");
                            toastEvent.setParams({
                                "title": "Error!",
                                "message": result.Message,
                                "type": 'Error'
                            });
                            toastEvent.fire();    
                        }
                    }
                });
                $A.enqueueAction(action);
            } else {
                component.set("v.Spinner", false);
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "message": "Please select at least one quote.",
                    "type": 'Error'
                });
                toastEvent.fire();
            }
        }
        else{
            component.set("v.Spinner", false);
            component.find('notifLib').showNotice({
                "variant": "error",
                "header": "Error!",
                "message": "You don\'t have the necessary privileges to Create record.",
                closeCallback: function () {
                    $A.get("e.c:BT_SpinnerEvent").setParams({
                        "action": "HIDE"
                    }).fire();
                }
            });
        }
	},
	
	next: function (component, event, helper) {
        var sObjectList = component.get("v.masterQuotesList");
        var end = component.get("v.endPage");
        var start = component.get("v.startPage");
        var pageSize = component.get("v.pageSize");
        var Paginationlist = [];
        var counter = 0;
        for(var i=end; i<end+pageSize; i++){
            if(sObjectList.length > i){
                Paginationlist.push(sObjectList[i]);
            }
            counter ++ ;
        }
        start = start + counter;
        end = end + counter;
        component.set("v.startPage",start);
        component.set("v.endPage",end);
        component.set('v.PaginationList', Paginationlist);
    },
    previous: function (component, event, helper) {
        var sObjectList = component.get("v.masterQuotesList"); 
        var end = component.get("v.endPage");
        var start = component.get("v.startPage");
        var pageSize = component.get("v.pageSize");
        var Paginationlist = [];
        var counter = 0;
        for(var i= start-pageSize; i < start ; i++){
            if(i > -1){
                Paginationlist.push(sObjectList[i]);
                counter ++;
            }else{
                start++;
            }
        }
        start = start - counter;
        end = end - counter;
        component.set("v.startPage",start);
        component.set("v.endPage",end);
        component.set('v.PaginationList', Paginationlist);
    },

    onSearch: function (component, event, helper) {
        // Clear any existing timeout
        if (component.get('v.searchTimeout')) {
            clearTimeout(component.get('v.searchTimeout'));
        }

        // Set new timeout
        var timeout = setTimeout($A.getCallback(function () {
            component.set("v.Spinner", true);
            var action = component.get("c.getMasterQuotes");

            action.setParams({
                searchQuoteByKeyword: event.getSource().get("v.value")
            });

            action.setCallback(this, function (response) {
                try {
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        var pageSize = component.get("v.pageSize");
                        var result = response.getReturnValue();
                        component.set("v.masterQuotesList", result);
                        component.set("v.totalRecords", component.get("v.masterQuotesList").length);
                        component.set("v.startPage", 0);
                        component.set("v.endPage", pageSize);

                        var PaginationList = [];
                        for (var i = 0; i < pageSize; i++) {
                            if (component.get("v.masterQuotesList").length > i) {
                                PaginationList.push(result[i]);
                            }
                        }
                        component.set('v.PaginationList', PaginationList);
                    } else {
                        console.error('Error: ', response.getError()[0].message);
                        helper.showToast('Error', 'Failed to retrieve quotes', 'error');
                    }
                } catch (error) {
                    console.error('Error: ', error);
                    helper.showToast('Error', 'An unexpected error occurred', 'error');
                } finally {
                    component.set("v.Spinner", false);
                }
            });

            $A.enqueueAction(action);
        }), 500); // 500ms delay

        // Store the timeout ID
        component.set('v.searchTimeout', timeout);
    }
})