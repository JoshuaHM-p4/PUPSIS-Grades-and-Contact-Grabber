
// Get the button element
const button = document.getElementById("download-btn");

// Add event listener to the button
button.addEventListener('click', () => {

    // Use html2canvas to capture the content of the container
    html2canvas(document.getElementById("info-container")).then(canvas => {
        // Convert the canvas to an image
        const img = canvas.toDataURL("image/png");

        // Create a link element
        const a = document.createElement("a");

        // Set the href attribute to the image
        a.href = img;

        // Set the download attribute to the image name
        a.download = "grades.png";

        // Click the link element
        a.click();


    });
});