public with sharing class Preview_Checklist_Answer_Controller{

    public List<Integer> listOfIntegers { get; set; }
    public List<Section> data1 {get; set;}
    public String recordId { get; set; }

    public Preview_Checklist_Answer_Controller(){
        recordId = ApexPages.currentPage().getParameters().get('recordId');
        System.debug('recordId '+recordId);
        List<SObject> checkListResList1 = [SELECT buildertek__Question_Name__c, buildertek__QuestionireQuestion__c, buildertek__Answer__c, buildertek__Questions__c, buildertek__Questions__r.buildertek__Section__c, buildertek__Questions__r.buildertek__Section__r.Name, buildertek__Questions__r.buildertek__Sub_Section__r.Name, buildertek__Checklist_Response__r.buildertek__ContactChecklist__r.Name, buildertek__Checklist_Response__r.buildertek__ProjectChecklist__r.Name  FROM buildertek__Questionnaire__c WHERE buildertek__Checklist_Response__c =:recordId];
        data1 = formatData(checkListResList1);
    }

    @AuraEnabled
    public static List<buildertek__Questionnaire__c> getFormReponseData(String responesId){
        List<buildertek__Questionnaire__c> checkListResList = new List<buildertek__Questionnaire__c>();
        checkListResList = [SELECT buildertek__Question_Name__c, buildertek__QuestionireQuestion__c, buildertek__Answer__c, buildertek__Questions__c, buildertek__Questions__r.buildertek__Section__c, buildertek__Questions__r.buildertek__Section__r.Name, buildertek__Questions__r.buildertek__Sub_Section__r.Name, buildertek__Checklist_Response__r.buildertek__ContactChecklist__r.Name, buildertek__Checklist_Response__r.buildertek__ProjectChecklist__r.Name  FROM buildertek__Questionnaire__c WHERE buildertek__Checklist_Response__c =: responesId];
        return checkListResList;
    }

    // Method to transform the data
    public List<Section> formatData(List<SObject> data) {
        List<Section> transformedData = new List<Section>();
        Integer counter = 0;

        // Loop through each item in the input data
        for (SObject item : data) {
            counter++;
            String sectionName = (String)item.getSObject('buildertek__Questions__r')
                                .getSObject('buildertek__Section__r').get('Name');
            String subSectionName = '';
            if (item.getSObject('buildertek__Questions__r')
                    .getSObject('buildertek__Sub_Section__r') != null) {
                subSectionName = (String)item.getSObject('buildertek__Questions__r')
                                    .getSObject('buildertek__Sub_Section__r').get('Name');
            } else {
                subSectionName = 'No Sub-Section';
            }

            // Find the section in the transformed data
            Section section = null;
            for (Section sec : transformedData) {
                if (sec.sectionName == sectionName) {
                    section = sec;
                    break;
                }
            }

            // If the section doesn't exist, create a new one
            if (section == null) {
                section = new Section(sectionName);
                transformedData.add(section);
            }

            // Find the sub-section within the section
            SubSection subSection = null;
            for (SubSection sub : section.subSections) {
                if (sub.subSectionName == subSectionName) {
                    subSection = sub;
                    break;
                }
            }

            // If the sub-section doesn't exist, create a new one
            if (subSection == null) {
                subSection = new SubSection(subSectionName);
                section.subSections.add(subSection);
            }

            // Add the item data to the appropriate sub-section
            String questionName = (String)item.get('buildertek__Question_Name__c');
            String question = (String)item.get('buildertek__QuestionireQuestion__c');
            String answer = (String)item.get('buildertek__Answer__c');
            if (answer == null) {
                answer = '';
            }

            SubSectionData subSectionData = new SubSectionData(counter, questionName, question, answer);
            subSection.data.add(subSectionData);
        }

        return transformedData;
    }

    //* method to save pdf File on checklist response
    @AuraEnabled
    public static void attachPdfToRecord(String recordId, String base64Pdf) {
        // Check if recordId and base64Pdf are not null or empty
        if (String.isEmpty(recordId) || String.isEmpty(base64Pdf)) {
            throw new IllegalArgumentException('Record ID and PDF content cannot be null or empty.');
        }

        // Decode the base64 content to binary
        Blob pdfBlob = EncodingUtil.base64Decode(base64Pdf);

        // Create ContentVersion
        ContentVersion contentVersion = new ContentVersion();
        contentVersion.Title = 'Generated PDF';
        contentVersion.PathOnClient = 'GeneratedPDF.pdf'; // Filename of the document
        contentVersion.VersionData = pdfBlob;
        contentVersion.IsMajorVersion = true;
        insert contentVersion;

        // Get the ContentDocumentId from the ContentVersion
        Id contentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion.Id].ContentDocumentId;

        // Create ContentDocumentLink to associate the ContentDocument with the record
        ContentDocumentLink contentDocumentLink = new ContentDocumentLink();
        contentDocumentLink.ContentDocumentId = contentDocumentId;
        contentDocumentLink.LinkedEntityId = recordId; // Record ID to attach the file to
        contentDocumentLink.ShareType = 'V'; // View access
        contentDocumentLink.Visibility = 'AllUsers'; // Make it visible to all users (modify as needed)
        insert contentDocumentLink;
    }

    // Wrapper class for the SubSection data
    public class SubSectionData {
        public Integer count {get; set;}
        public String Question_Name {get; set;}
        public String Question {get; set;}
        public String Answer {get; set;}

        public SubSectionData(Integer count, String Question_Name, String Question, String Answer) {
            this.count = count;
            this.Question_Name = Question_Name;
            this.Question = Question;
            this.Answer = Answer;
        }
    }
    
    // Wrapper class for the SubSection
    public class SubSection {
        public String subSectionName {get; set;}
        public List<SubSectionData> data {get; set;}

        public SubSection(String subSectionName) {
            this.subSectionName = subSectionName;
            this.data = new List<SubSectionData>();
        }
    }

    // Wrapper class for the Section
    public class Section {
        public String sectionName {get; set;}
        public List<SubSection> subSections {get; set;}

        public Section(String sectionName) {
            this.sectionName = sectionName;
            this.subSections = new List<SubSection>();
        }
    }


}