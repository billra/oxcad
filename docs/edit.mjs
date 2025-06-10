import './acewrap.mjs';

// --- load examples --

const exampleFilenames = [
    "notch_demo",
    "reflect_demo",
    "alfa",
    "svg_render",
    "svg_serialize"
];

async function loadExamples() {
    const fetchPromises = exampleFilenames.map(async (fname) => {
        const url = `./examples/${fname}.js`;
        const resp = await fetch(url);
        if (!resp.ok) {
            return [fname, `// Unable to load: ${fname}.js\n`];
        }
        const text = await resp.text();
        return [fname, text];
    });
    const entries = await Promise.all(fetchPromises);
    const codeExamples = Object.fromEntries(entries);
    codeExamples["blank"] = "";
    return codeExamples;
}

// --- setup editor ---

export function getCodeEdit() { return codeEdit; }

export function setTheme(name) {
    codeEdit.setTheme("ace/theme/" + name);
}

function codeUndo() {
    codeEdit.undo();
}

function codeRedo() {
    codeEdit.redo();
}

function exampleChangeFunc(id) {
    codeEdit.setValue(codeExamples[id]);
    codeEdit.clearSelection();
}

function fillExampleDropdown(selectedKey) {
    const select = document.getElementById("selectBox");
    for (const key in codeExamples) {
        const el = document.createElement("option");
        el.textContent = key.replace(/_/g, ' '); // display without underscores
        el.value = key;
        if (key === selectedKey) { el.selected = true; }
        select.appendChild(el);
    }
}

const codeEdit = ace.edit("codeWindow");
codeEdit.session.setMode("ace/mode/javascript");

// setup examples
const codeExamples = await loadExamples();
const demo = 'reflect_demo';
fillExampleDropdown(demo);
exampleChangeFunc(demo);

// UI event handlers
document.getElementById('codeUndoBtn').addEventListener('click', codeUndo);
document.getElementById('codeRedoBtn').addEventListener('click', codeRedo);
document.getElementById('selectBox').addEventListener('change', (e) => exampleChangeFunc(e.target.value));
