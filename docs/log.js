// log.js

// -=-=-=-=-=- Logging and Log Window Utilities -=-=-=-=-=-=-

let logEdit = null;

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
    window.codeEdit.resize();
    logEdit.resize();
}

export function logLarger() {
    const height = document.getElementById('codeWindow').clientHeight;
    document.getElementById("codeWindow").style.height = height + 100 + 'px';
    document.getElementById("logWindow").style.height = height + 100 + 'px';
    window.codeEdit.resize();
    logEdit.resize();
}

export function setupLogWindow() {
    logEdit = ace.edit("logWindow");
    logEdit.setTheme("ace/theme/chrome");
    logEdit.setReadOnly(true);
    logClear();
}
