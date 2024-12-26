public class ApexclassforToastPOC {
    
    @AuraEnabled
    @future (callout=true)
    public static void performAsyncOperation(String inputParam) {
        // Simulate an asynchronous operation
        try {
            // Perform your logic here
            // For demonstration purposes, let's assume a success scenario
            System.debug('Async operation successful with input: ' + inputParam);
            
            // Call the Aura component and show a success toast
            addPageMessage('Async operation successful!', ApexPages.Severity.CONFIRM);
        } catch (Exception e) {
            // Log or handle any errors
            System.debug('Async operation failed: ' + e.getMessage());
            
            // Call the Aura component and show an error toast
            addPageMessage('Async operation failed. Check the console for details.', ApexPages.Severity.ERROR);
        }
    }

    // Helper method to add a page message for toast
    public static void addPageMessage(String message, ApexPages.Severity severity) {
        ApexPages.Message myMsg = new ApexPages.Message(severity, message);
        ApexPages.addMessage(myMsg);
    }
}