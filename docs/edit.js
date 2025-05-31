import './acewrap.mjs';

// -=-=-=-=-=- Ace Code Window (User Code Editing) -=-=-=-=-=-=-

export function getCodeEdit() { return codeEdit; }

export function setTheme(name) {
    codeEdit.setTheme("ace/theme/" + name);
}

export function codeUndo() {
    codeEdit.undo();
}

export function codeRedo() {
    codeEdit.redo();
}

export function runCode() {
    const code = codeEdit.getValue();
    const script = document.createElement('script');
    script.innerHTML = 'try{' + code + '}catch(e){logMsg("Code Error:",e.message);}';
    const dynCode = document.getElementById("dynamicCode");
    dynCode.innerHTML = ''; // clear previous children
    dynCode.appendChild(script);
}

export function exampleChangeFunc(id) {
    codeEdit.setValue(window.codeExamples[id]);
    codeEdit.clearSelection();
}

export function fillExampleDropdown() {
    const select = document.getElementById("selectBox");
    for (const key in window.codeExamples) {
        const el = document.createElement("option");
        el.textContent = key;
        el.value = key;
        select.appendChild(el);
    }
}

const codeEdit = ace.edit("codeWindow");
codeEdit.session.setMode("ace/mode/javascript");
fillExampleDropdown();
exampleChangeFunc('mirrordemo'); // preload sample code

// UI event handlers
document.getElementById('runCodeBtn').addEventListener('click', runCode);
document.getElementById('codeUndoBtn').addEventListener('click', codeUndo);
document.getElementById('codeRedoBtn').addEventListener('click', codeRedo);
document.getElementById('selectBox').addEventListener('change', (e) => exampleChangeFunc(e.target.value));
