class Cone {
    constructor() {
        this.type = 'cone';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.segments = 12;
        this.height = 1.0;
        this.radius = 0.5;
        this.textureNum = -2;
    }

    render() {
        var rgba = this.color;
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        const n = this.segments;
        const h = this.height;
        const r = this.radius;

        for (let i = 0; i < n; i++) {
            const a1 = (i / n) * 2 * Math.PI;
            const a2 = ((i + 1) / n) * 2 * Math.PI;

            const x1 = r * Math.cos(a1), z1 = r * Math.sin(a1);
            const x2 = r * Math.cos(a2), z2 = r * Math.sin(a2);

            const nx = (Math.cos(a1) + Math.cos(a2)) / 2;
            const nz = (Math.sin(a1) + Math.sin(a2)) / 2;
            const sideNorm = [nx, r/h, nz,  nx, r/h, nz,  nx, r/h, nz];

            drawTriangle3DUVNormal(
                [x1, 0, z1,  x2, 0, z2,  0, h, 0],
                [0,0, 1,0, 0.5,1],
                sideNorm
            );

            const baseNorm = [0,-1,0, 0,-1,0, 0,-1,0];
            drawTriangle3DUVNormal(
                [0, 0, 0,  x2, 0, z2,  x1, 0, z1],
                [0,0, 1,0, 0.5,1],
                baseNorm
            );
        }
    }
}