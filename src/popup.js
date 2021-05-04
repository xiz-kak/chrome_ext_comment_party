window.onload = function(){
  chrome.storage.local.get(['listening', 'partyId'], function(res) {
    if (res.listening) {
      const inputPartyId = document.getElementById("partyId");
      inputPartyId.value = res.partyId;
    }
  });
}

let btnStart= document.getElementById("start");
btnStart.addEventListener("click", async () => {
  const inputPartyId = document.getElementById("partyId");
  const data = {
    to: "background",
    action: "pusherConnect",
    value: inputPartyId.value
  };
  chrome.runtime.sendMessage(data, function(response) {
    console.log(response);
    chrome.storage.local.set({ listening: true, partyId: inputPartyId.value }, function() {
      console.log('Listening started: PARTY ID:' + inputPartyId.value);
    });
  });
});

let btnEnd = document.getElementById("end");
btnEnd.addEventListener("click", async () => {
  const data = {
    to: "background",
    action: "pusherDisconnect",
    value: ""
  }
  chrome.runtime.sendMessage(data, function(response) {
    console.log(response);
    chrome.storage.local.set({ listening: false, partyId: null }, function() {
      console.log('Listening end');
    });
  });
});

let btnComment = document.getElementById("comment");
btnComment.addEventListener("click", async () => {
  const data = {
    to: "contentScript",
    action: "messageSent",
    value: "dehedehedehedehedeheharo~"
  };
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, data, function(response) {});
  });
});

let btnCon= document.getElementById("connect");
btnCon.addEventListener("click", async () => {
  const tfChannelName = document.getElementById("partyId");
  const data = {
    to: "background",
    action: "pusherConnect",
    value: tfChannelName.value
  };
  chrome.runtime.sendMessage(data, function(response) {});
});

let btnDiscon = document.getElementById("disconnect");
btnDiscon.addEventListener("click", async () => {
  const data = {
    to: "background",
    action: "pusherDisconnect",
    value: ""
  };
  chrome.runtime.sendMessage(data, function(response) {});
});

