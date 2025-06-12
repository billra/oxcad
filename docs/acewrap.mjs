// translate theme into specific editor theme
// 'dark' -> dark editor theme, everything else -> light editor theme
export function editorTheme(theme) {
    const aceTheme = theme === 'dark' ? 'tomorrow_night_bright' : 'chrome';
    return 'ace/theme/' + aceTheme;
}

// Ace does not have ES module versions.
// We load the 'normal' JavaScript by hand.
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
await loadScript('https://cdn.jsdelivr.net/npm/ace-builds@1.41.0/src-min-noconflict/ace.js');
console.log('ace version:', ace.version);
