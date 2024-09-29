// Confetti function
// Generate OG Image HTML
function generateOGImageHTML(tokenInfo) {
  return `
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 1200px;
          height: 630px;
          display: flex;
          flex-direction: column;
          font-family: Arial, sans-serif;
          background-color: #1a1a1a;
          color: white;
        }
        /* Add more styles here */
      </style>
    </head>
    <body>
      <div id="popupHeader">
        <div id="popupTitle">Dexsocial</div>
        <div id="socialIcons">
          <img src="https://example.com/logo2.png" alt="Logo" class="X">
          <img src="https://example.com/telegram-icon.png" alt="Telegram">
        </div>
      </div>
      <div id="mainContent">
        <div class="one logo-container">
          <img src="${
            tokenInfo.image_url ||
            "https://ipfs.io/ipfs/QmdNyJh4k3pBiwT4WLZsxrFcjhdH9PTVFskxNRTLPGNYUL"
          }" alt="${tokenInfo.name || "Token"} Logo" class="token-logo-popup">
          <span class="paid-overlay">PAID!</span>
        </div>
        <div class="two">
          <h1>${tokenInfo.name || "Token Name"}</h1>
          <h2>$${tokenInfo.symbol || "Symbol"}</h2>
          <p><strong>CA:</strong> ${tokenInfo.address || "CA"}</p>
          <p>Dexscreener Token Enhancement</p>
          <p>Paid for Symbol on Chain</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generate OG image
function generateOrRetrieveOGImage(tokenInfo) {
  const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value;
  return fetch("/get-or-generate-og-image/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify({ tokenInfo: tokenInfo }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.image_url) {
        updateOGMetaTags(data.image_url, tokenInfo);
      }
      return data.image_url;
    })
    .catch((error) => {
      console.error("Error getting or generating OG image:", error);
    });
}

// Update OG meta tags
function updateOGMetaTags(imageUrl, tokenInfo) {
  const metaTags = {
    "og:image": imageUrl,
    "og:title": `${tokenInfo.name} ($${tokenInfo.symbol}) - Dexsocial`,
    "og:description": `Check out ${tokenInfo.name} on Dexsocial! Contract Address: ${tokenInfo.address}`,
    "og:url": `https://checkdex.xyz/${tokenInfo.address}`,
    "twitter:card": "summary_large_image",
    "twitter:image": imageUrl,
    "twitter:title": `${tokenInfo.name} ($${tokenInfo.symbol}) - Dexsocial`,
    "twitter:description": `Check out ${tokenInfo.name} on Dexsocial! Contract Address: ${tokenInfo.address}`,
  };

  for (const [property, content] of Object.entries(metaTags)) {
    let metaTag =
      document.querySelector(`meta[property="${property}"]`) ||
      document.querySelector(`meta[name="${property}"]`);

    if (metaTag) {
      metaTag.setAttribute("content", content);
    } else {
      metaTag = document.createElement("meta");
      metaTag.setAttribute(
        property.startsWith("og:") ? "property" : "name",
        property
      );
      metaTag.setAttribute("content", content);
      document.head.appendChild(metaTag);
    }
  }
}

function launchConfetti() {
  var duration = 3 * 1000;
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

// Toast notification function
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 3000);
}

// Clipboard copy function
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

// Display token information
function displayTokenInfo(tokenInfo) {
  const tokenInfoContent = document.getElementById("tokenInfoContent");
  if (tokenInfoContent) {
    if (tokenInfo && Object.keys(tokenInfo).length > 0) {
      tokenInfoContent.innerHTML = `
     <div id="popupHeader">
  <div id="popupTitle">Dexsocial</div>
  <div id="socialIcons">
    <!-- Replaced Twitter with X using Font Awesome -->
    <a href="https://x.com/" target="_blank" rel="noopener noreferrer">
      <img src="static/images/logo2.png" alt="Logo" class="X">
    </a>
    <a href="https://telegram.org/" target="_blank" rel="noopener noreferrer">
      <i class="fa-brands fa-telegram" style="font-size:32px;color:white"></i>
    </a>
  </div>
</div>

<div id="mainContent">
  <div class="one logo-container">
    <img src="${
      tokenInfo.image_url ||
      "https://ipfs.io/ipfs/QmdNyJh4k3pBiwT4WLZsxrFcjhdH9PTVFskxNRTLPGNYUL"
    }" alt="${tokenInfo.name || "Token"} Logo" class="token-logo-popup">
    <span class="paid-overlay">PAID!</span>
  </div>
  <div class="two">
    <h1>${tokenInfo.name || "Token Name"}</h1>
    <h2>$${tokenInfo.symbol || "Symbol"}</h2>
    <p><strong>CA:</strong> ${tokenInfo.address || "CA"}</p>
    <p>Dexscreener Token Enhancement</p>
    <p>Paid for Symbol on Chain</p>
  </div>
</div>

<div id="buttonGroup">
  <button class="button share-button" onclick="shareToX('${
    tokenInfo.address
  }')">
    Share to X
  </button>
  <button id="closePaidOverlayBtn" class="button" onClick="hideOverlay()">Close</button>
</div>

      `;

      generateOrRetrieveOGImage(tokenInfo);
    } else {
      tokenInfoContent.innerHTML = "<p>No token information available.</p>";
    }
  }
}

function hideOverlay() {
  const overlay = document.getElementById("paidOverlay");
  const statusInput = document.getElementById("statusAddress");
  if (overlay) {
    overlay.style.display = "none";
  }
  statusInput.value=''
}

// Overlay control functions
function showOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.style.display = "flex";
  }
}

function showPaidOverlay() {
  showOverlay("paidOverlay");
  launchConfetti();
}

function shareToX(contractAddress) {
  const baseUrl = "https://checkdex.xyz/";
  const fullUrl = baseUrl + contractAddress;
  const message = encodeURIComponent(
    `Dex is paid! Confirmed by #CheckDEX\n${fullUrl}`
  );
  const xShareUrl = `https://twitter.com/intent/tweet?text=${message}`;
  window.open(xShareUrl, "_blank");
}

// Check paid status function
function checkPaidStatus(address, checkEligibility = false) {
  const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value;

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
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Full data received:", data);
      console.log("Token info:", data.token_info);

      if (data.paid) {
        if (checkEligibility) {
          eligibilityMessage.textContent = "You are eligible to proceed.";
          fetchPricingTiers(); // This line remains intact
        } else {
          showPaidOverlay();
        }

        // Check if token_info exists and display it if available
        if (data.token_info) {
          displayTokenInfo(data.token_info);
        } else {
          console.error("Token info not available");
          displayTokenInfo(null); // Handle missing token info
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
      console.error("Error occurred:", error);
    });
}

function fetchPricingTiers() {
  const radioContainer = document.getElementById("radioContainer");
  const paymentOptions = document.getElementById("paymentOptions");
  const connectWalletBtn = document.getElementById("connectWalletBtn");

  if (!radioContainer || !paymentOptions) {
    console.error("Required elements not found");
    return;
  }

  fetch("/check-pricing-tier")
    .then((response) => response.json())
    .then((data) => {
      radioContainer.innerHTML = "";

      if (data.tiers && data.tiers.length > 0) {
        data.tiers.forEach((tier) => {
          const radioButton = `
            <div style="display:flex">
              <input type="radio" id="tier${tier.id}" name="pricingTier" value="${tier.id}" data-price="${tier.current_price}" style="flex-shrink:0">
              <label for="tier${tier.id}" style="flex-grow:1">${tier.duration} hour(s) - ${tier.current_price} SOL</label>
            </div>
          `;
          radioContainer.innerHTML += radioButton;
        });

        paymentOptions.style.display = "block";
        if (connectWalletBtn) connectWalletBtn.style.display = "block";
      } else {
        radioContainer.innerHTML = "<p>No pricing tiers available.</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching pricing tiers:", error);
      radioContainer.innerHTML =
        "<p>Error loading pricing tiers. Please try again.</p>";
    });
}

// Main functionality
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");

  const overlay = document.getElementById("overlay");
  const eligibilityPopup = document.getElementById("eligibilityPopup");
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
  const closePopupBtn = document.getElementById("closePopupBtn");
  const helioCheckoutContainer = document.getElementById(
    "helioCheckoutContainer"
  );
 
  // Fetch and display recent searches
  function fetchRecentSearches() {
    fetch("/recent-searches")
      .then((response) => response.json())
      .then((data) => {
        recentSearchesList.innerHTML = "";
        data.searches.forEach((search) => {
          const li = document.createElement("li");

          const a = document.createElement("a");
          a.href = `https://pump.fun/${encodeURIComponent(search)}`;
          a.textContent = search;
          a.target = "_blank";
          a.style.textDecoration = "none";
          a.style.color = "#cccccc";
          a.style.fontWeight = "500";
          a.onmouseover = function () {
            a.style.color = "#b3b3b3";
          };
          a.onmouseout = function () {
            a.style.color = "#cccccc";
          };

          li.appendChild(a);
          li.style.cursor = "pointer";
          recentSearchesList.appendChild(li);
        });
      })
      .catch((error) => {
        console.error("Error fetching recent searches:", error);
      });
  }

  fetchRecentSearches();

  // Check status
  checkStatusBtn.addEventListener("click", () => {
    const statusAddress = document.getElementById("statusAddress").value;
    if (statusAddress.length != 44) {
      alert("Please enter a valid Contract address.");
      return;
    }

    checkStatusBtn.textContent = "Checking...";
    loader.style.display = "inline-block";
    checkStatusBtn.disabled = true;

    const timeoutId = setTimeout(() => {
      if (checkStatusBtn.textContent === "Checking...") {
        checkStatusBtn.textContent = "CHECK DEX Screener PAID";
        loader.style.display = "none";
        checkStatusBtn.disabled = false;
        alert("Request is taking too long. Please try again later.");
      }
    }, 10000);

    checkPaidStatus(statusAddress)
      .catch((error) => {
        console.error("Error checking paid status:", error);
        alert("An error occurred while checking the status. Please try again.");
      })
      .finally(() => {
        clearTimeout(timeoutId);
        checkStatusBtn.textContent = "CHECK DEX Screener PAID";
        addressInput.value='';
        loader.style.display = "none";
        checkStatusBtn.disabled = false;
      });
  });

  // Check eligibility
  checkEligibilityBtn.addEventListener("click", () => {
    console.log("Check Eligibility button clicked");
    const address = addressInput.value;
    if (!address) {
      alert("Please enter a contract address to check eligibility.");
      return;
    }
    checkPaidStatus(address, true);
  });

  // Close eligibility check form popup
  closePopupBtn.addEventListener("click", () => {
    eligibilityPopup.style.display = "none";
    addressInput.disabled = false;
    eligibilityMessage.textContent = "";
    paymentOptions.style.display = "none";
    radioContainer.innerHTML = "";
    submitBtn.style.display = "none";
    helioCheckoutContainer.innerHTML = ""; // Clear the Helius checkout widget
  });

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

    const amount = selectedOption.dataset.price;

    // Initialize Helius checkout widget
    window.helioCheckout(helioCheckoutContainer, {
      paylinkId: "66f453a41e8e50f5bc54dfb9", // Replace with your actual paylinkId
      theme: { themeMode: "light" },
      amount: amount,
    });

    // Listen for the payment completion event
    window.addEventListener("message", function (event) {
      if (event.data.type === "helius_payment_complete") {
        // Payment successful, proceed with saving the record
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
              throw new Error("Failed to save payment record");
            }
            return response.text();
          })
          .then(() => {
            launchConfetti();
            closePopupBtn.click();
            fetchRecentSearches();
          })
          .catch((error) => {
            console.error("Error saving payment record:", error);
            alert(
              "Payment was successful, but there was an error saving the record. Please contact support."
            );
          });
      }
    });
  });

  // Load Helius checkout script
  const script = document.createElement("script");
  script.src = "https://embed.hel.io/assets/index-v1.js";
  script.type = "module";
  script.crossOrigin = "anonymous";
  document.body.appendChild(script);
});

document.getElementById("getTrending").addEventListener("click", () => {
  const paymentPopup = document.getElementById("eligibilityPopup");
  paymentPopup.style.display = "block";
});
