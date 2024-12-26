({
    convertArrayOfObjectsToCSV : function(component,event,helper){
       // declare variables
       var csvStringResult, keys, columnDivider;
       columnDivider = ',';
       keys = [ 'Name','Dependency','StartDate','Duration','% Complete','Phase','Notes','Lag'];
     
       csvStringResult = '';
       csvStringResult += keys.join(columnDivider);
      
       return csvStringResult;        
    },

    showToast: function (component, type, message) {
        var toastEvent = $A.get("e.force:showToast");

        toastEvent.setParams({
            "type": type,
            "message": message,
            duration: '5000',
            mode: 'dismissible'
        });

        toastEvent.fire();
    },

    CreateAccount: function (component, jsonstr) {
        try {
            var jsonData = JSON.parse(jsonstr);
            console.log("CSV File:", JSON.stringify(jsonData));
            console.log('Create Account Sch recordId', component.get("v.recordId"));

            var action = component.get("c.insertData");
            action.setParams({
                recordId: component.get("v.recordId"),
                strFileData: JSON.stringify(jsonData)
            });

            action.setCallback(this, function (response) {
                var state = response.getState();
                console.log('State Response:', state);
                console.log({ state });
                if (state === "SUCCESS") {
                    if (response.getReturnValue() === "SUCCESS") {
                        $A.get("e.c:BT_SpinnerEvent").setParams({
                            "action": "HIDE"
                        }).fire();

                        this.showToast(component, "success", "Schedule lines Imported Successfully.");
                        window.setTimeout(
                            $A.getCallback(function() {
                            window.location.reload();
                            }), 3000
                        );

                    } else {
                        $A.get("e.c:BT_SpinnerEvent").setParams({
                            "action": "HIDE"
                        }).fire();
                        console.log("error--->", response.getReturnValue());

                        this.showToast(component, "error", "There was an error uploading your file. Please Contact your Administrator for assistance.");
                        return '';
                    }
                } else {
                    console.log('state ==> ', state);

                    this.showToast(component, "error", "Some unexpected error.");
                    $A.get("e.c:BT_SpinnerEvent").setParams({
                        "action": "HIDE"
                    }).fire();
                    return '';
                }
            });

            $A.enqueueAction(action);

            var ph = false;
            var du = false;
            var nam = false;
            if (JSON.stringify(jsonData).includes('"Phase":""')) {
                ph = true;
            }
            if (JSON.stringify(jsonData).includes('"Duration":""')) {
                du = true;
            }
            if (JSON.stringify(jsonData).includes('"Name":""')) {
                nam = true;
            }

            if (du && nam) {
                this.showToast(component, "error", "You are missing Name, Duration in your CSV file.");
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
            } else if (du && !nam) {
                this.showToast(component, "error", "You are missing the Duration value in your CSV file.");
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
            } else if (!du && nam) {
                this.showToast(component, "error", "You must have a Name value on all records.");
                $A.get("e.c:BT_SpinnerEvent").setParams({
                    "action": "HIDE"
                }).fire();
            }
        } catch (error) {
            this.showToast(component, "error", error);
            $A.get("e.c:BT_SpinnerEvent").setParams({
                "action": "HIDE"
            }).fire();
        }
        
    },

    CSV2JSON: function(component, csv) {
        try {
            var arr = [];
            arr = csv.split("\n");

            if (
                arr[arr.length - 1] === "" ||
                arr[arr.length - 1] === undefined ||
                arr[arr.length - 1] === null
            ) {
                arr.pop();
            }

            var jsonObj = [];
            var headers = arr[0].split(",");
            console.log("headers:", headers);
            if (
                headers[0] !== "Name" ||
                headers[1] !== "Dependency" ||
                headers[2] !== "StartDate" ||
                headers[3] !== "Duration" ||
                headers[4] !== "% Complete" ||
                headers[5] !== "Phase" ||
                headers[6] !== "Notes" ||
                headers[7] !== "Lag\r"
            ) {
                return "Error";
            }

            var startIndex = null;
            var endIndex = null;

            for (var i = 1; i < arr.length; i++) {
                console.log('arr[i]:',arr[i]);
                if (arr[i] !== undefined) {
                    while (arr[i].indexOf('"') > -1) {
                        console.log('while loop');
                        if (startIndex === null) {
                            startIndex = arr[i].indexOf('"');
                            arr[i] =
                                arr[i].substring(0, startIndex) +
                                ":quotes:" +
                                arr[i].substring(startIndex + 1, arr[i].length);
                        } else {
                            if (endIndex === null) {
                                endIndex = arr[i].indexOf('"');
                                arr[i] =
                                    arr[i].substring(0, endIndex) +
                                    ":quotes:" +
                                    arr[i].substring(endIndex + 1, arr[i].length);
                            }
                        }

                        if (startIndex !== null && endIndex !== null) {
                            var sub = arr[i].substring(startIndex, endIndex);
                            sub = sub.replaceAll(",", ":comma:");
                            arr[i] = arr[i].substring(0, startIndex) + sub + arr[i].substring(endIndex, arr[i].length);
                            startIndex = null;
                            endIndex = null;
                        }
                    }

                    var data = arr[i].split(",");
                    var obj = {};
                    var month = "";
                    var day = "";
                    for (var j = 0; j < data.length; j++) {
                        var myStr = data[j];
                        var newStr = myStr.replace(/:comma:/g, ",");
                        newStr = newStr.replace(/:quotes:/g, "");
                        data[j] = newStr;
                        console.log('headers [j ] :', headers[j]);
                        console.log('headers:', headers);
                        if (headers[j]) {
                            if (headers[j].trim() === "StartDate" && data[j].trim() !== "") {
                                var dateFormatToChange = data[j];
                                console.log('dateFormatToChange :',dateFormatToChange);
                                var convertedDate = this.convertDateFormat(component, dateFormatToChange);
                                if(convertedDate == 'Invalid'){
                                    return "Invalid";
                                } else{
                                    obj[headers[j].trim()] = convertedDate;
                                    console.log('convertedDate: ',convertedDate);
                                }

                            } else {
                                console.log('Date Loop Else');
                                if (headers[j].trim() === "% Complete") {
                                    obj["percentComplete"] = data[j].trim();
                                } else {
                                    console.log('data[j].trim() :',data[j].trim());
                                    obj[headers[j].trim()] = data[j].trim();
                                }
                            }
                        }
                        console.log('j:',j,'data.length:',data.length);
                    }

                    if (obj.StartDate !== undefined && obj.StartDate !== "") {
                        console.log('StartDate:',obj.StartDate);
                        jsonObj.push(obj);
                    } else {
                        console.log('obj: ',{obj});
                        console.log('obj.StartDate: ',obj.StartDate);
                        var today = new Date();
                        var dd = String(today.getDate()).padStart(2, "0");
                        var mm = String(today.getMonth() + 1).padStart(2, "0");
                        var yyyy = today.getFullYear();
                        today = yyyy + "-" + mm + "-" + dd;
                        obj.StartDate = today;
                        console.log('obj.StartDate:',obj.StartDate);
                    }
                    if (obj.percentComplete !== "" && obj.percentComplete !== undefined) {
                        // Perform necessary operations
                    } else {
                        obj.percentComplete = 0;
                    }
                }
            }

            console.log("jsonObj:", jsonObj);
            var taskMap = new Map();
            for (var i = 0; i < jsonObj.length; i++) {
                var element = jsonObj[i];
                taskMap.set("PT - " + i, element.Name);
            }

            for (var i = 0; i < jsonObj.length; i++) {
                var e = jsonObj[i];
                e.ID = "PT - " + i;
            }

            jsonObj.forEach(function(ele) {
                for (var [key, value] of taskMap.entries()) {
                    if (ele.Dependency === value) {
                        ele.parentID = key;
                    }
                }
            });

            var parentMap = new Map();
            jsonObj.forEach(function(element) {
                parentMap.set(element.ID, element.parentID);
            });
            console.log("parentMap:", parentMap);

            var circularDependency = false;
            var totalLoop = 0;
            var dependentRecord;
            jsonObj.every(function(ele) {
                var currentId = ele.ID;
                for (var index = 0; index <= jsonObj.length + 1; index++) {
                    totalLoop++;
                    if (parentMap.has(currentId)) {
                        currentId = parentMap.get(currentId);
                        if (index > jsonObj.length) {
                            circularDependency = true;
                            console.log("ele.Name:", ele.Name);
                            component.set("v.CircularDependencyName", ele.Name);
                            dependentRecord = ele;
                            break;
                        }
                    } else {
                        break;
                    }
                }
                return !circularDependency;
            });

            console.log("Total Loop:", totalLoop);
            if (circularDependency) {
                console.log("dependentRecord:", dependentRecord);
                return "";
            } else {
                var json = JSON.stringify(jsonObj);
                return json;
            }
        } catch (error) {
            console.log('error in CSV2JSON:',error);
            return 'Error';
        }
    },    
    convertDateFormat: function(component, dateString) {
        try {
            console.log('in convertdate format');
            // dateString = dateString.trim().replace(/\//g, "-")
            var dateParts = dateString.split('/'); // Split the date string by '/'
            var year = dateParts[2];
            var month = dateParts[0].padStart(2, '0'); // Pad the month with leading zeros if necessary
            var day = dateParts[1].padStart(2, '0'); // Pad the day with leading zeros if necessary

            if (year.length === 2) {
                // Convert YY format to YYYY format
                var currentYear = new Date().getFullYear().toString();
                var currentCentury = currentYear.slice(0, 2);
                year = currentCentury + year;
            }

            var convertedDate = `${year}-${month}-${day}`; // Combine the date parts in the desired format
            return convertedDate;
        } catch (error) {
            console.log('error:',error);
            return 'Invalid';
        }
    },
 
});