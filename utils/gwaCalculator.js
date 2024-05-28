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

// Determine the standing of a student based on the GWA
function determineStanding(gwa) {

    if (1.00 <= gwa && gwa <= 1.50) {
        return "Deans Lister";
    } else if (1.51 <= gwa && gwa <= 1.75) {
        return "President's Lister";
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

// Determine the status of a student based on the standing
function determineStatus(standing) {
    if (standing === "Deans Lister" || standing === "President's Lister") {
        return "Honor Student";
    } else {
        return "Good Student";
    }
}

// Expose functions to be used in other scripts
window.calculateGWA = calculateGWA;
window.determineStanding = determineStanding;
window.determineLatinHonors = determineLatinHonors;
window.determineStatus = determineStatus;