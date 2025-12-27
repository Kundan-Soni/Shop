let items = [];
let totalAmount = 0;

let itemImage1Data = null;
let itemImage2Data = null;

/* -------- ADD ITEM (MANUAL ENTRY) -------- */
function addItem() {
    const desc = document.getElementById("desc").value;
    const weight = document.getElementById("weight").value;
    const rate = document.getElementById("rate").value;
    const making = Number(document.getElementById("making").value);
    const total = Number(document.getElementById("total").value);

    if (!desc || !weight || !rate || isNaN(making) || total <= 0) {
        alert("Please fill all item details");
        return;
    }

    totalAmount += total;

    items.push([
        desc,
        weight,
        rate,
        making.toFixed(2),
        total.toFixed(2)
    ]);

    document.getElementById("billBody").innerHTML += `
        <tr>
            <td>${desc}</td>
            <td>${weight}</td>
            <td>${rate}</td>
            <td>${making.toFixed(2)}</td>
            <td>${total.toFixed(2)}</td>
        </tr>
    `;

    document.getElementById("grandTotal").innerText =
        "Total : ₹" + totalAmount.toFixed(2);

    ["desc", "weight", "rate", "making", "total"].forEach(id => {
        document.getElementById(id).value = "";
    });
}

/* -------- IMAGE UPLOAD -------- */
function loadImage(inputId, callback) {
    document.getElementById(inputId).addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => callback(reader.result);
        reader.readAsDataURL(file);
    });
}

loadImage("itemImage1", d => itemImage1Data = d);
loadImage("itemImage2", d => itemImage2Data = d);

/* -------- GENERATE PDF -------- */
function generatePDF() {
    if (items.length === 0) {
        alert("No items added");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const headerImg = new Image();
    headerImg.src = "header.png";

    headerImg.onload = function () {

        /* HEADER IMAGE */
        doc.addImage(headerImg, "PNG", 5, 5, 200, 40);

        /* CUSTOMER INFO */
        doc.setFontSize(10);
        doc.text("Name :", 14, 55);
        doc.text(document.getElementById("custName").value || "__________", 35, 55);

        doc.text("Add :", 14, 62);
        doc.text(document.getElementById("custAddress").value || "__________", 35, 62);

        doc.text(
            "Date : " + (document.getElementById("billDate").value || ""),
            200,
            55,
            { align: "right" }
        );

        /* TABLE */
        doc.autoTable({
            startY: 72,
            head: [["Description", "Weight", "Rate", "Making", "Total"]],
            body: items,
            styles: { halign: "center", fontSize: 9 }
        });

        let y = doc.lastAutoTable.finalY + 10;

        /* ITEM PHOTOS */
        if (itemImage1Data || itemImage2Data) {
            doc.text("Item Photos:", 14, y);
            y += 5;

            if (itemImage1Data)
                doc.addImage(itemImage1Data, "JPEG", 14, y, 80, 60);

            if (itemImage2Data)
                doc.addImage(itemImage2Data, "JPEG", 110, y, 80, 60);

            y += 65;
        }

        /* GRAND TOTAL */
        doc.text(
            "Total : ₹" + totalAmount.toFixed(2),
            200,
            y,
            { align: "right" }
        );

        /* TERMS */
        y += 15;
        doc.setFontSize(9);
        doc.text("Terms & Conditions:", 14, y);
        doc.text("Goods once sold will not be taken back.", 14, y + 6);
        doc.text("Subject to Glittering City jurisdiction.", 14, y + 12);
        doc.text("Thank you for shopping with us!", 14, y + 22);
        doc.text("Visit us again.", 14, y + 28);

        doc.save("GST_Invoice_Kundan_Jewellers.pdf");
    };
}
