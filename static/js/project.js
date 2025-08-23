require.config({ paths: { vs: "/static/monaco/vs" } });
require(["vs/editor/editor.main"], async function () {
    // Create editors with default content
    window.genEditor = createEditor("genCode", "// Write generator code here\n");
    window.slowEditor = createEditor("slowCode", "// Write slow solution here\n");
    window.fastEditor = createEditor("fastCode", "// Write fast solution here\n");

    // Then load real files if they exist
    const projectName = getProjectName();
    await fillEditorValues(projectName);

	setProjectTitle(projectName);

    // Run button stays the same
    document.getElementById("runBtn").addEventListener("click", async () => {
        const folderPath = `/storage/${projectName}`;
        const genCode = window.genEditor.getValue();
        const slowCode = window.slowEditor.getValue();
        const fastCode = window.fastEditor.getValue();

        document.getElementById("output").textContent = "Running...";

        try {
            const response = await fetch("http://127.0.0.1:8000/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folderPath, genCode, slowCode, fastCode })
            });
            const data = await response.json();
            document.getElementById("output").textContent = data.output;
        } catch (err) {
            document.getElementById("output").textContent = "Error: " + err;
        }
    });
});

// Get project name from URL
function getProjectName() {
    const params = new URLSearchParams(window.location.search);
    return params.get("name");
}

// Create a single Monaco editor with default value
function createEditor(elementId, defaultValue) {
    return monaco.editor.create(document.getElementById(elementId), {
        value: defaultValue,
        language: "cpp",
        theme: "vs-dark",
        automaticLayout: true
    });
}

// Fetch file content if it exists, else return default value
async function fetchFileOrDefault(projectName, fileName, defaultValue) {
    try {
        const res = await fetch(`/storage/${projectName}/${fileName}`);
        if (res.ok) {
            return await res.text();
        }
    } catch (e) {
        // ignore errors, just return default
    }
    return defaultValue;
}

// Fill editors with file content if exists
async function fillEditorValues(projectName) {
    const gen = await fetchFileOrDefault(projectName, "gen.cpp", "// Write generator code here\n");
    const slow = await fetchFileOrDefault(projectName, "slow.cpp", "// Write slow solution here\n");
    const fast = await fetchFileOrDefault(projectName, "fast.cpp", "// Write fast solution here\n");

    window.genEditor.setValue(gen);
    window.slowEditor.setValue(slow);
    window.fastEditor.setValue(fast);
}
function setProjectTitle(projectName) {
    const titleElement = document.getElementById("projectTitle");
    titleElement.textContent = `Project: ${projectName}`;
}
