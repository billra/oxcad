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
function epaClone(objs, scale, mirrorAngleDeg) { return objs.map(function (obj) { return obj.clone(scale, mirrorAngleDeg); }); }
function extent(objs) { return objs.reduce(function (sum, elem) { return { x: sum.x + elem.x, y: sum.y + elem.y }; }, { x: 0, y: 0 }); }

function reflect(objs, mirrorAngleDeg) {
	mirrorAngleDeg = 'undefined' === typeof mirrorAngleDeg ? 90 : mirrorAngleDeg; // mirror default Y axis
	var tail = epaClone(objs.slice(0, -1).reverse(), 1, mirrorAngleDeg); // no reflection on center item
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

function svgSerialize() {
	var svgXml = (new XMLSerializer).serializeToString(svgEdit);
	logMsg(svgXml);
}

function svgBall() {
	svgAppend('<circle id="todo" style="stroke:blue;stroke-width:4;fill:cyan;" cx="290" cy="200" r="20"/>');
}

function svgGrid() {

	var code =
'<defs>\
  <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">\
	<path d="M 10 0 L 0 0 0 10" fill="none" stroke="gray" stroke-width="0.5"/>\
  </pattern>\
  <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">\
	<rect width="100" height="100" fill="url(#smallGrid)"/>\
	<path d="M 100 0 L 0 0 0 100" fill="none" stroke="gray" stroke-width="1"/>\
  </pattern>\
</defs>\
<rect width="100%" height="100%" fill="url(#grid)" />'

	svgAppend(code);
}

function svgAppend(code) {
	// svg from string, one way to do it: render and copy
	var container = document.createElement('div');
	container.innerHTML = '<svg>' + code + '</svg>';
	Array.prototype.slice.call(container.childNodes[0].childNodes).forEach(function (el) { svgEdit.appendChild(el) });
}

function svgProperties() {
	var curve = document.getElementById("testPath");
	var len = curve.getTotalLength();
	var pos = curve.getPointAtLength(len);
	var bbox = curve.getBBox();
	logMsg("path len", len, 'end xy', pos.x, pos.y, 'bbox:', bbox.x, bbox.y, bbox.x + bbox.width, bbox.y + bbox.height, bbox.style);
}

var presetMap = {
	'notchdemo':
	'// demo notch smoothness range\n' +
	'var edges = makeRange(6, makeEdge, 0, 40);\n' +
	'var notches = makeRange(5, makeNotch, 90, 20, 200, { first: 0, last: 1 });\n' +
	'var le = merge(edges, notches);\n' +
	'var path = drawPath(10,50,le);\n' +
	'logMsg("done.");',

	'mirrordemo':
	'// example using mirror\n' +
	'var edges = makeRange(3,makeEdge,{first:-20,last:0},200);\n' +
	'var notches = makeRange(2,makeNotch,{first:75,last:85},20,100,2/3);\n' +
	'var side = merge(edges,notches);\n' +
	'var le = reflect(side);\n' +
	'var path = drawPath(10,200,le);\n' +
	'logMsg("edge length:",edgeLength(le));\n' +
	'var leExt=extent(le);\n' +
	'logMsg("leading edge extent:",leExt.x,leExt.y);\n' +
	'logMsg("done.");',

	'alfa':
	'// --- Alfa ---\n' +
	'// leading edge\n' +
	'var leEdges=makeRange(3,makeEdge,{first:-20,last:0},200);\n' +
	'var leNotches=makeRange(2,makeNotch,{first:75,last:85},20,{first:100,last:140},2/3);\n' +
	'var leSide=merge(leEdges,leNotches);\n' +
	'var le=reflect(leSide);\n' +
	'logMsg("leading edge length:",edgeLength(le));\n' +
	'var leExt=extent(le);\n' +
	'logMsg("leading edge extent:",leExt.x,leExt.y);\n' +
	'// trailing edge\n' +
	'var teEdges=makeRange(2,makeEdge,{first:135,last:180},100);\n' +
	'var teNotches=makeNotch(255,30,60,2/3);\n' +
	'var teSide=merge(teEdges,teNotches);\n' +
	'var te=reflect(teSide);\n' +
	'logMsg("trailing edge length:",edgeLength(te));\n' +
	'var teExt=extent(te);\n' +
	'logMsg("trailing edge extent:",teExt.x,teExt.y);\n' +
	'// scale trailing edge to match leading edge extent\n' +
	'var scale=leExt.x/-teExt.x;\n' +
	'logMsg("trailing edge scale factor:",scale);\n' +
	'var teScaled=epaClone(te,scale);\n' +
	'// draw canopy\n' +
	'drawSurface(10,150,le,teScaled);\n' +
	'//printPlans();\n' +
	'logMsg("done.");',

	'svgappend':
	'// demo raw svg usage\n' +
	'svgAppend(\'<circle id="yellowCircle1" style="stroke:blue;stroke-width:4;fill:yellow;" cx="170" cy="200" r="20"/>\');\n' +
	'svgAppend(\'<circle id="orangeCircle1" style="stroke:blue;stroke-width:4;fill:darkorange;" cx="230" cy="200" r="20"/>\');\n' +
	'svgAppend(\'<g transform="scale(5)"><path id="testPath" d="M10,10 l20,10 l-10,10" style="stroke: #0000cc; stroke-width: 2px; fill:#ccccff;"/></g>\')\n',

	'blank': ''
}

function presetChangeFunc(id) {
	codeEdit.setValue(presetMap[id]);
	codeEdit.clearSelection();
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
	logEdit.setValue('OxCad v0.24, Log Entries:\n');
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
	presetChangeFunc('mirrordemo'); // preload sample code
}

function setupLogWindow() {
	logEdit = ace.edit("logWindow");
	logEdit.setTheme("ace/theme/chrome");
	logEdit.setReadOnly(true);
	logClear();
}

function setupSvgWindow() {
	svgEdit = document.getElementById("svgWindow");
	svgGrid();
}

window.onload = function () {
	setupCodeWindow();
	setupLogWindow();
	setupSvgWindow();
	dynCode = document.getElementById("dynamicCode");
}
