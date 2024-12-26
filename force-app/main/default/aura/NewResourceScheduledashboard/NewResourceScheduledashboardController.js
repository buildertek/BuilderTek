({
    doInit: function (component, event, helper) {
        try {
            
            console.log('DO INIT IS WORKING');
            var today = new Date();
            console.log('LOGGING TODAY-->'+today);
            
            component.set("v.calendarView", "Dayview");
            var now = new Date();
            component.set("v.isFirst",true);
            var Datevalue = new Date(today.getFullYear(), today.getMonth(), 1);
            let todayDateVal = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            var weeks = component.get("v.dayNames")
            component.set("v.currDay",weeks[new Date(Date.parse(today)).getDay()].substring(0,3));
            component.set("v.currDate",new Date(Date.parse(today)).getDate().toString().padStart(2, "0"));
            component.set("v.headerDate", $A.localizationService.formatDate(now, 'dd/MMMM/yyyy'));
            var url = location.href;
            var baseURL = url.substring(0, url.indexOf('--', 0));
            component.set("v.BaseURLs", baseURL);
    
            component.set("v.currentDateValString",now.toLocaleDateString());
            component.set("v.todayDate",Datevalue.toLocaleDateString());
            component.set("v.datevalString",Datevalue.toLocaleDateString());
            component.set("v.todayDateHeader",now.toDateString());
            component.set("v.dateval",todayDateVal);
    
            var SelectedDate = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
            console.log('SelectedDate : ', SelectedDate);
            component.set("v.SelectedDate", SelectedDate);
    
            console.log("DateValue :--->" , now.toDateString());
    
            if(component.get("v.recordId")){
                var action = component.get("c.getProjectId");
                action.setParams({
                    scheduleId : component.get("v.recordId")
                });
    
                action.setCallback(this, function (response) {
                    var state = response.getState();
                    if(response.getState() === 'SUCCESS'){
                        component.set("v.newSelectedProjectId",response.getReturnValue());
                        helper.getTasksByProjects(component,helper, Datevalue);
                    }else{
                        helper.getTasksByProjects(component,helper, Datevalue);
                    }
                });
                $A.enqueueAction(action);
    
            }else{
                helper.setFocusedTabLabel(component, event, helper);
                helper.getTasksByProjects(component,helper, Datevalue);
            }
        } catch (error) {
            console.log('LOGGING ERROR OF DOINIT---->'+error.stack);
            
        }
    },

    onTabFocused : function (component, event, helper) {

       /*
        *  var ac= component.get("c.doInit")
        $A.enqueueAction(ac)
        if( component.get("v.rerendermonthly")){
             component.set("v.rerendermonthly",false);
        }else{
             component.set("v.rerendermonthly",true);
        }*/
    },
    destoryCmp : function (component, event, helper) {

            //component.destroy();
    },

    handleAfterLoad: function (component, event, helper) {
        helper.handleAfterScriptsLoaded(component, helper);
    },

    buildCalendar: function (component, event, helper) {

        console.log(component.get('v.eventList'));
        var resources = component.get('v.resourcesList');
        var contractResourceIdList = [];
        for(var i=0; i<resources.length; i++){
                contractResourceIdList.push(resources[i].ContractresourceId);
        }
        component.set("v.contractResourceListIds",contractResourceIdList);
        var index = contractResourceIdList.indexOf(component.get("v.newContractResource"));
        console.log(index,component.get("v.selectedContractResourceIndex"))
        helper.buildCalendarWithTasks(component,helper,component.get('v.resourcesList'),component.get("v.selectedContractResourceIndex"));
    },

    handleSelectedProject :function (component, event, helper) {
        component.set("v.selectedProjFromResSelect", "");

        // console.log('{} ==> ',component.get("v.projectListClone"));
        // if(component.get("v.projectListClone").length > 0){
        //     var oldprojectList = component.get("v.projectList");
        //     oldprojectList.pop();
        //     component.set("v.projectList", oldprojectList);
        //     component.set("v.newSelectedProjectIdClone", []);
        //     component.set("v.projectListClone",[]);
        // }
        if (!component.get("v.initialLoadComplete") && !event) {
            // Skip if this is the automatic initial selection
            component.set("v.initialLoadComplete", true);
            return;
        }
        
        event.stopPropagation();
        helper.updateConflictToStandardView(component, helper);
        var toggleText = event.currentTarget;
        console.log(event.currentTarget);
        var activeEle = document.getElementsByClassName('nav-link active')[0];

        if(toggleText.classList.contains('active')){
            toggleText.classList.remove('active');
            if(component.get("v.recordId") != '' && component.get("v.recordId") != undefined && component.get("v.recordId") != null){
                component.set("v.newSelectedProjectId",component.get("v.newSelectedProjectIdClone"));
            }else{
                
                component.set("v.newSelectedProjectId",[]);
                component.set("v.newSelectedProjectIdClone",[]);
                component.set("v.selectedSingleProjectId", '');
                component.set("v.projectListClone",[]);
            }
            component.set("v.newContractResource","");
            component.set("v.selectedContractResourceIndex",-1);
            component.set("v.showSpinner",true);
            helper.getTasksByProjects(component,helper, component.get("v.dateval"));
        }else{
            if(activeEle){
                activeEle.classList.remove('active');
            }
            $A.util.toggleClass(toggleText, "active");
            component.set("v.showSpinner",true);

            if(event.currentTarget.dataset.projid){
           	    let projId = event.currentTarget.dataset.projid;
                component.set("v.newSelectedProjectId",[projId]);
                component.set("v.selectedSingleProjectId",projId);
                component.set("v.newSelectedProjectIdClone",[projId]);
                var projectList = component.get("v.projectList");
                for (var i = 0; i < projectList.length; i++) {
                    if (projectList[i].projectRecId === projId) {
                        component.set("v.projectListClone", projectList[i]);
                    }
                }
                console.log('projectListClone ==> ',component.get("v.projectListClone"));
            }else{
                component.set("v.newSelectedProjectId",[]);
                component.set("v.newSelectedProjectIdClone",[]);
                component.set("v.projectListClone",[]);
            }

            component.set("v.newContractResource","");
            component.set("v.selectedContractResourceIndex","-1");
            var todayDate = new Date(component.get("v.dateval"));
            var newfromdate = new Date(todayDate.getFullYear(), todayDate.getMonth(),1);
            var newtodate;
            if(todayDate.getMonth() == 11){
                newtodate = new Date(todayDate.getFullYear()+1, 0,0);
            }else{
                newtodate = new Date(todayDate.getFullYear(), todayDate.getMonth()+1,0);
            }

            var newFromstr,newTostr;
            newFromstr = $A.localizationService.formatDate(newfromdate, "yyyy-MM-dd");
       		newTostr = $A.localizationService.formatDate(newtodate, "yyyy-MM-dd")
            console.log('ans 2--->' ,component.get("v.newSelectedProjectId"));
            component.set("v.isPrevSelectedResource", "");
            var action = component.get("c.getScheduleItemsByProject");
            action.setParams({
                fromDate: newFromstr,
                toDate: newTostr,
                slectedTradetypeId: component.get("v.selectedTradetype").Id,
                slectedprojectId: component.get("v.newSelectedProjectId"),
                slectedcontactId: component.get("v.newContractResource"),
                projectSearch: component.get("v.searchProjectFilter"),
                resourceSearch: component.get("v.searchResourceFilter"),
                tradeTypeSearch: component.get("v.searchTradeTypeFilter"),
                taskNameSearch: component.get("v.searchTaskNameFilter"),
                alltypeSearch: component.get("v.allFilter"),
                projectStatus: component.get("v.projectStatusValue"),
                resourceFilter: component.get("v.resourceFilterValue")
            });
            action.setCallback(this, function (response) {
                var state = response.getState();
                if(state === "SUCCESS"){
                    console.log('response.getReturnValue()::',response.getReturnValue());
                    component.set("v.showSpinner", false);

                    var evetList = [];
                    var projColors = component.get("v.projectColors");
                    var resourceColor = component.get("v.resourceColors");

                    //double tasks will appear in calendar as for eg: dave has 2 tasks and tery is resource for the same one of the tasks that dave had.
                    console.log('check list before loop ',response.getReturnValue().calendarTaskList);
                    for(var k=0;k<response.getReturnValue().calendarTaskList.length;k++){
                        if(response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList){
                            for(var j=0;j<response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList.length;j++){
                                var weekName = response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['weekName'];
                                var startDate = response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['startdate'];
                                if(weekName != null && weekName != undefined){
                                    var dayNames = component.get("v.dayNames");
                                    response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['weekSubStr'] = dayNames[new Date(Date.parse(startDate)).getDay()].substring(0,3);
                                }

                                response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['startdateNum'] = new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0");
                                var endDate = response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['enddate'];
                                response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['startdateFormatted'] =  $A.localizationService.formatDate(startDate, 'MM-dd-yyyy');
                                response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['enddateFormatted'] =  $A.localizationService.formatDate(endDate, 'MM-dd-yyyy');
                                let getDateOnly = (date) => {
                                    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                };
                                response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['eventClass'] = getDateOnly(new Date(endDate)) < getDateOnly(new Date()) && response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['Completion'] < 100? 'event_red': 'event_blue';
                                response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['colorName'] = resourceColor[k%10];
                                console.log('color logic value for resource -> ',k%10);
                                evetList.push(response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]);
                            }
                        }
                    }
                    component.set("v.eventList", evetList);
                    component.set("v.dateEventList",evetList);
                    component.set("v.standardEventList",evetList);
                    component.set("v.resourcesList",response.getReturnValue().calendarTaskList);
                    component.set("v.areExternalResource", response.getReturnValue().areExternalResource);
                    component.set("v.areInternalResource", response.getReturnValue().areInternalResource);

                    document.getElementById('mycalendar').style.display = 'block';
                    document.getElementById('mycalendar2').style.display = 'none';

                    /*reset selected resource  */
                    document.getElementById('profileBgSymbol').className = "profile_name me-3 prof_bg2";
                    document.getElementById('resourceInitials').innerText = 'R';
                    document.getElementById('selectedContractResource').innerText = 'Resource';
                    document.getElementById('selectedContractResourceTradeType').innerText = 'Trade Type';

                    var calendarBuild = component.get("c.buildCalendar");
                    $A.enqueueAction(calendarBuild);
                } else {
                    component.set("v.showSpinner", false);
                    console.log('error',response.getError());
                }
            });
            $A.enqueueAction(action);
        }
    },

    selectedResource :function (component, event, helper) {
        try {
            
            helper.updateConflictToStandardView(component, helper);
            event.stopPropagation();
            var toggleText = event.currentTarget;
            console.log(event.currentTarget);
            var activeEle = document.getElementsByClassName('list-group-item activeResource')[0];
            
            if(toggleText.classList.contains('activeResource')){
                toggleText.classList.remove('activeResource');
                component.set("v.newContractResource","");
                component.set("v.selectedContractResourceIndex",-1);
                component.set("v.showSpinner",true);
                
                helper.getTasksByProjectId(component,helper);

            } else{
                if(activeEle){
                    activeEle.classList.remove('activeResource');
                }
                $A.util.toggleClass(toggleText, "activeResource");

                var resources = component.get("v.resourcesList");//component.get("v.eventList");
                console.log('Hii->' ,toggleText.dataset);
                var projIndex = Number(toggleText.dataset.projindex);
                var resourceIndex = Number(toggleText.dataset.resourceindex);
                var resourceId = toggleText.dataset.contractresourceid;
                console.log({resourceId});
                var profileSymbol = toggleText.dataset.profilesbl;//profileBgSymbol;
        
                component.set("v.selectedContractResourceIndex",resourceIndex);
                console.log('selected resource index-->'+resourceIndex);
                
        
                if(resources.length){
                    component.set("v.showSpinner",true);

                    if(resourceId){
                        component.set("v.newContractResource",resourceId);
                    }else{
                        component.set("v.newContractResource","");
                    }
                    document.getElementById('profileBgSymbol').className = "profile_name me-3 "+profileSymbol;
                    document.getElementById('resourceInitials').innerText = resources[resourceIndex].FirstLetterofContractresourceName;
                    document.getElementById('selectedContractResource').innerText = resources[resourceIndex].ContractresourceName;
                    document.getElementById('selectedContractResourceTradeType').innerText = resources[resourceIndex].TradeType ? resources[resourceIndex].TradeType : 'None';
                    
                    // BUIL- 4638
                    var originalProjList = component.get("v.projectList");
                    console.log(originalProjList);
                    var resList = component.get("v.resourcesList");
                    console.log(resList);
                    // Step 1: Find the resource in resourceList
                    let matchedResource = null;
        
                    for (let i = 0; i < resList.length; i++) {
                        console.log('resList[i].ContractresourceId ==> ' , resList[i].ContractresourceId);
                        if (resList[i].ContractresourceId === resourceId) {
                            matchedResource = resList[i];
                            break;
                        }
                    }
                    console.log('matchedResource ==> ', matchedResource);
                    // Step 2: Find matching projects in projectList
                    let projectRecIds = [];
                    if (matchedResource) {
                        let ContractresourceName  = matchedResource.ContractresourceName;
                        console.log({ ContractresourceName });
                        for (let i = 0; i < originalProjList.length; i++) {
                            let calendarList = originalProjList[i].CalendarWrapList;
                            for (let j = 0; j < calendarList.length; j++) {
                                if (
                                    calendarList[j].Vendor === ContractresourceName ||
                                    calendarList[j].ContractresourceName === ContractresourceName ||
                                    calendarList[j].Resource1 === ContractresourceName ||
                                    calendarList[j].Resource2 === ContractresourceName ||
                                    calendarList[j].Resource3 === ContractresourceName ||
                                    calendarList[j].InternalUser === ContractresourceName ||
                                    calendarList[j].InternalResource === ContractresourceName ||
                                    calendarList[j].InternalResource1 === ContractresourceName ||
                                    calendarList[j].InternalResource3 === ContractresourceName ||
                                    calendarList[j].InternalResource4 === ContractresourceName
                                ) {
                                    projectRecIds.push(originalProjList[i].projectRecId);
                                    break; // Move to the next project as we found a match
                                }
                            }
                        }
                    }
        
                    // Output the results
                    if (projectRecIds.length > 0) {
                        console.log("Matched Project IDs:", projectRecIds);
                    } else {
                        console.log("No matching project IDs found.");
                    }
                    if(component.get("v.selectedSingleProjectId") != ""){
                        component.set("v.selectedSingleProjectId", "");
                    }
                    component.set("v.selectedProjFromResSelect", projectRecIds[0]);
                    component.set("v.newSelectedProjectIdClone", [projectRecIds[0]]);
                    console.log(' --> ', component.get("v.selectedProjFromResSelect"));

                    helper.getTasksByProjectId(component,helper);
                }
            }
        } catch (error) {
            console.log('error-->',error);
            
        }
    },

    standardViewCalendar: function (component, event, helper) {
        var currEle = event.currentTarget;
        var activeEle = document.getElementsByClassName('calendarView active')[0]
        if(activeEle){
            activeEle.classList.remove('active');
        }
        if(!currEle.classList.contains('active')){
            currEle.classList.add('active')
        }
        component.set("v.isConflictview","Standard");
        component.set("v.newSelectedProjectId",[]);
        helper.getTasksByProjects(component,helper, component.get("v.dateval"));
        component.resetEventListeners();
        event.stopPropagation();
    },

    conflictsViewCalendar: function (component, event, helper) {
        
        var currEle = event.currentTarget;
        var activeEle = document.getElementsByClassName('calendarView active')[0]
        if(activeEle){
            activeEle.classList.remove('active');
        }
        if(!currEle.classList.contains('active')){
            currEle.classList.add('active')
        }
        component.set("v.isConflictview","Conflicts");
        component.set("v.showSpinner",true);
        component.conflictData();
        event.stopPropagation();
    },

    onRender: function(component, event, helper) {
        var profileSymbols = document.getElementsByClassName('profile_name');
        var leftNav = document.getElementsByClassName('list-group-item').length;

        if(profileSymbols.length >1 && leftNav){
            console.log(profileSymbols.length)
            for(var i=0;i<profileSymbols.length-1;i++){
                var ele = profileSymbols[i];
                var indexVal = (i)%10;
                var className = 'prof_bg' + Number(indexVal+1);
                if(!ele.classList.contains(className)){
                    ele.classList.add(className);
                    if(document.getElementsByClassName('list-group-item')[i]){
                         document.getElementsByClassName('list-group-item')[i].setAttribute("data-profilesbl", className);
                    }
                }
            }
        }

        var projectProfileSymbols = document.getElementsByClassName('Proj_profile_name');
        if(projectProfileSymbols.length >0){
            console.log(projectProfileSymbols.length)
            for(var i=0;i<projectProfileSymbols.length;i++){
                var ele = projectProfileSymbols[i];
                var indexVal = (i)%10;
                var className = 'proj_prof_bg' + Number(indexVal+1);
                if(!ele.classList.contains(className)){
                    ele.classList.add(className);
                    if(document.getElementsByClassName('nav-link')[i]){
                        document.getElementsByClassName('nav-link')[i].setAttribute("data-projprofilesbl", className);
                    }
                }
            }
        }
    },

    checkContent :  function (component, event, helper) {
        var profileSymbols = document.getElementsByClassName('profile_name'); // $('.profile_name')
        console.log(profileSymbols.length)
        console.log(document.getElementsByClassName('list-group-item').length)
    },

    calendarDayView :  function (component, event, helper) {
        var currEle = event.currentTarget;
        component.set("v.currentCalendarView","dayView");

        const activeEles = document.querySelectorAll(`.viewChange`);
        if(activeEles.length){
            for(var i=0; i< activeEles.length; i++){
                if(activeEles[i].dataset.name == component.get('v.currentCalendarView')){
                    if(!activeEles[i].classList.contains('active')){
                        activeEles[i].classList.add('active');
                    }
                }
                else{
                    activeEles[i].classList.remove('active');
                }
            }
        }

        /*hide week header*/
        var weekHeader = document.getElementsByClassName('weekly-header');
        if(weekHeader.length){
            weekHeader[0].style.display = 'none';
        }

        /*hide calendar view*/
        document.getElementById('mycalendar').style.display = 'none';
        /*Show day view div*/
        document.getElementById('mycalendar2').style.display = 'block';
        /*show day view header*/
        document.getElementsByClassName('daily-header')[0].style.display = 'block';

        var currentDateValue1 = new Date(component.get("v.dateval"));
        var currentDateValue = new Date(currentDateValue1.getFullYear(),currentDateValue1.getMonth(),1);
        var actualDateValue = new Date();
        var todayDateHeader = component.get('v.todayDateHeader');
        console.log("date 1--> "+actualDateValue);

        if(actualDateValue.getFullYear() == currentDateValue.getFullYear() && actualDateValue.getMonth() == currentDateValue.getMonth() && actualDateValue.getDate() == currentDateValue.getDate()){
            console.log("date 2--> "+actualDateValue);
            todayDateHeader = actualDateValue.toDateString();
            console.log("date 3--> "+actualDateValue);
        }

        //todayDateHeader = component.get('v.todayDateHeader');
        console.log("date 4--> "+todayDateHeader);
        var today = new Date(Date.parse(todayDateHeader));
        var newtodate = new Date(Date.parse(todayDateHeader)).setHours(0,0,0,0);
        var comparedate = new Date(helper.getAdjustedDate(todayDateHeader)).setHours(0, 0, 0, 0);
        var weeks = component.get("v.dayNames")
        component.set("v.currDay",weeks[new Date(Date.parse(component.get("v.dateval"))).getDay()].substring(0,3));
        component.set("v.currDate",new Date(Date.parse(component.get("v.dateval"))).getDate().toString().padStart(2, "0"));
        var newfromdate;
        
        console.log('eventlist-->',component.get("v.standardEventList"));
        var evenList = component.get("v.eventList");
        console.log('LOGGING CONFLICT VIEW', component.get("v.isConflictview"));
        
        if(component.get("v.isConflictview") == "Conflicts"){
            var currentDateEventList = [];
            var conflictEventList = [];
            var resourceCountMap = new Map();
            let currentEventMap = new Map();
            for (var i = 0; i < evenList.length; i++) {
                var eventItem = evenList[i];
                var eventStartDate = new Date(Date.parse(eventItem['startdate'])).setHours(0, 0, 0, 0);
                var eventEndDate = new Date(Date.parse(eventItem['enddate'])).setHours(0, 0, 0, 0);
        
                if (eventStartDate <= comparedate && eventEndDate >= comparedate && !currentEventMap.has(eventItem['Id'])) {
                    currentDateEventList.push(eventItem);
                    currentEventMap.set(eventItem['Id'], true);
                    var resourceId = eventItem['contractresourceId'];
                    if (!resourceCountMap.has(resourceId)) {
                        resourceCountMap.set(resourceId, 1);
                    } else {
                        resourceCountMap.set(resourceId, resourceCountMap.get(resourceId) + 1);
                    }
                }
            }
        
            console.log('Filtered currentDateEventList:', currentDateEventList);
            console.log('Resource Count Map:', Array.from(resourceCountMap.entries()));
        
            // Step 2: Add events to conflictEventList if their contractresourceId occurs more than once
            for (var i = 0; i < currentDateEventList.length; i++) {
                var eventItem = currentDateEventList[i];
                var resourceId = eventItem['contractresourceId'];
        
                if (resourceCountMap.get(resourceId) > 1) {
                    conflictEventList.push(eventItem);
                }
            }
            component.set("v.dateEventList",conflictEventList);
        }
        else{
            var currentDateEventList = [];
            let currentEventMap = new Map();
            for(var i=0;i<evenList.length;i++){
                var eventItem = evenList[i];
                var eventStartDate = new Date(Date.parse(eventItem['startdate'])).setHours(0,0,0,0);

                var eventEndDate = new Date(Date.parse(eventItem['enddate'])).setHours(0,0,0,0);
                console.log('eventEnddate-->'+eventEndDate);

                if(eventStartDate <= comparedate && eventEndDate >=  comparedate && !currentEventMap.has(eventItem['Id'])){
                    currentDateEventList.push(eventItem);
                    currentEventMap.set(eventItem['Id'], true);
                }
            }
            console.log("allevents ",evenList);
            component.set("v.dateEventList",currentDateEventList);
            console.log('currentDateEventList--> ',currentDateEventList);
            component.set('v.todayDateHeader',new Date(newtodate).toDateString());
            component.set("v.todayDate",new Date(newtodate).toLocaleDateString());
		    event.stopPropagation();
        }
    },

    calendarWeekView :  function (component, event, helper) {
        component.set("v.currentCalendarView","weekView");

        const activeEles = document.querySelectorAll(`.viewChange`);
        if(activeEles.length){
            for(var i=0; i< activeEles.length; i++){
                if(activeEles[i].dataset.name == component.get('v.currentCalendarView')){
                    if(!activeEles[i].classList.contains('active')){
                        activeEles[i].classList.add('active');
                    }
                }
                else{
                    activeEles[i].classList.remove('active');
                }
            }
        }

        /* Show Calendar view Div */
        document.getElementById('mycalendar').style.display = 'block';

        /*show week header*/
        var weekHeader = document.getElementsByClassName('weekly-header');
        if(weekHeader.length){
            weekHeader[0].style.display = 'block';
        }

        /* Hide Month Header*/
        var monthlyHeader = document.getElementsByClassName('monthly-header');
        if(monthlyHeader.length){
            monthlyHeader[0].style.display = 'none';
        }

        /*hide day view div*/
        document.getElementById('mycalendar2').style.display = 'none';
        document.getElementsByClassName('daily-header')[0].style.display = 'none';

        var dayListParent = document.getElementsByClassName('monthly-event-list');
        var dayListItems = document.getElementsByClassName('monthly-list-item');
        if(dayListParent.length){
            console.log(dayListParent[0]);
            dayListParent[0].style.display = 'block';
            dayListParent[0].style.transform= 'scale(1)';
            //jquery method -method1
            if(dayListItems.length){
                //console.log(jQuery('.monthly-list-item'))
                if($("#mycalendar .monthly-event-list").is(":visible")) {
                    $("#mycalendar .monthly-cal").remove();
                    $("#mycalendar .monthly-header-title").prepend('<a href="#" class="monthly-cal"></a>');
                }
                jQuery('.monthly-list-item').css("display","block");
            }

            component.reloadCurrentWeekCalendar();
            var weeks = component.get("v.dayNames")
            console.log('component.get(todayDateHeader) ::--->' , component.get('v.todayDateHeader'));
            component.set("v.currDay",weeks[new Date(Date.parse(component.get('v.todayDateHeader'))).getDay()].substring(0,3));
            component.set("v.currDate",new Date(Date.parse(component.get('v.todayDateHeader'))).getDate().toString().padStart(2, "0"));
        }
        event.stopPropagation();
    },

    calendarMonthView  :  function (component, event, helper) {
        component.set("v.currentCalendarView","monthView");

        const activeEles = document.querySelectorAll(`.viewChange`);
        if(activeEles.length){
            for(var i=0; i< activeEles.length; i++){
                if(activeEles[i].dataset.name == component.get('v.currentCalendarView')){
                    if(!activeEles[i].classList.contains('active')){
                        activeEles[i].classList.add('active');
                    }
                }
                else{
                    activeEles[i].classList.remove('active');
                }
            }
        }

        /*hide week header*/
        var weekHeader = document.getElementsByClassName('weekly-header');
        if(weekHeader.length){
            weekHeader[0].style.display = 'none';
        }

        /* Show Month Header*/
        var monthlyHeader = document.getElementsByClassName('monthly-header');
        if(monthlyHeader.length){
            monthlyHeader[0].style.display = 'block';
        }
		/* Show Calendar view Div */
        document.getElementById('mycalendar').style.display = 'block';

        /*hide day view div*/
        document.getElementById('mycalendar2').style.display = 'none';
        document.getElementsByClassName('daily-header')[0].style.display= 'none';

        var dayListParent = document.getElementsByClassName('monthly-event-list');
        var dayListItems = document.getElementsByClassName('monthly-list-item');
        var monthViewBtn = document.getElementsByClassName('monthly-cal');
        if(monthViewBtn.length){
            monthViewBtn[0].remove();
        }
        if(dayListParent.length){
            console.log(dayListParent[0]);
            dayListParent[0].style.display = 'none';
            dayListParent[0].style.transform= 'scale(0)';
        }
        //component.reloadCurrentDateCalendar();
        event.stopPropagation();
    },

    previousMonth: function (component, event, helper) {
        console.log('previous month called');
        component.set("v.selectedProjFromResSelect", "");

        document.getElementById('profileBgSymbol').className = "profile_name me-3 prof_bg2";
        document.getElementById('resourceInitials').innerText = 'R';
        document.getElementById('selectedContractResource').innerText = 'Resource';
        document.getElementById('selectedContractResourceTradeType').innerText = 'Trade Type';

        component.set("v.showSpinner", true);
        if(component.get("v.newContractResource") != ''){
            component.set("v.isPrevSelectedResource", component.get("v.newContractResource"));
        }
        component.set("v.newContractResource","");
         if(component.get("v.recordId") != '' && component.get("v.recordId") != undefined && component.get("v.recordId") != null){
            component.set("v.newSelectedProjectId",component.get("v.newSelectedProjectIdClone"));
        }
        else{
            component.set("v.newSelectedProjectId",[]);
        }
        component.set("v.selectedContractResourceIndex",-1);

        var todayDate = new Date(component.get("v.dateval"));
        var prevMonth
        if(todayDate.getMonth() == 0){
            prevMonth = new Date(todayDate.getFullYear()-1, 12, 0);
        }else{
            prevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 0);
        }
        var weeks = component.get("v.dayNames")
        component.set("v.currDay",weeks[new Date(Date.parse(prevMonth)).getDay()].substring(0,3));
        component.set("v.currDate",new Date(Date.parse(prevMonth)).getDate().toString().padStart(2, "0"));
        component.set("v.dateval",prevMonth);
        component.set("v.datevalString",prevMonth.toLocaleDateString());
        component.set('v.todayDateHeader',prevMonth.toDateString());
        component.set("v.todayDate",prevMonth.toLocaleDateString());
        //helper.currentWeekDates(component,helper, component.get("v.dateval"));
        component.set("v.isConflictview","Standard");
        var standardButton = document.getElementById('standardButton');
        var conflictButton = document.getElementById('conflictButton');
        var isStandardView = component.get("v.isConflictview") === "Standard";
    
        if (isStandardView) {
            if (!standardButton.classList.contains('active')) {
                standardButton.classList.add('active');
            }
            if (conflictButton.classList.contains('active')) {
                conflictButton.classList.remove('active');
            }
        } else {
            if (!conflictButton.classList.contains('active')) {
                conflictButton.classList.add('active');
            }
            if (standardButton.classList.contains('active')) {
                standardButton.classList.remove('active');
            }
        }
        component.set("v.setProjectListWithOriginalDataOnce",true);
        
        helper.getTasksByProjects(component, helper, component.get("v.dateval"));
        var monthBtn = document.getElementsByClassName('viewChange')[2];
        var activeEle = document.getElementsByClassName('viewChange active')[0]
        if(activeEle){
            activeEle.classList.remove('active');
        }
        if(!monthBtn.classList.contains('active')){
            monthBtn.classList.add('active')
        }
    },

    nextMonth: function (component, event, helper) {
        console.log('next month called');
        component.set("v.selectedProjFromResSelect", "");

        document.getElementById('profileBgSymbol').className = "profile_name me-3 prof_bg2";
        document.getElementById('resourceInitials').innerText = 'R';
        document.getElementById('selectedContractResource').innerText = 'Resource';
        document.getElementById('selectedContractResourceTradeType').innerText = 'Trade Type';

        component.set("v.showSpinner", true);
        if(component.get("v.newContractResource") != ''){
            component.set("v.isPrevSelectedResource", component.get("v.newContractResource"));
        }
        component.set("v.newContractResource", "");
        if (component.get("v.recordId") != '' && component.get("v.recordId") != undefined && component.get("v.recordId") != null) {
            component.set("v.newSelectedProjectId", component.get("v.newSelectedProjectIdClone"));
        } else {
            component.set("v.newSelectedProjectId", []);
        }
        component.set("v.selectedContractResourceIndex", -1);
        var todayDate = new Date(component.get("v.dateval"));
        var nextMonth;
        if (todayDate.getMonth() == 11) {
            nextMonth = new Date(todayDate.getFullYear() + 1, 0, 1);
        } else {
            nextMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 1);
        }
        var weeks = component.get("v.dayNames")
        component.set("v.currDay",weeks[new Date(Date.parse(nextMonth)).getDay()].substring(0,3));
        component.set("v.currDate",new Date(Date.parse(nextMonth)).getDate().toString().padStart(2, "0"));
        component.set("v.dateval", nextMonth);
        component.set("v.datevalString", nextMonth.toLocaleDateString());
        component.set('v.todayDateHeader', nextMonth.toDateString());
        component.set("v.todayDate", nextMonth.toLocaleDateString());
        component.set("v.weekIndex", 0)
        component.set("v.setProjectListWithOriginalDataOnce",true);

        helper.updateConflictToStandardView(component, helper);
        helper.getTasksByProjects(component, helper, component.get("v.dateval"));
    },

    currentDateMonth: function (component, event, helper) {
        component.set("v.isConflictview","Standard");
        var standardButton = document.getElementById('standardButton');
        var conflictButton = document.getElementById('conflictButton');
        var isStandardView = component.get("v.isConflictview") === "Standard";
    
        if (isStandardView) {
            if (!standardButton.classList.contains('active')) {
                standardButton.classList.add('active');
            }
            if (conflictButton.classList.contains('active')) {
                conflictButton.classList.remove('active');
            }
        } else {
            if (!conflictButton.classList.contains('active')) {
                conflictButton.classList.add('active');
            }
            if (standardButton.classList.contains('active')) {
                standardButton.classList.remove('active');
            }
        }
        
        document.getElementById('profileBgSymbol').className = "profile_name me-3 prof_bg2";
        document.getElementById('resourceInitials').innerText = 'R';
        document.getElementById('selectedContractResource').innerText = 'Resource';
        document.getElementById('selectedContractResourceTradeType').innerText = 'Trade Type';

        component.set("v.showSpinner", true);
        component.set("v.newContractResource","");
         if(component.get("v.recordId") != '' && component.get("v.recordId") != undefined && component.get("v.recordId") != null){
            component.set("v.newSelectedProjectId",component.get("v.newSelectedProjectIdClone"));
        }else{
            component.set("v.newSelectedProjectId",[]);
        }
        component.set("v.selectedContractResourceIndex",-1);
        var today = new Date();
        var Datevalue = new Date(today.getFullYear(), today.getMonth(), 1);
        component.set("v.datevalString",Datevalue.toLocaleDateString());
        console.log('Datevalue.toDateString() :---->' ,Datevalue.toDateString());
        //helper.currentWeekDates(component,helper, component.get("v.dateval"));

        // Chnages for BUIL-3936
        var newtodate = new Date(Date.parse(today)).setHours(0,0,0,0);
        component.set("v.todayDate",new Date(newtodate).toLocaleDateString());
        component.set("v.dateval" ,today );
        $(`#datepickerPlaceholder`).datepicker('setDate', today);
        console.log('defaultDate ->> ',$(`#datepickerPlaceholder`).datepicker('getDate') );
        helper.getTasksByProjects(component,helper, component.get("v.dateval"));
        $(`#datepickerPlaceholder`).datepicker({
            changeMonth: true,
            changeYear: true,
            showOn: 'button',
            dateFormat: 'yy-MM-dd',
            yearRange: '-20:+20',
            showAnim: 'fold',
                onSelect: function(dateText, inst) {
                    // Handle the selected date
                    console.log('Selected date:', dateText);
                    component.set("v.startDt" ,dateText);
                    $(`#datepickerPlaceholder`).hide();
                    helper.handleSaveDates(component,event,helper);
                }
            });
        $(`#datepickerPlaceholder`).hide();
    },

	previousWeek: function (component, event, helper) {
        console.log('previous week called');
        console.log('inside previousweek');
        var currentDateValue = new Date(component.get("v.dateval"));
        console.log('currentDateValue :---->' , currentDateValue);
        var currentMonthLastDate ;
        if(currentDateValue.getMonth() == 11){
            currentMonthLastDate = new Date(currentDateValue.getFullYear()+1, 0, 0);
        }else{
            currentMonthLastDate = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth()+1, 0);
        }

        var currentWeekIndex = component.get("v.weekIndex") - 1;
        var index = (currentWeekIndex)* 7;
        var evetListEle = Object.values(document.getElementsByClassName("monthly-list-item"));
        if(!evetListEle.length){
            evetListEle = $('.monthly-list-item');
        }
        $('.monthly-list-item').css("display","none");
        console.log(evetListEle.slice(index,index+7));
        console.log(currentMonthLastDate.getDate());

       	var selectedWeekDIvs;
        var WeekeaderTitle = document.getElementsByClassName('weekly-header-title-date');
        if(currentWeekIndex+1 == 0){
            component.reloadPrevCalendar();
            component.set("v.weekIndex",0);
        }else if(index <= currentMonthLastDate.getDate() && evetListEle.length >= index+7){
            selectedWeekDIvs = evetListEle.slice(index,index+7);
            for(var i=0; i<selectedWeekDIvs.length;i++){
                selectedWeekDIvs[i].style.display = "block";
            }
            if(WeekeaderTitle.length){
                WeekeaderTitle[0].innerText = 'Week '+Number(index+1)+'-'+Number(index+7); //currentDateValue.getMonth()
            }
            component.set("v.weekIndex",currentWeekIndex);
        }

        var act = component.get("c.previousWeekClone");
		$A.enqueueAction(act);
    },

    nextWeek: function (component, event, helper) {
        console.log('inside nextWeek');
        var currentDateValue = new Date(component.get("v.dateval"));
        var currentMonthLastDate ;
        if(currentDateValue.getMonth() == 11){
            currentMonthLastDate = new Date(currentDateValue.getFullYear()+1, 0, 0);
        }else{
            currentMonthLastDate = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth()+1, 0);
        }

        var currentWeekIndex = component.get("v.weekIndex") + 1;
        var index = (currentWeekIndex) * 7;
        var evetListEle = Object.values(document.getElementsByClassName("monthly-list-item"));
        if(!evetListEle.length){
            evetListEle = $('.monthly-list-item');
        }
        $('.monthly-list-item').css("display","none");
        console.log(evetListEle.slice(index,index+7));

       	var selectedWeekDIvs;
        var WeekeaderTitle = document.getElementsByClassName('weekly-header-title-date');
        console.log(currentMonthLastDate.getDate());
        if(index+7 > currentMonthLastDate.getDate() && index < currentMonthLastDate.getDate() ){ 
            selectedWeekDIvs = evetListEle.slice(index,currentMonthLastDate.getDate());
            for(var i=0; i<selectedWeekDIvs.length;i++){
                selectedWeekDIvs[i].style.display = "block";
            }
            if(WeekeaderTitle.length){
                WeekeaderTitle[0].innerText = 'Week '+Number(index+1)+'-'+Number(currentMonthLastDate.getDate());
            }
            component.set("v.weekIndex",currentWeekIndex);
        }else if(index <= currentMonthLastDate.getDate() && evetListEle.length >= index+7){
            selectedWeekDIvs = evetListEle.slice(index,index+7);
            for(var i=0; i<selectedWeekDIvs.length;i++){
                selectedWeekDIvs[i].style.display = "block";
            }
            if(WeekeaderTitle.length){
                WeekeaderTitle[0].innerText = 'Week '+Number(index+1)+'-'+Number(index+7); 
            }
            component.set("v.weekIndex",currentWeekIndex);
        }else{
            component.reloadNextCalendar();
            component.set("v.weekIndex",0);
        }

        var act = component.get("c.nextWeekClone");
		$A.enqueueAction(act);

    },

    currentWeek: function (component, event, helper) {
        var currentDateValue = new Date(component.get("v.dateval"));
        console.log("MINIMIZE :--->" , currentDateValue);
        var actualDateValue = new Date();

        var currentMonthLastDate ;
        if(currentDateValue.getMonth() == 11){
            currentMonthLastDate = new Date(currentDateValue.getFullYear()+1, 0, 0);
        }else{
            currentMonthLastDate = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth()+1, 0);
        }

        var currentWeekIndex;

        currentWeekIndex = 0;
        var index = currentWeekIndex * 7;

        var evetListEle = Object.values(document.getElementsByClassName("monthly-list-item"));
        if(!evetListEle.length){
            evetListEle = $('.monthly-list-item');
        }
        $('.monthly-list-item').css("display","none");
        console.log(evetListEle.slice(index,index+7));

       	var selectedWeekDIvs;
        var WeekeaderTitle = document.getElementsByClassName('weekly-header-title-date');
        if(index+7 > currentMonthLastDate.getDate() && index <= currentMonthLastDate.getDate()){
            selectedWeekDIvs = evetListEle.slice(index,currentMonthLastDate.getDate());
            for(var i=0; i<selectedWeekDIvs.length;i++){
                selectedWeekDIvs[i].style.display = "block";
            }
            if(WeekeaderTitle.length){
                WeekeaderTitle[0].innerText = 'Week '+Number(index+1)+'-'+Number(currentMonthLastDate.getDate()); 
            }
            component.set("v.weekIndex",currentWeekIndex);
        }else if(index <= currentMonthLastDate.getDate()){
            selectedWeekDIvs = evetListEle.slice(index,index+7);
            for(var i=0; i<selectedWeekDIvs.length;i++){
                selectedWeekDIvs[i].style.display = "block";
            }
            if(WeekeaderTitle.length){
                WeekeaderTitle[0].innerText = 'Week '+Number(index+1)+'-'+Number(index+7);
            }
            component.set("v.weekIndex",currentWeekIndex);
        }

		var act = component.get("c.currentWeekClone");
		$A.enqueueAction(act);
    },

    currentWeekClone: function(component, event, helper){
        console.log('Inside currentWeekClone');
        
        var currentDateValue = new Date(component.get("v.dateval"));
        console.log("Hi 1" , currentDateValue);
        var actualDateValue = new Date();


        var currentMonthLastDate ;
        if(currentDateValue.getMonth() == 11){
            currentMonthLastDate = new Date(currentDateValue.getFullYear()+1, 0, 0);
        }else{
            currentMonthLastDate = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth()+1, 0);
        }

        var currentWeekIndex = 0;
        console.log("test 1" ,actualDateValue + "curValue :-->  " + currentDateValue + "curWeekValue :-->  " + currentWeekIndex);

        if(actualDateValue.getFullYear() == currentDateValue.getFullYear() && actualDateValue.getMonth() == currentDateValue.getMonth() && actualDateValue.getDate() == currentDateValue.getDate()){
            console.log("test 1" ,actualDateValue , currentWeekIndex);

            if(actualDateValue.getDate()%7 == 0){
                console.log("test 2");
                currentWeekIndex = (actualDateValue.getDate()/7); //-1;
                if(new Date(actualDateValue.getFullYear(),actualDateValue.getMonth(),1).getDay() == 0){
                    console.log("test 3");
                    currentWeekIndex =  (actualDateValue.getDate()/7) - 1;
                }
                console.log("test 111" ,actualDateValue , currentWeekIndex);

            }else{
                let tempWeekIndex = 0;
                tempWeekIndex = Math.floor(currentDateValue.getDate()/7);
                if (tempWeekIndex !=0) {
                    currentWeekIndex = Math.ceil(currentDateValue.getDate()/7);
                } else {
                    currentWeekIndex = tempWeekIndex;
                }
                console.log("test 112" ,actualDateValue.getDate()/7 , currentWeekIndex);

            }

        }else{
            if(actualDateValue.getDate()%7 == 0){
                console.log("test 02");
                currentWeekIndex = (actualDateValue.getDate()/7); //-1;
                if(new Date(actualDateValue.getFullYear(),actualDateValue.getMonth(),1).getDay() == 0){
                    console.log("test 03");
                    currentWeekIndex =  (actualDateValue.getDate()/7) - 1;
                }
                console.log("test 1110" ,actualDateValue , currentWeekIndex);

            }else {
                let firstDayOfMonth = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth(), 1);
                let dayOfMonth = currentDateValue.getDate();

                // Calculate the week index based on the selected date
                currentWeekIndex = Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7) - 1;

                console.log("Week index:", currentWeekIndex);
            }
        }

        var weekDivs = document.getElementsByClassName('monthly-week');
        var weekDaysLength;
        console.log(document);
        console.log(weekDivs);
        var weekStartDate;
        var weekEndDate;
        var week;
        var weekStartText;
        var weekEndText;

        if(currentWeekIndex == 0){
            console.log("test 4");
            weekStartDate = 1;
            if(weekDivs.length){
                console.log("test 5");
                weekDaysLength = weekDivs[currentWeekIndex].children.length;
            }
            console.log("weekDaysLength :----->" ,weekDaysLength);
            for(var i=0;i<weekDaysLength;i++){
                if(weekDivs[currentWeekIndex].children[i].className.split('dateV')[1] != undefined && !weekDivs[currentWeekIndex].children[i].classList.contains('monthly-day-blank')){
                    console.log("test 6" ,weekDivs[currentWeekIndex].children[i].getElementsByClassName('monthly-day-number')[0]);
                    weekEndDate = weekDivs[currentWeekIndex].children[i].getElementsByClassName('monthly-day-number')[0].innerText;
                }
            }
            console.log("weekEndDate :--->" ,weekEndDate);
            console.log("weekStartDate :--->" ,weekStartDate);
            console.log("currentDateValue :--->" ,currentDateValue);
            weekEndText = weekEndDate

            if(Number(weekStartDate) == 1){
                console.log("test 7");
                if(currentDateValue.getMonth() == 0){
                    console.log("test 8");
                    weekStartText = new Date(currentDateValue.getFullYear(),0,currentDateValue.getDate()-currentDateValue.getDay()).getDate();
                }else{
                    weekStartText = new Date(currentDateValue.getFullYear(),currentDateValue.getMonth(),currentDateValue.getDate()-currentDateValue.getDay()).getDate();
                }
                console.log("weekStartText :--->" ,weekStartText);

                var eventList = component.get("v.eventList");
                var weekFullDate = new Date(currentDateValue.getFullYear(),currentDateValue.getMonth(),currentDateValue.getDate()-currentDateValue.getDay())
                console.log('weekFullDate :---->' ,weekFullDate);
                var pastEle = document.getElementsByClassName('calendarPast');
                if(pastEle.length){
                    console.log("test 9");
                    document.querySelectorAll('.calendarPast').forEach(function(a){
                        a.remove()
                    });
                }
                var pastMonthDates = [];
                var pastMonthDatesTemp = [];
                console.log("pastMonthDates curr :---->" ,currentDateValue.getDay());
                // Calculate the last day of the previous month (January)
                var lastDayOfPreviousMonth = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth(), 0).getDate();
                var firstDayOfCurrentMonth = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth(), 1).getDay();
                var noOfDaysToRemove = currentDateValue.getDay() - firstDayOfCurrentMonth;
                console.log('firstDayOfCurrentMonth :---->' , firstDayOfCurrentMonth);
                // Loop to display the past month dates
                for (var i = lastDayOfPreviousMonth; i > lastDayOfPreviousMonth - firstDayOfCurrentMonth; i--) {
                    var markupListEvent = '';
                    var dayName = component.get("v.dayNames");

                    // Create the date object for the past month date
                    var pastMonthDate = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth() - 1, i);

                    // Create and append the cell for the past month date
                    var div = document.createElement("DIV");
                    div.setAttribute('data-number', 'past' + i);
                    div.setAttribute('class', 'monthly-list-item item-has-event calendarPast');
                    div.setAttribute('id', 'mycalendarPast' + i);
                    var div2 = document.createElement("DIV");
                    div2.setAttribute('class', 'monthly-event-list-date');
                    div2.innerHTML = '<div class="monthly-event-list-date">' + dayName[pastMonthDate.getDay()].substring(0, 1).toUpperCase()+dayName[pastMonthDate.getDay()].substring(1, 3).toLowerCase() + '<br>' + i + '</br></div>';
                    div2.innerHTML += '<div class="noeventCls" style="padding:0.4em 1em;display:block;margin-bottom:0.5em;">No Events</div>';
                    div.innerHTML = div2.innerHTML;

                    $('#mycalendar .monthly-event-list').prepend(div);
                    pastMonthDatesTemp.push(i);
                }
                pastMonthDates = pastMonthDatesTemp;
                console.log('pastMonthDates :--->' ,pastMonthDates);
                var lastDayOfPastMonth = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth(), 0).getDate();

                // Loop through pastMonthDates array and remove extra values
                for (var i = pastMonthDates.length - 1; i >= 0; i--) {
                    var pastDate = pastMonthDates[i];
                    if (pastDate > lastDayOfPastMonth) {
                        // Remove the extra date from the array
                        pastMonthDates.splice(i, 1);
                    }
                }

                console.log('pastMonthDates after removing extras:', pastMonthDates ,pastMonthDates.length);
                for(var i = 0 ;i<eventList.length;i++){
                    var eve = eventList[i];
                    if(new Date(Date.parse(eve['startdate'])).setHours(0,0,0,0) < new Date(currentDateValue.getFullYear(),currentDateValue.getMonth(),Number(weekStartDate)).setHours(0,0,0,0).valueOf()){
                        console.log("test 12" ,eventList[i]);
                        //var markupListEvent = '<a title="'+eve.title+'" style="background:#99CCCC" data-eventid="'+eve.Id+'" class="listed-event" href="/lightning/r/buildertek__Project_Task__c/'+eve.Id+'/view">'+eve.title+'</a>'
                        var markupListEvent = '<a title="'+eve.title+'" style="background:'+eve.colorName+'" data-eventid="'+eve.Id+'" class="listed-event" href="/lightning/r/buildertek__Project_Task__c/'+eve.Id+'/view">'+eve.title+'</a>'
                        var dayName = component.get("v.dayNames");
                        for(var j=pastMonthDates.length-1;j>=0;j--){
                            var endDate = new Date(Date.parse(eve['enddate'])).setHours(0,0,0,0);
                            var startDate = new Date(Date.parse(eve['startdate'])).setHours(0,0,0,0);
                            console.log('endDate :--->' , endDate );
                            console.log('startDate :---> ',startDate);
                            console.log('startDate condition 1:---> ',endDate >= new Date(currentDateValue.getFullYear(),currentDateValue.getMonth()-1,Number(pastMonthDates[j])).setHours(0,0,0,0).valueOf());
                            console.log('startDate condition 2:---> ',startDate <= new Date(currentDateValue.getFullYear(),currentDateValue.getMonth()-1,Number(pastMonthDates[j])).setHours(0,0,0,0).valueOf());

                            if(endDate >= new Date(currentDateValue.getFullYear(),currentDateValue.getMonth()-1,Number(pastMonthDates[j])).setHours(0,0,0,0).valueOf() && startDate <= new Date(currentDateValue.getFullYear(),currentDateValue.getMonth()-1,Number(pastMonthDates[j])).setHours(0,0,0,0).valueOf()){
                                console.log("test 13");
                                var startdt = pastMonthDates[j];
                                console.log('startdt :--->' ,startdt);
                                var startDateFormat = new Date(currentDateValue.getFullYear(),currentDateValue.getMonth()-1,Number(pastMonthDates[j]))
                                var ele = document.getElementById('mycalendarPast'+startdt);
                                if(!ele){
                                    console.log("test 14");
                                    var div = document.createElement("DIV");
                                    div.setAttribute('data-number','past'+startdt);
                                    div.setAttribute('class','monthly-list-item item-has-event calendarPast');
                                    div.setAttribute('id','mycalendarPast'+startdt);
                                    var div2 = document.createElement("DIV");
                                    div2.setAttribute('class','monthly-event-list-date');
                                    div2.innerHTML = '<div class="monthly-event-list-date">'+dayName[startDateFormat.getDay()].substring(0,1).toUpperCase()+dayName[startDateFormat.getDay()].substring(1,3).toLowerCase()+'<br>'+pastMonthDates[j]+'</br></div>';

                                    div.innerHTML = div2.innerHTML
                                    div.innerHTML += markupListEvent;
                                    //div.innerHTML = markupListEvent;
                                    console.log(document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0]);
                                    $('#mycalendar .monthly-event-list').prepend(div);
                                    // document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0].prepend(div);
                                }else{
                                    var innerhtmlContent = document.getElementById('mycalendarPast'+pastMonthDates[j])
                                    if(innerhtmlContent.lastChild.innerText == 'No Events' && innerhtmlContent.getElementsByClassName('noeventCls').length){
                                        innerhtmlContent.lastChild.remove()
                                    }
                                    innerhtmlContent.innerHTML += markupListEvent;
                                }
                            }
                        }

                    }
                }
            }else{
                weekStartText = weekStartDate;
            }
        }else{
            if(currentWeekIndex > 0){
                console.log("test 15");
                if(weekDivs.length){
                    console.log("test 16");
                    weekDaysLength = weekDivs[currentWeekIndex].children.length;
                    console.log('weekDaysLength :--->' ,weekDaysLength);
                }
                //weekStartDate = weekDivs[currentWeekIndex].children[0].className.split('dateV')
                weekStartDate = weekDivs[currentWeekIndex].children[0].getElementsByClassName('monthly-day-number')[0].innerText;
                console.log('weekStartDate s1:--->' ,weekStartDate);

                weekStartText = weekStartDate
                // weekEndDate = weekDivs[currentWeekIndex].children[weekDaysLength-1].getElementsByClassName('monthly-day-number')[0].innerText;
                for(var i=0;i<weekDaysLength;i++){
                    if(weekDivs[currentWeekIndex].children[i].className.split('dateV')[1] != undefined && !weekDivs[currentWeekIndex].children[i].classList.contains('monthly-day-blank')){
                        console.log("test 17");
                        weekEndDate = weekDivs[currentWeekIndex].children[i].getElementsByClassName('monthly-day-number')[0].innerText;
                    }
                }
                weekEndText = weekEndDate;
                console.log('weekEndDate s1 -->', weekEndDate);
            }
        }

        if(currentMonthLastDate.getDate() == Number(weekEndDate)){
            console.log("test 18");
            weekEndText = new Date(currentDateValue.getFullYear(),currentDateValue.getMonth(),Number(weekStartDate)+6).getDate();
            var eventList = component.get("v.eventList");
            var weekFullDate ;//= new Date(currentDateValue.getFullYear(),currentDateValue.getMonth(),currentDateValue.getDate()-currentDateValue.getDay())
            var pastEle = document.getElementsByClassName('calendarPast');
            if(pastEle.length){
                console.log("test 19");
                document.querySelectorAll('.calendarPast').forEach(function(a){
                    a.remove()
                });
            }
            var futureMonthDates = [];
            var weekLastDate = 6-currentMonthLastDate.getDay();
            for(var i=1;i<=weekLastDate;i++){
                var markupListEvent = ''
                var dayName = component.get("v.dayNames");
                if(currentMonthLastDate.getMonth() == 11){
                    console.log("test 20");
                    weekFullDate = new Date(currentMonthLastDate.getFullYear()+1,0,i)//6-currentMonthLastDate.getDay()
                }else{
                    weekFullDate = new Date(currentMonthLastDate.getFullYear(),currentMonthLastDate.getMonth()+1,i)//6-currentMonthLastDate.getDay()
                }
                var ele = document.getElementById('mycalendarPast'+i);
                if(!ele){
                    console.log("test 21");
                    var div = document.createElement("DIV");
                    div.setAttribute('data-number','past'+i);
                    div.setAttribute('class','monthly-list-item item-has-event calendarPast');
                    div.setAttribute('id','mycalendarPast'+i);
                    var div2 = document.createElement("DIV");
                    div2.setAttribute('class','monthly-event-list-date');
                    div2.innerHTML = '<div class="monthly-event-list-date">'+dayName[weekFullDate.getDay()].substring(0,1).toUpperCase()+dayName[weekFullDate.getDay()].substring(1,3).toLowerCase()+'<br>'+i+'</br></div>';
                    div2.innerHTML += '<div class="noeventCls" style="padding:0.4em 1em;display:block;margin-bottom:0.5em;">No Events</div>'
                    div.innerHTML = div2.innerHTML
                    //div.innerHTML += markupListEvent;
                    console.log(document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0]);
                    $('#mycalendar .monthly-event-list').append(div);
                    futureMonthDates.push(i);
                    //document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0].insertAdjacentHTML('afterbegin',div)
                }
            }
            for(var i = 0 ;i<eventList.length;i++){
                var eve = eventList[i];
                if(new Date(Date.parse(eve['startdate'])).setHours(0,0,0,0) <= new Date(currentMonthLastDate.getFullYear(),currentMonthLastDate.getMonth(),Number(weekEndDate)).setHours(0,0,0,0).valueOf() && new Date(Date.parse(eve['enddate'])).setHours(0,0,0,0) > new Date(currentMonthLastDate.getFullYear(),currentMonthLastDate.getMonth(),Number(weekEndDate)).setHours(0,0,0,0).valueOf()){
                    console.log("test 22");
                    //var markupListEvent = '<a title="'+eve.title+'" style="background:#99CCCC" data-eventid="'+eve.Id+'" class="listed-event" href="/lightning/r/buildertek__Project_Task__c/'+eve.Id+'/view">'+eve.title+'</a>'
                    var markupListEvent = '<a title="'+eve.title+'" style="background:'+eve.colorName+'" data-eventid="'+eve.Id+'" class="listed-event" href="/lightning/r/buildertek__Project_Task__c/'+eve.Id+'/view">'+eve.title+'</a>'
                    var dayName = component.get("v.dayNames");
                    for(var j=0;j<futureMonthDates.length;j++){
                        var endDate = new Date(Date.parse(eve['enddate'])).setHours(0,0,0,0);
                        var startDate = new Date(Date.parse(eve['startdate'])).setHours(0,0,0,0);
                        if(endDate >= new Date(currentMonthLastDate.getFullYear(),currentMonthLastDate.getMonth()+1,Number(futureMonthDates[j])).setHours(0,0,0,0).valueOf() && startDate <= new Date(currentDateValue.getFullYear(),currentDateValue.getMonth()+1,Number(futureMonthDates[j])).setHours(0,0,0,0).valueOf()){
                            console.log("test 23");
                            var startdt = futureMonthDates[j];
                            var startDateFormat = new Date(currentDateValue.getFullYear(),currentDateValue.getMonth()+1,Number(futureMonthDates[j]))
                            var ele = document.getElementById('mycalendarPast'+startdt);
                            if(!ele){
                                console.log("test 24");
                                var div = document.createElement("DIV");
                                div.setAttribute('data-number','past'+startdt);
                                div.setAttribute('class','monthly-list-item item-has-event calendarPast');
                                div.setAttribute('id','mycalendarPast'+startdt);
                                var div2 = document.createElement("DIV");
                                div2.setAttribute('class','monthly-event-list-date');
                                div2.innerHTML = '<div class="monthly-event-list-date">'+dayName[startDateFormat.getDay()].substring(0,1).toUpperCase()+dayName[startDateFormat.getDay()].substring(1,3).toLowerCase()+'<br>'+futureMonthDates[j]+'</br></div>';

                                div.innerHTML = div2.innerHTML
                                div.innerHTML += markupListEvent;
                                //div.innerHTML = markupListEvent;
                                console.log(document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0]);
                                $('#mycalendar .monthly-event-list').append(div);
                                // document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0].prepend(div);
                            }else{
                                var innerhtmlContent = document.getElementById('mycalendarPast'+futureMonthDates[j])
                                if(innerhtmlContent.lastChild.innerText == 'No Events' && innerhtmlContent.getElementsByClassName('noeventCls').length){
                                    console.log("test 25");
                                    innerhtmlContent.lastChild.remove()
                                }
                                innerhtmlContent.innerHTML += markupListEvent;
                            }
                        }
                    }
                }
            }
        }
        console.log(weekStartDate,weekEndDate);
        //var weekEndText = weekEndDate
        var evetListEle = Object.values(document.getElementsByClassName("monthly-list-item"));
        if(!evetListEle.length){
            evetListEle = $('.monthly-list-item');
        }
        $('.monthly-list-item').css("display","none");
        var selectedWeekDIvs;
        console.log('selectedWeekDIvs 1:---->' , weekStartDate);
        var WeekeaderTitle = document.getElementsByClassName('weekly-header-title-date');
        //selectedWeekDIvs = evetListEle.slice(Number(weekStartDate)-1,Number(weekEndDate));

        // BUIL-4611-12
        if (Number(weekStartDate) == 1) {
            weekStartText = weekStartDate;
            weekEndText = weekEndDate;
            var firstDayOfCurrentMonth = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth(), 1).getDay();
            console.log('logging firstDayOfCurrentMonth',firstDayOfCurrentMonth);
            selectedWeekDIvs = evetListEle.slice(Number(weekStartDate) + firstDayOfCurrentMonth - 1, Number(weekEndDate) + firstDayOfCurrentMonth);
        } else {
            selectedWeekDIvs = evetListEle.slice(Number(weekStartDate) - 1, Number(weekEndDate));
        }
        if (Number(weekEndDate) == currentMonthLastDate.getDate()) {
            weekStartText = weekStartDate;
            weekEndText = weekEndDate;
            selectedWeekDIvs = evetListEle.slice(Number(weekStartDate) - 1, Number(weekEndDate));
        }

        console.log(selectedWeekDIvs);
        for(var i=0; i<selectedWeekDIvs.length;i++){
            console.log('Hi 4');
            selectedWeekDIvs[i].style.display = "block";
        }
        if(WeekeaderTitle.length){
            console.log('Hi 5');
            WeekeaderTitle[0].innerText = 'Week '+weekStartText+'-'+weekEndText; //currentDateValue.getMonth()
        }

        component.set("v.weekIndex",currentWeekIndex);
        event.stopPropagation();
        event.preventDefault();
        return false;
    },

    nextWeekClone: function (component, event, helper) {
        console.log('inside nextWeekClone');

        if (component.get("v.isProcessing")) {
            console.log("Skipping execution as the method is still processing");
            return;
        }
        component.set("v.isProcessing", true);
        
        var currentDateValue = new Date(component.get("v.dateval"));
        var currentMonthLastDate ;
        if(currentDateValue.getMonth() == 11){
            currentMonthLastDate = new Date(currentDateValue.getFullYear()+1, 0, 0);
        }else{
            currentMonthLastDate = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth()+1, 0);
        }
        var currentWeekIndex = component.get("v.weekIndex") + 1;
        var index = (currentWeekIndex) * 7;
        var weekDivs = document.getElementsByClassName('monthly-week');
        var weekDaysLength;
        console.log(weekDivs);
        var weekStartDate;
        var weekEndDate;
        var week;
        var weekStartText;
        var weekEndText

        var pastEle = document.getElementsByClassName('calendarPast');
        if(pastEle.length){
            document.querySelectorAll('.calendarPast').forEach(function(a){
                a.remove()
            });
        }

        if(currentWeekIndex < weekDivs.length){
            if(weekDivs.length){
                weekDaysLength = weekDivs[currentWeekIndex].children.length;
            }
            // weekStartDate = weekDivs[currentWeekIndex].children[0].className.split('dateV')
            for(var i=0;i<weekDaysLength;i++){
                if(weekDivs[currentWeekIndex].children[i].className.split('dateV')[1] != undefined){
                    weekStartDate = weekDivs[currentWeekIndex].children[i].getElementsByClassName('monthly-day-number')[0].innerText;
                    break;
                }
            }
            weekStartText = weekStartDate;
            for(var i=0;i<weekDaysLength;i++){
                if(weekDivs[currentWeekIndex].children[i].className.split('dateV')[1] != undefined && !weekDivs[currentWeekIndex].children[i].classList.contains('monthly-day-blank')){
                    weekEndDate = weekDivs[currentWeekIndex].children[i].getElementsByClassName('monthly-day-number')[0].innerText;
                }
            }
            weekEndText = weekEndDate;
        }
        if (currentWeekIndex == weekDivs.length){
            component.set("v.weekIndex", 0);
            component.set("v.isProcessing", false);
            let firstDayOfNextMonth = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth(), 1);
            component.set("v.dateval", firstDayOfNextMonth);
            component.set("v.isnextweekclone",true);

            if (weekDivs.length) {
                weekDaysLength = weekDivs[0].children.length;
            }
            for (var i = 0; i < weekDaysLength; i++) {
                if (weekDivs[0].children[i].className.split('dateV')[1] != undefined) {
                    weekStartDate = weekDivs[0].children[i].getElementsByClassName('monthly-day-number')[0].innerText;
                    break;
                }
            }
            
            weekStartText = weekStartDate;
            for (var i = 0; i < weekDaysLength; i++) {
                if (weekDivs[0].children[i].className.split('dateV')[1] != undefined && !weekDivs[0].children[i].classList.contains('monthly-day-blank')) {
                    weekEndDate = weekDivs[0].children[i].getElementsByClassName('monthly-day-number')[0].innerText;
                }
            }
            weekEndText = weekEndDate;
            var evetListEle = Object.values(document.getElementsByClassName("monthly-list-item"));
            if (!evetListEle.length) {
                evetListEle = $('.monthly-list-item');
            }

            $('.monthly-list-item').css("display", "none");
            var selectedWeekDIvs;
            var WeekeaderTitle = document.getElementsByClassName('weekly-header-title-date');
            
            selectedWeekDIvs = evetListEle.slice(Number(weekStartDate) - 1, Number(7));
            for (var i = 0; i < selectedWeekDIvs.length; i++) {
                selectedWeekDIvs[i].style.display = "block";
            }
            if (WeekeaderTitle.length) {
                WeekeaderTitle[0].innerText = 'Week ' + weekStartText + '-' + weekEndText; //currentDateValue.getMonth()
            }

            component.set("v.weekIndex", currentWeekIndex);
            component.reloadNextCalendar();
            return;
        }
        if(currentMonthLastDate.getDate() == Number(weekEndDate)){
            weekEndText = new Date(currentDateValue.getFullYear(),currentDateValue.getMonth(),Number(weekStartDate)+6).getDate();


            var eventList = component.get("v.eventList");
            var weekFullDate ;//= new Date(currentDateValue.getFullYear(),currentDateValue.getMonth(),currentDateValue.getDate()-currentDateValue.getDay())
            var pastEle = document.getElementsByClassName('calendarPast');
            if(pastEle.length){
                document.querySelectorAll('.calendarPast').forEach(function(a){
                    a.remove()
                });
            }
            var futureMonthDates = [];
            var weekLastDate = 6-currentMonthLastDate.getDay();
            for(var i=1;i<=weekLastDate;i++){
                var markupListEvent = ''
                var dayName = component.get("v.dayNames");
                if(currentMonthLastDate.getMonth() == 11){
                    weekFullDate = new Date(currentMonthLastDate.getFullYear()+1,0,i)//6-currentMonthLastDate.getDay()
                }else{
                    weekFullDate = new Date(currentMonthLastDate.getFullYear(),currentMonthLastDate.getMonth()+1,i)//6-currentMonthLastDate.getDay()
                }
                var ele = document.getElementById('mycalendarPast'+i);
                if(!ele){
                    var div = document.createElement("DIV");
                    div.setAttribute('data-number','past'+i);
                    div.setAttribute('class','monthly-list-item item-has-event calendarPast');
                    div.setAttribute('id','mycalendarPast'+i);
                    var div2 = document.createElement("DIV");
                    div2.setAttribute('class','monthly-event-list-date');
                    div2.innerHTML = '<div class="monthly-event-list-date">'+dayName[weekFullDate.getDay()].substring(0,1).toUpperCase()+dayName[weekFullDate.getDay()].substring(1,3).toLowerCase()+'<br>'+i+'</br></div>';
                    div2.innerHTML += '<div class="noeventCls" style="padding:0.4em 1em;display:block;margin-bottom:0.5em;">No Events</div>'
                    div.innerHTML = div2.innerHTML
                    //div.innerHTML += markupListEvent;
                    console.log(document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0]);
                    $('#mycalendar .monthly-event-list').append(div);
                    futureMonthDates.push(i);
                    //document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0].insertAdjacentHTML('afterbegin',div)
                }
            }
            for(var i = 0 ;i<eventList.length;i++){
                var eve = eventList[i];
                if(new Date(Date.parse(eve['startdate'])).setHours(0,0,0,0) <= new Date(currentMonthLastDate.getFullYear(),currentMonthLastDate.getMonth(),Number(weekEndDate)).setHours(0,0,0,0).valueOf() && new Date(Date.parse(eve['enddate'])).setHours(0,0,0,0) > new Date(currentMonthLastDate.getFullYear(),currentMonthLastDate.getMonth(),Number(weekEndDate)).setHours(0,0,0,0).valueOf()){
                    //var markupListEvent = '<a title="'+eve.title+'" style="background:#99CCCC" data-eventid="'+eve.Id+'" class="listed-event" href="/lightning/r/buildertek__Project_Task__c/'+eve.Id+'/view">'+eve.title+'</a>'
                    var markupListEvent = '<a title="'+eve.title+'" style="background:'+eve.colorName+'" data-eventid="'+eve.Id+'" class="listed-event" href="/lightning/r/buildertek__Project_Task__c/'+eve.Id+'/view">'+eve.title+'</a>'
                    var dayName = component.get("v.dayNames");
                    for(var j=0;j<futureMonthDates.length;j++){
                        var endDate = new Date(Date.parse(eve['enddate'])).setHours(0,0,0,0);
                        var startDate = new Date(Date.parse(eve['startdate'])).setHours(0,0,0,0);
                        if(endDate >= new Date(currentMonthLastDate.getFullYear(),currentMonthLastDate.getMonth()+1,Number(futureMonthDates[j])).setHours(0,0,0,0).valueOf() && startDate <= new Date(currentDateValue.getFullYear(),currentDateValue.getMonth()+1,Number(futureMonthDates[j])).setHours(0,0,0,0).valueOf()){
                            var startdt = futureMonthDates[j];
                            var startDateFormat = new Date(currentDateValue.getFullYear(),currentDateValue.getMonth()+1,Number(futureMonthDates[j]))
                            var ele = document.getElementById('mycalendarPast'+startdt);
                            if(!ele){
                                var div = document.createElement("DIV");
                                div.setAttribute('data-number','past'+startdt);
                                div.setAttribute('class','monthly-list-item item-has-event calendarPast');
                                div.setAttribute('id','mycalendarPast'+startdt);
                                var div2 = document.createElement("DIV");
                                div2.setAttribute('class','monthly-event-list-date');
                                div2.innerHTML = '<div class="monthly-event-list-date">'+dayName[startDateFormat.getDay()].substring(0,1).toUpperCase()+dayName[startDateFormat.getDay()].substring(1,3).toLowerCase()+'<br>'+futureMonthDates[j]+'</br></div>';

                                div.innerHTML = div2.innerHTML
                                div.innerHTML += markupListEvent;
                                //div.innerHTML = markupListEvent;
                                console.log(document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0]);
                                $('#mycalendar .monthly-event-list').append(div);
                                // document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0].prepend(div);
                            }else{
                                var innerhtmlContent = document.getElementById('mycalendarPast'+futureMonthDates[j])
                                if(innerhtmlContent.lastChild.innerText == 'No Events' && innerhtmlContent.getElementsByClassName('noeventCls').length){
                                    console.log("test 25");
                                    innerhtmlContent.lastChild.remove()
                                }
                                innerhtmlContent.innerHTML += markupListEvent;
                            }
                        }
                    }
                }
            }
        }

        //weekEndDate = weekDivs[currentWeekIndex].children[weekDaysLength-1].getElementsByClassName('monthly-day-number')[0].innerText;
        console.log(weekStartDate,weekEndDate);

        if(currentWeekIndex == weekDivs.length){
            component.reloadNextCalendar();
            component.set("v.weekIndex",0);
        }else{
            var evetListEle = Object.values(document.getElementsByClassName("monthly-list-item"));
            if(!evetListEle.length){
                evetListEle = $('.monthly-list-item');
            }

            $('.monthly-list-item').css("display","none");
            var selectedWeekDIvs;
            var WeekeaderTitle = document.getElementsByClassName('weekly-header-title-date');
            //selectedWeekDIvs = evetListEle.slice(Number(weekStartDate)-1,Number(weekEndDate));
            
            // BUIL-4611-12
            if(Number(weekEndDate) == currentMonthLastDate.getDate()){
                // selectedWeekDIvs = evetListEle.slice(Number(weekStartDate) - 1, Number(weekEndDate) + 6 - currentMonthLastDate.getDay());
                selectedWeekDIvs = evetListEle.slice(Number(weekStartDate) - 1, Number(weekEndDate));
                weekStartText = weekStartDate;
                weekEndText = weekEndDate;
            }else{
                selectedWeekDIvs = evetListEle.slice(Number(weekStartDate)-1,Number(weekEndDate));
            }

            console.log(selectedWeekDIvs);
            for(var i=0; i<selectedWeekDIvs.length;i++){
                selectedWeekDIvs[i].style.display = "block";
            }
            if(WeekeaderTitle.length){
                WeekeaderTitle[0].innerText = 'Week '+weekStartText+'-'+weekEndText; //currentDateValue.getMonth()
            }
            let updatedDate = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth(), weekStartDate);
            component.set("v.dateval", updatedDate);

            component.set("v.weekIndex",currentWeekIndex);
        }

        component.resetEventListeners();
        setTimeout(function () {
            component.set("v.isProcessing", false);
        }, 300); 

    },

    previousWeekClone: function (component, event, helper) {
        try {        
            console.log('inside previousWeekClone');
            
            var currentDateValue = new Date(component.get("v.dateval"));
            var currentMonthLastDate ;
            if(currentDateValue.getMonth() == 11){
                currentMonthLastDate = new Date(currentDateValue.getFullYear()+1, 0, 0);
            }else{
                currentMonthLastDate = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth()+1, 0);
            }
    
            var currentWeekIndex = component.get("v.weekIndex") - 1;
            console.log('CURRENT WEEK INDEX-->'+currentWeekIndex);
            
            var index = (currentWeekIndex)* 7;
            var weekDivs = document.getElementsByClassName('monthly-week');
            var weekDaysLength;
            console.log(weekDivs);
            var weekStartDate;
            var weekEndDate;
            var week;
            var weekStartText;
            var weekEndText;
            var blankdaysInWeekStart;
            var weekStartDayIndex;
            if(currentWeekIndex >= 0){
                console.log('INSIDE 1');
                
                if(weekDivs.length){
                    console.log('INSIDE 2');
                    weekDaysLength = weekDivs[currentWeekIndex].children.length;
                }
                for(var i=0;i<weekDaysLength;i++){
                    if(weekDivs[currentWeekIndex].children[i].className.split('dateV')[1] != undefined){
                        //blankdaysInWeekStart
                        weekStartDate = weekDivs[currentWeekIndex].children[i].getElementsByClassName('monthly-day-number')[0].innerText;
                        break;
                    }
                }
                if(Number(weekStartDate) == 1){
                    console.log('INSIDE 3');
                    let currentDate = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth(), 1);
                    component.set("v.dateval", currentDate);
                    console.log('THIS IS CURRENT DATE VALUE'+currentDateValue);
                    console.log('THIS IS CURRENT DATE'+ currentDate);
                    currentDateValue = currentDate;
                    
                    if(currentDateValue.getMonth() == 0){
                        weekStartText = new Date(currentDateValue.getFullYear(),0,currentDateValue.getDate()-currentDateValue.getDay()).getDate();
                    }else{
                        weekStartText = new Date(currentDateValue.getFullYear(),currentDateValue.getMonth(),currentDateValue.getDate()-currentDateValue.getDay()).getDate();
                    }
    
                    var eventList = component.get("v.eventList");
                    var weekFullDate = new Date(currentDateValue.getFullYear(),currentDateValue.getMonth(),currentDateValue.getDate()-currentDateValue.getDay())
                    var pastEle = document.getElementsByClassName('calendarPast');
                    if(pastEle.length){
                        document.querySelectorAll('.calendarPast').forEach(function(a){
                            a.remove()
                        });
                    }
                    var pastMonthDates = [];
                    for(var i=currentDateValue.getDay()-1;i>=0;i--){
                        var markupListEvent = ''
                        var dayName = component.get("v.dayNames");
                        if(currentDateValue.getMonth() == 0){
                            weekFullDate = new Date(currentDateValue.getFullYear(),0,currentDateValue.getDate()+i-currentDateValue.getDay())
                        }else{
                            weekFullDate = new Date(currentDateValue.getFullYear(),currentDateValue.getMonth(),currentDateValue.getDate()+i-currentDateValue.getDay())
                        }
                        var ele = document.getElementById('mycalendarPast'+Number(weekStartText+i));
                        if(!ele){
                            var div = document.createElement("DIV");
                            div.setAttribute('data-number','past'+Number(weekStartText+i));
                            div.setAttribute('class','monthly-list-item item-has-event calendarPast');
                            div.setAttribute('id','mycalendarPast'+Number(weekStartText+i));
                            var div2 = document.createElement("DIV");
                            div2.setAttribute('class','monthly-event-list-date');
                            div2.innerHTML = '<div class="monthly-event-list-date">'+dayName[weekFullDate.getDay()].substring(0,1).toUpperCase()+dayName[weekFullDate.getDay()].substring(1,3).toLowerCase()+'<br>'+Number(weekStartText+i)+'</br></div>';
                            div2.innerHTML += '<div class="noeventCls" style="padding:0.4em 1em;display:block;margin-bottom:0.5em;">No Events</div>'
                            div.innerHTML = div2.innerHTML
                            //div.innerHTML += markupListEvent;
                            console.log(document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0]);
                            $('#mycalendar .monthly-event-list').prepend(div);
                            pastMonthDates.push(Number(weekStartText+i));
                            //document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0].insertAdjacentHTML('afterbegin',div)
                        }
                    }
                    for(var i = 0 ;i<eventList.length;i++){
                        var eve = eventList[i];
                        if(new Date(Date.parse(eve['startdate'])).setHours(0,0,0,0) < new Date(currentDateValue.getFullYear(),currentDateValue.getMonth(),Number(weekStartDate)).setHours(0,0,0,0).valueOf()){
                            //var markupListEvent = '<a title="'+eve.title+'" style="background:#99CCCC" data-eventid="'+eve.Id+'" class="listed-event" href="/lightning/r/buildertek__Project_Task__c/'+eve.Id+'/view">'+eve.title+'</a>'
                            var markupListEvent = '<a title="'+eve.title+'" style="background:'+eve.colorName+'" data-eventid="'+eve.Id+'" class="listed-event" href="/lightning/r/buildertek__Project_Task__c/'+eve.Id+'/view">'+eve.title+'</a>'
                            var dayName = component.get("v.dayNames");
                            for(var j=pastMonthDates.length-1;j>=0;j--){
                                var endDate = new Date(Date.parse(eve['enddate'])).setHours(0,0,0,0);
                                var startDate = new Date(Date.parse(eve['startdate'])).setHours(0,0,0,0);
                                if(endDate >= new Date(currentDateValue.getFullYear(),currentDateValue.getMonth()-1,Number(pastMonthDates[j])).setHours(0,0,0,0).valueOf() && startDate <= new Date(currentDateValue.getFullYear(),currentDateValue.getMonth()-1,Number(pastMonthDates[j])).setHours(0,0,0,0).valueOf()){
                                    var startdt = pastMonthDates[j];
                                    var startDateFormat = new Date(currentDateValue.getFullYear(),currentDateValue.getMonth()-1,Number(pastMonthDates[j]))
                                    var ele = document.getElementById('mycalendarPast'+startdt);
                                    if(!ele){
                                        var div = document.createElement("DIV");
                                        div.setAttribute('data-number','past'+startdt);
                                        div.setAttribute('class','monthly-list-item item-has-event calendarPast');
                                        div.setAttribute('id','mycalendarPast'+startdt);
                                        var div2 = document.createElement("DIV");
                                        div2.setAttribute('class','monthly-event-list-date');
                                        div2.innerHTML = '<div class="monthly-event-list-date">'+dayName[startDateFormat.getDay()].substring(0,1).toUpperCase()+dayName[startDateFormat.getDay()].substring(1,3).toLowerCase()+'<br>'+pastMonthDates[j]+'</br></div>';
    
                                        div.innerHTML = div2.innerHTML
                                        div.innerHTML += markupListEvent;
                                        //div.innerHTML = markupListEvent;
                                        console.log(document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0]);
                                        $('#mycalendar .monthly-event-list').prepend(div);
                                        // document.getElementById('mycalendar').getElementsByClassName('monthly-event-list')[0].prepend(div);
                                    }else{
                                        var innerhtmlContent = document.getElementById('mycalendarPast'+pastMonthDates[j])
                                        if(innerhtmlContent.lastChild.innerText == 'No Events' && innerhtmlContent.getElementsByClassName('noeventCls').length){
                                            innerhtmlContent.lastChild.remove()
                                        }
                                        innerhtmlContent.innerHTML += markupListEvent;
                                    }
                                }
                            }
                        }
                    }
                }else{
                    console.log('INSIDE 6');
                    
                    weekStartText = weekStartDate;
                }
                for(var i=0;i<weekDaysLength;i++){
                    if(weekDivs[currentWeekIndex].children[i].className.split('dateV')[1] != undefined && !weekDivs[currentWeekIndex].children[i].classList.contains('monthly-day-blank')){
                        weekEndDate = weekDivs[currentWeekIndex].children[i].getElementsByClassName('monthly-day-number')[0].innerText;
                    }
                }
            }
    
            console.log(weekStartDate,weekEndDate);
    
            if(currentWeekIndex+1 == 0){
                let previousMonth = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth(), 0).getDate();
                let lastDayOfPreviousMonth = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth(), 28);
                console.log('THIS IS PREVIOUS MONTH\'s Date'+lastDayOfPreviousMonth);
                component.set("v.dateval", lastDayOfPreviousMonth);
                component.reloadPrevCalendar();
                component.set("v.weekIndex",0);
            }else{
                console.log('INSIDE 7');
                
                var evetListEle = Object.values(document.getElementsByClassName("monthly-list-item"));
                if(!evetListEle.length){
                    evetListEle = $('.monthly-list-item');
                }
                $('.monthly-list-item').css("display","none");
    
                weekEndText = weekEndDate
                var selectedWeekDIvs;
                var WeekeaderTitle = document.getElementsByClassName('weekly-header-title-date');

                // BUIL-4611-12
                if (Number(weekStartDate) == 1) {
                    console.log('As week StartDate = 1');
                    selectedWeekDIvs = evetListEle.slice(Number(weekStartDate) - 1 + currentDateValue.getDay(), Number(weekEndDate) + currentDateValue.getDay());
                } else {
                    selectedWeekDIvs = evetListEle.slice(Number(weekStartDate) - 1, Number(weekEndDate));
                }
                weekStartText = weekStartDate;
                weekEndText = weekEndDate;
    
                console.log(selectedWeekDIvs);
                for(var i=0; i<selectedWeekDIvs.length;i++){
                    selectedWeekDIvs[i].style.display = "block";
                }
                if(WeekeaderTitle.length){
                    WeekeaderTitle[0].innerText = 'Week '+weekStartText+'-'+weekEndText; //currentDateValue.getMonth()
                }
                console.log('LOGGING updatedDate');
                
                let updatedDate = new Date(currentDateValue.getFullYear(), currentDateValue.getMonth(), weekStartDate);
                console.log('LOGGING updatedDate', updatedDate);
                component.set("v.dateval", updatedDate);
                component.set("v.weekIndex",currentWeekIndex);
            }
        } catch (error) {
            console.error("LOGGING ERROR IN PREVIOUS WEEK CLONE", error.stack)
        }
    },

    prevDayDate: function (component, event, helper) {

        console.log("previousDate");
        var todayDateHeader = component.get('v.todayDateHeader');
        console.log("date--> "+todayDateHeader);
        var today = new Date(Date.parse(todayDateHeader));
        var newtodate = Date.parse(todayDateHeader);
        var newfromdate;
        if(today.getDate() == 1){
            component.reloadPrevCalendar();
            /* Show Calendar view Div */
            document.getElementById('mycalendar').style.display = 'block';

            /*hide day view div*/
            document.getElementById('mycalendar2').style.display = 'none';
            document.getElementsByClassName('daily-header')[0].style.display= 'none';
        }else{
            component.set("v.showSpinner",true);
            newfromdate = new Date(today.getFullYear(), today.getMonth(),today.getDate()-1);
            component.set('v.todayDateHeader', new Date(newfromdate).toDateString());
            todayDateHeader = component.get('v.todayDateHeader');
            var comparedate = new Date(helper.getAdjustedDate(todayDateHeader)).setHours(0, 0, 0, 0);

            var evenList = component.get("v.eventList");
            var weeks = component.get("v.dayNames")
            component.set("v.dateval",newfromdate);
            component.set("v.currDay",weeks[new Date(Date.parse(newfromdate)).getDay()].substring(0,3));
            component.set("v.currDate",new Date(Date.parse(newfromdate)).getDate().toString().padStart(2, "0"));
            var currentDateEventList = [];
            if(component.get("v.isConflictview") == "Conflicts"){
                var currentDateEventList = [];
                var conflictEventList = [];
                var resourceCountMap = new Map();
                let currentEventMap = new Map();
                for (var i = 0; i < evenList.length; i++) {
                    var eventItem = evenList[i];
                    var eventStartDate = new Date(Date.parse(eventItem['startdate'])).setHours(0, 0, 0, 0);
                    var eventEndDate = new Date(Date.parse(eventItem['enddate'])).setHours(0, 0, 0, 0);
            
                    if (eventStartDate <= comparedate && eventEndDate >= comparedate && !currentEventMap.has(eventItem['Id'])) {
                        currentDateEventList.push(eventItem);
                        currentEventMap.set(eventItem['Id'], true);
                        // Count occurrences of contractresourceId
                        var resourceId = eventItem['contractresourceId']; // Assuming this is the resource field
                        if (!resourceCountMap.has(resourceId)) {
                            resourceCountMap.set(resourceId, 1);
                        } else {
                            resourceCountMap.set(resourceId, resourceCountMap.get(resourceId) + 1);
                        }
                    }
                }
            
                console.log('Filtered currentDateEventList:', currentDateEventList);
                console.log('Resource Count Map:', Array.from(resourceCountMap.entries()));
            
                // Step 2: Add events to conflictEventList if their contractresourceId occurs more than once
                for (var i = 0; i < currentDateEventList.length; i++) {
                    var eventItem = currentDateEventList[i];
                    var resourceId = eventItem['contractresourceId'];
            
                    if (resourceCountMap.get(resourceId) > 1) {
                        conflictEventList.push(eventItem);
                    }
                }
                component.set("v.dateEventList",conflictEventList);
            }
            else{
                let currentEventMap = new Map();
                for(var i=0;i<evenList.length;i++){
                    var eventItem = evenList[i];
                    var eventStartDate = new Date(Date.parse(eventItem['startdate'])).setHours(0,0,0,0);
                    var eventEndDate = new Date(Date.parse(eventItem['enddate'])).setHours(0,0,0,0);
                    if(eventStartDate <= comparedate && eventEndDate >= comparedate && !currentEventMap.has(eventItem['Id'])){
                        currentDateEventList.push(eventItem);
                        currentEventMap.set(eventItem['Id'], true);
                    }
                }
                console.log("allevents ",evenList);
                component.set("v.dateEventList",currentDateEventList);
                console.log('currentDateEventList--> ',currentDateEventList);
            }
            component.set('v.todayDateHeader',new Date(newfromdate).toDateString());
            component.set("v.todayDate",new Date(newfromdate).toLocaleDateString());
            window.setTimeout(function(){ component.set("v.showSpinner",false); }, 400);
        }
    },

    nextDayDate: function (component, event, helper) {

        console.log("NextDate");
        var todayDateHeader = component.get('v.todayDateHeader');
        var today = new Date(Date.parse(todayDateHeader));
        var newfromdate = Date.parse(todayDateHeader);
        
        var newtodate;
        var lastDateInMonth;
        if(today.getMonth() == 11){
            lastDateInMonth = new Date(today.getFullYear()+1, 0,0);
        }else{
            lastDateInMonth = new Date(today.getFullYear(), today.getMonth()+1,0);
        }

        if(lastDateInMonth.getDate() == today.getDate()){
            component.reloadNextCalendar();
            /* Show Calendar view Div */
            document.getElementById('mycalendar').style.display = 'block';

            /*hide day view div*/
            document.getElementById('mycalendar2').style.display = 'none';
            document.getElementsByClassName('daily-header')[0].style.display= 'none';
        }else{
            component.set("v.showSpinner",true);
            newtodate = new Date(today.getFullYear(), today.getMonth(),today.getDate()+1);
            component.set("v.dateval",newtodate);
            var weeks = component.get("v.dayNames")
            component.set("v.currDay",weeks[new Date(Date.parse(newtodate)).getDay()].substring(0,3));
            component.set("v.currDate",new Date(Date.parse(newtodate)).getDate().toString().padStart(2, "0"));
            console.log(component.get("v.currDate"));
            newtodate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            component.set('v.todayDateHeader', new Date(newtodate).toDateString());
            todayDateHeader = component.get('v.todayDateHeader');
            var comparedate = new Date(helper.getAdjustedDate(todayDateHeader)).setHours(0, 0, 0, 0);

            
            var evenList = component.get("v.eventList");
            var currentDateEventList = [];
            if(component.get("v.isConflictview") == "Conflicts"){
                var currentDateEventList = [];
                var conflictEventList = [];
                var resourceCountMap = new Map();
                let currentEventMap = new Map();
                for (var i = 0; i < evenList.length; i++) {
                    var eventItem = evenList[i];
                    var eventStartDate = new Date(Date.parse(eventItem['startdate'])).setHours(0, 0, 0, 0);
                    var eventEndDate = new Date(Date.parse(eventItem['enddate'])).setHours(0, 0, 0, 0);
            
                    if (eventStartDate <= comparedate && eventEndDate >= comparedate && !currentEventMap.has(eventItem['Id'])) {
                        currentDateEventList.push(eventItem);
                        currentEventMap.set(eventItem['Id'], true);
                        // Count occurrences of contractresourceId
                        var resourceId = eventItem['contractresourceId']; // Assuming this is the resource field
                        if (!resourceCountMap.has(resourceId)) {
                            resourceCountMap.set(resourceId, 1);
                        } else {
                            resourceCountMap.set(resourceId, resourceCountMap.get(resourceId) + 1);
                        }
                    }
                }
            
                console.log('Filtered currentDateEventList:', currentDateEventList);
                console.log('Resource Count Map:', Array.from(resourceCountMap.entries()));
            
                // Step 2: Add events to conflictEventList if their contractresourceId occurs more than once
                for (var i = 0; i < currentDateEventList.length; i++) {
                    var eventItem = currentDateEventList[i];
                    var resourceId = eventItem['contractresourceId'];
            
                    if (resourceCountMap.get(resourceId) > 1) {
                        conflictEventList.push(eventItem);
                    }
                }
                component.set("v.dateEventList",conflictEventList);
            }
            else{
                let currentEventMap = new Map();
                for(var i=0;i<evenList.length;i++){
                    var eventItem = evenList[i];
			    	var eventStartDate = new Date(Date.parse(eventItem['startdate'])).setHours(0,0,0,0);
                    var eventEndDate = new Date(Date.parse(eventItem['enddate'])).setHours(0,0,0,0);
                    if(eventStartDate <= comparedate && eventEndDate >=  comparedate && !currentEventMap.has(eventItem['Id'])){
                        currentDateEventList.push(eventItem);
                        currentEventMap.set(eventItem['Id'], true);
                    }
                }
                console.log("allevents ",evenList);
                component.set("v.dateEventList",currentDateEventList);
                console.log('currentDateEventList--> ',currentDateEventList);
            }
            component.set('v.todayDateHeader',new Date(newtodate).toDateString());
            component.set("v.todayDate",new Date(newtodate).toLocaleDateString());
            window.setTimeout(function(){ component.set("v.showSpinner",false); }, 400);
        }
    },

    dayReset: function (component, event, helper) {
        component.set("v.isConflictview","Standard");
        var standardButton = document.getElementById('standardButton');
        var conflictButton = document.getElementById('conflictButton');
        var isStandardView = component.get("v.isConflictview") === "Standard";
    
        if (isStandardView) {
            if (!standardButton.classList.contains('active')) {
                standardButton.classList.add('active');
            }
            if (conflictButton.classList.contains('active')) {
                conflictButton.classList.remove('active');
            }
        } else {
            if (!conflictButton.classList.contains('active')) {
                conflictButton.classList.add('active');
            }
            if (standardButton.classList.contains('active')) {
                standardButton.classList.remove('active');
            }
        }
        console.log("cuurentDate");
        var currentDateStr = new Date();
        console.log("date--> "+currentDateStr);
        var today = currentDateStr
        var newtodate = new Date(Date.parse(currentDateStr)).setHours(0,0,0,0);
        var newfromdate;
        var evenList = component.get("v.eventList");
        var currentDateEventList = [];
        var currentDate = new Date(component.get("v.dateval"));

        if(currentDate.getFullYear() != new Date(newtodate).getFullYear() || currentDate.getMonth() != new Date(newtodate).getMonth()){
            component.reloadCurrentDateCalendar();
        }else{
            let currentEventMap = new Map();
            for(var i=0;i<evenList.length;i++){
                var eventItem = evenList[i];
                var eventStartDate = new Date(Date.parse(eventItem['startdate'])).setHours(0,0,0,0);
                var eventEndDate = new Date(Date.parse(eventItem['enddate'])).setHours(0,0,0,0);
                if(eventStartDate <= newtodate && eventEndDate >=  newtodate && !currentEventMap.has(eventItem['Id'])){
                    currentDateEventList.push(eventItem);
                    currentEventMap.set(eventItem['Id'], true);
                }
            }
            console.log("allevents ",evenList);
            component.set("v.dateEventList",currentDateEventList);

            // Changes for BUIL-3936
            // To set yellow circle on selected date;
            var seletedDateClass = 'dateV'+today.getFullYear() +'-'+ String(today.getMonth() + 1).padStart(2,'0')+ '-' + String(today.getDate() -1).padStart(2,'0');
            console.log('selected date : ', seletedDateClass);

            var monthDate = document.getElementsByClassName('m-d monthly-day monthly-day-event');
            console.log('monthDate.length : ', monthDate.length);
            if(monthDate.length){
                for(var i=0; i<monthDate.length; i++){
                    if(monthDate[i].classList.contains(seletedDateClass)){
                        var numberDiv = monthDate[i].querySelector('.monthly-day-number');
                        if(!numberDiv.classList.contains('selected-Date') && !monthDate[i].classList.contains('monthly-today')){
                            numberDiv.classList.add('selected-Date');
                            console.log(`monthDate ${[i]} : `, monthDate[i].classList);
                        }
                    }
                    else{
                        if(monthDate[i].querySelector('.monthly-day-number').classList.contains('selected-Date')){
                            monthDate[i].querySelector('.monthly-day-number').classList.remove('selected-Date');
                        }
                    }
                }
            }
        }

        console.log('currentDateEventList--> ',currentDateEventList);
        component.set('v.todayDateHeader',new Date(newtodate).toDateString());
        component.set("v.todayDate",new Date(newtodate).toLocaleDateString());
        var weeks = component.get("v.dayNames")
        console.log('new to date-->'+newtodate);
        
        component.set("v.currDay",weeks[new Date(Date.parse(currentDateStr)).getDay()].substring(0,3));
        component.set("v.currDate",new Date(Date.parse(currentDateStr)).getDate().toString().padStart(2, "0"));
        component.set("v.dateval" ,new Date() );
        console.log('currentDateValString :: ', component.get("v.currentDateValString"));
        console.log('todayDate :: ', component.get("v.todayDate"));

        // Chnages for BUIL-3936
        $(`#datepickerPlaceholder`).datepicker('setDate', today);
        console.log('defaultDate ->> ',$(`#datepickerPlaceholder`).datepicker('getDate') );
        event.stopPropagation();
    },

    resetPreNextTodayListeners : function (component, event, helper) {
        console.log('Inside resetPreNextTodayListner');            
        if(component.get("v.currentCalendarView") == 'dayView'){
            document.getElementById('mycalendar').style.display = 'none';

            /*Show day view div*/
            document.getElementById('mycalendar2').style.display = 'block';
            /*show day view header*/
            document.getElementsByClassName('daily-header')[0].style.display = 'block';
            var evenList = component.get("v.eventList");
            var currentDateEventList = [];
            console.log('this is evenList-->',evenList);
            var newtodate = new Date(Date.parse(component.get("v.dateval"))).setHours(0,0,0,0);

            if(component.get("v.isConflictview") == "Conflicts"){
                var currentDateEventList = [];
                var conflictEventList = [];
                var resourceCountMap = new Map();
                let currentEventMap = new Map();
                for (var i = 0; i < evenList.length; i++) {
                    var eventItem = evenList[i];
                    var eventStartDate = new Date(Date.parse(eventItem['startdate'])).setHours(0, 0, 0, 0);
                    var eventEndDate = new Date(Date.parse(eventItem['enddate'])).setHours(0, 0, 0, 0);
            
                    if (eventStartDate <= newtodate && eventEndDate >= newtodate && !currentEventMap.has(eventItem['Id'])) {
                        currentDateEventList.push(eventItem);
                        currentEventMap.set(eventItem['Id'], true);
                        // Count occurrences of contractresourceId
                        var resourceId = eventItem['contractresourceId']; // Assuming this is the resource field
                        if (!resourceCountMap.has(resourceId)) {
                            resourceCountMap.set(resourceId, 1);
                        } else {
                            resourceCountMap.set(resourceId, resourceCountMap.get(resourceId) + 1);
                        }
                    }
                }
            
                console.log('Filtered currentDateEventList:', currentDateEventList);
                console.log('Resource Count Map:', Array.from(resourceCountMap.entries()));
            
                // Step 2: Add events to conflictEventList if their contractresourceId occurs more than once
                for (var i = 0; i < currentDateEventList.length; i++) {
                    var eventItem = currentDateEventList[i];
                    var resourceId = eventItem['contractresourceId'];
            
                    if (resourceCountMap.get(resourceId) > 1) {
                        conflictEventList.push(eventItem);
                    }
                }
                component.set("v.dateEventList",conflictEventList);
            }
            else{
                let currentEventMap = new Map();
                for(var i=0;i<evenList.length;i++){
                    var eventItem = evenList[i];
                    var eventStartDate = new Date(Date.parse(eventItem['startdate'])).setHours(0,0,0,0);
                    var eventEndDate = new Date(Date.parse(eventItem['enddate'])).setHours(0,0,0,0);
                    if(eventStartDate <= newtodate && eventEndDate >=  newtodate && !currentEventMap.has(eventItem['Id'])){
                        currentDateEventList.push(eventItem);
                        currentEventMap.set(eventItem['Id'], true);
                    }
                    }
                component.set("v.dateEventList",currentDateEventList);
            }
        }

        var prevBtn = document.getElementsByClassName('monthly-prev');
        var nextBtn = document.getElementsByClassName('monthly-next');
        var todayEle = document.getElementsByClassName('monthly-reset');
        var weekPrevBtn = document.getElementsByClassName('weekly-prev');
        var weekNextBtn = document.getElementsByClassName('weekly-next');

        var callBack1 = function(eve){
            console.log('callBack 1 should be calling ',eve);
            if(todayEle.length){
                for(var viewIndex=0; viewIndex< todayEle.length;viewIndex++){
                    todayEle[viewIndex].removeEventListener("click",callBack3);
                }
            }
            prevBtn[0].removeEventListener("click",callBack1);
            nextBtn[0].removeEventListener("click",callBack2);

            weekPrevBtn[0].removeEventListener("click",callBack4);
			weekNextBtn[0].removeEventListener("click",callBack5);

            component.reloadPrevCalendar("");
            prevBtn[0].blur();
            document.body.click();
        }
        var callBack2 = function(eve){
            console.log(eve);
            if(todayEle.length){
                for(var viewIndex=0; viewIndex< todayEle.length;viewIndex++){
                    todayEle[viewIndex].removeEventListener("click",callBack3);
                }
            }
            nextBtn[0].removeEventListener("click",callBack2);
            prevBtn[0].removeEventListener("click",callBack1);

            weekPrevBtn[0].removeEventListener("click",callBack4);
			weekNextBtn[0].removeEventListener("click",callBack5);

            component.reloadNextCalendar("");
            nextBtn[0].blur();
            document.body.click();
        }

        var callBack3 = function(eve){
            console.log(eve);
            if(todayEle.length){
                for(var viewIndex=0; viewIndex< todayEle.length;viewIndex++){
                    todayEle[viewIndex].removeEventListener("click",callBack3);
                }
            }
            nextBtn[0].removeEventListener("click",callBack2);
            prevBtn[0].removeEventListener("click",callBack1);

            weekPrevBtn[0].removeEventListener("click",callBack4);
			weekNextBtn[0].removeEventListener("click",callBack5);

            todayEle[0].blur();
            //today
            component.reloadCurrentDateCalendar("");
            document.body.click();
        }

        var callBack4 = function(eve){
            console.log(eve);
            component.reloadPrevWeekCalendar();
			weekPrevBtn[0].blur();
            document.body.click();
        }

        var callBack5 = function(eve){
            console.log(eve);
            component.reloadNextWeekCalendar();
            weekNextBtn[0].blur();
            document.body.click();
        }

        if(prevBtn.length){
            prevBtn[0].addEventListener("click",callBack1);
        }

        if(nextBtn.length){
            nextBtn[0].addEventListener("click",callBack2);
        }
        if(todayEle.length){
            for(var viewIndex=0; viewIndex< todayEle.length;viewIndex++){
                todayEle[viewIndex].addEventListener("click",callBack3);
            }
        }
        if(weekPrevBtn.length){
            weekPrevBtn[0].addEventListener("click",callBack4);
        }

        if(weekNextBtn.length){
            weekNextBtn[0].addEventListener("click",callBack5);
        }
        console.log('end resetPreNextTodayListeners');
    },

    FilterprojectTasks: function (component, event, helper) {
        console.log(event.target.value);
        component.set("v.selectedProjFromResSelect", "");

        component.set("v.searchProjectFilter",event.target.value);
        helper.updateConflictToStandardView(component, helper);
    },

    FilterResourceTasks: function (component, event, helper) {
        console.log(event.target.value);
        component.set("v.selectedProjFromResSelect", "");

        component.set("v.searchResourceFilter",event.target.value);
        helper.updateConflictToStandardView(component, helper);
    },

    FilterByTradeType: function (component, event, helper) {
        component.set("v.searchTradeTypeFilter",event.target.value);
        component.set("v.selectedProjFromResSelect", "");

        helper.updateConflictToStandardView(component, helper);
    },

    FilterByTaskName: function (component, event, helper) {
        component.set("v.searchTaskNameFilter",event.target.value);
        component.set("v.selectedProjFromResSelect", "");

        helper.updateConflictToStandardView(component, helper);
    },

    doTaskResourceSearch: function (component, event, helper) {
        console.log('doTaskResourceSearch');
        component.set("v.selectedProjFromResSelect", "");
        
        component.set("v.showSpinner",true);
        component.set("v.newContractResource","");
        component.set("v.selectedContractResourceIndex","-1");
        var todayDate = new Date(component.get("v.dateval"));
        var newfromdate = new Date(todayDate.getFullYear(), todayDate.getMonth(),1);
        var newtodate;
        if(todayDate.getMonth() == 11){
            newtodate = new Date(todayDate.getFullYear()+1, 0,0);
        }else{
            newtodate = new Date(todayDate.getFullYear(), todayDate.getMonth()+1,0);
        }

        var newFromstr,newTostr;
        newFromstr = $A.localizationService.formatDate(newfromdate, "yyyy-MM-dd");
       	newTostr = $A.localizationService.formatDate(newtodate, "yyyy-MM-dd")
        
        var action = component.get("c.getScheduleItemsByProject");
            action.setParams({
                fromDate: newFromstr,
                toDate: newTostr,
                slectedTradetypeId: component.get("v.selectedTradetype").Id,
                slectedprojectId: component.get("v.newSelectedProjectId"),
                slectedcontactId: component.get("v.newContractResource"),
                projectSearch: component.get("v.searchProjectFilter"),
                resourceSearch: component.get("v.searchResourceFilter"),
                tradeTypeSearch: component.get("v.searchTradeTypeFilter"),
                taskNameSearch: component.get("v.searchTaskNameFilter"),
                alltypeSearch: component.get("v.allFilter"),
                projectStatus: component.get("v.projectStatusValue"),
                resourceFilter: component.get("v.resourceFilterValue")
            });
            action.setCallback(this, function (response) {
                var state = response.getState();
                if(state === "SUCCESS"){
                    console.log('response.getReturnValue()::',response.getReturnValue());
                    component.set("v.showSpinner", false);

                    //commenting projectList set attribute in order to show all projects with selected project
                    component.set("v.projectList", response.getReturnValue().projectList);

                    var evetList = [];
                    var projColors = component.get("v.projectColors");
                    var resourceColors = component.get("v.resourceColors");

                    if(component.get("v.newSelectedProjectId") && component.get("v.newSelectedProjectId").length > 0){
                        for(var k=0;k<response.getReturnValue().calendarTaskList.length;k++){
                            if(response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList){
                                for(var j=0;j<response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList.length;j++){
                                    var weekName = response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['weekName'];
                                    var startDate = response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['startdate'];
                                    if(weekName != null && weekName != undefined){
                                        var dayNames = component.get("v.dayNames");
                                        response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['weekSubStr'] = dayNames[new Date(Date.parse(startDate)).getDay()].substring(0,3); //weekName.substring(0,3);
                                    }

                                    response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['startdateNum'] = new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0");
                                    var endDate = response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['enddate'];
                                    response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['startdateFormatted'] =  $A.localizationService.formatDate(startDate, 'MM-dd-yyyy');// new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0")+'-'+new Date(Date.parse(startDate)).getMonth().toString().padStart(2, "0")+'-'+new Date(Date.parse(startDate)).getFullYear();
                                    response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['enddateFormatted'] =  $A.localizationService.formatDate(endDate, 'MM-dd-yyyy');//new Date(Date.parse(endDate)).getDate().toString().padStart(2, "0")+'-'+new Date(Date.parse(endDate)).getMonth().toString().padStart(2, "0")+'-'+new Date(Date.parse(endDate)).getFullYear();
                                    response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['colorName'] = resourceColors[k%10];
                                    let getDateOnly = (date) => {
                                        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                    };
                                    response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['eventClass'] = getDateOnly(new Date(endDate)) < getDateOnly(new Date()) && response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['Completion'] < 100? 'event_red': 'event_blue';
                                    evetList.push(response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]);
                                }
                            }
                        }
                    }else{
                        for(var itemIdx=0; itemIdx < response.getReturnValue().projectList.length;itemIdx++){
                            for(var j=0;j<response.getReturnValue().projectList[itemIdx].CalendarWrapList.length;j++){
                                var weekName = response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['weekName'];
                                var startDate = response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['startdate'];
                                var endDate = response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['enddate'];
                                if(weekName != null && weekName != undefined){
                                    var dayNames = component.get("v.dayNames")
                                    response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['weekSubStr'] = dayNames[new Date(Date.parse(startDate)).getDay()].substring(0,3); //weekName.substring(0,3);
                                }

                                response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['startdateNum'] = new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0");
                                response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['startdateFormatted'] = $A.localizationService.formatDate(new Date(Date.parse(startDate)), 'MM-dd-yyyy');//new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0")+'-'+(new Date(Date.parse(startDate)).getMonth()+1).toString().padStart(2, "0")+'-'+new Date(Date.parse(startDate)).getFullYear();
                                response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['enddateFormatted'] = $A.localizationService.formatDate(new Date(Date.parse(endDate)), 'MM-dd-yyyy'); //new Date(Date.parse(endDate)).getDate().toString().padStart(2, "0")+'-'+(new Date(Date.parse(endDate)).getMonth()+1).toString().padStart(2, "0")+'-'+new Date(Date.parse(endDate)).getFullYear();
                                response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['colorName'] = projColors[itemIdx%10];
                                
                                evetList.push(response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]);
                            }

                        }
                    }

                    component.set("v.eventList", evetList);
                    component.set("v.dateEventList",evetList);
                    component.set("v.standardEventList",evetList);
                    component.set("v.resourcesList",response.getReturnValue().calendarTaskList);
                    component.set("v.areExternalResource", response.getReturnValue().areExternalResource);
                    component.set("v.areInternalResource", response.getReturnValue().areInternalResource);

                    document.getElementById('mycalendar').style.display = 'block';
                    document.getElementById('mycalendar2').style.display = 'none';

                    /*reset selected resource  */
                    document.getElementById('profileBgSymbol').className = "profile_name me-3 prof_bg2";
                    document.getElementById('resourceInitials').innerText = 'R';
                    document.getElementById('selectedContractResource').innerText = 'Resource';
                    document.getElementById('selectedContractResourceTradeType').innerText = 'Trade Type';

                    var calendarBuild = component.get("c.buildCalendar");
                    $A.enqueueAction(calendarBuild);
                    component.set("v.showSpinner",false);
                } else {
                    component.set("v.showSpinner", false);
                    console.log('error',response.getError());
                }
            });
        $A.enqueueAction(action);
    },

    doTaskProjectSearch:  function (component, event, helper) {
        //var value = component.get("v.searchRfqFilter");//event.getSource().get("v.value");
        console.log(component.get("v.searchProjectFilter"));
        console.log(component.get("v.searchResourceFilter"));
        console.log(component.get("v.allFilter"));

        component.set("v.showSpinner",true);
        component.set("v.newContractResource","");
        component.set("v.selectedContractResourceIndex","-1");

        var todayDate = new Date(component.get("v.dateval"));
        var newfromdate = new Date(todayDate.getFullYear(), todayDate.getMonth(),1);
        var newtodate;
        if(todayDate.getMonth() == 11){
            newtodate = new Date(todayDate.getFullYear()+1, 0,0);
        }else{
            newtodate = new Date(todayDate.getFullYear(), todayDate.getMonth()+1,0);
        }

        var newFromstr,newTostr;
        newFromstr = $A.localizationService.formatDate(newfromdate, "yyyy-MM-dd");
       	newTostr = $A.localizationService.formatDate(newtodate, "yyyy-MM-dd")
           console.log('ans 5--->' ,component.get("v.newSelectedProjectId"));
        var action = component.get("c.getScheduleItemsByProject");
            action.setParams({
                fromDate: newFromstr,//newFromstr.toString(),//fromdateStr,newfromdate
                toDate: newTostr,//newTostr.toString(),//todateStr,newtodate
                slectedTradetypeId: component.get("v.selectedTradetype").Id,
                slectedprojectId: component.get("v.newSelectedProjectId"),
                slectedcontactId: component.get("v.newContractResource"),
                projectSearch: component.get("v.searchProjectFilter"),
                resourceSearch: component.get("v.searchResourceFilter"),
                tradeTypeSearch: component.get("v.searchTradeTypeFilter"),
                taskNameSearch: component.get("v.searchTaskNameFilter"),
                alltypeSearch: component.get("v.allFilter"),
                projectStatus: component.get("v.projectStatusValue"),
                resourceFilter: component.get("v.resourceFilterValue")
            });
            action.setCallback(this, function (response) {
                var state = response.getState();
                if(state === "SUCCESS"){
                    console.log('response.getReturnValue()::',response.getReturnValue());
                    component.set("v.showSpinner", false);

                    //commenting projectList set attribute in order to show all projects with selected project
                    component.set("v.projectList", response.getReturnValue().projectList);

                    var evetList = [];
                     var projColors = component.get("v.projectColors");
                    for(var itemIdx=0; itemIdx < response.getReturnValue().projectList.length;itemIdx++){
                        for(var j=0;j<response.getReturnValue().projectList[itemIdx].CalendarWrapList.length;j++){
                             var weekName = response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['weekName'];
                            var startDate = response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['startdate'];
                            var endDate = response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['enddate'];
                            if(weekName != null && weekName != undefined){
                                var dayNames = component.get("v.dayNames")
                                response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['weekSubStr'] = dayNames[new Date(Date.parse(startDate)).getDay()].substring(0,3); //weekName.substring(0,3);
                            }

                            response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['startdateNum'] = new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0");
                            response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['startdateFormatted'] = $A.localizationService.formatDate(new Date(Date.parse(startDate)), 'MM-dd-yyyy');//new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0")+'-'+(new Date(Date.parse(startDate)).getMonth()+1).toString().padStart(2, "0")+'-'+new Date(Date.parse(startDate)).getFullYear();
                            response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['enddateFormatted'] = $A.localizationService.formatDate(new Date(Date.parse(endDate)), 'MM-dd-yyyy'); //new Date(Date.parse(endDate)).getDate().toString().padStart(2, "0")+'-'+(new Date(Date.parse(endDate)).getMonth()+1).toString().padStart(2, "0")+'-'+new Date(Date.parse(endDate)).getFullYear();
                            response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['colorName'] = projColors[itemIdx%10];
                            evetList.push(response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]);
                        }

                    }
                    component.set("v.eventList", evetList);
                    component.set("v.dateEventList",evetList);
                    component.set("v.standardEventList",evetList);
                    component.set("v.resourcesList",response.getReturnValue().calendarTaskList);
                    component.set("v.areExternalResource", response.getReturnValue().areExternalResource);
                    component.set("v.areInternalResource", response.getReturnValue().areInternalResource);

                    document.getElementById('mycalendar').style.display = 'block';
                    document.getElementById('mycalendar2').style.display = 'none';

                    /*reset selected resource  */
                    document.getElementById('profileBgSymbol').className = "profile_name me-3 prof_bg2";
                    document.getElementById('resourceInitials').innerText = 'R';
                    document.getElementById('selectedContractResource').innerText = 'Resource';
                    document.getElementById('selectedContractResourceTradeType').innerText = 'Trade Type';
                    helper.colorFullTasks(component, response.getReturnValue());
                    var calendarBuild = component.get("c.buildCalendar");
                    $A.enqueueAction(calendarBuild);
                    component.set("v.showSpinner",false);
                } else {
                    component.set("v.showSpinner", false);
                    console.log('error',response.getError());
                }
            });
            $A.enqueueAction(action);
    },

    doTaskAllFilterSearch:  function (component, event, helper) {
        console.log('doTaskAllFilterSearch');
        component.set("v.showSpinner",true);
        if(component.get("v.newContractResource") != ""){
            component.set("v.isPrevSelectedResource", component.get("v.newContractResource"));
        }
        component.set("v.newContractResource","");
        component.set("v.selectedContractResourceIndex","-1");
        var todayDate = new Date(component.get("v.dateval"));
        var newfromdate = new Date(todayDate.getFullYear(), todayDate.getMonth(),1);
        var newtodate;
        if(todayDate.getMonth() == 11){
            newtodate = new Date(todayDate.getFullYear()+1, 0,0);
        }else{
            newtodate = new Date(todayDate.getFullYear(), todayDate.getMonth()+1,0);
        }

        if(component.get("v.searchResourceFilter").trim() == '' || component.get("v.searchResourceFilter").trim() == undefined){
            component.set("v.newSelectedProjectId",component.get("v.newSelectedProjectIdClone"));
        }
        if(component.get("v.allFilter").trim() == '' || component.get("v.allFilter").trim() == undefined){
            component.set("v.newSelectedProjectId",component.get("v.newSelectedProjectIdClone"));
        }

        var newFromstr = $A.localizationService.formatDate(newfromdate, "yyyy-MM-dd");
        var newTostr = $A.localizationService.formatDate(newtodate, "yyyy-MM-dd")
        var action = component.get("c.getScheduleItemsByProject");

        console.log('newFromstr::',newFromstr);
        console.log('newTostr::',newTostr);
        console.log('component.get("v.selectedTradetype").Id::',component.get("v.selectedTradetype").Id);
        console.log('component.get("v.newSelectedProjectId")::',component.get("v.newSelectedProjectId"));
        console.log('component.get("v.newContractResource")::',component.get("v.newContractResource"));
        console.log('component.get("v.searchProjectFilter")::',component.get("v.searchProjectFilter"));
        console.log('component.get("v.searchResourceFilter")::',component.get("v.searchResourceFilter"));
        console.log('component.get("v.selectedContractResourceIndex")::', component.get("v.selectedContractResourceIndex"));

        
        console.log('component.get("v.allFilter")::',component.get("v.allFilter"));
        
        action.setParams({
            fromDate: newFromstr,
            toDate: newTostr,
            slectedTradetypeId: component.get("v.selectedTradetype").Id,
            slectedprojectId: component.get("v.newSelectedProjectId"),
            slectedcontactId: component.get("v.newContractResource"),
            projectSearch: component.get("v.searchProjectFilter"),
            resourceSearch: component.get("v.searchResourceFilter"),
            alltypeSearch: component.get("v.allFilter"),
            projectStatus: component.get("v.projectStatusValue"),
            resourceFilter: component.get("v.resourceFilterValue")
        });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if(state === "SUCCESS"){
                console.log('response.getReturnValue()::',response.getReturnValue());
                component.set("v.showSpinner", false);
                component.set("v.projectList", response.getReturnValue().projectList);

                var evetList = [];
                var eventIds = [];
                var projColors = component.get("v.projectColors");

                if(response.getReturnValue().projectList.length){
                    for(var itemIdx=0; itemIdx < response.getReturnValue().projectList.length;itemIdx++){
                        if(response.getReturnValue().projectList[itemIdx].CalendarWrapList){
                            for(var j=0;j<response.getReturnValue().projectList[itemIdx].CalendarWrapList.length;j++){
                                var weekName = response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['weekName'];
                                var startDate = response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['startdate'];
                                var endDate = response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['enddate'];
                                if(weekName != null && weekName != undefined){
                                    var dayNames = component.get("v.dayNames");
                                    response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['weekSubStr'] = dayNames[new Date(Date.parse(startDate)).getDay()].substring(0,3);
                                }

                                response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['startdateNum'] = new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0");
                                response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['startdateFormatted'] = $A.localizationService.formatDate(new Date(Date.parse(startDate)), 'MM-dd-yyyy');
                                response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['enddateFormatted'] = $A.localizationService.formatDate(new Date(Date.parse(endDate)), 'MM-dd-yyyy');
                                response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['colorName'] = projColors[itemIdx%10];
                                if(eventIds.indexOf(response.getReturnValue().projectList[itemIdx].CalendarWrapList[j].Id) < 0){
                                    evetList.push(response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]);
                                    eventIds.push(response.getReturnValue().projectList[itemIdx].CalendarWrapList[j].Id);
                                }

                            }
                        }
                    }
                }
                if(response.getReturnValue().calendarTaskList.length){
                    for(var itemIdx=0; itemIdx < response.getReturnValue().calendarTaskList.length;itemIdx++){
                        if(response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList){
                            for(var j=0;j<response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList.length;j++){
                                var weekName = response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList[j]['weekName'];
                                if(weekName != null && weekName != undefined){
                                    var startDate = response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList[j]['startdate'];
                                    var endDate = response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList[j]['enddate'];
                                    var dayNames = component.get("v.dayNames");
                                    response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList[j]['weekSubStr'] = dayNames[new Date(Date.parse(startDate)).getDay()].substring(0,3)//weekName.substring(0,3);
                                }

                                response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList[j]['startdateNum'] = new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0");
                                response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList[j]['startdateFormatted'] = $A.localizationService.formatDate(new Date(Date.parse(startDate)), 'MM-dd-yyyy');//new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0")+'-'+(new Date(Date.parse(startDate)).getMonth()+1).toString().padStart(2, "0")+'-'+new Date(Date.parse(startDate)).getFullYear();
                                response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList[j]['enddateFormatted'] =$A.localizationService.formatDate(new Date(Date.parse(endDate)), 'MM-dd-yyyy'); // new Date(Date.parse(endDate)).getDate().toString().padStart(2, "0")+'-'+(new Date(Date.parse(endDate)).getMonth()+1).toString().padStart(2, "0")+'-'+new Date(Date.parse(endDate)).getFullYear();
                                response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList[j]['colorName'] = projColors[itemIdx%10];
                                let getDateOnly = (date) => {
                                    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                };
                                response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList[j]['eventClass'] = getDateOnly(new Date(endDate)) < getDateOnly(new Date()) && response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList[j]['Completion'] < 100? 'event_red': 'event_blue';
                                if(eventIds.indexOf(response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList[j].Id) < 0){
                                    evetList.push(response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList[j]);
                                    eventIds.push(response.getReturnValue().calendarTaskList[itemIdx].ProjectTaskRecordsList[j].Id);
                                }
                            }
                        }
                    }
                }

                component.set("v.eventList", evetList);
                component.set("v.dateEventList",evetList);
                component.set("v.standardEventList",evetList);
                component.set("v.resourcesList",response.getReturnValue().calendarTaskList);
                component.set("v.areExternalResource", response.getReturnValue().areExternalResource);
                component.set("v.areInternalResource", response.getReturnValue().areInternalResource);

                document.getElementById('mycalendar').style.display = 'block';
                document.getElementById('mycalendar2').style.display = 'none';

                /*reset selected resource  */
                document.getElementById('profileBgSymbol').className = "profile_name me-3 prof_bg2";
                document.getElementById('resourceInitials').innerText = 'R';
                document.getElementById('selectedContractResource').innerText = 'Resource';
                document.getElementById('selectedContractResourceTradeType').innerText = 'Trade Type';

                var calendarBuild = component.get("c.buildCalendar");
                helper.colorFullTasks(component, response.getReturnValue());
                $A.enqueueAction(calendarBuild);
                
                component.set("v.showSpinner",false);
            } else {
                component.set("v.showSpinner", false);
                console.log('error',response.getError());
            }
        });
        $A.enqueueAction(action);
    },

    setConflictData:  function (component, event, helper) {
        component.set("v.newContractResource", "");
        document.getElementById('profileBgSymbol').className = "profile_name me-3 prof_bg2";
        document.getElementById('resourceInitials').innerText = 'R';
        document.getElementById('selectedContractResource').innerText = 'Resource';
        document.getElementById('selectedContractResourceTradeType').innerText = 'Trade Type';
        var eventList = component.get("v.resourcesList");
        console.log('This is eventList--->',{eventList});
        
        
        var weekDates = document.getElementsByClassName('monthly-list-item');
        var conflictTasks = [];
        var conflictMap = [];
        console.log(weekDates.length);
        var conflictResource = [];
        var conflictResourceIndex = [];
        var conflictTaskResourceIndex = [];
        var taskIds = [];
        for (var i = 0; i < eventList.length; i++) {
            for (var k = 0; k < weekDates.length; k++) {
                if (eventList[i].ProjectTaskRecordsList != undefined) {
                    var EquipmentRecordsList = eventList[i].ProjectTaskRecordsList;
                    var tasks = 0;
                    var dateVal = new Date(component.get('v.dateval'));
                     var recordMap = new Map();
                    for (var p = 0; p < EquipmentRecordsList.length; p++) {
                        if (new Date(dateVal.getFullYear(),dateVal.getMonth(),k+1).valueOf() >= new Date(EquipmentRecordsList[p].day).valueOf() && new Date(dateVal.getFullYear(),dateVal.getMonth(),k+1).valueOf() <= new Date(EquipmentRecordsList[p].endday).valueOf()) {
                            tasks++;
                            if(!recordMap.has(eventList[i].ContractresourceId)) {
                                recordMap.set(eventList[i].ContractresourceId, []);
                                recordMap.get(eventList[i].ContractresourceId).push(i+'_'+p);
                            }else if(recordMap.has(eventList[i].ContractresourceId)){
                                recordMap.get(eventList[i].ContractresourceId).push(i+'_'+p);
                                if(recordMap.get(eventList[i].ContractresourceId).length >= 2){
                                    conflictResource.push(EquipmentRecordsList[p]);
                                    for(var s=0;s<recordMap.get(eventList[i].ContractresourceId).length;s++){
                                        var index = recordMap.get(eventList[i].ContractresourceId)[s];
                                        if(conflictResourceIndex.indexOf(index)<0){
                                            conflictResourceIndex.push(index);
                                        }
                                    }
                                }
                            }
                            console.log(EquipmentRecordsList[p]);
                        }
                    }

                    console.log(tasks);

                    if(tasks >= 2 && eventList[i].simultaneousTasksContractorResources != undefined && tasks < eventList[i].simultaneousTasksContractorResources){
                        console.log(tasks);
                        for (var t = 0; t < EquipmentRecordsList.length; t++) {
                            console.log('aboveif----calandaedate--->'+weekDates[k].Date +'record stardate>='+ EquipmentRecordsList[t].day +'record enddate-----&& <= '+EquipmentRecordsList[t].endday);
                            console.log(typeof weekDates[k].Date);
                            console.log(typeof EquipmentRecordsList[t].day);
                            console.log(typeof  EquipmentRecordsList[t].endday);
                            if (new Date(dateVal.getFullYear(),dateVal.getMonth(),k+1).valueOf() >= new Date(EquipmentRecordsList[t].day).valueOf() && new Date(dateVal.getFullYear(),dateVal.getMonth(),k+1).valueOf() <= new Date(EquipmentRecordsList[t].endday).valueOf()) {
                                console.log('belowif----calandaedate--->'+weekDates[k].Date +'record stardate>='+ EquipmentRecordsList[t].day +'record enddate-----&& <= '+EquipmentRecordsList[t].endday);
                                console.log('555')
                                if(conflictTaskResourceIndex.indexOf(EquipmentRecordsList[t].Id)<0){
                                    conflictTasks.push(EquipmentRecordsList[t]);
                                    conflictTaskResourceIndex.push(EquipmentRecordsList[t].Id);
                                }
                            }
                        }
                        console.log(eventList[i]);
                       // break;
                    }else if(tasks > 1 && eventList[i].simultaneousTasksContractorResources != undefined && tasks > eventList[i].simultaneousTasksContractorResources) {
                         console.log(tasks);
                         for (var t = 0; t < EquipmentRecordsList.length; t++) {
                            console.log('aboveif----calandaedate--->'+weekDates[k].Date +'record stardate>='+ EquipmentRecordsList[t].day +'record enddate-----&& <= '+EquipmentRecordsList[t].endday);
                            console.log(typeof weekDates[k].Date);
                             console.log(typeof EquipmentRecordsList[t].day);
                             console.log(typeof  EquipmentRecordsList[t].endday);
                             if (new Date(dateVal.getFullYear(),dateVal.getMonth(),k+1).valueOf() >= new Date(EquipmentRecordsList[t].day).valueOf() && new Date(dateVal.getFullYear(),dateVal.getMonth(),k+1).valueOf() <= new Date(EquipmentRecordsList[t].endday).valueOf()) {
                                 console.log('belowif----calandaedate--->'+weekDates[k].Date +'record stardate>='+ EquipmentRecordsList[t].day +'record enddate-----&& <= '+EquipmentRecordsList[t].endday);
                                 console.log('545')
                                 if(conflictTaskResourceIndex.indexOf(EquipmentRecordsList[t].Id)<0){
                                     conflictTasks.push(EquipmentRecordsList[t]);
                                     conflictTaskResourceIndex.push(EquipmentRecordsList[t].Id);
                                 }
                             }
                         }
                         console.log(eventList[i]);
                       // break;
                    }else if(tasks >= 2 && (eventList[i].simultaneousTasksContractorResources == undefined || eventList[i].simultaneousTasksContractorResources == 0)) {
                        console.log(tasks);
                        for (var t = 0; t < EquipmentRecordsList.length; t++) {
                            console.log('aboveif----calandaedate--->'+weekDates[k].Date +'record stardate>='+ EquipmentRecordsList[t].day +'record enddate-----&& <= '+EquipmentRecordsList[t].endday);
                            console.log(typeof weekDates[k].Date);
                            console.log(typeof EquipmentRecordsList[t].day);
                            console.log(typeof  EquipmentRecordsList[t].endday);
                            if (new Date(dateVal.getFullYear(),dateVal.getMonth(),k+1).valueOf() >= new Date(EquipmentRecordsList[t].day).valueOf() && new Date(dateVal.getFullYear(),dateVal.getMonth(),k+1).valueOf() <= new Date(EquipmentRecordsList[t].endday).valueOf()) {
                                console.log('543')
                                console.log('belowif----calandaedate--->'+weekDates[k].Date +'record stardate>='+ EquipmentRecordsList[t].day +'record enddate-----&& <= '+EquipmentRecordsList[t].endday);
                                if(conflictTaskResourceIndex.indexOf(EquipmentRecordsList[t].Id)<0){
                                    conflictTasks.push(EquipmentRecordsList[t]);
                                    conflictTaskResourceIndex.push(EquipmentRecordsList[t].Id);
                                }
                            }
                        }
                         console.log(eventList[i]);
                       // break;
                    }
                }
            }
        }
        console.log('conflictTasks::: ',conflictTasks)
        console.log(conflictResourceIndex)
        console.log(eventList);
        console.log({eventList});
        component.set("v.conflictEventList",conflictTasks);
        component.set("v.eventList",conflictTasks);
        console.log('OUTSIDE CONFLICT DATE DAY VIEW');

        if (component.get("v.currentCalendarView") == 'dayView') {
            console.log('INSIDE CONFLICT DATE DAY VIEW');
        
            var evenList = component.get("v.eventList");
            var currentDateEventList = [];
            var conflictEventList = [];
            var resourceCountMap = new Map();
            console.log('this is evenList-->', evenList);
        
            var newtodate = new Date(Date.parse(component.get("v.dateval"))).setHours(0, 0, 0, 0);
        
            // Step 1: Filter events that fall on the selected date
            for (var i = 0; i < evenList.length; i++) {
                var eventItem = evenList[i];
                var eventStartDate = new Date(Date.parse(eventItem['startdate'])).setHours(0, 0, 0, 0);
                var eventEndDate = new Date(Date.parse(eventItem['enddate'])).setHours(0, 0, 0, 0);
        
                if (eventStartDate <= newtodate && eventEndDate >= newtodate) {
                    currentDateEventList.push(eventItem);
        
                    // Count occurrences of contractresourceId
                    var resourceId = eventItem['contractresourceId']; // Assuming this is the resource field
                    if (!resourceCountMap.has(resourceId)) {
                        resourceCountMap.set(resourceId, 1);
                    } else {
                        resourceCountMap.set(resourceId, resourceCountMap.get(resourceId) + 1);
                    }
                }
            }
        
            console.log('Filtered currentDateEventList:', currentDateEventList);
            console.log('Resource Count Map:', Array.from(resourceCountMap.entries()));
        
            // Step 2: Add events to conflictEventList if their contractresourceId occurs more than once
            for (var i = 0; i < currentDateEventList.length; i++) {
                var eventItem = currentDateEventList[i];
                var resourceId = eventItem['contractresourceId'];
        
                if (resourceCountMap.get(resourceId) > 1) {
                    conflictEventList.push(eventItem);
                }
            }
        
            console.log('Conflict Event List:', conflictEventList);
        
            component.set("v.dateEventList", conflictEventList);
            console.log('GOING OUTSIDE CONFLICT DATE DAY VIEW');
        }
        helper.buildCalendarWithTasks(component, helper,component.get("v.resourcesList"),-1);
        component.set("v.showSpinner",false);
        
    },

    // Changes for BUIL-3936
    openDatePicker: function(component, event, helper) {
        try{
            console.log("HIiiiiiiiiiii");
            helper.openDatePickerHelper(component, event, helper);
        }
        catch(error){
            console.log('error in openDatePicker : ', error.stack)
        }
    },

    // Changes for BUIL-3936... [Need to remove.. unused]
    handleDateChanged: function(component, event, helper){
        try {
            console.log('datePicker handleDateChanged ');
            var dateText = event.getSource().get('v.value');
            console.log('Selected date:', dateText);
            component.set("v.startDt" ,dateText);
            helper.handleSaveDates(component,event,helper);
        } catch (error) {
            console.log('error in handleDateChanged : ', error.stack);
        }
    },
    
    handleAfterLoadscript: function (component, event, helper) {
        // $A.enqueueAction(component.get("c.doInit"));
    },

    onChangeProjectOption: function (component, event, helper) {
        component.set("v.selectedProjFromResSelect", "");
        component.set("v.newSelectedProjectId", []);
        component.set("v.newSelectedProjectIdClone", []);
        component.set("v.selectedSingleProjectId", "");
        var projectStatusValue = event.getSource().get("v.value");
        component.set("v.projectStatusValue", projectStatusValue);
        console.log({projectStatusValue});
        helper.updateConflictToStandardView(component, helper);
        helper.getTasksByProjects(component,helper, component.get("v.dateval"));
    },

    onChangeResourceFilterOption: function (component, event, helper) {
        component.set("v.selectedProjFromResSelect", "");
        component.set("v.newSelectedProjectId", []);
        component.set("v.newSelectedProjectIdClone", []);
        var activeEle = document.getElementsByClassName('nav-link active');
        for( let a of activeEle){
            if(a.classList.contains('active')){
                a.classList.remove('active');
            }
        }

        var resourceFilterValue = event.getSource().get("v.value");
        component.set("v.resourceFilterValue", resourceFilterValue);
        console.log({resourceFilterValue});
        if(resourceFilterValue == "All"){
            component.set("v.showExternalResources", true);
            component.set("v.showInternalResources", true);
        } else if(resourceFilterValue == "External Resources"){
            component.set("v.showExternalResources", true);
            component.set("v.showInternalResources", false);
        } else if(resourceFilterValue == "Internal Resources"){
            component.set("v.showExternalResources", false);
            component.set("v.showInternalResources", true);
        }
        helper.updateConflictToStandardView(component, helper);
        helper.getTasksByProjects(component,helper, component.get("v.dateval"));
    },
})