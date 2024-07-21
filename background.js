// BACKGROUND FUNCTIONALITY IMPLEMENTED BUT NOT USED

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	// Check if the tab's URL matches your criteria and the tab is finished loading
	if ((/sis.*\/student\/grades$/).test(tab.url) && changeInfo.status === 'complete') {
        console.log('A tab URL matches the pattern: ', tab.url);
        chrome.scripting.executeScript(
            {
                target: { tabId: tabId },
                files: ['contentScript.js']
            },
            () => {
                // After executing the script, send a message to the content script to get grades
                chrome.tabs.sendMessage(tabId, { type: 'getgrades' });
            }
        );
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action === "injectContentScript") {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const tab = tabs[0]
			if (tab && (/sis.*\/student\/grades$/).test(tab.url)) {
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tab.id },
                        files: ['contentScript.js']
                    },
                    () => {
                        // After executing the script, send a message to the content script to get grades
                        chrome.tabs.sendMessage(tab.id, { type: 'getgrades' });
                    }
                );
			}
		});
	}
});