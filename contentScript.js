// Get the grades and units from the tableData element
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'getgrades') {
        let data = {};
        const selectedTerm = request.term || 0;

        // Get the div element containing the grades
        const gradesDiv = document.querySelectorAll("body > div > div > div > div > form > section.content > div > div > div > div.card-body > div:nth-child(2) > div")

        // for fetching all the users options
        const tablesRow = gradesDiv[0].children // [row, row] of class "col-lg-12"

        const usersTermsOptions = [] // ["School Year 2324 Second Semester", "School Year 2324 First Semester"]

        // Loop through the tablesRow to get the users options
        for (let i = 0; i < tablesRow.length; i++) {
            const h3Element = findH3ElementFromTableRow(tablesRow[i]) // h3 element -> School Year 2324 Second Semester
            if (h3Element) {
                usersTermsOptions.push(h3Element.textContent.trim())
            }
        }

        // Get the grades, units, incompleteGrades, admission_status, scholastic_status
        let grades = [];
        let units = [];
        let incompleteGrades = [];
        let admission_status;
        let scholastic_status;

        // Fetch grades based on selected term
        if (selectedTerm === 'all') {
            // Loop through all terms and fetch grades
            for (let i = 0; i < usersTermsOptions.length; i++) {
                const tableElement = findTableByIdPattern(i);

                // If tableElement is not found, skip to the next term
                if (tableElement) {
                    const termData = parseTableData(tableElement);
                    grades = grades.concat(termData.grades);
                    units = units.concat(termData.units);
                    incompleteGrades = incompleteGrades.concat(termData.incompleteGrades);

                    if (!admission_status || !scholastic_status) {
                        const ddElements = findDDElementStatus(tableElement);
                        // If admission_status is not set, set it to the latest term
                        admission_status = ddElements.admission.textContent.trim();

                        // If scholastic_status is not set, set it to the latest term
                        scholastic_status = ddElements.scholastic.textContent.trim();

                        data.semester = "- - - Overall SY & Semester";
                        
                    }
                }
            }
        } else {
            // Fetch grades based on selected term
            const tableElement = findTableByIdPattern(selectedTerm);
            if (tableElement) {
                const termData = parseTableData(tableElement);
                grades = termData.grades;
                units = termData.units;
                incompleteGrades = termData.incompleteGrades;

                const h3Element = findH3Element(tableElement);
                data.semester = h3Element.textContent.trim();

                const ddElements = findDDElementStatus(tableElement);
                admission_status = ddElements.admission.textContent.trim();
                scholastic_status = ddElements.scholastic.textContent.trim();
            }
        }

        // Send the data to the popup.js
        data.grades = grades;
        data.units = units;
        data.incompleteGrades = incompleteGrades;
        data.admission_status = admission_status;
        data.scholastic_status = scholastic_status;
        data.usersTermsOptions = usersTermsOptions;

        chrome.runtime.sendMessage({
            type: "gradesFetched",
            data: data
        });
    }
});

// Find the h3 element from the table row
function findH3ElementFromTableRow(element) {
    if (element.className === 'card-title') {
        return element;
    } else {
        const found = findH3ElementFromTableRow(element.children[0]);
        if (found) return found;
        return null;
    }
}

// Find the dd element from the table row
function findDDElementStatus(element) {
    let status = {};

    if (element.className === 'card-body') {
        const firstRowElement = element.children[0]
        if (firstRowElement) {
            status.admission = firstRowElement.children[0].children[0].children[1]
            status.scholastic = firstRowElement.children[1].children[0].children[1]
            return status;
        }
    }

    const found = findDDElementStatus(element.parentElement);
    if (found) return found;
    return null;
}

// Find the h3 element 
function findH3Element(element) {
    if (element.className === 'card-body') {
        const cardHeaderElement = element.previousElementSibling;
        if (cardHeaderElement) {
            return cardHeaderElement.children[0];
        } else {
            return null
        }
    }
    const found = findH3Element(element.parentElement);
    if (found) return found;
    return null;
}

// Find the table element by id
function findTableByIdPattern(table_number = 0) {
    const element = document.getElementById(`DataTables_Table_${table_number}`);
    return element;
}

// Parse table data
function parseTableData(tableContent) {
    const rows = tableContent.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    const grades = [];
    const units = [];
    const incompleteGrades = [];

    // Loop through the rows to get the grades and units
    for (let i = 0; i < rows.length; i++) {
        const data = rows[i].getElementsByTagName("td");
        const grade = data[6].textContent.trim();
        const unit = parseFloat(data[4].textContent.trim());

        // Skip if grade is empty or unit is not a number
        if (!grade || isNaN(unit) || !/^\d+(\.\d{1,2})?$/.test(grade)) {
            incompleteGrades.push("");
            continue;
        }

        // Skip if subject code is CWTS, ROTC, or PATHFIT
        const subjectCode = data[1].textContent.trim().toLowerCase();
        if (subjectCode.includes("cwts") || subjectCode.includes("rotc") || subjectCode.includes("pathfit")) {
            continue;
        }

        // Push the grade and unit to the array
        if (grade && !isNaN(unit)) {
            grades.push(grade);
            units.push(unit);
        }
    }
    return { grades, units, incompleteGrades };
}
