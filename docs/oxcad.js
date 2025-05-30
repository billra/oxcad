// oxcad.js

import * as svg from './svg.js';
import * as log from './log.js';
import * as edit from './edit.js';

// Assign all ES module exports to window for compatibility with dynamic user code and existing inline event handlers
Object.assign(window, svg);
Object.assign(window, log);
Object.assign(window, edit);

function toggleTheme() {
    const root = document.documentElement;
    const newTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Main onload function -- bootstraps the app
window.onload = function () {
    setupTheme();
    edit.setupCodeWindow();
    log.setupLogWindow();
    svg.setupSvgWindow();
    window.dynCode = document.getElementById("dynamicCode");

    // Set page title and version label
    document.getElementById('page-title').innerText = document.title;
    const metaVersion = document.querySelector('meta[name="version"]');
    document.getElementById('version').innerText = 'v' + metaVersion.content;
};

// Attach functions used by HTML/UI (theme toggle)
document.getElementById('toggleThemeBtn').addEventListener('click', toggleTheme);
