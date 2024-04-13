// Vertex shader program

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 30.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// var VSHADER_SOURCE =
//   "attribute vec4 a_Position;\n" +
//   "void main() {\n" +
//   "  gl_Position = a_Position;\n" +
//   "  gl_PointSize = 10.0;\n" +
//   "}\n";

// // Fragment shader program
// var FSHADER_SOURCE =
//   "precision mediump float;\n" +
//   "uniform vec4 u_FragColor;\n" + // uniform変数
//   "void main() {\n" +
//   "  gl_FragColor = u_FragColor;\n" +
//   "}\n";

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
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
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
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// Const
const POINT = 0;
const TRIANGLE = 1;


// Global for UI
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;


function addActionsForHtmlUI() {

    // Button for Red and Green
    document.getElementById("green").onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
    document.getElementById("red").onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };

    // Sliders for Red Green and Blue
    document.getElementById("redSlide").addEventListener("mouseup", function() {g_selectedColor[0] = this.value/100; });
    document.getElementById("greenSlide").addEventListener("mouseup", function() {g_selectedColor[1] = this.value/100; });
    document.getElementById("blueSlide").addEventListener("mouseup", function() {g_selectedColor[2] = this.value/100; });

    // Size Slider
    document.getElementById("sizeSlide").addEventListener("mouseup", function() {g_selectedSize = this.value; });

    // Clear Button
    document.getElementById("clearButton").onclick = function() {g_shapeList=[]; renderAllShapes();};

    // Shape button
    document.getElementById("pointButton").onclick = function() {g_selectedType=POINT};
    document.getElementById("triangleButton").onclick = function() {g_selectedType=TRIANGLE};



}

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;

  // Drag mouse to draw
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapeList = [];

// var g_points = []; // The array for the position of a mouse press
// var g_colors = []; // The array to store the color of a point
// var g_sizes =  [];

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  let point = new Point();

  if(g_selectedType == POINT)
  {
    point = new Point();

  }
  else
  {
    point = new Triangle();
  }



  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapeList.push(point);

//   g_points.push([x, y]);

//   g_colors.push(g_selectedColor.slice());

//   g_sizes.push(g_selectedSize);

//   // Store the coordinates to g_points array
//   if (x >= 0.0 && y >= 0.0) {
//     // First quadrant
//     g_colors.push([1.0, 0.0, 0.0, 1.0]); // Red
//   } else if (x < 0.0 && y < 0.0) {
//     // Third quadrant
//     g_colors.push([0.0, 1.0, 0.0, 1.0]); // Green
//   } else {
//     // Others
//     g_colors.push([1.0, 1.0, 1.0, 1.0]); // White
//   }

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
