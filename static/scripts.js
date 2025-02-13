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
                        if (selectedItem === "Books") {
                            // Special handling for Books
                            additionalFieldsLabel.textContent = "Size:";
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
                        } else {
                            // Regular behavior for other items
                            data.forEach(model => {
                                const option = document.createElement("option");
                                option.value = model.Model;
                                option.textContent = `${model.Model} - ${model.Description}`;
                                modelSelect.appendChild(option);
                            });
                            modelSelect.disabled = false;
                        }
                    }
                })
                .catch(error => {
                    console.error("Error fetching models:", error);
                });
        } else {
            additionalFields.innerHTML = "";
            additionalFieldsLabel.style.display = "none";
        }
    });

    // Handle calculate button for dynamic fields
    document.getElementById("calculate-button").addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Calculate button clicked");
        const selectedItem = itemSelect.value;
        if (selectedItem === "Books") {
            const pages = parseInt(document.getElementById("pages").value) || 0;
            const bindingType = document.querySelector('input[name="binding"]:checked')?.value;

            if (!pages || !bindingType) {
                alert("Please provide all the details for the book calculation.");
                return;
            }

            fetch("/calculate_books", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pages: pages,
                    binding: bindingType,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        document.getElementById("price").value = data.price.toFixed(2);
                    }
                })
                .catch(error => {
                    console.error("Error calculating book price:", error);
                });
        }
    });
});