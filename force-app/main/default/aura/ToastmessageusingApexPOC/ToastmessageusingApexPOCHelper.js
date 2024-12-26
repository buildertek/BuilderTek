// AsyncOperationComponentHelper.js
({
    showToast : function(message, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": type.charAt(0).toUpperCase() + type.slice(1),
            "message": message,
            "type": type,
        });
        toastEvent.fire();
    }
})