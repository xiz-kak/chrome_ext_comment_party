const iconControl = new RotateIcon('../images/icon_solo_32.png');

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({ listening: false, partyId: null, devPusher: false }, function() {});
});

let pusher;

const PUSHER_EVENT_NAME = 'comment_post';
const PUSHER_CLUSTER = 'ap3';
const PUSHER_APP_PUB_KEY_DEV = '2b06d2ff54348e48daf7';
const PUSHER_APP_PUB_KEY_PRD = '58267dad34bdd51e031e';
const PUSHER_AUTH_URL = 'https://comment-party-pusher-auth.herokuapp.com/pusher/auth';

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    sendResponse(true);
    console.log(request);
    if (request.to == 'background') {
      if (request.action == 'pusherConnect') {
        setupPusher(request.value);
      } else if (request.action == 'pusherDisconnect') {
        if (pusher) { pusher.disconnect(); }
        pusher = undefined;
        iconControl.reset();
      }
    }
  }
);

Pusher.logToConsole = true;

async function setupPusher(config) {
  if (pusher) { pusher.disconnect(); }
  iconControl.reset();

  const pubKey = config.devPusher ? PUSHER_APP_PUB_KEY_DEV : PUSHER_APP_PUB_KEY_PRD;
  pusher = new Pusher(pubKey, {
    cluster: PUSHER_CLUSTER,
    authEndpoint: PUSHER_AUTH_URL
  });
  iconControl.rotate();

  let channel = pusher.subscribe('private-' + config.partyId);
  channel.bind(PUSHER_EVENT_NAME, function(event) {
    const data = {
      to: 'contentScript',
      action: 'messageSent',
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
