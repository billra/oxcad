// No viewBox specified, drawing units = SVG user units = pixels.

export function render(code) {
    // Parse code as SVG fragment and get real SVG elements
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${code}</svg>`, 'image/svg+xml');
    // Fragment for performance (batch render)
    const fragment = document.createDocumentFragment();
    // Copy all child nodes of the parsed SVG root
    [...doc.documentElement.childNodes].forEach(node => {
      fragment.appendChild(document.importNode(node, true));
    });
    svgEdit.appendChild(fragment);
}

function grid(size) {
    const gridColor = 'var(--svg-grid)';
    const code =
        '<defs>' +
        `<pattern id="smallGrid" width="${size}" height="${size}" patternUnits="userSpaceOnUse">` +
        `<path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${gridColor}" stroke-width="0.5"/>` +
        '</pattern>' +
        `<pattern id="grid" width="${10 * size}" height="${10 * size}" patternUnits="userSpaceOnUse">` +
        `<rect width="${10 * size}" height="${10 * size}" fill="url(#smallGrid)"/>` +
        `<path d="M ${10 * size} 0 L 0 0 0 ${10 * size}" fill="none" stroke="${gridColor}" stroke-width="1"/>` +
        '</pattern>' +
        '</defs>' +
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
    render(grid(10));
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

function makeSvgElement(height) {
    const doc = new DOMParser().parseFromString(
        `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${height}"></svg>`,
        'image/svg+xml');
    return doc.documentElement;
}

document.getElementById('svgClearBtn').addEventListener('click', svgClear);
document.getElementById('svgSmallerBtn').addEventListener('click', svgSmaller);
document.getElementById('svgLargerBtn').addEventListener('click', svgLarger);

// --- setup ---

 // include top and bottom major grid lines
const svgEdit = makeSvgElement(401);
// create top level SVG element inside DIV
document.getElementById("svgDiv").appendChild(svgEdit);

svgClear();
