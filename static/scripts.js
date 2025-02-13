document.addEventListener("DOMContentLoaded", function () {
    const itemSelect = document.getElementById("item-select");
    const modelSelect = document.getElementById("model-select");
    const additionalFields = document.getElementById("additional-fields");
    const additionalFieldsLabel = document.getElementById("additional-fields-label");

    itemSelect.addEventListener("change", function () {
        const selectedItem = itemSelect.value;
        modelSelect.disabled = true;
        modelSelect.innerHTML = '<option value="">-- Choose a Model --</option>';

        if (selectedItem) {
            fetch("/get_models", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ item: selectedItem }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        data.forEach(model => {
                            const option = document.createElement("option");
                            option.value = model.Model;
                            option.textContent = `${model.Model} - ${model.Description}`;
                            modelSelect.appendChild(option);
                        });
                        modelSelect.disabled = false;
                    }
                })
                .catch(error => {
                    console.error("Error fetching models:", error);
                });
        }

        // Reset additional fields
        additionalFields.innerHTML = "";
        additionalFieldsLabel.style.display = "none";

        if (selectedItem === "Books") {
            additionalFieldsLabel.style.display = "block";
            additionalFields.innerHTML = `
                <label>Binding Type:</label>
                <div>
                    <label><input type="radio" name="binding" value="Spiral Binding"> Spiral Binding</label><br>
                    <label><input type="radio" name="binding" value="Saddle Stitch"> Saddle Stitch</label><br>
                    <label><input type="radio" name="binding" value="Perfect Bound"> Perfect Bound</label><br>
                    <label><input type="radio" name="binding" value="Hard Cover"> Hard Cover</label>
                </div>
                <label for="pages">Number of Pages:</label>
                <input type="number" id="pages" name="pages" min="1">
            `;
        }
    });
});