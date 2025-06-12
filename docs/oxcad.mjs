import { setTheme as setLogTheme } from './log.mjs';
import { setTheme as setCodeTheme } from './edit.mjs';
import './run.mjs';

function toggleTheme() {
    const root = document.documentElement;
    const theme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    setLogTheme(theme);
    setCodeTheme(theme);
}

// Set page title and version label
document.getElementById('page-title').innerText = document.title;
const metaVersion = document.querySelector('meta[name="version"]');
document.getElementById('version').innerText = 'v' + metaVersion.content;

// UI event handlers
document.getElementById('toggleThemeBtn').addEventListener('click', toggleTheme);
