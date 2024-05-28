
const OVERRIDE_DEV = true

function handleClickEvent() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        const currentTab = tabs[0];

        if (OVERRIDE_DEV || (/sis.*\/student\/grades$/).test(currentTab.url)) {
            chrome.tabs.sendMessage(currentTab.id, { type: 'getgrades' });
        }
        else {
            // navigates to sis portal
            chrome.tabs.create({ url: 'https://sis2.pup.edu.ph/student/grades' }, function(newTab) {
            chrome.tabs.update(newTab.id, { active: true });
            });
        }
    })
}

// GWA CALCULATE BUTTON
document.getElementById("#gwa-calculate-button").addEventListener("click", function() {
    handleClickEvent();

    // chrome.runtime.addEventListener(function(request, sender, sendResponse) {

    // })
    
    // Step 1: Fetch grades from the web scraper


    // Step 2: Calculate GWA from fetched grade
    // const gwa = utils.calculateGwa(grades, units);

    // Step 3: Update the GWA display


    // Step 4: Determine standing based on calculated GWA


    // Step 5: Determine Latin Honors based on calculated GWA


    // Step 6: Determine status (e.g., Regular, Probation) based on standing


    // Step 7: Update the respective elements with the calculated values

});

// COLLECT BUTTON
document.getElementById("#collect-profs-button").addEventListener("click", function() {

});