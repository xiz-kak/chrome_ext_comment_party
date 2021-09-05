const iconControl = new RotateIcon('../images/icon_solo_32.png');

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({
    listening: false,
    partyId: null,
    devPusher: false,
    serverBaseUrl: null
  }, function() {});
});

let pusher;

const PUSHER_EVENT_NAME = 'comment_post';
const PUSHER_CLUSTER = 'ap3';
const PUSHER_APP_PUB_KEY_DEV = '2b06d2ff54348e48daf7';
const PUSHER_APP_PUB_KEY_PRD = '58267dad34bdd51e031e';
const SERVER_BASE_URL_PRD = 'https://comment-party.an.r.appspot.com';

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    if (request.to == 'background') {
      if (request.action == 'pusherConnect') {
        setupPusher(request.value, sendResponse);
      } else if (request.action == 'pusherDisconnect') {
        if (pusher) { pusher.disconnect(); }
        pusher = undefined;
        iconControl.reset();
        sendResponse(true);
      }
    }
    return true;
  }
);

Pusher.logToConsole = true;

async function setupPusher(config, sendResponse) {
  if (pusher) { pusher.disconnect(); }
  iconControl.reset();

  const pubKey = config.devPusher ? PUSHER_APP_PUB_KEY_DEV : PUSHER_APP_PUB_KEY_PRD;
  const baseUrl = config.devPusher ? config.serverBaseUrl : SERVER_BASE_URL_PRD;
  pusher = new Pusher(pubKey, {
    cluster: PUSHER_CLUSTER,
    authEndpoint: `${ baseUrl }/pusher/auth`
  });

  pusher.connection.bind('error', function (error) {
    console.error('Connection error: ', error);
    alert('Comment Party faces an unexpected error...');
  });

  let channel = pusher.subscribe('private-encrypted-' + config.partyId);
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
  channel.bind("pusher:subscription_succeeded", () => {
    iconControl.rotate();
    sendResponse(true);
  });
  channel.bind('pusher:subscription_error', (err) => {
    console.log(err);
    sendResponse(false);
  });
}
