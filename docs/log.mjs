import './acewrap.mjs';
import { getCodeEdit } from "./edit.mjs";

export function setTheme(theme) {
    console.log('log theme set to', theme);
    const aceTheme = theme === 'dark' ? 'tomorrow_night_bright' : 'chrome';
    logEdit.setTheme("ace/theme/" + aceTheme);
}

export function print(...args) {
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
    getCodeEdit().resize();
    logEdit.resize();
}

function logLarger() {
    const height = document.getElementById('codeWindow').clientHeight;
    document.getElementById("codeWindow").style.height = height + 100 + 'px';
    document.getElementById("logWindow").style.height = height + 100 + 'px';
    getCodeEdit().resize();
    logEdit.resize();
}

const logEdit = ace.edit("logWindow");
setTheme(document.documentElement.getAttribute('data-theme'));
logEdit.setReadOnly(true);
logClear();

// UI event handlers
document.getElementById('logClearBtn').addEventListener('click', logClear);
document.getElementById('logSmallerBtn').addEventListener('click', logSmaller);
document.getElementById('logLargerBtn').addEventListener('click', logLarger);
