function makePath(objs) { // closure style classes
	return {
		svgStr: objs.reduce(function (x, elem) { return x + elem.part; }, '<path d="') + '"stroke="black"stroke-width="1pt"fill="none"/>',
		perimLen: objs.reduce(function (x, elem) { return x + elem.perimLen; }, 0)
	};
}

function makeCurrentLocation(x, y) {
	return {
		part: 'M' + x + ',' + y,
		perimLen: 0
	};
}

function makeEdge(angleDeg, length) {
	var end = move(angleDeg, length);
	return {
		part: 'l' + end.x + ',' + end.y,
		perimLen: length
	};
}

function makeNotch(angleDeg, angleOpenDeg, length, smooth) {
	var halfAngleOpenDeg = angleOpenDeg / 2;
	var a12 = angleDeg - halfAngleOpenDeg;
	var a56 = angleDeg + halfAngleOpenDeg - 180;
	var lenV = length * (1 - smooth);
	var lenB = length * smooth;
	var m1 = move(a12, lenV);
	var m2 = move(a12, lenB);
	var m3 = move(angleDeg, lenB, m2);
	var m4 = move(angleDeg - 180, lenB);
	var m5 = move(a56, lenB, m4);
	var m6 = move(a56, lenV);
	return {
		part: 'l' + m1.x + ',' + m1.y +
			  'q' + m2.x + ',' + m2.y + ' ' + m3.x + ',' + m3.y +
			  'q' + m4.x + ',' + m4.y + ' ' + m5.x + ',' + m5.y +
			  'l' + m6.x + ',' + m6.y,
		perimLen: 0
	};
	// todo: special case smooth <= 0 and smooth >=1 with fewer segments
}

function makeRange(count, func) { // plus additional parameters for func
	var args = Array.prototype.slice.call(arguments);
	var parm = [];
	var inc = [];
	var ret = [];
	// setup parameters for call to func
	args.slice(2).forEach(function (arg) {
		// func parameters are single number or {first:n,last:n} objects
		var po = typeof arg !== 'number' ? arg : { first: arg, last: arg };
		parm.push(po.first);
		inc.push((po.last - po.first) / (count - 1));
	});
	// make calls to func
	for (var i = 0; i < count; ++i) {
		ret.push(func.apply(this, parm));
		parm.forEach(function (x, i, vec) { vec[i] += inc[i]; });
	}
	return ret;
}

function merge(a1, a2) {
	var ret = [];
	for (var i = 0; i < a1.length || i < a2.length; ++i) {
		if (i < a1.length) { ret.push(a1[i]) }
		if (i < a2.length) { ret.push(a2[i]) }
	}
	return ret;
}

function move(angleDeg, length, from) {
	var angleRad = radians(angleDeg);
	from = typeof from !== 'undefined' ? from : { x: 0, y: 0 };
	return {
		x: length * Math.cos(angleRad) + from.x,
		y: length * Math.sin(angleRad) + from.y
	};
}

function radians(degrees) { return degrees * Math.PI / 180; };
function degrees(radians) { return radians * 180 / Math.PI; };

var svgEdit;
var svgNS = "http://www.w3.org/2000/svg";

function svgClear() {
	svgEdit.innerHTML = '';
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

var codeEdit;

function codeClear() {
	codeEdit.setValue('');
}

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
	}, "\n" + args.join(' '));
	logEdit.scrollToLine(session.getLength());
}

function logClear() {
	logEdit.setValue('OxCad v0.03, Log Entries:');
	logEdit.clearSelection();
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
	// codeEdit.setValue('// your JavaScript code here\nlogMsg("hello world");')
	codeEdit.setValue('// your JavaScript code here\n' +
		'logMsg("hello world");\n' +
		'var edges = makeRange(3,makeEdge,{first:315,last:360},200);\n' +
		'var notches = makeRange(2,makeNotch,{first:45,last:60},20,100,1/3);\n' +
		'var start = [makeCurrentLocation(10,390)];\n' +
		'var ns = merge(start,notches);\n' +
		'var le = merge(ns,edges);\n' +
		'var path = makePath(le);\n' +
		'svgAppend(path.svgStr);\n' +
		'logMsg("len:",path.perimLen);\n' +
		'logMsg("svg:",path.svgStr);\n' +
		'logMsg("svg:","done.");');
	codeEdit.clearSelection();
}

function setupLogWindow() {
	logEdit = ace.edit("logWindow");
	logEdit.setTheme("ace/theme/chrome");
	logEdit.setReadOnly(true);
	logClear();
}

function setupSvgWindow() {
	svgEdit = document.getElementById("svgWindow");
	svgAppend('<circle id="yellowCircle1" style="stroke:blue;stroke-width:4;fill:yellow;" cx="170" cy="200" r="20"/>'); // example initialization
	svgAppend('<circle id="orangeCircle1" style="stroke:blue;stroke-width:4;fill:darkorange;" cx="230" cy="200" r="20"/>');
	svgAppend('<g transform="scale(5)"><path id="testPath" d="M10,10 l20,10 l-10,10" style="stroke: #0000cc; stroke-width: 2px; fill:#ccccff;"/></g>')
	svgGrid();
}

window.onload = function () {
	setupCodeWindow();
	setupLogWindow();
	setupSvgWindow();
	dynCode = document.getElementById("dynamicCode");
}
