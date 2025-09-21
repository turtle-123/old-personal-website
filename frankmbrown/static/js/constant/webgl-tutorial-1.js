

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById('web-gl-tut-1-canvas');
var gl = canvas.getContext('webgl');
if (!gl) {
  console.error("WebGL not supported without experimental.");
  gl = canvas.getContext('experimental-webgl');
}
if (!gl) {
  alert("Your browser does not support WebGL");
}

var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = vec4(vertPosition, 0.0, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');



gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//
	// Create shaders
	// 
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		throw new Error('');
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		throw new Error('');
	}

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		throw new Error('');
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		throw new Error('');
	}

	//
	// Create buffer
	//
	var triangleVertices = 
	[ // X, Y,       R, G, B
		0.0, 0.5,    1.0, 1.0, 0.0,
		-0.5, -0.5,  0.7, 0.0, 1.0,
		0.5, -0.5,   0.1, 1.0, 0.6
	];

	var triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	//
	// Main render loop
	//
	gl.useProgram(program);
	gl.drawArrays(gl.TRIANGLES, 0, 3);


/*------------------------------ Resize/FullScreen Stuff ------------------------------- */
function onResize() {
  
}

function onFullscreenChange(e) {
  const detail = e.detail;
  if (detail.el&&detail.el.id===canvas.parentElement.id) {
    if (detail.fullscreen) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0,0,window.innerWidth,window.innerHeight);
      document.addEventListener('resize',onResize);
    } else {
      canvas.width = 450;
      canvas.height = 450;
      gl.viewport(0,0,window.innerWidth,window.innerHeight);
      document.removeEventListener('resize',onResize);
    }
  }
}
document.addEventListener("FULLSCREEN_CHANGE",onFullscreenChange);
