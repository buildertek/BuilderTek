public class ResourceScheduledashboardController{
    @AuraEnabled
    public static list<Wrapper> getAllResourcess(list<String> selected){
        list<Wrapper> wraplst = new list<Wrapper>();
        Map<Id, list<buildertek__Project_Task__c>> scheduleitemmap = new Map<Id, list<buildertek__Project_Task__c>>();
        list<buildertek__Project_Task__c> schduleitems = new list<buildertek__Project_Task__c>();

        if (selected.size() > 0){
            schduleitems = [SELECT id, Name, buildertek__Contractor__c, buildertek__Contractor_Resource_2__c, buildertek__Contractor_Resource_1__c,buildertek__Contractor_Resource_2__r.Name, buildertek__Contractor_Resource_1__r.Name, buildertek__Contractor_Resource_3__c, buildertek__Contractor_Resource_3__r.Name, buildertek__Original_Start_Date__c, buildertek__Original_End_Date__c, buildertek__Trade_Type__c, buildertek__Trade_Type__r.Name
                            FROM buildertek__Project_Task__c WHERE buildertek__Contractor_Resource_1__c IN :selected OR buildertek__Contractor_Resource_2__c IN :selected OR buildertek__Contractor_Resource_3__c IN :selected];
        } else{
            schduleitems = [SELECT id, Name, buildertek__Contractor__c, buildertek__Contractor_Resource_2__c, buildertek__Contractor_Resource_1__c,buildertek__Contractor_Resource_2__r.Name, buildertek__Contractor_Resource_1__r.Name,buildertek__Original_Start_Date__c, buildertek__Original_End_Date__c, buildertek__Trade_Type__c, buildertek__Trade_Type__r.Name
                            FROM buildertek__Project_Task__c WHERE buildertek__Contractor_Resource_1__c != null OR buildertek__Contractor_Resource_2__c != null OR buildertek__Contractor_Resource_3__c != null];
        }
        set<Id> conid = new set<Id>();
        set<Id> accountIDs = new set<Id>();
        Map<Id, string> contactnamemap = new Map<Id, string>();

        for (buildertek__Project_Task__c schitem : schduleitems){
            if (schItem.buildertek__Contractor_Resource_1__c != null) {
                conid.add(schItem.buildertek__Contractor_Resource_1__c);
            }
            if (schItem.buildertek__Contractor_Resource_2__c != null) {
                conid.add(schItem.buildertek__Contractor_Resource_2__c);
            }
            if (schItem.buildertek__Contractor_Resource_3__c != null) {
                conid.add(schItem.buildertek__Contractor_Resource_3__c);
            }

            if (!scheduleitemmap.containsKey(schitem.buildertek__Contractor_Resource_1__c)){
                scheduleitemmap.put(schitem.buildertek__Contractor_Resource_1__c, new List<buildertek__Project_Task__c>());
            }
            scheduleitemmap.get(schitem.buildertek__Contractor_Resource_1__c).add(schitem);
            if (schitem.buildertek__Contractor_Resource_1__c != null){
                contactnamemap.put(schitem.buildertek__Contractor_Resource_1__c, schitem.buildertek__Contractor_Resource_1__r.Name);
            }

            if (!scheduleitemmap.containsKey(schitem.buildertek__Contractor_Resource_2__c)){
                scheduleitemmap.put(schitem.buildertek__Contractor_Resource_2__c, new List<buildertek__Project_Task__c>());
            }
            scheduleitemmap.get(schitem.buildertek__Contractor_Resource_2__c).add(schitem);
            if (schitem.buildertek__Contractor_Resource_2__c != null){
                contactnamemap.put(schitem.buildertek__Contractor_Resource_2__c, schitem.buildertek__Contractor_Resource_2__r.Name);
            }

            if (!scheduleitemmap.containsKey(schitem.buildertek__Contractor_Resource_3__c)){
                scheduleitemmap.put(schitem.buildertek__Contractor_Resource_3__c, new List<buildertek__Project_Task__c>());
            }
            scheduleitemmap.get(schitem.buildertek__Contractor_Resource_3__c).add(schitem);
            if (schitem.buildertek__Contractor_Resource_3__c != null){
                contactnamemap.put(schitem.buildertek__Contractor_Resource_3__c, schitem.buildertek__Contractor_Resource_3__r.Name);
            }

        }

        for (Id rec : scheduleitemmap.keySet()){
            Wrapper wraprec = new Wrapper();
            wraprec.recordId = rec;
            wraprec.Name = contactnamemap.get(rec);
            wraprec.Tasks = string.valueof(scheduleitemmap.get(rec).size());
            wraplst.add(wraprec);
        }

        return wraplst;
    }

    @AuraEnabled
    public static list<buildertek__Project_Task__c> getAllProjectTaskscontacts(list<String> selected){
        list<buildertek__Project_Task__c> projectTaskList;
        if (selected.size() > 0){
            projectTaskList = [SELECT id, Name, buildertek__Schedule__c, buildertek__Contractor__c, buildertek__Contractor_Resource_2__c, buildertek__Contractor_Resource_1__c,buildertek__Contractor_Resource_1__r.Name,buildertek__Contractor_Resource_2__r.Name, buildertek__Contractor_Resource_3__c, buildertek__Contractor_Resource_3__r.Name, buildertek__Original_Start_Date__c, buildertek__Original_End_Date__c
                               FROM buildertek__Project_Task__c WHERE buildertek__Contractor_Resource_1__c IN :selected OR buildertek__Contractor_Resource_2__c IN :selected OR buildertek__Contractor_Resource_3__c IN :selected];
        } else{
            projectTaskList = [SELECT id, Name, buildertek__Schedule__c, buildertek__Contractor__c, buildertek__Contractor_Resource_2__c, buildertek__Contractor_Resource_1__c,buildertek__Contractor_Resource_1__r.Name,buildertek__Contractor_Resource_2__r.Name, buildertek__Contractor_Resource_3__c, buildertek__Contractor_Resource_3__r.Name, buildertek__Original_Start_Date__c, buildertek__Original_End_Date__c
                               FROM buildertek__Project_Task__c WHERE buildertek__Contractor_Resource_1__c != null OR buildertek__Contractor_Resource_2__c != null OR buildertek__Contractor_Resource_3__c != null];
        }
        return projectTaskList;
    }

    @AuraEnabled
    public static list<ResourceCalendarWrap> getWeekRecords(string fromDate, string toDate, string slectedTradetypeId, string slectedprojectId, string slectedcontactId){
        system.debug(slectedTradetypeId + '---' + slectedprojectId + '---' + slectedcontactId + '---' + fromDate + '---' + toDate);
        Map<Id, list<buildertek__Project_Task__c>> scheduleitemmap = new Map<Id, list<buildertek__Project_Task__c>>();
        Map<Id, string> contactnamemap = new Map<Id, string>();
        list<buildertek__Project_Task__c> schudleitemList = new list<buildertek__Project_Task__c>();
        list<buildertek__Project_Task__c> scitemList = new list<buildertek__Project_Task__c>();
        list<contact> conresource = new list<contact>();

        String str = fromDate;
        List<String> res = str.split('/');
        System.debug(Date.newInstance(Integer.valueOf(res[2]),Integer.valueOf(res[0]),Integer.valueOf(res[1])));

        String str2 = toDate;
        List<String> res2 = str2.split('/');
        System.debug(Date.newInstance(Integer.valueOf(res2[2]),Integer.valueOf(res2[0]),Integer.valueOf(res2[1])));

        date startDate  = Date.newInstance(Integer.valueOf(res[2]),Integer.valueOf(res[0]),Integer.valueOf(res[1]));
        date endDate = Date.newInstance(Integer.valueOf(res2[2]),Integer.valueOf(res2[0]),Integer.valueOf(res2[1]));
        String dtFormat = 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'';

        list<buildertek__Project_Task__c> schduleitems = [SELECT id, Name, buildertek__Schedule__c, buildertek__Contractor__c, buildertek__Contractor_Resource_2__c, buildertek__Contractor_Resource_1__c, buildertek__Contractor_Resource_1__r.Name,buildertek__Contractor_Resource_2__r.Name, buildertek__Contractor_Resource_3__c, buildertek__Contractor_Resource_3__r.Name,buildertek__Original_Start_Date__c, buildertek__Original_End_Date__c From buildertek__Project_Task__c WHERE (buildertek__Contractor_Resource_1__c != null OR buildertek__Contractor_Resource_2__c != null OR buildertek__Contractor_Resource_3__c != null) AND buildertek__Schedule__c != null AND buildertek__Start__c <=:endDate AND buildertek__Finish__c >=: startDate];
        set<Id> conid = new set<Id>();
        set<Id> scheduleids = new set<Id>();
        for (buildertek__Project_Task__c scitem : schduleitems){
            if (scitem.buildertek__Contractor_Resource_1__c != null) {
                conid.add(scitem.buildertek__Contractor_Resource_1__c);
            }
            if (scitem.buildertek__Contractor_Resource_2__c != null) {
                conid.add(scitem.buildertek__Contractor_Resource_2__c);
            }
            if (scitem.buildertek__Contractor_Resource_3__c != null) {
                conid.add(scitem.buildertek__Contractor_Resource_3__c);
            }
            scheduleids.add(scitem.buildertek__Schedule__c);
        }
        System.debug('conid.size() ==> ' + conid.size());

        string scheduletype = 'Master';
        string Query = 'select id,Name,buildertek__Duration__c,buildertek__Completion__c,buildertek__Schedule__c,buildertek__Dependency__c,buildertek__Contractor_Resource_2__c,buildertek__Contractor_Resource_1__c,buildertek__Contractor_Resource_1__r.Name,buildertek__Contractor_Resource_1__r.buildertek__Simultaneous_Tasks__c, buildertek__Contractor_Resource_3__c, buildertek__Contractor_Resource_3__r.Name, buildertek__Contractor_Resource_3__r.buildertek__Simultaneous_Tasks__c,buildertek__Contractor_Resource_2__r.Name,buildertek__Contractor_Resource_2__r.buildertek__Simultaneous_Tasks__c,';
        Query += 'buildertek__Schedule__r.buildertek__Project__c,buildertek__Schedule__r.buildertek__Project__r.Name,buildertek__Schedule__r.buildertek__Contractor__c,buildertek__Schedule__r.buildertek__Contractor__r.Name,buildertek__Schedule__r.buildertek__Contractor__r.buildertek__Simultaneous_Tasks__c,buildertek__Schedule__r.Name,buildertek__Dependency__r.Name,';
        Query += 'buildertek__Resource__r.Name,buildertek__Resource__c,buildertek__Start__c,buildertek__Finish__c from ';
        Query += 'buildertek__Project_Task__c where ';
        Query += 'buildertek__Schedule__c != null and (buildertek__Start__c <=:endDate OR buildertek__Finish__c >=: startDate)'; 
        if (slectedprojectId != null && slectedprojectId != ''){
            Query += ' and buildertek__Schedule__r.buildertek__Project__c=:slectedprojectId';
        }
        Query += ' and buildertek__Contractor_Resource_1__c IN:conid';

        schudleitemList = Database.query(Query);
        system.debug('schudleitemList----->' + schudleitemList.size());
        Map<Id, string> tradeTypenamemap = new Map<Id, string>();
        Map<Id, string> contactAccountMap = new Map<Id, string>();
        Map<Id, Decimal> contactSimulateMap = new Map<Id, Decimal>();
        for (contact conrec : [SELECT id, Name, AccountId, buildertek__Simultaneous_Tasks__c FROM Contact WHERE id IN :conid]){
            if (conrec.AccountId != null){
                contactAccountMap.put(conrec.id, conrec.AccountId);
                if (conrec.buildertek__Simultaneous_Tasks__c != null){
                    contactSimulateMap.put(conrec.id, conrec.buildertek__Simultaneous_Tasks__c);
                }
            }
        }
        for (Account accrec : [SELECT id, Name, buildertek__Trade_Type_Lookup__c, buildertek__Simultaneous_Tasks__c, buildertek__Trade_Type_Lookup__r.Name FROM account WHERE id IN :contactAccountMap.values()]){
            if (accrec.buildertek__Trade_Type_Lookup__c != null){
                tradeTypenamemap.put(accrec.id, accrec.buildertek__Trade_Type_Lookup__r.Name);
            }
        }

        string contactQuery = 'Select id,Name,Account.Name,buildertek__Simultaneous_Tasks__c From Contact Where';
        if (slectedTradetypeId != null && slectedTradetypeId != ''){
            contactQuery += ' Account.buildertek__Trade_Type_Lookup__c=: slectedTradetypeId And';
        }
        if (slectedcontactId != null && slectedcontactId != ''){
            contactQuery += ' Id=: slectedcontactId';
        } else{
            contactQuery += ' id IN: conid';
        }
        contactQuery += ' order by Name asc';
        system.debug('--contactQuery---' + contactQuery);
        conresource = Database.query(contactQuery);

        for (buildertek__Project_Task__c scitem : schudleitemList){
            if (!scheduleitemmap.containsKey(scitem.buildertek__Contractor_Resource_1__c)){
                scheduleitemmap.put(scitem.buildertek__Contractor_Resource_1__c, new List<buildertek__Project_Task__c>());
            }
            scheduleitemmap.get(scitem.buildertek__Contractor_Resource_1__c).add(scitem);
            if (!scheduleitemmap.containsKey(scitem.buildertek__Contractor_Resource_2__c)){
                scheduleitemmap.put(scitem.buildertek__Contractor_Resource_2__c, new List<buildertek__Project_Task__c>());
            }
            scheduleitemmap.get(scitem.buildertek__Contractor_Resource_2__c).add(scitem);
            if (!scheduleitemmap.containsKey(scitem.buildertek__Contractor_Resource_3__c)){
                scheduleitemmap.put(scitem.buildertek__Contractor_Resource_3__c, new List<buildertek__Project_Task__c>());
            }
            scheduleitemmap.get(scitem.buildertek__Contractor_Resource_3__c).add(scitem);

            if (scitem.buildertek__Contractor_Resource_1__c != null){
                contactnamemap.put(scitem.buildertek__Contractor_Resource_1__c, scitem.buildertek__Contractor_Resource_1__r.Name);
            }
            if (scitem.buildertek__Contractor_Resource_2__c != null){
                contactnamemap.put(scitem.buildertek__Contractor_Resource_2__c, scitem.buildertek__Contractor_Resource_2__r.Name);
            }
            if (scitem.buildertek__Contractor_Resource_3__c != null){
                contactnamemap.put(scitem.buildertek__Contractor_Resource_3__c, scitem.buildertek__Contractor_Resource_3__r.Name);
            }
        }
        list<ResourceCalendarWrap> RecordList = new list<ResourceCalendarWrap>();
        if (schudleitemList.size() > 0){
            for (contact con : conresource){
                if (contactnamemap.get(con.id) != null){
                    ResourceCalendarWrap projectRec = new ResourceCalendarWrap();
                    projectRec.ContractresourceId = con.id;
                    projectRec.ContractresourceName = contactnamemap.get(con.Id);

                    if(contactnamemap.get(con.Id) !=null && contactnamemap.get(con.Id) !=''){
                        projectRec.FirstLetterofContractresourceName = contactnamemap.get(con.Id).toUpperCase().substring(0,1);
                    }
                    if (contactSimulateMap.containsKey(con.Id)){
                        projectRec.simultaneousTasksContractorResources = contactSimulateMap.get(con.Id);
                    }
                    if (scheduleitemmap.get(con.id) != null){
                        projectRec.tasks = string.valueof(scheduleitemmap.get(con.id).size());
                    }
                    if (contactAccountMap.get(con.id) != null){
                        projectRec.TradeType = tradeTypenamemap.get(contactAccountMap.get(con.id));
                    }
                    projectRec.Companyname = con.Account.Name;
                    System.debug(projectRec.ContractresourceId);

                    list<ResourceCalendarWrap.ProjectTaskRecords> EquipmentRecordList = new list<ResourceCalendarWrap.ProjectTaskRecords>();
                    for (buildertek__Project_Task__c pse : schudleitemList){
                        if (con.id == pse.buildertek__Contractor_Resource_1__c || con.id == pse.buildertek__Contractor_Resource_2__c || con.id == pse.buildertek__Contractor_Resource_3__c){
                            ResourceCalendarWrap.ProjectTaskRecords EquipmentRec = new ResourceCalendarWrap.ProjectTaskRecords();
                            Datetime dt = (DateTime)pse.buildertek__Start__c;
                            String dayOfWeek = dt.format('yyyy-MM-dd');

                            EquipmentRec.title = pse.Name;
                            EquipmentRec.startString = '';
                            EquipmentRec.endString = '';
                            string s = string.valueOfGmt(pse.buildertek__Start__c);
                            String strDate = s.split(' ')[0];

                            String sMonth = String.valueof(pse.buildertek__Start__c.month());
                            system.debug('sMonth***'+sMonth);
                            String sDay = String.valueof(pse.buildertek__Start__c.day());
                            system.debug('sDay***'+sDay);
                            if (sMonth.length() == 1){
                                sMonth = '0' + sMonth;
                            }
                            if (sDay.length() == 1){
                                sDay = '0' + sDay;
                            }
                            string ndate = sMonth + '/' + sDay + '/' + String.valueof(pse.buildertek__Start__c.year());

                            if (pse.buildertek__Finish__c != null){
                                string FinishDate = string.valueOfGmt(pse.buildertek__Finish__c);
                                String FinishDatestrDate = FinishDate.split(' ')[0];
                                String FinishDatesMonth = String.valueof(pse.buildertek__Finish__c.month());
                                String FinishDatesDay = String.valueof(pse.buildertek__Finish__c.day());
                                if (FinishDatesMonth.length() == 1){
                                    FinishDatesMonth = '0' + FinishDatesMonth;
                                }
                                if (FinishDatesDay.length() == 1){
                                    FinishDatesDay = '0' + FinishDatesDay;
                                }
                                string FinishDatendate = FinishDatesMonth + '/' + FinishDatesDay + '/' + String.valueof(pse.buildertek__Finish__c.year());
                                string ndate1 = String.valueof(pse.buildertek__Start__c.year())+'-' + sMonth + '-' + sDay;
                                Datetime dt1 = DateTime.newInstance(date.valueOf(ndate1), Time.newInstance(0, 0, 0, 0));
                                String dateStr = dt1.format('EEEE');
                                EquipmentRec.weekName = dateStr;
                                system.debug('--dateStr--->' + dateStr);
                                system.debug('--ndate--->' + ndate1);
                                EquipmentRec.day = ndate;
                                EquipmentRec.endday = FinishDatendate;
                                EquipmentRec.projectId = pse.buildertek__Schedule__r.buildertek__Project__r.Name;
                                EquipmentRec.contractresourceId = pse.buildertek__Contractor_Resource_1__r.Name;
                                EquipmentRec.Id = pse.id;
                                EquipmentRec.taskdescription = pse.Name;
                                EquipmentRec.taskdays = integer.valueof(pse.buildertek__Duration__c);
                                EquipmentRec.Completion = integer.valueof(pse.buildertek__Completion__c);
                                EquipmentRec.startdate = pse.buildertek__Start__c;
                                EquipmentRec.enddate = pse.buildertek__Finish__c;
                                EquipmentRec.Eid = pse.buildertek__Schedule__c;
                                EquipmentRec.Model = pse.buildertek__Schedule__r.Name;
                                EquipmentRec.UnitId = pse.buildertek__Resource__r.Name;
                                EquipmentRecordList.add(EquipmentRec);
                            }
                        }
                    }
                    projectRec.ProjectTaskRecordsList = EquipmentRecordList;
                    system.debug('************************projectRec'+projectRec);
                    RecordList.add(projectRec);
                }
            }
        }

        return RecordList;
    }

    @AuraEnabled
    public static list<buildertek__Project_Task__c> getScheduleItemsByResource(String contactId){
        List<buildertek__Project_Task__c> taskList = new List<buildertek__Project_Task__c>();
        string Query = 'select id,Name,buildertek__Duration__c,buildertek__Completion__c,buildertek__Schedule__c,buildertek__Dependency__c,buildertek__Contractor_Resource_1__c,buildertek__Contractor_Resource_1__r.Name,buildertek__Contractor_Resource_1__r.buildertek__Simultaneous_Tasks__c,buildertek__Contractor_Resource_2__c,buildertek__Contractor_Resource_2__r.Name,buildertek__Contractor_Resource_2__r.buildertek__Simultaneous_Tasks__c, buildertek__Contractor_Resource_3__c, buildertek__Contractor_Resource_3__r.Name, buildertek__Contractor_Resource_3__r.buildertek__Simultaneous_Tasks__c, ';
        Query += 'buildertek__Schedule__r.buildertek__Project__c,buildertek__Project__c,buildertek__Schedule__r.buildertek__Project__r.Name,buildertek__Schedule__r.buildertek__Contractor__c,buildertek__Contractor__c, buildertek__Contractor__r.Name,buildertek__Schedule__r.buildertek__Contractor__r.Name,buildertek__Schedule__r.buildertek__Contractor__r.buildertek__Simultaneous_Tasks__c,buildertek__Schedule__r.Name,buildertek__Dependency__r.Name,';
        Query += 'buildertek__Resource__r.Name,buildertek__Resource__c,buildertek__Start__c,buildertek__Finish__c from ';
        Query += 'buildertek__Project_Task__c where ';
        Query += '(buildertek__Contractor_Resource_1__c=: contactId OR buildertek__Contractor_Resource_2__c=: contactId OR buildertek__Contractor_Resource_3__c=: contactId)';
        taskList = Database.query(Query);
        system.debug('schudleitemList----->' + taskList.size());
        return taskList;
    }

    @AuraEnabled
    public static list<buildertek__Project_Task__c> getScheduleItemsByContact(String contactId){
        list<Contact> Query = [SELECT Id, Name, Account.Name, Account.buildertek__Trade_Type_Lookup__r.Name,Account.buildertek__Trade_Type_Lookup__c FROM Contact WHERE Id=: contactId];
        String[] idList = new String[]{Query[0].Account.buildertek__Trade_Type_Lookup__c};
        list<buildertek__Project_Task__c> Query2 = [SELECT id, Name,buildertek__Project__c,buildertek__Start__c,buildertek__Contractor__c,buildertek__Expected_End_Date__c, buildertek__Trade_Type__r.Name,buildertek__Contractor_Resource_2__c, buildertek__Contractor_Resource_1__c,buildertek__Contractor_Resource_1__r.Name,buildertek__Contractor_Resource_2__r.Name, buildertek__Contractor_Resource_3__c,buildertek__Contractor_Resource_3__r.Name FROM buildertek__Project_Task__c WHERE buildertek__Trade_Type__c IN :idList AND (buildertek__Contractor_Resource_1__c = NULL OR buildertek__Contractor_Resource_2__c = NULL OR buildertek__Contractor_Resource_3__c = NULL)];
        return Query2;
    }

    @AuraEnabled
    public static list<buildertek__Project_Task__c> updateRecords(list<buildertek__Project_Task__c> listOfRecords){
        return null;
    }

    public class Wrapper{
        @AuraEnabled
        public string recordId{ get; set; }

        @AuraEnabled
        public string Name{ get; set; }

        @AuraEnabled
        public String Tasks{ get; set; }

        @AuraEnabled
        public String TradeType{ get; set; }
    }

    @AuraEnabled
    public static void deleteResource(String scheduleItemId){
        if(scheduleItemId !=null){
            buildertek__Project_Task__c scheduleItem=[SELECT Id, Name, buildertek__Contractor_Resource_1__c, buildertek__Contractor_Resource_2__c, buildertek__Contractor_Resource_3__c FROM buildertek__Project_Task__c WHERE Id = :scheduleItemId LIMIT 1];
            if(scheduleItem.buildertek__Contractor_Resource_1__c != null){
                scheduleItem.buildertek__Contractor_Resource_1__c = null;
            }
            if(scheduleItem.buildertek__Contractor_Resource_2__c != null){
                scheduleItem.buildertek__Contractor_Resource_2__c = null;
            }
            if(scheduleItem.buildertek__Contractor_Resource_3__c != null){
                scheduleItem.buildertek__Contractor_Resource_3__c = null;
            }
            update scheduleItem;
        }
    }
}