var qwerty = 0;
async function fetchData() {
  const response = await fetch("https://devapi.cultureholidays.com/GetCountry");
  const data = await response.json();
  return data;
}

async function populateButtons() {
  const data = await fetchData();
  const regionNames = [...new Set(data.map((country) => country.regionName))];
  const regionButtonsContainer = document.getElementById("regionButtons");
  const filteredPackagesContainer = document.getElementById("filteredPackages");
  const pkginfo = document.getElementById("pkginfo");
  regionNames.forEach((regionName, index) => {
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = regionName;
    button.addEventListener("click", () => {
      document
        .querySelectorAll("#regionButtons .button")
        .forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      displayCountries(regionName, data);
      filteredPackagesContainer.style.display = "flex";
      pkginfo.style.display = "none";
    });
    regionButtonsContainer.appendChild(button);

    if (index === 0) {
      button.click();
    }
  });
}

async function displayCountries(regionName, data) {
  const countries = data.filter((country) => country.regionName === regionName);
  const countryButtonsContainer = document.getElementById("countryButtons");
  countryButtonsContainer.innerHTML = "";

  countries.forEach((country, index) => {
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = country.countryName;
    button.setAttribute("data-country-code", country.countryCode);
    button.addEventListener("click", () => {
      document
        .querySelectorAll("#countryButtons .button")
        .forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      fetchPackages(country.countryCode);
      document.getElementById("optionalToursButton").setAttribute("data-country-code", country.countryCode);
    });

    countryButtonsContainer.appendChild(button);

    if (index === 0) {
      button.click();
    }
  });

  if (!document.getElementById("optionalToursButton")) {
    const optionalToursButton = document.createElement("button");
    optionalToursButton.id = "optionalToursButton";
    optionalToursButton.classList.add("button");
    optionalToursButton.textContent = "View Optional Tours";
    optionalToursButton.addEventListener("click", () => {
      const selectedCountryCode = optionalToursButton.getAttribute("data-country-code");
      if (selectedCountryCode) {
        fetchOptionalTours(selectedCountryCode);
      } else {
        alert("Please select a country first.");
      }
    });
    countryButtonsContainer.parentElement.appendChild(optionalToursButton);
  }
}

async function fetchOptionalTours(countryCode) {
  const response = await fetch(`https://devapi.cultureholidays.com/GetAddonCategory?CountryCode=${countryCode}`);
  const optionalTours = await response.json();
  displayOptionalToursPopup(optionalTours);
}

function displayOptionalToursPopup(optionalTours) {
  const popup = document.getElementById("optionalToursPopup");
  const content = document.getElementById("optionalToursContent");

  // Clear previous content
  content.innerHTML = "";

  if (optionalTours.length > 0) {
    optionalTours.forEach((tour) => {
      const tourDiv = document.createElement("div");
      tourDiv.classList.add("tour");

      tourDiv.innerHTML = `
        <h4>${tour.catName}</h4>
        <p>Name: ${tour.name}</p>
        <p>Description: ${tour.description}</p>
        <p>Date: ${tour.packageDate}</p>
        <p>Itinerary Day: ${tour.itineraryDay}</p>
      `;

      content.appendChild(tourDiv);
    });
  } else {
    content.innerHTML = "<p>No optional tours available.</p>";
  }

  // Show the popup
  popup.style.display = "block";
}

function closeOptionalToursPopup() {
  document.getElementById("optionalToursPopup").style.display = "none";
}


function displayOptionalToursPopup(optionalTours) {
  const popup = document.getElementById("optionalToursPopup");
  const content = document.getElementById("optionalToursContent");

  // Clear previous content
  content.innerHTML = "";

  if (optionalTours.length > 0) {
    optionalTours.forEach((tour) => {
      const tourDiv = document.createElement("div");
      tourDiv.classList.add("tour");

      tourDiv.innerHTML = `
        <h4>${tour.catName}</h4>
        <p>Name: ${tour.name}</p>
        <p>Description: ${tour.description}</p>
        <p>Date: ${tour.packageDate}</p>
        <p>Itinerary Day: ${tour.itineraryDay}</p>
      `;

      content.appendChild(tourDiv);
    });
  } else {
    content.innerHTML = "<p>No optional tours available.</p>";
  }

  // Show the popup
  popup.style.display = "block";
}

function closeOptionalToursPopup() {
  document.getElementById("optionalToursPopup").style.display = "none";
}

async function fetchPackages(countryCode) {
  const response = await fetch(
    `https://apidev.cultureholidays.com/api/Holidays/PackagelistByCountrycode?Countrycode=${countryCode}&AgencyId=`
  );
  const packages = await response.json();
  displayPackages(packages);
}

function displayPackages(packages) {
  const packageButtonsContainer = document.getElementById("packageButtons");
  packageButtonsContainer.innerHTML = "";
  const filteredPackagesContainer = document.getElementById("filteredPackages");
  const pkginfo = document.getElementById("pkginfo");
  const uniqueDays = [...new Set(packages.map((pkg) => pkg.pkgDay))].sort(
    (a, b) => a - b);

  uniqueDays.forEach((day, index) => {
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = `${day} Days`;
    button.addEventListener("click", () => {
      document
        .querySelectorAll("#packageButtons .button")
        .forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      displayFilteredPackages(packages, day);
      filteredPackagesContainer.style.display = "flex";
      pkginfo.style.display = "none";
      // resetDisplay();
    });
    packageButtonsContainer.appendChild(button);

    if (index === 0) {
      button.click();
    }
  });
}

function displayFilteredPackages(packages, filterDay) {
  const filteredPackagesContainer = document.getElementById("filteredPackages");
  const pkginfo = document.getElementById("pkginfo");

  filteredPackagesContainer.innerHTML = "";

  const filteredPackages = filterDay
    ? packages.filter((pkg) => pkg.pkgDay === filterDay)
    : packages;
console.log(filteredPackages);
  filteredPackages.forEach((pkg) => {
    const div = document.createElement("div");
    div.classList.add("package");
    div.innerHTML = `
                    <h4>${pkg.pkgTitle}</h4>
                `;
    div.addEventListener("click", () => {
      localStorage.setItem("selectedPackageID", String(pkg.pkgID));
      localStorage.setItem("selectedPackageTitle", String(pkg.pkgTitle));
      qwerty = pkg.pkgID;
      displayPackageDetails(pkg.pkgID, pkg.pkgTitle);
      filteredPackagesContainer.style.display = "none";
      pkginfo.style.display = "flex";
    });
    filteredPackagesContainer.appendChild(div);
  });

  document.getElementById("searchInput").addEventListener("input", handleSearchInput);
}


function handleSearchInput(event) {
  const searchTerm = event.target.value.toLowerCase();
  const allPackages = document.querySelectorAll("#filteredPackages .package");
  allPackages.forEach((pkg) => {
    const pkgTitle = pkg.querySelector("h4").textContent.toLowerCase();
    if (pkgTitle.includes(searchTerm)) {
      pkg.style.display = "block";
    } else {
      pkg.style.display = "none";
    }
  });
}

async function displayPackageDetails(pkg_ID, pkg_TITLE) {
  const response = await fetch(
    `https://apidev.cultureholidays.com/api/Holidays/PacKageInfo?PKG_ID=${pkg_ID}`
  );
  
  const packageInfo = await response.json();
console.log(packageInfo);
  const packageDetailsContainer = document.getElementById("packageDetails");
  const filteredPackagesContainer = document.getElementById("filteredPackages");
  packageDetailsContainer.style.textAlign = 'center';

  if (packageInfo.length > 0) {
    displayitineraryitems(pkg_ID);
    displayHotelDetails(pkg_ID);
    fetchInclusionsExclusions(pkg_ID);
    const pkg = packageInfo[0];
    packageDetailsContainer.innerHTML = `
            <h1 class="package-title">${pkg_TITLE}</h1>
            <div class="package-content">${pkg.inF_DESCRIPTION}</div>
        `;
  } else {
    displayitineraryitems(pkg_ID);
    displayHotelDetails(pkg_ID);
    fetchInclusionsExclusions(pkg_ID);
    packageDetailsContainer.innerHTML = `
        <h1 class="package-title">${pkg_TITLE}</h1>
        <div class="package-content">NO DATA FOUND</div>
    `;
  }
}


async function displayitineraryitems(pkg_ID) {
  const response = await fetch(
    `https://apidev.cultureholidays.com/api/Holidays/PacKageItieneary?PKG_ID=${pkg_ID}`
  );
  const itineraryitems = await response.json();
  fetchHotelData(pkg_ID);
  displaySupplierRateTable(pkg_ID);
  itineraryitems.sort((a, b) => a.pkG_ITI_DAY - b.pkG_ITI_DAY);

  const accordionContainer = document.getElementById("accordionContainer");
  accordionContainer.innerHTML = ""; // Clear previous items

  itineraryitems.forEach((item) => {
    const accordionItem = document.createElement("div");
    accordionItem.classList.add("accordion-item");

    const heading = document.createElement("div");
    heading.classList.add("accordion-header");
    heading.textContent = `Day ${item.pkG_ITI_DAY} - ${item.pkG_ITI_TITLE}`;
    heading.addEventListener("click", () => {
      const isActive = accordionBody.classList.contains("show");
      accordionBody.classList.toggle("show", !isActive);
    });

    const accordionBody = document.createElement("div");
    accordionBody.classList.add("accordion-body");
    accordionBody.innerHTML = item.pkG_ITI_DESC;

    accordionItem.appendChild(heading);
    accordionItem.appendChild(accordionBody);

    accordionContainer.appendChild(accordionItem);
  });
}

async function fetchInclusionsExclusions(pkg_ID) {
  try {
    const response = await fetch(
      `https://apidev.cultureholidays.com/api/Holidays/PacKageInclusionAndExclusion?PKG_ID=${pkg_ID}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    const inclusionsContainer = document.getElementById("inclusionsContent");
    const exclusionsContainer = document.getElementById("exclusionsContent");

    // Clear previous items
    inclusionsContainer.innerHTML = "";
    exclusionsContainer.innerHTML = "";

    if (data.length > 0) {
      data.forEach((item) => {
        const details = `<p>${item.inC_DETAILS}</p>`;

        if (item.inC_TYPE === "inclusion") {
          inclusionsContainer.insertAdjacentHTML("beforeend", details);
        } else {
          exclusionsContainer.insertAdjacentHTML("beforeend", details);
        }
      });
    } else {
      inclusionsContainer.innerHTML = "<p>No inclusions available.</p>";
      exclusionsContainer.innerHTML = "<p>No exclusions available.</p>";
    }

    // Hide exclusions by default
    exclusionsContainer.classList.remove("active");
  } catch (error) {
    const inclusionsContainer = document.getElementById("inclusionsContent");
    const exclusionsContainer = document.getElementById("exclusionsContent");

    inclusionsContainer.innerHTML = "<p>Error loading inclusions. Please try again later.</p>";
    exclusionsContainer.innerHTML = "<p>Error loading exclusions. Please try again later.</p>";

    console.error("Error fetching and displaying inclusions and exclusions:", error);
  }
}

document.getElementById("inclusionsButton").addEventListener("click", () => {
  toggleDetails("inclusionsContent", "exclusionsContent", "inclusionsButton", "exclusionsButton");
});

document.getElementById("exclusionsButton").addEventListener("click", () => {
  toggleDetails("exclusionsContent", "inclusionsContent", "exclusionsButton", "inclusionsButton");
});

function toggleDetails(showId, hideId, activeButtonId, inactiveButtonId) {
  document.getElementById(showId).classList.add("active");
  document.getElementById(hideId).classList.remove("active");

  document.getElementById(activeButtonId).classList.add("active");
  document.getElementById(inactiveButtonId).classList.remove("active");
}

function toggleDetails(showId, hideId) {
  document.getElementById(showId).classList.add("active");
  document.getElementById(hideId).classList.remove("active");
}

async function fetchHotelData(pkg_ID) {
  const response = await fetch(
    `https://apidev.cultureholidays.com/api/Holidays/PacKageHotel?PKG_ID=${pkg_ID}`
  );
  const data = await response.json();
  console.log(data);
  return data;
}

async function displayHotelDetails(pkg_ID) {
  const hotelData = await fetchHotelData(pkg_ID);
  const hotelDetailsContainer = document.querySelector(".hotel-details");

  hotelDetailsContainer.innerHTML = "<h2 class='hotel-details-heading'>Hotel Details</h2>"; // Add heading

  if (hotelData.length > 0) {
    hotelData.forEach((hotel) => {
      const hotelDiv = document.createElement("div");
      hotelDiv.classList.add("hotel");

      const starCount = '<i class="ri-star-fill"></i>'.repeat(hotel.htL_STAR);

      hotelDiv.innerHTML = `
        <h6 ">${hotel.htL_NAME}</h6>
        <p>City: ${hotel.htL_CITY_NAME}</p>
        <p>Stars: ${starCount}</p>
        <p>Nights: ${hotel.nights}</p>
      `;

      hotelDetailsContainer.appendChild(hotelDiv);
    });
  } else {
    const hotelDiv = document.createElement("div");
    hotelDiv.classList.add("hotel");
    hotelDiv.innerHTML = `
      <h6>NO HOTEL DETAILS :(</h6>
      <p>City: N/A</p>
      <p>Stars: N/A</p>
      <p>Nights: N/A</p>
    `;
    hotelDetailsContainer.appendChild(hotelDiv);
  }
}

async function displaySupplierRateTable(pkg_ID) {
  try {
    const response = await fetch(
      `https://devapi.cultureholidays.com/GetSupplierRate?PKG_ID=${pkg_ID}`
    );
    const supplierRateTableContainer = document.getElementById(
      "supplierRateTableContainer"
    );
    supplierRateTableContainer.innerHTML = ""; // Clear previous items

    const table = document.createElement("table");
    table.classList.add("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headers = [
      "Minimum No. of PAX",
      "Date Range",
      "Single Occupancy",
      "Double Occupancy",
      "Extra Bed",
      "Download",
    ];
    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");

    if (response.ok) {
      const supplierRateData = await response.json();
      if (supplierRateData && supplierRateData.length > 0) {
        supplierRateData.forEach((rate) => {
          const row = document.createElement("tr");

          const noOfPaxCell = document.createElement("td");
          noOfPaxCell.textContent = rate.noOfPax;
          noOfPaxCell.setAttribute("data-label", "Minimum No. of PAX");
          row.appendChild(noOfPaxCell);

          const dateRangeCell = document.createElement("td");
          dateRangeCell.textContent = `${rate.date_from} - ${rate.date_To}`;
          dateRangeCell.setAttribute("data-label", "Date Range");
          row.appendChild(dateRangeCell);

          const singleOccCell = document.createElement("td");
          singleOccCell.textContent = rate.singleOcc;
          singleOccCell.setAttribute("data-label", "Single Occupancy");
          row.appendChild(singleOccCell);

          const doubleOccCell = document.createElement("td");
          doubleOccCell.textContent = rate.doubleOcc;
          doubleOccCell.setAttribute("data-label", "Double Occupancy");
          row.appendChild(doubleOccCell);

          const extraBedCell = document.createElement("td");
          extraBedCell.textContent = rate.extraBed;
          extraBedCell.setAttribute("data-label", "Extra Bed");
          row.appendChild(extraBedCell);

          const downloadRateCell = document.createElement("td");
          downloadRateCell.setAttribute("data-label", "Download");
          if (rate.remarks) {
            const downloadLink = document.createElement("a");
            downloadLink.href = `https://cmx.cultureholidays.com${rate.remarks.replace(
              "..",
              ""
            )}`;
            downloadLink.textContent = "Download";
            downloadLink.target = "_blank"; // Open the link in a new tab
            downloadRateCell.appendChild(downloadLink);
          } else {
            downloadRateCell.textContent = "N/A";
          }
          row.appendChild(downloadRateCell);

          tbody.appendChild(row);
        });
      } else {
        const noDataRow = document.createElement("tr");
        const emptyDataCell = document.createElement("td");
        emptyDataCell.colSpan = 6; // Span all columns
        emptyDataCell.textContent = "N/A";
        noDataRow.appendChild(emptyDataCell);
        tbody.appendChild(noDataRow);
      }
    } else {
      const errorRow = document.createElement("tr");
      const errorCell = document.createElement("td");
      errorCell.colSpan = 6; // Span all columns
      errorCell.textContent = "N/A";
      errorRow.appendChild(errorCell);
      tbody.appendChild(errorRow);
    }

    table.appendChild(tbody);
    supplierRateTableContainer.appendChild(table);

  } catch (error) {
    const supplierRateTableContainer = document.getElementById(
      "supplierRateTableContainer"
    );
    supplierRateTableContainer.innerHTML = "";

    const errorRow = document.createElement("tr");
    const errorCell = document.createElement("td");
    errorCell.colSpan = 6; // Span all columns
    errorCell.textContent = "N/A";
    errorRow.appendChild(errorCell);
    const tbody = document.createElement("tbody");
    tbody.appendChild(errorRow);

    const table = document.createElement("table");
    table.classList.add("table");
    table.appendChild(tbody);

    supplierRateTableContainer.appendChild(table);
    // console.error("Error fetching supplier rate data:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const apiBaseUrl = 'https://apidev.cultureholidays.com/api';

  function setupButton(buttonId, popupId, dateDropdownId, agentInputId, submitId, cancelId, pageUrl) {
    document.getElementById(buttonId).addEventListener("click", () => {
      document.getElementById(popupId).style.display = "block";

      const selectedPackageID = qwerty;
      if (!selectedPackageID) {
        console.error('No package ID selected');
        return;
      }

      fetch(`${apiBaseUrl}/Account/GetPackageRoomAvlDate?PKGID=${selectedPackageID}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          const dateDropdown = document.getElementById(dateDropdownId);
          dateDropdown.innerHTML = ''; 
          data.forEach(item => {
            const option = document.createElement("option");
            option.value = item.ratE_AVIAL_DATE;
            option.textContent = item.ratE_AVIAL_DATE;
            dateDropdown.appendChild(option);
          });
        })
        .catch(error => {
          console.error('Error fetching dates:', error);
          alert('Failed to load available dates. Please try again.');
        });
    });

    document.getElementById(submitId).addEventListener("click", () => {
      let agentID = document.getElementById(agentInputId).value;
      let selectedDate = document.getElementById(dateDropdownId).value;

      if (agentID.startsWith("CHAGT")) {
        let itineraryURL = `${pageUrl}?itineraryID=${encodeURIComponent(qwerty)}&agentID=${encodeURIComponent(agentID)}&rateAvialDate=${encodeURIComponent(selectedDate)}`;
        window.open(itineraryURL, "_blank").focus();
        document.getElementById(popupId).style.display = "none";
      } else {
        alert("Invalid Agent ID. It must start with 'CHAGT'.");
      }
    });

    document.getElementById(cancelId).addEventListener("click", () => {
      document.getElementById(popupId).style.display = "none";
    });
  }

  // Setup for the first button
  setupButton(
    "downloadItineraryButton",
    "agentIdPopup",
    "dateDropdown",
    "agentIDInput",
    "submitAgentID",
    "cancelAgentID",
    "../pages/index.html"
  );

  // Setup for the second button
  setupButton(
    "downloadItineraryButtontwo",
    "agentIdPopupTwo",
    "dateDropdownTwo",
    "agentIDInputTwo",
    "submitAgentIDTwo",
    "cancelAgentIDTwo",
    "../pagestwo/index.html"
  );

  // Setup for the third button
  setupButton(
    "downloadItineraryButtonthree",
    "agentIdPopupThree",
    "dateDropdownThree",
    "agentIDInputThree",
    "submitAgentIDThree",
    "cancelAgentIDThree",
    "../pagesthree/index.html"
  );
});

populateButtons();
