export function append(code) {
    // svg from string, one way to do it: render and copy
    const container = document.createElement('div');
    container.innerHTML = '<svg>' + code + '</svg>';
    Array.from(container.childNodes[0].childNodes).forEach(function (el) {
        svgEdit.appendChild(el);
    });
}

function grid(size) {
    const gridColor = 'var(--svg-grid)';
    const code =
        '<defs>\n' +
        `<pattern id="smallGrid" width="${size}" height="${size}" patternUnits="userSpaceOnUse">\n` +
        `<path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${gridColor}" stroke-width="0.5"/>\n` +
        '</pattern>\n' +
        `<pattern id="grid" width="${10 * size}" height="${10 * size}" patternUnits="userSpaceOnUse">\n` +
        `<rect width="${10 * size}" height="${10 * size}" fill="url(#smallGrid)"/>\n` +
        `<path d="M ${10 * size} 0 L 0 0 0 ${10 * size}" fill="none" stroke="${gridColor}" stroke-width="1"/>\n` +
        '</pattern>\n' +
        '</defs>\n' +
        '<rect width="100%" height="100%" fill="url(#grid)" />';
    return code;
}

function minEncode(str) { // see https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
    str = str.replace(/"/g, "'");
    str = str.replace(/</g, "%3C");
    str = str.replace(/>/g, "%3E");
    str = str.replace(/&/g, "%26");
    str = str.replace(/#/g, "%23");
    return str;
}

export function printPlans(svgStr) {
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

export function getContainer(){
    return svgEdit;
}

// --- UI handlers ---

function svgClear() {
    svgEdit.innerHTML = '';
    append(grid(10));
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

document.getElementById('svgClearBtn').addEventListener('click', svgClear);
document.getElementById('svgSmallerBtn').addEventListener('click', svgSmaller);
document.getElementById('svgLargerBtn').addEventListener('click', svgLarger);

// --- setup ---

const svgEdit = document.getElementById("svgWindow");
svgClear();
