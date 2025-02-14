document.addEventListener("DOMContentLoaded", function() {
    let pricePerPage = 0;  // Store price per page for books
    let unitPrice = 0;     // General unit price for all items
    let metrePrice = 0;    // Store price per square meter for banners

    // Handle item selection
    document.getElementById('items').addEventListener('change', function () {
        const selectedItem = this.value;

        // Reset UI

        // Hide elements if they exist
        document.querySelectorAll('#book-options, #banner-options, #num-pages').forEach(el => {
            if (el) el.style.display = 'none';
// Update text content if the element exists
        });

// Update text content if the element exists
        const modelsLabel = document.getElementById('models-label');
        if (modelsLabel) modelsLabel.textContent = 'Model:';

        if (selectedItem === 'Books') {
            if (modelsLabel) modelsLabel.textContent = 'Size:';

            // Show #book-options and #num-pages
            document.querySelectorAll('#book-options, #num-pages').forEach(el => {
                if (el) el.style.display = 'block'; // or 'inline', 'flex', etc., depending on the element's default display
            });
            loadBookPricing(); // Load book-specific pricing options
        } else if (selectedItem === 'Banners') {
// Update text content if element exists
            const modelsLabel = document.getElementById('models-label');
            if (modelsLabel) modelsLabel.textContent = 'Material:';

            // Show banner options if element exists
            const bannerOptions = document.getElementById('banner-options');
            if (bannerOptions) bannerOptions.style.display = 'block'; // or 'flex', 'grid', etc. based on your layout
        }

// Fetch models for the selected item
        fetchModels(selectedItem);
        calculateTotals(); // Ensure totals are recalculated
    });

    // Fetch models based on the selected item
    function fetchModels(selectedItem) {
        fetch('/get_models', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ item: selectedItem }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const modelsDropdown = document.getElementById('models');
            modelsDropdown.innerHTML = ''; // Clear existing options

            if (data.length === 0) {
                modelsDropdown.innerHTML = '<option value="" disabled>No models available</option>';
                modelsDropdown.disabled = true;
                unitPrice = 0; // Reset unit price if no models are available
                document.getElementById('unit-price').value = '';
                calculateTotals();
                return;
            }

            modelsDropdown.disabled = false;
            data.forEach(model => {
                const option = document.createElement('option');
                option.value = model.Price;
                option.setAttribute('data-description', model.Description || 'No description');
                option.textContent = `${model.Model} - ${model.Description || 'No description'}`;
                modelsDropdown.appendChild(option);
            });

            modelsDropdown.selectedIndex = 0;
            modelsDropdown.dispatchEvent(new Event('change')); // Trigger default selection
        })
        .catch(() => {
            alert('Error fetching models. Please try again.');
        });
    }

    // Handle model selection
    document.getElementById('models').addEventListener('change', function () {
        calculateTotals();
    });

    // Load book-specific pricing options
    function loadBookPricing() {
        fetch('/get_book_pricing', {
            method: 'GET',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const bookOptionsContainer = document.getElementById('book-options');
            bookOptionsContainer.innerHTML = ''; // Clear existing content

            // Add Number of Pages input dynamically
            const numPagesHtml = `
                <div>
                    <label for="num-pages">Number of Pages:</label>
                    <input type="number" id="num-pages" min="1" placeholder="Enter number of pages">
                </div>`;
            bookOptionsContainer.insertAdjacentHTML('beforeend', numPagesHtml);

            // Add binding type radio buttons dynamically
            if (data.length > 0) {
                data.forEach(option => {
                    const radioButton = `
                        <div>
                            <input type="radio" id="${option['binding type']}" name="binding-type" value="${option['binding cost']}">
                            <label for="${option['binding type']}">${option['binding type']} (${option['binding cost']}/unit)</label>
                        </div>`;
                    bookOptionsContainer.insertAdjacentHTML('beforeend', radioButton);
                });
            } else {
                bookOptionsContainer.insertAdjacentHTML('beforeend', '<p>No binding options available</p>');
            }
        })
        .catch(() => {
            console.error('Error fetching book pricing data.');
        });
    }

    // Handle changes in binding type, number of pages, and quantity
    document.body.addEventListener('change', event => {
        const selectors = ['input[name="binding-type"]', '#num-pages', '#quantity', '#banner-height', '#banner-width'];
        if (selectors.some(selector => event.target.matches(selector))) {
            calculateTotals();
        }
    });

    // Calculate totals
    function calculateTotals() {
        const selectedModel = document.getElementById('models').selectedOptions[0];
        unitPrice = parseFloat(selectedModel.value) || 0; // Default unit price for non-books
        pricePerPage = unitPrice; // Set pricePerPage for books
        metrePrice = unitPrice; // Set base price for Banner materials
        const quantity = parseInt(document.getElementById('quantity').value) || 0;
        const numPages = parseInt(document.getElementById('num-pages').value) || 0;
        const total_num_of_pages = quantity * numPages;
        const highest_price = pricePerPage;
        const lowest_price = highest_price / 4;
        const price_difference = highest_price - lowest_price;
        const bindingCost = parseFloat(document.querySelector('input[name="binding-type"]:checked')?.value) || 0;
        const bnrH = parseInt(document.getElementById('banner-height').value) || 0;
        const bnrW = parseInt(document.getElementById('banner-width').value) || 0;

        // Calculate unit price dynamically for books
        if (document.getElementById('items').value === 'Books') {
            let discount_factor = (total_num_of_pages - 1000) / (5000 - 1000);
            pricePerPage = Math.max(
                Math.min(highest_price - price_difference * discount_factor, highest_price),
                lowest_price
            );
            unitPrice = (numPages * pricePerPage) + bindingCost;
        }

        // Calculate unit price dynamically for banners
        if (document.getElementById('items').value === 'Banners') {
            unitPrice = ((bnrH * bnrW) / 10000) * metrePrice;
        }

        // Calculate totals
        const total = unitPrice * quantity;
        const vat = total * 0.15;
        const totalWithVat = total + vat;

        // Update UI
        document.getElementById('unit-price').value = unitPrice.toFixed(2);
        document.getElementById('total').value = total.toFixed(2);
        document.getElementById('vat').value = vat.toFixed(2);
        document.getElementById('total-with-vat').value = totalWithVat.toFixed(2);
    }
});

function getColumnIndex(columnName) {
    return [...document.querySelectorAll('#quotation-table thead th')].findIndex(th => th.dataset.column === columnName);
}

function updateTotals() {
    let totalIndex = getColumnIndex("Total");
    let vatIndex = getColumnIndex("VAT");
    let totalWithVatIndex = getColumnIndex("TotalWithVAT");

    let grandTotal = 0;
    let grandVAT = 0;
    let grandTotalWithVAT = 0;

    document.querySelectorAll('#quotation-table tbody tr').forEach(row => {
        let cells = row.querySelectorAll('td');
        let total = parseFloat(cells[totalIndex]?.textContent) || 0;
        let vat = parseFloat(cells[vatIndex]?.textContent) || 0;
        let totalWithVAT = parseFloat(cells[totalWithVatIndex]?.textContent) || 0;

        grandTotal += total;
        grandVAT += vat;
        grandTotalWithVAT += totalWithVAT;
    });

    document.getElementById('grand-total').textContent = grandTotal.toFixed(2);
    document.getElementById('grand-vat').textContent = grandVAT.toFixed(2);
    document.getElementById('grand-total-vat').textContent = grandTotalWithVAT.toFixed(2);
}

// Allow only numeric input in number fields
document.addEventListener('input', event => {
    const target = event.target;

// Check if the input field has an ID of num-pages or quantity
    if (target.id === 'num-pages' || target.id === 'quantity') {
// Remove any non-numeric characters
        target.value = target.value.replace(/\D/g, '');

        // Remove leading zeros (optional)
        target.value = target.value.replace(/^0+/, '') || '1';
    }
});

document.getElementById('add-item').addEventListener('click', function(event) {
    event.preventDefault();

    const requiredFields = [
        { element: document.getElementById('items'), name: 'Item' },
        { element: document.getElementById('models'), name: 'Model' },
        { element: document.getElementById('quantity'), name: 'Quantity' }
    ];

    const missingFields = requiredFields
        .filter(({ element, name }) => !element?.value.trim())
        .map(({ name }) => name);

    if (missingFields.length) {
        alert(`Please fill in: ${missingFields.join(', ')}`);
        return;
    }

    // Get values from fields
    const item = document.getElementById('items')?.value;
    const model = document.getElementById('models')?.value;
    const quantity = document.getElementById('quantity')?.value;
    const unitPrice = document.getElementById('unit-price')?.value;
    const total = document.getElementById('total')?.value;
    const vat = document.getElementById('vat')?.value;
    const totalWithVat = document.getElementById('total-with-vat')?.value;

    // Get row count
    const rowCount = document.querySelectorAll('#quotation-table tbody tr').length + 1;

    // Create new table row
    const newRow = `
        <tr>
            <td>${rowCount}</td>
            <td>${item}</td>
            <td>${model}</td>
            <td>${quantity}</td>
            <td>${unitPrice}</td>
            <td>${total}</td>
            <td>${vat}</td>
            <td>${totalWithVat}</td>
            <td><button class="remove-item">❌</button></td>
        </tr>`;

    // Append to table
    const tbody = document.querySelector('#quotation-table tbody');
    if (tbody) {
        tbody.insertAdjacentHTML('beforeend', newRow);
    }

    updateTotals();

    // Reset form fields
    const itemsSelect = document.getElementById('items');
    const modelsSelect = document.getElementById('models');
    const quantityInput = document.getElementById('quantity');

    if (itemsSelect) itemsSelect.value = '';
    if (modelsSelect) {
        modelsSelect.innerHTML = '<option value="">-- Select a Model --</option>';
        modelsSelect.disabled = true;
    }
    if (quantityInput) quantityInput.value = '1';

    // Clear other fields
    ['num-pages', 'banner-height', 'banner-width', 'unit-price',
     'total', 'vat', 'total-with-vat'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Add remove item handler for new row
    document.querySelector('#quotation-table').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item')) {
            e.target.closest('tr').remove();
            updateTotals();
        }
    });
});

// Remove item from table
document.getElementById('quotation-table').addEventListener('click', event => {
    if (event.target.classList.contains('remove-item')) {
// Remove the closest row
        const row = event.target.closest('tr');
        if (row) row.remove();

// Get the index of the "S/N" column
        const snHeader = Array.from(document.querySelectorAll('#quotation-table thead th')).find(th => th.textContent.includes('S/N'));
        const snIndex = snHeader ? Array.from(snHeader.parentElement.children).indexOf(snHeader) : -1;

// Renumber the serial numbers correctly
        document.querySelectorAll('#quotation-table tbody tr').forEach((row, index) => {
            const snCell = row.querySelector(`td:nth-child(${snIndex + 1})`);
            if (snCell) snCell.textContent = index + 1;
        });

        updateTotals();
    }
});

// Save as PDF (Placeholder)
document.getElementById('save-quotation')?.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default if it's a submit button
    alert("Generate PDF functionality goes here!");
});
