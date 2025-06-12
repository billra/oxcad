import { editorTheme } from './acewrap.mjs';
import File from './file.mjs';

// --- load examples ---

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

export function setTheme(theme) {
    codeEdit.setTheme(editorTheme(theme));
}

function codeLoad() {
    File.selectAndRead(text => {
        codeEdit.setValue(text);
        codeEdit.clearSelection();
    }, '.js');
}

function codeSave() {
    const code = codeEdit.getValue();
    File.save(code, 'design.js');
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

const codeEdit = ace.edit("codeWindow", {
    theme: editorTheme(document.documentElement.getAttribute('data-theme')),
    mode: "ace/mode/javascript"
});

// setup examples
const codeExamples = await loadExamples();
const demo = 'reflect_demo';
fillExampleDropdown(demo);
exampleChangeFunc(demo);

// UI event handlers
document.getElementById('codeLoadBtn').addEventListener('click', codeLoad);
document.getElementById('codeSaveBtn').addEventListener('click', codeSave);
document.getElementById('codeUndoBtn').addEventListener('click', codeUndo);
document.getElementById('codeRedoBtn').addEventListener('click', codeRedo);
document.getElementById('selectBox').addEventListener('change', (e) => exampleChangeFunc(e.target.value));
