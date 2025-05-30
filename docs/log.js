// log.js
(function () {
    // -=-=-=-=-=- Logging and Log Window Utilities -=-=-=-=-=-=-

    function logMsg() {
        const args = Array.prototype.slice.call(arguments);
        const session = window.logEdit.getSession();
        session.insert({
            row: session.getLength(),
            column: 0
        }, args.join(' ') + "\n");
    }

    function logClear() {
        const metaVersion = document.querySelector('meta[name="version"]');
        window.logEdit.setValue('OxCad v' + metaVersion.content + ', Log Entries:\n');
        window.logEdit.clearSelection();
    }

    function logSmaller() {
        const height = document.getElementById('codeWindow').clientHeight;
        if (height < 200) { return; }
        document.getElementById("codeWindow").style.height = height - 100 + 'px';
        document.getElementById("logWindow").style.height = height - 100 + 'px';
        window.codeEdit.resize();
        window.logEdit.resize();
    }

    function logLarger() {
        const height = document.getElementById('codeWindow').clientHeight;
        document.getElementById("codeWindow").style.height = height + 100 + 'px';
        document.getElementById("logWindow").style.height = height + 100 + 'px';
        window.codeEdit.resize();
        window.logEdit.resize();
    }

    function setupLogWindow() {
        window.logEdit = ace.edit("logWindow");
        window.logEdit.setTheme("ace/theme/chrome");
        window.logEdit.setReadOnly(true);
        logClear();
    }

    // Attach publicly-used functions to window
    window.logMsg = logMsg;
    window.logClear = logClear;
    window.logSmaller = logSmaller;
    window.logLarger = logLarger;
    window.setupLogWindow = setupLogWindow;
})();
