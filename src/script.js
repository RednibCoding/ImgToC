let output = "";

document.getElementById("imageInput").addEventListener("change", handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    displayThumbnail(file);
}

function displayThumbnail(file) {
    const thumbnail = document.getElementById("thumbnail");
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            thumbnail.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        thumbnail.src = "placeholder.png";
    }
}

document.getElementById("convertButton").addEventListener("click", function () {
    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];
    const format = document.getElementById("formatSelect").value;
    if (!file) {
        alert("Please select an image file.");
        return;
    }

    outputTextArea = document.getElementById("cArrayOutput");
    outputTextArea.value = "";
    output = "";

    const spinnerContainer = document.getElementById("spinnerContainer");
    spinnerContainer.style.display = "block";
    const controls = document.getElementById("controls-container");
    controls.style.display = "none";

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;


            output = `static const struct {
    unsigned int width;
    unsigned int height;
    unsigned int bytes_per_pixel; // ${format} format
    unsigned char data[${img.width} * ${img.height} * ${format === "RGB565" ? 2 : format === "RGB565A8" ? 3 : format === "RGB888" ? 3 : 4}];
} image = {
    ${img.width}, ${img.height}, ${format === "RGB565" ? 2 : format === "RGB565A8" ? 3 : format === "RGB888" ? 3 : 4},
    {
`;
            for (let i = 0; i < data.length; i += 4) {
                output += "        ";
                switch (format) {
                    case "RGBA8888":
                        output += `0x${data[i].toString(16).padStart(2, "0")}, `;
                        output += `0x${data[i + 1].toString(16).padStart(2, "0")}, `;
                        output += `0x${data[i + 2].toString(16).padStart(2, "0")}, `;
                        output += `0x${data[i + 3].toString(16).padStart(2, "0")},\n`;
                        break;
                    case "ARGB8888":
                        output += `0x${data[i + 3].toString(16).padStart(2, "0")}, `;
                        output += `0x${data[i].toString(16).padStart(2, "0")}, `;
                        output += `0x${data[i + 1].toString(16).padStart(2, "0")}, `;
                        output += `0x${data[i + 2].toString(16).padStart(2, "0")},\n`;
                        break;
                    case "RGB565A8":
                        let rgb565 = ((data[i] & 0xf8) << 8) | ((data[i + 1] & 0xfc) << 3) | (data[i + 2] >> 3);
                        output += `0x${(rgb565 >> 8).toString(16).padStart(2, "0")}, `;
                        output += `0x${(rgb565 & 0xff).toString(16).padStart(2, "0")}, `;
                        output += `0x${data[i + 3].toString(16).padStart(2, "0")},\n`;
                        break;
                    case "RGB565":
                        let rgb565only = ((data[i] & 0xf8) << 8) | ((data[i + 1] & 0xfc) << 3) | (data[i + 2] >> 3);
                        output += `0x${(rgb565only >> 8).toString(16).padStart(2, "0")}, `;
                        output += `0x${(rgb565only & 0xff).toString(16).padStart(2, "0")},\n`;
                        break;
                    case "RGB888":
                        output += `0x${data[i].toString(16).padStart(2, "0")}, `;
                        output += `0x${data[i + 1].toString(16).padStart(2, "0")}, `;
                        output += `0x${data[i + 2].toString(16).padStart(2, "0")},\n`;
                        break;
                }
            }

            output = output.replace(/,\n$/, "\n");
            output += `    }
};`;

            outputTextArea.value = output.length > 3000000 ? output.substring(0, 3000000) + "...\n" + "... truncated: to much data for textarea!\n" + "use 'Copy to Clipboard'-button to copy the data ..." : output;
            spinnerContainer.style.display = "none";
            controls.style.display = "block";
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

document.getElementById("copyButton").addEventListener("click", function () {
    navigator.clipboard.writeText(output);
    alert("C array copied to clipboard!");
});

document.getElementById("thumbnailContainer").addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add("dragging");
});

document.getElementById("thumbnailContainer").addEventListener("dragleave", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("dragging");
});

document.getElementById("thumbnailContainer").addEventListener("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("dragging");
    const file = e.dataTransfer.files[0];
    if (!file) {
        return;
    }
    document.getElementById("imageInput").files = e.dataTransfer.files;
    displayThumbnail(file);
});

// document.getElementById("cArrayOutput").addEventListener("copy", function (e) {
//     e.preventDefault();
// });
// document.getElementById("cArrayOutput").addEventListener("cut", function (e) {
//     e.preventDefault();
// });
// document.getElementById("cArrayOutput").addEventListener("paste", function (e) {
//     e.preventDefault();
// });