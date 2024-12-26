public with sharing class BT_ExceptionHandler {
    public static void Store_Exception(Exception e){
        try {

            // Substring Method And Class Name FROM Stack Trace....
                String stackTrace = e.getStackTraceString().substringBefore('\n');
                String className = '';
                if(stackTrace.contains('buildertek.')){
                    className = stackTrace.substringAfter('buildertek.').substringBefore('.');	
                }
                else{
                    className = stackTrace.substringAfter('Class.').substringBefore('.');
                }
            	String methodName = stackTrace.substringBefore(':').substringAfter(className).substringAfter('.');
                
            	//Governer Limit of executingQuery 
                String QueryLimit = '1. SOQL Queries used / SOQL Queries allowed: ' + Limits.getQueries() + '/' + Limits.getLimitQueries();
                String DMLimit = '2. Number of records queried so far /  Number allowed: ' + Limits.getDmlRows() + '/' + Limits.getLimitDmlRows();
                String DMLStat = '3. Number of DML statements used so far / Number allowed: ' +  Limits.getDmlStatements() + '/' + Limits.getLimitDmlStatements();   
                String CPUT = '4. Amount of CPU time (in ms) used so far / CPU usage time (in ms) allowed: ' + Limits.getCpuTime() + '/' + Limits.getLimitCpuTime();
              
            	//Log information in object
                buildertek__Exception_Log__c exc = new buildertek__Exception_Log__c();
                exc.buildertek__Governor_Limit_Used__c = String.format('{0}\n{1}\n{2}\n{3}',new List<string>{QueryLimit, DMLimit,DMLStat,CPUT});
                exc.buildertek__Exception_Message__c = e.getMessage();
                exc.buildertek__Exception_Type__c = e.getTypeName();
                exc.buildertek__Exception_Line_Number__c = e.getLineNumber();
                exc.buildertek__Exception_Stack_Trace__c = e.getStackTraceString();
                exc.buildertek__Method_Name__c=methodName;
                exc.buildertek__Class_Name__c=className;
                exc.buildertek__Whole_Exception__c = string.valueOf(e);
                insert exc;

                // system.debug('Govt_Limit_in_Executing_Code__c : '+ String.format('{0}\n{1}\n{2}\n{3}',new List<string>{QueryLimit, DMLimit,DMLStat,CPUT}));
                // system.debug('Exception_Message__c : ' + e.getMessage());
                // system.debug('Exception_Type__c : ' + e.getTypeName());
                // system.debug('Line_Number__c : ' + e.getLineNumber());
                // system.debug('StackTrace__c : '+ e.getStackTraceString());
                // system.debug('methodName : ' + methodName);
                // system.debug('className : ' + className);
                // system.debug(' Excepition : ' + e);
                // system.debug(' getCause : ' + e.getCause());
            
        } catch (Exception error) {
            system.debug('error in Store_Exception >> '+ error);
        } 
    }
}