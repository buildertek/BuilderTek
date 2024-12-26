({
    getuploadSignature : function(component, event) {
        var recId = component.get("v.recordId");
        var signName = component.get("v.SignatureName");
        var signatureaction = component.get("c.saveSignonTS");
        var toastEvent = $A.get('e.force:showToast');
        var canvas = document.getElementById("divsign");
        var context = canvas.getContext("2d");

        // Create a new canvas to draw the white background
        var newCanvas = document.createElement("canvas");
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        var newContext = newCanvas.getContext("2d");

        // Fill the new canvas with white background
        newContext.fillStyle = "#FFFFFF";
        newContext.fillRect(0, 0, newCanvas.width, newCanvas.height);

        // Draw the original canvas on top of the white background
        newContext.drawImage(canvas, 0, 0);

        var vSplit = newCanvas.toDataURL().split(',')[1];



        signatureaction.setParams({
            base64Data: encodeURIComponent(vSplit),
            contentType: "image/png",
            recId: recId,
            signName: signName,
        });
        signatureaction.setCallback(this, function(e) {
            if (e.getState() == 'SUCCESS') {
                var result = e.getReturnValue();
                component.set("v.IsSpinner", false);
                component.set("v.fileimageId", result);
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success!",
                    "type": 'success',
                    "message": "Signature Saved Successfully"
                });
                toastEvent.fire();
                $A.get("e.force:refreshView").fire();
                $A.get("e.force:closeQuickAction").fire();
                // location.reload();

            } else {
                alert(JSON.stringify(e.getError()));
            }
        });
        $A.enqueueAction(signatureaction);
    }
})