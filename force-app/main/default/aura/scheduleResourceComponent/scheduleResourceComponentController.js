({
    doInit: function (component, event, helper) {
        var workspaceAPI = component.find("workspace");
        workspaceAPI.getEnclosingTabId().then((response) => {
            let opendTab = response.tabId;
            workspaceAPI.setTabLabel({
                tabId: opendTab,
                label: "Schedule Resources Tab"
            });
            workspaceAPI.setTabIcon({
                tabId: opendTab,
                icon: 'custom:custom92',
                iconAlt: 'Schedule Tab'
            });
        })

    },

    redirectToResoucePage: function(component, event, helper){
        try {
            console.log('inside redirectToResoucePage');
            console.log('values from child : ', event.getParam('value'));
        } catch (error) {
            console.log('error in redirectToResoucePage : ', error.stack);
            
        }
    }

})