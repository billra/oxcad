import { setTheme as setLogTheme } from './log.mjs';
import { setTheme as setCodeTheme } from './edit.mjs';
import './run.mjs';

function setEditorsTheme(theme) {
    // Sets both Ace editors to correct theme
    const aceTheme = theme === 'dark' ? 'tomorrow_night_bright' : 'chrome';
    setLogTheme(aceTheme);
    setCodeTheme(aceTheme);
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

setupTheme();

// Set page title and version label
document.getElementById('page-title').innerText = document.title;
const metaVersion = document.querySelector('meta[name="version"]');
document.getElementById('version').innerText = 'v' + metaVersion.content;

// UI event handlers
document.getElementById('toggleThemeBtn').addEventListener('click', toggleTheme);
