const stopTimings = ["5 Minutes", "15 Minutes", "30 Minutes", "60 Minutes"]
const stopShortsTimings = ["2 Minutes", "5 Minutes", "10 Minutes", "15 Minutes"]
const stopBlockinTimings = ["5 Minutes", "15 Minutes", "20 Minutes", "30 Minutes"]
let stopTimer = null;


function handleButtonClick(sectionId, duration) {
    const durationInMinutes = parseInt(duration)
    const unBlockTill = new Date(new Date().getTime() + durationInMinutes * 60000).getTime();
    const unBlockResult = { unBlockTime: unBlockTill }
    if (sectionId === 'recommendations') {
        unBlockResult["blockRecommendations"] = false;
    }
    else if (sectionId === 'shorts') {
        unBlockResult["blockShorts"] = false;
    }
    else if (sectionId === '') {
        unBlockResult["blockShorts"] = false;
        unBlockResult["blockRecommendations"] = false;
        unBlockResult["blockThumbnails"] = false;
    }
    chrome.storage.sync.set(unBlockResult);
}

function toggleUltraProductivity(toggleState) {
    chrome.storage.sync.set({
        blockThumbnails: toggleState
    });
    console.log('productiveToggle state changed to:', toggleState);
}

function generateStopBlockingSection(sectionId, buttonStopTimings) {
    var sectionDiv = document.createElement('div');
    sectionDiv.id = sectionId;
    sectionDiv.className = 'unblock-selection';
    var innerDiv = document.createElement('div');
    innerDiv.className = 'flex flex-col gap-5';

    var pElement = document.createElement('p');
    pElement.className = 'text-base';
    pElement.textContent = `Stop blocking Youtube ${sectionId} for`;

    var buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex gap-4 justify-center';

    buttonStopTimings.forEach(function (text) {
        var button = document.createElement('button');
        button.className = 'btn btn-accent';
        button.textContent = text;
        button.onclick = function () {
            handleButtonClick(sectionId, text);
        };
        buttonContainer.appendChild(button);
    });

    innerDiv.appendChild(pElement);
    innerDiv.appendChild(buttonContainer);
    sectionDiv.appendChild(innerDiv);

    document.getElementById('options').appendChild(sectionDiv);
}

function toggleBlockOptionsDisplay(show) {
    var display;
    if (show) {
        display = "block";
    } else {
        display = "none";
    }
    var unBlockSelectionElements = document.getElementsByClassName('unblock-selection');
    for (var i = 0; i < unBlockSelectionElements.length; i++) {
        unBlockSelectionElements[i].style.display = display;
    }
}

function toggleTimerDisplay(show) {
    var display;
    if (show) {
        display = "block";
    } else {
        display = "none";
    }
    document.getElementById('timer-container').style.display = display;
}

function formatTime(timeDifference) {
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    if (hours == NaN || minutes == NaN || seconds == NaN) {
        return "Loading...."
    }
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    console.log(formattedTime);
    return formattedTime;
}

function updateTimer(seconds) {
    const timerElement = document.getElementById('timer');
    timerElement.innerText = formatTime(seconds);
}

function startTimer(targetTime) {
    let secondsUntilTarget;
    if (secondsUntilTarget <= 0) {
        toggleBlockOptionsDisplay(true);
        toggleTimerDisplay(false);
        return
    }
    const timerInterval = setInterval(function () {
        updateTimer(secondsUntilTarget);
        if (secondsUntilTarget === 0) {
            clearInterval(timerInterval);
            toggleBlockOptionsDisplay(true);
            toggleTimerDisplay(false);
            chrome.storage.sync.set({ blockRecommendations: true});
        } else {
            const currentTime = new Date().getTime();
            secondsUntilTarget = targetTime - currentTime;
        }
    }, 1000);
}

var productiveToggle = document.getElementById('productiveToggle');
chrome.storage.sync.get(['blockThumbnails']).then((result) => {
    console.log(result);
    productiveToggle.checked = result.blockThumbnails;
})
productiveToggle.addEventListener('change', function () {
    var isToggleChecked = productiveToggle.checked;
    toggleUltraProductivity(isToggleChecked);
});

generateStopBlockingSection('recommendations', stopTimings);
generateStopBlockingSection('shorts', stopShortsTimings);
generateStopBlockingSection('', stopBlockinTimings);


chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        if (changes.blockThumbnails) {
            productiveToggle.checked = changes.blockThumbnails.newValue;
        }
        if (changes.unBlockTime) {
            toggleBlockOptionsDisplay(false);
            toggleTimerDisplay(true);
            stopTimer = changes.unBlockTime.newValue
            startTimer(stopTimer);
        }
    }
})


window.onload = function () {
    chrome.storage.sync.get(['unBlockTime']).then((result) => {
        stopTimer = result.unBlockTime;
        if (stopTimer > new Date().getTime()) {
            toggleBlockOptionsDisplay(false);
            toggleTimerDisplay(true);
            startTimer(stopTimer);
        } else {
            toggleBlockOptionsDisplay(true)
            toggleTimerDisplay(false);
        }
    })
}