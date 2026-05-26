class Map {
    constructor(mapData) {
        this.SIZE = 16;
        this.data = mapData;
        this.dirty = true;

        this.posBuffer = null;
        this.uvBuffer = null;
        this.vertexCount = 0;
    }

    setBlock(x, z, height) {
        this.data[x][z] = Math.max(0, Math.min(4, height));
        this.dirty = true;
    }

    addBlock(x, z) {
        this.setBlock(x, z, this.data[x][z] + 1);
    }

    removeBlock(x, z) {
        this.setBlock(x, z, this.data[x][z] - 1);
    }

    _build() {
        const SIZE = this.SIZE;
        const HALF = SIZE / 2;

        let positions = [];
        let uvs = [];

        const faceUV = [[0,0],[1,1],[1,0],[0,0],[0,1],[1,1]];

        function addFace(verts, ox, oy, oz) {
            for (let v of verts) {
                positions.push(v[0] + ox, v[1] + oy, v[2] + oz);
            }
            for (let uv of faceUV) {
                uvs.push(uv[0], uv[1]);
            }
        }

        for (let x = 0; x < SIZE; x++) {
            for (let z = 0; z < SIZE; z++) {
                let height = this.data[x][z];
                for (let y = 0; y < height; y++) {
                    let ox = x - HALF;
                    let oy = y - 0.75;
                    let oz = z - HALF;

                    if (z === 0 || y >= this.data[x][z-1])
                        addFace([[0,0,0],[1,1,0],[1,0,0],[0,0,0],[0,1,0],[1,1,0]], ox, oy, oz);

                    if (z === SIZE-1 || y >= this.data[x][z+1])
                        addFace([[0,0,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1],[0,1,1]], ox, oy, oz);

                    if (x === 0 || y >= this.data[x-1][z])
                        addFace([[0,0,0],[0,0,1],[0,1,1],[0,0,0],[0,1,1],[0,1,0]], ox, oy, oz);

                    if (x === SIZE-1 || y >= this.data[x+1][z])
                        addFace([[1,0,0],[1,1,0],[1,1,1],[1,0,0],[1,1,1],[1,0,1]], ox, oy, oz);

                    addFace([[0,1,0],[0,1,1],[1,1,1],[0,1,0],[1,1,1],[1,1,0]], ox, oy, oz);
                }
            }
        }

        if (!this.posBuffer) this.posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        if (!this.uvBuffer) this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

        this.vertexCount = positions.length / 3;
        this.dirty = false;
    }

    render() {
        if (this.dirty) this._build();

        gl.uniform1i(u_whichTexture, 2);
        gl.uniform4f(u_FragColor, 1, 1, 1, 1);

        var identity = new Matrix4();
        gl.uniformMatrix4fv(u_ModelMatrix, false, identity.elements);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);

        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    }
}