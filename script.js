const GITHUB_USERNAME = "lljra";
const REPO_NAME = "PlantDATA";
const FILE_PATH = "data.json"; // Make sure data.json exists in the repo    
const TOKEN = "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"; // Secure this!

// GitHub API URLs
const API_BASE = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

document.addEventListener("DOMContentLoaded", () => {
    loadData();
    setupEventListeners();
});

// Expands/Collapses history
function setupEventListeners() {
    document.querySelectorAll(".expand-btn").forEach(button => {
        button.addEventListener("click", () => {
            const row = button.closest("tr").nextElementSibling;
            row.style.display = row.style.display === "table-row" ? "none" : "table-row";
        });
    });

    document.querySelectorAll(".add-row-btn").forEach(button => {
        button.addEventListener("click", () => {
            const tbody = button.previousElementSibling.querySelector(".hidden-tbody");
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td><input type="text" placeholder="Enter Height"></td>
                <td><input type="text" placeholder="Enter Leaf Information"></td>
                <td><input type="text" placeholder="Enter Date"></td>
                <td><button class="delete-btn">✖</button></td>
            `;
            tbody.appendChild(newRow);

            newRow.querySelector(".delete-btn").addEventListener("click", () => newRow.remove());
        });
    });
}

// Save Data
async function saveData() {
    const tables = document.querySelectorAll(".table-container");
    let data = [];

    tables.forEach(table => {
        let tableData = [];
        table.querySelectorAll(".main-row").forEach(mainRow => {
            let rowData = {
                plant: mainRow.children[1].textContent.trim(),
                germinationTime: mainRow.children[2].querySelector("input").value.trim(),
                height: mainRow.children[3].querySelector("input").value.trim(),
                leafFormation: mainRow.children[4].querySelector("input").value.trim(),
                date: mainRow.children[5].querySelector("input").value.trim(),
                history: []
            };

            const hiddenTable = mainRow.nextElementSibling.querySelector(".hidden-tbody");
            hiddenTable.querySelectorAll("tr").forEach(hiddenRow => {
                let historyEntry = {
                    height: hiddenRow.children[0].querySelector("input").value.trim(),
                    leafInfo: hiddenRow.children[1].querySelector("input").value.trim(),
                    date: hiddenRow.children[2].querySelector("input").value.trim(),
                };
                rowData.history.push(historyEntry);
            });

            tableData.push(rowData);
        });

        data.push(tableData);
    });

    try {
        const fileData = await fetch(API_BASE, {
            headers: { Authorization: `token ${TOKEN}` }
        }).then(res => res.json());

        const sha = fileData.sha;
        const content = btoa(JSON.stringify(data, null, 2));

        const response = await fetch(API_BASE, {
            method: "PUT",
            headers: {
                Authorization: `token ${TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Updated data.json",
                content,
                sha
            })
        });

        if (response.ok) {
            showSaveMessage("Data saved successfully!", "green");
        } else {
            showSaveMessage("Error saving data!", "red");
        }
    } catch (error) {
        console.error(error);
        showSaveMessage("GitHub API error!", "red");
    }
}

// Load Data
async function loadData() {
    try {
        const response = await fetch(API_BASE, {
            headers: { Authorization: `token ${TOKEN}` }
        });

        if (!response.ok) {
            console.warn("No existing data.json found.");
            return;
        }

        const fileData = await response.json();
        const content = JSON.parse(atob(fileData.content));

        const tables = document.querySelectorAll(".table-container");
        content.forEach((tableData, tableIndex) => {
            tableData.forEach((rowData, rowIndex) => {
                let mainRow = tables[tableIndex].querySelectorAll(".main-row")[rowIndex];
                mainRow.children[2].querySelector("input").value = rowData.germinationTime;
                mainRow.children[3].querySelector("input").value = rowData.height;
                mainRow.children[4].querySelector("input").value = rowData.leafFormation;
                mainRow.children[5].querySelector("input").value = rowData.date;

                const hiddenTable = mainRow.nextElementSibling.querySelector(".hidden-tbody");
                rowData.history.forEach(entry => {
                    let newRow = document.createElement("tr");
                    newRow.innerHTML = `
                        <td><input type="text" value="${entry.height}"></td>
                        <td><input type="text" value="${entry.leafInfo}"></td>
                        <td><input type="text" value="${entry.date}"></td>
                        <td><button class="delete-btn">✖</button></td>
                    `;
                    hiddenTable.appendChild(newRow);
                    newRow.querySelector(".delete-btn").addEventListener("click", () => newRow.remove());
                });
            });
        });

        showSaveMessage("Data loaded successfully!", "blue");
    } catch (error) {
        console.error(error);
        showSaveMessage("Error loading data!", "red");
    }
}

// Show save message
function showSaveMessage(message, color) {
    const saveIndicator = document.getElementById("saveIndicator");
    saveIndicator.textContent = message;
    saveIndicator.style.color = color;
    saveIndicator.style.display = "block";

    setTimeout(() => saveIndicator.style.display = "none", 3000);
}
