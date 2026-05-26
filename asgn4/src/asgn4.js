// HelloPoint2.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    `precision mediump float;
     attribute vec4 a_Position;
     attribute vec2 a_UV;
     attribute vec3 a_Normal;
     varying vec2 v_UV;
     varying vec3 v_Normal;
     varying vec4 v_VertPos;
     uniform mat4 u_ModelMatrix;
     uniform mat4 u_NormalMatrix;
     uniform mat4 u_GlobalRotateMatrix;
     uniform mat4 u_ViewMatrix;
     uniform mat4 u_ProjectionMatrix;
   void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
        v_VertPos = u_ModelMatrix * a_Position;
   }`;

// Fragment shader program
var FSHADER_SOURCE =
    `precision mediump float;
     varying vec2 v_UV;
     varying vec3 v_Normal;
     uniform vec4 u_FragColor;
     uniform sampler2D u_Sampler0;
     uniform sampler2D u_Sampler1;
     uniform sampler2D u_Sampler2;
     uniform int u_whichTexture;
     uniform vec3 u_lightPos;
     uniform vec3 u_cameraPos;
     uniform bool u_lightOn;
     uniform vec3 u_spotLightPos;
     uniform vec3 u_spotLightDir;
     uniform float u_spotLightCutoff;
     uniform bool u_spotLightOn;
     varying vec4 v_VertPos;
     void main() {
        if (u_whichTexture == -3) {
            gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
        } 
        else if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor;
        }

        else if (u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV,1.0,1.0);
        }

        else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        }

        else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        }
        
        else if (u_whichTexture == 2) {
            gl_FragColor = texture2D(u_Sampler2, v_UV);
        }
        
        else {
            gl_FragColor = vec4(1, 0.2, 0.2, 1);
        } 
        
        vec3 lightVector = u_lightPos - vec3(v_VertPos);
        float r = length(lightVector);

        vec3 L = normalize(lightVector);
        vec3 N = normalize(v_Normal);
        float nDotL = max(dot(N, L), 0.0);

        vec3 R = reflect(-L, N);

        vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

        vec3 ambient = vec3(gl_FragColor) * 0.2;
        vec3 result = ambient;

        if (u_lightOn) {
            float specular = pow(max(dot(E, R), 0.0), 64.0) * 0.8;
            vec3 diffuse = vec3(1.0, 1.0, 0.9) * vec3(gl_FragColor) * nDotL * 0.7;
            if (u_whichTexture == 2) {
                result += diffuse + specular;
            }

            else {
                result += diffuse;
            }
        }

        if (u_spotLightOn) {
            vec3 spotLightVector = u_spotLightPos - vec3(v_VertPos);
            vec3 L2 = normalize(spotLightVector);
            vec3 D = normalize(-u_spotLightDir);
            float spotCosine = dot(D, L2);

            if (spotCosine >= u_spotLightCutoff) {
                float spotFactor = pow(spotCosine, 8.0);
                float nDotL2 = max(dot(N, L2), 0.0);
                vec3 R2 = reflect(-L2, N);
                float spec2 = pow(max(dot(E, R2), 0.0), 64.0) * 0.8;
                vec3 spotDiffuse = vec3(1.0, 0.95, 0.8) * vec3(gl_FragColor) * nDotL2 * spotFactor * 1.5;
                result += spotDiffuse + spec2 * spotFactor;
            }
        }
   
        gl_FragColor = vec4(result, 1.0);
    }`;

let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_NormalMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;
let u_cameraPos;
let u_spotLightPos;
let u_spotLightDir;
let u_spotLightCutoff;
let u_spotLightOn;

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

let g_pigAnimation = false;
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

let g_normalOn = false;

let g_lightPos = [0, 1, -2];
let g_lightManualXPos = 0;
let g_lightManualYPos = 1.5;
let g_lightManualZPos = 0;
let g_lightOn = true;

let g_spotLightPos = [-0.5,3,0];
let g_spotLightDir = [0,-1,0];
let g_spotLightOn = true;

let g_map = new Map([
    [3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 3],
    [3, 0, 0, 3, 4, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 3],
    [3, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3],
    [3, 0, 0, 0, 0, 1, 0, 4, 3, 0, 0, 2, 0, 0, 0, 3],
    [3, 0, 2, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 1, 0, 3],
    [3, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 4, 0, 0, 3],
    [3, 0, 0, 4, 0, 2, 0, 0, 0, 0, 0, 3, 4, 0, 0, 3],
    [3, 0, 1, 0, 0, 0, 0, 0, 4, 3, 0, 0, 0, 2, 0, 3],
    [3, 0, 0, 0, 0, 4, 0, 1, 3, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 3, 0, 0, 4, 0, 0, 0, 0, 2, 0, 1, 0, 0, 3],
    [3, 0, 0, 1, 0, 0, 0, 2, 0, 0, 4, 3, 0, 0, 0, 3],
    [3, 0, 0, 4, 0, 2, 0, 0, 0, 1, 3, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 3],
    [3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3],
]);

let g_camera = new Camera();

spawn();

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

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
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

    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
        console.log('Failed to get the storage location of u_NormalMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log('Failed to get the storage location of u_lightPos');
        return;
    }

    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log('Failed to get the storage location of u_lightOn');
        return;
    }

    u_spotLightPos = gl.getUniformLocation(gl.program, 'u_spotLightPos');
    if (!u_spotLightPos) {
        console.log('Failed to get the storage location of u_spotLightPos');
        return;
    }

    u_spotLightDir = gl.getUniformLocation(gl.program, 'u_spotLightDir');
    if (!u_spotLightDir) {
        console.log('Failed to get the storage location of u_spotLightDir');
        return;
    }

    u_spotLightCutoff = gl.getUniformLocation(gl.program, 'u_spotLightCutoff');
    if (!u_spotLightCutoff) {
        console.log('Failed to get the storage location of u_spotLightCutoff');
        return;
    }

    u_spotLightOn = gl.getUniformLocation(gl.program, 'u_spotLightOn');
    if (!u_spotLightOn) {
        console.log('Failed to get the storage location of u_spotLightOn');
        return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get the storage location of u_cameraPos');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHTMLUI() {
    document.getElementById('pointLightOn').onclick = function () { g_lightOn = true };
    document.getElementById('pointLightOff').onclick = function () { g_lightOn = false };
    document.getElementById('spotLightOn').onclick = function () { g_spotLightOn = true; };
    document.getElementById('spotLightOff').onclick = function () { g_spotLightOn = false; };
    document.getElementById('normalOn').onclick = function () { g_normalOn = true };
    document.getElementById('normalOff').onclick = function () { g_normalOn = false };
    document.getElementById('pigAnimationOnButton').onclick = function () { g_pigAnimation = true };
    document.getElementById('pigAnimationOffButton').onclick = function () { g_pigAnimation = false };

    document.getElementById('lightSlideX').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightManualXPos = -this.value / 100; renderScene(); } });
    document.getElementById('lightSlideY').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightManualYPos = this.value / 100; renderScene(); } });
    document.getElementById('lightSlideZ').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightManualZPos = -this.value / 100; renderScene(); } });

    let g_mouseMoved = false;
    canvas.addEventListener('mousedown', function (ev) {
        if (ev.shiftKey) {
            g_pokeAnimation = true;
            g_pokeFrame = 0;

            return;
        }

        g_mouseDrag = true;
        g_mouseMoved = false;
        g_lastMouseX = ev.clientX;
        g_lastMouseY = ev.clientY;
    });

    canvas.addEventListener('mousemove', function (ev) {
        if (!g_mouseDrag) {
            return;
        }

        g_mouseMoved = true

        let dx = ev.clientX - g_lastMouseX;
        let dy = ev.clientY - g_lastMouseY;

        if (dx > 0) {
            g_camera.panRight(dx * 0.2);
        }

        else if (dx < 0) {
            g_camera.panLeft(-dx * 0.2);
        }

        g_camera.pitch(-dy * 0.2);

        g_lastMouseX = ev.clientX;
        g_lastMouseY = ev.clientY;

        renderScene();

    });

    canvas.addEventListener('mouseup', function () { g_mouseDrag = false; });
    canvas.addEventListener('mouseleave', function () { g_mouseDrag = false; });

    canvas.addEventListener('click', function (ev) {
        if (g_mouseMoved) return;

        let fx = g_camera.at.elements[0] - g_camera.eye.elements[0];
        let fz = g_camera.at.elements[2] - g_camera.eye.elements[2];
        let len = Math.sqrt(fx * fx + fz * fz);
        fx /= len;
        fz /= len;

        let tx = Math.floor(g_camera.eye.elements[0] + fx * 2.5 + 8);
        let tz = Math.floor(g_camera.eye.elements[2] + fz * 2.5 + 8);

        if (tx >= 0 && tx < 16 && tz >= 0 && tz < 16) {
            g_map.addBlock(tx, tz);
        }
    });

    canvas.addEventListener('contextmenu', function (ev) {
        ev.preventDefault();
        if (g_mouseMoved) return;

        let fx = g_camera.at.elements[0] - g_camera.eye.elements[0];
        let fz = g_camera.at.elements[2] - g_camera.eye.elements[2];
        let len = Math.sqrt(fx * fx + fz * fz);
        fx /= len;
        fz /= len;

        let tx = Math.floor(g_camera.eye.elements[0] + fx * 2.5 + 8);
        let tz = Math.floor(g_camera.eye.elements[2] + fz * 2.5 + 8);

        if (tx >= 0 && tx < 16 && tz >= 0 && tz < 16) {
            g_map.removeBlock(tx, tz);
        }
    });
}

function initTextures() {
    var skyImage = new Image();
    var groundImage = new Image();
    var wallImage = new Image();

    if (!skyImage || !groundImage || !wallImage) {
        console.log('Failed to create image objects');
        return false;
    }

    skyImage.onload = function () {
        sendTextureToGLSL(skyImage, 0);
    };

    groundImage.onload = function () {
        sendTextureToGLSL(groundImage, 1);
    };

    wallImage.onload = function () {
        sendTextureToGLSL(wallImage, 2);
    };

    skyImage.src = 'sky.jpg';
    groundImage.src = 'ground.jpg';
    wallImage.src = 'wall.jpg';

    return true;
}

function sendTextureToGLSL(image, textureUnit) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    if (textureUnit == 0) {
        gl.activeTexture(gl.TEXTURE0);
    }

    else if (textureUnit == 1) {
        gl.activeTexture(gl.TEXTURE1);
    }

    else if (textureUnit == 2) {
        gl.activeTexture(gl.TEXTURE2);
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    if (textureUnit == 0) {
        gl.uniform1i(u_Sampler0, 0);
    }

    else if (textureUnit == 1) {
        gl.uniform1i(u_Sampler1, 1);
    }

    else if (textureUnit == 2) {
        gl.uniform1i(u_Sampler2, 2);
    }
}

function main() {
    setupWebGL();

    connectVariablesToGLSL();

    addActionsForHTMLUI();

    document.onkeydown = keydown;

    initTextures();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    g_bunny = new Model(gl, "bunny.obj");

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

        g_flUpperWalkAngle = 30 * Math.sin(pf * 0.4);
        g_brUpperWalkAngle = 30 * Math.sin(pf * 0.4);
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
        g_earAngle = 15 * Math.sin(pf * 0.6);

        if (pf > 90) {
            g_pokeAnimation = false;
            g_pokeFrame = 0;
        }

        return;
    }

    if (g_pigAnimation) {
        let t = g_seconds;

        g_bodyAngle = 2 * Math.sin(t * 6.0);

        let fl_br = Math.sin(t * 3.0);
        let fr_bl = -Math.sin(t * 3.0);

        g_flUpperWalkAngle = 28 * fl_br;
        g_brUpperWalkAngle = 28 * fl_br;
        g_frUpperWalkAngle = 28 * fr_bl;
        g_blUpperWalkAngle = 28 * fr_bl;

        g_flLowerWalkAngle = 40 * Math.max(0, fl_br);
        g_brLowerWalkAngle = 40 * Math.max(0, fl_br);
        g_frLowerWalkAngle = 40 * Math.max(0, fr_bl);
        g_blLowerWalkAngle = 40 * Math.max(0, fr_bl);

        g_flFootWalkAngle = 20 * Math.max(0, fl_br);
        g_brFootWalkAngle = 20 * Math.max(0, fl_br);
        g_frFootWalkAngle = 20 * Math.max(0, fr_bl);
        g_blFootWalkAngle = 20 * Math.max(0, fr_bl);

        g_tailAngle = 35 * Math.sin(t * 5.0);
        g_earAngle = 8 * Math.sin(t * 4.0);
    }

    var orbitRadius = 5.0;
    g_lightPos[0] = orbitRadius * Math.cos(g_seconds * 0.5) + g_lightManualXPos;
    g_lightPos[1] = g_lightManualYPos;
    g_lightPos[2] = orbitRadius * Math.sin(g_seconds * 0.5) + g_lightManualZPos;
}

function spawn() {
    g_camera.eye = new Vector3([0, 0, -2.5]);
    g_camera.at = new Vector3([0, 0, 0]);
    g_camera.up = new Vector3([0, 1, 0]);
}

function keydown(ev) {
    // w
    if (ev.keyCode == 87) {
        g_camera.forward();
    }

    // a
    else if (ev.keyCode == 65) {
        g_camera.left();
    }

    // s
    else if (ev.keyCode == 83) {
        g_camera.back();
    }

    // d
    else if (ev.keyCode == 68) {
        g_camera.right();
    }

    else if (ev.keyCode == 81) {
        g_camera.panLeft();
    }

    else if (ev.keyCode == 69) {
        g_camera.panRight();
    }

    renderScene();
}

function setNormalMatrix(modelMatrix) {
    var normalMatrix = new Matrix4();

    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
}

function renderScene() {
    var projMat = new Matrix4();
    projMat.setPerspective(50, canvas.width / canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = new Matrix4();
    viewMat.setLookAt(g_camera.eye.elements[0],
        g_camera.eye.elements[1],
        g_camera.eye.elements[2],

        g_camera.at.elements[0],
        g_camera.at.elements[1],
        g_camera.at.elements[2],

        g_camera.up.elements[0],
        g_camera.up.elements[1],
        g_camera.up.elements[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const PINK = [1.0, 0.71, 0.75, 1.0];
    const DARK_PINK = [0.93, 0.56, 0.56, 1.0];
    const BLACK = [0.1, 0.1, 0.1, 1.0];
    const WHITE = [0.95, 0.95, 0.95, 1.0];

    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

    gl.uniform1i(u_lightOn, g_lightOn);

    gl.uniform3f(u_spotLightPos, g_spotLightPos[0], g_spotLightPos[1], g_spotLightPos[2]);

    gl.uniform3f(u_spotLightDir, g_spotLightDir[0], g_spotLightDir[1], g_spotLightDir[2]);

    gl.uniform1f(u_spotLightCutoff, Math.cos(Math.PI / 4));

    gl.uniform1i(u_spotLightOn, g_spotLightOn);

    var light = new Cube();
    light.color = [2, 2, 0, 1];
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-0.1, -0.1, -0.1);
    light.matrix.translate(-0.5, -0.5, -0.5);
    light.render();

    var spotLight = new Cone();
    spotLight.color = [0.1, 0.1, 0.1, 1];
    spotLight.matrix.translate(g_spotLightPos[0], g_spotLightPos[1], g_spotLightPos[2]);
    spotLight.matrix.rotate(0, 1, 0, 0);
    spotLight.matrix.scale(1, 0.8, 0.8);
    var spotLightMat = new Matrix4(spotLight.matrix);
    spotLight.render();

    var bulb = new Cube();
    bulb.color = [2, 2, 0, 1];
    bulb.matrix = new Matrix4(spotLightMat);
    bulb.matrix.translate(-0.18, -0.1, -0.15);
    bulb.matrix.scale(0.35, 0.35, 0.35);
    bulb.render();

    var sphere = new Sphere();
    sphere.color = [1.0, 0.71, 0.75, 1.0];
    if (g_normalOn) sphere.textureNum = -3;
    else sphere.textureNum = 2;
    sphere.matrix.translate(-1.5, 0.75, 0);
    setNormalMatrix(sphere.matrix); 
    sphere.render();

    var ground = new Cube();
    ground.color = [1.0, 0.0, 0.0, 1.0];
    if (g_normalOn) ground.textureNum = -3;
    else ground.textureNum = 1;
    ground.matrix.translate(0, -0.75, 0.0);
    ground.matrix.scale(16, 0.01, 16);
    ground.matrix.translate(-0.5, 0, -0.5);
    setNormalMatrix(ground.matrix); 
    ground.render();

    var sky = new Cube();
    sky.color = [1.0, 0.0, 0.0, 1.0];
    if (g_normalOn) sky.textureNum = -3;
    else sky.textureNum = 0
    sky.matrix.scale(-50, -50, -50);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();

    // g_map.render();

    g_bunny.color = [];
    g_bunny.matrix = new Matrix4();
    g_bunny.color = [0.55, 0.35, 0.20, 1.0];
    if (g_normalOn) g_bunny.textureNum = -3;
    else g_bunny.textureNum = -2;
    g_bunny.matrix.translate(1.55, -0.9, 0);
    g_bunny.matrix.scale(0.2, 0.2, 0.2);
    g_bunny.matrix.rotate(270,0, 1, 0);
    setNormalMatrix(g_bunny.matrix); 
    g_bunny.render(gl, gl.program);

    var body = new Cube();
    body.color = PINK;
    if (g_normalOn) body.textureNum = -3;
    body.matrix.translate(0.3, -0.29, 0.0);
    body.matrix.rotate(g_bodyAngle, 1, 0, 0);
    var bodyMat = new Matrix4(body.matrix);
    body.matrix.translate(-0.3, -0.2, -0.2);
    body.matrix.scale(0.6, 0.7, 0.75);
    setNormalMatrix(body.matrix); 
    body.render();

    var head = new Cube();
    head.color = PINK;
    if (g_normalOn) head.textureNum = -3;
    head.matrix = new Matrix4(bodyMat);
    head.matrix.translate(-0.35, 0.0, -0.5);
    var headMat = new Matrix4(head.matrix);
    head.matrix.scale(0.7, 0.65, 0.65);
    setNormalMatrix(head.matrix); 
    head.render();

    var snout = new Cube();
    snout.color = DARK_PINK;
    if (g_normalOn) snout.textureNum = -3;
    snout.matrix = new Matrix4(headMat);
    snout.matrix.translate(0.2, 0.11, -0.1);
    snout.matrix.scale(0.3, 0.2, 0.1);
    setNormalMatrix(snout.matrix); 
    snout.render();

    var lNostril = new Cube();
    lNostril.color = BLACK;
    if (g_normalOn) lNostril.textureNum = -3;
    lNostril.matrix = new Matrix4(headMat);
    lNostril.matrix.translate(0.3, 0.19, -0.11);
    lNostril.matrix.scale(0.03, 0.07, 0.02);
    setNormalMatrix(lNostril.matrix); 
    lNostril.render();

    var rNostril = new Cube();
    rNostril.color = BLACK;
    if (g_normalOn) rNostril.textureNum = -3;
    rNostril.matrix = new Matrix4(headMat);
    rNostril.matrix.translate(0.38, 0.19, -0.11);
    rNostril.matrix.scale(0.03, 0.07, 0.02);
    setNormalMatrix(rNostril.matrix); 
    rNostril.render();

    var lEye = new Cube();
    lEye.color = BLACK;
    if (g_normalOn) lEye.textureNum = -3;
    lEye.matrix = new Matrix4(headMat);
    lEye.matrix.translate(0.15, 0.32, -0.01);
    lEye.matrix.scale(0.08, 0.12, 0.02);
    setNormalMatrix(lEye.matrix); 
    lEye.render();

    var rEye = new Cube();
    rEye.color = BLACK;
    if (g_normalOn) rEye.textureNum = -3;
    rEye.matrix = new Matrix4(headMat);
    rEye.matrix.translate(0.45, 0.32, -0.01);
    rEye.matrix.scale(0.08, 0.12, 0.02);
    setNormalMatrix(rEye.matrix); 
    rEye.render();

    var lOutEar = new Cube();
    lOutEar.color = PINK;
    if (g_normalOn) lOutEar.textureNum = -3;
    lOutEar.matrix = new Matrix4(headMat);
    lOutEar.matrix.translate(0.05, 0.63, 0.4);
    lOutEar.matrix.rotate(g_earAngle - g_leftEarAngle, 0, 0, 1);
    var lEarMat = new Matrix4(lOutEar.matrix);
    lOutEar.matrix.scale(0.2, 0.2, 0.1);
    setNormalMatrix(lOutEar.matrix); 
    lOutEar.render();

    var lInEar = new Cube();
    lInEar.color = DARK_PINK;
    if (g_normalOn) lInEar.textureNum = -3;
    lInEar.matrix = new Matrix4(lEarMat);
    lInEar.matrix.translate(0.025, 0.0, -0.01);
    lInEar.matrix.scale(0.15, 0.15, 0.1);
    setNormalMatrix(lInEar.matrix); 
    lInEar.render();

    var lTopEar = new Cube();
    lTopEar.color = PINK;
    if (g_normalOn) lTopEar.textureNum = -3;
    lTopEar.matrix = new Matrix4(lEarMat);
    lTopEar.matrix.translate(0.0, 0.1, -0.08);
    lTopEar.matrix.scale(0.2, 0.1, 0.1);
    setNormalMatrix(lTopEar.matrix); 
    lTopEar.render();

    var rOutEar = new Cube();
    rOutEar.color = PINK;
    if (g_normalOn) rOutEar.textureNum = -3;
    rOutEar.matrix = new Matrix4(headMat);
    rOutEar.matrix.translate(0.45, 0.63, 0.4);
    rOutEar.matrix.rotate(-g_earAngle - g_rightEarAngle, 0, 0, 1);
    var rEarMat = new Matrix4(rOutEar.matrix);
    rOutEar.matrix.scale(0.2, 0.2, 0.1);
    setNormalMatrix(rOutEar.matrix); 
    rOutEar.render();

    var rInEar = new Cube();
    rInEar.color = DARK_PINK;
    if (g_normalOn) rInEar.textureNum = -3;
    rInEar.matrix = new Matrix4(rEarMat);
    rInEar.matrix.translate(0.025, 0.0, -0.01);
    rInEar.matrix.scale(0.15, 0.15, 0.1);
    setNormalMatrix(rInEar.matrix); 
    rInEar.render();

    var rTopEar = new Cube();
    rTopEar.color = PINK;
    if (g_normalOn) rTopEar.textureNum = -3;
    rTopEar.matrix = new Matrix4(rEarMat);
    rTopEar.matrix.translate(0.0, 0.1, -0.08);
    rTopEar.matrix.scale(0.2, 0.1, 0.1);
    setNormalMatrix(rTopEar.matrix); 
    rTopEar.render();

    var tailMatrix = new Matrix4();
    tailMatrix.translate(0.3, 0.0, 0.54);
    tailMatrix.rotate(90, 0, 0, 1);
    tailMatrix.rotate(90, 1, 0, 0);
    tailMatrix.rotate(g_tailAngle - g_tailManualAngle, 1, 0, 0);

    var tailSegments = 10;
    var baseRadius = 0.045;
    var tipRadius = 0.008;

    for (let i = 0; i < tailSegments; i++) {
        var t = i / (tailSegments - 1);
        var r = baseRadius + t * (tipRadius - baseRadius);

        var tailCone = new Cone();
        tailCone.color = DARK_PINK;
        if (g_normalOn) tailCone.textureNum = -3;
        tailCone.segments = 12;
        tailCone.height = 0.06;
        tailCone.radius = r;
        tailCone.matrix = new Matrix4(tailMatrix);
        setNormalMatrix(tailCone.matrix); 
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
        if (g_normalOn) upper.textureNum = -3;
        upper.matrix = new Matrix4(upperPivot);
        upper.matrix.translate(-0.07, -0.2, -0.07);
        upper.matrix.scale(0.18, 0.18, 0.18);
        setNormalMatrix(upper.matrix); 
        upper.render();

        var lowerPivot = new Matrix4(upperPivotMat);
        lowerPivot.translate(0, -0.13, 0);
        lowerPivot.rotate(-lowerAngle, 1, 0, 0);
        var lowerPivotMat = new Matrix4(lowerPivot);

        var lower = new Cube();
        if (g_normalOn) lower.textureNum = -3;
        lower.color = PINK;
        lower.matrix = new Matrix4(lowerPivot);
        lower.matrix.translate(-0.05, -0.18, -0.05);
        lower.matrix.scale(0.14, 0.14, 0.14);
        setNormalMatrix(lower.matrix); 
        lower.render();

        var footPivot = new Matrix4(lowerPivotMat);
        footPivot.translate(0, -0.13, 0);
        footPivot.rotate(-footAngle, 1, 0, 0);

        var foot = new Cube();
        if (g_normalOn) foot.textureNum = -3;
        foot.color = DARK_PINK;
        foot.matrix = new Matrix4(footPivot);
        foot.matrix.translate(-0.035, -0.1, -0.03);
        foot.matrix.scale(0.10, 0.10, 0.10);
        setNormalMatrix(foot.matrix); 
        foot.render();
    }

    renderLeg(-0.23, -0.1, -0.08, g_flUpperWalkAngle + g_flUpperAngle, g_flLowerWalkAngle + g_flLowerAngle, g_flFootWalkAngle + g_flFootAngle);

    renderLeg(0.19, -0.1, -0.08, g_frUpperWalkAngle + g_frUpperAngle, g_frLowerWalkAngle + g_frLowerAngle, g_frFootWalkAngle + g_frFootAngle);

    renderLeg(-0.23, -0.1, 0.39, g_blUpperWalkAngle + g_blUpperAngle, g_blLowerWalkAngle + g_blLowerAngle, g_blFootWalkAngle + g_blFootAngle);

    renderLeg(0.19, -0.1, 0.39, g_brUpperWalkAngle + g_brUpperAngle, g_brLowerWalkAngle + g_brLowerAngle, g_brFootWalkAngle + g_brFootAngle);
}

function sendTextToHTML(text, htmlID) {
    var htmlElem = document.getElementById(htmlID);

    if (!htmlElem) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }

    htmlElem.innerHTML = text;
}
