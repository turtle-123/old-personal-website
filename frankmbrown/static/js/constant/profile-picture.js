/**
 * Use this script to handle uploading profile pictures
 * There should only be one profile picture input per page
 * There should be a hidden input element in the form that allows you to update 
 */
/**
 * @typedef {[number,number]|number} BorderType
 */
/**
 * @typedef {Object} ImageState
 * @property {number} x
 * @property {number} y 
 * @property {number} [width]
 * @property {number} [height] 
 * @property {HTMLImageElement} [resource]
 */
/**
 * @typedef {Object} Props
 * @property {number} width - The width of the component.
 * @property {number} height - The height of the component.
 * @property {CSSProperties} [style] - Optional styling properties.
 * @property {string | File} [image] - Optional image source as a URL or File object.
 * @property {BorderType} [border] - Optional border type.
 * @property {Position} [position] - Optional position data.
 * @property {number} [scale] - Optional scale factor.
 * @property {number} [rotate] - Optional rotation angle.
 * @property {number} [borderRadius] - Optional border radius.
 * @property {'' | 'anonymous' | 'use-credentials'} [crossOrigin] - Optional cross-origin setting.
 * @property {() => void} [onLoadFailure] - Callback for load failure.
 * @property {(image: ImageState) => void} [onLoadSuccess] - Callback for successful load.
 * @property {() => void} [onImageReady] - Callback for when the image is ready.
 * @property {() => void} [onImageChange] - Callback for when the image changes.
 * @property {() => void} [onMouseUp] - Callback for mouse-up events.
 * @property {(e: TouchEvent | MouseEvent) => void} [onMouseMove] - Callback for mouse-move events.
 * @property {(position: Position) => void} [onPositionChange] - Callback for position change.
 * @property {[number, number, number, number?]} [color] - Optional color array in RGBA format.
 * @property {string} [backgroundColor] - Optional background color.
 * @property {boolean} [disableBoundaryChecks] - Optional flag to disable boundary checks.
 * @property {boolean} [disableHiDPIScaling] - Optional flag to disable high-DPI scaling.
 * @property {boolean} [disableCanvasRotation] - Optional flag to disable canvas rotation.
 */
/**
 * @typedef {Object} Position 
 * @property {number} x
 * @property {number} y 
 */
/**
 * @typedef {Object} State 
 * @property {number} [mx]
 * @property {number} [my]
 * @property {ImageState} ImageState
 */
const BORDER_SIZE = 25;
const props = {
  scale: 1,
  rotate: 0,
  border: BORDER_SIZE,
  borderRadius: 125,
  width: 200,
  height: 200,
  color: [0, 0, 0, 0.5],
  showGrid: false,
  gridColor: '#666',
  disableBoundaryChecks: false,
  disableHiDPIScaling: false,
  disableCanvasRotation: false
}
const defaultEmptyImage = {
  x: 0.5,
  y: 0.5,
}
/**
 * @type {State}
 */
const state = {
  drag: false,
  my: undefined,
  mx: undefined,
  image: defaultEmptyImage,
}
const pixelRatio = typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1;

const isVertical = () => {
  return props.rotate % 100 !== 0;
}
 
/**
 * Draws a rounded rectangle on a 2D context
 * @param {CanvasRenderingContext2D} context 
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 * @param {number} height 
 * @param {number} borderRadius 
 */
function drawRoundedRect(context,x,y,width,height,borderRadius) {
  if (borderRadius === 0) {
    context.rect(x, y, width, height)
  } else {
    const widthMinusRad = width - borderRadius
    const heightMinusRad = height - borderRadius
    context.translate(x, y)
    context.arc(
      borderRadius,
      borderRadius,
      borderRadius,
      Math.PI,
      Math.PI * 1.5,
    )
    context.lineTo(widthMinusRad, 0)
    context.arc(
      widthMinusRad,
      borderRadius,
      borderRadius,
      Math.PI * 1.5,
      Math.PI * 2,
    )
    context.lineTo(width, heightMinusRad)
    context.arc(
      widthMinusRad,
      heightMinusRad,
      borderRadius,
      Math.PI * 2,
      Math.PI * 0.5,
    )
    context.lineTo(borderRadius, height)
    context.arc(
      borderRadius,
      heightMinusRad,
      borderRadius,
      Math.PI * 0.5,
      Math.PI,
    )
    context.translate(-x, -y)
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
const isPassiveSupported = () => {
  let passiveSupported = false
  try {
    const options = Object.defineProperty({}, 'passive', {
      get: function () {
        passiveSupported = true
      },
    })

    const handler = () => {}
    window.addEventListener('test', handler, options)
    window.removeEventListener('test', handler, options)
  } catch (err) {
    passiveSupported = false
  }
  return passiveSupported
}


function resetState(output) {
  output.innerHTML = '';
  output.removeAttribute('style');
  defaultEmptyImage.x = 0.5;
  defaultEmptyImage.y = 0.5;
  props.scale=1;
  props.rotate=0;
  props.border=BORDER_SIZE;
  props.borderRadius=125;
  props.width=200;
  props.height=200;
  props.color=[0, 0, 0, 0.5];
  props.showGrid=false;
  props.gridColor='#666';
  props.disableBoundaryChecks=false;
  props.disableHiDPIScaling=false;
  props.disableCanvasRotation=false;
  state.drag=false,
  state.my=undefined,
  state.mx=undefined,
  state.image=defaultEmptyImage;
  delete props.backgroundColor;
}

var initial = true;
const isTouchDevice = typeof window !== 'undefined' && typeof navigator !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
const profilePicInput = document.querySelector('input[data-image-input][data-profile-picture]');
if (profilePicInput) {
  const id = profilePicInput.id;
  const output = document.querySelector(`output[for="${id}"]`);
  if (output) {
    const handleMediaUploadComplete = (e) => {
      if (profilePicInput.hasAttribute('data-ignore')) {
        if (e.detail&&e.detail.uploads.length&&e.detail.uploads[0]&&e.detail.uploads[0].url) {
          const url = e.detail.uploads[0].url;
          const input = document.getElementById('profile-picture-text');
          if (input) {
            input.value = String(url);
            if (!!!initial) input.dispatchEvent(new Event("change"));
          }
          profilePicInput.removeAttribute('data-ignore');
          const div = document.createElement('div');
          const src = url;
          div.innerHTML=`<img alt="Profile Picture Preview" style="width:200px;height:200px;border-radius: 50%; object-fit: 50% 50%; object-fit: none;" width="200" height="200" data-text="" src="${src}" />`;
          div.className="flex-row justify-center mt-2";
          output.append(div);
        }
        if (initial) initial = false;
      } else {
        resetState(output);
        if (e.detail&&e.detail.uploads.length&&e.detail.uploads[0]&&e.detail.uploads[0].url) {
          output.setAttribute('style',"padding: 4px; border: 2px solid var(--divider); vorder-radius: 3px; margin-top: 4px;");
          const url = e.detail.uploads[0].url;
          const div = document.createElement('div');
          div.className="mt-1 flex-row justify-center";
          const zoomDiv = document.createElement('div');
          const ZOOM_MIN = 0.6;
          const ZOOM_MAX = 2.6;
          zoomDiv.innerHTML = `<label for="zoom-profile-pic" class="mt-2">Zoom:</label><input name="zoom-profile-pic" type="range" min="${ZOOM_MIN}" max="${ZOOM_MAX}" value="1" step="0.1" style="background-size: 18.75% 100%;">`;
          const div2 = document.createElement('div');
          div2.className="mt-2 flex-row justify-between";
          const confirmButton = document.createElement('button');
          confirmButton.setAttribute('type','button');
          confirmButton.className="icon-text filled info medium";
          confirmButton.innerHTML=`<svg viewBox="0 0 448 512" title="check" focusable="false" inert tabindex="-1"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path></svg>
          CONFIRM`;
          const previewButton = document.createElement('button');
          previewButton.setAttribute('type','button');
          previewButton.className="icon-text filled secondary medium";
          previewButton.innerHTML=`<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="RemoveRedEye"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>
          PREVIEW`;
          div2.append(previewButton,confirmButton);
          const p = document.createElement('p');
          p.className = "mt-2";
          p.innerText = "";
          const canvas = document.createElement('canvas');
          canvas.className="mt-2";
          canvas.style.setProperty("margin","8px auto 0px auto");
          canvas.style.setProperty('touch-action','none');
          canvas.style.setProperty('cursor','grab');
          canvas.width = props.width+props.border*2;
          canvas.height = props.height+props.border*2;
          const editDiv = document.createElement('div');
          editDiv.className="flex-row justify-start align-start gap-2";
          const colorInputDiv = document.createElement('div');
          colorInputDiv.className = "shrink-0";
          colorInputDiv.innerHTML = `<label class="body2" for="canvas-bg-color">Background Color:</label>
  <div class="flex-row justify-begin align-center gap-2">
    <input type="color" name="canvas-bg-color" id="canvas-bg-color" value="#000000" style="margin-top: 2px;">
    <span class="body2">#000000</span>
  </div>`;
          const rotationDiv = document.createElement('div');
          rotationDiv.className = "grow-1";
          rotationDiv.innerHTML=`<label for="rot-profile-pic" class="body2">Rotation:</label><input name="rot-profile-pic" type="range" min="0" max="100" value="0" step="1" style="background-size: 0% 100%;" class="primary">`;
          
          editDiv.append(colorInputDiv,rotationDiv);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            
            const getBorders = () => {
              return [BORDER_SIZE,BORDER_SIZE];
            }
            
            const getDimensions = () => {
              const { width, height, rotate, border } = props
              const canvas = { width: 0, height: 0 }
              const [borderX, borderY] = getBorders(border)
              if (isVertical()) {
                canvas.width = height
                canvas.height = width
              } else {
                canvas.width = width
                canvas.height = height
              }
              canvas.width += borderX * 2
              canvas.height += borderY * 2
              return {
                canvas,
                rotate,
                width,
                height,
                border,
              }
            }

            const getInitialSize = (width,height) => {
              /**
               * @type {number}
               */
              let newHeight;
              /**
               * @type {number}
               */
              let newWidth;
              const dimensions = getDimensions();
              const canvasRatio = dimensions.height / dimensions.width;
              const imageRatio = height / width;
              if (canvasRatio > imageRatio) {
                newHeight = dimensions.height
                newWidth = width * (newHeight / height)
              } else {
                newWidth = dimensions.width
                newHeight = height * (newWidth / width)
              }
          
              return {
                height: newHeight,
                width: newWidth,
              }
            }

            const clearImage = () => {
              ctx.clearRect(0,0,canvas.width,canvas.height);
              state.image = defaultEmptyImage;
            }

            

            const calculatePosition = (image=state.image,border=BORDER_SIZE) => {
              const [borderX, borderY] = [BORDER_SIZE,BORDER_SIZE];
              if (!image.width || !image.height) {
                throw new Error('Image dimension is unknown.')
              }
              const croppingRect = getCroppingRect()
              const width = image.width * props.scale;
              const height = image.height * props.scale;
              let x = -croppingRect.x * width;
              let y = -croppingRect.y * height;
              if (isVertical()) {
                x += borderY
                y += borderX
              } else {
                x += borderX
                y += borderY
              }
              return { x, y, height, width };
            }

            /** 
             * @param {CanvasRenderingContext2D} ctx 
             */
            const paint = (ctx) => {
              ctx.save();
              ctx.scale(pixelRatio,pixelRatio)
              ctx.translate(0, 0)
              ctx.fillStyle = 'rgba(' + props.color.slice(0, 4).join(',') + ')';
              let borderRadius = props.borderRadius
              const dimensions = getDimensions()
              const [borderSizeX, borderSizeY] = getBorders(dimensions.border)
              const height = dimensions.canvas.height
              const width = dimensions.canvas.width

              // clamp border radius between zero (perfect rectangle) and half the size without borders (perfect circle or "pill")
              borderRadius = Math.max(borderRadius, 0)
              borderRadius = Math.min(
                borderRadius,
                width / 2 - borderSizeX,
                height / 2 - borderSizeY,
              )
              const context = ctx;
              context.beginPath()
              // inner rect, possibly rounded
              drawRoundedRect(context,borderSizeX,borderSizeY,width - borderSizeX * 2,height - borderSizeY * 2,borderRadius);
              context.rect(width, 0, -width, height) // outer rect, drawn "counterclockwise"
              context.fill('evenodd')
              context.restore()
            }
            const paintImage = (context,image,border,scaleFactor=pixelRatio) => {
              if (!image.resource) return;
              const position = calculatePosition(image, border);
              context.save()

              context.translate(context.canvas.width / 2, context.canvas.height / 2)
              const rotation = (props.rotate * Math.PI) / 180;
              context.rotate(rotation);
              context.translate(-(context.canvas.width / 2), -(context.canvas.height / 2))

              if (isVertical()) {
                context.translate(
                  (context.canvas.width - context.canvas.height) / 2,
                  (context.canvas.height - context.canvas.width) / 2,
                )
              }

              context.scale(scaleFactor, scaleFactor)

              context.globalCompositeOperation = 'destination-over'
              context.drawImage(
                image.resource,
                position.x,
                position.y,
                position.width,
                position.height,
              )

              if (props.backgroundColor) {
                context.scale(1/scaleFactor,1/scaleFactor);
                context.rotate(0);
                context.fillStyle = props.backgroundColor
                context.fillRect(0, 0, context.canvas.width, context.canvas.height)
              }

              context.restore()
            }
            const updateCanvas = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              paint(ctx);
              paintImage(ctx,state.image,BORDER_SIZE,props.scale);
            }

            const getImage = () => {
              return canvas
            }

            
            const getXScale = () => {
              if (!!!state.image.width||!!!state.image.height) throw new Error("Image Dimension is unkown");
              const canvasAspect = props.width / props.height
              const imageAspect = state.image.width / state.image.height

              return Math.min(1, canvasAspect / imageAspect)
            }
            const getYScale = () => {
              if (!!!state.image.width||!!!state.image.height) throw new Error("Image Dimension is unkown");
              const canvasAspect = props.height / props.width
              const imageAspect = state.image.height / state.image.width

              return Math.min(1, canvasAspect / imageAspect)
            }
            const getCroppingRect = () => {
              const position = props.position || { x: state.image.x, y: state.image.y };
              const width = (1 / props.scale) * getXScale()
              const height = (1 / props.scale) * getYScale()
              const croppingRect = {
                x: position.x - width / 2,
                y: position.y - height / 2,
                width,
                height,
              }
              let xMin = 0;
              let xMax = 1 - croppingRect.width;
              let yMin = 0;
              let yMax = 1 - croppingRect.height;
              const isLargerThanImage = props.disableBoundaryChecks || width > 1 || height > 1;
              if (isLargerThanImage) {
                xMin = -croppingRect.width;
                xMax = 1;
                yMin = -croppingRect.height;
                yMax = 1;
              }
              return {
                ...croppingRect,
                x: Math.max(xMin, Math.min(croppingRect.x, xMax)),
                y: Math.max(yMin, Math.min(croppingRect.y, yMax)),
              }
            }
            const onMoveStart = (e) => {
              if (!!!isTouchDevice) e.preventDefault();
              state.drag = true;
              canvas.style.setProperty('cursor','grabbing');
            }
            /**
             * 
             * @param {MouseEvent|TouchEvent} e 
             */
            const onMove = (e) => {
              if (!!!state.drag) return;
              e.preventDefault();
              const mousePositionX = 'targetTouches' in e ? e.targetTouches[0].pageX : e.clientX;
              const mousePositionY = 'targetTouches' in e ? e.targetTouches[0].pageY : e.clientY;
              let rotate = props.rotate;
              rotate %= 360;
              rotate = rotate < 0 ? rotate + 360 : rotate;
              if (state.mx&&state.my&&state.image.width&&state.image.height) {
                const mx = state.mx - mousePositionX;
                const my = state.my - mousePositionY;
                const width = state.image.width * props.scale;
                const height = state.image.height * props.scale;
                let { x: lastX, y: lastY } = getCroppingRect();
                lastX *= width
                lastY *= height
                // helpers to calculate vectors
                const toRadians = (degree) => degree * (Math.PI / 180)
                const cos = Math.cos(toRadians(rotate))
                const sin = Math.sin(toRadians(rotate))
                const x = lastX + mx * cos + my * sin
                const y = lastY + -mx * sin + my * cos
                const relativeWidth = (1/props.scale) * getXScale()
                const relativeHeight = (1/props.scale) * getYScale()
                const position = {
                  x: x / width + relativeWidth / 2,
                  y: y / height + relativeHeight / 2,
                }
                state.image.x = position.x;
                state.image.y = position.y;
                updateCanvas();
              }
              state.mx = mousePositionX;
              state.my = mousePositionY;
            }
            const onMoveEnd = (e) => {
              if (state.drag) state.drag = false;
              canvas.style.setProperty('cursor','grab');
            }
            const options = isPassiveSupported() ? { passive: false } : false;
            if (isTouchDevice) {
              canvas.addEventListener('touchstart',onMoveStart);
              canvas.addEventListener('touchmove',onMove, options)
              canvas.addEventListener('touchend',onMoveEnd, options)
            } else {
              canvas.addEventListener('mousedown',onMoveStart);
              canvas.addEventListener('mousemove',onMove, options)
              canvas.addEventListener('mouseup',onMoveEnd, options)
              canvas.addEventListener('mouseout',onMoveEnd, options)
            } 
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.src = url;
            image.onload = () => {
              //handleImageReady
              const imageState = {
                ...getInitialSize(image.width, image.height),
                resource: image,
                x: 0.5,
                y: 0.5
              }
              state.drag = false; 
              state.image = imageState;
              updateCanvas();
            }

            /**
             * @type {HTMLInputElement|null}
             */
            const colorInput = colorInputDiv.querySelector('input[type="color"]');
            const onColorInputChange = () => {
              const colorValue = colorInput.value;
              props.backgroundColor = colorValue;
              updateCanvas()
            }
            if (colorInput) {
              colorInput.addEventListener('input',onColorInputChange);
              colorInput.addEventListener('change',onColorInputChange);
            }

            /**
             * @type {HTMLInputElement|null}
             */
            const zoomInput = zoomDiv.querySelector('input[type="range"]');
            if (zoomInput) {
              const handleZoomChange = (e) => {
                const zoomValue = parseFloat(zoomInput.value);
                if (Number.isFinite(zoomValue)&&!!!isNaN(zoomValue)&&zoomValue>=ZOOM_MIN&&zoomValue<=ZOOM_MAX) {
                  props.scale = zoomValue;
                  updateCanvas()
                }
              }
              zoomInput.addEventListener('input',handleZoomChange);
              zoomInput.addEventListener('change',handleZoomChange);
            }
            /**
             * @type {HTMLInputElement|null}
             */
            const rotationInput = rotationDiv.querySelector('input[type="range"]');
            if (rotationInput) {
              const handleRotationChange = (e) => {
                const rotationValue = parseInt(rotationInput.value);
                if (Number.isInteger(rotationValue)&&rotationValue>=1&&rotationValue<=100) {
                  props.rotate = parseInt(rotationValue * 3.6);
                  updateCanvas();
                }
              }
              rotationInput.addEventListener('input',handleRotationChange);
              rotationInput.addEventListener('change',handleRotationChange);
            }
            
            previewButton.addEventListener('click',() => {
              const image = document.getElementById('profile-picture-preview-image');
              const dialog = document.getElementById('preview-image-dialog');
              if (dialog&&image) {
                const imageToShowCanvas = getImage();
                const dataURL = imageToShowCanvas.toDataURL();
                image.src = dataURL;
                document.dispatchEvent(new CustomEvent("OPEN_DIALOG",{ detail: { dialog: dialog }}));
                updateCanvas();
              } 
            });
            confirmButton.addEventListener('click',() => {
              const can = getImage();
              can.toBlob((blob) => {
                const file = new File([blob],"profile-pic.png",{lastModified: new Date().getTime(),type: blob.type});
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                profilePicInput.files = dataTransfer.files;
                profilePicInput.setAttribute('data-ignore','');
                profilePicInput.dispatchEvent(new Event("change"));
                resetState(output);
              });

            });
            div.append(canvas);
            output.append(div,zoomDiv,editDiv,div2,p);
            document.dispatchEvent(new CustomEvent("NEW_CONTENT_LOADED"));
          }
        }
      }
    }

    profilePicInput.addEventListener('media-upload-complete',handleMediaUploadComplete);
  }
  
}
