document.addEventListener("DOMContentLoaded", function() {
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');

    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = now.toTimeString().split(' ')[0].slice(0, 5);

    if (dateInput) dateInput.value = formattedDate;
    if (timeInput) timeInput.value = formattedTime;
});

document.getElementById('save-quotation').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get the date, time, and customer name for the file name
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value.replace(':', '');
    let customerName = document.getElementById('customer-name').value.trim();

    if (!customerName) {
        alert('Please enter the customer name.');
        return;
    }

    // Add content to the PDF
    doc.text("Quotation Summary", 10, 10);

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
            startY: 20,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [255, 0, 0] },
            margin: { top: 20 }
        });
    }

    // Save the PDF with the desired file name
    doc.save(`${date} - ${customerName} - ${time}.pdf`);
});
