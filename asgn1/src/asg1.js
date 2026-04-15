// HelloPint2.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    `attribute vec4 a_Position;
  uniform float u_Size;
   void main() {
     gl_Position = a_Position;
     gl_PointSize = u_Size;
   }`;

// Fragment shader program
var FSHADER_SOURCE =
    `precision mediump float;
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
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// user drawing globals
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedSegmentCount = 5
let g_selectedType = POINT;

// cat-mouse game globals
let g_mousePos = [0, 0];
let g_catPos = [0.5, 0.5];
let g_catMoveRate = 0.005;
let g_gameRunning = false;
let g_gameEndScreen = false;

function addActionsForHTMLUI() {
    document.getElementById('clear').onclick = function () { g_shapesList = []; g_gameEndScreen = false; renderAllShapes(); };
    document.getElementById('draw').onclick = drawPicture;
    document.getElementById('game').onclick = startGame;

    document.getElementById('point').onclick = function () { g_selectedType = POINT };
    document.getElementById('triangle').onclick = function () { g_selectedType = TRIANGLE };
    document.getElementById('circle').onclick = function () { g_selectedType = CIRCLE };

    document.getElementById('redSlide').addEventListener('mouseup', function () { g_selectedColor[0] = this.value / 100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function () { g_selectedColor[1] = this.value / 100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function () { g_selectedColor[2] = this.value / 100; });

    document.getElementById('sizeSlide').addEventListener('mouseup', function () { g_selectedSize = this.value; });
    document.getElementById('segmentSlide').addEventListener('mouseup', function () { g_selectedSegmentCount = this.value; });
}

function main() {
    setupWebGL();

    connectVariablesToGLSL();

    addActionsForHTMLUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;

    canvas.onmousemove = function (ev) {
        [g_mousePos[0], g_mousePos[1]] = convertCoordinatesToGL(ev);
        if (ev.buttons == 1) { click(ev) }
    };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {
    if (g_gameRunning) {
        return;
    }

    [x, y] = convertCoordinatesToGL(ev);

    let point;

    if (g_selectedType == POINT) {
        point = new Point();
    }

    else if (g_selectedType == TRIANGLE) {
        point = new Triangle();
    }

    else {
        point = new Circle();
    }

    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    point.segments = g_selectedSegmentCount;

    g_shapesList.push(point);

    renderAllShapes();
}

function convertCoordinatesToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return ([x, y]);
}

function updateCatPos() {
    // breaks out of loop if game stopped
    if (!g_gameRunning || g_gameEndScreen) {
        g_gameRunning = false;

        return;
    }

    // calculates distance between cat and mouse
    let dx = g_mousePos[0] - g_catPos[0];
    let dy = g_mousePos[1] - g_catPos[1];
    let dist = Math.sqrt(dx * dx + dy * dy);

    // stops game if cat reaches mouse and displays ending text
    if (dist < 0.2) {
        g_gameRunning = false;
        g_gameEndScreen = true;

        sendTextToHTML("You were caught by the cat! Click 'Start Simple Cat-Mouse Game' to try again.", "numdot");
        renderAllShapes();

        return;
    }

    // moves cat towards mouse by normalizing direction of travel and multiplying 
    // by a constant movement rate
    g_catPos[0] += (dx / dist) * g_catMoveRate;
    g_catPos[1] += (dy / dist) * g_catMoveRate;

    // increments movement rate over time
    g_catMoveRate += 0.000005;

    // re-renders everything and calls to update cat's position on the next frame
    renderAllShapes();
    requestAnimationFrame(updateCatPos);
}

function renderAllShapes() {
    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;
    for (var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }

    // renders cat and mouse while game is running and on the ending screen
    if (g_gameRunning || g_gameEndScreen) {
        let mx = g_mousePos[0];
        let my = g_mousePos[1];
        let mouse = new Triangle();
        mouse.color = [0.6, 0.6, 0.6, 1.0];
        mouse.vertices = [mx, my + 0.1, mx - 0.1, my - 0.1, mx + 0.1, my - 0.1];
        mouse.render();

        let cx = g_catPos[0];
        let cy = g_catPos[1];
        let cat = new Triangle();
        cat.color = [1.0, 0.5, 0.0, 1.0];
        cat.vertices = [cx, cy + 0.2, cx - 0.2, cy - 0.2, cx + 0.2, cy - 0.2];
        cat.render();
    }

    // if game not running but shapes are on the canvas, displays performance stats text
    else if (len > 0) {
        var duration = performance.now() - startTime;
        sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration), "numdot");
    }

    // if neither, text is cleared
    else {
        sendTextToHTML("", "numdot");
    }
}

function drawPicture() {
    // clears shapes list and stops game
    g_shapesList = []

    g_gameRunning = false;
    g_gameEndScreen = false;

    // pushes laptop screen shapes to shapes list
    let rightLaptopScreen = new Triangle();
    rightLaptopScreen.color = [0.0, 0.5, 1.0, 0.9];
    rightLaptopScreen.vertices = [0.0, 0.4, 0.7, 0.8, 0.7, 0.0];
    g_shapesList.push(rightLaptopScreen);

    let leftLaptopScreen = new Triangle();
    leftLaptopScreen.color = [0.0, 0.5, 1.0, 0.9];;
    leftLaptopScreen.vertices = [-0.7, 0.0, -0.7, 0.8, 0.0, 0.4];
    g_shapesList.push(leftLaptopScreen);

    let topLaptopScreen = new Triangle();
    topLaptopScreen.color = [0.0, 0.5, 1.0, 0.8];
    topLaptopScreen.vertices = [-0.7, 0.8, 0.0, 0.4, 0.7, 0.8];
    g_shapesList.push(topLaptopScreen);

    let bottomLaptopScreen = new Triangle();
    bottomLaptopScreen.color = [0.0, 0.5, 1.0, 0.8];
    bottomLaptopScreen.vertices = [-0.7, 0.0, 0.0, 0.4, 0.7, 0.0];
    g_shapesList.push(bottomLaptopScreen);

    // pushes laptop screen edge shapes to shapes list
    let topLaptopScreenEdge = new Triangle();
    topLaptopScreenEdge.color = [0.0, 0.0, 0.0, 0.3];
    topLaptopScreenEdge.vertices = [-0.7, 0.8, 0.0, 0.75, 0.7, 0.8];
    g_shapesList.push(topLaptopScreenEdge);

    let bottomLaptopScreenEdge = new Triangle();
    bottomLaptopScreenEdge.color = [0.0, 0.0, 0.0, 0.3];
    bottomLaptopScreenEdge.vertices = [-0.7, 0.0, 0.0, 0.05, 0.7, 0.0];
    g_shapesList.push(bottomLaptopScreenEdge);

    let leftLaptopScreenEdge = new Triangle();
    leftLaptopScreenEdge.color = [0.0, 0.0, 0.0, 0.2];
    leftLaptopScreenEdge.vertices = [-0.7, 0.8, -0.65, 0.4, -0.7, 0.0];
    g_shapesList.push(leftLaptopScreenEdge);

    let rightLaptopScreenEdge = new Triangle();
    rightLaptopScreenEdge.color = [0.0, 0.0, 0.0, 0.2];
    rightLaptopScreenEdge.vertices = [0.7, 0.8, 0.65, 0.4, 0.7, 0.0];
    g_shapesList.push(rightLaptopScreenEdge);

    // pushes laptop bottom shapes to shapes list
    let topLaptopBottom = new Triangle();
    topLaptopBottom.color = [0.0, 0.0, 0.0, 0.2];
    topLaptopBottom.vertices = [-0.9, -0.8, -0.7, 0.0, 0.7, 0.0];
    g_shapesList.push(topLaptopBottom);

    let bottomLaptopBottom = new Triangle();
    bottomLaptopBottom.color = [0.0, 0.0, 0.0, 0.3];
    bottomLaptopBottom.vertices = [-0.9, -0.8, 0.9, -0.8, 0.7, 0.0];
    g_shapesList.push(bottomLaptopBottom);

    // pushes keyboard shapes to shapes list
    let rightKeyboard = new Triangle();
    rightKeyboard.color = [0.0, 0.0, 0.0, 0.7];
    rightKeyboard.vertices = [0.0, -0.3, 0.5, -0.1, 0.6, -0.5];
    g_shapesList.push(rightKeyboard);

    let leftKeyboard = new Triangle();
    leftKeyboard.color = [0.0, 0.0, 0.0, 0.7];
    leftKeyboard.vertices = [-0.6, -0.5, -0.5, -0.1, 0.0, -0.3];
    g_shapesList.push(leftKeyboard);

    let topKeyboard = new Triangle();
    topKeyboard.color = [0.0, 0.0, 0.0, 0.6];
    topKeyboard.vertices = [-0.5, -0.1, 0.0, -0.3, 0.5, -0.1];
    g_shapesList.push(topKeyboard);

    let bottomKeyboard = new Triangle();
    bottomKeyboard.color = [0.0, 0.0, 0.0, 0.6];
    bottomKeyboard.vertices = [-0.6, -0.5, 0.0, -0.3, 0.6, -0.5];
    g_shapesList.push(bottomKeyboard);

    // pushes touchpad shapes to shapes list
    let topTouchpad = new Triangle()
    topTouchpad.color = [0.0, 0.0, 0.0, 0.1];
    topTouchpad.vertices = [-0.2, -0.7, -0.2, -0.5, 0.2, -0.5];
    g_shapesList.push(topTouchpad);

    let bottomTouchpad = new Triangle()
    bottomTouchpad.color = [0.0, 0.0, 0.0, 0.2];
    bottomTouchpad.vertices = [-0.2, -0.7, 0.2, -0.5, 0.2, -0.7];
    g_shapesList.push(bottomTouchpad);

    // pushes S letter shapes to shapes list
    let topS = new Triangle()
    topS.color = [0.0, 0.5, 0.5, 1.0];
    topS.vertices = [-0.55, 0.55, -0.5, 0.6, -0.4, 0.5];
    g_shapesList.push(topS);

    let topMidS = new Triangle();
    topMidS.color = [0.0, 0.5, 0.5, 0.8];
    topMidS.vertices = [-0.6, 0.5, -0.55, 0.55, -0.5, 0.4];
    g_shapesList.push(topMidS);

    let bottomMidS = new Triangle();
    bottomMidS.color = [0.0, 0.5, 0.5, 1.0];
    bottomMidS.vertices = [-0.45, 0.25, -0.5, 0.4, -0.4, 0.3];
    g_shapesList.push(bottomMidS);

    let bottomS = new Triangle();
    bottomS.color = [0.0, 0.5, 0.5, 0.8];
    bottomS.vertices = [-0.6, 0.3, -0.5, 0.2, -0.45, 0.25];
    g_shapesList.push(bottomS);

    // pushes A letter shapes to shapes list
    let leftA = new Triangle();
    leftA.color = [0.0, 0.5, 0.5, 0.8];
    leftA.vertices = [0.4, 0.2, 0.4, 0.5, 0.5, 0.6];
    g_shapesList.push(leftA);

    let rightA = new Triangle();
    rightA.color = [0.0, 0.5, 0.5, 0.8];
    rightA.vertices = [0.5, 0.6, 0.6, 0.5, 0.6, 0.2];
    g_shapesList.push(rightA);

    let midA = new Triangle();
    midA.color = [0.0, 0.5, 0.5, 1.0];
    midA.vertices = [0.45, 0.4, 0.5, 0.3, 0.55, 0.4];
    g_shapesList.push(midA);

    renderAllShapes();
}

function startGame() {
    // clears shapes list, starts game, and initializes cat values
    g_shapesList = [];
    g_gameRunning = true;
    g_gameEndScreen = false;
    g_catPos = [0.5, 0.5];
    g_catMoveRate = 0.005;

    // clears any existing text, renders cat and mouse, and calls to update cat's position
    // on the next frame
    sendTextToHTML("", "numdot");
    renderAllShapes();
    requestAnimationFrame(updateCatPos);
}

function sendTextToHTML(text, htmlID) {
    var htmlElem = document.getElementById(htmlID);

    if (!htmlElem) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }

    htmlElem.innerHTML = text;
}
