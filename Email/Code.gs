/**
 * Sends emails with the Google Drive ticket link.
 * @param {Sheet} sheet to read data from
 */

function sendEmails(sheet=SpreadsheetApp.getActiveSheet()) {
    const RECIPIENT_COL  = "Email address";  // Email column
    const TICKET_COL     = "Ticket";         // Ticket column (Google Drive link)
    const EMAIL_SENT_COL = "Email Sent";     // Email Sent column (to track if email was sent)

    // Gets the data from the passed sheet
    const dataRange = sheet.getDataRange();
    const data = dataRange.getDisplayValues();

    // Assumes row 1 contains our column headings
    const heads = data.shift();

    // Gets the index of the column named 'Email Sent'
    const emailSentColIdx = heads.indexOf(EMAIL_SENT_COL);
    
    if (emailSentColIdx === -1) {
        Logger.log("Error: 'Email Sent' column not found.");
        return;
    }

    // Converts 2D array into an object array
    const obj = data.map(r => (heads.reduce((o, k, i) => (o[k] = r[i] || '', o), {})));

    // Creates an array to record sent emails
    const out = [];

    // Loops through all the rows of data
    obj.forEach(function(row, rowIdx){
        // Only sends emails if email_sent cell is blank
        if (row[EMAIL_SENT_COL] == '') {
            try {
                const ticketLink = row[TICKET_COL];  // The Google Drive link from the Ticket column

                // Send the email with the ticket link
                const subject = "Your Christmas Food Ticket Information";
                const body = "Dear " + row["Name"] + ",<br><br>Here is the link to your ticket:<br>" + '<a href="' + ticketLink + '" target="_blank">Click here to view your ticket</a>';

                GmailApp.sendEmail(row[RECIPIENT_COL], subject, '', {
                    htmlBody: body  // Send HTML content with the clickable ticket link
                });

                // Record the email sent date
                out.push([new Date()]);
            } catch (e) {
                // Modify cell to record error
                out.push([e.message]);
            }
        } else {
            out.push([row[EMAIL_SENT_COL]]);
        }
    });

    // Check if the range to be updated is valid
    if (out.length > 0) {
        // Updates the sheet with new data (email sent status)
        sheet.getRange(2, emailSentColIdx + 1, out.length, 1).setValues(out);
    }
}
