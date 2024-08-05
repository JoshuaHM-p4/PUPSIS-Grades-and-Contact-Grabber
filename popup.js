document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded event fired");

    // table term
    let gwa_loaded = false;

    const OVERRIDE_DEV = false;

    function handleClickEvent(termSelected = 0) {
        // Query for the active tab in the current window
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            // Get the current tab
            const currentTab = tabs[0];

            // Check if the OVERRIDE_DEV flag is set to true or if the current tab URL matches the specified pattern
            if (OVERRIDE_DEV || (/sis.*\/student\/grades$/).test(currentTab.url)) {
                console.log('Current tab URL matches the pattern: ', currentTab.url);
                // If conditions are met, execute the contentScript.js script in the current tab
                chrome.scripting.executeScript(
                    {
                        target: { tabId: currentTab.id },
                        files: ['contentScript.js']
                    },
                    () => {
                        // After executing the script, send a message to the content script to get grades
                        chrome.tabs.sendMessage(currentTab.id, { type: 'getgrades', term: termSelected });
                    }
                );
            } else {
                // If conditions are not met, navigate to the SIS portal in a new tab
                chrome.tabs.create({ url: 'https://sis2.pup.edu.ph/student/grades' }, function(newTab) {
                    // After creating the new tab, execute the contentScript.js script in the new tab
                    chrome.scripting.executeScript(
                        {
                            target: { tabId: newTab.id },
                            files: ['contentScript.js']
                        },
                        () => {
                            // After executing the script, update the new tab to make it active
                            chrome.tabs.update(newTab.id, { active: true });
                            // Send a message to the content script in the new tab to get grades
                            chrome.tabs.sendMessage(newTab.id, { type: 'getgrades' });
                        }
                    );
                });
            }
        });
    }

    // Default select container display
    document.getElementById("select-container").style = `display: none;`;

    // GWA CALCULATE BUTTON
    const reload_btn = document.getElementById("reload-btn")

    // SELECTED TERM
    const term_select = document.getElementById("term-select");

    // OPTIONS FOR SELECTED TERM

    // Event listener for the calculate button
    reload_btn.addEventListener("click", function() {
        handleClickEvent();
    });
    
    // Term select event listener
    term_select.addEventListener('change', () => {
        const selectedOption = term_select.options[term_select.selectedIndex];
        handleClickEvent(selectedOption.value);
    });

    // Inject the content script when the popup is opened
    chrome.runtime.sendMessage({ action: "injectContentScript"});

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'gradesFetched') {
            // Step 1: Get the fetched grades, semester, year level, units, incomplete grades, user terms options, and scholastic status
            const semester = message.data.semester;
            const grades = message.data.grades;
            const yearLevel = message.data.admission_status;
            const units = message.data.units;
            const incompleteGrades = message.data.incompleteGrades;
            const usersTermsOptions = message.data.usersTermsOptions;
            const scholastic_status = message.data.scholastic_status;

            // Get the year level and semester text
            const semesterText = semester.split(" ").slice(3, 5).join(" "); // This will handle and take "First Semester" and "Second Semester"
            const year_sem = `${yearLevel} - ${semesterText}`;

            // Add options to the select element
            let htmlForSelect = `
                ${usersTermsOptions.map((option, index) => {
                    return `
                    <option value="" hidden selected>Select Term</option>
                    <option value="${index}">${option}</option>`
                }).join('')}
            `

            // If there are no options, disable the select element
            if (term_select.children.length === 0) {
                document.getElementById("term-select").innerHTML = htmlForSelect;
                document.getElementById("select-container").style = `display: block;`;
            }

            // Step 2: Calculate GWA from fetched grades
            const gwa = window.calculateGWA(grades, units);


            // Step 3: Update the GWA display and Semester
            document.getElementById("gwa-txt").innerText    = `${gwa} GWA`;
            document.getElementById("semester-txt").innerText = year_sem;

            // Step 3.1: Determine if there are incomplete grades
            const gradesStatus = window.determineIncompleteGrades(incompleteGrades);
            document.getElementById("grades-status-txt").innerText = `${gradesStatus}`;

            // Step 4: Determine the Percentage based on the calculated GWA
            const percentage = window.determinePercentage(gwa);

            // Step 5: Determine the Eqiuvalent Grade based on the calculated GWA
            const equivalentGrade = window.determineEquivalent(gwa);

            // Step 6: Determine standing based on calculated GWA
            const standing = window.determineStanding(gwa, grades);

            // Step 7: Determine Latin Honors based on calculated GWA
            const latinHonors = window.determineLatinHonors(gwa, grades);

            // Step 8: Determine status based on dd element
            const status = scholastic_status;

            // Step 9: Determine the Scholarship Maintenance Status
            const scholarshipMaintainenance = window.determineScholarshipMaintenance(gwa, grades, yearLevel)

            // Step 10: Update the respective elements with the calculated values
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
