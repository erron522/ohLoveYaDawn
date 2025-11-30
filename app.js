document.addEventListener("DOMContentLoaded", function () {
  /* ============================
     DONATION FORM LOGIC (SAFE)
  ============================ */

  const donationForm = document.getElementById("donationForm")

  // Only run donation form code if the form actually exists on this page
  if (donationForm) {
    const amountBtns = document.querySelectorAll(".amount-btn")
    const donationAmountInput = document.getElementById("donationAmount")
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]')
    const creditCardFields = document.getElementById("creditCardFields")
    const cryptoFields = document.getElementById("cryptoFields")
    const copyAddressBtn = document.getElementById("copyAddress")
    const cryptoAddressInput = document.getElementById("cryptoAddress")
    const successModal = document.getElementById("successModal")
    const closeModalBtn = document.querySelector(".close-btn")
    const confirmationAmount = document.getElementById("confirmationAmount")

    // Hide modal on load if it exists
    if (successModal) {
      successModal.classList.add("hidden")
      successModal.style.display = "none"
    }

    // Default amount
    let selectedAmount = 25
    highlightSelectedAmount(selectedAmount)

    // --- Amount buttons ---
    amountBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        selectedAmount = parseInt(this.getAttribute("data-amount"), 10)
        highlightSelectedAmount(selectedAmount)
        if (donationAmountInput) {
          donationAmountInput.value = ""
        }
      })
    })

    // --- Custom amount input ---
    if (donationAmountInput) {
      donationAmountInput.addEventListener("input", function () {
        if (this.value) {
          selectedAmount = parseInt(this.value, 10) || 0
          resetAmountButtonsHighlight()
        } else {
          const activeBtn = document.querySelector(".amount-btn.active")
          if (activeBtn) {
            selectedAmount = parseInt(activeBtn.getAttribute("data-amount"), 10)
          } else {
            selectedAmount = 0
          }
        }
      })
    }

    // --- Payment method change ---
    if (paymentMethodRadios.length > 0) {
      paymentMethodRadios.forEach((radio) => {
        radio.addEventListener("change", updatePaymentFields)
      })
    }

    // --- Copy crypto address ---
    if (copyAddressBtn && cryptoAddressInput) {
      copyAddressBtn.addEventListener("click", function () {
        cryptoAddressInput.select()
        document.execCommand("copy")

        const originalText = this.textContent
        this.textContent = "Copied!"
        this.classList.add("copied")

        setTimeout(() => {
          this.textContent = originalText
          this.classList.remove("copied")
        }, 2000)
      })
    }

    // --- Form submit ---
    donationForm.addEventListener("submit", function (e) {
      e.preventDefault()
      if (!validateForm()) return
      processDonation()
    })

    // --- Close modal buttons ---
    if (closeModalBtn && successModal) {
      closeModalBtn.addEventListener("click", function () {
        successModal.classList.add("hidden")
        successModal.style.display = "none"
      })

      window.addEventListener("click", function (e) {
        if (e.target === successModal) {
          successModal.classList.add("hidden")
          successModal.style.display = "none"
        }
      })
    }

    // ---------- Helpers ----------
    function highlightSelectedAmount(amount) {
      resetAmountButtonsHighlight()
      const btn = document.querySelector(`.amount-btn[data-amount="${amount}"]`)
      if (btn) btn.classList.add("active")
    }

    function resetAmountButtonsHighlight() {
      amountBtns.forEach((btn) => btn.classList.remove("active"))
    }

    function updatePaymentFields() {
      if (!creditCardFields || !cryptoFields) return

      const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked')
      if (!selectedPayment) return

      const value = selectedPayment.value

      creditCardFields.classList.add("hidden")
      cryptoFields.classList.add("hidden")

      if (value === "creditCard") {
        creditCardFields.classList.remove("hidden")
      } else if (value === "crypto") {
        cryptoFields.classList.remove("hidden")
      }
    }

    function validateForm() {
      const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked')

      const existingErrors = document.querySelectorAll(".error-message")
      existingErrors.forEach((error) => error.remove())

      if (!selectedAmount || selectedAmount <= 0) {
        showError("Please enter a valid donation amount")
        return false
      }

      if (!selectedPayment) {
        showError("Please select a payment method")
        return false
      }

      if (selectedPayment.value === "creditCard") {
        const cardNumberEl = document.getElementById("cardNumber")
        const expiryDateEl = document.getElementById("expiryDate")
        const cvvEl = document.getElementById("cvv")

        const cardNumber = cardNumberEl ? cardNumberEl.value : ""
        const expiryDate = expiryDateEl ? expiryDateEl.value : ""
        const cvv = cvvEl ? cvvEl.value : ""

        if (!cardNumber || !expiryDate || !cvv) {
          showError("Please fill in all credit card fields")
          return false
        }

        if (!/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ""))) {
          showError("Please enter a valid card number")
          return false
        }

        if (!/^\d{3,4}$/.test(cvv)) {
          showError("Please enter a valid CVV code")
          return false
        }

        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
          showError("Please enter expiry date in MM/YY format")
          return false
        }
      }

      return true
    }

    function showError(message) {
      const errorDiv = document.createElement("div")
      errorDiv.className = "error-message"
      errorDiv.style.color = "#ef4444"
      errorDiv.style.padding = "0.5rem"
      errorDiv.style.marginBottom = "1rem"
      errorDiv.style.borderRadius = "4px"
      errorDiv.style.fontWeight = "500"
      errorDiv.textContent = message

      donationForm.insertBefore(errorDiv, donationForm.firstChild)

      setTimeout(() => {
        errorDiv.remove()
      }, 3000)
    }

    function processDonation() {
      if (confirmationAmount) {
        confirmationAmount.textContent = `${selectedAmount}`
      }

      if (successModal) {
        successModal.classList.remove("hidden")
        successModal.style.display = "flex"
      }

      donationForm.reset()
      resetAmountButtonsHighlight()
      selectedAmount = 25
      highlightSelectedAmount(25)
      updatePaymentFields()
    }

    // Optional: card formatting
    const cardNumberInput = document.getElementById("cardNumber")
    if (cardNumberInput) {
      cardNumberInput.addEventListener("input", function () {
        let value = this.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
        let formatted = ""
        for (let i = 0; i < value.length; i++) {
          if (i > 0 && i % 4 === 0) formatted += " "
          formatted += value[i]
        }
        this.value = formatted
      })
    }

    const expiryInput = document.getElementById("expiryDate")
    if (expiryInput) {
      expiryInput.addEventListener("input", function () {
        let value = this.value.replace(/\D/g, "")
        if (value.length > 2) {
          this.value = value.substring(0, 2) + "/" + value.substring(2, 4)
        } else {
          this.value = value
        }
      })
    }
  }

  /* ============================
     HAMBURGER MENU (MOBILE NAV)
  ============================ */

  const hamburger = document.getElementById("hamburger")
  const mobileMenu = document.getElementById("mobileMenu")

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      mobileMenu.classList.toggle("active")
    })
  }
})
