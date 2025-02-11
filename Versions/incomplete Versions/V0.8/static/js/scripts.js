//$(document).ready(function () {
//    // Populate models based on selected item
//    $('#item-select').on('change', function () {
//        const selectedItem = $(this).val();
//        if (selectedItem) {
//                $.ajax({
//                    type: 'POST',
//                    url: '/get_models',
//                    contentType: 'application/json',
//                    data: JSON.stringify({ item: selectedItem }),
//                    success: function (data) {
//                        if (data.length > 0) {
//                            // Populate the models dropdown
//                            $('#models').empty();
//                            data.forEach(function (model) {
//                                $('#models').append(
//                                    `<option value="${model.Model}">${model.Model} - ${model.Description} - $${model.Price}</option>`
//                                );
//                            });
//                            $('#models').prop('disabled', false); // Enable the dropdown
//                        } else {
//                            console.error('No models found for the selected item.');
//                            alert('No models available for the selected item.');
//                        }
//                    },
//                    error: function () {
//                        console.error('Error fetching models.');
//                        alert('Error fetching models. Please try again.');
//                    },
//                });
//
//            $.ajax({
//                url: '/get_models',
//                type: 'POST',
//                contentType: 'application/json',
//                data: JSON.stringify({ item: selectedItem }),
//                success: function (response) {
//                    const models = response.models;
//                    $('#model-select').empty().append('<option value="">-- Select a Model --</option>');
//                    models.forEach(model => {
//                        $('#model-select').append(`<option value="${model}">${model}</option>`);
//                    });
//                    $('#model-select').prop('disabled', false);
//
//                    if (selectedItem === 'Book') {
//                        $('#model-label').text('Size:');
//                        $('#book-fields').show();
//                    } else {
//                        $('#model-label').text('Select Model:');
//                        $('#book-fields').hide();
//                    }
//
//                    $('#extra-fields').show();
//                },
//                error: function () {
//                    alert('Error fetching models. Please try again.');
//                }
//            });
//        } else {
//            $('#model-select').empty().append('<option value="">-- Select a Model --</option>').prop('disabled', true);
//            $('#extra-fields').hide();
//            $('#book-fields').hide();
//        }
//    });
//
//    // Calculate price on button click
//    $('#calculate-btn').on('click', function () {
//        const item = $('#item-select').val();
//        const model = $('#model-select').val();
//        const quantity = parseFloat($('#quantity').val()) || 0;
//        const numPages = parseFloat($('#num-pages').val()) || 0;
//        const bindingType = $('input[name="binding"]:checked').val() || '';
//
//        if (!item || !model) {
//            alert('Please select an item and a model.');
//            return;
//        }
//
//        $.ajax({
//            url: '/calculate',
//            type: 'POST',
//            contentType: 'application/json',
//            data: JSON.stringify({
//                item: item,
//                model: model,
//                quantity: quantity,
//                num_pages: numPages,
//                binding_type: bindingType
//            }),
//            success: function (response) {
//                $('#unit-price').text(response.unit_price.toFixed(2));
//                $('#total-price').text(response.total_price.toFixed(2));
//                $('#vat').text(response.vat.toFixed(2));
//                $('#total-with-vat').text(response.total_with_vat.toFixed(2));
//                $('#result-fields').show();
//            },
//            error: function () {
//                alert('Error calculating price. Please try again.');
//            }
//        });
//    });
//});
$(document).ready(function () {
    // When an item is selected, fetch models
    $('#items').on('change', function () {
        const selectedItem = $(this).val();
        if (!selectedItem) return; // No item selected, exit early
        if (selectedItem) {
            // Make an AJAX request to fetch models for the selected item
            $.ajax({
                type: 'POST',
                url: '/get_models',
                contentType: 'application/json',
                data: JSON.stringify({ item: selectedItem }),
                success: function (data) {
                    console.log('Models data received:', data); // Log the received data
                    if (data.length > 0) {
                        // Populate the models dropdown
                        $('#models').empty();
//                        data.forEach(function (model) {
//                            $('#models').append(
//                                `<option value="${model.Model}">${model.Model} - ${model.Description} - $${model.Price}</option>`
//                            );
//                        });
                        data.forEach(function (model) {
                            $('#models').append(
                                `<option value="${model.Model}" data-price="${model.Price}">
                                  ${model.Model} - ${model.Description || 'No description available'}
                                </option>`
                            );
                        });

                        $('#models').prop('disabled', false); // Enable the dropdown
                    } else {
                        console.error('No models found for the selected item.');
                        alert('No models available for the selected item.');
                    }
                },
                error: function () {
                    console.error('Error fetching models.');
                    alert('Error fetching models. Please try again.');
                },
            });
        } else {
            // Clear and disable the models dropdown if no item is selected
            $('#models').empty().prop('disabled', true);
        }
    });

    $('#models').on('change', function () {
        const selectedModel = $(this).find(':selected');
        const unitPrice = parseFloat(selectedModel.data('price')) || 0; // Fetch the price from the dropdown option

        console.log('Selected model price:', unitPrice);

        $('#unit-price').val(unitPrice.toFixed(2)); // Set the unit price
        calculateTotals(); // Update totals when a model is selected
    });

    $('#quantity').on('input', function () {
        calculateTotals(); // Update totals when the quantity changes
    });

    function calculateTotals() {
        const unitPrice = parseFloat($('#unit-price').val()) || 0;
        const quantity = parseInt($('#quantity').val(), 10) || 1;

        const total = unitPrice * quantity;
        const vat = total * 0.15;
        const totalWithVat = total + vat;

        // Update the corresponding fields
        $('#total').val(total.toFixed(2));
        $('#vat').val(vat.toFixed(2));
        $('#total-with-vat').val(totalWithVat.toFixed(2));
    }

});
