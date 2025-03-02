document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".expand-btn").forEach(button => {
        button.addEventListener("click", function() {
            let hiddenRow = this.closest("tr").nextElementSibling;
            hiddenRow.style.display = hiddenRow.style.display === "table-row" ? "none" : "table-row";
            this.textContent = this.textContent === "+" ? "-" : "+";
        });
    });

    document.querySelectorAll(".add-row-btn").forEach(button => {
        button.addEventListener("click", function() {
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
        let deleteBtn = row.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", function() {
            row.remove();
            saveData(); // Save the updated data after deleting a row
        });
    }

    function saveData() {
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
        localStorage.setItem("tableData", JSON.stringify(allData));
        let indicator = document.getElementById("saveIndicator");
        indicator.style.display = "block";
        setTimeout(() => {
            indicator.style.display = "none";
        }, 2000);
    }

    function loadData() {
        let storedData = localStorage.getItem("tableData");
        if (storedData) {
            let allData = JSON.parse(storedData);
            let mainRows = document.querySelectorAll("tbody tr.main-row");
            allData.forEach((rowData, index) => {
                if (mainRows[index]) {
                    mainRows[index].children[2].querySelector("input").value = rowData.germinationTime;
                    mainRows[index].children[3].querySelector("input").value = rowData.height;
                    mainRows[index].children[4].querySelector("input").value = rowData.leafFormation;
                    mainRows[index].children[5].querySelector("input").value = rowData.date;
                    let hiddenTable = mainRows[index].nextElementSibling.querySelector(".hidden-tbody");
                    if (hiddenTable) {
                        hiddenTable.innerHTML = ""; // Clear existing rows before adding new ones
                        rowData.history.forEach(historyData => {
                            let newRow = document.createElement("tr");
                            newRow.innerHTML = `
                                <td><input type="text" value="${historyData.height}" placeholder="Enter Height"></td>
                                <td><input type="text" value="${historyData.leafInfo}" placeholder="Enter Leaf Information"></td>
                                <td><input type="text" value="${historyData.date}" placeholder="Enter Date"></td>
                                <td><button class="delete-btn">✖</button></td>
                            `;
                            hiddenTable.appendChild(newRow);
                            attachDeleteFunction(newRow);
                        });
                    }
                }
            });
        }
    }

    window.onload = loadData;
});
