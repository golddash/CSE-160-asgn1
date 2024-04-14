// Kevin Chen ASG1 4/13/24

// test again

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 30.0;
    gl_PointSize = u_Size;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }
  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, "u_Size");
  if (!u_Size) {
    console.log("Failed to get the storage location of u_Size");
    return;
  }
}

// Const
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global for UI
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_numSegments = 6;

function addActionsForHtmlUI() {
  // Button for Red and Green
  document.getElementById("green").onclick = function () {
    g_selectedColor = [0.0, 1.0, 0.0, 1.0];
  };
  document.getElementById("red").onclick = function () {
    g_selectedColor = [1.0, 0.0, 0.0, 1.0];
  };

  // Sliders for Red Green and Blue
  document.getElementById("redSlide").addEventListener("mouseup", function () {
    g_selectedColor[0] = this.value / 100;
  });
  document
    .getElementById("greenSlide")
    .addEventListener("mouseup", function () {
      g_selectedColor[1] = this.value / 100;
    });
  document.getElementById("blueSlide").addEventListener("mouseup", function () {
    g_selectedColor[2] = this.value / 100;
  });

  // Size and segment Slider
  document.getElementById("sizeSlide").addEventListener("mouseup", function () {
    g_selectedSize = this.value;
  });
  document
    .getElementById("segmentSlide")
    .addEventListener("mouseup", function () {
      g_numSegments = this.value;
    });

  // Clear Button
  document.getElementById("clearButton").onclick = function () {
    g_shapeList = [];
    renderAllShapes();
  };

  // Shape button
  document.getElementById("pointButton").onclick = function () {
    g_selectedType = POINT;
  };
  document.getElementById("triangleButton").onclick = function () {
    g_selectedType = TRIANGLE;
  };
  document.getElementById("circleButton").onclick = function () {
    g_selectedType = CIRCLE;
  };

  // Draw Button
  document.getElementById("drawButton").onclick = function () {
    g_shapeList = [];
    drawPicture();
  };

  document.getElementById("awesomeButton").onclick = function () {
    g_shapeList = [];
    generateRandomDrawing();
  };
}

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;

  // Drag mouse to draw
  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) {
      click(ev);
    }
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapeList = [];

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  let point = new Point();

  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_numSegments;
  }

  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapeList.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_points.length;

  var len = g_shapeList.length;

  for (var i = 0; i < len; i++) {
    g_shapeList[i].render();
  }
}

// test add

function drawPicture() {
  pictureTriangle([-1, 1, -1, -1, 1, 1], [0.529, 0.808, 0.922, 1.0]); // Light blue for the sky
  pictureTriangle([1, 1, 1, -1, -1, -1], [0.529, 0.808, 0.922, 1.0]); // Light blue for the sky

  // The sun
  pictureTriangle([1, 1, 1, 0.7, 0.7, 1], [1.0, 1.0, 0.0, 1.0]);
  pictureTriangle([0.7, 0.7, 1, 0.7, 0.7, 1], [1.0, 1.0, 0.0, 1.0]);

  // Grass patch
  pictureTriangle([-1, -1, 1, -0.7, 1, -1], [0.0, 0.4, 0.0, 1.0]);
  pictureTriangle([-1, -1, -1, -0.7, 1, -0.7], [0.0, 0.4, 0.0, 1.0]);

  // Dirt patch
  pictureTriangle([-1, -0.7, 1, -0.55, 1, -0.7], [0.545, 0.271, 0.075, 1.0]);
  pictureTriangle([-1, -0.7, -1, -0.55, 1, -0.55], [0.545, 0.271, 0.075, 1.0]);

  // Cloud 1
  pictureTriangle([-0.6, 0.8, -0.5, 0.78, -0.45, 0.82], [1.0, 1.0, 1.0, 1.0]);
  pictureTriangle([-0.5, 0.78, -0.45, 0.82, -0.4, 0.8], [1.0, 1.0, 1.0, 1.0]);
  // Cloud 2
  pictureTriangle([0.2, 0.65, 0.3, 0.63, 0.35, 0.67], [1.0, 1.0, 1.0, 1.0]);
  pictureTriangle([0.3, 0.63, 0.35, 0.67, 0.4, 0.65], [1.0, 1.0, 1.0, 1.0]);

  // Cloud 3
  pictureTriangle([0.6, 0.75, 0.7, 0.73, 0.75, 0.77], [1.0, 1.0, 1.0, 1.0]);
  pictureTriangle([0.7, 0.73, 0.75, 0.77, 0.8, 0.75], [1.0, 1.0, 1.0, 1.0]);
  // Cloud 4
  pictureTriangle([-0.8, 0.55, -0.7, 0.53, -0.65, 0.57], [1.0, 1.0, 1.0, 1.0]);
  pictureTriangle([-0.7, 0.53, -0.65, 0.57, -0.6, 0.55], [1.0, 1.0, 1.0, 1.0]);

  // Trunk of the tree
  pictureTriangle(
    [-0.2, -0.7, -0.15, -0.5, -0.25, -0.5],
    [0.294, 0.149, 0.0, 1.0]
  );
  pictureTriangle(
    [-0.25, -0.7, -0.15, -0.7, -0.15, -0.5],
    [0.294, 0.149, 0.0, 1.0]
  );
  pictureTriangle(
    [-0.25, -0.7, -0.2, -0.7, -0.2, -0.5],
    [0.294, 0.149, 0.0, 1.0]
  );
  pictureTriangle(
    [-0.25, -0.5, -0.15, -0.5, -0.2, -0.3],
    [0.294, 0.149, 0.0, 1.0]
  );
  pictureTriangle(
    [-0.25, -0.5, -0.3, -0.3, -0.2, -0.3],
    [0.294, 0.149, 0.0, 1.0]
  );
  // Leaves (bottom layer)
  pictureTriangle(
    [-0.3, -0.3, -0.2, -0.2, -0.4, -0.2],
    [0.133, 0.545, 0.133, 1.0]
  );
  pictureTriangle(
    [-0.4, -0.2, -0.2, -0.2, -0.3, -0.1],
    [0.133, 0.545, 0.133, 1.0]
  );
  pictureTriangle(
    [-0.3, -0.1, -0.2, -0.2, -0.1, -0.2],
    [0.133, 0.545, 0.133, 1.0]
  );
  // Leaves (middle layer)
  pictureTriangle(
    [-0.25, -0.3, -0.15, -0.2, -0.35, -0.2],
    [0.133, 0.545, 0.133, 1.0]
  );
  pictureTriangle(
    [-0.35, -0.2, -0.15, -0.2, -0.25, -0.1],
    [0.133, 0.545, 0.133, 1.0]
  );
  pictureTriangle(
    [-0.25, -0.1, -0.15, -0.2, -0.05, -0.2],
    [0.133, 0.545, 0.133, 1.0]
  );
  // Leaves (top layer)
  pictureTriangle(
    [-0.2, -0.3, -0.1, -0.2, -0.3, -0.2],
    [0.133, 0.545, 0.133, 1.0]
  );
  pictureTriangle(
    [-0.3, -0.2, -0.1, -0.2, -0.2, -0.1],
    [0.133, 0.545, 0.133, 1.0]
  );

  // Bird 1
  pictureTriangle([0.1, 0.9, 0.12, 0.88, 0.14, 0.9], [0.0, 0.0, 0.0, 1.0]); // Body
  pictureTriangle([0.12, 0.88, 0.14, 0.9, 0.12, 0.92], [0.0, 0.0, 0.0, 1.0]); // Head
  pictureTriangle([0.14, 0.9, 0.16, 0.88, 0.18, 0.9], [0.0, 0.0, 0.0, 1.0]); // Wing

  // Bird 2
  pictureTriangle([-0.1, 0.85, -0.12, 0.83, -0.14, 0.85], [0.0, 0.0, 0.0, 1.0]); // Body
  pictureTriangle(
    [-0.12, 0.83, -0.14, 0.85, -0.12, 0.87],
    [0.0, 0.0, 0.0, 1.0]
  ); // Head
  pictureTriangle(
    [-0.14, 0.85, -0.16, 0.83, -0.18, 0.85],
    [0.0, 0.0, 0.0, 1.0]
  ); // Wing

  // Bird 3
  pictureTriangle([0.05, 0.95, 0.07, 0.93, 0.09, 0.95], [0.0, 0.0, 0.0, 1.0]); // Body
  pictureTriangle([0.07, 0.93, 0.09, 0.95, 0.07, 0.97], [0.0, 0.0, 0.0, 1.0]); // Head
  pictureTriangle([0.09, 0.95, 0.11, 0.93, 0.13, 0.95], [0.0, 0.0, 0.0, 1.0]); // Wing
}

function generateRandomDrawing() {
  const numShapes = Math.floor(Math.random() * 100) + 50; // Generate 50 to 150 shapes

  for (let i = 0; i < numShapes; i++) {
    const type = Math.floor(Math.random() * 3); // Randomly select a shape type (0: POINT, 1: TRIANGLE, 2: CIRCLE)
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const color = [Math.random(), Math.random(), Math.random(), 1.0]; // Generate random RGBA color
    const size = Math.random() * 10 + 1;
    const rotation = Math.random() * 360;
    const strokeColor = [Math.random(), Math.random(), Math.random(), 1.0]; // Generate random RGBA stroke color
    const strokeWidth = Math.random() * 5;
    const spacingX = Math.random() * 2 - 1;
    const spacingY = Math.random() * 2 - 1;
    const sparkleInterval = Math.random() * 500 + 500; // Random sparkle interval

    let shape;
    if (type === POINT) {
      shape = new Point();
    } else if (type === TRIANGLE) {
      shape = new Triangle();
    } else {
      shape = new Circle();
      shape.segments = Math.floor(Math.random() * 10) + 3; // Random number of segments (3 to 12)
    }

    shape.position = [x + spacingX, y + spacingY];
    shape.color = color;
    shape.size = size;
    shape.rotation = rotation;
    shape.strokeColor = strokeColor;
    shape.strokeWidth = strokeWidth;

    // Add shimmering effect
    setInterval(() => {
      shape.color[3] = shape.color[3] === 1.0 ? 0.2 : 1.0; // Toggle transparency between 0.2 and 1.0
    }, sparkleInterval);

    g_shapeList.push(shape);
  }

  renderAllShapes();
}
