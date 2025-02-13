$(document).ready(function () {
    // Handle item selection
    $('#items').on('change', function () {
        const selectedItem = $(this).val();

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
                $('#models').empty();
                data.forEach(function (model) {
                    $('#models').append(`<option value="${model.Price}" data-description="${model.Description}">${model.Model}</option>`);
                });
                $('#models').change(); // Trigger change event for calculations
            },
            error: function () {
                alert('Error fetching models. Please try again.');
            }
        });
    });

    // Update unit price when models or pages change
    $('#models, #num-pages').on('change input', function () {
        const selectedItem = $('#items').val();
        const pricePerPage = parseFloat($('#models').val()) || 0; // Use the model price as price per page
        const bindingCost = parseFloat($('input[name="binding"]:checked').val()) || 0;
        const numPages = parseInt($('#num-pages').val()) || 0;

        let unitPrice = 0;

        if (selectedItem === 'Books') {
            // Calculation for books: ((number of pages * price per page) + binding cost)
            unitPrice = (numPages * pricePerPage) + bindingCost;
        } else {
            // Default unit price for other items
            unitPrice = pricePerPage;
        }

        $('#unit-price').val(unitPrice.toFixed(2)); // Update unit price field
    });
});