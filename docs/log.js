import './acewrap.mjs';
import { getCodeEdit } from "./edit.js";

// -=-=-=-=-=- Logging and Log Window Utilities -=-=-=-=-=-=-

export function setTheme(name) {
    logEdit.setTheme("ace/theme/" + name);
}

export function logMsg(...args) {
    const session = logEdit.getSession();
    session.insert({
        row: session.getLength(),
        column: 0
    }, args.join(' ') + "\n");
}

export function logClear() {
    const metaVersion = document.querySelector('meta[name="version"]');
    logEdit.setValue('OxCad v' + metaVersion.content + ', Log Entries:\n');
    logEdit.clearSelection();
}

export function logSmaller() {
    const height = document.getElementById('codeWindow').clientHeight;
    if (height < 200) { return; }
    document.getElementById("codeWindow").style.height = height - 100 + 'px';
    document.getElementById("logWindow").style.height = height - 100 + 'px';
    getCodeEdit().resize();
    logEdit.resize();
}

export function logLarger() {
    const height = document.getElementById('codeWindow').clientHeight;
    document.getElementById("codeWindow").style.height = height + 100 + 'px';
    document.getElementById("logWindow").style.height = height + 100 + 'px';
    getCodeEdit().resize();
    logEdit.resize();
}

const logEdit = ace.edit("logWindow");
logEdit.setReadOnly(true);
logClear();

// UI event handlers
document.getElementById('logClearBtn').addEventListener('click', logClear);
document.getElementById('logSmallerBtn').addEventListener('click', logSmaller);
document.getElementById('logLargerBtn').addEventListener('click', logLarger);
