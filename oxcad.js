function drawSurface(x, y, edge1, edge2, color, width) {
	color = 'undefined' === typeof color ? 'black' : color;
	width = 'undefined' === typeof width ? '1pt' : width;
	// todo: center drawing on nearest major grid line
	var outline = edge1.concat(edge2);
	var str = outline.reduce(function (x, elem) { return x + elem.part; }, '<path d="M' + x + ',' + y) + 'Z"stroke="' + color + '"stroke-width="' + width + '" fill="#0000FF" fill-opacity="0.04"/>';
	svgAppend(str);
	return str;
}

function drawPath(x, y, objs, color, width) {
	color = 'undefined' === typeof color ? 'black' : color;
	width = 'undefined' === typeof width ? '1pt' : width;
	var str = objs.reduce(function (x, elem) { return x + elem.part; }, '<path d="M' + x + ',' + y) + '"stroke="' + color + '"stroke-width="' + width + '"fill="none"/>';
	svgAppend(str);
	return str;
}

// helper functions for edge part array
function edgeLength(objs) { return objs.reduce(function (x, elem) { return x + elem.edgeLen; }, 0); }
function clone(objs, scale, mirrorAngleDeg) { return objs.map(function (obj) { return obj.clone(scale, mirrorAngleDeg); }); }
function extent(objs) { return objs.reduce(function (sum, elem) { return { x: sum.x + elem.x, y: sum.y + elem.y }; }, { x: 0, y: 0 }); }

function reflect(objs, mirrorAngleDeg) {
	mirrorAngleDeg = 'undefined' === typeof mirrorAngleDeg ? 90 : mirrorAngleDeg; // mirror default Y axis
	var tail = clone(objs.slice(0, -1).reverse(), 1, mirrorAngleDeg); // no reflection on center item
	return objs.concat(tail);
}

function mirror(angleDeg, mirrorAngleDeg) { // undefined mirrorAngleDeg returns original angleDeg
	return 'undefined' === typeof mirrorAngleDeg ? angleDeg : 2 * mirrorAngleDeg - angleDeg;
}

function makeEdge(angleDeg, length) {
	var end = move(angleDeg, length);
	return {
		part: 'l' + end.x + ',' + end.y,
		edgeLen: length,
		clone: function (scale, mirrorAngleDeg) {
			return makeEdge(mirror(angleDeg,
'undefined' === typeof mirrorAngleDeg ? mirrorAngleDeg : mirrorAngleDeg + 90 // todo!
), length * scale);
		},
		x: end.x, y: end.y
	};
}

function makeNotch(angleDeg, angleOpenDeg, length, smooth) {
	var resLen = length / (1 + smooth); // make overall length the same for straight and smooth notches
	var halfAngleOpenDeg = angleOpenDeg / 2;
	var a12 = angleDeg - halfAngleOpenDeg;
	var a56 = angleDeg + halfAngleOpenDeg - 180;
	var lenV = resLen * (1 - smooth);
	var lenB = resLen * smooth;
	var m1 = move(a12, lenV);
	var m2 = move(a12, lenB);
	var m3 = move(angleDeg, lenB, m2);
	var m4 = move(angleDeg - 180, lenB);
	var m5 = move(a56, lenB, m4);
	var m6 = move(a56, lenV);
	var end = extent([m1, m3, m5, m6]);
	return {
		part: 'l' + m1.x + ',' + m1.y +
			  'q' + m2.x + ',' + m2.y + ' ' + m3.x + ',' + m3.y +
			  'q' + m4.x + ',' + m4.y + ' ' + m5.x + ',' + m5.y +
			  'l' + m6.x + ',' + m6.y,
		edgeLen: 0,
		clone: function (scale, mirrorAngleDeg) { return makeNotch(mirror(angleDeg, mirrorAngleDeg), angleOpenDeg, length * scale, smooth); },
		x: end.x, y: end.y
	};
	// todo: special case smooth <= 0 and smooth >=1 with fewer segments
}

function move(angleDeg, length, from) {
	var angleRad = radians(angleDeg);
	from = 'undefined' === typeof from ? { x: 0, y: 0 } : from;
	return {
		x: length * Math.cos(angleRad) + from.x,
		y: length * Math.sin(angleRad) + from.y
	};
}

function makeRange(count, func) { // plus additional parameters for func
	var args = Array.prototype.slice.call(arguments);
	var parm = [];
	var inc = [];
	var ret = [];
	// setup parameters for call to func
	args.slice(2).forEach(function (arg) {
		// func parameters are single number or {first:n,last:n} objects
		arg = 'number' === typeof arg ? { first: arg, last: arg } : arg;
		parm.push(arg.first);
		inc.push((arg.last - arg.first) / (count - 1));
	});
	// make calls to func
	for (var i = 0; i < count; ++i) {
		ret.push(func.apply(this, parm));
		parm.forEach(function (x, j, vec) { vec[j] += inc[j]; });
	}
	return ret;
}

function merge() { // generic merge any number of arrays
	var args = Array.prototype.slice.call(arguments);
	args.forEach(function (x, i, vec) { vec[i] = [].concat(x); }); // ensure array parameters
	var maxLen = args.reduce(function (p, c) { return Math.max(p, c.length) }, 0);
	var ret = [];
	for (var i = 0; i < maxLen; ++i) {
		for (var j = 0; j < args.length; ++j) {
			if (i < args[j].length) { ret.push(args[j][i]); }
		}
	}
	return ret;
}

function radians(degrees) { return degrees * Math.PI / 180; };
function degrees(radians) { return radians * 180 / Math.PI; };

/*
Browser support for svg viewbox and units change is immature in 2016.
This results in blurry lines and very poor scaling accuracy.
New strategy: entirely unitless and viewBoxless, calculate own scaling for paths.
*/

function specifySvgUnitsAndSize(str, width, height, units) {
	// <svg id="svgWindow" class="expand" ...
	// 0123456789
	str = str.slice(0, 4) + ' width="' + width + units + '" height="' + height + units + '" viewBox="0 0 ' + width + ' ' + height + '"' + str.slice(4);
	return str;
}
function minEncode(str) { // see https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
	//str = str.replace(/"/g, "'");
	str = str.replace(/</g, "%3C");
	str = str.replace(/>/g, "%3E");
	str = str.replace(/&/g, "%26");
	str = str.replace(/#/g, "%23");
	return str;
}
function printPlans() {
	var str = svgEdit.outerHTML;
	str = specifySvgUnitsAndSize(str, 400, 200, "mm");
	str = minEncode(str);
	var link = document.createElement("a");
	// link.download = "drawing.svg"; // download
	link.target = "_blank"; // open in new tab
	link.href = "data:image/svg+xml;utf8," + str;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

var svgEdit;
var svgNS = "http://www.w3.org/2000/svg";

function svgClear() {
	svgEdit.innerHTML = '';
	svgGrid(10);
}

function svgSmaller() {
	var bcr = svgEdit.getBoundingClientRect();
	if (bcr.height < 200) { return; }
	svgEdit.style.height = bcr.height - 100 + 'px';
}

function svgLarger() {
	var bcr = svgEdit.getBoundingClientRect();
	svgEdit.style.height = bcr.height + 100 + 'px';
}

function svgGrid(size) {
	var code =
		'<defs>\n' +
		'<pattern id="smallGrid" width="' + size + '" height="' + size + '" patternUnits="userSpaceOnUse">\n' +
		'<path d="M ' + size + ' 0 L 0 0 0 ' + size + '" fill="none" stroke="gray" stroke-width="0.5"/>\n' +
		'</pattern>\n' +
		'<pattern id="grid" width="' + 10 * size + '" height="' + 10 * size + '" patternUnits="userSpaceOnUse">\n' +
		'<rect width="' + 10 * size + '" height="' + 10 * size + '" fill="url(#smallGrid)"/>\n' +
		'<path d="M ' + 10 * size + ' 0 L 0 0 0 ' + 10 * size + '" fill="none" stroke="gray" stroke-width="1"/>\n' +
		'</pattern>\n' +
		'</defs>\n' +
		'<rect width="100%" height="100%" fill="url(#grid)" />';
	svgAppend(code);
}

function svgAppend(code) {
	// svg from string, one way to do it: render and copy
	var container = document.createElement('div');
	container.innerHTML = '<svg>' + code + '</svg>';
	Array.prototype.slice.call(container.childNodes[0].childNodes).forEach(function (el) { svgEdit.appendChild(el) });
}

function exampleChangeFunc(id) {
	codeEdit.setValue(codeExamples[id]);
	codeEdit.clearSelection();
}
function fillExampleDropdown() {
	var select = document.getElementById("selectBox");
	for (var key in codeExamples) {
		var el = document.createElement("option");
		el.textContent = key;
		el.value = key;
		select.appendChild(el);
	};
}

var codeEdit;

function codeUndo() {
	codeEdit.undo();
}

function codeRedo() {
	codeEdit.redo();
}

var logEdit;

function logMsg() {
	var args = Array.prototype.slice.call(arguments);
	var session = logEdit.getSession();
	session.insert({
		row: session.getLength(),
		column: 0
	}, args.join(' ') + "\n");
}

function logClear() {
	logEdit.setValue('OxCad v0.33, Log Entries:\n');
	logEdit.clearSelection();
}

function logSmaller() {
	var height = document.getElementById('codeWindow').clientHeight;
	if (height < 200) { return; }
	document.getElementById("codeWindow").style.height = height - 100 + 'px';
	document.getElementById("logWindow").style.height = height - 100 + 'px';
	codeEdit.resize();
	logEdit.resize();
}

function logLarger() {
	var height = document.getElementById('codeWindow').clientHeight;
	document.getElementById("codeWindow").style.height = height + 100 + 'px';
	document.getElementById("logWindow").style.height = height + 100 + 'px';
	codeEdit.resize();
	logEdit.resize();
}

var dynCode;

function runCode() {
	var code = codeEdit.getValue();
	var script = document.createElement('script');
	script.innerHTML = 'try{' + code + '}catch(e){logMsg("Code Error:",e.message);}';
	dynCode.innerHTML = ''; // clear previous children
	dynCode.appendChild(script);
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=- main -=-=-=-=-=-=-=-=-=-=-=-=-=-

function setupCodeWindow() {
	codeEdit = ace.edit("codeWindow");
	codeEdit.setTheme("ace/theme/chrome");
	codeEdit.getSession().setMode("ace/mode/javascript");
	fillExampleDropdown();
	exampleChangeFunc('mirrordemo'); // preload sample code
}

function setupLogWindow() {
	logEdit = ace.edit("logWindow");
	logEdit.setTheme("ace/theme/chrome");
	logEdit.setReadOnly(true);
	logClear();
}

function setupSvgWindow() {
	svgEdit = document.getElementById("svgWindow");
	svgClear();
}

window.onload = function () {
	setupCodeWindow();
	setupLogWindow();
	setupSvgWindow();
	dynCode = document.getElementById("dynamicCode");
}
