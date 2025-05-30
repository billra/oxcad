// edit.js
(function () {
    // -=-=-=-=-=- Ace Code Window (User Code Editing) -=-=-=-=-=-=-

    function codeUndo() {
        window.codeEdit.undo();
    }

    function codeRedo() {
        window.codeEdit.redo();
    }

    function runCode() {
        const code = window.codeEdit.getValue();
        const script = document.createElement('script');
        script.innerHTML = 'try{' + code + '}catch(e){logMsg("Code Error:",e.message);}';
        window.dynCode.innerHTML = ''; // clear previous children
        window.dynCode.appendChild(script);
    }

    function exampleChangeFunc(id) {
        window.codeEdit.setValue(window.codeExamples[id]);
        window.codeEdit.clearSelection();
    }

    function fillExampleDropdown() {
        const select = document.getElementById("selectBox");
        for (const key in window.codeExamples) {
            const el = document.createElement("option");
            el.textContent = key;
            el.value = key;
            select.appendChild(el);
        }
    }

    function setupCodeWindow() {
        window.codeEdit = ace.edit("codeWindow");
        window.codeEdit.setTheme("ace/theme/chrome");
        window.codeEdit.getSession().setMode("ace/mode/javascript");
        fillExampleDropdown();
        exampleChangeFunc('mirrordemo'); // preload sample code
    }

    // Attach public API/globals
    window.codeUndo = codeUndo;
    window.codeRedo = codeRedo;
    window.runCode = runCode;
    window.exampleChangeFunc = exampleChangeFunc;
    window.fillExampleDropdown = fillExampleDropdown;
    window.setupCodeWindow = setupCodeWindow;
})();
