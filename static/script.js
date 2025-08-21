require.config({ paths: { vs: "/static/monaco/vs" } });
require(["vs/editor/editor.main"], function () {
    window.genEditor = monaco.editor.create(document.getElementById("genCode"), {
        value: "// Write generator code here\n",
        language: "cpp",
        theme: "vs-dark",
        automaticLayout: true
    });

    window.slowEditor = monaco.editor.create(document.getElementById("slowCode"), {
        value: "// Write slow solution here\n",
        language: "cpp",
        theme: "vs-dark",
        automaticLayout: true
    });

    window.fastEditor = monaco.editor.create(document.getElementById("fastCode"), {
        value: "// Write fast solution here\n",
        language: "cpp",
        theme: "vs-dark",
        automaticLayout: true
    });

    // Example: button click reads editor values
    document.getElementById("runBtn").addEventListener("click", () => {
        const genCode = window.genEditor.getValue();
        const slowCode = window.slowEditor.getValue();
        const fastCode = window.fastEditor.getValue();

        document.getElementById("output").textContent =
            "Generator:\n" + genCode +
            "\n\nSlow Solution:\n" + slowCode +
            "\n\nFast Solution:\n" + fastCode;
    });
    document.getElementById("runBtn").addEventListener("click", async () => {
        const folderName = document.getElementById("folderName").value;
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
