function drawVector(v, color) {
    var canvas = document.getElementById('cnv');
    var ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function handleDrawEvent() {
    var canvas = document.getElementById('cnv');
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x_coord_v1 = document.getElementById("x_coord_v1").value;
    let y_coord_v1 = document.getElementById("y_coord_v1").value;

    let v1 = new Vector3([x_coord_v1, y_coord_v1, 0]);

    let x_coord_v2 = document.getElementById("x_coord_v2").value;
    let y_coord_v2 = document.getElementById("y_coord_v2").value;

    let v2 = new Vector3([x_coord_v2, y_coord_v2, 0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
    var canvas = document.getElementById('cnv');
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x_coord_v1 = document.getElementById("x_coord_v1").value;
    let y_coord_v1 = document.getElementById("y_coord_v1").value;

    let v1 = new Vector3([x_coord_v1, y_coord_v1, 0]);

    let x_coord_v2 = document.getElementById("x_coord_v2").value;
    let y_coord_v2 = document.getElementById("y_coord_v2").value;

    let v2 = new Vector3([x_coord_v2, y_coord_v2, 0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");

    let operation = document.getElementById("operation_select").value;
    let scalar = document.getElementById("scalar").value;

    if (operation == "add") {
        let v3 = v1.add(v2);
        drawVector(v3, "green");
    }

    if (operation == "subtract") {
        let v3 = v1.sub(v2);
        drawVector(v3, "green");
    }

    if (operation == "divide") {
        let v3 = v1.div(scalar);
        let v4 = v2.div(scalar);
        drawVector(v3, "green");
        drawVector(v4, "green");
    }

    if (operation == "multiply") {
        let v3 = v1.mul(scalar);
        let v4 = v2.mul(scalar);
        drawVector(v3, "green");
        drawVector(v4, "green");
    }

    if (operation == "angle") {
        console.log("Angle: " + angleBetween(v1, v2));
    }

    if (operation == "area") {
        console.log("Area of the triangle: " + areaTriangle(v1, v2));
    }

    if (operation == "magnitude") {
        console.log("Magnitude v1: " + v1.magnitude());
        console.log("Magnitude v2: " + v2.magnitude());
    }

    if (operation == "normalize") {
        let v3 = v1.normalize();
        let v4 = v2.normalize();
        drawVector(v3, "green");
        drawVector(v4, "green");
    }
}

function angleBetween(v1, v2) {
    let angle = Math.acos(Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude()));

    return angle * (180 / Math.PI);
}

function areaTriangle(v1, v2) {
    let cross = Vector3.cross(v1, v2);

    return cross.magnitude() / 2;
}

function main() {
    var canvas = document.getElementById('cnv');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

}

