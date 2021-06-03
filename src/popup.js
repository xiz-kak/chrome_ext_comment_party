window.onload = function(){
  chrome.storage.local.get(['listening', 'partyId', 'devPusher'], function(res) {
    if (res.listening) {
      $('#partyId').val(res.partyId);
      $('#partyId').prop('disabled', true);
      $('#switch').text('CLOSE PARTY');
      $('#switch').addClass('in-party');
      $('.container').addClass('color-bg-start').addClass('bg-animate-color');
      $('#cbDevPusher').prop('disabled', true);
    } else {
      $('#partyId').prop('disabled', false);
      $('#partyId').focus();
    }
    $('#cbDevPusher').prop('checked', res.devPusher);
    chrome.management.getSelf((me) => {
      if (me.installType === 'development') {
        $('.debug').removeClass('hide');
        $.getJSON('../manifest.json', manifest => {
          $('#version').text(manifest.version);
        });
      }
    })
  });
}

function validatePartyId(partyId) {
  if (partyId.length != 15) { return false };

  const cd = (parseInt(partyId.slice(0, 1), 36) + 1).toString(36).slice(-1).toUpperCase();
  return partyId.slice(-1) == cd;
}

$('#switch').on('click', async (event) => {
  if ($('#switch').hasClass('in-party')) {
    this.closeParty();
    $('#partyId').prop('disabled', false);
    $('#switch').text('START!!');
    $('#cbDevPusher').prop('disabled', false);
  } else {
    const started = await startParty($('#partyId').val());
    if (!started) { return };

    $('#partyId').prop('disabled', true);
    $('#switch').text('CLOSE PARTY');
    $('#cbDevPusher').prop('disabled', true);
  }

  $('#switch').toggleClass('in-party');

  var $page = $('.container');
  $page.toggleClass('color-bg-start')
    .toggleClass('bg-animate-color');
});

async function startParty(partyId) {
  if (!validatePartyId(partyId)) {
    alert('Invalid PARTY ID!!');
    return;
  }

  return await listen(partyId);
}

function closeParty() {
  const data = {
    to: 'background',
    action: 'pusherDisconnect',
    value: ''
  };

  chrome.runtime.sendMessage(data, function(response) {
    console.log(response);
    chrome.storage.local.set({ listening: false, partyId: null }, function() {
      console.log('Listening end');
    });
  });
}

function listen(partyId) {
  const data = {
    to: 'background',
    action: 'pusherConnect',
    value: { partyId: partyId, devPusher: $('#cbDevPusher').prop('checked') }
  };

  return new Promise(function (resolve) {
    chrome.runtime.sendMessage(data, function(response) {
      console.log(response);
      chrome.storage.local.set({ listening: true, partyId: partyId }, function() {
        console.log('Listening started: PARTY ID:' + partyId);
        resolve(true);
      });
    });
  });
};

let btnComment = document.getElementById('comment');
btnComment.addEventListener('click', async () => {
  const data = {
    to: 'contentScript',
    action: 'messageSent',
    value: '&#x1F601;&#x1F481;&#x200D;&#x2640;&#xFE0F;<img class="emoji" style="max-height: 60px;" src="https://emoji.slack-edge.com/TCGD1EQ93/squirrel/465f40c0e0.png">あいうdehedehedehedehあいうedeheharo~'
  };
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, data, function(response) {});
  });
});

$('#cbDevPusher').on('change', () => {
  chrome.storage.local.set({ devPusher: $('#cbDevPusher').prop('checked') }, () => {});
});
