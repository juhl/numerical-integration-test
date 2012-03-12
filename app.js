App = function() {
    var canvas;
    var ctx;
    var method = 0;

    // Spring Coefficients
    var m = 1;
    var L = 10;
    var w = 2 * Math.PI * 8;

    function main() {
        canvas = document.getElementById("canvas");
        if (!canvas.getContext) {
            alert("Couldn't get canvas object !");
        }

        // Main canvas context
        ctx = canvas.getContext("2d");

        // Transform coordinate system to y-axis is up
        ctx.translate(0, canvas.height * 0.5);
        ctx.scale(1, -1);        

        updateScreen();

        document.getElementById("frequency").value = w / (2 * Math.PI);
    }

    function updateScreen() {
        // Time interval
        var h = 1 / 800;

        // Initial values
        var f = { x: 100, v: 0 };        
        if (method == 3) { // verlet
            integrateRK4(f, h);
            f.x = 100;
            f.v = f.x; // previous position
        }

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        ctx.beginPath();

        integrate(f, h);

        ctx.moveTo(0, f.x);

        for (var x = 1; x < 800; x++) {
            integrate(f, h);
            ctx.lineTo(x, Math.max(Math.min(f.x, 800), -800));
        }
        
        ctx.strokeStyle = "#000";
        ctx.stroke();
    }

    function onchanged_method(value) {
        method = value;
        updateScreen();
    }

    function onchanged_frequency(hz) {
        w = 2 * Math.PI * hz;
        updateScreen();

        document.getElementById("frequency").value = hz;
    }

    function integrate(f, h) {
        switch (method) {
        case 0: integrateExplicit(f, h);
            break;
        case 1: integrateMidPoint(f, h);
            break;
        case 2: integrateRK4(f, h);
            break;
        case 3: integrateVerlet(f, h);
            break;
        case 4: integrateSemiImplicit(f, h);        
            break;
        case 5: integrateImplicit(f, h);
            break;
        }
    }

    function integrateExplicit(f, h) {
        var a = -w * w * (f.x - L);
        f.x = f.x + f.v * h;
        f.v = f.v + a * h;
    }

    function integrateMidPoint(f, h) {
        var a = -w * w * (f.x - L);
        v_half = f.v + a * h * 0.5;
        f.x = f.x + v_half * h;
        a = -w * w * (f.x - L);
        f.v = f.v + a * h;
    }

    function integrateRK4(f, h) {
        var a1 = -w * w * (f.x - L);
        var v1 = f.v;

        var a2 = -w * w * (f.x + v1 * h * 0.5 - L);
        var v2 = f.v + a1 * h * 0.5;

        var a3 = -w * w * (f.x + v2 * h * 0.5 - L);
        var v3 = f.v + a2 * h * 0.5;
        
        var a4 = -w * w * (f.x + v3 * h - L);
        var v4 = f.v + a3 * h;

        var v = (v1 + 2 * v2 + 2 * v3 + v4) / 6;
        var a = (a1 + 2 * a2 + 2 * a3 + a4) / 6;

        f.x = f.x + v * h;
        f.v = f.v + a * h;
    }

    function integrateVerlet(f, h) {
        var a = -w * w * (f.x - L);
        var x = 2 * f.x - f.v + h * h * a;
        f.v = f.x; // This is a previous position not a velocity
        f.x = x;
    }

    function integrateSemiImplicit(f, h) {
        var a = -w * w * (f.x - L);
        f.v = f.v + a * h;
        f.x = f.x + f.v * h;
    }

    function integrateImplicit(f, h) {     
        var wwh = w * w * h;
        f.v = (f.v - wwh * f.x + wwh * L) / (1 + wwh * h);
        f.x = f.x + f.v * h;
    }

    return { main: main, 
        onchanged_method: onchanged_method,
        onchanged_frequency: onchanged_frequency
    };
} ();