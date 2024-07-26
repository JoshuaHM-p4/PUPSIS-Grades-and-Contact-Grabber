// Calculate the GWA of a student given the grades and units of the subjects
function calculateGWA(grades, units) {
    let unit_total = 0;
    let grade_total = 0;

    for (let i = 0; i < grades.length; i++)  {
        if (grades[i] !== null && grades[i] !== "") {
            grade_total += parseFloat(grades[i]) * units[i];
            unit_total += units[i];
        }
    }

    let gwa = (grade_total)/unit_total;
    gwa = gwa.toFixed(2);
    return gwa;
}

// Determine incomplete grades
function determineIncompleteGrades(incompleteGrades) {
    if (incompleteGrades.length === 0) {
        return "(Grades Completed)";
    } else {
        console.log(incompleteGrades)
        return "(Grades Incompleted)";
    }
}

// Determine the percentage of a student based on the GWA from (i.e. 97-100 for 1.00 GWA, 94-96 for 1.25 GWA, etc.)
function determinePercentage(gwa) {
    if (1.00 <= gwa && gwa <= 1.24) {
        return "97-100%";
    } else if (1.25 <= gwa && gwa <= 1.5) {
        return "94-96%";
    } else if (1.51 <= gwa && gwa <= 1.75) {
        return "91-93%";
    } else if (1.76 <= gwa && gwa <= 2.00) {
        return "88-90%";
    } else if (2.01 <= gwa && gwa <= 2.25) {
        return "85-87%";
    } else if (2.26 <= gwa && gwa <= 2.50) {
        return "82-84%";
    } else if (2.51 <= gwa && gwa <= 2.75) {
        return "79-81%";
    } else if (2.76 <= gwa && gwa <= 3.00) {
        return "76-78%";
    } else if (gwa == 3.00) {
        return "75%";
    } else if (gwa == 4.00) {
        return "64-745%";
    } else if (gwa == 5.00) {
        return "0%";
    }
}

// Determine the equivalent of a student based on the GWA (i.e. 1.25 - 1.00 = Excellent, 1.75-1.5 = Very Good, etc.)
function determineEquivalent(gwa) {
    if (1.00 <= gwa && gwa <= 1.25) {
        return "Excellent";
    } else if (1.26 <= gwa && gwa <= 1.75) {
        return "Very Good";
    } else if (1.76 <= gwa && gwa <= 2.25) {
        return "Good";
    } else if (2.26 <= gwa && gwa <= 2.75) {
        return "Satisfactory";
    } else if (gwa == 3.00) {
        return "Passing";
    } else if (gwa == 4.00) {
        return "Conditional";
    } else if (gwa == 5.00) {
        return "Failed";
    }
}

// Determine the standing of a student based on the GWA
function determineStanding(gwa) {

    if (1.00 <= gwa && gwa <= 1.50) {
        return "President's Lister";
    } else if (1.51 <= gwa && gwa <= 1.75) {
        return "Dean's Lister";
    } else {
        return "Good Student"
    }
}

// Determine the Latin Honors of a student based on the GWA
function determineLatinHonors(gwa) {
    if (1.000 <= gwa && gwa <= 1.1500) {
        return "Summa Cum Laude";
    } else if (1.151 <= gwa && gwa <= 1.3500) {
        return "Magna Cum Laude";
    } else if (1.351 <= gwa && gwa <= 1.6000) {
        return "Cum Laude";
    } else {
        return "Good Student";
    }
}


// Expose functions to be used in other scripts
window.calculateGWA = calculateGWA;
window.determineIncompleteGrades = determineIncompleteGrades;
window.determinePercentage = determinePercentage;
window.determineStanding = determineStanding;
window.determineLatinHonors = determineLatinHonors;