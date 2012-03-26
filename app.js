App = function() {
	var canvas;
	var ctx;
	var method = 0;

	// Spring Coefficients
	var m = 1;
	var L = 10;
	var frequencyHz = 8;
	var dampingRatio = 0;
	var w;
	var z;
	var t0Length = 80;

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

		document.getElementById("frequency").value = frequencyHz;
		document.getElementById("dampingRatio").value = dampingRatio;
	}

	function updateScreen() {		
		// Time interval
		var h = 1 / 800;

		w = 2 * Math.PI * frequencyHz;
		z = dampingRatio;

		// Select function of integration method
		var integrate = [integrateExplicit, integrateMidPoint, integrateRK4, integrateImplicit, integrateSemiImplicit, integrateVerlet][method];

		// Initial values
		var f = { x: t0Length, v: 0 };
		if (method == 5) { // verlet
			//integrateRK4(f, h);
			f.x = t0Length;
			f.v = f.x; // previous position
		}		

		// Integrate it for the first time
		integrate(f, h);

		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.restore();

		ctx.beginPath();		

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
		frequencyHz = hz;		

		updateScreen();

		document.getElementById("frequency").value = hz;
	}

	function onchanged_dampingRatio(ratio) {
		dampingRatio = ratio;

		updateScreen();

		document.getElementById("dampingRatio").value = ratio;
	}

	function integrateExplicit(f, h) {
		var a = -w * w * (f.x - L) - 2 * w * z * f.v;
		f.x = f.x + f.v * h;
		f.v = f.v + a * h;
	}

	function integrateMidPoint(f, h) {
		var a = -w * w * (f.x - L) - 2 * w * z * f.v;
		v_half = f.v + a * h * 0.5;
		f.x = f.x + v_half * h
		a = -w * w * (f.x - L) - 2 * w * z * v_half;
		f.v = f.v + a * h;
	}

	function integrateRK4(f, h) {
		var a1 = -w * w * (f.x - L);
		var v1 = f.v;
		a1 -= 2 * w * z * v1;

		var a2 = -w * w * (f.x + v1 * h * 0.5 - L);
		var v2 = f.v + a1 * h * 0.5;
		a2 -= 2 * w * z * v2;

		var a3 = -w * w * (f.x + v2 * h * 0.5 - L);
		var v3 = f.v + a2 * h * 0.5;
		a3 -= 2 * w * z * v3;
		
		var a4 = -w * w * (f.x + v3 * h - L);
		var v4 = f.v + a3 * h;
		a4 -= 2 * w * z * v4;

		var v = (v1 + 2 * v2 + 2 * v3 + v4) / 6;
		var a = (a1 + 2 * a2 + 2 * a3 + a4) / 6;

		f.x = f.x + v * h;
		f.v = f.v + a * h;
	}

	 function integrateImplicit(f, h) {
		var wwh = w * w * h;
		f.v = (f.v - wwh * (f.x - L)) / (1 + wwh * h + 2 * h * w * z);
		f.x = f.x + f.v * h;
	}

	function integrateSemiImplicit(f, h) {
		var a = -w * w * (f.x - L) - 2 * w * z * f.v;
		f.v = f.v + a * h;
		f.x = f.x + f.v * h;
	}

	// no damping
	function integrateVerlet(f, h) {
		var a = -w * w * (f.x - L);
		var x = 2 * f.x - f.v + h * h * a;
		f.v = f.x; // This is a previous position not a velocity
		f.x = x;
	}

	return { main: main, 
		onchanged_method: onchanged_method,
		onchanged_frequency: onchanged_frequency,
		onchanged_dampingRatio: onchanged_dampingRatio
	};
}();

window.addEventListener("load", App.main, false);