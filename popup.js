
// Initialize butotn with users's prefered color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setPageBackgroundColor,
  });
});

// The body of this function will be execuetd as a content script inside the
// current page
function setPageBackgroundColor() {
  chrome.storage.sync.get("color", ({ color }) => {
    document.body.style.backgroundColor = color;
  });
}


let runComment = document.getElementById("runComment");

runComment.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: runCommentOnScreen,
  });
});

function runCommentOnScreen() {
  let div = document.createElement("div");
  div.innerHTML="コメントだよー";
  div.classList.add("commentText");
  div.style.position = "fixed";
  div.style.top = "100px";
  div.style.right = "-300px";
  div.style.fontSize = "-webkit-xxx-large";
  div.style.fontWeight = "500";
  div.style.textShadow = "0 0 3px #fff";
  document.body.appendChild(div);
  anime({
    targets: div,
    translateX: -1000,
    duration: 9000,
    easing: 'linear'
  });
}
