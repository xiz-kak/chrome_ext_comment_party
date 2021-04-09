let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});

let ws;
const host = "ws://127.0.0.1:5001";

function setupWs() {
  ws = new WebSocket(host);

  ws.onopen = function() {
    console.log("=== WebSocket connected ===");
  };

  ws.onclose = function(e) {
    ws = undefined;

    console.log("=== WebSocket closed ===");
  };

  ws.onmessage = function(e) {
    const message = { text: e.data };
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
        // console.log(response.farewell);
      });
    });
  };
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    sendResponse();
    console.log(request);
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    // if (request.greeting == "hello") {
    //   sendResponse({farewell: "goodbye"});
    // }
    if (request.to == "background") {
      if (request.key == "ws") {
        if (request.value == "on") {
          ws || setupWs();
        } else if (request.value == "off") {
          ws && ws.close();
        }
      }
      if (request.key == "message") {
        ws && ws.send(request.value);
      }
    }
  }
);

Pusher.logToConsole = true;

var pusher = new Pusher('2b06d2ff54348e48daf7', {
  cluster: 'ap3'
});

var channel = pusher.subscribe('my-channel');
channel.bind('my-event', function(data) {
  console.log(JSON.stringify(data));
  const message = { text: data.message };
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
      // console.log(response.farewell);
    });
  });
});
