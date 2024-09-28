function launchConfetti() {
    var duration = 3 * 1000; // Confetti for 3 seconds
    var end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        zIndex: 10000,
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
  
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }
  
  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show");
  
    // Hide the toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      toast.classList.add("hidden");
    }, 3000);
  }
  
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(
      function () {
        showToast("Address copied to clipboard!");
      },
      function (err) {
        console.error("Could not copy text: ", err);
        showToast("Failed to copy address.");
      }
    );
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("overlay");
    const eligibilityPopup = document.getElementById("eligibilityPopup");
    const openEligibilityFormBtn = document.getElementById(
      "openEligibilityFormBtn"
    );
    const closePopupBtn = document.getElementById("closePopupBtn");
    const checkStatusBtn = document.getElementById("checkStatusBtn");
    const checkEligibilityBtn = document.getElementById("checkEligibilityBtn");
    const addressInput = document.getElementById("address");
    const eligibilityMessage = document.getElementById("eligibilityMessage");
    const statusResult = document.getElementById("statusResult");
    const paymentOptions = document.getElementById("paymentOptions");
    const radioContainer = document.getElementById("radioContainer");
    const submitBtn = document.getElementById("submitBtn");
    const eligibilityForm = document.getElementById("eligibilityForm");
    const recentSearchesList = document.getElementById("recentSearchesList");
    const loader = document.getElementById("loader");
  
    // Fetch and display recent searches
    function fetchRecentSearches() {
      fetch("/recent-searches")
        .then((response) => response.json())
        .then((data) => {
          recentSearchesList.innerHTML = "";
          data.searches.forEach((search) => {
            const li = document.createElement("li");
            li.textContent = search;
            recentSearchesList.appendChild(li);
          });
        })
        .catch((error) => {
          console.error("Error fetching recent searches:", error);
        });
    }
  
    fetchRecentSearches();
  
    // Check status (separate input)
  
    checkStatusBtn.addEventListener("click", () => {
      const statusAddress = document.getElementById("statusAddress").value;
      console.log(statusAddress);
      if (statusAddress.length != 44) {
        alert("Please enter a valid Contract address.");
        return;
      }
  
      // Show loading state
      checkStatusBtn.textContent = "Checking...";
      loader.style.display = "inline-block"; // Show loader
      checkStatusBtn.disabled = true; // Disable the button
  
      // Set a timeout to handle long requests
      const timeoutId = setTimeout(() => {
        if (checkStatusBtn.textContent === "Checking...") {
          checkStatusBtn.textContent = "CHECK DEX Screener PAID";
          loader.style.display = "none"; // Hide loader
          checkStatusBtn.disabled = false; // Re-enable the button
          alert("Request is taking too long. Please try again later.");
        }
      }, 10000); // 10 seconds timeout
  
      // Call the function to check the paid status
      checkPaidStatus(statusAddress).finally(() => {
        clearTimeout(timeoutId); // Clear the timeout if request completes in time
        // Reset button state after fetch completes
        checkStatusBtn.textContent = "CHECK DEX Screener PAID";
        loader.style.display = "none"; // Hide loader
        checkStatusBtn.disabled = false; // Re-enable the button
      });
    });
  
    // Open eligibility check form popup
    openEligibilityFormBtn.addEventListener("click", () => {
      overlay.style.display = "block";
      eligibilityPopup.style.display = "block";
    });
  
    // Close eligibility check form popup
    closePopupBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      eligibilityPopup.style.display = "none";
      // Reset form
      addressInput.disabled = false;
      eligibilityMessage.textContent = "";
      paymentOptions.style.display = "none";
      radioContainer.innerHTML = "";
      submitBtn.style.display = "none";
    });
  
    // Check eligibility
    checkEligibilityBtn.addEventListener("click", () => {
      const address = addressInput.value;
      if (!address) {
        alert("Please enter a contract address to check eligibility.");
        return;
      }
  
      checkPaidStatus(address, true);
    });
  
    function checkPaidStatus(address, checkEligibility = false) {
      const csrftoken = document.querySelector(
        "[name=csrfmiddlewaretoken]"
      ).value;
  
      return fetch("/check-paid-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRFToken": csrftoken,
        },
        body: `address=${encodeURIComponent(address)}`,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Network response was not ok: " + response.statusText
            );
          }
          return response.json();
        })
        .then((data) => {
          console.log("Data received:", data); // Debugging log
  
          if (data.paid) {
            if (checkEligibility) {
              eligibilityMessage.textContent = "You are eligible to proceed.";
              addressInput.disabled = true;
              fetchPricingTiers();
            } else {
              statusResult.textContent = "Address is paid.";
              showPaidOverlay();
            }
  
            // Display token info if available
            if (data.token_info) {
              displayTokenInfo(data.token_info);
            }
          } else {
            if (checkEligibility) {
              eligibilityMessage.textContent = "You are not eligible to proceed.";
            } else {
              statusResult.textContent = "Address is not paid.";
            }
          }
        })
        .catch((error) => {
          console.error("Status check error:", error);
          alert("An error occurred while checking the status. Please try again.");
        });
    }
  
    function displayTokenInfo(tokenInfo) {
      const tokenInfoDiv = document.getElementById("tokenInfo");
      if (tokenInfoDiv) {
        tokenInfoDiv.innerHTML = `
          <h3>Token Information</h3>
          <p>Name: ${tokenInfo.name}</p>
          <p>Symbol: ${tokenInfo.symbol}</p>
          <p>Website: ${
            tokenInfo.website
              ? `<a href="https://${tokenInfo.website}" target="_blank">${tokenInfo.website}</a>`
              : "N/A"
          }</p>
          <p>Telegram: ${
            tokenInfo.telegram
              ? `<a href="https://t.me/${tokenInfo.telegram}" target="_blank">${tokenInfo.telegram}</a>`
              : "N/A"
          }</p>
          <p>Twitter: ${
            tokenInfo.twitter
              ? `<a href="https://twitter.com/${tokenInfo.twitter}" target="_blank">${tokenInfo.twitter}</a>`
              : "N/A"
          }</p>
        `;
      }
    }
  
    function fetchPricingTiers() {
      fetch("/check-pricing-tier")
        .then((response) => response.json())
        .then((data) => {
          if (!radioContainer) {
            console.error("radioContainer element not found");
            return;
          }
  
          radioContainer.innerHTML = "";
  
          if (data.tiers && data.tiers.length > 0) {
            data.tiers.forEach((tier) => {
              const radioButton = `
                      <div>
                          <input type="radio" id="tier${tier.id}" name="pricingTier" value="${tier.id}">
                          <label for="tier${tier.id}">${tier.duration} hour(s) - ${tier.current_price} SOL</label>
                      </div>
                  `;
              radioContainer.innerHTML += radioButton;
            });
  
            paymentOptions.style.display = "block";
            submitBtn.style.display = "block";
          } else {
            radioContainer.innerHTML = "<p>No pricing tiers available.</p>";
          }
        })
        .catch((error) => {
          console.error("Error fetching pricing tiers:", error);
          alert(
            "An error occurred while fetching pricing tiers. Please try again."
          );
        });
    }
  
    // Handle form submission
    eligibilityForm.addEventListener("submit", function (event) {
      event.preventDefault();
  
      const contractAddress = addressInput.value;
      const selectedOption = document.querySelector(
        'input[name="pricingTier"]:checked'
      );
  
      if (!contractAddress || !selectedOption) {
        alert("Please enter a contract address and select a pricing tier.");
        return;
      }
  
      const csrftoken = document.querySelector(
        "[name=csrfmiddlewaretoken]"
      ).value;
  
      fetch("/confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRFToken": csrftoken,
        },
        body: `address=${encodeURIComponent(
          contractAddress
        )}&option=${encodeURIComponent(selectedOption.value)}`,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.text();
        })
        .then((data) => {
          alert("Payment record saved successfully!");
          closePopupBtn.click();
          // Refresh recent searches after successful submission
          fetchRecentSearches();
        })
        .catch((error) => {
          console.error("Submission error:", error);
          alert(
            "An error occurred while processing your request. Please try again."
          );
        });
    });
  });
  function showPaidOverlay() {
    const overlay = document.getElementById("paidOverlay");
  
    // Show the overlay
    overlay.style.display = "block";
  
    // Start confetti immediately
    launchConfetti();
  
    // Hide the overlay after a few seconds
    setTimeout(() => {
      overlay.style.display = "none";
    }, 5000); // Adjust duration as needed
  }
  // Function to toggle dark mode
  function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
  
    // Save the user's preference to localStorage
    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled");
    } else {
      localStorage.setItem("darkMode", "disabled");
    }
  }
  
  // Function to toggle dark mode
  function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
  
    // Save the user's preference to localStorage
    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled");
    } else {
      localStorage.setItem("darkMode", "disabled");
    }
  }
  
  // Function to set the initial state based on user's previous preference
  function setInitialMode() {
    if (localStorage.getItem("darkMode") === "enabled") {
      document.body.classList.add("dark-mode");
    }
  }
  
  // Add event listener to the toggle button
  document.addEventListener("DOMContentLoaded", (event) => {
    const toggleButton = document.getElementById("darkModeToggle");
    if (toggleButton) {
      toggleButton.addEventListener("click", toggleDarkMode);
    }
  
    // Set initial mode
    setInitialMode();
  });
  