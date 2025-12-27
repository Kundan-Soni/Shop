let items = [];
let totalAmount = 0;

let itemImage1Data = null;
let itemImage2Data = null;

/* ---------- ADD ITEM (MANUAL TOTAL) ---------- */
function addItem() {
    const desc = document.getElementById("desc").value;
    const weight = document.getElementById("weight").value;
    const rate = document.getElementById("rate").value;
    const total = Number(document.getElementById("total").value);

    if (!desc || !weight || !rate || total <= 0) {
        alert("Please enter all item details including total");
        return;
    }

    totalAmount += total;

    items.push([
        desc,
        weight,
        rate,
        total.toFixed(2)
    ]);

    document.getElementById("billBody").innerHTML += `
        <tr>
            <td>${desc}</td>
            <td>${weight}</td>
            <td>${rate}</td>
            <td>${total.toFixed(2)}</td>
        </tr>
    `;

    document.getElementById("grandTotal").innerText =
        "Total : ₹" + totalAmount.toFixed(2);

    document.getElementById("desc").value = "";
    document.getElementById("weight").value = "";
    document.getElementById("rate").value = "";
    document.getElementById("total").value = "";
}

/* ---------- IMAGE UPLOAD ---------- */
function loadImage(inputId, assignFn) {
    document.getElementById(inputId).addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => assignFn(reader.result);
        reader.readAsDataURL(file);
    });
}

loadImage("itemImage1", d => itemImage1Data = d);
loadImage("itemImage2", d => itemImage2Data = d);

/* ---------- NUMBER TO WORDS (INDIAN FORMAT) ---------- */
function numberToWords(num) {
    const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
               "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
               "Seventeen","Eighteen","Nineteen"];
    const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

    function convert(n) {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n/10)] + " " + a[n%10];
        if (n < 1000) return a[Math.floor(n/100)] + " Hundred " + convert(n%100);
        if (n < 100000) return convert(Math.floor(n/1000)) + " Thousand " + convert(n%1000);
        if (n < 10000000) return convert(Math.floor(n/100000)) + " Lakh " + convert(n%100000);
        return convert(Math.floor(n/10000000)) + " Crore " + convert(n%10000000);
    }

    return convert(Math.floor(num)).trim() + " Only";
}

/* ---------- GENERATE PDF ---------- */
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

        /* TABLE WITH GRAND TOTAL ROW */
        const tableData = [...items];
        tableData.push(["", "", "Grand Total", totalAmount.toFixed(2)]);

        doc.autoTable({
            startY: 72,
            head: [["Description", "Weight", "Rate", "Total"]],
            body: tableData,
            styles: { halign: "center", fontSize: 9 },
            didParseCell: function (data) {
                if (data.row.index === tableData.length - 1) {
                    data.cell.styles.fontStyle = "bold";
                }
            }
        });

        let currentY = doc.lastAutoTable.finalY + 10;

        /* ITEM PHOTOS */
        if (itemImage1Data || itemImage2Data) {
            doc.setFontSize(10);
            doc.text("Item Photos:", 14, currentY);
            currentY += 5;

            if (itemImage1Data)
                doc.addImage(itemImage1Data, "JPEG", 14, currentY, 80, 60);

            if (itemImage2Data)
                doc.addImage(itemImage2Data, "JPEG", 110, currentY, 80, 60);

            currentY += 65;
        }

        /* TOTAL IN WORDS */
        doc.setFontSize(10);
        doc.text(
            "Total Amount (in words): " + numberToWords(totalAmount),
            14,
            currentY
        );

        /* TERMS */
        currentY += 15;
        doc.setFontSize(9);
        doc.text("Terms & Conditions:", 14, currentY);
        doc.text("Goods once sold will not be taken back.", 14, currentY + 6);
        doc.text("Subject to Glittering City jurisdiction.", 14, currentY + 12);
        doc.text("Thank you for shopping with us!", 14, currentY + 22);
        doc.text("Visit us again.", 14, currentY + 28);

        doc.save("GST_Invoice_Kundan_Jewellers.pdf");
    };
}
