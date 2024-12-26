({
    doInit : function(component, event, helper) {
        component.set("v.IsSpinner", true);
        setTimeout(function() {
            component.set("v.IsSpinner", false);
            var wrapper = document.getElementById("signature-pad");
            if (wrapper != undefined) {
                var canvas = wrapper.querySelector("canvas");
                var signaturePad;
                function resizeCanvas() {
                    var ratio = Math.max(window.devicePixelRatio || 1, 1);
                    canvas.width = canvas.offsetWidth * ratio;
                    canvas.height = canvas.offsetHeight * ratio;
                    canvas.getContext("2d").scale(ratio, ratio);
                }

                window.onresize = resizeCanvas;
                resizeCanvas();

                window.signaturePad = new SignaturePad(canvas);

                document.getElementById("btnClear").onclick = function(event) {
                    event.preventDefault();
                    console.log(window.signaturePad);
                    window.signaturePad.clear();
                }
            }
        }, 3000);
    },
    
    closeModel : function(component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
    },

    saveModel : function(component, event, helper) {
        if (!signaturePad.isEmpty()) {
            console.log("Signature is not empty");
            component.set("v.IsSpinner", true);
            helper.getuploadSignature(component, event);

        } else {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "type": 'error',
                "message": "Please Sign and Accept"
            });
            toastEvent.fire();
        }
    }
})