class Cube {
    constructor() {
        this.type = 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = -2;
    }

    render() {
        //var xy = this.position;
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
       
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front Face
        drawTriangle3DUV([0,0,0 , 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);
        
        // Top Face
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,1, 0,0, 1,0]);
        drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,1, 1,0, 1,1]);

        // Back Face
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangle3DUV([0,0,1, 1,0,1, 1,1,1], [1,0, 0,0, 0,1]);
        drawTriangle3DUV([0,0,1, 1,1,1, 0,1,1], [1,0, 0,1, 1,1]);

        // Bottom Face
        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangle3DUV([0,0,0, 1,0,0, 1,0,1], [0,0, 1,0, 1,1]);
        drawTriangle3DUV([0,0,0, 1,0,1, 0,0,1], [0,0, 1,1, 0,1]);

        // Right Face
        gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);
        drawTriangle3DUV([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0]);

        // Left Face
        gl.uniform4f(u_FragColor, rgba[0] * 0.5, rgba[1] * 0.5, rgba[2] * 0.5, rgba[3]);
        drawTriangle3DUV([0,0,0, 0,0,1, 0,1,1], [1,0, 0,0, 0,1]);
        drawTriangle3DUV([0,0,0, 0,1,1, 0,1,0], [1,0, 0,1, 1,1]);
    }
}