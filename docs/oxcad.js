// oxcad.js

// -=-=-=-=-=- Application Setup, App Logic, Window Events -=-=-=-=-=-=-

// todo: workaround for current code examples strategy
// Assign all svg.js functions to window for dynamic user code compatibility
import * as svg from './svg.js';
Object.assign(window, svg);

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
    window.setupLogWindow();    // loaded via log.js  - still attached to window for now
    svg.setupSvgWindow();
    window.dynCode = document.getElementById("dynamicCode");

    // Set page title and version label
    document.getElementById('page-title').innerText = document.title;
    const metaVersion = document.querySelector('meta[name="version"]');
    document.getElementById('version').innerText = 'v' + metaVersion.content;

    // Attach SVG control functions to window for HTML button onclicks (temporary during migration)
    window.svgClear = svg.svgClear;
    window.svgSmaller = svg.svgSmaller;
    window.svgLarger = svg.svgLarger;
}

// Attach functions used by HTML/UI (theme toggle)
window.toggleTheme = toggleTheme;
