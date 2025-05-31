// Dynamic code expects function names in window namespace. This workaround
// copies all the ES module names to the windows namespace until we have a
// better solution.
import * as svg from './svg.js';
import * as log from './log.js';
import * as edit from './edit.js';
Object.assign(window, svg);
Object.assign(window, log);
Object.assign(window, edit);

function setEditorsTheme(theme) {
    // Sets both Ace editors to correct theme
    const aceTheme = theme === 'dark' ? 'tomorrow_night_bright' : 'chrome';
    edit.setTheme(aceTheme);
    log.setTheme(aceTheme);
}

function toggleTheme() {
    const root = document.documentElement;
    const newTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    setEditorsTheme(newTheme);
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    setEditorsTheme(savedTheme);
}

// Main onload function -- bootstraps the app
window.onload = function () {
    edit.setupCodeWindow();
    log.setupLogWindow();
    setupTheme();
    window.dynCode = document.getElementById("dynamicCode");

    // Set page title and version label
    document.getElementById('page-title').innerText = document.title;
    const metaVersion = document.querySelector('meta[name="version"]');
    document.getElementById('version').innerText = 'v' + metaVersion.content;
};

// Attach functions used by HTML/UI (theme toggle)
document.getElementById('toggleThemeBtn').addEventListener('click', toggleTheme);
