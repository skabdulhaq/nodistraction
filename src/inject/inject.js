function remove_rec() {
	if (window.location.href.includes("www.youtube.com/watch?v=")) {
		// chrome.runtime.sendMessage({}, function () {
			// var readyStateCheckInterval = setInterval(function () {
				// clearInterval(readyStateCheckInterval);
				// setInterval(function () {
					if (document.querySelector("#secondary")) {
						document.querySelector("#secondary").remove();
					}
				// }, 10);
			// }, 10);
		// });
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

setInterval(function () {
	if (window.location.href.includes("www.youtube.com/watch") && document.querySelector("#secondary")) {
		remove_rec();
	}
	else if (window.location.href === "https://www.youtube.com/") {
		document.querySelector("#primary").innerHTML = "<h1 style='color: white; text-align: center;font-size:8rem;align-self: center;;'>Let's Do Something Productive!!</h1>";
		removeSideNav();
		if (document.querySelector("#primary > ytd-rich-grid-renderer")) {
			document.querySelector("#primary > ytd-rich-grid-renderer").remove();
		}
		if (window.location.href.includes("www.youtube.com/watch")) {
			document.querySelector("#movie_player > div.html5-endscreen.ytp-player-content.videowall-endscreen.ytp-show-tiles").remove();
		}
	}
	else {
		removeSideNav();
	}
}, 1000);