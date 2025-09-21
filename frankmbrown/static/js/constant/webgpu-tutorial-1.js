import * as wgsl_code from '/static/js/constant/wgsl_webgpu_tut_code.js';
const vertex = wgsl_code.triangle_vert_wgsl;
const frag = wgsl_code.red_frag_wgsl;

const FRAGMENT_SHADER = wgsl_code.sha;

const canvas = document.getElementById('web-gpu-tut-1-canvas');
const context = canvas.getContext('webgpu');

async function initWebGPU() {
  if (!navigator.gpu) throw new Error("navigator.gpu does not exist.");
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: 'high-performance'
  });
  if (!!!adapter) throw new Error("Unable to find adapter.");
  const device = await adapter?.requestDevice({
    requiredFeatures: ['texture-compression-bc'],
    requiredLimits: {
      maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize
    }
  });
  const format = navigator.gpu.getPreferredCanvasFormat();
  if (!!!format) throw new Error("Unable to get preferred format for gpu context for adapter.");
  const size = [450,450];
  context.configure({
    device, 
    format,
    size,
    composingAlphaMode: 'opaque'
  });
  return { adapter, device, format, context };
}

async function initpipeline(device,format) {
  const vertexShader = device.createShaderModule({
    code: vertex,
  });
  const fragmentShader = device.createShaderModule({
    code: frag
  });
  const pipeline = await device.createRenderPipelineAsync({
    vertex: {
      module: vertexShader,
      entryPoint: 'main'
    },
    fragment: {
      module: fragmentShader,
      entryPoint: 'main',
      targets: [{
        format
      }]
    },
    primitive: {
      topology: 'triangle-list'
    },
    layout: 'auto'
  });
  return {pipeline};
}
function draw(device,pipeline,context) {
  const encoder = device.createCommandEncoder();
  const renderPass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      clearValue: { r: 0, g: 0, b: 0, a: 1},
      storeOp: 'store'
    }]
  });
  renderPass.setPipeline(pipeline);
  renderPass.draw(3);
  renderPass.end();
  const buffer = encoder.finish();
  device.queue.submit([buffer]);
}
async function run() {
  const { adapter, device, format, context } = await initWebGPU();
  const {pipeline} = await initpipeline(device,format);
  draw(device,pipeline,context);
}
run()