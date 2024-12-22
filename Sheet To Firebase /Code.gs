function getEnvironment() {
    var environment = {
        spreadsheetID: "Add your sheet ID",
        firebaseUrl: "Add your Realtime Database URL",
    };
    return environment;
}
  
  // Creates a Google Sheets on change trigger for the specific sheet
function createSpreadsheetEditTrigger(sheetID) {
    var triggers = ScriptApp.getProjectTriggers();
    var triggerExists = false;
    for (var i = 0; i < triggers.length; i++) {
        if (triggers[i].getTriggerSourceId() == sheetID) {
            triggerExists = true;
            break;
        }
    }
  
    if (!triggerExists) {
        var spreadsheet = SpreadsheetApp.openById(sheetID);
        ScriptApp.newTrigger("importSheet")
            .forSpreadsheet(spreadsheet)
            .onChange()
            .create();
    }
}
  
// Delete all the existing triggers for the project
function deleteTriggers() {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
        ScriptApp.deleteTrigger(triggers[i]);
    }
}
  
// Initialize
function initialize(e) {
    writeDataToFirebase(getEnvironment().spreadsheetID);
}
  
// Write the data to the Firebase URL
function writeDataToFirebase(sheetID) {
    var ss = SpreadsheetApp.openById(sheetID);
    SpreadsheetApp.setActiveSpreadsheet(ss);
    createSpreadsheetEditTrigger(sheetID);
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
        importSheet(sheets[i]);
        SpreadsheetApp.setActiveSheet(sheets[i]);
    }
}
  
// A utility function to generate nested object when given a keys in array format
function assign(obj, keyPath, value) {
    lastKeyIndex = keyPath.length - 1;
    for (var i = 0; i < lastKeyIndex; ++i) {
        key = keyPath[i];
        if (!(key in obj)) obj[key] = {};
        obj = obj[key];
    }
    obj[keyPath[lastKeyIndex]] = value;
}
  
// Import each sheet when there is a change
function importSheet() {
    var sheet = SpreadsheetApp.getActiveSheet();
    var name = sheet.getName();
    var data = sheet.getDataRange().getValues();
  
    var dataToImport = {};
  
    for (var i = 1; i < data.length; i++) {
        var personName = data[i][2]; // 'Name' column (3rd column, index 2)
        var srNumber = data[i][3]; // 'SR Number' column (4th column, index 3)
        var uniqueID = generateUniqueID(personName, srNumber);
  
        dataToImport[uniqueID] = {};
        for (var j = 0; j < data[0].length; j++) {
            assign(dataToImport[uniqueID], data[0][j].split("__"), data[i][j]);
        }
  
        // Add the extra column 'food' with a default value of false
        dataToImport[uniqueID]["food"] = false;
    }
  
    var token = ScriptApp.getOAuthToken();
  
    // Set the generated data directly using unique ID
    var firebaseUrl = getEnvironment().firebaseUrl + name;
    var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, token);
    base.setData("", dataToImport); // The uniqueID will now act as the DB key.
}
  
function generateUniqueID(name, srNumber) {
    return `${name}_${srNumber}`.replace(/\s+/g, "_").toLowerCase(); // Unique ID format
}
  