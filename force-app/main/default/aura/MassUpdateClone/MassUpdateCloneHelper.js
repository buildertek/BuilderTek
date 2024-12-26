({
    getAdminValues: function (component, event, helper) {
        var btadminaction = component.get("c.getadminvalues");
        btadminaction.setCallback(this, function(response) {
            console.log('admnvalues');
            console.log(response.getState());
            if (response.getState() === 'SUCCESS') {
                var result = response.getReturnValue();
                // component.set('v.removeSingleQuoteLineOption', result[0]);
                component.set('v.hideGlobalMargin', result[1]);
                component.set('v.hideGlobalMarkup', result[2]);
            }else{
                console.log('A Problem Occurred: ' + JSON.stringify(response.error));
            }
            // console.log('removeSingleQuoteLineOption', component.get('v.removeSingleQuoteLineOption'));
            console.log('hideGlobalMargin', component.get('v.hideGlobalMargin'));
            console.log('hideGlobalMarkup', component.get('v.hideGlobalMarkup'));

            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();
        });
        $A.enqueueAction(btadminaction);
    },
})