class Model {
    constructor(gl, filePath) {
        this.filePath = filePath;
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.isFullyLoaded = false;
        this.textureNum = -2;

        this.getFileContent().then(() => {
            this.vertexBuffer = gl.createBuffer();
            this.normalBuffer = gl.createBuffer();
            this.uvBuffer = gl.createBuffer();

            if (!this.vertexBuffer || !this.normalBuffer || !this.uvBuffer) {
                console.log("Failed to create buffers for ", this.filePath);
                return;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.modelData.vertices, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.modelData.normals, gl.STATIC_DRAW);

            const dummyUVs = new Float32Array(
                (this.modelData.vertices.length / 3) * 2
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, dummyUVs, gl.STATIC_DRAW);
        });
    }

    parseModel(fileContent) {
        const lines = fileContent.split("\n");
        const allVertices = [];
        const allNormals = [];
        const unpackedVerts = [];
        const unpackedNormals = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const tokens = line.split(/\s+/);

            if (tokens[0] === "v") {
                allVertices.push(
                    parseFloat(tokens[1]),
                    parseFloat(tokens[2]),
                    parseFloat(tokens[3])
                );
            } 
            
            else if (tokens[0] === "vn") {
                allNormals.push(
                    parseFloat(tokens[1]),
                    parseFloat(tokens[2]),
                    parseFloat(tokens[3])
                );
            } 
            
            else if (tokens[0] === "f") {
                const faceVerts = tokens.slice(1);
                for (let j = 1; j < faceVerts.length - 1; j++) {
                    for (const fv of [faceVerts[0], faceVerts[j], faceVerts[j + 1]]) {
                        const parts = fv.split("//");
                        const vi = (parseInt(parts[0]) - 1) * 3;
                        const ni = (parseInt(parts[1]) - 1) * 3;

                        unpackedVerts.push(
                            allVertices[vi],
                            allVertices[vi + 1],
                            allVertices[vi + 2]
                        );
                        unpackedNormals.push(
                            allNormals[ni],
                            allNormals[ni + 1],
                            allNormals[ni + 2]
                        );
                    }
                }
            }
        }

        this.modelData = {
            vertices: new Float32Array(unpackedVerts),
            normals: new Float32Array(unpackedNormals)
        };

        this.isFullyLoaded = true;
        console.log(`Loaded ${this.filePath}: ${unpackedVerts.length / 3} verts`);
    }

    render(gl, program) {
        if (!this.isFullyLoaded) return;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // Normals
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        // Dummy UVs
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);

        gl.drawArrays(gl.TRIANGLES, 0, this.modelData.vertices.length / 3);
    }

    async getFileContent() {
        try {
            const response = await fetch(this.filePath);
            if (!response.ok) throw new Error(
                `Could not load "${this.filePath}"`
            );
            const fileContent = await response.text();
            this.parseModel(fileContent);
        } 
        
        catch (e) {
            console.error(`Error loading ${this.filePath}:`, e);
        }
    }
}