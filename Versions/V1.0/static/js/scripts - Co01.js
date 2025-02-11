$(document).ready(function () {
    // Handle item selection
    $('#items').on('change', function () {
        const selectedItem = $(this).val();
        console.log('Selected Item:', selectedItem); // Debugging log

        // Show/Hide book options and adjust labels
        if (selectedItem === 'Books') {
            $('#models-label').text('Size:');
            $('#book-options').show(); // Show book-specific fields
            console.log('#book-options is shown');
            console.log('Book options visible:', $('#book-options').is(':visible')); // Debug line
            console.log('Number of Pages field visible:', $('#num-pages').is(':visible')); // Debug line
//            $('#num-pages').show();   // Ensure the number of pages field is visible
            loadBookPricing(); // Load book-specific options
        } else {
            $('#book-options').empty(); // Clear any previous dynamic content in the #book-options div
            $('#models-label').text('Model:');
            $('#book-options').hide();
            console.log('#book-options is hidden');
            $('input[name="binding-type"]').prop('checked', false); // Clear binding options
        }

        // Fetch and update models for the selected item
        fetchModels(selectedItem);
    });

    // Fetch models based on selected item
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

    // Handle model selection and update unit price
    $('#models').on('change', function () {
        const selectedModel = $(this).find(':selected');
        const unitPrice = parseFloat(selectedModel.val()) || 0; // Price from the models dropdown
        $('#unit-price').val(unitPrice.toFixed(2));
        calculateTotals();
    });

    // Load book-specific pricing options
//    function loadBookPricing() {
//        $.ajax({
//            url: '/get_book_pricing',
//            type: 'GET',
//            success: function (data) {
//                const bookOptionsContainer = $('#book-options');
//                bookOptionsContainer.empty();
//
//                if (data.length > 0) {
//                    data.forEach(option => {
//                        const radioButton = `
//                            <div>
//                                <input type="radio" id="${option['binding type']}" name="binding-type" value="${option['binding cost']}">
//                                <label for="${option['binding type']}">${option['binding type']} (${option['binding cost']}/unit)</label>
//                            </div>
//                        `;
//                        bookOptionsContainer.append(radioButton);
//                    });
//                } else {
//                    bookOptionsContainer.append('<p>No binding options available</p>');
//                }
//            },
//            error: function () {
//                console.error('Error fetching book pricing data.');
//            }
//        });
//    }

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
                        </div>`;
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
    // Handle changes in binding type and other inputs
    $('body').on('change', 'input[name="binding-type"], #num-pages, #quantity', function () {
        calculateTotals();
    });

    // Calculate totals based on inputs
//    function calculateTotals() {
//        const unitPrice = parseFloat($('#unit-price').val()) || 0;
//        const quantity = parseInt($('#quantity').val()) || 0;
//
//        let total = unitPrice * quantity;
//        const vat = total * 0.15;
//        let totalWithVat = total + vat;
//
//        // Additional calculation for books
//        const selectedItem = $('#items').val();
//        if (selectedItem === 'Books') {
//            const numPages = parseInt($('#num-pages').val()) || 0;
//            const pricePerPage = unitPrice; // Unit price from the models dropdown is price per page
//            const bindingCost = parseFloat($('input[name="binding-type"]:checked').val()) || 0;
//
//            total = (numPages * pricePerPage) + bindingCost;
//            totalWithVat = total * quantity + (total * 0.15);
//        }
//
//        // Update totals in the UI
//        $('#total').val(total.toFixed(2));
//        $('#vat').val(vat.toFixed(2));
//        $('#total-with-vat').val(totalWithVat.toFixed(2));
//    }
    function calculateTotals() {
    let unitPrice = parseFloat($('#unit-price').val()) || 0; // Unit price from dropdown
    const quantity = parseInt($('#quantity').val()) || 0;

    let total = unitPrice * quantity; // Default total for non-books
    let vat = total * 0.15;
    let totalWithVat = total + vat;

    const selectedItem = $('#items').val();
    if (selectedItem === 'Books') {
        const numPages = parseInt($('#num-pages').val()) || 0;
        const pricePerPage = unitPrice; // Unit price dropdown is price per page
        const bindingCost = parseFloat($('input[name="binding-type"]:checked').val()) || 0;

        // Recalculate totals for books
        total = (numPages * pricePerPage) + bindingCost;
        totalWithVat = (total * quantity) + (total * quantity * 0.15);

        // Update the unit price to reflect the price per book (including binding)
        unitPrice = total / quantity || 0;
        $('#unit-price').val(unitPrice.toFixed(2)); // Update the UI
    }

    // Update totals in the UI
    $('#total').val(total.toFixed(2)); // Without VAT
    $('#vat').val((total * 0.15).toFixed(2)); // VAT amount
    $('#total-with-vat').val(totalWithVat.toFixed(2)); // Total with VAT
}
});