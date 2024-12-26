global without sharing class POlineswithGroupingNameController{

    global string poId;

    global list<buildertek__Purchase_Order_Item__c> POItem;

    global list<buildertek__Cost_Codes__c> QuotelineCostCode;

    global decimal Totalquotelineamount{ get; set; }

    global list<wrapperClass> wrapperlst{ get; set; }

    global list<buildertek__Purchase_Order__c> poList{ get; set; }

    global void setrelatedToId(string Id){
        this.poId = Id;
        Polinegroupingdata();
    }

    global string getrelatedToId(){
        return poId;
    }

    global void Polinegroupingdata(){
        wrapperlst = new list<wrapperClass>();
        Totalquotelineamount = 0.0;
        poList = [select id, buildertek__Project__c, buildertek__Roll_Up_All_Lines__c from buildertek__Purchase_Order__c where id = :poId limit 1];
        POItem = [select Id, Name, buildertek__Quantity__c,buildertek__Notes__c,buildertek__Unit_Price__c,buildertek__Total_Price__c from buildertek__Purchase_Order_Item__c where buildertek__Purchase_Order__c = :poId];

        if (poList[0].buildertek__Roll_Up_All_Lines__c == true){
            wrapperClass wrap = new wrapperClass();
            for (buildertek__Purchase_Order_Item__c qutitem : POItem){
                Totalquotelineamount += qutitem.buildertek__Total_Price__c;
            }
            wrap.groupName = 'All Work and Material';
            wrap.listTotal = Totalquotelineamount;
            wrapperlst.add(wrap);
        }
    }

    global class wrapperClass{
        global String groupName{ get; set; }

        global decimal listTotal{ get; set; }
    }
}