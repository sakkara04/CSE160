class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
    }

    forward() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(0.2);

        this.eye.add(f);
        this.at.add(f);
    }

    back() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(0.2);

        this.eye.sub(f);
        this.at.sub(f);
    }

    left() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(0.2);

        this.eye.add(s);
        this.at.add(s);
    }

    right() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(0.2);

        this.eye.add(s);
        this.at.add(s);
    }

    panLeft(angle = 5) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(angle, 0, 1, 0);

        let f_prime = rotationMatrix.multiplyVector3(f);

        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panRight(angle = 5) {
        this.panLeft(-angle);
    }

    pitch(angle = 5) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let right = Vector3.cross(f, this.up);
        right.normalize();

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(angle,
            right.elements[0],
            right.elements[1],
            right.elements[2]
        );

        let f_prime = rotationMatrix.multiplyVector3(f);

        this.at.set(this.eye);
        this.at.add(f_prime);
    }
}