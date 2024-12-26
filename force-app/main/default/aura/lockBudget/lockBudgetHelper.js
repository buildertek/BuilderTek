({
    showToast: function (title, message, variant) {
        $A.get("e.force:showToast").fire({
            title: title,
            message: message,
            type: variant,
            duration: 3000
        });
    }
})