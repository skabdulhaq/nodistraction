let blockRecommendations = false;
let blockShorts = false;
let unBlockTime = new Date().getTime();

function remove_recomendations() {
	if (window.location.href.includes("www.youtube.com/watch?v=")) {

		if (document.querySelector("#secondary")) {
			document.querySelector("#secondary").remove();
		}
		if (document.querySelector("#movie_player > div.html5-endscreen.ytp-player-content.videowall-endscreen.ytp-show-tiles")) {
			document.querySelector("#movie_player > div.html5-endscreen.ytp-player-content.videowall-endscreen.ytp-show-tiles").remove();
		}
	}
	else if (window.location.href === "https://www.youtube.com/") {
		if (document.querySelector("#primary > ytd-rich-grid-renderer")) {
			document.querySelector("#primary > ytd-rich-grid-renderer").remove();
		}
		removeSideNav();

		document.querySelector("#primary").innerHTML = "<h1 style='color: #11B8B8; text-align: center;font-size:8rem;align-self: center;;'>Let's Do Something Productive!!</h1>";
	}
	else {
		removeSideNav();
	}
}

function removeSideNav() {
	if (document.querySelector("#guide-button")) {
		document.querySelector("#guide-button").click()
		document.querySelector("#guide-button").remove();
	}
	if (document.querySelector("#guide-content")) {
		document.querySelector("#guide-content").remove();
	}
	if (document.querySelector("#sections")) {
		document.querySelector("#sections").remove();
	}
	if (document.querySelector("#content > ytd-mini-guide-renderer")) {
		document.querySelector("#content > ytd-mini-guide-renderer").remove();
	}
	if (document.querySelector("#guide-inner-content")) {
		document.querySelector("#guide-inner-content").remove();
	}
}

function removeShots() {
	if (document.querySelector('#shorts-container')) {
		if (window.location.href.includes("shorts")) {
			setTimeout(() => document.querySelector('#shorts-container').remove(), 1000);
		}
	}
}


chrome.storage.sync.get(['blockRecommendations', 'blockShorts', 'unBlockTime']).then((result) => {
	blockRecommendations = result.blockRecommendations;
	blockShorts = result.blockShorts;
	unBlockTime = result.unBlockTime;
})

chrome.storage.onChanged.addListener((changes, namespace) => {
	if (namespace === 'sync') {
		if (changes.blockRecommendations) {
			blockRecommendations = changes.blockRecommendations.newValue;
		}
		if (changes.blockShorts) {
			blockShorts = changes.blockShorts.newValue;
		}
		if (changes.unBlockTime) {
			unBlockTime = changes.unBlockTime.newValue;
		}
	}
})
setInterval(function () {
	console.log("UnBlockTime", new Date(unBlockTime))
	console.log("PresentTime", new Date())
	console.log(new Date().getTime() - unBlockTime)
	if (!blockRecommendations || !blockShorts) {
		if (new Date().getTime() > unBlockTime) {
			chrome.storage.sync.set({ blockRecommendations: true, blockShorts: true })
		}
	}
	if (blockShorts) {
		removeShots();
	}
	if (blockRecommendations) {
		remove_recomendations();
	}
}, 1000);