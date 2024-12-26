public class ProjectGeoLocationController implements Schedulable {
    
    private List<ID> recordIds;

    public ProjectGeoLocationController(List<Id> recordIds) {
        this.recordIds = recordIds;
    }


    public void execute(SchedulableContext sc) {
        
        List<Account> accListToDelete = new List<Account>();

        List<Account> acctList = new List<Account>();
        acctList = [SELECT Id, Name, buildertek__ProjectId__c, BillingCity, BillingCountry, BillingState, BillingStreet, BillingLatitude, BillingLongitude FROM Account WHERE Id IN:recordIds];

        List<buildertek__Project__c> projectListToUpdate = new List<buildertek__Project__c>();

        for (Account acc : acctList) {
            if (!String.isBlank(acc.buildertek__ProjectId__c) && acc.Name == acc.buildertek__ProjectId__c) {
                System.debug('acc.BillingLatitude '+acc.BillingLatitude);
                System.debug('acc.BillingLongitude '+acc.BillingLongitude);
                buildertek__Project__c project = new buildertek__Project__c();
                project.Id = acc.buildertek__ProjectId__c;
                project.buildertek__Geolocation__Latitude__s = acc.BillingLatitude;
                project.buildertek__Geolocation__Longitude__s = acc.BillingLongitude;
                projectListToUpdate.add(project);
                accListToDelete.add(acc);
            }
        }

        if (projectListToUpdate.size() > 0) {
            update projectListToUpdate;
        }

        if (accListToDelete.size() > 0) {
            delete accListToDelete;
        }
    }
}