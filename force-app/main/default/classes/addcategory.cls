public class addcategory {

    public static void insertFiveContacts (){
        List<buildertek__Category__c> you = new List<buildertek__Category__c>();
    
        for(integer i=0; i<5; i++){
        
        buildertek__Category__c tet = new buildertek__Category__c();
            tet.Name = 'Unspotted' +i;
           you.add(tet);
            
        }
if(!you.isEmpty()) {
            try {
                insert you;
                System.debug('Five contacts inserted successfully.');
            } catch(Exception e) {
                System.debug('Error occurred while inserting contacts: ' + e.getMessage());
            }
}
}
}