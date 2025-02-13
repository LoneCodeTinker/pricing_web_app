$(document).ready(function () {

    // Fetch and update Models dropdown when Item dropdown changes
    $('#items').on('change', function () {
        const selectedItem = $(this).val();
        if (!selectedItem) return; // No item selected, exit early

        // Change Models label to Size for Books
        if (selectedItem === 'Books') {
            $('#models-label').text('Size:');
            $('#book-options').show(); // Show the number of pages field
        } else {
            $('#models-label').text('Model:');
            $('#book-options').hide();
            $('#num-pages').val(''); // Clear the number of pages field
        }

        // Fetch models for the selected item
        $.ajax({
            url: '/get_models',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ item: selectedItem }),
            success: function (data) {
                const modelsDropdown = $('#models');
                modelsDropdown.empty(); // Clear previous options

                if (data.length === 0) {
                    // No models available
                    modelsDropdown.append('<option value="" disabled>No models available</option>');
                    modelsDropdown.prop('disabled', true); // Disable dropdown
                    $('#unit-price').val(''); // Clear unit price field
                    calculateTotals(); // Clear other calculations
                    return;
                }

                // Populate the Models dropdown
                modelsDropdown.prop('disabled', false); // Enable dropdown
                data.forEach(function (model) {
                    modelsDropdown.append(
                        `<option value="${model.Model}" data-price="${model.Price}">
                          ${model.Model} - ${model.Description || 'No description available'}
                        </option>`
                    );
                });

                // Select the first model and trigger change
                modelsDropdown.prop('selectedIndex', 0).trigger('change');
            },
            error: function () {
                alert('Error fetching models. Please try again.');
            },
        });
    });

    // Update calculations when the Model dropdown changes
    $('#models').on('change', function () {
        const selectedModel = $(this).find(':selected'); // Get selected option
        const unitPrice = parseFloat(selectedModel.data('price')) || 0; // Fetch price

        $('#unit-price').val(unitPrice.toFixed(2)); // Set unit price
        calculateTotals(); // Update totals
    });

    // Calculate totals based on unit price and quantity
    function calculateTotals() {
        const unitPrice = parseFloat($('#unit-price').val()) || 0;
        const quantity = parseInt($('#quantity').val()) || 0;

        const total = unitPrice * quantity;
        const vat = total * 0.15;
        const totalWithVat = total + vat;

        $('#total').val(total.toFixed(2));
        $('#vat').val(vat.toFixed(2));
        $('#total-with-vat').val(totalWithVat.toFixed(2));
    }

    // Trigger calculations when Quantity changes
    $('#quantity').on('input', function () {
        calculateTotals();
    });


    // When the Item dropdown changes
    $('#items').on('change', function () {
        const selectedItem = $(this).val();
        if (!selectedItem) return; // No item selected, exit early

        // Fetch models for the selected item
        $.ajax({
            url: '/get_models',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ item: selectedItem }),
            success: function (data) {
                // Clear and repopulate the Models dropdown
                const modelsDropdown = $('#models');
                modelsDropdown.empty();

                if (data.length === 0) {
                    modelsDropdown.append('<option value="" disabled>No models available</option>');
                    $('#unit-price').val(''); // Clear the unit price field
                    calculateTotals(); // Clear other calculations
                    return;
                }

                // Populate the Models dropdown
                data.forEach(function (model) {
                    modelsDropdown.append(
                        `<option value="${model.Model}" data-price="${model.Price}">
                          ${model.Model} - ${model.Description || 'No description available'}
                        </option>`
                    );
                });

                // Automatically select the first model and trigger calculations
                modelsDropdown.prop('selectedIndex', 0).trigger('change');
            },
            error: function () {
                alert('Error fetching models. Please try again.');
            },
        });
    });

    // When the Model dropdown changes
    $('#models').on('change', function () {
        const selectedModel = $(this).find(':selected'); // Get the selected option
        const unitPrice = parseFloat(selectedModel.data('price')) || 0; // Fetch data-price

        $('#unit-price').val(unitPrice.toFixed(2)); // Set the unit price
        calculateTotals(); // Update totals
    });

    // Update totals based on other inputs (like quantity)
    function calculateTotals() {
        const unitPrice = parseFloat($('#unit-price').val()) || 0;
        const quantity = parseInt($('#quantity').val()) || 0;

        const total = unitPrice * quantity;
        const vat = total * 0.15;
        const totalWithVat = total + vat;

        $('#total').val(total.toFixed(2));
        $('#vat').val(vat.toFixed(2));
        $('#total-with-vat').val(totalWithVat.toFixed(2));
    }

    // Fetch and generate book pricing radio buttons
    function loadBookPricing() {
        $.ajax({
            url: '/get_book_pricing',
            method: 'GET',
            success: function (data) {
                console.log('Book pricing data received:', data);
                const bookOptionsContainer = $('#book-options');
                bookOptionsContainer.empty(); // Clear existing options
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
                }
            },
            error: function () {
                console.error('Error fetching book pricing data.');
            }
        });
    }

    // Toggle book options on item selection
    $('#items').on('change', function () {
        const selectedItem = $(this).val();
        if (selectedItem === 'Books') {
            $('#book-options').show(); // Show book radio buttons
            loadBookPricing(); // Load options dynamically
        } else {
            $('#book-options').hide(); // Hide book radio buttons
            $('input[name="binding-type"]').prop('checked', false); // Uncheck all radios
        }
        calculateTotals(); // Recalculate totals
    });

    // Update calculations when binding type or quantity changes
    $('body').on('change', 'input[name="binding-type"], #quantity', function () {
        calculateTotals(); // Trigger recalculation
    });

    // Enhanced Calculation Logic
    function calculateTotals() {
        let unitPrice = parseFloat($('#unit-price').val()) || 0; // Default price
        const quantity = parseInt($('#quantity').val()) || 0;

        const selectedItem = $('#items').val();
        if (selectedItem === 'Books') {
            const selectedBinding = $('input[name="binding-type"]:checked').val(); // Get selected binding value
            unitPrice = parseFloat(selectedBinding) || 0; // Use binding cost for Books
        }

        const total = unitPrice * quantity;
        const vat = total * 0.15;
        const totalWithVat = total + vat;

        // Update calculation fields
        $('#total').val(total.toFixed(2));
        $('#vat').val(vat.toFixed(2));
        $('#total-with-vat').val(totalWithVat.toFixed(2));
    }

});
