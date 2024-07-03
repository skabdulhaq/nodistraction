let blockThumbnails = false;
let blockRecommendations = false;
let blockShorts = false;
let unBlockTime = new Date().getTime();

chrome.runtime.onInstalled.addListener(async () => {
	chrome.storage.sync.set({
		blockThumbnails: false,
		blockRecommendations: true,
		blockShorts: true,
		unBlockTime: new Date().getTime()
	}).then(() => { console.log("Set!!") })
})


chrome.storage.sync.get(['blockThumbnails', 'blockRecommendations', 'blockShorts', 'unBlockTime']).then((result) => {
	blockThumbnails = result.blockThumbnails;
	blockRecommendations = result.blockRecommendations;
	blockShorts = result.blockShorts;
	unBlockTime = result.unBlockTime;
})


function reloadTab() {
	try {
		chrome.tabs.query({ active: true, currentWindow: true }).then((arrayOfTabs) => {
			if (arrayOfTabs.length > 0) {
				if ("url" in arrayOfTabs[0]) {
					chrome.scripting.executeScript({
						target: { tabId: arrayOfTabs[0].id },
						func: () => { window.location.reload(); },
					}).then(console.log("Reloading Page"));
				}
			}
		});
	} catch (error) {
		console.log(error);
	}

}

chrome.storage.onChanged.addListener((changes, namespace) => {
	if (namespace === 'sync') {
		if (changes.blockThumbnails) {
			blockThumbnails = changes.blockThumbnails.newValue;
			if (!blockThumbnails) {
				chrome.declarativeNetRequest.updateEnabledRulesets({ disableRulesetIds: ["thubnail_blocking"] })
				console.log('Blocking Thumbnails');
			} else {
				chrome.declarativeNetRequest.updateEnabledRulesets({ enableRulesetIds: ["thubnail_blocking"] })
				console.log('Unblocking Thumbnails');
			}
			reloadTab();
		}
		if (changes.blockRecommendations) {
			blockRecommendations = changes.blockRecommendations.newValue;
		}
		if (changes.blockShorts) {
			blockShorts = changes.blockShorts.newValue;
		}
		if (changes.unBlockTime) {
			unBlockTime = changes.unBlockTime.newValue;
			reloadTab();
		}
	}
})



