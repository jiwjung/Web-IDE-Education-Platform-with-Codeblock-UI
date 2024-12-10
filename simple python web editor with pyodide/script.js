let pyodide = null;

// Capture browser console output without prefix
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
console.log = function(message) {
    originalConsoleLog(message);
    document.getElementById("browserConsole").innerText += "\n" + message;
};
console.error = function(message) {
    originalConsoleError(message);
    document.getElementById("browserConsole").innerText += "\n" + message;
};

async function loadPyodideAndPackages() {
    pyodide = await loadPyodide();
}
window.addEventListener('load', loadPyodideAndPackages);

async function runCode() {
    if (!pyodide) {
        document.getElementById('pythonConsole').innerText = "Pyodide is not loaded yet.";
        return;
    }
    const code = editor.getValue();
    try {
        const output = await pyodide.runPythonAsync(code);
        document.getElementById('pythonConsole').innerText = output || "[ ! ] Execution completed.\n[ ! ] Check your browser console.";
    } catch (error) {
        document.getElementById('pythonConsole').innerText = "Error: " + error;
    }
}

function showConsole(consoleId) {
    document.getElementById("pythonConsole").classList.remove("active-console");
    document.getElementById("browserConsole").classList.remove("active-console");
    document.getElementById(consoleId).classList.add("active-console");
    document.getElementById("pythonTab").classList.remove("active-tab");
    document.getElementById("browserTab").classList.remove("active-tab");
    document.getElementById(consoleId === 'pythonConsole' ? "pythonTab" : "browserTab").classList.add("active-tab");
}

require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.21.2/min/vs' } });
require(['vs/editor/editor.main'], function () {
    window.editor = monaco.editor.create(document.getElementById('editor'), {
        value: "# Write Python code here \nprint('202345047 정지원') \n\nfor i in range(6): \n    print('*' * i)",
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true
    });
});