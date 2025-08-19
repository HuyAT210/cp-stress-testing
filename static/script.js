document.getElementById("runBtn").addEventListener("click", async () => {
    const folderName = document.getElementById("folderName").value;
    const genCode = document.getElementById("genCode").value;
    const slowCode = document.getElementById("slowCode").value;
    const fastCode = document.getElementById("fastCode").value;

    document.getElementById("output").textContent = "Running...";
    
    const response = await fetch("http://127.0.0.1:8000/run", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ folderName, genCode, slowCode, fastCode })
    });

    const data = await response.json();
    document.getElementById("output").textContent = data.output;
});
