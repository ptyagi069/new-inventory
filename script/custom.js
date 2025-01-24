const form = document.getElementById("multiStepForm");
const steps = document.querySelectorAll(".step");
const stepForms = document.querySelectorAll(".step-form");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const packageCards = document.querySelectorAll(".package-card");
const params = new URLSearchParams(window.location.search);
const apiUrl = "https://mobileapi.cultureholidays.com/api/";
let selecteddate = '';
let token = "";
let packageArray;
let currentStep = 1;
let formData = {
  destination: "",
  agentId: "",
  days: "",
  package: "",
  token : ""
};

packageCards.forEach((card) => {
  card.addEventListener("click", function () {
    packageCards.forEach((c) => c.classList.remove("selected"));
    this.classList.add("selected");
    formData.package = this.dataset.package;
    validateStep(currentStep);
  });
});

function resetForm() {
  // Reset form data
  formData = {
    destination: {},
    agentId: "",
    days: "",
    package: "",
  };
  currentStep = 1;

  document.getElementById("multiStepForm").reset();
  document.getElementById("destination").value = "";
  document.getElementById("days").value = "";
  document.querySelectorAll(".step-form").forEach((step) => {
    step.classList.remove("active");
  });
  document.querySelector(".step-form[data-step='1']").classList.add("active");
  document.querySelectorAll(".step").forEach((step, index) => {
    step.classList.remove("active", "completed");
    if (index === 0) {
      step.classList.add("active");
    }
  });
  nextBtn.textContent = "Continue";
  document.getElementById("prevBtn").disabled = true;
  document.getElementById("nextBtn").disabled = false;
  document.getElementById("package-cards-container").innerHTML = "";
}

nextBtn.addEventListener("click", function () {
  if (currentStep == 2) {
    validateStep(2);
  }

  if (validateStep(currentStep)) {
    if (currentStep < 5) {
      updateStep(currentStep + 1);
    } else {
      console.log("Form submitted:", formData);
      window.open(
        `https://pdfi.cultureholidays.com/api/edit/${formData.package.id}?userid=${formData.agentId}&date=${selecteddate}&addonswcost=true&wantaddon=true&token=${formData.token}`
      );
      resetForm();
    }
  }
});

prevBtn.addEventListener("click", function () {
  if (currentStep > 1) {
    updateStep(currentStep - 1);
  }
});

function updateStep(step) {
  stepForms.forEach((form) => form.classList.remove("active"));
  steps.forEach((s) => s.classList.remove("active"));

  document.querySelector(`[data-step="${step}"]`).classList.add("active");
  steps[step - 1].classList.add("active");

  prevBtn.disabled = step === 1;
  nextBtn.textContent = step === 5 ? "Start Editing Itinerary" : "Continue";

  steps.forEach((s, index) => {
    if (index < step - 1) {
      s.classList.add("completed");
    } else {
      s.classList.remove("completed");
    }
  });

  currentStep = step;

  // Smooth scroll on mobile
  if (window.innerWidth <= 768) {
    document.querySelector(".form-content").scrollIntoView({
      behavior: "smooth",
    });
  }
}

async function gettoken(agentid) {
  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agentid,
      }),
    });
    const data = await response.json();
    token = data.encodedSessionID;
    formData.token = token;
    console.log(token);
  } catch (error) {
  } finally {
  }
}

function validateStep(step) {
  let isValid = false;

  switch (step) {
    case 1:
      const destination = document.getElementById("destination").value;
      isValid = destination !== "";
      if (isValid) {
        formData.destination = {
          code: destination,
          name: document.getElementById("destination").options[
            document.getElementById("destination").selectedIndex
          ].text,
        };
      } else {
        animateInvalidField("destination");
      }
      break;
    case 2:
      const agentId = document.getElementById("agentId").value;
      isValid = agentId !== "" && /^CHAGT/i.test(agentId);
      if (isValid) {
        formData.agentId = agentId;
        async function fetchtoken() {
          await gettoken(agentId);
        }
        fetchtoken();
        populatedays(formData.destination.code, agentId);
      } else {
        animateInvalidField("agentId");
      }
      break;

    case 3:
      const days = document.getElementById("days").value;
      isValid = days !== "";
      if (isValid) {
        formData.days = days;

        renderpackages(formData.days);
      } else {
        animateInvalidField("days");
      }
      break;
    case 4:
      isValid = formData.package !== "";
      if (!isValid) {
        const packageCards = document.querySelectorAll(".package-card");
        packageCards.forEach((card) => {
          card.style.animation = "shake 0.5s ease";
          setTimeout(() => {
            card.style.animation = "";
          }, 500);
        });
      }
      break;
      case 5:
        var dateInput = document.getElementById('selectedDate');
        var selectedDate = dateInput.value;
        if (selectedDate) {
            var formattedDate = formatDate(selectedDate);
            isValid = true;
            selecteddate = formattedDate;
        }
        break;
    
    function formatDate(dateString) {
        var dateParts = dateString.split('-');
        var year = dateParts[0];
        var month = dateParts[1];
        var day = dateParts[2];
        return `${day}/${month}/${year}`;
    }
    

  }

  return isValid;
}

function animateInvalidField(fieldId) {
  const field = document.getElementById(fieldId);
  field.style.borderColor = "#ef4444";
  field.style.animation = "shake 0.5s ease";

  setTimeout(() => {
    field.style.borderColor = "";
    field.style.animation = "";
  }, 500);
}

document.getElementById("destination").addEventListener("change", () => {
  validateStep(1);
});

document.getElementById("days").addEventListener("change", () => {
  validateStep(3);
});


document.getElementById("selectedDate").addEventListener("change", () => {
  validateStep(5);
});
const style = document.createElement("style");
style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
        }
    `;
document.head.appendChild(style);


async function populateDestinations() {
  try {
    const response = await fetch(apiUrl + "Holidays/Countrylist");
    const destinations = await response.json();

    const destinationSelect = document.getElementById("destination");

    // Clear existing options except the first one
    destinationSelect.innerHTML =
      '<option value="">Select destination</option>';

    // Add new options
    destinations.forEach((dest) => {
      const option = document.createElement("option");
      option.value = dest.countryCode; // Using countryCode as value
      option.textContent = dest.countryName; // Using countryName as display text
      destinationSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    // Add a disabled option to indicate error
    const errorOption = document.createElement("option");
    errorOption.textContent = "Error loading destinations";
    errorOption.disabled = true;
    destinationSelect.appendChild(errorOption);
  }
}


async function populatedays(code, agentid) {
  try {
    const response = await fetch(
      `${apiUrl}Holidays/PackagelistByCountrycode?Countrycode=${code}&AgencyId=${agentid}`
    );
    let result = await response.json();

    // Normalize result to an array
    if (!Array.isArray(result) && result.data) {
      result = result.data;
    } else if (!Array.isArray(result)) {
      result = Object.values(result);
    }

    // Create an array of objects with pkgTitle, pkgID, pkgImage, and pkgDay
    packageArray = result.map((item) => ({
      pkgTitle: item.pkgTitle,
      pkgID: item.pkgID,
      pkgImage: item.pkgImage,
      pkgDay: item.pkgDay,
    }));

    const selectDays = document.getElementById("days");
    selectDays.innerHTML = '<option value="">Select duration</option>';

    if (packageArray && packageArray.length > 0) {
      const uniqueDays = new Set();
      packageArray.forEach((item) => {
        if (item && item.pkgDay) {
          uniqueDays.add(item.pkgDay);
        }
      });

      // Convert the Set to an array and sort it
      const sortedDays = Array.from(uniqueDays).sort((a, b) => a - b);

      sortedDays.forEach((day) => {
        const option = document.createElement("option");
        option.value = day;
        option.textContent = `${day} Days`;
        selectDays.appendChild(option);
      });
    } else {
      selectDays.innerHTML = '<option value="">No durations available</option>';
    }
  } catch (error) {
    console.error("Error fetching days:", error);
    const selectDays = document.getElementById("days");
    selectDays.innerHTML = '<option value="">Error loading data</option>';
  }
}

function renderpackages(dayvalue) {
  const packages = packageArray;
  const packageCardsContainer = document.getElementById(
    "package-cards-container"
  );
  packageCardsContainer.innerHTML = ""; // Clear any existing content

  // Filter packages where pkgDay matches dayvalue
  const filteredPackages = packages.filter((pkg) => pkg.pkgDay == dayvalue);

  filteredPackages.forEach((pkg) => {
    const packageCard = document.createElement("div");
    packageCard.className = "package-card";
    packageCard.setAttribute("data-package", pkg.pkgID);
    packageCard.setAttribute("data-package-name", pkg.pkgTitle);

    const img = document.createElement("img");
    img.src = pkg.pkgImage;
    img.alt = pkg.pkgTitle;
    packageCard.appendChild(img);

    const title = document.createElement("h3");
    title.textContent = pkg.pkgTitle;
    packageCard.appendChild(title);

    packageCardsContainer.appendChild(packageCard);
  });

  // Attach event listeners to the newly rendered package cards
  const packageCards = document.querySelectorAll(".package-card");
  packageCards.forEach((card) => {
    card.addEventListener("click", function () {
      packageCards.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
      formData.package = {
        id: this.dataset.package,
        name: this.dataset.packageName,
      };
      validateStep(currentStep);
    });
  });
}

async function fetchalldata() {
  await populateDestinations();
}

fetchalldata();
