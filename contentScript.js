// Get the grades and units from the tableData element
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Received message: ", request);

    if (request.type === 'getgrades') {
        const tableData = document.getElementById("DataTables_Table_1");
        if (tableData) {
            const grade_output = parseTableData(tableData);
            console.log("Grades and Units: ", grade_output);
            chrome.runtime.sendMessage({
                type: "gradesFetched",
                data: grade_output
            });
        } else {
            console.error("Table not found");
        }
    }
});

// Parse the table data to get the grades and units
function parseTableData(tableContent) {
    const rows = tableContent.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    const grades = [];
    const units = [];

    for (let i = 0; i < rows.length; i++) {
        const data = rows[i].getElementsByTagName("td");
        const grade = data[6].textContent.trim();
        const unit = parseFloat(data[5].textContent.trim());
        
        if (grade && !isNaN(unit)) {
            grades.push(grade);
            units.push(unit);
        }
    }
    
    return { grades, units };
}
