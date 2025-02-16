document.addEventListener("DOMContentLoaded", function() {
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const phoneNumberInput = document.getElementById('phone-number');
    const customerNameInput = document.getElementById('customer-name');

    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = now.toTimeString().split(' ')[0].slice(0, 5);

    if (dateInput) dateInput.value = formattedDate;
    if (timeInput) timeInput.value = formattedTime;

    // Ensure phone number field accepts numeric input only and is exactly 10 characters long
    phoneNumberInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
        removeWarning('phone-number-warning');
    });

    // Remove warning when customer name is changed
    customerNameInput.addEventListener('input', function() {
        removeWarning('customer-name-warning');
    });

    // Remove warning when adding an item
    document.getElementById('add-item').addEventListener('click', function() {
        removeWarning('table-warning');
    });
});

function removeWarning(warningId) {
    const warning = document.getElementById(warningId);
    if (warning) {
        warning.remove();
    }
}

document.getElementById('save-quotation').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get the date, time, customer name, and phone number for the file name
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value.replace(':', '');
    let customerName = document.getElementById('customer-name').value.trim();
    let phoneNumber = document.getElementById('phone-number').value.trim();

    let isValid = true;

    // Check if customer name is empty
    if (!customerName) {
        const customerNameField = document.getElementById('customer-name');
        customerNameField.focus();

        // Display warning message
        let warning = document.getElementById('customer-name-warning');
        if (!warning) {
            warning = document.createElement('div');
            warning.id = 'customer-name-warning';
            warning.style.color = 'red';
            warning.textContent = '*this field is required to save the quotation';
            customerNameField.parentNode.appendChild(warning);
        }
        isValid = false;
    } else {
        // Remove warning message if it exists
        removeWarning('customer-name-warning');
    }

    // Check if phone number is empty or not exactly 10 characters
    if (!phoneNumber || phoneNumber.length !== 10) {
        const phoneNumberField = document.getElementById('phone-number');
        phoneNumberField.focus();

        // Display warning message
        let warning = document.getElementById('phone-number-warning');
        if (!warning) {
            warning = document.createElement('div');
            warning.id = 'phone-number-warning';
            warning.style.color = 'red';
            warning.textContent = '*this field must be exactly 10 digits to save the quotation';
            phoneNumberField.parentNode.appendChild(warning);
        }
        isValid = false;
    } else {
        // Remove warning message if it exists
        removeWarning('phone-number-warning');
    }

    // Check if the table has at least one item row
    const tableBody = document.querySelector('#quotation-table tbody');
    if (!tableBody || tableBody.rows.length === 0) {
        const tableWarning = document.getElementById('table-warning');
        if (!tableWarning) {
            const warning = document.createElement('div');
            warning.id = 'table-warning';
            warning.style.color = 'red';
            warning.textContent = '*at least one item is required to save the quotation';
            tableBody.parentNode.appendChild(warning);
        }
        isValid = false;
    } else {
        // Remove warning message if it exists
        removeWarning('table-warning');
    }

    if (!isValid) {
        return;
    }

    // Add content to the PDF
    doc.text("Quotation Summary", 10, 10);
    doc.text(`Customer Name: ${customerName}`, 10, 20);
    doc.text(`Phone Number: ${phoneNumber}`, 10, 30);

    // Add table content using autoTable
    const table = document.getElementById('quotation-table');
    if (table) {
        const rows = [];
        const headers = [];
        table.querySelectorAll('thead th').forEach(th => headers.push(th.innerText));
        table.querySelectorAll('tbody tr').forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach(td => row.push(td.innerText));
            rows.push(row);
        });

        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [255, 0, 0] },
            margin: { top: 20 }
        });
    }

    // Save the PDF with the desired file name
    doc.save(`${date} - ${customerName} - ${time}.pdf`);
});
