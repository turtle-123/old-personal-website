import * as THREE from 'three';
import { OrbitControls } from 'three/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/jsm/loaders/GLTFLoader.js';
/**
 * @type {HTMLCanvasElement}
 */
var canvas;
/**
 * @type {THREE.WebGLRenderer}
 */
var renderer;
/**
 * @type {THREE.Mesh<any, THREE.MeshBasicMaterial, THREE.Object3DEventMap>}
 */
var ASSET_MESH;
/**
 * @type {THREE.PerspectiveCamera}
 */
var camera 
/**
 * @type {THREE.Scene}
 */
var scene;
/**
 * @type {THREE.Vector2}
 */
var mousePosition;
const pathname_original = window.location.pathname;
const ASSET_URL = `https://cdn.storething.org/frankmbrown/assets-designs-games/b8251183-1137-4143-8a86-bae7c58f2c36.gltf`;
const INITIAL_WIDTH = 400; 
const INITIAL_HEIGHT = 400;


function onMouseMove(e) {
  var rect = canvas.getBoundingClientRect();

  mousePosition.x = ((e.clientX - rect.left)/rect.width) * 2 - 1;
  mousePosition.y = - ((e.clientY - rect.top)/rect.height) * 2 + 1;
}

function main_helper() {
  canvas = document.getElementById('main-canvas');
  if (!!!canvas) throw new Error("Something went wrong getting the canvas.");
  canvas.addEventListener('mousemove',onMouseMove);
  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.shadows = true;
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.toneMapping = 0;
  renderer.toneMappingExposure = 1
  renderer.useLegacyLights  = false;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0xffffff, 0);
  //make sure three/build/three.module.js is over r152 or this feature is not available. 
  renderer.outputColorSpace = THREE.SRGBColorSpace 


  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    1.0,
    0.1,
    1000
  );
  const orbit = new OrbitControls(camera, renderer.domElement);
  camera.position.set(0,2,5);
  orbit.update();
  
  const ambientLight = new THREE.AmbientLight(0x333333);
  scene.add(ambientLight);
  const assetLoader = new GLTFLoader();

  assetLoader.load(ASSET_URL,function(gltf ) {
    const model = gltf.scene;
    scene.add(model);

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Center the model
    model.position.sub(center);

    // Frame the model
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = maxDim / (2 * Math.tan(fov / 2));

    camera.position.set(0, 0, cameraZ * 1.5); // Add margin
    camera.lookAt(0, 0, 0);

    orbit.target.set(0, 0, 0);
    orbit.update();

  },undefined,function(error) {
    console.error(error);
  });

  renderer.render(scene,camera);
  mousePosition = new THREE.Vector2();
  const rayCaster = new THREE.Raycaster();
  // **Render Loop (Fix for disappearing objects)**
  const animate = function() {
    rayCaster.setFromCamera(mousePosition,camera);
    renderer.render(scene,camera)
  }
  renderer.setAnimationLoop(animate);
}

function main() {
  if (window.location.pathname===pathname_original) {
    setTimeout(() => {
      document.addEventListener("FULLSCREEN_CHANGE",onFullscreenChange);
      document.removeEventListener('resize',onResize);
      main_helper();
    },500);
  } else {
    document.removeEventListener('resize',onResize);
    document.removeEventListener("FULLSCREEN_CHANGE",onFullscreenChange);
  }
}


function onResize() {
  camera.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
}

function onFullscreenChange(e) {
  const detail = e.detail;
  if (detail.el&&detail.el.id==="main-canvas-wrapper") {
    if (detail.fullscreen) {
      camera.width = window.innerWidth;
      canvas.height = window.innerHeight;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth,window.innerHeight);
      renderer.domElement.style.width = `${window.innerWidth}px`;
      renderer.domElement.style.height = `${window.innerHeight}px`;

      document.addEventListener('resize',onResize);
    } else {
      camera.width = INITIAL_WIDTH;
      canvas.height = INITIAL_HEIGHT;
      camera.aspect = 1.0;
      camera.updateProjectionMatrix();
      renderer.setSize(INITIAL_WIDTH,INITIAL_HEIGHT);
      renderer.domElement.style.width = `${INITIAL_WIDTH}px`;
      renderer.domElement.style.height = `${INITIAL_WIDTH}px`;
      document.removeEventListener('resize',onResize);
    }
  }
}

document.addEventListener('htmx:pushedIntoHistory',main);
main();

