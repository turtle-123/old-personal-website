export const basic_instanced_vert_wgsl = `@binding(0) @group(0) var<storage, read> mvpMatrix : array<mat4x4<f32>>;

struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec4<f32>

};

@vertex
fn main(
    @builtin(instance_index) index : u32,
    @location(0) position : vec4<f32>,
    @location(1) uv : vec2<f32>
) -> VertexOutput {
    var output : VertexOutput;
    output.Position = mvpMatrix[index] * position;
    output.fragUV = uv;
    output.fragPosition = 0.5 * (position + vec4<f32>(1.0, 1.0, 1.0, 1.0));
    return output;
}
`;
export const basic_vert_wgsl = `@binding(0) @group(0) var<uniform> mvpMatrix : mat4x4<f32>;

struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec4<f32>
};

@vertex
fn main(
    @location(0) position : vec4<f32>,
    @location(1) uv : vec2<f32>
) -> VertexOutput {
    var output : VertexOutput;
    output.Position = mvpMatrix * position;
    output.fragUV = uv;
    output.fragPosition = 0.5 * (position + vec4<f32>(1.0, 1.0, 1.0, 1.0));
    return output;
}
`;
export const color_frag_wgsl = `@group(0) @binding(0) var<uniform> color : vec4<f32>;

@fragment
fn main() -> @location(0) vec4<f32> {
    return color;
}`;
export const compute_position_wgsl = `@group(0) @binding(0) var<storage, read> input: array<f32, 7>;
@group(0) @binding(1) var<storage, read_write> velocity: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> modelView: array<mat4x4<f32>>;
@group(0) @binding(3) var<uniform> projection : mat4x4<f32>;
@group(0) @binding(4) var<storage, read_write> mvp : array<mat4x4<f32>>;

const size = u32(128);
@compute @workgroup_size(size)
fn main(
    @builtin(global_invocation_id) GlobalInvocationID : vec3<u32>
) {
    var index = GlobalInvocationID.x;
    if(index >= u32(input[0])){
        return;
    }
    var xMin = input[1];
    var xMax = input[2];
    var yMin = input[3];
    var yMax = input[4];
    var zMin = input[5];
    var zMax = input[6];
    var pos = modelView[index][3];
    var vel = velocity[index];
    // change x
    pos.x += vel.x;
    if(pos.x < xMin){
        pos.x = xMin;
        vel.x = -vel.x;
    }else if(pos.x > xMax){
        pos.x = xMax;
        vel.x = -vel.x;
    }
    // change y
    pos.y += vel.y;
    if(pos.y < yMin){
        pos.y = yMin;
        vel.y = -vel.y;
    }else if(pos.y > yMax){
        pos.y = yMax;
        vel.y = -vel.y;
    }
    // change z
    pos.z += vel.z;
    if(pos.z < zMin){
        pos.z = zMin;
        vel.z = -vel.z;
    }else if(pos.z > zMax){
        pos.z = zMax;
        vel.z = -vel.z;
    }
    // update velocity
    velocity[index] = vel;
    // update position in modelView matrix
    modelView[index][3] = pos;
    // update mvp
    mvp[index] = projection * modelView[index];
}`;
export const compute_transform_wgsl = `@group(0) @binding(0) var<storage, read> modelView: array<mat4x4<f32>>;
@group(0) @binding(1) var<storage, read> projection : mat4x4<f32>;
@group(0) @binding(2) var<storage, read_write> mvp : array<mat4x4<f32>>;
@group(0) @binding(3) var<uniform> count : u32;

@compute @workgroup_size(128)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    // Guard against out-of-bounds work group sizes
    let index = global_id.x;
    if (index >= count) {
        return;
    }

    mvp[index] = projection * modelView[index];
}`;
export const imageTexture_frag_wgsl = `@group(1) @binding(0) var Sampler: sampler;
@group(1) @binding(1) var Texture: texture_2d<f32>;

@fragment
fn main(@location(0) fragUV: vec2<f32>,
        @location(1) fragPosition: vec4<f32>) -> @location(0) vec4<f32> {
  return textureSample(Texture, Sampler, fragUV) * fragPosition;
}
`;
export const lambert_frag_wgsl = `@group(1) @binding(0) var<uniform> ambientIntensity : f32;
@group(1) @binding(1) var<uniform> pointLight : array<vec4<f32>, 2>;
@group(1) @binding(2) var<uniform> directionLight : array<vec4<f32>, 2>;

@fragment
fn main(
    @location(0) fragPosition : vec3<f32>,
    @location(1) fragNormal: vec3<f32>,
    @location(2) fragUV: vec2<f32>,
    @location(3) fragColor: vec4<f32>
) -> @location(0) vec4<f32> {
    let objectColor = fragColor.rgb;
    let ambintLightColor = vec3(1.0,1.0,1.0);
    let pointLightColor = vec3(1.0,1.0,1.0);
    let dirLightColor = vec3(1.0,1.0,1.0);

    var lightResult = vec3(0.0, 0.0, 0.0);
    // ambient
    lightResult += ambintLightColor * ambientIntensity;
    // Directional Light
    var directionPosition = directionLight[0].xyz;
    var directionIntensity: f32 = directionLight[1][0];
    var diffuse: f32 = max(dot(normalize(directionPosition), fragNormal), 0.0);
    lightResult += dirLightColor * directionIntensity * diffuse;
    // Point Light
    var pointPosition = pointLight[0].xyz;
    var pointIntensity: f32 = pointLight[1][0];
    var pointRadius: f32 = pointLight[1][1];
    var L = pointPosition - fragPosition;
    var distance = length(L);
    if(distance < pointRadius){
        var diffuse: f32 = max(dot(normalize(L), fragNormal), 0.0);
        var distanceFactor: f32 = pow(1.0 - distance / pointRadius, 2.0);
        lightResult += pointLightColor * pointIntensity * diffuse * distanceFactor;
    }

    return vec4<f32>(objectColor * lightResult, 1.0);
}`;
export const normal_vert_wgsl = `@group(0) @binding(0) var<storage> modelViews : array<mat4x4<f32>>;
@group(0) @binding(1) var<uniform> projection : mat4x4<f32>;
@group(0) @binding(2) var<storage> colors : array<vec4<f32>>;

struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragPosition : vec3<f32>,
    @location(1) fragNormal : vec3<f32>,
    @location(2) fragUV: vec2<f32>,
    @location(3) fragColor: vec4<f32>
};

@vertex
fn main(
    @builtin(instance_index) index : u32,
    @location(0) position : vec3<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) uv : vec2<f32>,
) -> VertexOutput {
    let modelview = modelViews[index];
    let mvp = projection * modelview;
    let pos = vec4<f32>(position, 1.0);

    var output : VertexOutput;
    output.Position = mvp * pos;
    output.fragPosition = (modelview * pos).xyz;
    // it should use transpose(inverse(modelview)) if consider non-uniform scale
    // hint: inverse() is not available in wgsl, better do in JS or CS
    output.fragNormal =  (modelview * vec4<f32>(normal, 0.0)).xyz;
    output.fragUV = uv;
    output.fragColor = colors[index];
    return output;
}
`;
export const position_frag_wgsl = `@fragment
fn main(
    @location(0) fragUV: vec2<f32>,
    @location(1) fragPosition: vec4<f32>
) -> @location(0) vec4<f32> {
    return fragPosition;
}`;
export const position_vert_wgsl = `@vertex
fn main(@location(0) position : vec3<f32>) -> @builtin(position) vec4<f32> {
    return vec4<f32>(position, 1.0);
}`;
export const red_frag_wgsl = `@fragment
fn main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}`;
export const shadow_frag_wgsl = `@group(1) @binding(0) var<uniform> lightPosition : vec4<f32>;
@group(1) @binding(1) var shadowMap: texture_depth_2d;
@group(1) @binding(2) var shadowSampler: sampler_comparison;

@fragment
fn main(
    @location(0) fragPosition : vec3<f32>,
    @location(1) fragNormal: vec3<f32>,
    @location(2) fragUV: vec2<f32>,
    @location(3) shadowPos: vec3<f32>,
    @location(4) fragColor: vec4<f32>
) -> @location(0) vec4<f32> {
    let objectColor = fragColor.rgb;
    // Directional Light
    let diffuse: f32 = max(dot(normalize(lightPosition.xyz), fragNormal), 0.0);
    // add shadow factor
    var shadow : f32 = 0.0;
    // apply Percentage-closer filtering (PCF)
    // sample nearest 9 texels to smooth result
    let size = f32(textureDimensions(shadowMap).x);
    for (var y : i32 = -1 ; y <= 1 ; y = y + 1) {
        for (var x : i32 = -1 ; x <= 1 ; x = x + 1) {
            let offset = vec2<f32>(f32(x) / size, f32(y) / size);
            shadow = shadow + textureSampleCompare(
                shadowMap,
                shadowSampler,
                shadowPos.xy + offset,
                shadowPos.z - 0.005  // apply a small bias to avoid acne
            );
        }
    }
    shadow = shadow / 9.0;
    // ambient + diffuse * shadow
    let lightFactor = min(0.3 + shadow * diffuse, 1.0);
    return vec4<f32>(objectColor * lightFactor, 1.0);
}`;
export const shadow_vertex_wgsl = `@group(0) @binding(0) var<storage> modelViews : array<mat4x4<f32>>;
@group(0) @binding(1) var<uniform> cameraProjection : mat4x4<f32>;
@group(0) @binding(2) var<uniform> lightProjection : mat4x4<f32>;
@group(0) @binding(3) var<storage> colors : array<vec4<f32>>;

struct VertexOutput {
    @builtin(position) Position: vec4<f32>,
    @location(0) fragPosition: vec3<f32>,
    @location(1) fragNormal: vec3<f32>,
    @location(2) fragUV: vec2<f32>,
    @location(3) shadowPos: vec3<f32>,
    @location(4) fragColor: vec4<f32>
};

@vertex
fn main(
    @builtin(instance_index) index : u32,
    @location(0) position : vec3<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) uv : vec2<f32>
) -> VertexOutput {
    let modelview = modelViews[index];
    let pos = vec4<f32>(position, 1.0);
    let posFromCamera: vec4<f32> = cameraProjection * modelview * pos;

    var output : VertexOutput;
    output.Position = posFromCamera;
    output.fragPosition = (modelview * pos).xyz;
    output.fragNormal =  (modelview * vec4<f32>(normal, 0.0)).xyz;
    output.fragUV = uv;
    output.fragColor = colors[index];

    let posFromLight: vec4<f32> = lightProjection * modelview * pos;
    // Convert shadowPos XY to (0, 1) to fit texture UV
    output.shadowPos = vec3<f32>(posFromLight.xy * vec2<f32>(0.5, -0.5) + vec2<f32>(0.5, 0.5), posFromLight.z);
    return output;
}
`;
export const shadowDepth_wgsl = `@group(0) @binding(0) var<storage> modelViews : array<mat4x4<f32>>;
@group(0) @binding(1) var<uniform> lightProjection : mat4x4<f32>;

@vertex
fn main(
    @builtin(instance_index) index : u32,
    @location(0) position : vec3<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) uv : vec2<f32>,
) -> @builtin(position) vec4<f32> {
    let modelview = modelViews[index];
    let pos = vec4(position, 1.0);
    return lightProjection * modelview * pos;
}
`;
export const spriteTexture_frag_wgsl = `@group(1) @binding(0) var Sampler: sampler;
@group(1) @binding(1) var Texture: texture_2d<f32>;
@group(1) @binding(2) var<uniform> uvOffset : vec4<f32>;

@fragment
fn main(@location(0) fragUV: vec2<f32>,
        @location(1) fragPosition: vec4<f32>) -> @location(0) vec4<f32> {
  // only show specific uv area of the big texture
  var uv = fragUV * vec2<f32>(uvOffset[2], uvOffset[3]) + vec2<f32>(uvOffset[0], uvOffset[1]);
  return textureSample(Texture, Sampler, uv) * fragPosition;
}
`;
export const triangle_vert_wgsl = `@vertex
fn main(@builtin(vertex_index) VertexIndex : u32) -> @builtin(position) vec4<f32> {
    var pos = array<vec2<f32>, 3>(
            vec2<f32>(0.0, 0.5),
            vec2<f32>(-0.5, -0.5),
            vec2<f32>(0.5, -0.5)
    );
    return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
}`;
export const videoTexture_frag_wgsl = `@group(1) @binding(0) var Sampler: sampler;
@group(1) @binding(1) var Texture: texture_external;

@fragment
fn main(@location(0) fragUV: vec2<f32>,
        @location(1) fragPosition: vec4<f32>) -> @location(0) vec4<f32> {
  return textureSampleBaseClampToEdge(Texture, Sampler, fragUV) * fragPosition;
}
`;