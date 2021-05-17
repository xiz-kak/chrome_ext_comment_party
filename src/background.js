chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({ listening: false, partyId: null }, function() {});
  chrome.browserAction.setBadgeText({text: "!"});
  chrome.browserAction.setBadgeBackgroundColor({color: "#DB4437"});
});

let pusher;

const PUSHER_EVENT_NAME = 'comment_post';
const PUSHER_CLUSTER = 'ap3';
const PUSHER_APP_PUB_KEY = '2b06d2ff54348e48daf7';
const PUSHER_AUTH_URL = 'https://comment-party-pusher-auth.herokuapp.com/pusher/auth';

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    sendResponse(true);
    console.log(request);
    if (request.to == "background") {
      if (request.action == "pusherConnect") {
        setupPusher(request.value);
      } else if (request.action == "pusherDisconnect") {
        if (pusher) { pusher.disconnect(); }
        pusher = undefined;
        chrome.browserAction.setBadgeText({text: "!"});
      }
    }
  }
);

Pusher.logToConsole = true;

function setupPusher(channelName) {
  if (pusher) { pusher.disconnect(); }
  chrome.browserAction.setBadgeText({text: "!"});

  pusher = new Pusher(PUSHER_APP_PUB_KEY, {
    cluster: PUSHER_CLUSTER,
    authEndpoint: PUSHER_AUTH_URL
  });
  chrome.browserAction.setBadgeText({text: ""});

  let channel = pusher.subscribe('private-' + channelName);
  channel.bind(PUSHER_EVENT_NAME, function(event) {
    const data = {
      to: "contentScript",
      action: "messageSent",
      value: event.text
    };
    console.log(data);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      console.log(tabs);
      if (tabs && tabs.length > 0 && tabs[0].url.match(/^https?:\/\/.+/)) {
        chrome.tabs.sendMessage(tabs[0].id, data, function(response) {});
      }
    });
  });
}
