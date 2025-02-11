$(document).ready(function () {
    let pricePerPage = 0;  // Store price per page for books
    let unitPrice = 0;     // General unit price for all items
    let metrePrice = 0;    // Store price per square meter for banners

    // Handle item selection
    $('#items').on('change', function () {
        const selectedItem = $(this).val();
        console.log('Selected Item:', selectedItem); // Debugging log

        // Reset UI
        $('#models-label').text('Model:');
        $('#book-options, #banner-options, #num-pages').hide();

        if (selectedItem === 'Books') {
            $('#models-label').text('Size:');
            $('#book-options, #num-pages').show();
            loadBookPricing(); // Load book-specific pricing options
        } else if (selectedItem === 'Banners') {
            $('#models-label').text('Material:');
            $('#banner-options').show();
        }

        // Fetch models for the selected item
        fetchModels(selectedItem);
        calculateTotals(); // Ensure totals are recalculated
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

    // Handle changes in binding type, number of pages, and quantity
    $('body').on('change', 'input[name="binding-type"], #num-pages, #quantity, #banner-height, #banner-width', function () {
        calculateTotals();
    });

    // Calculate totals
    function calculateTotals() {
        const selectedModel = $('#models').find(':selected');
        unitPrice = parseFloat(selectedModel.val()) || 0; // Default unit price for non-books
        pricePerPage = unitPrice; // Set pricePerPage for books
        metrePrice = unitPrice; // Set base price for Banner materials
        const quantity = parseInt($('#quantity').val()) || 0;
        const numPages = parseInt($('#num-pages').val()) || 0;
        const total_num_of_pages = quantity * numPages;
        const highest_price = pricePerPage;
        const lowest_price = highest_price / 4;
        const price_difference = highest_price - lowest_price;
        const bindingCost = parseFloat($('input[name="binding-type"]:checked').val()) || 0;
        const bnrH = parseInt($('#banner-height').val()) || 0;
        const bnrW = parseInt($('#banner-width').val()) || 0;

        // Calculate unit price dynamically for books
        if ($('#items').val() === 'Books') {
//            if (total_num_of_pages > 1000 && total_num_of_pages < 5000) {
//                let discount_factor = (total_num_of_pages - 1000) / (5000 - 1000);
//                pricePerPage = highest_price - (price_difference * discount_factor);
//            } else if (total_num_of_pages >= 5000) {
//                pricePerPage = lowest_price;
//            }
            let discount_factor = (total_num_of_pages - 1000) / (5000 - 1000);
            pricePerPage = Math.max(Math.min(highest_price - price_difference * discount_factor, highest_price), lowest_price);
//            pricePerPage = Math.max(Math.min(highest_price - (highest_price - lowest_price) * (total_num_of_pages - 1000) / (5000 - 1000), highest_price), lowest_price);
            unitPrice = (numPages * pricePerPage) + bindingCost;
        }

        // Calculate unit price dynamically for banners
        if ($('#items').val() === 'Banners') {
            unitPrice = ((bnrH * bnrW) / 10000) * metrePrice;
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

    $("#add-item").click(function () {
//        const item = $("#items").val();
//        const model = $("#models").val();
//        const quantity = parseInt($("#quantity").val()) || 0;
//        const unitPrice = parseFloat($("#unit-price").val()) || 0;
//        const total = parseFloat($("#total").val()) || 0;
//        const vat = parseFloat($("#vat").val()) || 0;
//        const totalWithVat = parseFloat($("#total-with-vat").val()) || 0;
//
//        if (!item || !model || quantity <= 0) {
//            alert("Please fill all required fields.");
//            return;
//        }
//
//        // Append to the table
//        $("#quotation-table tbody").append(`
//            <tr>
//                <td>${item}</td>
//                <td>${model}</td>
//                <td>${quantity}</td>
//                <td>${unitPrice.toFixed(2)}</td>
//                <td>${total.toFixed(2)}</td>
//                <td>${vat.toFixed(2)}</td>
//                <td>${totalWithVat.toFixed(2)}</td>
//                <td><button class="remove-item">Remove</button></td>
//            </tr>
//        `);
//
//        // Reset fields for next input
//        $("#items").val("");
//        $("#models").html('<option value="">-- Select a Model --</option>').prop("disabled", true);
//        $("#quantity").val(1);
//        $("#unit-price, #total, #vat, #total-with-vat").val("");
//
//        // Remove Item from Table
//        $(".remove-item").click(function () {
//            $(this).closest("tr").remove();

    const itemType = $('#items').val();
    const model = $('#models').val();
    const quantity = parseInt($('#quantity').val()) || 0;
    const unitPrice = parseFloat($('#unit-price').val()) || 0;
    const total = parseFloat($('#total').val()) || 0;
    const vat = parseFloat($('#vat').val()) || 0;
    const totalWithVat = parseFloat($('#total-with-vat').val()) || 0;

    if (!itemType || !model || quantity <= 0 || unitPrice <= 0) {
        alert("Please fill all required fields.");
        return;
    }

    // Add item to the table
    const newRow = `
        <tr>
            <td>${itemType}</td>
            <td>${model}</td>
            <td>${quantity}</td>
            <td>${unitPrice.toFixed(2)}</td>
            <td>${total.toFixed(2)}</td>
            <td>${vat.toFixed(2)}</td>
            <td>${totalWithVat.toFixed(2)}</td>
            <td><button class="remove-item">❌</button></td>
        </tr>
    `;

    $('#quotation-table tbody').append(newRow);

    // Clear input fields after adding the item
    $('#quantity').val(1);
    $('#unit-price, #total, #vat, #total-with-vat').val('');
    });


    // Remove item from the table
    $(document).on('click', '.remove-item', function () {
    $(this).closest('tr').remove();

    // Save as PDF (Placeholder)
    $("#save-quotation").click(function () {
        alert("Generate PDF functionality goes here!");
    });
});