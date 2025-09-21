import * as THREE from 'three';
import { OrbitControls } from 'three/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/jsm/loaders/GLTFLoader.js';
import * as dat from 'dat-gui'

const monkeyURL = new URL('/static/rand-assets/monkey.glb',import.meta.url);


const INITIAL_WIDTH = 450; 
const INITIAL_HEIGHT = 450;
const canvas = document.getElementById('three-js-tut');
if (!!!canvas) throw new Error("Something went wrong getting the canvas.");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.shadowMap.enabled = true;
const scene = new THREE.Scene();


const camera = new THREE.PerspectiveCamera(
  75,
  1.0,
  0.1,
  1000
);
const orbit = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
camera.position.set(0,2,5);
orbit.update();

const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
const box = new THREE.Mesh(boxGeometry,boxMaterial);
scene.add(box);
const planeGeometry = new THREE.PlaneGeometry(30,30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry,planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;
scene.add(plane);

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const sphereGeometry = new THREE.SphereGeometry(4,50,50);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x00FFFF });
const sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
sphere.castShadow = true;
scene.add(sphere);

sphere.position.set(-10,10,0);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xFFFFFF,0.9);
// directionalLight.position.set(-30,50,0);
// directionalLight.castShadow = true;
// directionalLight.shadow.camera.bottom = -12;
// scene.add(directionalLight);

// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight,5);
// scene.add(dLightHelper);

// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShadowHelper);

const spotLight = new THREE.SpotLight(0xFF00FF,1);
spotLight.decay = 0;
scene.add(spotLight);
spotLight.position.set(-100,100,0);
spotLight.castShadow = true;
spotLight.angle = 0.2;

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);

// scene.fog = new THREE.Fog(0xFFFFFF,0,200);
scene.fog = new THREE.FogExp2(0xFFFFFF,0.01);

// renderer.setClearColor(0xFFEA00);
const textureLoader = new THREE.TextureLoader();
// scene.background = textureLoader.load('/static/rand-assets/stars.jpg');
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  '/static/rand-assets/nebula.jpg',
  '/static/rand-assets/nebula.jpg',
  '/static/rand-assets/stars.jpg',
  '/static/rand-assets/stars.jpg',
  '/static/rand-assets/stars.jpg',
  '/static/rand-assets/stars.jpg'
]);


const box2Geometry = new THREE.BoxGeometry(4,4,4);
const box2Material = new THREE.MeshBasicMaterial({
  // color: 0x00FF00,
  map: textureLoader.load('/static/rand-assets/nebula.jpg')
})
const newBox2Material = [
  new THREE.MeshBasicMaterial({ map: textureLoader.load('/static/rand-assets/stars.jpg') }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load('/static/rand-assets/stars.jpg') }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load('/static/rand-assets/nebula.jpg') }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load('/static/rand-assets/stars.jpg') }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load('/static/rand-assets/nebula.jpg') }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load('/static/rand-assets/stars.jpg') }),
]
const box2 = new THREE.Mesh(box2Geometry,newBox2Material);
scene.add(box2);
box2.position.set(0,2,10);

const plane2Geometry = new THREE.PlaneGeometry(10,10,10,10);
const plane2Material = new THREE.MeshBasicMaterial({
  color: 0xFFFFFF,
  wireframe: true
});
const plane2 = new THREE.Mesh(plane2Geometry,plane2Material);
scene.add(plane2);

const sphere2Geometry = new THREE.SphereGeometry(4);

const vShader = `
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fShader = `
    void main() {
        gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);
    }
`;

const sphere2Material = new THREE.ShaderMaterial({
  vertexShader: document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('fragmentShader').textContent
});

const sphere2 = new THREE.Mesh(sphere2Geometry,sphere2Material);
scene.add(sphere2);
sphere2.position.set(-5,10,10);


const assetLoader = new GLTFLoader();


assetLoader.load(monkeyURL.href,function(gltf) {
  const model = gltf.scene;
  scene.add(model);
  model.position.set(-12,4,10);
},undefined,function(error) {
  console.error(error);
})

plane2.position.set(10,10,15);

const guiContainer = document.getElementById('gui-container');

const gui = new dat.GUI();

guiContainer.append(gui.domElement);

const options = {
  sphereColor: '#ffea00',
  wireframe: false,
  speed: 0.01,
  angle: 0.2,
  penumbra: 0,
  intensity: 1,
  spotlightColor: '#ff00ff'
}
gui.addColor(options,'sphereColor').onChange(function(e) {
  sphere.material.color.set(e);
});
gui.add(options,'wireframe').onChange(function(e) {
  sphere.material.wireframe = e;
})
gui.add(options,'speed',0,0.1);

gui.add(options,'angle',0,1);
gui.add(options,'penumbra',0,1);
gui.add(options,'intensity',0,1);
gui.addColor(options,'spotlightColor').onChange(function(e) {
  spotLight.color.set(e);
})

renderer.render(scene,camera);

let step = 0;

const mousePosition = new THREE.Vector2();

canvas.addEventListener('mousemove',function(e) {
  var rect = canvas.getBoundingClientRect();

  mousePosition.x = ((e.clientX - rect.left)/rect.width) * 2 - 1;
  mousePosition.y = - ((e.clientY - rect.top)/rect.height) * 2 + 1;
})

const rayCaster = new THREE.Raycaster();

const sphereId = sphere.id;

box2.name = "theBox";

var LAST_COLOR = '';
var intersecting = false;

// **Render Loop (Fix for disappearing objects)**
function animate(time) {
  box.rotation.x = time/1000;
  box.rotation.y = time/1000;

  step+=options.speed;
  sphere.position.y = 10*Math.abs(Math.sin(step));

  spotLight.angle = options.angle;
  spotLight.penumbra = options.penumbra;
  spotLight.intensity = options.intensity;
  sLightHelper.update();

  rayCaster.setFromCamera(mousePosition,camera);
  const intersects = rayCaster.intersectObjects(scene.children);
  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.id===sphereId) {
      LAST_COLOR = intersects[i].object.material.color.getHex();
      intersecting = true;
      console.log(LAST_COLOR);
      intersects[i].object.material.color.set(0xFF0000);
    } else if (intersecting&&intersects[i].object.id===sphereId) {
      intersects[i].object.material.color.set(LAST_COLOR);
      intersecting = false;
    }
    if (intersects[i].object.name==="theBox") {
      intersects[i].object.rotation.x = time/1000;
      intersects[i].object.rotation.y = time/1000;
    }
  }

  plane2.geometry.attributes.position.array[0] = 10 * Math.random();
  plane2.geometry.attributes.position.array[1] = 10 * Math.random();
  plane2.geometry.attributes.position.array[2] = 10 * Math.random();
  const lastPointZ = plane2.geometry.attributes.position.array.length - 1;
  plane2.geometry.attributes.position.array[lastPointZ] = 10 * Math.random();
  plane2.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene,camera)
}
renderer.setAnimationLoop(animate);


function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
}

function onFullscreenChange(e) {
  const detail = e.detail;
  if (detail.el&&detail.el.id==="three-js-load-wrapper") {
    if (detail.fullscreen) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth,window.innerHeight);
      document.addEventListener('resize',onResize);
    } else {
      camera.aspect = 1.0;
      camera.updateProjectionMatrix();
      renderer.setSize(INITIAL_WIDTH,INITIAL_HEIGHT);
      document.removeEventListener('resize',onResize);
    }
  }
}
document.addEventListener("FULLSCREEN_CHANGE",onFullscreenChange);
