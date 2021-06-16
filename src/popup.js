window.onload = () => {
  chrome.storage.local.get(['listening', 'partyId', 'devPusher', 'serverBaseUrl'], (res) => {
    if (res.listening) {
      $('#partyId').val(res.partyId);
      dispParty();
    } else {
      $('#partyId').focus();
    }
    $.getJSON('../manifest.json', manifest => {
      $('#version').text(manifest.version);
    });
    $('#cbDevPusher').prop('checked', res.devPusher);
    $('#serverBaseUrl').val(res.serverBaseUrl);
  });
}

$('#switch').on('click', async (event) => {
  if ($('#switch').hasClass('in-party')) {
    closeParty();
    dispCloseParty();
  } else {
    dispLoading();

    const started = await startParty($('#partyId').val());

    if (started) {
      dispParty();
    } else {
      dispCloseParty();
      alert('Fail to auth.');
    };
  }
});

const dispParty = () => {
  $('#partyId').prop('disabled', true);
  $('#switch').text('CLOSE PARTY');
  $('#switch').prop('disabled', false);
  $('#switch').addClass('in-party');
  $('.container').addClass('color-bg-start bg-animate-color');
  $('#cbDevPusher').prop('disabled', true);
  $('#serverBaseUrl').prop('disabled', true);
}

const dispCloseParty = () => {
  $('#partyId').prop('disabled', false);
  $('#switch').text('START!!');
  $('#switch').prop('disabled', false);
  $('#switch').removeClass('in-party');
  $('.container').removeClass('color-bg-start bg-animate-color');
  $('#cbDevPusher').prop('disabled', false);
  $('#serverBaseUrl').prop('disabled', false);
}

const dispLoading = () => {
  $('#partyId').prop('disabled', true);
  $('#switch').text('STARTING...');
  $('#switch').prop('disabled', true);
  $('#switch').removeClass('in-party');
  $('.container').removeClass('color-bg-start bg-animate-color');
  $('#cbDevPusher').prop('disabled', true);
  $('#serverBaseUrl').prop('disabled', true);
}

const startParty = async (partyId) =>  {
  if (!validatePartyId(partyId)) {
    alert('Invalid PARTY ID!!');
    return;
  }

  return await listen(partyId);
}

const validatePartyId = (partyId) => {
  if (partyId.length != 15) { return false };

  const sum = partyId.slice(0, 14).split('').reduce((a, s) => a + parseInt(s, 36), 0)
  const cd = (sum).toString(36).slice(-1).toUpperCase();
  return partyId.slice(-1) == cd;
}

const listen = (partyId) => {
  const data = {
    to: 'background',
    action: 'pusherConnect',
    value: {
      partyId: partyId,
      devPusher: $('#cbDevPusher').prop('checked'),
      serverBaseUrl: $('#serverBaseUrl').val()
    }
  };

  return new Promise(function (resolve) {
    chrome.runtime.sendMessage(data, function(response) {
      console.log(response);
      if (response) {
        chrome.storage.local.set({ listening: true, partyId: partyId }, function() {
          console.log('Listening started: PARTY ID:' + partyId);
          resolve(true);
        });
      } else {
        resolve(false);
      }
    });
  });
};

const closeParty = () =>  {
  const data = {
    to: 'background',
    action: 'pusherDisconnect',
    value: ''
  };

  chrome.runtime.sendMessage(data, (res) => {
    if (!res) { return }
    chrome.storage.local.set({ listening: false, partyId: null }, () => {
      console.log('Listening end');
    });
  });
}


chrome.management.getSelf((me) => {
  if (me.installType === 'development') {
    $('#logo').on('click', async (event) => {
      $('.debug').toggleClass('hide');
    });
  }
})

$('#comment').on('click', () => {
  const data = {
    to: 'contentScript',
    action: 'messageSent',
    value: '&#x1F601;&#x1F481;&#x200D;&#x2640;&#xFE0F;<img class="emoji" style="max-height: 60px;" src="https://emoji.slack-edge.com/TCGD1EQ93/squirrel/465f40c0e0.png">あいうdehedehedehedehあいうedeheharo~'
  };
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, data, (response) => {});
  });
});

$('#cbDevPusher').on('change', () => {
  chrome.storage.local.set({ devPusher: $('#cbDevPusher').prop('checked') });
});

$('#serverBaseUrl').on('change', () => {
  chrome.storage.local.set({ serverBaseUrl: $('#serverBaseUrl').val() });
});
