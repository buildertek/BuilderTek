({  
    onRender : function(component){

        var profileSymbols = document.getElementsByClassName('profile_name');
        var leftNav = document.getElementsByClassName('list-group-item').length;

        console.log('INSIDE RENDERED');
        if (profileSymbols.length > 1 && leftNav) {
            console.log(profileSymbols.length)
            for (var i = 0; i < profileSymbols.length - 1; i++) {
                var ele = profileSymbols[i];
                var indexVal = (i) % 10;
                var className = 'prof_bg' + Number(indexVal + 1);
                if (!ele.classList.contains(className)) {
                    ele.classList.add(className);
                    if (document.getElementsByClassName('list-group-item')[i]) {
                        document.getElementsByClassName('list-group-item')[i].setAttribute("data-profilesbl", className);
                    }

                }
            }
        }

        var projectProfileSymbols = document.getElementsByClassName('Proj_profile_name');
        if (projectProfileSymbols.length > 0) {
            console.log(projectProfileSymbols.length)
            for (var i = 0; i < projectProfileSymbols.length; i++) {
                var ele = projectProfileSymbols[i];
                var indexVal = (i) % 10;
                var className = 'proj_prof_bg' + Number(indexVal + 1);
                if (!ele.classList.contains(className)) {
                    ele.classList.add(className);
                    if (document.getElementsByClassName('nav-link')[i]) {
                        document.getElementsByClassName('nav-link')[i].setAttribute("data-projprofilesbl", className);
                    }

                }
            }
        }
    },
    setFocusedTabLabel : function(component, event, helper) {
        var workspaceAPI = component.find("workspace");
        workspaceAPI.getFocusedTabInfo().then(function(response) {
            var focusedTabId = response.tabId;
            workspaceAPI.setTabLabel({
                tabId: focusedTabId,
                label: "BT Resources",
            });
            workspaceAPI.setTabIcon({
                tabId: focusedTabId,
                icon: "standard:contact",
                iconAlt: "BT Resources"
            });
        })
        .catch(function(error) {
            console.log(error);
        });
    },

    buildCalendarWithTasks:  function (component, helper,calendarTaskList,selectedResourceIndex) {
        try {
            
            console.log('buildCalendarWithTasks calling : ');
            component.set("v.showSpinner", true);
            component.set("v.rerendermonthly",true);
            var monthlyArray = [];
            var projColors= component.get("v.projectColors");
            if(Number(selectedResourceIndex) >= 0){
                //for selected contract resource or internal resource
                var resourceIdx = Number(selectedResourceIndex);
                var item = calendarTaskList[resourceIdx];
                console.log(item.ProjectTaskRecordsList[0]);
                console.log('EVENT LIST');
                console.log(item.ProjectTaskRecordsList[1]);
                for(var j=0;j<item.ProjectTaskRecordsList.length;j++){
                    var task = item.ProjectTaskRecordsList[j];
                    var taskObj = {};
                    taskObj["id"] = task.Id;
                    var name =  task.title ? task.title : task.taskdescription
                    name += task.accountName ? '-'+task.accountName : ''
                    name += task.UnitId ? '-'+task.UnitId :  '-'+task.contractresourceId
                    taskObj['name'] = name;
                    taskObj["startdate"]= task.startdate;
                    taskObj["enddate"]= task.enddate;
                    taskObj["starttime"]= "";
                    taskObj["endtime"]= "";
                    if(task.colorName !='' && task.colorName){
                        taskObj["color"]= task.colorName;
                    }else{
                        taskObj["color"]= "#99CCCC";
                    }
    
                    taskObj["url"]= '/lightning/r/buildertek__Project_Task__c/' + escape(task.Id) + '/view'; //need to add full url along with baseurl
                    monthlyArray.push(taskObj);
                }
            }else{
                //for selected project only
                var contractResourceIdList = [];
                var evetList = component.get("v.eventList");

                for(var i=0; i<evetList.length; i++){
                    
                    var task = evetList[i];
                    var taskObj = {};
                    taskObj["id"] = task.Id;
                    var name =  task.title ? task.title : task.taskdescription
                    name += task.accountName ? '-'+task.accountName : ''
                    name += task.UnitId ? '-'+task.UnitId :  '-'+task.contractresourceId
                    taskObj['name'] = name;
                    taskObj["startdate"]= task.startdate;
                    taskObj["enddate"]= task.enddate;
                    taskObj["starttime"]= "";
                    taskObj["endtime"]= "";
                    if(task.colorName !='' && task.colorName){
                        taskObj["color"]= task.colorName;
                    }else{
                        taskObj["color"]= "#99CCCC";
                    }
    
                    taskObj["url"]= '/lightning/r/buildertek__Project_Task__c/' + escape(task.Id) + '/view'; //need to add full url along with baseurl
                    monthlyArray.push(taskObj);
                }
            }
            var sampleEvents = {
                "monthly": monthlyArray
            }
    
            component.set("v.calendarEvents",sampleEvents);
    
            if(Object.keys(sampleEvents).length){
                if(typeof $ == 'function'){
                    var viewDate = new Date(component.get("v.dateval"));
                    var currentDate = new Date();
                    $('#mycalendar').empty();
                    var monthNamesList = component.get("v.monthnames");
                    if(currentDate.getMonth() ==  viewDate.getMonth() && currentDate.getFullYear() == viewDate.getFullYear()){
                        $('#mycalendar').append(`<div class="weekly-header" style="display:none;">
                                                    <button id="hiddenButton" style="display: none;">Hidden Button</button>
                                                    <div class="weekly-header-title">
                                                        <a class="monthly-weekly-header-title-date"  style="pointer-events: none;" href="#" onclick="(function(event){event.preventDefault();return false;})();return false;">${monthNamesList[currentDate.getMonth()]}&nbsp;${currentDate.getFullYear()}</a>
                                                        <a class="weekly-header-title-date"  href="#" onclick="(function(event){event.preventDefault();return false;})();return false;">Week 1-7</a>
                                                        <a class="month-header-title-datee" id="datepickerAnchor" style="position: relative !important;" onclick="(function(event){event.preventDefault();return false;})();return false;">Select Date </a>
                                                    </div><a class="weekly-prev"  href="javascript:void(0);" onclick="(function(event){event.preventDefault();return false;})();return false;"></a>
                                                        <a class="weekly-next"  href="javascript:void(0);" onclick="(function(event){event.preventDefault();return false;})();return false;"></a>
                                                    </div>`);
    
                    }else{
                        // for today reset button
                        $('#mycalendar').append(`<div class="weekly-header" style="display:none;">
                                                    <div class="weekly-header-title">
                                                        <a class="monthly-weekly-header-title-date"  style="pointer-events: none;" href="#" onclick="(function(event){event.preventDefault();return false;})();return false;">${monthNamesList[viewDate.getMonth()]}&nbsp;${viewDate.getFullYear()}</a>
                                                        <a class="weekly-header-title-date"  href="#" onclick="(function(event){event.preventDefault();return false;})();return false;">Week 1-7</a>
                                                        <a class="month-header-title-datee" id="datepickerAnchor" style="position: relative !important;" onclick="(function(event){event.preventDefault();return false;})();return false;">Select Date </a>
                                                    </div>
                                                        <a class="weekly-prev"  href="javascript:void(0);" onclick="(function(event){event.preventDefault();return false;})();return false;"></a><a class="weekly-next"  href="javascript:void(0);" onclick="(function(event){event.preventDefault();return false;})();return false;"></a>
                                                </div>`)
    
                    }
    
                    if( $('#mycalendar').length){
    
                        $('#mycalendar').monthly({
                                    mode: 'event',
                                    dataType: 'json',
                                    events: sampleEvents,
                                    isFirst: component.get("v.isFirst"),
                                    viewMonth: viewDate.getMonth(),
                                    viewYear: viewDate.getFullYear()
                                });
    
                        component.set("v.isFirst",false);
                    }
    
                }
            }
    
            var selectDateEle = document.getElementsByClassName('month-header-title-datee');
    
            if(selectDateEle.length){
                console.log('addEventListener snow 1.0--> ');
                for(var i=0; i<selectDateEle.length; i++){
                    console.log('ele >> ', selectDateEle[i]);
                    selectDateEle[i].addEventListener("click",function(event){
                        helper.openDatePickerHelper(component, event, helper);
                    });
                }
            }
    
            // Changes for BUIL-3936
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
    
            // Changes for BUIL-3936
            // When date choosen from Week view set calander and heard according to week...
            // When date choosen from Day view set calander and heard according to Dat...
            // else by default it will set to month view...
            if(component.get("v.currentCalendarView") == 'weekView'){
                component.setWeekView();
            }
            else if(component.get("v.currentCalendarView") == 'dayView'){
                // component.setDayView();
                document.getElementById('mycalendar').style.display = 'none';
    
                /*Show day view div*/
                document.getElementById('mycalendar2').style.display = 'block';
                /*show day view header*/
                document.getElementsByClassName('daily-header')[0].style.display = 'block';
            }
    
             // Changes for BUIL-3936
            // To set yellow circle on selected date;
            // var offset = utc.getTimezoneOffset();

            let selectDate = new Date(component.get("v.startDt")); // Your initial date

            let seletedDateClass = helper.getAdjustedDateString(selectDate);
            
            console.log('selectedDateClass --> ' + seletedDateClass);
    
            var monthDate = document.getElementsByClassName('m-d monthly-day monthly-day-event');
            console.log('monthDate.length : ', monthDate.length);
            if(monthDate.length){
                for(var i=0; i<monthDate.length; i++){
                    console.log('monthDate[i].classList ',monthDate[i].classList);
                    console.log('monthDate[i].value ',monthDate[i].innerHTML);
                    
                    if(monthDate[i].classList.contains(seletedDateClass)){
                        var numberDiv = monthDate[i].querySelector('.monthly-day-number');
                        console.log('number Div ',JSON.parse(JSON.stringify(numberDiv.innerHTML)));
                        
                        if(!numberDiv.classList.contains('selected-Date') && !monthDate[i].classList.contains('monthly-today')){
                            numberDiv.classList.add('selected-Date');
                            console.log(`monthDate ${[i]} : `, monthDate[i].classList);
                            console.log('jonn', monthDate[i]);
                        }
                    }
                    else{
                        if(monthDate[i].querySelector('.monthly-day-number').classList.contains('selected-Date')){
                            monthDate[i].querySelector('.monthly-day-number').classList.remove('selected-Date');
                        }
                    }
                }
            }
            console.log('----- in buildCalendarWithTasks going to call resetEventListeners -----');
            
            component.resetEventListeners();
            component.set("v.showSpinner", false);
        } catch (error) {
            var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "type": "error",
                    "message": "Error Loading Calendar."
                });
                toastEvent.fire();
                // window.location.reload();
            console.log('Error Encountered',error.stack);

        }
    },

    fetchRecordsUsingResource : function(component, helper){
        console.log('INSIDE NEW METHOD');
        
        var activeEle = document.getElementsByClassName('list-group-item');
                    
                    for(let a of activeEle){
                        console.log('ele--->',a.dataset.contractresourceid);
                        if(a.dataset.contractresourceid == component.get("v.isPrevSelectedResource")){
                            component.set("v.newContractResource", a.dataset.contractresourceId);
                            a.blur();
                            $A.util.toggleClass(a, "activeResource");
                            var resourceIndex = Number(a.dataset.resourceindex);
                            var resourceId = a.dataset.contractresourceid;
                            var resources = component.get("v.resourcesList");
                            component.set("v.selectedContractResourceIndex",resourceIndex);
                            var profileSymbol = a.dataset.profilesbl;
                            if(resources.length){
                                if(resourceId){
                                    component.set("v.newContractResource",resourceId);
                                }else{
                                    component.set("v.newContractResource","");
                                }
                                document.getElementById('profileBgSymbol').className = "profile_name me-3 "+profileSymbol;
                                document.getElementById('resourceInitials').innerText = resources[resourceIndex].FirstLetterofContractresourceName;
                                document.getElementById('selectedContractResource').innerText = resources[resourceIndex].ContractresourceName;
                                document.getElementById('selectedContractResourceTradeType').innerText = resources[resourceIndex].TradeType ? resources[resourceIndex].TradeType : 'None';
                    
                                var todayDate = new Date(component.get("v.dateval"));
                                var newfromdate = new Date(todayDate.getFullYear(), todayDate.getMonth(),1);
                                var newtodate;
                                if(todayDate.getMonth() == 11){
                                    newtodate = new Date(todayDate.getFullYear()+1, 0,0);
                                }else{
                                    newtodate = new Date(todayDate.getFullYear(), todayDate.getMonth()+1,0);
                                }
                    
                                var newFromstr,newTostr;
                                component.set("v.showSpinner",true);
                                if(component.get("v.recordId") != '' && component.get("v.recordId") != undefined && component.get("v.recordId") != null){
                                    component.set("v.newSelectedProjectId",component.get("v.newSelectedProjectIdClone"));
                                }
                    
                                newFromstr = $A.localizationService.formatDate(newfromdate, "yyyy-MM-dd");
                                newTostr = $A.localizationService.formatDate(newtodate, "yyyy-MM-dd")
                                console.log('ans 3--->' ,component.get("v.newSelectedProjectId"));
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
                    
                                        // commenting projectList set attribute in order to show all projects with selected project
                                        // component.set("v.projectList", response.getReturnValue().projectList);
                                        var evetList = [];
                                        var projColors = component.get("v.projectColors");
                                        var projColorMap = component.get("v.projectColorMap");
                                        var resourceColors = component.get("v.resourceColors");
                                        var selResourceColorIndex = Number(profileSymbol.split("prof_bg")[1])-1;
                                        console.log(component.get("v.projectColorMap"))
                                        for(var itemIdx=0; itemIdx < response.getReturnValue().projectList.length;itemIdx++){
                                            for(var j=0;j<response.getReturnValue().projectList[itemIdx].CalendarWrapList.length;j++){
                                                var weekName = response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['weekName'];
                                                var startDate = response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['startdate'];
                                                var endDate = response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['enddate'];
                                                if(weekName != null && weekName != undefined){
                                                    var dayNames = component.get("v.dayNames");
                                                    response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['weekSubStr'] = dayNames[new Date(Date.parse(startDate)).getDay()].substring(0,3);
                                                }
                                                response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['startdateNum'] = new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0");
                                                response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['startdateFormatted'] =  $A.localizationService.formatDate(startDate, 'MM-dd-yyyy');
                                                response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['enddateFormatted'] =  $A.localizationService.formatDate(endDate, 'MM-dd-yyyy');
                    
                                                if(projColorMap.get(response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['projectId'])){
                                                    response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['colorName'] = projColorMap.get(response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]['projectId']);
                                                }
                                                evetList.push(response.getReturnValue().projectList[itemIdx].CalendarWrapList[j]);
                                            }
                    
                                        }
                    
                                        var selectedResourceEventList = [];
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
                                                    response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['colorName'] = resourceColors[selResourceColorIndex%10];
                                                        let getDateOnly = (date) => {
                                                        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                                    };
                                                    response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['eventClass'] = getDateOnly(new Date(endDate)) < getDateOnly(new Date()) && response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]['Completion'] < 100? 'event_red': 'event_blue';
                                                    selectedResourceEventList.push(response.getReturnValue().calendarTaskList[k].ProjectTaskRecordsList[j]);
                                                }
                                            }
                    
                                        }
                                        component.set("v.eventList", selectedResourceEventList);
                                        component.set("v.dateEventList",selectedResourceEventList);
                                        component.set("v.resourcesList",response.getReturnValue().calendarTaskList);
                                        component.set("v.areExternalResource", response.getReturnValue().areExternalResource);
                                        component.set("v.areInternalResource", response.getReturnValue().areInternalResource);
                    
                                        var contractResourceIdList = [];
                                        document.getElementById('mycalendar2').style.display = 'none';
                                        document.getElementById('mycalendar').style.display = 'block';
                                        var calendarBuild = component.get("c.buildCalendar");
                                        $A.enqueueAction(calendarBuild);
                                        //component.set("v.showSpinner",false);
                                    } else {
                                        component.set("v.showSpinner", false);
                                        console.log('error',response.getError());
                                    }
                                });
                                $A.enqueueAction(action);
                    
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
                    
                                component.set("v.selectedProjFromResSelect", projectRecIds[0]);
                                console.log(' --> ', component.get("v.selectedProjFromResSelect"));
                            }
                        }
                    }
                    component.set("v.showSpinner", false);
    },

    buildCalendar: function (component, helper) {
        var resources = component.get('v.resourcesList');
        var contractResourceIdList = [];
        for (var i = 0; i < resources.length; i++) {
            contractResourceIdList.push(resources[i].ContractresourceId);
        }
        component.set("v.contractResourceListIds", contractResourceIdList);
        console.log('calling buildCalendar helper');
        helper.buildCalendarWithTasks(component, helper, component.get('v.resourcesList'), component.get("v.selectedContractResourceIndex"));
        if(component.get("v.currentCalendarView") == "dayView"){
            var todayDateHeader = component.get('v.todayDateHeader');
            var today = new Date(Date.parse(todayDateHeader));
            var newfromdate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
            if(component.get("v.isDatePickerInvoked")){
                newfromdate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            }
            var evenList = component.get("v.eventList");
            var currentDateEventList = [];
            let currentEventMap = new Map();
            for (var i = 0; i < evenList.length; i++) {
                var eventItem = evenList[i];
                var eventStartDate = new Date(Date.parse(eventItem['startdate'])).setHours(0, 0, 0, 0);
                var eventEndDate = new Date(Date.parse(eventItem['enddate'])).setHours(0, 0, 0, 0);
                if (eventStartDate <= Date.parse(newfromdate) && eventEndDate >= Date.parse(newfromdate) && !currentEventMap.has(eventItem['Id'])) {
                    currentDateEventList.push(eventItem);
                    currentEventMap.set(eventItem['Id'], true);
                }
            }
            console.log("allevents ", evenList);
            component.set("v.dateEventList", currentDateEventList);
        }

    },

    getTasksByProjects : function(component,helper,Datevalue){
        try {
            
            component.set("v.showSpinner", true);
            var today = new Date(Datevalue);
            var newfromdate = new Date(today.getFullYear(), today.getMonth(),1);
    
            var newtodate;
            if(today.getMonth() == 11){
                newtodate = new Date(today.getFullYear()+1, 0,0);
            }else{
                newtodate = new Date(today.getFullYear(), today.getMonth()+1,0);
            }
    
            var newFromstr,newTostr;
    
            newFromstr = $A.localizationService.formatDate(newfromdate, "yyyy-MM-dd");
            newTostr = $A.localizationService.formatDate(newtodate, "yyyy-MM-dd");
            console.log('component.get("v.project").Id ',component.get("v.project").Id);
    
            helper.getScheduleItems(component, newFromstr, newTostr, component.get("v.selectedTradetype").Id, component.get("v.newSelectedProjectId"), component.get("v.newContractResource"), component.get("v.project").Name, component.get("v.searchResourceFilter"), component.get("v.searchTradeTypeFilter"),component.get("v.searchTaskNameFilter"),component.get("v.allFilter"))
            .then(response => {
                console.log('response.getReturnValue()::',response);
                component.set("v.showSpinner", false);

                component.set("v.projectList", response.projectList);       
                var evetList = [];
                var projColorMap = new Map();
                var projColors = component.get("v.projectColors");
                for(var itemIdx=0; itemIdx < response.projectList.length;itemIdx++){
                    for(var j=0;j<response.projectList[itemIdx].CalendarWrapList.length;j++){
                        var weekName = response.projectList[itemIdx].CalendarWrapList[j]['weekName'];
                        var startDate = response.projectList[itemIdx].CalendarWrapList[j]['startdate'];
                        var endDate = response.projectList[itemIdx].CalendarWrapList[j]['enddate'];
                        if(weekName != null && weekName != undefined){
                            var weeks = component.get("v.dayNames")
                            response.projectList[itemIdx].CalendarWrapList[j]['weekSubStr'] = weeks[new Date(Date.parse(startDate)).getDay()].substring(0,3); //weekName.substring(0,3);
                        }
    
                        response.projectList[itemIdx].CalendarWrapList[j]['startdateNum'] = new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0");
                        response.projectList[itemIdx].CalendarWrapList[j]['startdateFormatted'] = $A.localizationService.formatDate(new Date(Date.parse(startDate)), 'MM-dd-yyyy');//new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0")+'-'+(new Date(Date.parse(startDate)).getMonth()+1).toString().padStart(2, "0")+'-'+new Date(Date.parse(startDate)).getFullYear();
                        response.projectList[itemIdx].CalendarWrapList[j]['enddateFormatted'] = $A.localizationService.formatDate(new Date(Date.parse(endDate)), 'MM-dd-yyyy'); //new Date(Date.parse(endDate)).getDate().toString().padStart(2, "0")+'-'+(new Date(Date.parse(endDate)).getMonth()+1).toString().padStart(2, "0")+'-'+new Date(Date.parse(endDate)).getFullYear();
                        response.projectList[itemIdx].CalendarWrapList[j]['colorName'] = projColors[itemIdx % 10];
                        let getDateOnly = (date) => {
                            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        };
                        response.projectList[itemIdx].CalendarWrapList[j]['eventClass'] = getDateOnly(new Date(endDate)) < getDateOnly(new Date()) && response.projectList[itemIdx].CalendarWrapList[j]['Completion'] < 100? 'event_red': 'event_blue';
                        console.log(response.projectList[itemIdx].CalendarWrapList[j]['eventClass']);
                        if(!projColorMap.has(response.projectList[itemIdx].CalendarWrapList[j]['projectId'])){
                            projColorMap.set(response.projectList[itemIdx].CalendarWrapList[j]['projectId'],projColors[itemIdx%10]);
                        }
                        evetList.push(response.projectList[itemIdx].CalendarWrapList[j]);
                    }
                }
                component.set("v.eventList", evetList);
                component.set("v.dateEventList",evetList);
                component.set("v.standardEventList",evetList);
                component.set("v.resourcesList",response.calendarTaskList);
                component.set("v.areExternalResource", response.areExternalResource);
                component.set("v.areInternalResource", response.areInternalResource);
    
                component.set("v.projectColorMap",projColorMap);
    
                var contractResourceIdList = [];
                for(var i=0;i<response.calendarTaskList.length;i++){
                    contractResourceIdList.push(response.calendarTaskList[i].ContractresourceId);
                }
                component.set("v.contractResourceListIds",contractResourceIdList);
    
                //reset selected values
                component.set("v.newContractResource","");
    
                component.set("v.newSelectedProjectId","");
                component.set("v.selectedContractResourceIndex",-1);
    
                var monthlyArray = [];
    
                for(var i=0; i<evetList.length; i++){
                    var task = evetList[i];
                    console.log('task : ', task);
                    var taskObj = {};
                    taskObj["id"] = task.Id;
                    var name =  task.title ? task.title : task.taskdescription
                    name += task.accountName ? '-'+task.accountName : ''
                    name += task.UnitId ? '-'+task.UnitId :  '-'+task.contractresourceId
                    taskObj['name'] = name; //task.title ? task.title + '-' +task.UnitId : task.taskdescription+ '-' +task.UnitId;
                    taskObj["startdate"]= task.startdate;
                    taskObj["enddate"]= task.enddate;
                    taskObj["starttime"]= "";
                    taskObj["endtime"]= "";
                    taskObj["color"]= task.colorName;
                    taskObj["url"]= '/lightning/r/buildertek__Project_Task__c/' + escape(task.Id) + '/view'; //need to add full url along with baseurl
                    monthlyArray.push(taskObj);
                }
    
                var sampleEvents = {
                    "monthly": monthlyArray
                }
    
                component.set("v.calendarEvents",sampleEvents);
    
                if(Object.keys(sampleEvents).length){
                    console.log('Log just before error',$('#mycalendar'));
                    
                    if(typeof $ == 'function'){
                        var viewDate = new Date(component.get("v.dateval"));
                        var currentDate = new Date();
                        $('#mycalendar').empty();
                        var monthNamesList = component.get("v.monthnames");
                        if(currentDate.getMonth() ==  viewDate.getMonth() && currentDate.getFullYear() == viewDate.getFullYear()){
                            $('#mycalendar').append(`<div class="weekly-header" style="display:none;">
                                                        <div class="weekly-header-title">
                                                            <a class="monthly-weekly-header-title-date" style="pointer-events: none;"  href="#" onclick="(function(event){event.preventDefault();return false;})();return false;">${monthNamesList[currentDate.getMonth()]}&nbsp;${currentDate.getFullYear()}</a>
                                                            <a class="weekly-header-title-date"  href="#" onclick="(function(event){event.preventDefault();return false;})();return false;">Week 1-7</a>
                                                            <a class="month-header-title-datee" id="datepickerAnchor" style="position: relative !important;" onclick="(function(event){event.preventDefault();return false;})();return false;">Select Date </a>
                                                        </div>
                                                            <a class="weekly-prev" href="javascript:void(0);" onclick="(function(event){event.preventDefault();return false;})();return false;"></a>
                                                            <a class="weekly-next" href="javascript:void(0);" onclick="(function(event){event.preventDefault();return false;})();return false;"></a>
                                                    </div>`)
    
                        }else{
                            // for today reset button
                            $('#mycalendar').append(`<div class="weekly-header" style="display:none;">
                                                        <div class="weekly-header-title">
                                                            <a class="monthly-weekly-header-title-date"   style="pointer-events: none;" href="#" onclick="(function(event){event.preventDefault();return false;})();return false;">${monthNamesList[viewDate.getMonth()]}&nbsp;${viewDate.getFullYear()}</a>
                                                            <a class="weekly-header-title-date"  href="#" onclick="(function(event){event.preventDefault();return false;})();return false;">Week 1-7</a>
                                                            <a class="month-header-title-datee" id="datepickerAnchor" style="position: relative !important;" onclick="(function(event){event.preventDefault();return false;})();return false;">Select Date </a>
                                                        </div>
                                                            <a class="weekly-prev" href="javascript:void(0);" onclick="(function(event){event.preventDefault();return false;})();return false;"></a>
                                                            <a class="weekly-next" href="javascript:void(0);" onclick="(function(event){event.preventDefault();return false;})();return false;"></a>
                                                    </div>`)
    
                        }
    
                        if( $('#mycalendar').length){
    
                                $('#mycalendar').monthly({
                                    mode: 'event',
                                    dataType: 'json',
                                    events: sampleEvents,
                                    isFirst: component.get("v.isFirst"),
                                    viewMonth: viewDate.getMonth(),
                                    viewYear: viewDate.getFullYear()
                                });
    
                            component.set("v.isFirst",false);
                        }
                    }
    
                    var selectDateEle = document.getElementsByClassName('month-header-title-datee');
    
                    if(selectDateEle.length){
                        console.log('addEventListener jon 1.0--> ');
                        for(var i=0; i<selectDateEle.length; i++){
                            console.log('ele >> ', selectDateEle[i]);
                            selectDateEle[i].addEventListener("click",function(event){
                                helper.openDatePickerHelper(component, event, helper);
                            });
                        }
                    }
                }
    
                // Changes for BUIL-3936
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
    
                // Changes for BUIL-3936
                // When date choosen from Week view set calander and heard according to week...
                // When date choosen from Day view set calander and heard according to Dat...
                // else by default it will set to month view...
                if(component.get("v.currentCalendarView") == 'weekView'){
                    component.setWeekView();
                }
                else if(component.get("v.currentCalendarView") == 'dayView'){
                    // component.setDayView();
                    document.getElementById('mycalendar').style.display = 'none';
    
                    /*Show day view div*/
                    document.getElementById('mycalendar2').style.display = 'block';
                    /*show day view header*/
                    document.getElementsByClassName('daily-header')[0].style.display = 'block';
    
                    if(currentDate.getMonth() ==  viewDate.getMonth() && currentDate.getFullYear() == viewDate.getFullYear()){
    
                    }
    
                }
    
    
                // Changes for BUIL-3936
                // To set yellow circle on selected date;

                let seletedDateClass = helper.getAdjustedDateString(today);
                var monthDate = document.getElementsByClassName('m-d monthly-day monthly-day-event');
    
                if(monthDate.length){
                    for(var i=0; i<monthDate.length; i++){
                        if(monthDate[i].classList.contains(seletedDateClass)){
                            var numberDiv = monthDate[i].querySelector('.monthly-day-number');
                            if(!numberDiv.classList.contains('selected-Date') && !monthDate[i].classList.contains('monthly-today')){
                                numberDiv.classList.add('selected-Date');
                            }
                        }
                        else{
                            if(monthDate[i].querySelector('.monthly-day-number').classList.contains('selected-Date')){
                                monthDate[i].querySelector('.monthly-day-number').classList.remove('selected-Date');
                            }
                        }
                    }
                }
    
    
                helper.colorFullTasks(component, helper, response);
                helper.buildCalendar(component, helper);
    
                component.set("v.showSpinner", false);
                console.log('----- in getTasksByProjects going to call resetEventListeners -----');
                component.resetEventListeners();
    
            })
            .catch(error => {
                console.log('error in getTasksByProjects : ', {error});
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "type": "error",
                    "message": "Error Loading Calendar."
                });
                toastEvent.fire();
                // window.location.reload();
                component.set("v.showSpinner", false);
            });
        } catch (error) {
            console.error("Encountered error in getTasksByProjects",error.stack);
            
        }
    },

    handleAfterScriptsLoaded : function(component, helper) {
        if(typeof $ == 'function'){

            jQuery("document").ready(function(){
                console.log('jQuery Loaded');
                component.set("v.showSpinner", true);
                console.log(document.getElementById('mycalendar'));
                $A.enqueueAction(component.get("c.doInit"));
            });
        }
        
    },

    handleSaveDates: function(component, event, helper) {
        var startDate = component.get("v.startDt");
        console.log('selected stard date : ', startDate);
        component.set("v.isDatePickerInvoked",true);
        var startDateObj = new Date(startDate);
        console.log('handlesavedata --> '+startDateObj);
        
        console.log(typeof(startDateObj));
        if(startDate != null){
            document.getElementById('profileBgSymbol').className = "profile_name me-3 prof_bg2";
            document.getElementById('resourceInitials').innerText = 'R';
            document.getElementById('selectedContractResource').innerText = 'Resource';
            document.getElementById('selectedContractResourceTradeType').innerText = 'Trade Type';

            component.set("v.showSpinner", true);
            component.set("v.newContractResource","");
            if(component.get("v.recordId") != '' && component.get("v.recordId") != undefined && component.get("v.recordId") != null){
                component.set("v.newSelectedProjectId",component.get("v.newSelectedProjectIdClone"));
            }else{
                component.set("v.newSelectedProjectId","");
            }
            component.set("v.selectedContractResourceIndex",-1);
            var Datevalue =  startDateObj;
            var weeks = component.get("v.dayNames")
            component.set("v.currDay",weeks[new Date(Date.parse(Datevalue)).getDay()].substring(0,3));
            component.set("v.currDate",new Date(Date.parse(Datevalue)).getDate().toString().padStart(2, "0"));

            component.set("v.dateval",Datevalue);
            component.set("v.datevalString",Datevalue.toLocaleDateString());
            component.set("v.todayDateHeader",Datevalue.toDateString());
            console.log("Datevalue.toDateString() :--->" , Datevalue.toDateString());
            component.set("v.todayDate",Datevalue.toLocaleDateString());
            component.set("v.SelectedDate" ,startDate);
            helper.getTasksByProjects(component,helper, Datevalue);

        }else{
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "type": "error",
                "message": "Start date cannot be empty."
            });
            toastEvent.fire();
        }

    },

    openDatePickerHelper: function(component, event, helper){
        try {
            console.log('inside openDatePickerHelper');
            if(!component.get("v.isDatePickerLoaded")){
                console.log('Initialize the date picker');
                // Initialize the date picker
                $(`#datepickerPlaceholder`).datepicker({
                changeMonth: true,
                changeYear: true,
                showOn: 'button',
                // buttonImageOnly: true,
                // buttonImage: 'images/calendar.gif',
                dateFormat: 'yy-MM-dd',
                yearRange: '-20:+20',
                showAnim: 'fold',
                    onSelect: function(dateText, inst) {
                        console.log('dateText ==> ' , dateText);
                        // Handle the selected date
                        component.set("v.startDt" ,dateText);
                        $(`#datepickerPlaceholder`).hide();
                        helper.handleSaveDates(component,event,helper);
                    }
                });

                // Hide the date picker initially
                $(`#datepickerPlaceholder`).hide();

                component.set("v.isDatePickerLoaded", true);
            }

            $(`#datepickerPlaceholder`).toggle();
            component.set("v.isBackShadow", $(`#datepickerPlaceholder`).is(":visible"));
        } catch (error) {
            console.log('error in  openDatePickerHelper : ', error.stack);

        }
    },

    handleSelectedProject: function (component, event, helper) {

        event.stopPropagation();
        component.set("v.showSpinner", true);

        if (event.currentTarget.dataset.projid) {
            component.set("v.newSelectedProjectId", event.currentTarget.dataset.projid);
            component.set("v.newSelectedProjectIdClone", event.currentTarget.dataset.projid);
        } else {
            component.set("v.newSelectedProjectId", "");
        }

        component.set("v.newContractResource", "");
        component.set("v.selectedContractResourceIndex", "-1");
        var todayDate = new Date(component.get("v.dateval"));
        var newfromdate = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        var newtodate;
        if (todayDate.getMonth() == 11) {
            newtodate = new Date(todayDate.getFullYear() + 1, 0, 0);
        } else {
            newtodate = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
        }

        var newFromstr, newTostr;

        newFromstr = $A.localizationService.formatDate(newfromdate, "yyyy-MM-dd");
        newTostr = $A.localizationService.formatDate(newtodate, "yyyy-MM-dd")
        console.log('ans 2--->', component.get("v.newSelectedProjectId"));
        console.log('component.get("v.project").Id ',component.get("v.project").Name);

        helper.getScheduleItems(component, newFromstr, newTostr, component.get("v.selectedTradetype").Id, component.get("v.newSelectedProjectId"), component.get("v.newContractResource"), component.get("v.project").Name, component.get("v.searchResourceFilter"), component.get("v.searchTradeTypeFilter"),component.get("v.searchTaskNameFilter"),component.get("v.allFilter"))
        .then(function (response) {
            console.log('response.getReturnValue()::', response);

            var evetList = [];
            var resourceColor = component.get("v.resourceColors");

            for (var k = 0; k < response.calendarTaskList.length; k++) {
                if (response.calendarTaskList[k].ProjectTaskRecordsList) {
                    for (var j = 0; j < response.calendarTaskList[k].ProjectTaskRecordsList.length; j++) {
                        var weekName = response.calendarTaskList[k].ProjectTaskRecordsList[j]['weekName'];
                        var startDate = response.calendarTaskList[k].ProjectTaskRecordsList[j]['startdate'];
                        if (weekName != null && weekName != undefined) {
                            var dayNames = component.get("v.dayNames");
                            response.calendarTaskList[k].ProjectTaskRecordsList[j]['weekSubStr'] = dayNames[new Date(Date.parse(startDate)).getDay()].substring(0, 3); //weekName.substring(0,3);
                        }

                        response.calendarTaskList[k].ProjectTaskRecordsList[j]['startdateNum'] = new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0");
                        var endDate = response.calendarTaskList[k].ProjectTaskRecordsList[j]['enddate'];
                        response.calendarTaskList[k].ProjectTaskRecordsList[j]['startdateFormatted'] = $A.localizationService.formatDate(startDate, 'MM-dd-yyyy');// new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0")+'-'+new Date(Date.parse(startDate)).getMonth().toString().padStart(2, "0")+'-'+new Date(Date.parse(startDate)).getFullYear();
                        response.calendarTaskList[k].ProjectTaskRecordsList[j]['enddateFormatted'] = $A.localizationService.formatDate(endDate, 'MM-dd-yyyy');//new Date(Date.parse(endDate)).getDate().toString().padStart(2, "0")+'-'+new Date(Date.parse(endDate)).getMonth().toString().padStart(2, "0")+'-'+new Date(Date.parse(endDate)).getFullYear();
                        response.calendarTaskList[k].ProjectTaskRecordsList[j]['colorName'] = resourceColor[k % 10];
                        evetList.push(response.calendarTaskList[k].ProjectTaskRecordsList[j]);

                    }
                }
            }
            component.set("v.eventList", evetList);
            component.set("v.dateEventList", evetList);
            component.set("v.standardEventList", evetList);
            component.set("v.resourcesList", response.calendarTaskList);
            component.set("v.areExternalResource", response.areExternalResource);
            component.set("v.areInternalResource", response.areInternalResource);

            document.getElementById('mycalendar').style.display = 'block';
            document.getElementById('mycalendar2').style.display = 'none';

            /*reset selected resource  */
            document.getElementById('profileBgSymbol').className = "profile_name me-3 prof_bg2";
            document.getElementById('resourceInitials').innerText = 'R';
            document.getElementById('selectedContractResource').innerText = 'Resource';
            document.getElementById('selectedContractResourceTradeType').innerText = 'Trade Type';

            helper.buildCalendar(component, helper);
        })
        .catch(function (error) {
            component.set("v.showSpinner", false);
            console.log('error', error);
        });

    },

    getScheduleItems: function(component, fromDate, toDate, slectedTradetypeId, slectedprojectId, slectedcontactId, projectSearch, resourceSearch, tradeTypeSearch, taskNameSearch,alltypeSearch) {
        try {

            console.log('----- in getScheduleItems ---');
            return new Promise((resolve, reject) => {
                var action = component.get("c.getScheduleItemsByProject");
                action.setParams({
                    "fromDate": fromDate,
                    "toDate": toDate,
                    "slectedTradetypeId": slectedTradetypeId,
                    "slectedprojectId": slectedprojectId,
                    "slectedcontactId": slectedcontactId,
                    "projectSearch": projectSearch,
                    "resourceSearch": resourceSearch,
                    "tradeTypeSearch": tradeTypeSearch,
                    "taskNameSearch": taskNameSearch,
                    "alltypeSearch": alltypeSearch,
                    "resourceFilter": component.get("v.resourceFilterValue")
                });
                
                action.setCallback(this, function(response) {
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        let result = response.getReturnValue();
                        console.log('result in promise : ', result);
                        resolve(response.getReturnValue());
                    } else if (state === "ERROR") {
                        let error = response.getError();
                        console.log('erorr in promise : ', error);
                        reject(response.getError());
                    }
                });
                
                $A.enqueueAction(action);
                setTimeout(function(){
                    const hiddenButton = document.getElementById("hiddenButton");
                    hiddenButton.click();
                }, 500);
            });
        } catch (error) {
            console.error('SOMETHING WENT WRONG',error.stack)
        }
    },

    colorFullTasks: function(component, helper, response) {
        var evetList = [];
        var resourceColor = component.get("v.resourceColors");

        for (var k = 0; k < response.calendarTaskList.length; k++) {
            if (response.calendarTaskList[k].ProjectTaskRecordsList) {
                for (var j = 0; j < response.calendarTaskList[k].ProjectTaskRecordsList.length; j++) {
                    var weekName = response.calendarTaskList[k].ProjectTaskRecordsList[j]['weekName'];
                    var startDate = response.calendarTaskList[k].ProjectTaskRecordsList[j]['startdate'];
                    if (weekName != null && weekName != undefined) {
                        var dayNames = component.get("v.dayNames");
                        response.calendarTaskList[k].ProjectTaskRecordsList[j]['weekSubStr'] = dayNames[new Date(Date.parse(startDate)).getDay()].substring(0, 3); //weekName.substring(0,3);
                    }

                    response.calendarTaskList[k].ProjectTaskRecordsList[j]['startdateNum'] = new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0");
                    var endDate = response.calendarTaskList[k].ProjectTaskRecordsList[j]['enddate'];
                    response.calendarTaskList[k].ProjectTaskRecordsList[j]['startdateFormatted'] = $A.localizationService.formatDate(startDate, 'MM-dd-yyyy');// new Date(Date.parse(startDate)).getDate().toString().padStart(2, "0")+'-'+new Date(Date.parse(startDate)).getMonth().toString().padStart(2, "0")+'-'+new Date(Date.parse(startDate)).getFullYear();
                    response.calendarTaskList[k].ProjectTaskRecordsList[j]['enddateFormatted'] = $A.localizationService.formatDate(endDate, 'MM-dd-yyyy');//new Date(Date.parse(endDate)).getDate().toString().padStart(2, "0")+'-'+new Date(Date.parse(endDate)).getMonth().toString().padStart(2, "0")+'-'+new Date(Date.parse(endDate)).getFullYear();
                    response.calendarTaskList[k].ProjectTaskRecordsList[j]['colorName'] = resourceColor[k % 10];
                    let getDateOnly = (date) => {
                        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    };
                    response.calendarTaskList[k].ProjectTaskRecordsList[j]['eventClass'] = getDateOnly(new Date(endDate)) < getDateOnly(new Date()) && response.calendarTaskList[k].ProjectTaskRecordsList[j]['Completion'] < 100? 'event_red': 'event_blue';
                    console.log(response.calendarTaskList[k].ProjectTaskRecordsList[j]['eventClass']);
                    evetList.push(response.calendarTaskList[k].ProjectTaskRecordsList[j]);
                }
            }
        }
        component.set("v.eventList", evetList);
        component.set("v.dateEventList", evetList);
        component.set("v.standardEventList", evetList);
        component.set("v.resourcesList", response.calendarTaskList);
        component.set("v.areExternalResource", response.areExternalResource);
        component.set("v.areInternalResource", response.areInternalResource);

        document.getElementById('mycalendar').style.display = 'block';
        document.getElementById('mycalendar2').style.display = 'none';

        /*reset selected resource  */
        document.getElementById('profileBgSymbol').className = "profile_name me-3 prof_bg2";
        document.getElementById('resourceInitials').innerText = 'R';
        document.getElementById('selectedContractResource').innerText = 'Resource';
        document.getElementById('selectedContractResourceTradeType').innerText = 'Trade Type';
    },

    getAdjustedDateString : function (selectDate) {
        // Get the client's time zone offset in minutes
        let clientTimeZoneOffset = new Date().getTimezoneOffset();
    
        // Adjust the date by the offset in minutes (convert to milliseconds)
        let adjustedDate = new Date(selectDate.getTime() - clientTimeZoneOffset * 60 * 1000);
    
        // Extract the year, month, and day
        let year = adjustedDate.getUTCFullYear();
        let month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
        let day = String(adjustedDate.getUTCDate()).padStart(2, '0'); // Adjust day as required
    
        return `dateV${year}-${month}-${day}`;
    },

    getAdjustedDate : function (selectDate){
        let receivedDate = new Date(selectDate);
        let clientTimeZoneOffset = new Date().getTimezoneOffset();
        let adjustedDate = new Date(receivedDate.getTime() - clientTimeZoneOffset * 60 * 1000);
        return Date.parse(adjustedDate);

    }

})