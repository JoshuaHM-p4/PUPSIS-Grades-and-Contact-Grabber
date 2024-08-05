// Get the grades and units from the tableData element
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.type === 'getgrades') {
        let data = {};

        const selectedTerm = request.term || 0; // Default to 0 if term is not provided

        // Get the div element containing the grades
        const gradesDiv = document.querySelectorAll("body > div > div > div > div > form > section.content > div > div > div > div.card-body > div:nth-child(2) > div")

        // for fetching all the users options
        const tablesRow = gradesDiv[0].children // [row, row] of class "col-lg-12"

        const usersTermsOptions = [] // ["School Year 2324 Second Semester", "School Year 2324 First Semester"]

        // Loop through the tablesRow to get the users options
        for (let i = 0; i < tablesRow.length; i++) {
            const h3Element = findH3ElementFromTableRow(tablesRow[i]) // h3 element -> School Year 2324 Second Semester

            // If the h3 element is found, push the textContent to the usersTermsOptions array
            if (h3Element) {
                usersTermsOptions.push(h3Element.textContent.trim())
            } 

            // If the h3 element is not found, log an error
            else {
                console.error("H3 Element not found")
            }

        }

        // Get the table element containing the grades
        let h3Element = null;
        let tableElement = null;

        tableElement = findTableByIdPattern(selectedTerm);
        h3Element = findSemester(tableElement);
        if (!h3Element) {
            console.error("H3 Element not found");
            return;
        }


        let ddElements = null;
        ddElements = findDDElementStatus(tableElement);
        let admissionStatus = ddElements.admission
        let scholasticStatus = ddElements.scholastic

        if (!admissionStatus || !scholasticStatus) {
            console.error("Admission or Scholastic Status not found");
            return;
        }

        // Get the semester from the h3 element

        const semester = h3Element.textContent.trim();
        data.semester = semester;
        data.usersTermsOptions = usersTermsOptions;
        if (!tableElement) {
            console.error("Table not found");
            return;
        }

        // Get the admission status from the dd element
        const admission_status = admissionStatus.textContent.trim();
        data.admission_status = admission_status;
        if (!admission_status) {
            console.error("Admission Status not found");
            return;
        }

        // Get the scholastic status from the dd element
        const scholastic_status = scholasticStatus.textContent.trim();
        data.scholastic_status = scholastic_status;
        if (!scholastic_status) {
            console.error("Scholastic Status not found");
            return;
        }

        // Parse the table data to get the grades and units
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


// Recursive unction to find H3 Element containing the Semester
function findSemester(element) {

// Recursive Function to find DD Element containing the Scholastic Status and Admission Status
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

    const found = findSemester(element.parentElement);
    const found = findDDElementStatus(element.parentElement);

    if (found) return found;
    return null;
}


// Recursive Function to find DD Element containing the Scholastic Status
function findScholastisStatus(element) {


// Recursive Function to find H3 Element containing the Semester
function findH3Element(element) {

    if (element.className === 'card-body') {
        const cardHeaderElement = element.previousElementSibling;
        if (cardHeaderElement) {
            return cardHeaderElement.children[0];
        } else {
            return null
        }
    }

    const found = findScholastisStatus(element.parentElement);
    if (found) return found;
    return null;
}

// Recursive Function to find DD Element containing the Admission Status
function findAdmissionStatus(element) {
    if (element.className === 'card-body') {
        const previousSibling = element.previousElementSibling;
        if (previousSibling) {
            return previousSibling.children[0];
        } else {
            return null
        }
    }
    const found = findAdmissionStatus(element.parentElement);

    const found = findH3Element(element.parentElement);

    if (found) return found;
    return null;
}

// Find the table element by the id pattern
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
        const subjectCode = data[1].textContent.trim().toLowerCase();
        if (subjectCode.includes("cwts") || subjectCode.includes("rotc") || subjectCode.includes("pathfit")) {
            continue;
        }

        if (grade && !isNaN(unit)) {
            grades.push(grade);
            units.push(unit);
        }
    }
    return { grades, units, incompleteGrades };
}
