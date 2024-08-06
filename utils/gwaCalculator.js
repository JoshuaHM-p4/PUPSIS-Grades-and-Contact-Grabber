// Helper function to check if all grades are not lower than 2.5
function areAllGradesNotLowerThan2_5(gradesList) {
    return gradesList.every((grade) => grade <= 2.5);
}

function areAllGradesNotFailed(gradesList) {
    return gradesList.every((grade) => grade != 5.00);
}

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

    // Calculate gwa if there are grades
    if (grades.length > 0) {
        let gwa = (grade_total)/unit_total;
        gwa = gwa.toFixed(2);
        return gwa;
    } else{ return "0.00"; }
}

// Determine incomplete grades
function determineIncompleteGrades(incompleteGrades) {
    if (incompleteGrades.length === 0) {
        return "(Grades Completed)";
    } else {
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

    // Return 0% if the GWA is not within the range
    return "0%";
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

    // Return none if the GWA is not within the range
    return "None";
}

// Determine the standing of a student based on the GWA
function determineStanding(gwa, gradesList) {
    // Check if all grades in the gradesList are not lower than 2.5
    const allGradesNotLowerThan2_5 = areAllGradesNotLowerThan2_5(gradesList);

    if (allGradesNotLowerThan2_5) {
        if (1.00 <= gwa && gwa <= 1.50) {
            return "President's Lister";
        } else if (1.51 <= gwa && gwa <= 1.75) {
            return "Dean's Lister";
        }
    }
    return "Good Student";
}

// Determine the Latin Honors of a student based on the GWA
function determineLatinHonors(gwa, gradesList) {
    const allGradesNotLowerThan2_5 = areAllGradesNotLowerThan2_5(gradesList);

    if (allGradesNotLowerThan2_5) {
        if (1.0000 <= gwa && gwa <= 1.2000) {
            return "Summa Cum Laude";
        } else if (1.2001 <= gwa && gwa <= 1.4500) {
            return "Magna Cum Laude";
        } else if (1.4501 <= gwa && gwa <= 1.7500) {
            return "Cum Laude";
        }
    }
    return "Good Student";
}

function determineScholarshipMaintenance(gwa, gradesList, yearLevel) {
    const allGradesNotFailed = areAllGradesNotFailed(gradesList);

    if (!gwa) {
        return "N/A";
    }

    // First Year: Annual weighted average of 2.5 with no failing grades in all academic subjects.
    if (yearLevel == "Freshman" || yearLevel == "Continuing") {
        if (gwa <= 2.5 && allGradesNotFailed) {
            return "Maintained";
        }

    // Second Year: Semestral weighted average of 2.5 with no failing grades in all academic subjects.
    } else if (yearLevel == "Sophomore") {
        if (gwa <= 2.5 && allGradesNotFailed) {
            return "Maintained";
        }

    // Third Year and up: Passing grades in all academic subjects
    } else if (yearLevel == "Junior" || yearLevel == "Senior") {
        if (allGradesNotFailed) {
            return "Maintained";
        }
    }
    return "Warning";
}

// Expose functions to be used in other scripts
window.calculateGWA = calculateGWA;
window.determineIncompleteGrades = determineIncompleteGrades;
window.determinePercentage = determinePercentage;
window.determineStanding = determineStanding;
window.determineLatinHonors = determineLatinHonors;
window.determineScholarshipMaintenance = determineScholarshipMaintenance;