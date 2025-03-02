document.addEventListener("DOMContentLoaded", function () {
    const GITHUB_USERNAME = "lljra"; 
    const REPO_NAME = "PlantDATA"; 
    const FILE_PATH = "data.json"; 
    const TOKEN = "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"; 

    document.querySelectorAll(".expand-btn").forEach(button => {
        button.addEventListener("click", function () {
            let hiddenRow = this.closest("tr").nextElementSibling;
            hiddenRow.style.display = hiddenRow.style.display === "table-row" ? "none" : "table-row";
            this.textContent = this.textContent === "+" ? "-" : "+";
        });
    });

    document.querySelectorAll(".add-row-btn").forEach(button => {
        button.addEventListener("click", function () {
            let tbody = this.previousElementSibling.querySelector(".hidden-tbody");
            let newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td><input type="text" placeholder="Enter Height"></td>
                <td><input type="text" placeholder="Enter Leaf Information"></td>
                <td><input type="text" placeholder="Enter Date"></td>
                <td><button class="delete-btn">✖</button></td>
            `;
            tbody.appendChild(newRow);
            attachDeleteFunction(newRow);
        });
    });

    function attachDeleteFunction(row) {
        row.querySelector(".delete-btn").addEventListener("click", function () {
            row.remove();
        });
    }

    async function getFileSha() {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                Authorization: `token ${TOKEN}`,
                Accept: "application/vnd.github.v3+json"
            }
        });
        if (!response.ok) {
            console.error("Error fetching file SHA:", response.statusText);
            return null;
        }
        const data = await response.json();
        return data.sha;
    }

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
                        rowData.history.push({
                            height: inputs[0].value,
                            leafInfo: inputs[1].value,
                            date: inputs[2].value
                        });
                    }
                });
            }
            allData.push(rowData);
        });

        let fileSha = await getFileSha();
        if (!fileSha) {
            alert("Error fetching file SHA. Check your repository and token.");
            return;
        }

        const payload = {
            message: "Update data.json via GitHub API",
            content: btoa(JSON.stringify(allData, null, 2)), // Encode to Base64
            sha: fileSha
        };

        fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
            method: "PUT",
            headers: {
                Authorization: `token ${TOKEN}`,
                Accept: "application/vnd.github.v3+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Success:", data);
            document.getElementById("saveIndicator").style.display = "block";
            setTimeout(() => {
                document.getElementById("saveIndicator").style.display = "none";
            }, 2000);
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to save data to GitHub.");
        });
    }

    window.saveData = saveData;
});
