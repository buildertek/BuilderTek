({
  Helper: function (component, event, helper) {},
  getTemplateBody: function(component) {
    var recordId = component.get("v.recordId");
    var action = component.get("c.getSalesOrderLines");
    action.setParams({
      recordId: recordId,
      templateId: component.get("v.selectedTemplate")
    });
    action.setCallback(this, function(response) {
      var state = response.getState();
      if (state === "SUCCESS") {
        var result = response.getReturnValue();
        component.set("v.changeOrderLines", result);
      }
    });
    $A.enqueueAction(action);
  }
});