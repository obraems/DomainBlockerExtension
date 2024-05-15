let domainLock = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.action) {
    case "toggle":
      return toggle(request, sender, sendResponse);
      break;
    case "getDomainLock":
      sendResponse({domainLock: domainLock});
      break;
  }
});


function toggle(request, sender, sendResponse){
  if (domainLock) {
    domainLock = null;
    chrome.action.setIcon({path: "assets/icon/iconGray_48.png"});
    sendResponse({status: "disabled",domainLock});
  } else {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url) {
        const url = new URL(tabs[0].url);
        if (!url.protocol.startsWith('http') && !url.protocol.startsWith('https')) {
          sendResponse({status: "error", message: "Current tab's URL is not http/https"});
          return;
        }
        domainLock = url.hostname;
        chrome.action.setIcon({path: "assets/icon/icon_48.png"});
        console.log(domainLock);
        sendResponse({status: "enabled",domainLock});
      } else {
        sendResponse({status: "error", message: "No active tab or URL is undefined"});
      }
    });
    return true;  // Indique que la réponse sera envoyée de manière asynchrone
  }
}


chrome.webNavigation.onCommitted.addListener(function(details) {
  if (domainLock && details.transitionType !== "auto_subframe" && details.transitionType !== "manual_subframe") {
    const url = new URL(details.url);
    if (url.hostname !== domainLock) {
      if (details.transitionQualifiers.includes("from_address_bar") || details.frameId === 0) {
        chrome.tabs.goBack(details.tabId, function() {
          if (chrome.runtime.lastError) { // En cas d'erreur (peut-être qu'il n'y a pas de page précédente)
            removeTab(details.tabId);
          }
        });
      }
    }
  }
}, {url: [{schemes: ["http", "https"]}]});

chrome.tabs.onCreated.addListener(function(tab) {
  if (domainLock && tab.url) {
    const url = new URL(tab.url);
    if (url.hostname !== domainLock) {
      removeTab(tab.id);
    }
  }
});


async function removeTab(id){
  const strinUrl = (await chrome.tabs.get(id)).url;
  const url = new URL(strinUrl);

  if(!url.protocol.startsWith('http') && !url.protocol.startsWith('https')){
    return;
  }

  return chrome.tabs.remove(id,()=>chrome.runtime.lastError);

}
