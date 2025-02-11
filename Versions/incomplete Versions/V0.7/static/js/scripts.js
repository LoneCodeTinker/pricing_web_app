document.addEventListener('DOMContentLoaded', () => {
    const itemSelect = document.getElementById('item');
    const modelSelect = document.getElementById('model');
    const descriptionField = document.getElementById('description');
    const quantityField = document.getElementById('quantity');
    const calculateButton = document.getElementById('calculate');
    const resultFields = {
        unitPrice: document.getElementById('unit-price'),
        total: document.getElementById('total'),
        vat: document.getElementById('vat'),
        totalWithVat: document.getElementById('total-with-vat')
    };

    const bindingTypeSection = document.getElementById('binding-type-section');
    const pagesField = document.getElementById('pages');

    itemSelect.addEventListener('change', async () => {
        const selectedItem = itemSelect.value;
        bindingTypeSection.style.display = selectedItem === 'Books' ? 'block' : 'none';

        const response = await fetch('/get_models', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item: selectedItem })
        });
        const models = await response.json();

        modelSelect.innerHTML = '<option value="">Select Model</option>';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.Model;
            option.textContent = model.Model;
            option.dataset.description = model.Description;
            option.dataset.price = model.Price;
            modelSelect.appendChild(option);
        });
    });

    modelSelect.addEventListener('change', () => {
        const selectedOption = modelSelect.options[modelSelect.selectedIndex];
        descriptionField.value = selectedOption.dataset.description || '';
    });

    calculateButton.addEventListener('click', async () => {
        const selectedItem = itemSelect.value;
        const selectedModel = modelSelect.value;
        const quantity = parseFloat(quantityField.value) || 0;
        const bindingType = document.querySelector('input[name="binding-type"]:checked')?.value;
        const pages = parseInt(pagesField.value, 10) || 0;

        const response = await fetch('/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item: selectedItem, model: selectedModel, quantity, binding_type: bindingType, pages })
        });
        const result = await response.json();

        resultFields.unitPrice.value = result.unit_price || '';
        resultFields.total.value = result.total || '';
        resultFields.vat.value = result.vat || '';
        resultFields.totalWithVat.value = result.total_with_vat || '';
    });
});
document.getElementById("item").addEventListener("change", function () {
    const selectedItem = this.value;
    console.log("Selected item:", selectedItem);  // Debugging
    fetch('/get_models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: selectedItem })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Models received:", data);  // Debugging
        const modelDropdown = document.getElementById("model");
        modelDropdown.innerHTML = "";  // Clear previous options
        data.forEach(model => {
            const option = document.createElement("option");
            option.value = model.Model;
            option.textContent = model.Model;
            modelDropdown.appendChild(option);
        });
        modelDropdown.disabled = false;
    });
});
