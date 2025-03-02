const GITHUB_USERNAME = "lljra";
const REPO_NAME = "PlantDATA";
const FILE_PATH = "data.json"; // Make sure data.json exists in the repo
const BRANCH = "main"; // Change if using another branch
const TOKEN = "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"; // Secure this!

// Fetch latest data.json file
async function loadData() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`, {
            headers: { Authorization: `token ${TOKEN}` }
        });

        if (!response.ok) throw new Error("Failed to fetch data.json");

        const fileData = await response.json();
        const content = atob(fileData.content); // Decode base64 content
        const data = JSON.parse(content);

        populateTables(data);
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// Save data to GitHub
async function saveData() {
    try {
        // Show "Saving..." indicator
        const saveIndicator = document.getElementById("saveIndicator");
        saveIndicator.style.display = "block";
        saveIndicator.style.color = "blue";
        saveIndicator.textContent = "Saving...";

        // Capture input data
        const tables = document.querySelectorAll(".table-container");
        const allData = [];

        tables.forEach((table, index) => {
            const rows = table.querySelectorAll(".main-row");
            const tableData = [];

            rows.forEach(row => {
                const inputs = row.querySelectorAll("input");
                tableData.push({
                    plant: row.children[1].textContent,
                    germinationTime: inputs[0].value,
                    height: inputs[1].value,
                    leafFormation: inputs[2].value,
                    date: inputs[3].value
                });
            });

            allData.push({ tableIndex: index, data: tableData });
        });

        // Fetch the latest file SHA
        const fileResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`, {
            headers: { Authorization: `token ${TOKEN}` }
        });

        if (!fileResponse.ok) throw new Error("Error fetching file SHA");

        const fileData = await fileResponse.json();
        const sha = fileData.sha;

        // Upload updated content
        const newContent = btoa(JSON.stringify(allData, null, 2));
        const updateResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
            method: "PUT",
            headers: { 
                Authorization: `token ${TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Updated plant data",
                content: newContent,
                sha,
                branch: BRANCH
            })
        });

        if (!updateResponse.ok) throw new Error("Error saving data");

        // Show success message
        saveIndicator.style.color = "green";
        saveIndicator.textContent = "Data saved successfully!";
        console.log("Data saved successfully!");
    } catch (error) {
        console.error("Error saving data:", error);

        // Show error message
        const saveIndicator = document.getElementById("saveIndicator");
        saveIndicator.style.color = "red";
        saveIndicator.textContent = "Error saving data!";
    }

    // Hide message after 3 seconds
    setTimeout(() => {
        document.getElementById("saveIndicator").style.display = "none";
    }, 3000);
}

// Populate tables with loaded data
function populateTables(data) {
    const tables = document.querySelectorAll(".table-container");

    data.forEach((tableObj, index) => {
        const rows = tables[index].querySelectorAll(".main-row");

        tableObj.data.forEach((plantData, rowIndex) => {
            const inputs = rows[rowIndex].querySelectorAll("input");
            if (inputs.length === 4) {
                inputs[0].value = plantData.germinationTime;
                inputs[1].value = plantData.height;
                inputs[2].value = plantData.leafFormation;
                inputs[3].value = plantData.date;
            }
        });
    });
}

// Load data on page load
window.onload = loadData;
