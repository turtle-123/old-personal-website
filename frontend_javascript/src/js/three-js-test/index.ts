import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { LDrawLoader } from 'three/examples/jsm/loaders/LDrawLoader.js';
import { LUT3dlLoader } from 'three/examples/jsm/loaders/LUT3dlLoader.js';
import { LUTCubeLoader } from 'three/examples/jsm/loaders/LUTCubeLoader.js';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';
import { PDBLoader } from 'three/examples/jsm/loaders/PDBLoader.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import type { Texture, Vector2, ColorRepresentation, MeshPhysicalMaterialParameters } from 'three';

window.THREE = THREE;

const RENDERERS:{[id: string]: THREE.WebGLRenderer} = {};
type FILE_TYPE_TO_LOADER_TYPE = {
  ".fbx": undefined|FBXLoader,
  ".obj": undefined|OBJLoader,
  ".stl": undefined|STLLoader,
  ".3mf": undefined|ThreeMFLoader,
  ".ply": undefined|PLYLoader,
  ".3dm": undefined|Rhino3dmLoader,
  ".drc": undefined|DRACOLoader,
  ".gltf": undefined|GLTFLoader,
  ".glb": undefined|GLTFLoader,
  ".mpd": undefined|LDrawLoader,
  ".3dl": undefined|LUT3dlLoader,
  ".cube": undefined|LUTCubeLoader,
  ".pmd": undefined|MMDLoader,
  ".pmx": undefined|MMDLoader,
  ".vmd": undefined|MMDLoader,
  "./examples/jsm/": undefined|MMDLoader,
  ".pcd": undefined|PCDLoader,
  ".pdb": undefined|PDBLoader,
  ".svg": undefined|SVGLoader
}
const FILE_TYPE_TO_LOADER:FILE_TYPE_TO_LOADER_TYPE = {
  ".fbx": undefined,
  ".obj": undefined,
  ".stl": undefined,
  ".3mf": undefined,
  ".ply": undefined,
  ".3dm": undefined,
  ".drc": undefined,
  ".gltf": undefined,
  ".glb": undefined,
  ".mpd": undefined,
  ".3dl": undefined,
  ".cube": undefined,
  ".pmd": undefined,
  ".pmx": undefined,
  ".vmd": undefined,
  "./examples/jsm/": undefined,
  ".pcd": undefined,
  ".pdb": undefined,
  ".svg": undefined
};


const THREE_ACCEPT_FILE_TYPE = ".fbx,.obj,.stl,.3mf,.ply,.3dm,.drc,.gltf,.glb,.mpd,.3dl,.cube,.pmd,.pmx,.vmd,./examples/jsm/,.pcd,.pdb,.svg";
const VALID_HEX_REGEX = /^#[0-9A-F]{6}$/i;
/* ---------------------------------------- Helper Functions ------------------------------ */
/**
 * get default primary color
 * @returns 
 */
const getDefaultPrimaryColor = () => {
  const html = document.querySelector('html') as HTMLElement|null;
  var primary = '#004da3';
  if (html) {
    const mode = html.getAttribute('data-mode');
    if (mode==='light'){
      const primaryInput = document.getElementById('primary-light-settings-color') as HTMLInputElement|null;
      if(primaryInput) primary = primaryInput.value;
    } else if (mode==='dark') {
      const primaryInput = document.getElementById('primary-dark-settings-color') as HTMLInputElement|null;
      if(primaryInput) primary = primaryInput.value;
    }
  }
  return primary;
}
/**
 * Get default text color
 * @returns 
 */
const getDefaultTextColor = () => {
  const html = document.querySelector('html') as HTMLElement|null;
  var textColor = '#000000';
  if (html) {
    const mode = html.getAttribute('data-mode');
    if (mode==='light'){
      const textColorInput = document.getElementById('textColor-light-settings-color') as HTMLInputElement|null;
      if (textColorInput) textColor = textColorInput.value;
    } else if (mode==='dark') {
      const textColorInput = document.getElementById('textColor-dark-settings-color') as HTMLInputElement|null;
      if (textColorInput) textColor = textColorInput.value;
    }
  }
  return textColor;
}
/**
 * Get default background color
 * @returns 
 */
const getDefaultBackgroundColor = () => {
  const html = document.querySelector('html') as HTMLElement|null;
  var background = '#ffffff';
  if (html) {
    const mode = html.getAttribute('data-mode');
    if (mode==='light'){
      const backgroundInput = document.getElementById('background-light-settings-color') as HTMLInputElement|null;
      if (backgroundInput) background = backgroundInput.value;
    } else if (mode==='dark') {
      const backgroundInput = document.getElementById('background-dark-settings-color') as HTMLInputElement|null;
      if (backgroundInput) background = backgroundInput.value;
    }
  }
  return background;
}
/**
 * Is the input a floating point number
 * @param num 
 * @returns 
 */
function isValidFloat(num:any) {
  return Boolean(typeof num==='number' && isFinite(num) && !!!isNaN(num));
}


/* ------------------------------ Handle 3D File Uploads -------------------------------- */
/**
 * When a three-dimensional object is uploaded to the file input and it is uploaded to the database, get the html below and insert after the three-js object in the <output> tag 
 * then listen for changes to the form and change the material appearance accordingly
 * @param inputName 
 * @returns 
 */
function getEditThreeJSObjectHTML(inputName:string) {
  const rand = Math.random().toString().slice(2);
  const primary =  getDefaultPrimaryColor();
  const background = getDefaultBackgroundColor();
  const textColor = getDefaultTextColor();
  return /*html*/`<details data-input="${inputName}" aria-label="Edit ThreeD Model Appearance" class="mt-2">
  <summary>
    <span class="h6 fw-regular">Edit 3D Model Appearance</span>
    <svg class="details" focusable="false" inert viewBox="0 0 24 24">
      <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
      </path>
    </svg>
  </summary>
  <div class="accordion-content" aria-hidden="true" data-form>
    <div class="flex-row gap-2 w-100">
      <fieldset class="grow-1">
        <legend class="h6 bold">Scene</legend>
        <label class="body2" for="ambient_light_${rand}">Ambient Light:</label>
        <div class="flex-row justify-begin align-center gap-2">
          <input type="color" name="ambient_light_${rand}" id="ambient_light_${rand}" value="${background}" style="margin-top: 2px;">
          <span class="body2">${background}</span>
        </div>

        <label class="checkbox mt-2">
        <input type="checkbox" class="primary" name="add_scene_fog" id="add_scene_fog">
          Add Scene Fog
        </label>

        <label class="body2 mt-1" for="scene_fog_color_${rand}">Scene Fog Color:</label>
        <div class="flex-row justify-begin align-center gap-2">
          <input type="color" name="scene_fog_color_${rand}" id="scene_fog_color_${rand}" value="${primary}" style="margin-top: 2px;">
          <span class="body2">${primary}</span>
        </div>
      </fieldset>
      <fieldset class="grow-1">
        <legend class="h6 bold">Material</legend>
        <label class="checkbox">
        <input type="checkbox" class="secondary" name="three_material_transparent_${rand}" id="three_material_transparent_${rand}">
          Transparent
        </label>

        <label for="three_material_opacity_${rand}" class="mt-1">Opacity:</label>
        <input name="three_material_opacity_${rand}" id="three_material_opacity_${rand}" type="range" min="0" max="1" value="1" step="0.01" style="background-size: 100% 100%;">

        <label class="checkbox mt-1">
        <input type="checkbox" class="info" name="three_material_depth_test_${rand}" id="three_material_depth_test_${rand}" checked>
        Depth Test
        </label>
        
        <label class="checkbox mt-1">
        <input type="checkbox" class="warning" name="three_material_depth_write_${rand}" id="three_material_depth_write_${rand}" checked>
        Depth Write
        </label>

        <label for="three_material_alpha_test_${rand}" class="mt-1">Alpha Test:</label>
        <input name="three_material_alpha_test_${rand}" id="three_material_alpha_test_${rand}" type="range" min="0" max="1" value="0" step="0.01" class="primary" style="background-size: 0% 100%;">

        <label class="checkbox mt-1">
        <input type="checkbox" class="error" name="three_material_alpha_hash_${rand}" id="three_material_alpha_hash_${rand}">
        Alpha Hash
        </label>

        <label class="checkbox mt-1">
        <input type="checkbox" class="success" name="three_material_visible_${rand}" id="three_material_visible_${rand}" checked>
        Visible
        </label>

        <fieldset class="mt-1">
          <legend class="body1 bold">Side</legend>
          <div class="flex-row align-center gap-2">
            <label class="radio">
            <input checked type="radio" name="three_material_side_${rand}" value="front" class="secondary" checked>
            Front
            </label>
            
            <label class="radio">
            <input type="radio" name="three_material_side_${rand}" value="back" class="secondary">
            Back
            </label>

            <label class="radio">
            <input type="radio" name="three_material_side_${rand}" value="double" class="secondary">
            Double
            </label>
          </div>
        </fieldset>

      </fieldset>
    </div>
    <fieldset>
      <legend class="h6 bold">Physical Material</legend>
      <div class="flex-row gap-2 w-100">
        <div class="grow-1">
          <label class="body2" for="physical_material_color_${rand}">Color:</label>
          <div class="flex-row justify-begin align-center gap-2">
            <input type="color" name="physical_material_color_${rand}" id="physical_material_color_${rand}" value="${primary}" style="margin-top: 2px;">
            <span class="body2">${primary}</span>
          </div>
          <label for="physical_material_roughness_${rand}" class="mt-1">Roughness:</label>
          <input name="physical_material_roughness_${rand}" id="physical_material_roughness_${rand}" type="range" min="0" max="1" value="1" step="0.01" style="background-size: 100% 100%;">
          <label for="physical_material_ior_${rand}" class="mt-1">IOR:</label>
          <input name="physical_material_ior_${rand}" id="physical_material_ior_${rand}" type="range" min="0" max="2.33" value="1.50" step="0.01" class="primary" style="background-size: 100% 100%;">
          <label for="physical_material_iridescence_${rand}" class="mt-1">Iridescence:</label>
          <input name="physical_material_iridescence_${rand}" id="physical_material_iridescence_${rand}" type="range" min="0" max="1" value="0" step="0.01" style="background-size: 100% 100%;">
          <label for="physical_material_sheen_${rand}" class="mt-1">Sheen:</label>
          <input name="physical_material_sheen_${rand}" id="physical_material_sheen_${rand}" type="range" min="0" max="1" value="0" step="0.01" style="background-size: 100% 100%;" class="primary">

          <label class="body2 mt-1" for="physical_material_sheen_color_${rand}">Sheen Color:</label>
          <div class="flex-row justify-begin align-center gap-2">
            <input type="color" name="physical_material_sheen_color_${rand}" id="physical_material_sheen_color_${rand}" value="${background}" style="margin-top: 2px;">
            <span class="body2">${background}</span>
          </div>
          <label for="physical_material_clearcoat_roughness_${rand}" class="mt-1">Clearcoat Roughness:</label>
          <input class="primary" name="physical_material_clearcoat_roughness_${rand}" id="physical_material_clearcoat_roughness_${rand}" type="range" min="0" max="1" value="0" step="0.01" style="background-size: 100% 100%;">

          <label class="body2 mt-1" for="physical_material_specular_color_${rand}">Specular Color:</label>
          <div class="flex-row justify-begin align-center gap-2">
            <input type="color" name="physical_material_specular_color_${rand}" id="physical_material_specular_color_${rand}" value="${textColor}" style="margin-top: 2px;">
            <span class="body2">${textColor}</span>
          </div>

          <label class="checkbox mt-1">
            <input type="checkbox" class="secondary" name="physical_material_wireframe_${rand}" id="physical_material_wireframe_${rand}">
            Wireframe
            </label>

            <label class="checkbox mt-1">
            <input type="checkbox" class="warning" name="physical_material_fog_${rand}" id="physical_material_fog_${rand}" checked>
            Fog
            </label>

            <label class="checkbox mt-1">
            <input type="checkbox" class="success" name="physical_material_fibers_alpha_${rand}" id="physical_material_fibers_alpha_${rand}">
            Fibers Alpha Map
            </label>

            <label class="checkbox mt-1">
            <input type="checkbox" class="secondary" name="physical_material_fibers_iridescence_${rand}" id="physical_material_fibers_iridescence_${rand}">
            Fibers Iridescence Map
            </label>

        </div>  
        <div class="grow-1">
          <label class="body2" for="physical_material_emissive_">Emissive:</label>
          <div class="flex-row justify-begin align-center gap-2">
            <input type="color" name="physical_material_emissive_${rand}" id="physical_material_emissive_${rand}" value="${background}" style="margin-top: 2px;">
            <span class="body2">${background}</span>
          </div>
          <label for="physical_material_metalness_${rand}" class="mt-1">Metalness:</label>
          <input name="physical_material_metalness_${rand}" id="physical_material_metalness_${rand}" type="range" min="0" max="1" value="0" step="0.01" style="background-size: 100% 100%;" class="primary">
          <label for="physical_material_reflectivity_${rand}" class="mt-1">Reflectivity:</label>
          <input name="physical_material_reflectivity_${rand}" id="physical_material_reflectivity_${rand}" type="range" min="0" max="1" value="0.5" step="0.01" style="background-size: 100% 100%;">
          <label for="physical_material_iridescence_ior_${rand}" class="mt-1">Iridescence IOR:</label>
          <input name="physical_material_iridescence_ior_${rand}" id="physical_material_iridescence_ior_${rand}" type="range" min="0" max="2.33" value="1.3" step="0.01" style="background-size: 100% 100%;" class="primary">
          <label for="physical_material_sheen_roughness_${rand}" class="mt-1">Sheen Roughness:</label>
          <input name="physical_material_sheen_roughness_${rand}" id="physical_material_sheen_roughness_${rand}" type="range" min="0" max="1" value="1" step="0.01" style="background-size: 100% 100%;">
          <label for="physical_material_clearcoat_${rand}" class="mt-1">Clearcoat:</label>
          <input class="primary" name="physical_material_clearcoat_${rand}" id="physical_material_clearcoat_${rand}" type="range" min="0" max="1" value="0" step="0.01" style="background-size: 100% 100%;">
          <label for="physical_material_specular_intensity_${rand}" class="mt-1">Specular Intensity:</label>
          <input name="physical_material_specular_intensity_${rand}" id="physical_material_specular_intensity_${rand}" type="range" min="0" max="1" value="1" step="0.01" style="background-size: 100% 100%;">
          
          <label class="checkbox mt-1">
          <input type="checkbox" class="primary" name="physical_material_flat_shading_${rand}" id="physical_material_flat_shading_${rand}">
          Flat Shading
          </label>

          <label class="checkbox mt-1">
          <input type="checkbox" class="info" name="physical_material_vertex_colors_${rand}" id="physical_material_vertex_colors_${rand}">
          Vertex Colors
          </label>

          <label class="checkbox mt-1">
          <input type="checkbox" class="error" name="physical_material_reflection_env_maps_${rand}" id="physical_material_reflection_env_maps_${rand}">
          Reflection envMaps
          </label>

          <label class="checkbox mt-1">
          <input type="checkbox" class="primary" name="physical_material_bricks_roughness_maps_${rand}" id="physical_material_bricks_roughness_maps_${rand}">
          Bricks Roughness Map
          </label>

          <label class="checkbox mt-1">
          <input type="checkbox" class="info" name="physical_material_fibers_metalness_maps_${rand}" id="physical_material_fibers_metalness_maps_${rand}">
          Fibers Metalness Map
          </label>

        </div>
      </div>
    </fieldset>
  </div>
</details>`;
}

/**
 * Returns the value of a range input, constrained by min and max, with decimal decimal places
 * Defaults to the default input if something goes wrong 
 * @param input 
 * @param min 
 * @param max 
 * @param defaultVal 
 * @param decimal 
 * @returns 
 */
function getRangeInput(input:HTMLInputElement|null,min:number,max:number,defaultVal:number,decimal:number) {
  const defaultRet = Number(defaultVal.toFixed(decimal));
  if (!!!input || typeof input.value !== 'string') return defaultRet;
  else {
    const val = Number(input.value);
    if (!!!isValidFloat(val)) return defaultRet;
    if (val < min) return Number(min.toFixed(decimal));
    else if (val > max) return Number(max.toFixed(decimal));
    else return Number(val.toFixed(decimal));
  }
}

/**
 * Returns the value of a checkbox input
 */
function getCheckboxInput(input:HTMLInputElement|null,defaultChecked:boolean) {
  if (!!!input) return defaultChecked;
  else return input.checked;
}
/**
 * Get the value of a color input for 
 * @param input 
 * @param defaultColor 
 * @returns 
 */
function getColorInput(input:HTMLInputElement|null,defaultColor:string) {
  if (!!!input) return defaultColor;
  else {
    const color = input.value;
    if (VALID_HEX_REGEX.test(color)) return color;
    else return defaultColor;
  }
}

/**
 * Get three material side input
 * @param input 
 * @returns 
 */
function getThreeMaterialSideInput(input:HTMLInputElement|null) {
  if (input) {
    const val = input.value;
    switch (val) {
      case 'front': {
        return THREE.FrontSide;
      }
      case 'back': {
        return THREE.BackSide;
      }
      case 'double': {
        return THREE.DoubleSide;
      }
      default: {
        return THREE.FrontSide;
      }
    }
  } else {
    return THREE.FrontSide;
  }
}


/**
 * 
 * @param output 
 */
function getEditObjectAppearanceFormState(output:HTMLOutputElement){
  const form = output.querySelector('div[data-form]') as HTMLDivElement;
  // https://threejs.org/docs/#api/en/lights/AmbientLight
  const ambient_light_input = form.querySelector<HTMLInputElement>('input[name^="ambient_light_"]');
  const ambientLight = getColorInput(ambient_light_input,getDefaultTextColor());
  // https://threejs.org/docs/#api/en/scenes/Fog
  const add_scene_fog_input = form.querySelector<HTMLInputElement>('input[name^="add_scene_fog"]');
  const sceneFog = getCheckboxInput(add_scene_fog_input,false);
  const scene_fog_color_input = form.querySelector<HTMLInputElement>('input[name^="scene_fog_color_"]');
  const sceneFogColor = getColorInput(scene_fog_color_input,getDefaultPrimaryColor());
  // https://threejs.org/docs/#api/en/materials/Material - Properties inherited from Material
  const three_material_transparent_input = form.querySelector<HTMLInputElement>('input[name^="three_material_transparent_"]');
  const transparent = getCheckboxInput(three_material_transparent_input,false);
  const three_material_opacity_input = form.querySelector<HTMLInputElement>('input[name^="three_material_opacity_"]');
  const opacity = getRangeInput(three_material_opacity_input,0,1,1,2);
  const three_material_depth_test_input = form.querySelector<HTMLInputElement>('input[name^="three_material_depth_test_"]');
  const depthTest = getCheckboxInput(three_material_depth_test_input,true);
  const three_material_depth_write_input = form.querySelector<HTMLInputElement>('input[name^="three_material_depth_write_"]');
  const depthWrite = getCheckboxInput(three_material_depth_write_input,true);
  const three_material_alpha_test_input = form.querySelector<HTMLInputElement>('input[name^="three_material_alpha_test_"]');
  const alphaTest = getRangeInput(three_material_alpha_test_input,0,1,0,2);
  const three_material_alpha_hash_input = form.querySelector<HTMLInputElement>('input[name^="three_material_alpha_hash_"]');
  const alphaHash = getCheckboxInput(three_material_alpha_hash_input,false);
  const three_material_visible_input = form.querySelector<HTMLInputElement>('input[name^="three_material_visible_"]');
  const visible = getCheckboxInput(three_material_visible_input,true);
  const three_material_side_input = form.querySelector<HTMLInputElement>('input[name^="three_material_side"]:checked');
  const side = getThreeMaterialSideInput(three_material_side_input);
  // https://threejs.org/docs/#api/en/materials/MeshStandardMaterial and https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial
  const physical_material_color_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_color_"]');
  const color = getColorInput(physical_material_color_input,getDefaultPrimaryColor());
  const physical_material_roughness_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_roughness_"]');
  const roughness = getRangeInput(physical_material_roughness_input,0,1,1,2);
  const physical_material_ior_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_ior_"]');
  const ior = getRangeInput(physical_material_ior_input,0,2.33,1.5,2);
  const physical_material_iridescence_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_iridescence_"]');
  const iridescence = getRangeInput(physical_material_iridescence_input,0,1,0,2);
  const physical_material_sheen_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_sheen_"]');
  const sheen = getRangeInput(physical_material_sheen_input,0,1,0,2);
  const physical_material_sheen_color_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_sheen_color_"]');
  const sheenColor = getColorInput(physical_material_sheen_color_input,getDefaultBackgroundColor());
  const physical_material_clearcoat_roughness_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_clearcoat_roughness_"]');
  const clearcoatRoughness = getRangeInput(physical_material_clearcoat_roughness_input,0,1,0,2);
  const physical_material_specular_color_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_specular_color_"]');
  const specularColor = getColorInput(physical_material_specular_color_input,getDefaultTextColor());
  const physical_material_wireframe_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_wireframe_"]');
  const wireframe = getCheckboxInput(physical_material_wireframe_input,false);
  const physical_material_fog_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_fog_"]');
  const fog =  getCheckboxInput(physical_material_fog_input,true);
  // NOT_YET_IMPLEMENTED: const physical_material_fibers_alpha_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_fibers_alpha_"]');
  // NOT_YET_IMPLEMENTED: const physical_material_fibers_iridescence_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_fibers_iridescence_"]');
  const physical_material_emissive_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_emissive_"]');
  const emissive = getColorInput(physical_material_emissive_input,getDefaultBackgroundColor());
  const physical_material_metalness_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_metalness_"]');
  const metalness = getRangeInput(physical_material_metalness_input,0,1,0,2);
  const physical_material_reflectivity_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_reflectivity_"]');
  const reflectivity = getRangeInput(physical_material_reflectivity_input,0,1,0.5,2);
  const physical_material_iridescence_ior_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_iridescence_ior_"]');
  const iridescenceIOR = getRangeInput(physical_material_iridescence_ior_input,0,2.33,1.3,2);
  const physical_material_sheen_roughness_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_sheen_roughness_"]');
  const sheenRoughness = getRangeInput(physical_material_sheen_roughness_input,0,1,1,2);
  const physical_material_clearcoat_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_clearcoat_"]');
  const clearcoat = getRangeInput(physical_material_clearcoat_input,0,1,0,2);
  const physical_material_specular_intensity_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_specular_intensity_"]');
  const specularIntensity = getRangeInput(physical_material_specular_intensity_input,0,1,1,2);
  const physical_material_flat_shading_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_flat_shading_"]');
  const flatShading = getCheckboxInput(physical_material_flat_shading_input,false);
  const physical_material_vertex_colors_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_vertex_colors_"]');
  const vertexColors = getCheckboxInput(physical_material_vertex_colors_input,false);
  // NOT_YET_IMPLEMENTED: const physical_material_reflection_env_maps_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_reflection_env_maps_"]');
  
  // NOT_YET_IMPLEMENTED: const physical_material_bricks_roughness_maps_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_bricks_roughness_maps_"]');
  
  // NOT_YET_IMPLEMENTED: const physical_material_fibers_metalness_maps_input = form.querySelector<HTMLInputElement>('input[name^="physical_material_fibers_metalness_maps_"]');
  return {
    scene: {
      ambientLight,
      sceneFog,
      sceneFogColor,
    },
    material: {
      transparent,
      opacity,
      depthTest,
      depthWrite,
      alphaTest,
      alphaHash,
      visible,
      side,
      fog,
      // Physical Color
      color,
      roughness,
      wireframe,
      emissive,
      metalness,
      flatShading,
      vertexColors,
      clearcoat,
      clearcoatMap:undefined, // ?: Texture | null | undefined;
      clearcoatRoughness,
      clearcoatRoughnessMap:undefined, // ?: Texture | null | undefined;
      clearcoatNormalScale:undefined, // ?: Vector2 | undefined;
      clearcoatNormalMap:undefined, // ?: Texture | null | undefined;
    
      reflectivity,
      ior,
    
      sheen,
      sheenColor,
      sheenColorMap:undefined, // ?: Texture | null | undefined;
      sheenRoughness,
      sheenRoughnessMap:undefined, // ?: Texture | null | undefined;
    
      transmission: undefined, // NOT YET IMPLEMENTED
      transmissionMap:undefined, // ?: Texture | null | undefined;
    
      thickness: undefined, // NOT YET IMPLEMENTED
      thicknessMap:undefined, // ?: Texture | null | undefined;
    
      attenuationDistance: undefined, // NOT YET IMPLEMENTED
      attenuationColor:undefined, // NOT YET IMPLEMENTED
    
      specularIntensity,
      specularColor,
      specularIntensityMap:undefined, // ?: Texture | null | undefined;
      specularColorMap:undefined, // ?: Texture | null | undefined;
    
      iridescenceMap:undefined, // ?: Texture | null | undefined;
      iridescenceIOR,
      iridescence,
      iridescenceThicknessRange: undefined, // NOT YET IMPLEMENTED
      iridescenceThicknessMap:undefined, // ?: Texture | null | undefined;
    
      anisotropy: undefined, // NOT YET IMPLEMENTED
      anisotropyRotation: undefined, // NOT YET IMPLEMENTED
      anisotropyMap: undefined // Texture | null | undefined;
    }
  };
}


/**
 * Max file size 5MB https://www.google.com/search?q=average+3d+model+file+size&rlz=1C1ONGR_enUS1069US1069&oq=average+3d+model+file+size&gs_lcrp=EgZjaHJvbWUyCQgAEEUYORigATIHCAEQIRigATIHCAIQIRigAdIBCTEyNTAzajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
 * Files to accept: https://www.xometry.com/resources/3d-printing/3d-printing-file-types/
 * 
 * @param this 
 * @param e 
 */
function handleThree3dObjectUpload(this:HTMLInputElement,e:Event) {
  const files = this.files;

}
/**
 * Add change listeners for threejs file uploads
 */
export function setThree3DUploadListeners() {
  const threeDUploadFileInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[accept=".fbx,.obj,.stl,.3mf,.ply,.g,.gco,.x3g,.amf,.vrml"]'));
  threeDUploadFileInputs.forEach((file) => {
    file.addEventListener('change',handleThree3dObjectUpload);
  });
}

/* ------------------------------------------- Render Lexical 3D Objects ------------------------ */
/**
 * Render all three js instances on the page
 */
export function renderThreeJsObjects() {

}

/**
 * 
 */
export function onThreeJSUnload() {
  Object.keys(RENDERERS).forEach((key) => {
    delete RENDERERS[key];
  })
}

/**
 * Unload a specific instance of the three js renderer
 * @param key 
 */
export function unloadThreeJSRenderer(key:string) {
  delete RENDERERS[key];
}






/**
 * Call this function in the `shared.ts` file when we see that there are some THREE JS components on the page
 */
export function onThreeJSLoad() {
  renderThreeJsObjects();
  setThree3DUploadListeners();
  if (window.location.pathname==="/three-js-test") {
    onTestPageLoad();
  } else if (window.location.pathname==="/create-three-js-texture") {
    onCreateTexturePageLoad();
  }
}



/*---------------------------------- On Specific Page Loads ---------------------------- */
function onTestPageLoad() {
  const scene = new THREE.Scene();

  scene.add(new THREE.AxesHelper(5));
  // scene.fog.color = new THREE.Color(0xffffff);
  scene.background = new THREE.Color(0xffffff);

  const light = new THREE.SpotLight();
  light.position.set(20, 20, 20)
  scene.add(light);
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 3;
  const MAIN = document.getElementById('load-three-js') as HTMLDivElement|null;
  function onGeometryLoad(geometry:THREE.BufferGeometry<THREE.NormalBufferAttributes>) {
    // console.log(geometry);
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: false } );
    const mesh = new THREE.Mesh(geometry,material);
    mesh.position.set( 0, 2, 0 );
    mesh.rotation.set( 0, 0, 0 );
    mesh.scale.set(0.01,0.01,0.01);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }


  if (MAIN&&!!!RENDERERS['main']) {
    const renderer = new THREE.WebGLRenderer();
    RENDERERS['main'] = renderer;
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true;
    const loader = new STLLoader();
    loader.load(
      'static/stl/rex_headphone_wallmount.stl',
      onGeometryLoad,
      (xhr) => {
          // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
      },
      (error) => {
          console.error(error)
      }
    )
    const onWindowResize = () => {
      camera.updateProjectionMatrix();
      render()
    }
    renderer.setSize( MAIN.offsetWidth, MAIN.offsetHeight );
    window.addEventListener('resize', onWindowResize, false)

    MAIN.appendChild( renderer.domElement );
    
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const meshMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    //create a blue LineBasicMaterial
    const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );

    const points:THREE.Vector3[] = [];
    points.push( new THREE.Vector3( - 10, -50, 100 ) );
    points.push( new THREE.Vector3( 200, 40, 50 ) );
    points.push( new THREE.Vector3( 200, 50, 50 ) );
    const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometry, lineMaterial );

    const cube = new THREE.Mesh( geometry, meshMaterial );
    
    scene.add( cube, line );

    camera.position.z = 5;

    const render = () => renderer.render( scene, camera );
    const animate = () => {
      requestAnimationFrame( animate );
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      const neg = Math.random()>0.5;
      cube.translateX(neg?-0.1:0.1);
      cube.translateY(neg?-0.1:0.1);
      cube.translateZ(neg?-0.1:0.1);
      render();
    }
    animate();

    
  }

}

/* ----------------------------------------- Create Texture Page ----------------------- */

function onCreateTexturePageLoad() {
  const scene = new THREE.Scene();
  const axesHelper = new THREE.AxesHelper( 5 );
  const threeJsCreateTexture = document.getElementById('three-js-create-texture');
  const light = new THREE.SpotLight();
  light.position.set(20, 20, 20)
  scene.add(light);
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 3;

}