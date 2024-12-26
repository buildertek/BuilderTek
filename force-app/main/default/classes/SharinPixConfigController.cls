public with sharing class SharinPixConfigController {
    public Boolean sharinPixValue{ get; set; }
    public String sharinPixPreSubToken{ get; set; }
    public String sharinPixPostSubToken{ get; set; }

    public SharinPixConfigController() {
        try {
            buildertek__Admin_Interface_Node_Configuration__c adminInterfaceNodeConfigurations = [Select Id, buildertek__SharinPix_Feature__c, buildertek__SharinPix_Pre_Sub_Token__c, buildertek__SharinPix_Post_Sub_Token__c	
		                                                                                      from buildertek__Admin_Interface_Node_Configuration__c
		                                                                                      WHERE Name = :'SharinPix Configuration'];

            sharinPixValue = adminInterfaceNodeConfigurations.buildertek__SharinPix_Feature__c;
            sharinPixPreSubToken = adminInterfaceNodeConfigurations.buildertek__SharinPix_Pre_Sub_Token__c;
            sharinPixPostSubToken = adminInterfaceNodeConfigurations.buildertek__SharinPix_Post_Sub_Token__c;

        } catch (Exception ex) {
            System.debug('Error --> ' + ex.getMessage());
        }
        
    }

	public void onCreateemailaddress(){
        try {
            buildertek__Admin_Interface_Node_Configuration__c adminInterfaceNodeConfigurations = [Select Id, buildertek__SharinPix_Feature__c, buildertek__SharinPix_Pre_Sub_Token__c, buildertek__SharinPix_Post_Sub_Token__c
		                                                                                      from buildertek__Admin_Interface_Node_Configuration__c
		                                                                                      WHERE Name = :'SharinPix Configuration'];

            adminInterfaceNodeConfigurations.buildertek__SharinPix_Feature__c = sharinPixValue;
            adminInterfaceNodeConfigurations.buildertek__SharinPix_Pre_Sub_Token__c = sharinPixPreSubToken;
            adminInterfaceNodeConfigurations.buildertek__SharinPix_Post_Sub_Token__c = sharinPixPostSubToken;

            update adminInterfaceNodeConfigurations;

            ApexPages.addmessage(new ApexPages.message(ApexPages.severity.CONFIRM, 'Updated Successfully'));

        } catch (Exception ex) {
            System.debug('Error --> ' + ex.getMessage());
            List<buildertek__Exception_Log_Store_Option__c> StoreExcCustomSetting = [SELECT Id, buildertek__Store_Exception_Log_in_Object__c FROM buildertek__Exception_Log_Store_Option__c];
            if (!StoreExcCustomSetting.isEmpty() && StoreExcCustomSetting[0].buildertek__Store_Exception_Log_in_Object__c == true) {
                BT_ExceptionHandler.Store_Exception(ex);
            }
        }
		
	}
}