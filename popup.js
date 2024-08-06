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

    document.getElementById("select-container").style = `display: none;`;

    const reload_btn = document.getElementById("reload-btn");
    const term_select = document.getElementById("term-select");

    reload_btn.addEventListener("click", function() {
        handleClickEvent();
    });

    term_select.addEventListener('change', () => {
        const selectedOption = term_select.options[term_select.selectedIndex];
        handleClickEvent(selectedOption.value);
    });

    chrome.runtime.sendMessage({ action: "injectContentScript" });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'gradesFetched') {
            const semester = message.data.semester;
            const grades = message.data.grades;
            const yearLevel = message.data.admission_status;
            const units = message.data.units;
            const incompleteGrades = message.data.incompleteGrades;
            const usersTermsOptions = message.data.usersTermsOptions;
            const scholastic_status = message.data.scholastic_status;

            const semesterText = semester.split(" ").slice(3, 7).join(" ");
            const year_sem = `${yearLevel} - ${semesterText}`;

            let htmlForSelect = `
                ${usersTermsOptions.map((option, index) => {
                    return `
                    <option value="" hidden selected>Select Term</option>
                    <option value="${index}">${option}</option>`
                }).join('')}
            `
            htmlForSelect += `<option value="all">Overall Grades</option>`;

            if (term_select.children.length === 0) {
                document.getElementById("term-select").innerHTML = htmlForSelect;
                document.getElementById("select-container").style = `display: block;`;
            }

            const gwa = window.calculateGWA(grades, units);

            document.getElementById("gwa-txt").innerText = `${gwa} GWA`;
            document.getElementById("semester-txt").innerText = year_sem;

            const gradesStatus = window.determineIncompleteGrades(incompleteGrades);
            document.getElementById("grades-status-txt").innerText = `${gradesStatus}`;

            const percentage = window.determinePercentage(gwa);
            const equivalentGrade = window.determineEquivalent(gwa);
            const standing = window.determineStanding(gwa, grades);
            const latinHonors = window.determineLatinHonors(gwa, grades);
            const status = scholastic_status;
            const scholarshipMaintainenance = window.determineScholarshipMaintenance(gwa, grades, yearLevel);

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
