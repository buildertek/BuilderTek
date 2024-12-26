@isTest
public class ImagePreviewControllerTest {
    
    public static testMethod void test1() {

        buildertek__Selection__c sheet = new buildertek__Selection__c();
        sheet.Name = 'Test Sheet';

        insert sheet;

        List<buildertek__Section__c> categoryList = new List<buildertek__Section__c>();

        buildertek__Section__c category = new buildertek__Section__c();
        category.Name = 'Test category';
        category.buildertek__Selection__c = sheet.Id;
        categoryList.add(category);

        buildertek__Section__c category1 = new buildertek__Section__c();
        category1.Name = 'Test category 1';
        category1.buildertek__Selection__c = sheet.Id;
        categoryList.add(category1);

        insert categoryList;

        List<buildertek__Question_Group__c> typeList = new List<buildertek__Question_Group__c>();

        buildertek__Question_Group__c type = new buildertek__Question_Group__c();
        type.Name = 'Test type';
        type.buildertek__Section__c = categoryList[0].Id;
        typeList.add(type);

        buildertek__Question_Group__c type1 = new buildertek__Question_Group__c();
        type1.Name = 'Test type 1';
        typeList.add(type1);

        insert typeList;

        Product2 product = new Product2();
        product.Name = 'Test Product';
        insert product;

        ContentVersion contentVersion = new ContentVersion();
        contentVersion.Title = 'Test Image';
        contentVersion.VersionData = Blob.valueOf('Sample Image Content'); 
        contentVersion.PathOnClient = 'Test Image.png'; 
        contentVersion.FirstPublishLocationId = product.Id;
        insert contentVersion;

        List<buildertek__Question__c> optionList = new List<buildertek__Question__c>();

        buildertek__Question__c option = new buildertek__Question__c();
        option.Name = 'Test option';
        option.buildertek__Product__c = product.Id;
        option.buildertek__Question_Group__c = typeList[0].Id;
        optionList.add(option);

        buildertek__Question__c option1 = new buildertek__Question__c();
        option1.Name = 'Test option 1';
        option1.buildertek__Product__c = product.Id;
        optionList.add(option1);
        
        buildertek__Question__c option3 = new buildertek__Question__c();
        option3.Name = 'Test option 3';
        option3.buildertek__Product__c = null;
        option3.buildertek__Question_Group__c = typeList[0].Id;
        optionList.add(option3);

        insert optionList;

        Test.startTest();
        ImagePreviewController.getProductFilesMap('');
        ImagePreviewController.getProductFilesMap('');
        ImagePreviewController.getSelectionCategoryFiles('');
        ImagePreviewController.getSelectionCategoryFiles('');
        ImagePreviewController.getSelectionCategories('');
        Test.stopTest();
        
    }


}