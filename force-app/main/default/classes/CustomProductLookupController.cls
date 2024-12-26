public with sharing class CustomProductLookupController {
    @AuraEnabled
    public static List<Product2> searchProductsByPricebook(String searchTerm, Id pricebookId) {
        // Validate inputs
        if (String.isBlank(searchTerm) || pricebookId == null) {
            return new List<Product2>();
        }
        
        // Sanitize search term
        searchTerm = String.escapeSingleQuotes(searchTerm);
        
        // Query to get products in the selected pricebook
        List<Product2> products = [
            SELECT Id, 
                   Name, 
                   ProductCode 
            FROM Product2 
            WHERE Id IN (
                SELECT Product2Id 
                FROM PricebookEntry 
                WHERE Pricebook2Id = :pricebookId 
                AND IsActive = TRUE
            )
            AND (
                Name LIKE :('%' + searchTerm + '%') 
                OR ProductCode LIKE :('%' + searchTerm + '%')
            )
            LIMIT 10
        ];
        
        return products;
    }
}