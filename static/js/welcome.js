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
confirmBtn.addEventListener("click", () => {
    const projectName = projectNameInput.value.trim();
    if (projectName) {
        // Redirect with project name
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
    recentProjects = recentProjects.slice(0, 20); // keep last 5 projects
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
        li.classList.add("recent-project-item"); // add class for styling
        li.textContent = `${proj.name} (Created: ${proj.date})`;
    
        // Click to open project
        li.addEventListener("click", () => {
            window.location.href = `project.html?name=${encodeURIComponent(proj.name)}`;
        });
    
        list.appendChild(li);
    });    
}
function setProjectTitle(projectName) {
    const titleElement = document.getElementById("projectTitle");
    titleElement.textContent = `Project: ${projectName}`;
}

window.onload = displayRecentProjects;