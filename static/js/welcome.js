const modal = document.getElementById("projectModal");
const createBtn = document.getElementById("createProjectBtn");
const cancelBtn = document.getElementById("cancelBtn");
const confirmBtn = document.getElementById("confirmBtn");
const projectNameInput = document.getElementById("projectNameInput");

// Show modal
createBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    projectNameInput.value = "";
    projectNameInput.focus();
});

// Hide modal
cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

// Confirm project creation
confirmBtn.addEventListener("click", async () => {
    const projectName = projectNameInput.value.trim();  
    if (projectName) {
        // Create project files first
        await createNewProjectFiles(projectName);

        // Add project to recent and redirect
        addRecentProject(projectName);
        window.location.href = `project.html?name=${encodeURIComponent(projectName)}`;
    } else {
        alert("Project name cannot be empty!");
    }
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

function addRecentProject(projectName) {
    let recentProjects = JSON.parse(localStorage.getItem("recentProjects")) || [];
    recentProjects.unshift({ name: projectName, date: new Date().toLocaleString() });
    recentProjects = recentProjects.slice(0, 20);
    localStorage.setItem("recentProjects", JSON.stringify(recentProjects));
}

function displayRecentProjects() {
    let recentProjects = JSON.parse(localStorage.getItem("recentProjects")) || [];
    let list = document.getElementById("recentProjectsList");
    list.innerHTML = "";

    if (recentProjects.length === 0) {
        list.innerHTML = "<li>No recent projects</li>";
        return;
    }

    recentProjects.forEach(proj => {
        let li = document.createElement("li");
        li.classList.add("recent-project-item");
        li.textContent = `${proj.name} (Created: ${proj.date})`;

        li.addEventListener("click", () => {
            window.location.href = `project.html?name=${encodeURIComponent(proj.name)}`;
        });

        list.appendChild(li);
    });
}


window.onload = displayRecentProjects;

// Create new project files on server
async function createNewProjectFiles(projectName) {
    const files = [
        { name: "gen.cpp", content: "// Write generator code here" },
        { name: "slow.cpp", content: "// Write slow solution here" },
        { name: "fast.cpp", content: "// Write fast solution here" }
    ];

    // Send request to FastAPI on port 8000
    await fetch("http://127.0.0.1:8000/create-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, files })
    });

    // After creation, load project files
}