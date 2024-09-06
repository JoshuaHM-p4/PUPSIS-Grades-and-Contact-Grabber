document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded event fired");

    let gwa_loaded = false;
    const OVERRIDE_DEV = false;

    function handleClickEvent(termSelected = 0) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentTab = tabs[0];

            if (OVERRIDE_DEV || (/sis.*\/student\/grades$/).test(currentTab.url)) {
                console.log('Current tab URL matches the pattern: ', currentTab.url);
                chrome.scripting.executeScript(
                    {
                        target: { tabId: currentTab.id },
                        files: ['contentScript.js']
                    },
                    () => {
                        chrome.tabs.sendMessage(currentTab.id, { type: 'getgrades', term: termSelected });
                    }
                );
            } else {
                chrome.tabs.create({ url: 'https://sis2.pup.edu.ph/student/grades' }, function(newTab) {
                    chrome.scripting.executeScript(
                        {
                            target: { tabId: newTab.id },
                            files: ['contentScript.js']
                        },
                        () => {
                            chrome.tabs.update(newTab.id, { active: true });
                            chrome.tabs.sendMessage(newTab.id, { type: 'getgrades', term: termSelected });
                        }
                    );
                });
            }
        });
    }


    // Set the display of the select container to none as default
    document.getElementById("select-container").style = `display: none;`;

    // Add event listener to the download button and term select
    const term_select = document.getElementById("term-select");

    // Add event listener to the term select
    term_select.addEventListener('change', () => {
        const selectedOption = term_select.options[term_select.selectedIndex];
        handleClickEvent(selectedOption.value);
    });


    // Inject the content script
    chrome.runtime.sendMessage({ action: "injectContentScript" });

    // Listen for the message from the content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'gradesFetched') {

            // Get data from the message
            const semester = message.data.semester;
            const grades = message.data.grades;
            const yearLevel = message.data.admission_status;
            const units = message.data.units;
            const incompleteGrades = message.data.incompleteGrades;
            const usersTermsOptions = message.data.usersTermsOptions;
            const scholastic_status = message.data.scholastic_status;
            const semesterText = semester.split(" ").slice(3, 7).join(" ");
            const year_sem = `${yearLevel} - ${semesterText}`;

            // Display term data
            let htmlForSelect = `
                ${usersTermsOptions.map((option, index) => {
                    return `
                    <option value="" hidden selected>Select Term</option>
                    <option value="${index}">${option}</option>`
                }).join('')}
            `
            // Add an option for all terms
            htmlForSelect += `<option value="all">Overall Grades</option>`;

            // Check if the select container has no children
            if (term_select.children.length === 0) {
                document.getElementById("term-select").innerHTML = htmlForSelect;
                document.getElementById("select-container").style = `display: block;`;
            }

            // Calculate the GWA
            const gwa = window.calculateGWA(grades, units);

            // Update GWA and semester text
            document.getElementById("gwa-txt").innerText = `${gwa} GWA`;
            document.getElementById("semester-txt").innerText = year_sem;

            // Determine if the student has incomplete grades
            const gradesStatus = window.determineIncompleteGrades(incompleteGrades);
            document.getElementById("grades-status-txt").innerText = `${gradesStatus}`;

            // Determine the percentage, equivalent grade, standing, latin honors, and scholarship maintenance
            const percentage = window.determinePercentage(gwa);
            const equivalentGrade = window.determineEquivalent(gwa);
            const standing = window.determineStanding(gwa, grades);
            const latinHonors = window.determineLatinHonors(gwa, grades);
            const status = scholastic_status;
            const scholarshipMaintainenance = window.determineScholarshipMaintenance(gwa, grades, yearLevel);

            // Update the text content of the elements
            document.getElementById("percentage-txt").innerText = `${percentage}`;
            document.getElementById("equivalent-txt").innerText = `${equivalentGrade}`;
            document.getElementById("standing-txt").innerText = `${standing}`;
            document.getElementById("honors-txt").innerText = `${latinHonors}`;
            document.getElementById("status-txt").innerText = `${status}`;
            document.getElementById("scholarship-txt").innerText = `${scholarshipMaintainenance}`;
            gwa_loaded = true;
        }
    });
});
