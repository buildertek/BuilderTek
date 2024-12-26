public without sharing class QBPOMap {
    public static String mapVendorAccountData(Account acc, Integer a){
        String accId = acc.Id;
        String QBId = acc.buildertek__QB_ID__c;
        QBVendorJSON customer = new QBVendorJSON();

        String AccountId = acc.Id;
        //Map given account fields
        customer.CompanyName = acc.Name +' - '+AccountId.right(4).substring(0,4);
        customer.Active = True;       
        customer.SyncToken = acc.QBO_SyncToken__c;
        customer.sparse = True;
     
        //Create Shipping address
        QBVendorJSON.BillAddr BillAddr = new QBVendorJSON.BillAddr();
        BillAddr.City = acc.ShippingCity;
        BillAddr.Line1 = acc.ShippingStreet;
        BillAddr.CountrySubDivisionCode = acc.ShippingState;
        BillAddr.PostalCode = acc.ShippingPostalCode;
        BillAddr.Lat = String.valueOf(acc.ShippingLatitude);
        BillAddr.Long_x = String.valueOf(acc.ShippingLongitude);
        BillAddr.CountrySubDivisionCode = acc.ShippingCountry;
        customer.BillAddr = BillAddr;

        customer.PrintOnCheckName = acc.Name;

        //Create Email Address
        QBVendorJSON.PrimaryEmailAddr Addr = new QBVendorJSON.PrimaryEmailAddr();
        Addr.Address = acc.buildertek__Email_Address__c;
        customer.PrimaryEmailAddr = Addr;

        //Create Primary Phone
        QBVendorJSON.PrimaryPhone phone = new QBVendorJSON.PrimaryPhone ();
        phone.FreeFormNumber = acc.Phone;
        customer.PrimaryPhone = phone;
        customer.Id = acc.buildertek__QB_ID__c;
        customer.DisplayName = acc.Name;

        return JSON.serialize(customer, True).replace('"Long_x":', '"Long":');
 
    }
}