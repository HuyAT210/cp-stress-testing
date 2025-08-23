require.config({ paths: { vs: "/static/monaco/vs" } });

require(["vs/editor/editor.main"], async function () {
    // Create editors with empty values first
    window.genEditor = createEditor("genCode", "");
    window.slowEditor = createEditor("slowCode", "");
    window.fastEditor = createEditor("fastCode", "");

    const projectName = getProjectName();

    // Always load project files from backend
    await loadProjectFiles(projectName);

    // Show project name at top
    setProjectTitle(projectName);

    // Run button handler
    document.getElementById("runBtn").addEventListener("click", async () => {
        const folderName = `${projectName}`;
        const genCode = window.genEditor.getValue();
        const slowCode = window.slowEditor.getValue();
        const fastCode = window.fastEditor.getValue();

        document.getElementById("output").textContent = "Running...";
        
        try {
            const response = await fetch("http://127.0.0.1:8000/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folderName, genCode, slowCode, fastCode })
            });
            const data = await response.json();
            document.getElementById("output").textContent = data.output;
        } catch (err) {
            document.getElementById("output").textContent = "Error: " + err;
        }
    });
});

// Helpers
function getProjectName() {
    const params = new URLSearchParams(window.location.search);
    return params.get("name");
}

function createEditor(elementId, defaultValue) {
    return monaco.editor.create(document.getElementById(elementId), {
        value: defaultValue,
        language: "cpp",
        theme: "vs-dark",
        automaticLayout: true
    });
}

async function loadProjectFiles(projectName) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/read-project?name=${encodeURIComponent(projectName)}`);
        if (!response.ok) throw new Error("Failed to load project files");

        const data = await response.json();
        const files = data.files || [];

        // Find file contents by name, fallback to comment if missing
        const genContent = getFileContent(files, "gen.cpp", "// Missing gen.cpp\n");
        const slowContent = getFileContent(files, "slow.cpp", "// Missing slow.cpp\n");
        const fastContent = getFileContent(files, "fast.cpp", "// Missing fast.cpp\n");

        window.genEditor.setValue(genContent);
        window.slowEditor.setValue(slowContent);
        window.fastEditor.setValue(fastContent);
    } catch (err) {
        console.error("Error loading project:", err);
    }
}

function getFileContent(files, name, fallback) {
    const file = files.find(f => f.name === name);
    return file ? file.content : fallback;
}

function setProjectTitle(projectName) {
    const titleElement = document.getElementById("projectTitle");
    titleElement.textContent = `Project: ${projectName}`;
}
