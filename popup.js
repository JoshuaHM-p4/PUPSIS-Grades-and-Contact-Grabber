document.addEventListener('DOMContentLoaded', function() {
    const OVERRIDE_DEV = true;

    function handleClickEvent() {
        // Query for the active tab in the current window
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            // Get the current tab
            const currentTab = tabs[0];
    
            // Check if the OVERRIDE_DEV flag is set to true or if the current tab URL matches the specified pattern
            if (OVERRIDE_DEV || (/sis.*\/student\/grades$/).test(currentTab.url)) {
                // If conditions are met, execute the contentScript.js script in the current tab
                chrome.scripting.executeScript(
                    {
                        target: { tabId: currentTab.id },
                        files: ['contentScript.js']
                    },
                    () => {
                        // After executing the script, send a message to the content script to get grades
                        chrome.tabs.sendMessage(currentTab.id, { type: 'getgrades' });
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
    

    // GWA CALCULATE BUTTON
    document.getElementById("gwa-calculate-button").addEventListener("click", function() {
        handleClickEvent();
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'gradesFetched') {
            const grades = message.data.grades;
            const units = message.data.units;

            // Step 2: Calculate GWA from fetched grades
            const gwa = window.calculateGWA(grades, units);

            // Step 3: Update the GWA display
            document.getElementById("gwa").innerText = `GWA: ${gwa}`;

            // Step 4: Determine standing based on calculated GWA
            const standing = window.determineStanding(gwa);

            // Step 5: Determine Latin Honors based on calculated GWA
            const latinHonors = window.determineLatinHonors(gwa);

            // Step 6: Determine status (e.g., Regular, Probation) based on standing
            const status = window.determineStatus(standing);

            // Step 7: Update the respective elements with the calculated values
            document.getElementById("standing-display").innerText = `${standing}`;
            document.getElementById("honors-display").innerText = `${latinHonors}`;
            document.getElementById("status-display").innerText = `${status}`;
        }
    });
});
