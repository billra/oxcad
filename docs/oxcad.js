// oxcad.js

// -=-=-=-=-=- Application Setup, App Logic, Window Events -=-=-=-=-=-=-

import * as svg from './svg.js';
import * as log from './log.js';

// Assign all svg.js and log.js functions to window for dynamic user code compatibility
Object.assign(window, svg);
Object.assign(window, log);

// Theme toggling
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
    window.setupCodeWindow();   // loaded via edit.js - still attached to window for now
    log.setupLogWindow();
    svg.setupSvgWindow();
    window.dynCode = document.getElementById("dynamicCode");

    // Set page title and version label
    document.getElementById('page-title').innerText = document.title;
    const metaVersion = document.querySelector('meta[name="version"]');
    document.getElementById('version').innerText = 'v' + metaVersion.content;

    // Attach SVG and Log control functions to window for HTML button onclicks (temporary)
    window.svgClear = svg.svgClear;
    window.svgSmaller = svg.svgSmaller;
    window.svgLarger = svg.svgLarger;

    window.logClear = log.logClear;
    window.logSmaller = log.logSmaller;
    window.logLarger = log.logLarger;
};

// Attach functions used by HTML/UI (theme toggle)
window.toggleTheme = toggleTheme;
