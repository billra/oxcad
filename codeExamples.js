var codeExamples = {
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
	'var leEdges=makeRange(3,makeEdge,{first:-20,last:0},180);\n' +
	'var leNotches=makeRange(2,makeNotch,{first:75,last:85},20,{first:100,last:140},2/3);\n' +
	'var le=reflect(merge(leEdges,leNotches));\n' +
	'// trailing edge\n' +
	'var teEdges=makeRange(2,makeEdge,{first:135,last:180},100);\n' +
	'var teNotches=makeNotch(255,30,50,2/3);\n' +
	'var te=reflect(merge(teEdges,teNotches));\n' +
	'// scale trailing edge to match leading edge extent\n' +
	'var scale=extent(le).x/-extent(te).x;\n' +
	'logMsg("trailing edge scale factor:",scale);\n' +
	'var teScaled=clone(te,scale);\n' +
	'// draw canopy\n' +
	'var xpos = 600-extent(le).x/2; // center at major grid line\n' +
	'drawSurface(xpos,110,le,teScaled);\n' +
	'//printPlans();\n' +
	'logMsg("done.");',

	'svgappend':
	'// demo raw svg usage\n' +
	'svgAppend(\'<circle id="yellowCircle1" style="stroke:blue;stroke-width:4;fill:yellow;" cx="170" cy="200" r="20"/>\');\n' +
	'svgAppend(\'<circle id="orangeCircle1" style="stroke:blue;stroke-width:4;fill:darkorange;" cx="230" cy="200" r="20"/>\');\n' +
	'svgAppend(\'<g transform="scale(5)"><path id="testPath" d="M10,10 l20,10 l-10,10" style="stroke: #0000cc; stroke-width: 2px; fill:#ccccff;"/></g>\')\n' +
	'var curve = document.getElementById("testPath");\n' +
	'var len = curve.getTotalLength();\n' +
	'var pos = curve.getPointAtLength(len);\n' +
	'var bbox = curve.getBBox();\n' +
	'// note that properties ignores surrounding transform\n' +
	'logMsg("path len", len, "end xy", pos.x, pos.y, "bbox:", bbox.x, bbox.y, bbox.x + bbox.width, bbox.y + bbox.height, bbox.style);\n',

	'blank': ''
}
