$(document).ready(function () {
    let pricePerPage = 0; // Store price per page for books
    let unitPrice = 0;    // General unit price for all items
    let metrePrice = 0;    // Store price per page for banners

    // Handle item selection
    $('#items').on('change', function () {
        const selectedItem = $(this).val();
        console.log('Selected Item:', selectedItem); // Debugging log

        if (selectedItem === 'Books') {
            $('#models-label').text('Size:');
            $('#book-options').show(); // Show book-specific fields
            $('#num-pages').show();    // Ensure the number of pages field is visible
            loadBookPricing();         // Load book-specific options
        } else {
            $('#models-label').text('Model:');
            $('#book-options').hide(); // Hide book-specific options
            $('#num-pages').hide();    // Hide number of pages field
            pricePerPage = 0;          // Reset pricePerPage for non-book items
        }
        if (selectedItem === 'Banners') {
            $('#models-label').text('Material:');
            $('#banner-options').show(); // Show book-specific fields
            loadBookPricing();         // Load book-specific options
        } else {
            $('#models-label').text('Model:');
            $('#banner-options').hide(); // Hide book-specific options
        }

        // Fetch models for the selected item
        fetchModels(selectedItem);
        calculateTotals(); // Ensure totals are recalculated when switching items
    });

    // Fetch models based on the selected item
    function fetchModels(selectedItem) {
        $.ajax({
            url: '/get_models',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ item: selectedItem }),
            success: function (data) {
                const modelsDropdown = $('#models');
                modelsDropdown.empty();

                if (data.length === 0) {
                    modelsDropdown.append('<option value="" disabled>No models available</option>');
                    modelsDropdown.prop('disabled', true);
                    unitPrice = 0; // Reset unit price if no models are available
                    $('#unit-price').val('');
                    calculateTotals();
                    return;
                }

                modelsDropdown.prop('disabled', false);
                data.forEach(function (model) {
                    modelsDropdown.append(
                        `<option value="${model.Price}" data-description="${model.Description || 'No description'}">
                            ${model.Model} - ${model.Description || 'No description'}
                        </option>`
                    );
                });
                modelsDropdown.prop('selectedIndex', 0).trigger('change'); // Trigger default selection
            },
            error: function () {
                alert('Error fetching models. Please try again.');
            }
        });
    }

    // Handle model selection
    $('#models').on('change', function () {
        const selectedModel = $(this).find(':selected');
        pricePerPage = parseFloat(selectedModel.val()) || 0; // Set pricePerPage for books
        unitPrice = pricePerPage;                            // Default unit price for non-books
        metrePrice = pricePerPage;                           // Set base price for Banner materials
        $('#unit-price').val(unitPrice.toFixed(2));          // Update the unit price field
        calculateTotals();
    });

    // Load book-specific pricing options
    function loadBookPricing() {
        $.ajax({
            url: '/get_book_pricing',
            type: 'GET',
            success: function (data) {
                const bookOptionsContainer = $('#book-options');
                bookOptionsContainer.empty();

                // Add Number of Pages input dynamically
                const numPagesHtml = `
                    <div>
                        <label for="num-pages">Number of Pages:</label>
                        <input type="number" id="num-pages" min="1" placeholder="Enter number of pages">
                    </div>`;
                bookOptionsContainer.append(numPagesHtml);

                // Add binding type radio buttons dynamically
                if (data.length > 0) {
                    data.forEach(option => {
                        const radioButton = `
                            <div>
                                <input type="radio" id="${option['binding type']}" name="binding-type" value="${option['binding cost']}">
                                <label for="${option['binding type']}">${option['binding type']} (${option['binding cost']}/unit)</label>
                            </div>
                        `;
                        bookOptionsContainer.append(radioButton);
                    });
                } else {
                    bookOptionsContainer.append('<p>No binding options available</p>');
                }
            },
            error: function () {
                console.error('Error fetching book pricing data.');
            }
        });
    }

    // Handle changes in binding type, number of pages, and quantity
    $('body').on('change', 'input[name="binding-type"], #num-pages, #quantity, #banner-height, #banner-width', function () {
        calculateTotals();
    });

    // Calculate totals
    function calculateTotals() {
        const quantity = parseInt($('#quantity').val()) || 0;
        const numPages = parseInt($('#num-pages').val()) || 0;
        const bindingCost = parseFloat($('input[name="binding-type"]:checked').val()) || 0;
        const bnrH = parseInt($('#banner-height').val()) || 0;
        const bnrW = parseInt($('#banner-width').val()) || 0;

        // Calculate unit price dynamically for books
        if ($('#items').val() === 'Books') {
            unitPrice = (numPages * pricePerPage) + bindingCost;
        }

        // Calculate unit price dynamically for banners
        if ($('#items').val() === 'Banners') {
            unitPrice = ((bnrH * bnrW)/10000) * metrePrice;
        }

        // Calculate totals
        const total = unitPrice * quantity;
        const vat = total * 0.15;
        const totalWithVat = total + vat;

        // Update UI
        $('#unit-price').val(unitPrice.toFixed(2));
        $('#total').val(total.toFixed(2));
        $('#vat').val(vat.toFixed(2));
        $('#total-with-vat').val(totalWithVat.toFixed(2));
    }
});
// Allow only numeric input in number fields
document.addEventListener('input', function (event) {
    const target = event.target;

    // Check if the input field has an ID of num-pages or quantity
    if (target.id === 'num-pages' || target.id === 'quantity') {
        // Remove any non-numeric characters
        target.value = target.value.replace(/[^0-9]/g, '');
    }
});
