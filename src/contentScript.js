chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    sendResponse(true);
    console.log(request);
    if (request.to == "contentScript") {
      if (request.action == "messageSent") {
        const clientH = document.documentElement.clientHeight;
        const textTop = Math.floor((clientH * 0.8) * Math.random());

        let div = document.createElement("div");
        div.innerHTML= request.value;
        div.classList.add("commentText");
        div.style.position = "fixed";
        div.style.top = `${ textTop }px`;
        div.style.fontSize = "-webkit-xxx-large";
        div.style.fontWeight = "500";
        div.style.textShadow = "0 0 3px #fff";
        div.style.zIndex = "99";
        document.body.appendChild(div);

        const textW = div.clientWidth;
        div.style.right = `-${ textW }px`;

        const clientW = document.documentElement.clientWidth;

        anime({
          targets: div,
          translateX: -(clientW+textW),
          duration: 10000,
          easing: 'linear',
          complete: function(anim) {
            div.parentElement.removeChild(div);
          }
        });
      }
    }
  }
);
