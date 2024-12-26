public with sharing class csvUploaderController {
  @AuraEnabled
  public static void createRecordsFromCSV(Id fileId, Id recordId) {
    try {
      Integer recordsCreated = 0;
      List < Contact > RecordToInsert = new List < Contact > ();
      
      ContentVersion csvFile = [SELECT VersionData FROM ContentVersion WHERE ContentDocumentId = :fileId LIMIT 1];

      if (csvFile  != null) { 
        String csvData = csvFile.VersionData.toString();
 
        List<String> rows = csvData.split('\n'); 
 
            for (String row : rows) { 
                List<String> tokens = row.split(',');
 
                if (tokens.size() == 3) {
                    Contact record = new Contact();
                    // record.recordTypeId = RecordTypeId;
                    record.FirstName = tokens[0];
                    record.LastName = tokens[1];
                    record.Phone = tokens[2];
                    record.AccountId= recordId;
                    RecordToInsert.add(record);
                } else {
                    System.debug('Skipping invalid line: ' + row);
                }
            }
      }
      
      for(Contact c:RecordToInsert){
          Database.insert(c);
          recordsCreated++;
      }
        // recordsCreated = Custom_Record__c.size();
        // system.debug('recordsCreated ->' + recordsCreated);
        // system.debug('RecordsInsert ->' + Custom_Record__c);
        // //Call Queueable Class 
        // CSVProcessingQueueable queueable = new CSVProcessingQueueable(Custom_Record__c);
        // System.enqueueJob(queueable);

    } catch (Exception e) {
        System.debug(e.getMessage());
        throw new AuraHandledException(e.getMessage()+e.getStackTraceString()+e.getLineNumber());
      
    }
  }

}