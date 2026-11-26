document.addEventListener("DOMContentLoaded", function () {
    const contactModal = document.getElementById("contactModal");
    const openFormButton = document.getElementById("openFormButton");
    const closeFormButton = document.getElementById("closeFormButton");
    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");
    const submitButton = document.getElementById("submitButton");
    const storageKey = "contactFormDraft";
    // Reemplaza esta URL por el endpoint de tu formulario de Formcarry.
    const formcarryUrl = "https://formcarry.com/s/YOUR-FORM-ID";
    let formWasOpenedFromHistory = false;

    function saveFormValues() {
        const formValues = {
            fullName: contactForm.elements.fullName.value,
            email: contactForm.elements.email.value,
            phone: contactForm.elements.phone.value,
            organization: contactForm.elements.organization.value,
            message: contactForm.elements.message.value,
            consent: contactForm.elements.consent.checked
        };

        localStorage.setItem(storageKey, JSON.stringify(formValues));
    }

    function restoreFormValues() {
        const savedValues = localStorage.getItem(storageKey);

        if (savedValues === null) {
            return;
        }

        const formValues = JSON.parse(savedValues);
        contactForm.elements.fullName.value = formValues.fullName || "";
        contactForm.elements.email.value = formValues.email || "";
        contactForm.elements.phone.value = formValues.phone || "";
        contactForm.elements.organization.value = formValues.organization || "";
        contactForm.elements.message.value = formValues.message || "";
        contactForm.elements.consent.checked = formValues.consent === true;
    }

    function showForm() {
        contactModal.classList.add("is-open");
        contactModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        closeFormButton.focus();
    }

    function hideForm() {
        contactModal.classList.remove("is-open");
        contactModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        openFormButton.focus();
    }

    function openForm() {
        if (!contactModal.classList.contains("is-open")) {
            history.pushState({ contactFormOpen: true }, "", "?contact=open");
            formWasOpenedFromHistory = true;
            showForm();
        }
    }

    function closeForm() {
        if (formWasOpenedFromHistory) {
            history.back();
        } else {
            const cleanUrl = window.location.pathname + window.location.hash;
            history.replaceState({}, "", cleanUrl);
            hideForm();
        }
    }

    restoreFormValues();

    openFormButton.addEventListener("click", openForm);
    closeFormButton.addEventListener("click", closeForm);

    contactModal.addEventListener("click", function (event) {
        if (event.target === contactModal) {
            closeForm();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && contactModal.classList.contains("is-open")) {
            closeForm();
        }
    });

    contactForm.addEventListener("input", saveFormValues);
    contactForm.addEventListener("change", saveFormValues);

    window.addEventListener("popstate", function () {
        const formShouldBeOpen = new URLSearchParams(window.location.search).get("contact") === "open";
        formWasOpenedFromHistory = false;

        if (formShouldBeOpen) {
            showForm();
        } else if (contactModal.classList.contains("is-open")) {
            hideForm();
        }
    });

    if (new URLSearchParams(window.location.search).get("contact") === "open") {
        showForm();
    }

    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (formcarryUrl.includes("YOUR-FORM-ID")) {
            formStatus.textContent = "Add your Formcarry form URL in script.js before sending.";
            formStatus.className = "form-status error";
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        formStatus.textContent = "";
        formStatus.className = "form-status";

        const formValues = {
            fullName: contactForm.elements.fullName.value,
            email: contactForm.elements.email.value,
            phone: contactForm.elements.phone.value,
            organization: contactForm.elements.organization.value,
            message: contactForm.elements.message.value,
            consent: contactForm.elements.consent.checked
        };

        try {
            const response = await fetch(formcarryUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(formValues)
            });

            if (!response.ok) {
                throw new Error("The message could not be sent.");
            }

            formStatus.textContent = "Your message was sent successfully.";
            formStatus.className = "form-status success";
            contactForm.reset();
            localStorage.removeItem(storageKey);
        } catch (error) {
            formStatus.textContent = "There was a problem sending your message. Please try again.";
            formStatus.className = "form-status error";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Send message";
        }
    });
});
