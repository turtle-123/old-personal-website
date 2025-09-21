const getErrorAlert = (str,svg=undefined,includeButton=true) => {
  return /*html*/`
    <div class="alert icon error filled medium mt-1" role="alert">
      ${svg ? svg : `<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Error"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>`}
      <p class="alert">
        ${str}
      </p>
      ${includeButton?`
    <button aria-label="Close Alert" class="icon medium close-alert" type="button">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
    </button>
  </div>`:``}
    </div>
  `;
}

/* ------------------------- a-b ------------------  */
function loadAudioOutputDevices() {
  const output = document.getElementById('media-devices-output');
  if (navigator.mediaDevices.selectAudioOutput&&output) {
    navigator.mediaDevices.selectAudioOutput()
    .then((res) => {
      console.log(res);
      const pre = document.createElement('pre');
      pre.innerText = JSON.stringify(res,null,' ');
      output.append(pre);
    })
  } else if (output) {
    output.innerHTML = getErrorAlert("navigator.mediaDevices.selectAudioOutput does not exist.");
  }
  console.log(output);
}

function loadWebApisAB() {
  loadAudioOutputDevices();

}
function unloadWebApisAB() {

}

/* ------------------------- c-c ------------------  */
function loadWebApisCC() {

}
function unloadWebApisCC() {

}


/* ------------------------- d-f ------------------  */
function loadWebApisDF() {

}
function unloadWebApisDF() {

}


/* ------------------------- g-i ------------------  */
function loadWebApisGI() {

}
function unloadWebApisGI() {

}


/* ------------------------- k-p ------------------  */
function loadWebApisKP() {

}
function unloadWebApisKP() {

}


/* ------------------------- r-s ------------------  */
function loadWebApisRS() {

}
function unloadWebApisRS() {

}


/* ------------------------- t-v ------------------  */
function loadWebApisTV() {

}
function unloadWebApisTV() {

}


/* ------------------------- w-w ------------------  */
function loadWebApisWW() {

}
function unloadWebApisWW() {

}

const FUNCTIONS_ARRAY = [
  { key: "a-b", load: loadWebApisAB, unload: unloadWebApisAB },
  { key: "c-c", load: loadWebApisCC, unload: unloadWebApisCC },
  { key: "d-f", load: loadWebApisDF, unload: unloadWebApisDF },
  { key: "g-i", load: loadWebApisGI, unload: unloadWebApisGI },
  { key: "k-p", load: loadWebApisKP, unload: unloadWebApisKP },
  { key: "r-s", load: loadWebApisRS, unload: unloadWebApisRS },
  { key: "t-v", load: loadWebApisTV, unload: unloadWebApisTV },
  { key: "w-w", load: loadWebApisWW, unload: unloadWebApisWW }
]


function onWebApisLoad() {
  const pathname = window.location.pathname;
  var key;
  if (pathname.startsWith('/projects/web-apis/a-b')) {
    key = "a-b";
  } else if (pathname.startsWith('/projects/web-apis/c-c')) {
    key = "c-c";
  } else if (pathname.startsWith('/projects/web-apis/d-f')) {
    key = "d-f";
  } else if (pathname.startsWith('/projects/web-apis/g-i')) {
    key = "g-i";
  } else if (pathname.startsWith('/projects/web-apis/k-p')) {
    key = "k-p";
  } else if (pathname.startsWith('/projects/web-apis/r-s')) {
    key = "r-s";
  } else if (pathname.startsWith('/projects/web-apis/t-v')) {
    key = "t-v";
  } else if (pathname.startsWith('/projects/web-apis/w-w')) {
    key = "w-w";
  }
  for (let obj of FUNCTIONS_ARRAY) {
    if (obj.key===key) obj.load();
    else obj.unload();
  }
}
onWebApisLoad();
function onWebApisUnload() {
  for (let obj of FUNCTIONS_ARRAY) {
    obj.unload();
  }
}