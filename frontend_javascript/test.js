const fontContainer = document.getElementById("font-container");
if (fontContainer) {
  const boundClient = fontContainer.getBoundingClientRect();
  if (boundClient) {
    const { width, height } = boundClient;
    const widthEl = document.createElement('p');
    const heightEl = document.createElement('p'); 
    const heightSpan = document.createElement('span');
    const widthSpan = document.createElement('span');
    heightSpan.style.setProperty('font-weight','bold');
    heightSpan.innerText="Height: "
    widthSpan.style.setProperty('font-weight','bold');
    widthSpan.innerText="Width: ";
    heightEl.append(heightSpan);
    widthEl.append(widthSpan);
    const heightSpan2 = document.createElement('span');
    const widthSpan2 = document.createElement('span');
    heightSpan.id = "height";
    widthSpan.id = "width";
    
    fontContainer.insertAdjacentElement('afterend',widthEl);
    widthEl.insertAdjacentElement('afterend',heightEl);
  }
  
            
}