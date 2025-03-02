document.addEventListener("DOMContentLoaded", function () {
    const GITHUB_USERNAME = "lljra";
    const REPO_NAME = "PlantDATA";
    const FILE_PATH = "data.json";
    const GITHUB_TOKEN = "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"; // Store securely, not in public repos

    const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

    // Expand Table Rows
    document.querySelectorAll(".expand-btn").forEach(button => {
        button.addEventListener("click", function () {
            let hiddenRow = this.closest("tr").nextElementSibling;
            hiddenRow.style.display = hiddenRow.style.display === "table-row" ? "none" : "table-row";
            this.textContent = this.textContent === "+" ? "-" : "+";
        });
    });

    // Add Row Functionality
    document.querySelectorAll(".add-row-btn").forEach(button => {
        button.addEventListener("click", function () {
            let tbody = this.previousElementSibling.querySelector(".hidden-tbody");
            let newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td><input type="text" placeholder="Enter Height"></td>
                <td><input type="text" placeholder="Enter Leaf Information"></td>
                <td><input type="text" placeholder="Enter Date"></td>
                <td><button class="delete-btn">✖</button></td>`;
            tbody.appendChild(newRow);
            attachDeleteFunction(newRow);
        });
    });

    // Attach Delete Functionality
    function attachDeleteFunction(row) {
        row.querySelector(".delete-btn").addEventListener("click", function () {
            row.remove();
            saveData();
        });
    }

    // Save Data to GitHub
    async function saveData() {
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

        let content = btoa(JSON.stringify(allData, null, 2)); // Convert JSON to Base64
        let sha = await getSHA(); // Fetch SHA for update

        const response = await fetch(GITHUB_API_URL, {
            method: "PUT",
            headers: {
                "Authorization": `token ${GITHUB_TOKEN}`,
                "Content-Type": "application/json",
                "Accept": "application/vnd.github.v3+json"
            },
            body: JSON.stringify({
                message: "Update data.json",
                content: content,
                sha: sha
            })
        });

        if (response.ok) {
            console.log("✅ Data saved successfully to GitHub!");
        } else {
            console.error("❌ Error saving data:", response.statusText);
        }
    }

    // Load Data from GitHub
    async function loadData() {
        try {
            const response = await fetch(GITHUB_API_URL, {
                headers: { "Authorization": `token ${GITHUB_TOKEN}` }
            });
            if (response.ok) {
                const fileData = await response.json();
                const content = atob(fileData.content); // Decode Base64
                const allData = JSON.parse(content);

                let mainRows = document.querySelectorAll("tbody tr.main-row");
                allData.forEach((rowData, index) => {
                    if (mainRows[index]) {
                        mainRows[index].children[2].querySelector("input").value = rowData.germinationTime;
                        mainRows[index].children[3].querySelector("input").value = rowData.height;
                        mainRows[index].children[4].querySelector("input").value = rowData.leafFormation;
                        mainRows[index].children[5].querySelector("input").value = rowData.date;

                        let hiddenTable = mainRows[index].nextElementSibling.querySelector(".hidden-tbody");
                        if (hiddenTable) {
                            hiddenTable.innerHTML = ""; // Clear old data
                            rowData.history.forEach(historyData => {
                                let newRow = document.createElement("tr");
                                newRow.innerHTML = `
                                    <td><input type="text" value="${historyData.height}" placeholder="Enter Height"></td>
                                    <td><input type="text" value="${historyData.leafInfo}" placeholder="Enter Leaf Information"></td>
                                    <td><input type="text" value="${historyData.date}" placeholder="Enter Date"></td>
                                    <td><button class="delete-btn">✖</button></td>`;
                                hiddenTable.appendChild(newRow);
                                attachDeleteFunction(newRow);
                            });
                        }
                    }
                });

                console.log("✅ Data loaded successfully from GitHub!");
            } else {
                console.error("❌ Error loading data:", response.statusText);
            }
        } catch (error) {
            console.error("❌ Failed to fetch data:", error);
        }
    }

    // Get SHA of Existing data.json (Needed for Updating)
    async function getSHA() {
        try {
            const response = await fetch(GITHUB_API_URL, {
                headers: { "Authorization": `token ${GITHUB_TOKEN}` }
            });
            if (response.ok) {
                const fileData = await response.json();
                return fileData.sha;
            }
        } catch (error) {
            console.warn("⚠️ File not found, creating new...");
        }
        return null;
    }

    // Load data on page load
    loadData();
});
