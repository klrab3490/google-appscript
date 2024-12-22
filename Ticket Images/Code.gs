// From Drive Insert Image to Google Sheets

function addImageLinksToTicket() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues(); // Get all data from the sheet
  
  // Specify the folder where your images are stored
  var folderId = '1Wuq2wuHGrD7Sculn5gyNHUg-rqS0m2Vl'; // Use your folder ID here
  var folder = DriveApp.getFolderById(folderId);
  
  // Loop through each row in the sheet (assuming the "Name" column is column 3 and "Ticket" column is column 9)
  for (var i = 1; i < data.length; i++) { // Start from 1 to skip header
    var imageName = data[i][2]; // Column 3: Name (to match image name)
    imageName+=".jpg"
    // Search for the image file in the folder
    var files = folder.getFilesByName(imageName);
    
    if (files.hasNext()) {
      var file = files.next();
      var imageUrl = file.getUrl(); // Get the URL of the file
      
      // Update the sheet with the image URL in the "Ticket" column (Column 9)
      sheet.getRange(i + 1, 9).setValue(imageUrl); // Column 9: Ticket (URL)
    } else {
      Logger.log('Image not found: ' + imageName);
    }
  }
}
