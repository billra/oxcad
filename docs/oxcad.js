function svgSurface(x, y, edge1, edge2, color, width) {
    color = 'undefined' === typeof color ? 'black' : color;
    width = 'undefined' === typeof width ? '1pt' : width;
    // todo: center drawing on nearest major grid line
    const outline = edge1.concat(edge2);
    const str = outline.reduce(function (x, elem) { return x + elem.part; }, '<path d="M' + x + ',' + y) + 'Z" stroke="' + color + '" stroke-width="' + width + '" fill="#0000FF" fill-opacity="0.04"/>';
    return str;
}

function drawSurface(x, y, edge1, edge2, color, width) {
    const str = svgSurface(x, y, edge1, edge2, color, width);
    svgAppend(str);
    return str;
}

function drawPath(x, y, objs, color, width) {
    color = 'undefined' === typeof color ? 'black' : color;
    width = 'undefined' === typeof width ? '1pt' : width;
    const str = objs.reduce(function (x, elem) { return x + elem.part; }, '<path d="M' + x + ',' + y) + '" stroke="' + color + '" stroke-width="' + width + '" fill="none"/>';
    svgAppend(str);
    return str;
}

// helper functions for edge part array
function edgeLength(objs) { return objs.reduce(function (x, elem) { return x + elem.edgeLen; }, 0); }
function clone(objs, scale, mirrorAngleDeg) { return objs.map(function (obj) { return obj.clone(scale, mirrorAngleDeg); }); }
function extent(objs) { return objs.reduce(function (sum, elem) { return { x: sum.x + elem.x, y: sum.y + elem.y }; }, { x: 0, y: 0 }); }

function reflect(objs, mirrorAngleDeg) {
    mirrorAngleDeg = 'undefined' === typeof mirrorAngleDeg ? 90 : mirrorAngleDeg; // mirror default Y axis
    const tail = clone(objs.slice(0, -1).reverse(), 1, mirrorAngleDeg); // no reflection on center item
    return objs.concat(tail);
}

function mirror(angleDeg, mirrorAngleDeg) { // undefined mirrorAngleDeg returns original angleDeg
    return 'undefined' === typeof mirrorAngleDeg ? angleDeg : 2 * mirrorAngleDeg - angleDeg;
}

function makeEdge(angleDeg, length) {
    const end = move(angleDeg, length);
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
    const resLen = length / (1 + smooth); // make overall length the same for straight and smooth notches
    const halfAngleOpenDeg = angleOpenDeg / 2;
    const a12 = angleDeg - halfAngleOpenDeg;
    const a56 = angleDeg + halfAngleOpenDeg - 180;
    const lenV = resLen * (1 - smooth);
    const lenB = resLen * smooth;
    const m1 = move(a12, lenV);
    const m2 = move(a12, lenB);
    const m3 = move(angleDeg, lenB, m2);
    const m4 = move(angleDeg - 180, lenB);
    const m5 = move(a56, lenB, m4);
    const m6 = move(a56, lenV);
    const end = extent([m1, m3, m5, m6]);
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
    const angleRad = radians(angleDeg);
    from = 'undefined' === typeof from ? { x: 0, y: 0 } : from;
    return {
        x: length * Math.cos(angleRad) + from.x,
        y: length * Math.sin(angleRad) + from.y
    };
}

function makeRange(count, func) { // plus additional parameters for func
    const args = Array.prototype.slice.call(arguments);
    const parm = [];
    const inc = [];
    const ret = [];
    // setup parameters for call to func
    args.slice(2).forEach(function (arg) {
        // func parameters are single number or {first:n,last:n} objects
        arg = 'number' === typeof arg ? { first: arg, last: arg } : arg;
        parm.push(arg.first);
        inc.push((arg.last - arg.first) / (count - 1));
    });
    // make calls to func
    for (let i = 0; i < count; ++i) {
        ret.push(func.apply(this, parm));
        parm.forEach(function (x, j, vec) { vec[j] += inc[j]; });
    }
    return ret;
}

function merge() { // generic merge any number of arrays
    const args = Array.prototype.slice.call(arguments);
    args.forEach(function (x, i, vec) { vec[i] = [].concat(x); }); // ensure array parameters
    const maxLen = args.reduce(function (p, c) { return Math.max(p, c.length); }, 0);
    const ret = [];
    for (let i = 0; i < maxLen; ++i) {
        for (let j = 0; j < args.length; ++j) {
            if (i < args[j].length) { ret.push(args[j][i]); }
        }
    }
    return ret;
}

function radians(degrees) { return degrees * Math.PI / 180; };
function degrees(radians) { return radians * 180 / Math.PI; };

function minEncode(str) { // see https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
    str = str.replace(/"/g, "'");
    str = str.replace(/</g, "%3C");
    str = str.replace(/>/g, "%3E");
    str = str.replace(/&/g, "%26");
    str = str.replace(/#/g, "%23");
    return str;
}
function printPlans(svgStr) {
    svgStr = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100cm" height="50cm">' + svgStr + '</svg>';
    svgStr = minEncode(svgStr);
    const link = document.createElement("a");
    // link.download = "drawing.svg"; // download
    link.target = "_blank"; // open in new tab
    link.href = "data:image/svg+xml;utf8," + svgStr;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

let svgEdit;
const svgNS = "http://www.w3.org/2000/svg";

function svgClear() {
    svgEdit.innerHTML = '';
    svgAppend(svgGrid(10));
}

function svgSmaller() {
    const bcr = svgEdit.getBoundingClientRect();
    if (bcr.height < 200) { return; }
    svgEdit.style.height = bcr.height - 100 + 'px';
}

function svgLarger() {
    const bcr = svgEdit.getBoundingClientRect();
    svgEdit.style.height = bcr.height + 100 + 'px';
}

function svgGrid(size) {
    const code =
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
    return code;
}

function svgAppend(code) {
    // svg from string, one way to do it: render and copy
    const container = document.createElement('div');
    container.innerHTML = '<svg>' + code + '</svg>';
    Array.prototype.slice.call(container.childNodes[0].childNodes).forEach(function (el) { svgEdit.appendChild(el); });
}

function exampleChangeFunc(id) {
    codeEdit.setValue(codeExamples[id]);
    codeEdit.clearSelection();
}
function fillExampleDropdown() {
    const select = document.getElementById("selectBox");
    for (const key in codeExamples) {
        const el = document.createElement("option");
        el.textContent = key;
        el.value = key;
        select.appendChild(el);
    };
}

let codeEdit;

function codeUndo() {
    codeEdit.undo();
}

function codeRedo() {
    codeEdit.redo();
}

let logEdit;

function logMsg() {
    const args = Array.prototype.slice.call(arguments);
    const session = logEdit.getSession();
    session.insert({
        row: session.getLength(),
        column: 0
    }, args.join(' ') + "\n");
}

function logClear() {
    const metaVersion = document.querySelector('meta[name="version"]');
    logEdit.setValue('OxCad v' + metaVersion.content + ', Log Entries:\n');
    logEdit.clearSelection();
}

function logSmaller() {
    const height = document.getElementById('codeWindow').clientHeight;
    if (height < 200) { return; }
    document.getElementById("codeWindow").style.height = height - 100 + 'px';
    document.getElementById("logWindow").style.height = height - 100 + 'px';
    codeEdit.resize();
    logEdit.resize();
}

function logLarger() {
    const height = document.getElementById('codeWindow').clientHeight;
    document.getElementById("codeWindow").style.height = height + 100 + 'px';
    document.getElementById("logWindow").style.height = height + 100 + 'px';
    codeEdit.resize();
    logEdit.resize();
}

let dynCode;

function runCode() {
    const code = codeEdit.getValue();
    const script = document.createElement('script');
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

    // Set page title and version label
    document.getElementById('page-title').innerText = document.title;
    const metaVersion = document.querySelector('meta[name="version"]');
    document.getElementById('version').innerText = 'v' + metaVersion.content;
};
