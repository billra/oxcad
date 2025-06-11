// select, read, and write utf-8 text files

// A Promise-based approach is a bad fit for file selection. The native HTML
// file input does not provide a reliable standard way to detect if the user
// clicks 'Cancel' in the file picker. Specifically, the browser fires a
// 'change' event only if a file is actually selected, and does nothing at all
// otherwise. This limitation causes Promise-based solutions to leave dangling
// unresolved promises if the user cancels, unless we introduce undesirable
// hacks (like timers or window focus listeners). For simplicity, clarity, and
// predictable control flow, we explicitly use a callback-based approach. In
// practice, this callback style makes handling file-picker cancellation simple
// and natural: if no file is selected, no callbacks get called, and no promises
// are left hanging.

export default class File {
    static #selectDialog(onSelect, accept = 'text/plain') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.onchange = () => {
            const file = input.files[0];
            if (file) {
                onSelect(file);
            }
            // If the user cancels, 'change' event doesn't fire,
            // so this callback does not run.
        };
        input.click();
    }

    static read(file, onLoad, onError = console.error) {
        const reader = new FileReader();
        reader.onload = () =>
            // normalize line endings to Unix-style '\n'
            onLoad(reader.result.replace(/\r\n|\r|\n/g, '\n'));
        reader.onerror = () => onError(reader.error);
        reader.readAsText(file, 'UTF-8');
    }

    static selectAndRead(onLoad, onError = console.error) {
        this.#selectDialog(file => this.read(file, onLoad, onError));
        // If file selection is canceled, file callback doesn't fire,
        // so read never executes.
    }

    // Files are saved immediately or a dialog is displayed allowing
    // the name to be changed. This behavior is controlled by the browser.
    // Chrome setting: "Ask where to save each file before downloading".
    // FireFox setting: "Always ask you where to save files".
    static save(text, filename = 'file.txt') {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        // document.body.appendChild(link); // necessary for Firefox compatibility? tests ok when we remove
        link.click();
        // document.body.removeChild(link); // clean up the DOM after click
        URL.revokeObjectURL(url);        // free up resources by revoking object URL
    }
}
