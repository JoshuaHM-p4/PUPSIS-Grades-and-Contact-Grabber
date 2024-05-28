chrome.runtime.onMessage.addListener(function(request, sender, response) {
    console.log("Recieved message: ", request);

    if (request.type == 'getgrades') {
        const tableData = document.getElementById("DataTables_Table_1");
        const grade_output = parseTableData(tableData);

        chrome.runtime.sendMessage({
            type: "recieveGrades",
            grade: grade_output
        });
    }
});

function parseTableData(tableContent) {
    const rows = tableContent.getElementByTagName("tbody")[0].getElementByTagName("tr");
    const grade_entries = [];

    for (i = 0; i < rows.length(); i+= 1) {
        let data = rows[i].getElementByTagName("td");
        let temp = data[6].textContent.trim()
        console.log(temp);
    }

}