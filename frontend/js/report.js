// ==========================================
// Character Counter
// ==========================================
const params = new URLSearchParams(window.location.search);
const from = params.get("from");

const successBackButton = document.getElementById("successBackButton");

if (successBackButton) {
    if (from === "dashboard") {
        successBackButton.href = "dashboard.html";
        successBackButton.textContent = "Back to Dashboard";
    } else {
        successBackButton.href = "index.html";
        successBackButton.textContent = "Back to Home";
    }
}
const description = document.getElementById("description");
const charCount = document.getElementById("charCount");

if (description && charCount) {

    description.addEventListener("input", () => {

        charCount.textContent = description.value.length;

    });

}

// ==========================================
// Browse Files
// ==========================================

const browseBtn = document.getElementById("browseBtn");
const imageInput = document.getElementById("image");

if (browseBtn && imageInput) {

    browseBtn.addEventListener("click", () => {

        imageInput.click();

    });

}

// ==========================================
// Image Preview
// ==========================================

const previewImage = document.getElementById("previewImage");
const previewContainer = document.getElementById("previewContainer");

if (imageInput) {

    imageInput.addEventListener("change", function () {

        if (!this.files.length) return;

        const file = this.files[0];

        previewImage.src = URL.createObjectURL(file);

        previewContainer.style.display = "block";

    });

}

// ==========================================
// Drag & Drop Upload
// ==========================================

const uploadArea = document.getElementById("uploadArea");

if (uploadArea) {

    uploadArea.addEventListener("dragover", function (e) {

        e.preventDefault();

        uploadArea.classList.add("drag-active");

    });

    uploadArea.addEventListener("dragleave", function () {

        uploadArea.classList.remove("drag-active");

    });

    uploadArea.addEventListener("drop", function (e) {

        e.preventDefault();

        uploadArea.classList.remove("drag-active");

        if (!e.dataTransfer.files.length) return;

        imageInput.files = e.dataTransfer.files;

        const file = e.dataTransfer.files[0];

        previewImage.src = URL.createObjectURL(file);

        previewContainer.style.display = "block";

    });

}

// ==========================================
// Detect Location
// ==========================================

const detectBtn = document.getElementById("detectLocation");
const locationStatus = document.getElementById("locationStatus");

if (detectBtn) {

    detectBtn.addEventListener("click", () => {

        if (!navigator.geolocation) {

            locationStatus.textContent = "Geolocation is not supported.";

            return;

        }

        locationStatus.textContent = "Detecting location...";

        navigator.geolocation.getCurrentPosition(

            position => {

                document.getElementById("latitude").value =
                    position.coords.latitude;

                document.getElementById("longitude").value =
                    position.coords.longitude;

                locationStatus.textContent = "Location detected successfully";

            },

            () => {

                locationStatus.textContent = "Unable to detect location";

            }

        );

    });

}

// ==========================================
// Submit Form
// ==========================================

const form = document.getElementById("complaintForm");

const loading = document.getElementById("loadingOverlay");

const successModal = document.getElementById("successModal");

if (form) {

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        loading.style.display = "flex";

        try {

            const formData = new FormData();

            formData.append("title",
                document.getElementById("title").value);

            formData.append("category",
                document.getElementById("category").value);

            formData.append("description",
                description.value);

            formData.append("severity",
                document.querySelector(
                    'input[name="severity"]:checked'
                ).value);

            formData.append("address",
                document.getElementById("address").value);

            formData.append("landmark",
                document.getElementById("landmark").value);

            formData.append("latitude",
                document.getElementById("latitude").value);

            formData.append("longitude",
                document.getElementById("longitude").value);

            formData.append("anonymous",
                document.getElementById("anonymous").checked);

            if (imageInput.files.length) {

                formData.append("image",
                    imageInput.files[0]);

            }

            const response = await fetch("/api/complaints", {

                method: "POST",

                body: formData,

                credentials: "include"

            });

            loading.style.display = "none";

            if (!response.ok) {

                throw new Error();

            }

            successModal.style.display = "flex";

            form.reset();

            charCount.textContent = "0";

            previewContainer.style.display = "none";

            locationStatus.textContent = "Location not detected";

        }

        catch {

            loading.style.display = "none";

            alert("Unable to submit complaint. Please try again.");

        }

    });

}

// ==========================================
// Close Success Modal
// ==========================================

window.addEventListener("click", function (e) {

    if (e.target === successModal) {

        successModal.style.display = "none";

    }

});