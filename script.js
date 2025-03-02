// 🟢 Replace with your GitHub info
const GITHUB_USERNAME = "lljra"; // Your GitHub username
const REPO_NAME = "PlantDATA"; // Your repository name
const FILE_PATH = "data.json"; // Path to your JSON file
const TOKEN = "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"; // Keep this private!

// API Endpoints
const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${FILE_PATH}`;
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

// 🟢 Function to Load Data from GitHub
async function loadData() {
    try {
        let response = await fetch(GITHUB_RAW_URL);
        if (!response.ok) throw new Error("Failed to fetch data");
        
        let data = await response.json();
        console.log("Loaded data:", data);
        populateTable(data); // Call your function to display data in the table
    } catch (error) {
        console.error("Error loading data from GitHub:", error);
    }
}

// 🟢 Function to Save Data to GitHub
async function saveData() {
    let allData = collectTableData(); // Convert table to JSON format

    try {
        // 🟢 Get latest SHA hash (needed to update a file in GitHub)
        let response = await fetch(GITHUB_API_URL, {
            headers: { Authorization: `token ${TOKEN}` }
        });
        let fileData = await response.json();
        let sha = fileData.sha;

        // 🟢 Send request to update the JSON file in GitHub
        await fetch(GITHUB_API_URL, {
            method: "PUT",
            headers: {
                Authorization: `token ${TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Updated table data",
                content: btoa(JSON.stringify(allData, null, 2)), // Convert JSON to Base64
                sha: sha
            })
        });

        alert("Data saved successfully to GitHub!");
    } catch (error) {
        console.error("Error saving data to GitHub:", error);
    }
}

// 🟢 Function to Collect Data from the Table
function collectTableData() {
    let allData = [];
    document.querySelectorAll("tbody tr.main-row").forEach(mainRow => {
        let rowData = {
            plant: mainRow.children[1].textContent,
            germinationTime: mainRow.children[2].querySelector("input").value,
            height: mainRow.children[3].querySelector("input").value,
            leafFormation: mainRow.children[4].querySelector("input").value,
            date: mainRow.children[5].querySelector("input").value,
            history: []
        };

        // 🟢 Get history data from expanded rows
        let hiddenTable = mainRow.nextElementSibling.querySelector(".hidden-tbody");
        if (hiddenTable) {
            hiddenTable.querySelectorAll("tr").forEach(hiddenRow => {
                let inputs = hiddenRow.querySelectorAll("input");
                if (inputs.length > 0) {
                    let historyData = {
                        height: inputs[0].value,
                        leafInfo: inputs[1].value,
                        date: inputs[2].value
                    };
                    rowData.history.push(historyData);
                }
            });
        }
        allData.push(rowData);
    });
    return allData;
}

// 🟢 Call loadData when the page loads
window.onload = loadData;
