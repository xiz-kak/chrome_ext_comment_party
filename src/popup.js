let btnComment = document.getElementById("comment");
btnComment.addEventListener("click", async () => {
  const data = {
    to: "contentScript",
    action: "messageSent",
    value: "haro~"
  };
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, data, function(response) {});
  });
});


let btnCon= document.getElementById("connect");
btnCon.addEventListener("click", async () => {
  const tfChannelName = document.getElementById("channelName");
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

