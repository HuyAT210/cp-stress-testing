const availableThemes = [
    { name: "Light", value: "vs" },
    { name: "Dark", value: "vs-dark" },
    { name: "High Contrast", value: "hc-black" },
    { name: "Catppuccin Mocha", value: "catppuccin-mocha" } // custom theme example
];
const themeSelect = document.getElementById("themeSelect");
availableThemes.forEach(theme => {
    const option = document.createElement("option");
    option.value = theme.value;
    option.textContent = theme.name;
    themeSelect.appendChild(option);
});

document.addEventListener("DOMContentLoaded", () => {
    const themeSelect = document.getElementById("themeSelect");
    const saveBtn = document.getElementById("saveBtn");

    // Load saved theme
    const savedTheme = localStorage.getItem("editorTheme") || "vs-dark";
    themeSelect.value = savedTheme;

    // Save theme on button click
    saveBtn.addEventListener("click", () => {
        const selectedTheme = themeSelect.value;
        localStorage.setItem("editorTheme", selectedTheme);
        alert("Settings saved! Theme: " + selectedTheme);
    });
});
