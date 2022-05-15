function remove_rec() {
	if (window.location.href.includes("www.youtube.com/watch?v=")) {
		chrome.runtime.sendMessage({}, function () {
			var readyStateCheckInterval = setInterval(function () {
				clearInterval(readyStateCheckInterval);
				setInterval(function () {
					if (document.querySelector("#secondary")) {
						document.querySelector("#secondary").remove();
					}
				}, 10);
			}, 10);
		});
	}
}
setInterval(function () {
	if (window.location.href.includes("www.youtube.com/watch") && document.querySelector("#secondary")) {
		remove_rec();
	}
	else if (document.querySelector("#primary > ytd-rich-grid-renderer") && window.location.href === ("https://www.youtube.com/")) {
		document.querySelector("#primary > ytd-rich-grid-renderer").remove();
		document.querySelector("#guide-inner-content").remove();
		document.querySelector("#guide-button").click()
		document.querySelector("#guide-content").remove();
		document.querySelector("#guide-button").remove();
		document.querySelector("#primary").innerHTML = "<h1 style='color: white; text-align: center;font-size:8rem;align-self: center;;'>Let's Do Something Productive!!</h1>";
		document.querySelector("#content > ytd-mini-guide-renderer").remove();
		// document.querySelector("#guide").getAttribute();
		document.querySelector("#sections").remove();
	}
	else if (window.location.href.includes("www.youtube.com/watch")) {
		document.querySelector("#movie_player > div.html5-endscreen.ytp-player-content.videowall-endscreen.ytp-show-tiles").remove();
	}
}, 1000);