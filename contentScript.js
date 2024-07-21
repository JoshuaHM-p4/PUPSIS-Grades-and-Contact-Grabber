// Get the grades and units from the tableData element
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.type === 'getgrades') {
        let data = {};

        grades_div = document.querySelectorAll("body > div > div > div > div > form > section.content > div > div > div > div.card-body > div:nth-child(2) > div")

        let h3Element = null;
        let tableElement = null;

        grades_div.forEach((div) => {
            h3Element = findH3Element(div);
            tableElement = findTableByIdPattern(div);
        });

        if (!h3Element) {
            console.error("H3 Element not found");
            return;
        }

        const semester = h3Element.textContent.trim();
        data.semester = semester;

        // const tableData = document.getElementById("DataTables_Table_0");
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
    if (element.tagName === 'H3') {
        return element;
    }
    for (const child of element.children) {
        const found = findH3Element(child);
        if (found) return found;
    }
    return null;
}

function findTableByIdPattern(element) {
    const pattern = /^DataTables_Table_\d+$/;
    if (element.tagName === 'TABLE' && pattern.test(element.id)) {
        return element;
    }
    for (const child of element.children) {
        const found = findTableByIdPattern(child);
        if (found) return found;
    }
    return null;
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
