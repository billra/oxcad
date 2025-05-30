// oxcad.js
(function () {
    // -=-=-=-=-=- Application Setup, App Logic, Window Events -=-=-=-=-=-=-

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

    // SVG window setup
    function setupSvgWindow() {
        window.svgEdit = document.getElementById("svgWindow");
        window.svgClear();
    }

    // Main onload function -- bootstraps the app
    window.onload = function () {
        setupTheme();
        window.setupCodeWindow();
        window.setupLogWindow();
        setupSvgWindow();
        window.dynCode = document.getElementById("dynamicCode");

        // Set page title and version label
        document.getElementById('page-title').innerText = document.title;
        const metaVersion = document.querySelector('meta[name="version"]');
        document.getElementById('version').innerText = 'v' + metaVersion.content;
    };

    // Attach functions used by HTML/UI
    window.toggleTheme = toggleTheme;
})();
