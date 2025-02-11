function updateFields() {
    const selectedItem = document.getElementById("item").value;
    const additionalFields = document.getElementById("additional-fields");
    const bindingContainer = document.getElementById("binding-container");
    const pagesContainer = document.getElementById("pages-container");
    const sizeLabel = document.getElementById("size-label");

    if (selectedItem === "Book") {
        additionalFields.style.display = "block";
        bindingContainer.style.display = "block";
        pagesContainer.style.display = "block";
        sizeLabel.innerText = "Size:";
    } else {
        additionalFields.style.display = "none";
        bindingContainer.style.display = "none";
        pagesContainer.style.display = "none";
        sizeLabel.innerText = "Select Model:";
    }
}

function calculateBookPrice() {
    const size = document.getElementById("size").value;
    const pages = parseInt(document.getElementById("pages").value, 10);
    const bindingType = document.querySelector('input[name="binding"]:checked')?.value;

    if (!size || !bindingType || !pages) {
        alert("Please fill out all fields!");
        return;
    }

    fetch("/calculate_book_price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            size: size,
            pages: pages,
            bindingType: bindingType,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert(`The price is: ${data.price}`);
            } else {
                alert("Error calculating price.");
            }
        });
}