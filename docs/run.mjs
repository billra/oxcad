import { getCodeEdit } from './edit.mjs';
// context for dynamic code execution
import * as ox from './ox.mjs';
import * as svg from './svg.mjs';
import * as log from './log.mjs';

// Execute user code within a temporary function:
// User code can only see the API surface we present.
// No pollution of global namespace when executing.
function runCode() {
    const code = getCodeEdit().getValue();
    try {
        // Pass modules as context to user code.
        Function('ox', 'svg', 'log', code)(ox, svg, log);
    } catch (e) {
        log.print(`${e.name}: ${e.message}`);
    }
}

// UI event handlers
document.getElementById('runCodeBtn').addEventListener('click', runCode);
