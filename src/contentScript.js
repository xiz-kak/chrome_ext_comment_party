chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    sendResponse(true);
    console.log(request);
    if (request.to == "contentScript") {
      if (request.action == "messageSent") {
        // TODO: random top (0~height);
        // TODO: calculated translateX
        // TODO: random duration (speed)
        let div = document.createElement("div");
        div.innerHTML= request.value;
        div.classList.add("commentText");
        div.style.position = "fixed";
        div.style.top = "100px";
        div.style.right = "-300px";
        div.style.fontSize = "-webkit-xxx-large";
        div.style.fontWeight = "500";
        div.style.textShadow = "0 0 3px #fff";
        div.style.zIndex = "99";
        document.body.appendChild(div);
        anime({
          targets: div,
          translateX: -1000,
          duration: 9000,
          easing: 'linear'
        });
      }
    }
  }
);
