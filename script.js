// Change this URL if deploying to Render or another server
const API_URL = "https://airbnb-room-classifier-1.onrender.com";

const form = document.getElementById("predictionForm");
const predictBtn = document.getElementById("predictBtn");
const errorBox = document.getElementById("errorBox");
const resultBox = document.getElementById("resultBox");
const predictionValue = document.getElementById("predictionValue");
const probabilityBars = document.getElementById("probabilityBars");

// Preset sample data matching Pydantic validations
const PRESETS = {
  manhattan: {
    neighbourhood_group: "Manhattan",
    neighbourhood: "Midtown",
    latitude: 40.7549,
    longitude: -73.984,
    price: 240.0,
    minimum_nights: 2,
    number_of_reviews: 125,
    reviews_per_month: 3.5,
    calculated_host_listings_count: 4,
    availability_365: 180,
  },
  brooklyn: {
    neighbourhood_group: "Brooklyn",
    neighbourhood: "Kensington",
    latitude: 40.64749,
    longitude: -73.97237,
    price: 95.0,
    minimum_nights: 1,
    number_of_reviews: 45,
    reviews_per_month: 1.4,
    calculated_host_listings_count: 1,
    availability_365: 250,
  },
  queens: {
    neighbourhood_group: "Queens",
    neighbourhood: "Astoria",
    latitude: 40.7644,
    longitude: -73.9235,
    price: 65.0,
    minimum_nights: 3,
    number_of_reviews: 18,
    reviews_per_month: 0.85,
    calculated_host_listings_count: 2,
    availability_365: 310,
  },
};

// Handle Preset Button Clicks
document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const presetKey = btn.getAttribute("data-preset");
    const data = PRESETS[presetKey];
    if (!data) return;

    Object.keys(data).forEach((key) => {
      if (form.elements[key]) {
        form.elements[key].value = data[key];
      }
    });

    errorBox.style.display = "none";
    resultBox.style.display = "none";
  });
});

// Handle Form Submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  errorBox.style.display = "none";
  resultBox.style.display = "none";

  const formData = new FormData(form);

  // Construct payload matching FeaturesModel schema
  const payload = {
    latitude: parseFloat(formData.get("latitude")),
    longitude: parseFloat(formData.get("longitude")),
    price: parseFloat(formData.get("price")),
    minimum_nights: parseInt(formData.get("minimum_nights"), 10),
    number_of_reviews: parseInt(formData.get("number_of_reviews"), 10),
    reviews_per_month: parseFloat(formData.get("reviews_per_month")),
    calculated_host_listings_count: parseInt(
      formData.get("calculated_host_listings_count"),
      10,
    ),
    availability_365: parseInt(formData.get("availability_365"), 10),
    neighbourhood_group: formData.get("neighbourhood_group").trim(),
    neighbourhood: formData.get("neighbourhood").trim(),
  };

  predictBtn.disabled = true;
  predictBtn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Listing...';

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result.detail
        ? Array.isArray(result.detail)
          ? result.detail.map((d) => `${d.loc[1]}: ${d.msg}`).join(", ")
          : result.detail
        : "Prediction failed. Check your inputs.";
      throw new Error(errorMsg);
    }

    renderResults(result);
  } catch (err) {
    errorBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <strong>Error:</strong> ${err.message}`;
    errorBox.style.display = "block";
  } finally {
    predictBtn.disabled = false;
    predictBtn.innerHTML =
      '<i class="fa-solid fa-bolt"></i> Predict Listing Type';
  }
});

// Render Prediction and Animated Probability Bars
function renderResults(result) {
  predictionValue.textContent = result.prediction;
  probabilityBars.innerHTML = "";

  // Sort probabilities highest to lowest
  const sortedEntries = Object.entries(result.probability).sort(
    (a, b) => b[1] - a[1],
  );

  sortedEntries.forEach(([className, prob], index) => {
    const percentage = (prob * 100).toFixed(1);
    const isTop = index === 0;

    const item = document.createElement("div");
    item.className = "prob-item";
    item.innerHTML = `
            <div class="prob-label-row">
                <span>${className}</span>
                <span>${percentage}%</span>
            </div>
            <div class="prob-bar-bg">
                <div class="prob-bar-fill ${isTop ? "top-class" : ""}" data-width="${percentage}%"></div>
            </div>
        `;
    probabilityBars.appendChild(item);
  });

  resultBox.style.display = "block";
  resultBox.scrollIntoView({ behavior: "smooth", block: "center" });

  // Trigger smooth bar fill animation
  requestAnimationFrame(() => {
    document.querySelectorAll(".prob-bar-fill").forEach((bar) => {
      bar.style.width = bar.getAttribute("data-width");
    });
  });
}

// Clear alerts and scroll smoothly to top on reset
form.addEventListener("reset", () => {
    errorBox.style.display = "none";
    resultBox.style.display = "none";
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});