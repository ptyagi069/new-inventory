const form = document.getElementById("multiStepForm");
const steps = document.querySelectorAll(".step");
const stepForms = document.querySelectorAll(".step-form");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const packageCards = document.querySelectorAll(".package-card");
const params = new URLSearchParams(window.location.search);
const apiUrl = "https://mobileapi.cultureholidays.com/api/";
const pdfiurl = "https://pdfi.cultureholidays.com/inv/";
let selectedActivities = new Set();
let currentPage = 1;
let selecteddate = '';
let token = "";
let packageArray;
let actitivityArray;
let filteredPackagesdaywise;
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

      if(currentStep == 3){
        const modals = document.querySelectorAll("div.modal");
        modals.forEach(modal => {
          modal.style.display = "none";
        });

        filteredpackage("", formData.destination.code, formData.agentId, "Country", "", "", 1, 10 );
      }
      if(currentStep == 4){

        const modals = document.querySelectorAll("div.modal");
        modals.forEach(modal => {
          modal.style.display = "none";
        });

        updateStep(currentStep + 1);
      }

      else{
        updateStep(currentStep + 1);
      }
    }

    else {
      console.log("Form submitted:", formData);
     window.open(
        `https://pdfi.cultureholidays.com/api/edit/${formData.package.id}?userid=${formData.agentId}&date=${selecteddate}&addonswcost=true&wantaddon=true&token=${formData.token}`
      );
      //window.open(`http://localhost:3000/api/edit/${formData.package.id}?userid=${formData.agentId}&date=${selecteddate}&addonswcost=true&wantaddon=true&token=${formData.token}`);
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
    const response = await fetch( pdfiurl + "login", {
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
  } catch (error) {
  } finally {
  }
}

async function filteredpackage(region, country, userid, type, pkg_category_id, nights, pagenumber, pagesize) {
    try {
        const data = await fetch(`${pdfiurl}getfilteredpackages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                region,
                country,
                userid,
                type,
                pkg_category_id,
                nights,
                pagenumber,
                pagesize
            })
        });

        const response = await data.json();
        
        actitivityArray = response.data;
        console.log(actitivityArray);
        // Create a map to store activities and their related packages
        const activitiesMap = new Map();

        // Process each package
        response.data.forEach(package => {
            if (package.TopActivities) {
                // Parse the TopActivities string to JSON
                const activities = JSON.parse(package.TopActivities);

                // Process each activity
                activities.forEach(activity => {
                    const activityName = activity.Activity;

                    // If this activity doesn't exist in our map, create a new array
                    if (!activitiesMap.has(activityName)) {
                        activitiesMap.set(activityName, []);
                    }

                    // Add package info to this activity
                    activitiesMap.get(activityName).push({
                        packageImage: package.pkgImage,
                        packageTitle: package.pkgTitle,
                        packageId: package.PKG_ID
                    });
                });
            }
        });

        // Convert map to a more readable object structure
        const activitiesSummary = Array.from(activitiesMap).map(([activity, packages]) => ({
            activity,
            packages
        }));

        renderactivities(activitiesSummary);
        return activitiesSummary;

    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
}

async function fetchActivitiesPage(pageNumber) {
  try {
    const response = await fetch(`${pdfiurl}getfilteredpackages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        region: "",
        country: formData.destination.code,
        userid: formData.agentId,
        type: "Country",
        pkg_category_id: "",
        nights: "",
        pagenumber: pageNumber,
        pagesize: 10
      })
    });

    const data = await response.json();
    console.log(data);
    return data.success ? data.data : [];
  
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

function processActivities(activities) {
  const activitiesMap = new Map();

  activities.forEach(package => {
    if (package.TopActivities) {
      const activities = JSON.parse(package.TopActivities);
      
      activities.forEach(activity => {
        const activityName = activity.Activity;
        
        if (!activitiesMap.has(activityName)) {
          activitiesMap.set(activityName, []);
        }

        activitiesMap.get(activityName).push({
          packageImage: package.pkgImage,
          packageTitle: package.pkgTitle,
          packageId: package.PKG_ID
        });
      });
    }
  });

  return Array.from(activitiesMap).map(([activity, packages]) => ({
    activity,
    packages
  }));
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

async function getinclusions(pkgid){
  try{
    const data = await fetch( apiUrl +'Holidays/PacKageInclusionAndExclusion?PKG_ID=' + pkgid);
    const res = await data.json();
    const l = res.length;
    for(let i = 0 ; i < l ; i++){
        if (res[i]['inC_TYPE'] === 'inclusion') {
           
        }
    }
  }
  catch(error){
    console.log(error);
  }
}

async function populatedays(countryCode, agentid) {
  filteredPackagesdaywise = [];
   try {
    const response = await fetch(
      `https://mobileapi.cultureholidays.com/api/Holidays/PackagelistByCountrycode?Countrycode=${countryCode}&AgencyId=all`
    );
    const  result = await response.json();
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

async function renderactivities(filteredActivities, append = false) {
  const container = document.getElementById('activity-container');
  // Only clear container if we're not appending
  if (!append) {
    container.innerHTML = '';
  } else {
    // Remove existing "See More" button if it exists
    const existingButton = container.querySelector('.see-more-btn');
    if (existingButton) {
      existingButton.remove();
    }
  }

  filteredActivities.forEach(activitySummary => {
    const activityButton = document.createElement('button');
    activityButton.className = 'filter-option';
    activityButton.textContent = activitySummary.activity;
    activityButton.addEventListener('click', () => {
      if (selectedActivities.has(activitySummary)) {
        selectedActivities.delete(activitySummary);
        activityButton.classList.remove('selected');
      } else {
        selectedActivities.add(activitySummary);
        activityButton.classList.add('selected');
      }
      filterPackagesByActivity(Array.from(selectedActivities));
    });
    container.appendChild(activityButton);
  });

  const seeMoreButton = document.createElement('button');
  seeMoreButton.textContent = 'See More';
  seeMoreButton.className = 'see-more-btn';
  seeMoreButton.addEventListener('click', async () => {
    console.log(currentPage);
    currentPage++;
    const newActivities = await fetchActivitiesPage(currentPage);
    if (newActivities.length > 0) {
     
      //renderactivities(processedActivities, true);
    } else {
      seeMoreButton.style.display = 'none';  // Hide button when no more data
    }
  });
  container.appendChild(seeMoreButton);
}

async function filteredpackage(region, country, userid, type, pkg_category_id, nights, pagenumber, pagesize) {
  try {
    currentPage = 1;  // Reset page counter when starting a new filter
    const initialActivities = await fetchActivitiesPage(currentPage);
    const processedActivities = processActivities(initialActivities);
    renderactivities(processedActivities, false);
    return processedActivities;
  } catch (error) {
    console.error('Error details:', error);
    throw error;
  }
}

function renderpackages(dayvalue) {
  const packages = packageArray;
  const packageCardsContainer = document.getElementById(
    "package-cards-container"
  );
  packageCardsContainer.innerHTML = ""; // Clear any existing content

  // Filter packages where pkgDay matches dayvalue
  filteredPackagesdaywise = packages.filter((pkg) => pkg.pkgDay == dayvalue);

  filteredPackagesdaywise.forEach((pkg) => {
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

    const inclusionsButton = document.createElement('button');
    inclusionsButton.textContent = 'Show Inclusions';
    inclusionsButton.addEventListener('click', async () => {
        const inclusionsDiv = packageCard.querySelector('.inclusions');
        if (inclusionsDiv) {
            inclusionsDiv.remove();
            inclusionsButton.textContent = 'Show Inclusions';
        } else {
            const inclusions = await getinclusions(pkg.pkgID);
            showInclusions(inclusions, packageCard);
            inclusionsButton.textContent = 'Hide Inclusions';
        }
    });
    packageCard.appendChild(inclusionsButton);

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

async function getinclusions(pkgid) {
  try {
    const data = await fetch(apiUrl + 'Holidays/PacKageInclusionAndExclusion?PKG_ID=' + pkgid);
    const res = await data.json();
    const inclusions = res.filter(item => item.inC_TYPE === 'inclusion').map(item => item.inC_DETAILS);
    return inclusions;
  } catch (error) {
    console.log(error);
    return [];
  }
}

function showInclusions(inclusions, packageCard) {
  const inclusionsDiv = document.createElement("div");
  inclusionsDiv.className = "inclusions";
  inclusionsDiv.innerHTML = inclusions.join('<br>');
  packageCard.appendChild(inclusionsDiv);
}

async function fetchalldata() {
  await populateDestinations();
}

fetchalldata();

async function fetchMoreActivities() {
  let pageNumber = 1;
  let hasMoreData = true;
  const allActivities = [];

  while (hasMoreData) {
    try {
      const response = await fetch(`${pdfiurl}getfilteredpackages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          region: "",
          country: formData.destination.code,
          userid: formData.agentId,
          type: "Country",
          pkg_category_id: "",
          nights: "",
          pagenumber: pageNumber,
          pagesize: 10
        })
      });

      const data = await response.json();
   
      if (data.success && data.data.length > 0) {
        allActivities.push(...data.data);
        pageNumber++;
      } else {
        hasMoreData = false;
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      hasMoreData = false;
    }
  }

  return allActivities;
}

async function filteredpackage(region, country, userid, type, pkg_category_id, nights, pagenumber, pagesize) {
  try {
    const allActivities = await fetchMoreActivities();

    // Create a map to store activities and their related packages
    const activitiesMap = new Map();

    // Process each package
    allActivities.forEach(package => {
      if (package.TopActivities) {
        // Parse the TopActivities string to JSON
        const activities = JSON.parse(package.TopActivities);

        // Process each activity
        activities.forEach(activity => {
          const activityName = activity.Activity;

          // If this activity doesn't exist in our map, create a new array
          if (!activitiesMap.has(activityName)) {
            activitiesMap.set(activityName, []);
          }

          // Add package info to this activity
          activitiesMap.get(activityName).push({
            packageImage: package.pkgImage,
            packageTitle: package.pkgTitle,
            packageId: package.PKG_ID
          });
        });
      }
    });

    // Convert map to a more readable object structure
    const activitiesSummary = Array.from(activitiesMap).map(([activity, packages]) => ({
      activity,
      packages
    }));
    renderactivities(activitiesSummary);
    return activitiesSummary;

  } catch (error) {
    console.error('Error details:', error);
    throw error;
  }
}

function filterPackagesByActivity(selectedActivities) {
  const packageCardsContainer = document.getElementById("package-cards-container");
  packageCardsContainer.innerHTML = "";

  let packagesToDisplay = [];
  
  if (selectedActivities.length === 0 || selectedActivities.length == null ) {
    // If no activities selected, show all packages from filteredPackagesdaywise
    packagesToDisplay = filteredPackagesdaywise;
  } else {
    // Get package IDs from each activity
    const packageIdSets = selectedActivities.map(activity => 
      new Set(activity.packages.map(pkg => parseInt(pkg.packageId)))
    );

    // Get the intersection of all package ID sets
    const commonPackageIds = [...packageIdSets[0]].filter(pkgId => 
      packageIdSets.every(set => set.has(pkgId))
    );

    // Filter packages that are present in ALL selected activities
    packagesToDisplay = filteredPackagesdaywise.filter(pkg =>
      commonPackageIds.includes(parseInt(pkg.pkgID))
    );
  }

  if (packagesToDisplay.length === 0) {
    const noPackageMessage = document.createElement("p");
    noPackageMessage.textContent = "No packages found common in all selected activities.";
    noPackageMessage.className = "no-package-message";
    packageCardsContainer.appendChild(noPackageMessage);
    return;
  }

  // Create package cards for the filtered packages
  packagesToDisplay.forEach((pkg) => {
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

    const inclusionsButton = document.createElement('button');
    inclusionsButton.textContent = 'Show Inclusions';
    inclusionsButton.addEventListener('click', async () => {
      const inclusionsDiv = packageCard.querySelector('.inclusions');
      if (inclusionsDiv) {
        inclusionsDiv.remove();
        inclusionsButton.textContent = 'Show Inclusions';
      } else {
        const inclusions = await getinclusions(pkg.pkgID);
        showInclusions(inclusions, packageCard);
        inclusionsButton.textContent = 'Hide Inclusions';
      }
    });
    packageCard.appendChild(inclusionsButton);

    packageCardsContainer.appendChild(packageCard);
  });

  // Attach event listeners to newly created package cards
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

function highlightActivityButton(button) {
  const buttons = document.querySelectorAll('.filter-option');
  buttons.forEach(btn => btn.style.backgroundColor = '');
  button.style.backgroundColor = '#ffcc00';
}
