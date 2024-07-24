// Get the grades and units from the tableData element
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.type === 'getgrades') {
        let data = {};

        const selectedTerm = request.term || 0;

        // grades_div = document.querySelectorAll("body > div > div > div > div > form > section.content > div > div > div > div.card-body > div:nth-child(2) > div")
        // two rows and find the first h3 element

        let h3Element = null;
        let tableElement = null;

        tableElement = findTableByIdPattern(selectedTerm);
        h3Element = findH3Element(tableElement);
        if (!h3Element) {
            console.error("H3 Element not found");
            return;
        }

        const semester = h3Element.textContent.trim();
        data.semester = semester;
        if (!tableElement) {
            console.error("Table not found");
            return;
        }

        Object.assign(data, parseTableData(tableElement));

        chrome.runtime.sendMessage({
            type: "gradesFetched",
            data: data
        });
    }
});

// Recursive Function to find H3 Element containing the Semester
function findH3Element(element) {
    if (element.className === 'card-body') {
        const previousSibling = element.previousElementSibling;
        if (previousSibling) {
            console.log("Previous Sibling:", previousSibling.className);
            return previousSibling.children[0];
        } else {
            return null
        }
    }
    const found = findH3Element(element.parentElement);
    if (found) return found;
    return null;
}

function findTableByIdPattern(table_number = 0) {
    const element = document.getElementById(`DataTables_Table_${table_number}`)
    return element
}

// Parse the table data to get the grades and units
function parseTableData(tableContent) {
    const rows = tableContent.getElementsByTagName("tbody")[0].getElementsByTagName("tr"); // List of tr elements in the tbody
    const grades = [];
    const units = [];


    for (let i = 0; i < rows.length; i++) {
        const data = rows[i].getElementsByTagName("td"); // Get the data from each row
        const grade = data[6].textContent.trim(); // Grade is in the 7th column
        const unit = parseFloat(data[4].textContent.trim()); // Parse the unit to a float

        // Handle and exclude invalid units or grades and grades with non-numeric ratings
        if (!grade || isNaN(unit) || !/^\d+\.\d{2}$/.test(grade) ) {
            continue;
        }

        // Exclude NSTP and PATHFIT subjects
        const subject_code = data[1].textContent.trim().toLowerCase();
        if (subject_code.includes("cwts") || subject_code.includes("rotc") || subject_code.includes("pathfit")) {
            continue;
        }

        if (grade && !isNaN(unit)) {
            grades.push(grade);
            units.push(unit);
        }
    }

    return { grades, units };
}
