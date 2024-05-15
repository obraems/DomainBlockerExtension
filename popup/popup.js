document.addEventListener('DOMContentLoaded', function() {
  const statusElement = document.getElementById('status');
  const toggleButton = document.getElementById('toggle');

  // Demander l'état actuel du domaine verrouillé
  chrome.runtime.sendMessage({action: "getDomainLock"}, function(response) {
    if (response.domainLock) {
      updateStatus(response.domainLock);
      toggleButton.checked = true;
    } else {
      updateStatus();
      toggleButton.checked = false;
    }
  });

  toggleButton.addEventListener('change', function() {
    chrome.runtime.sendMessage({action: "toggle"}, function(response) {
      console.log(response);
      if (response.status === "enabled") {
        updateStatus(response.domainLock);
        toggleButton.checked = true;
      } else {
        updateStatus();
        toggleButton.checked = false;
      }
    });
  });

  function updateStatus(domainLock){
    if(!domainLock){
      statusElement.textContent = "No domain is currently locked";
    }else{
      statusElement.innerHTML  = `Locked on: <span id="domainLock">${domainLock}</span>`;
    }
  }

});
