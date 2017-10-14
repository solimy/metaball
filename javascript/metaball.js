var scene;

function hue2rgb(p, q, t){
	if(t < 0) t += 1;
	if(t > 1) t -= 1;
	if(t < 1/6) return p + (q - p) * 6 * t;
	if(t < 1/2) return q;
	if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	return p;
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function Blob() {
	this.x = randInt(0, scene.width);
	this.y = randInt(0, scene.height);
	this.vx = randInt(1, 20);
	this.vy = randInt(1, 20);
	this.radius = randInt(1, scene.hypothenus / 10);
	this.update = function() {
		this.x += this.vx;
		this.y += this.vy;
		if (this.x < 0 || this.x > scene.width) this.vx *= -1;
		if (this.y < 0 || this.y > scene.height) this.vy *= -1;
	}
}

function setDecimalColor(color, decimal) {
	color.decimal = decimal;
	color.r = (decimal & 0xff0000) >> 16;
	color.g = (decimal & 0x00ff00) >> 8;
	color.b = (decimal & 0x0000ff) >> 0;
}
function setRGBColor(color, r, g, b) {
	color.r = r;
	color.g = g;
	color.b = b;
	color.decimal = r;
	color.decimal <<= 8;
	color.decimal += g;
	color.decimal <<= 8;
	color.decimal += b;
}

function setPixel(imageData, x, y, r, g, b, a) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

function getPixel(imageData, x, y) {
	var pixel = {};
    index = (x + y * imageData.width) * 4;
    pixel.r = imageData.data[index+0];
    pixel.g = imageData.data[index+1];
    pixel.b = imageData.data[index+2];
	pixel.a = imageData.data[index+3];
	return pixel;
}

function setup(scene) {
    scene.canvas = document.getElementById("canvas");
	scene.ctx = scene.canvas.getContext("2d");
	scene.fps = 30;
	scene.drawRate = 30;
	scene.updateRate = 30;
	scene.width = scene.canvas.width;
	scene.height = scene.canvas.height;
	scene.hypothenus = Math.sqrt(Math.pow(scene.width, 2) + Math.pow(scene.height, 2));
	scene.image = scene.ctx.createImageData(scene.width, scene.height);
	for (y = 0; y < scene.height; ++y) {
		for (x = 0; x < scene.width; ++x) {
			setPixel(scene.image, x, y, 0, 0, 0, 10);
		}
	}
	scene.loop = setInterval(loop, 1000/scene.fps);
	//scene.drawLoop = setInterval(draw, 1000/scene.drawRate);
	//scene.updateLoop = setInterval(update, 1000/scene.updateRate);

	scene.blobs = [];
	for (qtt = randInt(1, scene.hypothenus / 100); qtt >= 0; --qtt) {
		scene.blobs[qtt] = new Blob();
	}
}

function draw() {
	scene.ctx.putImageData(scene.image, 0, 0);
}

function chooseColor(x, y) {
	var color = 0;
	var d;
	
	for (blob in scene.blobs) {
		d = Math.pow(x - scene.blobs[blob].x, 2) + Math.pow(y - scene.blobs[blob].y, 2);
		color += 100 * (scene.blobs[blob].radius / d);
	}
	return color;
}

function update() {
	var color = {};
	var hsl;

	for (y = 0; y < scene.height; ++y) {
		for (x = 0; x < scene.width; ++x) {
			//setDecimalColor(color, chooseColor(x, y));
			hsl = hslToRgb(chooseColor(x, y), 1, 0.5);
			//setRGBColor(color, hsl[0], hsl[1], hsl[2]);
			setPixel(scene.image, x, y, hsl[0], hsl[1], hsl[2], 255);
		}
	}
	for (blob in scene.blobs) {
		scene.blobs[blob].update();
	}
}

function loop() {
	draw();
	update();
}

function main() {
	scene = {};
	setup(scene);
	update();
	draw();
}
