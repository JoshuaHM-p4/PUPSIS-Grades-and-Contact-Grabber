// Get the grades and units from the tableData element
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.type === 'getgrades') {
        let data = {};

        const selectedTerm = request.term || 0; // Default to 0 if term is not provided

        // Get the div element containing the grades
        const grades_div = document.querySelectorAll("body > div > div > div > div > form > section.content > div > div > div > div.card-body > div:nth-child(2) > div")

        // for fetching all the users options
        const tablesRow = grades_div[0].children // [row, row]

        const usersTermsOptions = [] // ["School Year 2324 Second Semester", "School Year 2324 First Semester"]

        for (let i = 0; i < tablesRow.length; i++) {
            const h3Element = findH3ElementFromTableRow(tablesRow[i]) // h3 element -> School Year 2324 Second Semester
            if (h3Element) {
                usersTermsOptions.push(h3Element.textContent.trim())
                console.log(h3Element.textContent.trim())
            }
        }

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
        data.usersTermsOptions = usersTermsOptions;
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

// Recursive Function to find H3 Element on table row -> will return the H3 Element from the table row
function findH3ElementFromTableRow(element) {
    if (element.className === 'card-title') {
        return element;
    } else {
        const found = findH3ElementFromTableRow(element.children[0]);
        if (found) return found;
        return null;
    }

}


// Recursive Function to find H3 Element containing the Semester
function findH3Element(element) {
    if (element.className === 'card-body') {
        const previousSibling = element.previousElementSibling;
        if (previousSibling) {
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
    const incompleteGrades = [];

    for (let i = 0; i < rows.length; i++) {
        const data = rows[i].getElementsByTagName("td"); // Get the data from each row
        const grade = data[6].textContent.trim(); // Grade is in the 7th column
        const unit = parseFloat(data[4].textContent.trim()); // Parse the unit to a float

         // Handle and exclude invalid units or grades and grades with non-numeric ratings
         if (!grade || isNaN(unit) || !/^\d+(\.\d{1,2})?$/.test(grade)) {
            incompleteGrades.push(""); 
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

        console.log(incompleteGrades);
    }
    return { grades, units, incompleteGrades };
}
