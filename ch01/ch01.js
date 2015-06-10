var gl;
var shaderProgram;

var modelViewMatrix = mat4.create();
var perspectiveMatrix = mat4.create();

function initGL(canvas) {
  try {
    gl = canvas.getContext("webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {
    try {
      gl = canvas.getContext("experimental-webgl");
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
    } catch (ex) {
    }
  }
  if (!gl) {
    alert("Sorry, couldn't initialize WebGL.");
  }
}

function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  var contents = "";
  var el = shaderScript.firstChild;
  while (el) {
    if (el.nodeType == 3) {
      contents += el.textContent;
    }
    el = el.nextSibling;
  }

  gl.shaderSource(shader, contents);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function initShaders() {
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, getShader(gl, "shader-vs"));
  gl.attachShader(shaderProgram, getShader(gl, "shader-fs"));
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialize shaders.");
    return;
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, perspectiveMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, modelViewMatrix);
}

var triangleBuffer;
var squareBuffer;

function initBuffers() {
  triangleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
  var vertices = [
  		 0.0,  1.0,  0.0,
  		-1.0, -1.0,  0.0,
  		 1.0, -1.0,  0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  triangleBuffer.itemSize = 3;
  triangleBuffer.numItems = 3;
  
  squareBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
  vertices = [
       1.0,  1.0,  0.0,
      -1.0,  1.0,  0.0,
       1.0, -1.0,  0.0,
      -1.0, -1.0,  0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  squareBuffer.itemSize = 3;
  squareBuffer.numItems = 4;
}

function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(perspectiveMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
  mat4.identity(modelViewMatrix);

  mat4.translate(modelViewMatrix, modelViewMatrix, [-1.5, 0.0, -7.0]);
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleBuffer.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, triangleBuffer.numItems);

  mat4.translate(modelViewMatrix, modelViewMatrix, [3.0, 0.0, 0.0]);
  gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareBuffer.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareBuffer.numItems);
}

function start() {
  var canvas = document.getElementById("display");
  initGL(canvas);
  initShaders();
  initBuffers();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  drawScene();
}
