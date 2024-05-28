function calculateGWA(grades, units) {
    let unit_total = 0;
    let grade_total = 0;

    for (let i = 0; i < grades.length; i++)  {
        if (grades[i] !== null || grades[i] !== "") {
            grade_total += parseFloat(grades[i]) * units[i];
            unit_total += units[i];
        }
    }

    let gwa = (grade_total)/unit_total;
    gwa = gwa.toFixed(2);
    return gwa;
}

let grades = ["1.00", "1.25"];
let units = [2, 2]
let gwa = calculateGWA(grades, units);

console.log("GWA: ", gwa)