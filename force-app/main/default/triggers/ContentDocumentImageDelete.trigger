trigger ContentDocumentImageDelete on ContentDocument (before delete) {
    Set<Id> productId = new Set<Id>();
    List<buildertek__Question__c> questionsMapRecs=new List<buildertek__Question__c>();
    Set<Id> contentDocRecs = new Set<Id>();
    Map<Id,ContentVersion> contentRecs = new Map<Id,ContentVersion>();
    
    if(Trigger.isBefore && Trigger.isDelete){
        for (ContentDocument content: Trigger.old) {
            if(content.FileType=='jpeg' || content.FileType=='png' || content.FileType=='jpg'){
                contentDocRecs.add(content.Id);
            }
        }
        
        List<ContentVersion> contVersion =[SELECT Id,ContentDocumentId,FirstPublishLocationId FROM ContentVersion WHERE ContentDocumentId IN : contentDocRecs];
        for(ContentVersion conV: contVersion){
            contentRecs.put(conV.FirstPublishLocationId,conV);
        }
        
        questionsMapRecs =[Select Id,buildertek__Image_Id__c,buildertek__Product__c,buildertek__Document_Id__c FROM buildertek__Question__c WHERE Product__c IN : contentRecs.keySet()];
        if(questionsMapRecs.size()>0){
            for(buildertek__Question__c question: questionsMapRecs){
                if(contentRecs.containsKey(question.buildertek__Product__c)){
                    question.Image_Id__c='';
                    question.Document_Id__c='';
                }
            }
            update questionsMapRecs;
        }

        //BUIL-4491
        try {
            Set<Id> linkedEntityIds = new Set<Id>();
            List<ContentDocumentLink> links = [SELECT LinkedEntityId FROM ContentDocumentLink WHERE ContentDocumentId IN :Trigger.oldMap.keySet()];

            for (ContentDocumentLink link : links) {
                if (link.LinkedEntityId != null) {
                    linkedEntityIds.add(link.LinkedEntityId);
                }
            }

            if (!linkedEntityIds.isEmpty()) {
                List<String> poDocumentTitles = new List<String>();
                List<ContentDocumentLink> allLinks = [SELECT ContentDocument.Title, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId IN :linkedEntityIds];
                
                for (ContentDocumentLink link : allLinks) {
                    if (link.ContentDocument.Title.startsWith('PO-')) {
                        poDocumentTitles.add(link.ContentDocument.Title);
                    }
                }
                
                if (!poDocumentTitles.isEmpty()) {
                    Map<Id, Integer> poPdfCounts = new Map<Id, Integer>();
        
                    for (ContentDocumentLink link : allLinks) {
                        if (poDocumentTitles.contains(link.ContentDocument.Title)) {
                            if (poPdfCounts.containsKey(link.LinkedEntityId)) {
                                poPdfCounts.put(link.LinkedEntityId, poPdfCounts.get(link.LinkedEntityId) + 1);
                            } else {
                                poPdfCounts.put(link.LinkedEntityId, 1);
                            }
                        }
                    }
        
                    List<buildertek__Purchase_Order__c> posToUpdate = new List<buildertek__Purchase_Order__c>();
        
                    for (Id poId : linkedEntityIds) {
                        if (poPdfCounts.containsKey(poId) && poPdfCounts.get(poId) == 1) {
                            posToUpdate.add(new buildertek__Purchase_Order__c(Id = poId, buildertek__Has_PO_PDF_Attached__c = false));
                        }
                    }
        
                    if (!posToUpdate.isEmpty()) {
                        update posToUpdate;
                    }
                }
            } 
        } catch (Exception e) {
            BT_ExceptionHandler.Store_Exception(e);
        }       
    }    
}