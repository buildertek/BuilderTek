({
    doInit: function (component, event, helper) {
       let poItem = component.get("v.poItem");
       console.log('poItem: ', poItem);
    },

    closeModel: function (component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    },

    Save: function (component, event, helper) {
        console.log('Save');
    },
})