import './acewrap.mjs';

// --- load code examples ---
function parseKeyValueText(txt) {
    // normalize line endings
    txt = txt.replace(/\r\n?/g, '\n');

    const pattern = new RegExp(
        [
            '(?:^|\\n)',            // start of file or after a newline
            'K:\\s*',               // 'K:' key marker, optional whitespace
            '(?<key>.*?)',          // non-greedy capture for key
            '\\s*\\n',              // optional whitespace, newline
            'V:\\s*\\n',            // 'V:', optional whitespace, newline
            '(?<value>[\\s\\S]*?)', // non-greedy value, anything including newlines
            '(?=(?:\\nK:)|$)'       // Lookahead for next "\nK:" or end of string
        ].join(''), 'g'
    );

    const result = {};

    for (const match of txt.matchAll(pattern)) {
        const { key, value } = match.groups;
        result[key] = value;
    }

    return result;
}

const response = await fetch('./examples.txt');
const responseText = await response.text();
const codeExamples = parseKeyValueText(responseText);

// --- code editing ---

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
        el.textContent = key;
        el.value = key;
        if (key === selectedKey) { el.selected = true; }
        select.appendChild(el);
    }
}

const codeEdit = ace.edit("codeWindow");
codeEdit.session.setMode("ace/mode/javascript");
const demo = 'reflect demo';
fillExampleDropdown(demo);
exampleChangeFunc(demo); // preload sample code

// UI event handlers
document.getElementById('codeUndoBtn').addEventListener('click', codeUndo);
document.getElementById('codeRedoBtn').addEventListener('click', codeRedo);
document.getElementById('selectBox').addEventListener('change', (e) => exampleChangeFunc(e.target.value));
