// public class createPDFController {
//   public String emailTemplateContent { get; set; }

//    public string createPDFController(String templateId) {
//        EmailTemplate template = [SELECT Id, Name, Subject, Body,htmlvalue FROM EmailTemplate WHERE Id = '00X1K000000wTITUA2'];
//        system.debug(template.htmlValue);
//        return template.htmlValue;
//    }
// }
public class CreatePDFController {
    @InvocableMethod(label='Generate PDF' description='Generates a PDF from an Email Template')
    public static List<Id> generatePDF(List<Id> recordIds) {
        List<Id> processedRecordIds = new List<Id>();

        for (Id recordId : recordIds) {
            // Retrieve Email Template content
            EmailTemplate template = [SELECT HtmlValue FROM EmailTemplate WHERE Id = '00X41000000MYpuEAG'];

            // Merge template with record data if needed
            String mergedContent = template.HtmlValue;
            System.debug('mergedContent :--> ' + mergedContent);

            // Convert HTML content to PDF
            Blob pdfBlob = convertToPDF(mergedContent);
            
            // Process the PDF Blob as needed (e.g., save to records, email, etc.)

            // Add the processed record Id to the list
            processedRecordIds.add(recordId);
        }

        return processedRecordIds;
    }

    // Method to convert HTML content to PDF
    private static Blob convertToPDF(String htmlContent) {
        Blob pdfBlob;
        try {
            pdfBlob = Blob.valueOf(htmlContent);
            System.debug('pdfBlob :--> ' + pdfBlob);
        } catch (Exception e) {
            System.debug('Error generating PDF: ' + e.getMessage());
            pdfBlob = null;
        }
        return pdfBlob;
    }
}