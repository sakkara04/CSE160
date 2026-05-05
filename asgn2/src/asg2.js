// HelloPoint2.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    `attribute vec4 a_Position;
//   uniform float u_Size;
     uniform mat4 u_ModelMatrix;
     uniform mat4 u_GlobalRotateMatrix;
   void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    //  gl_Position = a_Position;
    //  gl_PointSize = u_Size;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
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

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_globalAngleX = 0;
let g_globalAngleY = 20;

let g_leftEarAngle = 0;
let g_rightEarAngle = 0;
let g_tailManualAngle = 0;

let g_flUpperAngle = 0;
let g_flLowerAngle = 0;
let g_flFootAngle = 0;

let g_frUpperAngle = 0;
let g_frLowerAngle = 0;
let g_frFootAngle = 0;

let g_blUpperAngle = 0;
let g_blLowerAngle = 0;
let g_blFootAngle = 0;

let g_brUpperAngle = 0;
let g_brLowerAngle = 0;
let g_brFootAngle = 0;

let g_animation = false;
let g_pokeAnimation = false;
let g_pokeFrame = 0;

let g_bodyAngle = 0;
let g_tailAngle = 0;
let g_earAngle = 0;

let g_flUpperWalkAngle = 0;
let g_flLowerWalkAngle = 0;
let g_flFootWalkAngle = 0;

let g_frUpperWalkAngle = 0;
let g_frLowerWalkAngle = 0;
let g_frFootWalkAngle = 0;

let g_blUpperWalkAngle = 0;
let g_blLowerWalkAngle = 0;
let g_blFootWalkAngle = 0;

let g_brUpperWalkAngle = 0;
let g_brLowerWalkAngle = 0;
let g_brFootWalkAngle = 0;

let g_mouseDrag = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

let g_fps = 0;
let g_frameCount = 0;
let g_fpsLastTime = performance.now();

let g_armAngle = 0;
let g_boxAngle = 0;

function addActionsForHTMLUI() {
    document.getElementById('animationOnButton').onclick = function () {g_animation = true};
    document.getElementById('animationOffButton').onclick = function () {g_animation = false};

    document.getElementById('globalAngleXSlide').addEventListener('mousemove', function () { g_globalAngleX = -this.value; renderScene(); });
    document.getElementById('globalAngleYSlide').addEventListener('mousemove', function () { g_globalAngleY = -this.value; renderScene(); });

    document.getElementById('leftEarSlide').addEventListener('mousemove', function () { g_leftEarAngle = this.value; renderScene(); });
    document.getElementById('rightEarSlide').addEventListener('mousemove', function () { g_rightEarAngle = this.value; renderScene(); });
    document.getElementById('tailSlide').addEventListener('mousemove', function () { g_tailManualAngle = this.value; renderScene(); });

    document.getElementById('flUpperSlide').addEventListener('mousemove', function () { g_flUpperAngle = -this.value; renderScene(); });
    document.getElementById('flLowerSlide').addEventListener('mousemove', function () { g_flLowerAngle = -this.value; renderScene(); });
    document.getElementById('flFootSlide').addEventListener('mousemove', function () { g_flFootAngle = -this.value; renderScene(); });

    document.getElementById('frUpperSlide').addEventListener('mousemove', function () { g_frUpperAngle = -this.value; renderScene(); });
    document.getElementById('frLowerSlide').addEventListener('mousemove', function () { g_frLowerAngle = -this.value; renderScene(); });
    document.getElementById('frFootSlide').addEventListener('mousemove', function () { g_frFootAngle = -this.value; renderScene(); });

    document.getElementById('blUpperSlide').addEventListener('mousemove', function () { g_blUpperAngle = -this.value; renderScene(); });
    document.getElementById('blLowerSlide').addEventListener('mousemove', function () { g_blLowerAngle = -this.value; renderScene(); });
    document.getElementById('blFootSlide').addEventListener('mousemove', function () { g_blFootAngle = -this.value; renderScene(); });

    document.getElementById('brUpperSlide').addEventListener('mousemove', function () { g_brUpperAngle = -this.value; renderScene(); });
    document.getElementById('brLowerSlide').addEventListener('mousemove', function () { g_brLowerAngle = -this.value; renderScene(); });
    document.getElementById('brFootSlide').addEventListener('mousemove', function () { g_brFootAngle = -this.value; renderScene(); });

    canvas.addEventListener('mousedown', function(ev) {
        if (ev.shiftKey) {
            g_pokeAnimation = true;
            g_pokeFrame = 0;

            return;
        }

        g_mouseDrag = true;
        g_lastMouseX = ev.clientX;
        g_lastMouseY = ev.clientY;
    });

    canvas.addEventListener('mousemove', function(ev) {
        if (!g_mouseDrag) {
            return;
        }

        let dx = ev.clientX - g_lastMouseX;
        let dy = ev.clientY - g_lastMouseY;

        g_globalAngleY -= dx * 0.5;
        g_globalAngleX -= dy * 0.5;

        g_globalAngleX = Math.max(-360, Math.min(360, g_globalAngleX));
        g_globalAngleY = Math.max(-360, Math.min(360, g_globalAngleY));

        g_lastMouseX = ev.clientX;
        g_lastMouseY = ev.clientY;

        document.getElementById('globalAngleXSlide').value = -g_globalAngleX;
        document.getElementById('globalAngleYSlide').value = -g_globalAngleY;

        renderScene();
    });

    canvas.addEventListener('mouseup', function() {g_mouseDrag = false;});
    canvas.addEventListener('mouseleave', function() {g_mouseDrag = false;});
}

function main() {
    setupWebGL();

    connectVariablesToGLSL();

    addActionsForHTMLUI();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;

    g_frameCount++;
    let now = performance.now();
    let elapsed = now - g_fpsLastTime;
    if (elapsed >= 500) {
        g_fps = Math.round(g_frameCount / (elapsed / 1000));
        g_frameCount = 0;
        g_fpsLastTime = now;
        sendTextToHTML('Performance: ' + g_fps + ' FPS', 'fps');
    }

    updateAnimationAngles();

    renderScene();

    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_pokeAnimation) {
        let pf = g_pokeFrame++;
 
        g_bodyAngle = 4 * Math.sin(pf * 0.4);
 
        g_flUpperWalkAngle =  30 * Math.sin(pf * 0.4);
        g_brUpperWalkAngle =  30 * Math.sin(pf * 0.4);
        g_frUpperWalkAngle = -30 * Math.sin(pf * 0.4);
        g_blUpperWalkAngle = -30 * Math.sin(pf * 0.4);
 
        let smoothBend = 15 * (0.5 - 0.5 * Math.cos(pf * 0.8));
        g_flLowerWalkAngle = smoothBend;
        g_frLowerWalkAngle = smoothBend;
        g_blLowerWalkAngle = smoothBend;
        g_brLowerWalkAngle = smoothBend;
 
        g_flFootWalkAngle = 0;
        g_frFootWalkAngle = 0;
        g_blFootWalkAngle = 0;
        g_brFootWalkAngle = 0;
 
        g_tailAngle = 40 * Math.sin(pf * 0.8);
        g_earAngle  = 15 * Math.sin(pf * 0.6);
 
        if (pf > 90) {
            g_pokeAnimation = false;
            g_pokeFrame     = 0;
        }

        return;
    }
 
    if (g_animation) {
       let t = g_seconds;

        g_bodyAngle = 2 * Math.sin(t * 6.0);

        let fl_br =  Math.sin(t * 3.0);
        let fr_bl = -Math.sin(t * 3.0);

        g_flUpperWalkAngle =  28 * fl_br;
        g_brUpperWalkAngle =  28 * fl_br;
        g_frUpperWalkAngle =  28 * fr_bl;
        g_blUpperWalkAngle =  28 * fr_bl;

        g_flLowerWalkAngle =  40 * Math.max(0, fl_br);
        g_brLowerWalkAngle =  40 * Math.max(0, fl_br);
        g_frLowerWalkAngle =  40 * Math.max(0, fr_bl);
        g_blLowerWalkAngle =  40 * Math.max(0, fr_bl);

        g_flFootWalkAngle =  20 * Math.max(0, fl_br);
        g_brFootWalkAngle =  20 * Math.max(0, fl_br);
        g_frFootWalkAngle =  20 * Math.max(0, fr_bl);
        g_blFootWalkAngle =  20 * Math.max(0, fr_bl);

        g_tailAngle = 35 * Math.sin(t * 5.0);
        g_earAngle  =  8 * Math.sin(t * 4.0);
    }
}

function renderScene() {
    var globalRotMat = new Matrix4().rotate(g_globalAngleX, 1, 0, 0).rotate(g_globalAngleY, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const PINK       = [1.0, 0.71, 0.75, 1.0];
    const DARK_PINK  = [0.93, 0.56, 0.56, 1.0];
    const BLACK      = [0.1,  0.1,  0.1,  1.0];
    const WHITE     = [0.95, 0.95, 0.95, 1.0];

    var body = new Cube();
    body.color = PINK;
    body.matrix.translate(0.0, -0.1, 0.0);
    body.matrix.rotate(g_bodyAngle, 1, 0, 0);
    var bodyMat = new Matrix4(body.matrix);
    body.matrix.translate(-0.3, -0.2, -0.2);
    body.matrix.scale(0.6, 0.7, 0.75);
    body.render();
 
    var head = new Cube();
    head.color = PINK;
    head.matrix = new Matrix4(bodyMat);
    head.matrix.translate(-0.35, 0.0, -0.5);
    var headMat = new Matrix4(head.matrix);
    head.matrix.scale(0.7, 0.65, 0.65);
    head.render();

    var snout = new Cube();
    snout.color = DARK_PINK;
    snout.matrix = new Matrix4(headMat);
    snout.matrix.translate(0.2, 0.11, -0.1);
    snout.matrix.scale(0.3, 0.2, 0.1);
    snout.render();
 
    var lNostril = new Cube();
    lNostril.color = BLACK;
    lNostril.matrix = new Matrix4(headMat);
    lNostril.matrix.translate(0.3, 0.19, -0.11);
    lNostril.matrix.scale(0.03, 0.07, 0.02);
    lNostril.render();
 
    var rNostril = new Cube();
    rNostril.color = BLACK;
    rNostril.matrix = new Matrix4(headMat);
    rNostril.matrix.translate(0.38, 0.19, -0.11);
    rNostril.matrix.scale(0.03, 0.07, 0.02);
    rNostril.render();
 
    var lEye = new Cube();
    lEye.color = BLACK;
    lEye.matrix = new Matrix4(headMat);
    lEye.matrix.translate(0.15, 0.32, -0.01);
    lEye.matrix.scale(0.08, 0.12, 0.02);
    lEye.render();
 
    var rEye = new Cube();
    rEye.color = BLACK;
    rEye.matrix = new Matrix4(headMat);
    rEye.matrix.translate(0.45, 0.32, -0.01);
    rEye.matrix.scale(0.08, 0.12, 0.02);
    rEye.render();
 
    var lOutEar = new Cube();
    lOutEar.color = PINK;
    lOutEar.matrix = new Matrix4(headMat);
    lOutEar.matrix.translate(0.05, 0.63, 0.4);
    lOutEar.matrix.rotate(g_earAngle - g_leftEarAngle, 0, 0, 1);
    var lEarMat = new Matrix4(lOutEar.matrix);
    lOutEar.matrix.scale(0.2, 0.2, 0.1);
    lOutEar.render();
 
    var lInEar = new Cube();
    lInEar.color = DARK_PINK;
    lInEar.matrix = new Matrix4(lEarMat);
    lInEar.matrix.translate(0.025, 0.0, -0.01);
    lInEar.matrix.scale(0.15, 0.15, 0.1);
    lInEar.render();
 
    var lTopEar = new Cube();
    lTopEar.color = PINK;
    lTopEar.matrix = new Matrix4(lEarMat);
    lTopEar.matrix.translate(0.0, 0.1, -0.08);
    lTopEar.matrix.scale(0.2, 0.1, 0.1);
    lTopEar.render();

    var rOutEar = new Cube();
    rOutEar.color = PINK;
    rOutEar.matrix = new Matrix4(headMat);
    rOutEar.matrix.translate(0.45, 0.63, 0.4);
    rOutEar.matrix.rotate(-g_earAngle - g_rightEarAngle, 0, 0, 1);
    var rEarMat = new Matrix4(rOutEar.matrix);
    rOutEar.matrix.scale(0.2, 0.2, 0.1);
    rOutEar.render();
 
    var rInEar = new Cube();
    rInEar.color = DARK_PINK;
    rInEar.matrix = new Matrix4(rEarMat);
    rInEar.matrix.translate(0.025, 0.0, -0.01);
    rInEar.matrix.scale(0.15, 0.15, 0.1);
    rInEar.render();
 
    var rTopEar = new Cube();
    rTopEar.color = PINK;
    rTopEar.matrix = new Matrix4(rEarMat);
    rTopEar.matrix.translate(0.0, 0.1, -0.08);
    rTopEar.matrix.scale(0.2, 0.1, 0.1);
    rTopEar.render();
 
    var tailMatrix = new Matrix4();
    tailMatrix.translate(0.0, 0.15, 0.54);
    tailMatrix.rotate(90, 0, 0, 1);
    tailMatrix.rotate(90, 1, 0, 0);
    tailMatrix.rotate(g_tailAngle - g_tailManualAngle, 1, 0, 0);

    var tailSegments = 10;
    var baseRadius = 0.045;
    var tipRadius  = 0.008;

    for (let i = 0; i < tailSegments; i++) {
        var t = i / (tailSegments - 1);
        var r = baseRadius + t * (tipRadius - baseRadius);

        var tailCone = new Cone();
        tailCone.color = DARK_PINK;
        tailCone.segments = 12;
        tailCone.height = 0.06;
        tailCone.radius = r;
        tailCone.matrix = new Matrix4(tailMatrix);
        tailCone.render();

        tailMatrix.translate(0, 0.04, 0);
        tailMatrix.rotate(60, 1, 0, 0);
        tailMatrix.rotate(60, 0, 1, 0);
    }

    function renderLeg(pivotX, pivotY, pivotZ, upperAngle, lowerAngle, footAngle) {
        var upperPivot = new Matrix4(bodyMat);
        upperPivot.translate(pivotX, pivotY, pivotZ);
        upperPivot.rotate(-upperAngle, 1, 0, 0);
        var upperPivotMat = new Matrix4(upperPivot);

        var upper = new Cube();
        upper.color = PINK;
        upper.matrix = new Matrix4(upperPivot);
        upper.matrix.translate(-0.07, -0.2, -0.07);
        upper.matrix.scale(0.18, 0.18, 0.18);
        upper.render();

        var lowerPivot = new Matrix4(upperPivotMat);
        lowerPivot.translate(0, -0.13, 0);
        lowerPivot.rotate(-lowerAngle, 1, 0, 0);
        var lowerPivotMat = new Matrix4(lowerPivot);

        var lower = new Cube();
        lower.color = PINK;
        lower.matrix = new Matrix4(lowerPivot);
        lower.matrix.translate(-0.05, -0.18, -0.05);
        lower.matrix.scale(0.14, 0.14, 0.14);
        lower.render();

        var footPivot = new Matrix4(lowerPivotMat);
        footPivot.translate(0, -0.13, 0);
        footPivot.rotate(-footAngle, 1, 0, 0);

        var foot = new Cube();
        foot.color = DARK_PINK;
        foot.matrix = new Matrix4(footPivot);
        foot.matrix.translate(-0.035, -0.1, -0.03);
        foot.matrix.scale(0.10, 0.10, 0.10);
        foot.render();
    }

    renderLeg(-0.23, -0.1, -0.08, g_flUpperWalkAngle + g_flUpperAngle, g_flLowerWalkAngle + g_flLowerAngle, g_flFootWalkAngle + g_flFootAngle);

    renderLeg( 0.19, -0.1, -0.08, g_frUpperWalkAngle + g_frUpperAngle, g_frLowerWalkAngle + g_frLowerAngle, g_frFootWalkAngle + g_frFootAngle);

    renderLeg(-0.23, -0.1,  0.39, g_blUpperWalkAngle + g_blUpperAngle, g_blLowerWalkAngle + g_blLowerAngle, g_blFootWalkAngle + g_blFootAngle);

    renderLeg( 0.19, -0.1,  0.39, g_brUpperWalkAngle + g_brUpperAngle, g_brLowerWalkAngle + g_brLowerAngle, g_brFootWalkAngle + g_brFootAngle);
}

function sendTextToHTML(text, htmlID) {
    var htmlElem = document.getElementById(htmlID);

    if (!htmlElem) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }

    htmlElem.innerHTML = text;
}
