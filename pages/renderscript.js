window.onload = fetchAndUpdateContent;

window.addEventListener('load', function() {
  const preloader = document.getElementById('preloader');

  preloader.style.display = 'flex';
  setTimeout(function() {
    preloader.style.display = 'none';
  }, 3000); 
});


async function fetchAndUpdateContent() {
  try {
    const storedData = localStorage.getItem("travelFormData");
    if (storedData) {
      const formData = JSON.parse(storedData);
      const pkgID = formData.packageID;
      const packageInfoApiUrl = `https://mobileapi.cultureholidays.com/api/Holidays/PacKageInfo?PKG_ID=${pkgID}`;
      const packageImagesApiUrl = `https://mobileapi.cultureholidays.com/api/Holidays/PackageImages?PKG_ID=${pkgID}`;
      const packageInfoResponse = await fetch(packageInfoApiUrl);
      const packageInfo = await packageInfoResponse.json();
      const packageImagesResponse = await fetch(packageImagesApiUrl);
      const packageImages = await packageImagesResponse.json();
      if (
        packageInfo &&
        packageInfo.length > 0 &&
        packageImages &&
        packageImages.length > 0
      ) {
        const packageDetails = packageInfo[0];
        const firstImageUrl = packageImages[0].pkG_IMG_URl;

        const headingElement = document.querySelector(".heading");
        if (headingElement) {
          const packageName = packageDetails.packageName;
          const words = packageName.split(" ");
          const midIndex = Math.ceil(words.length / 2);
          const firstHalf = words.slice(0, midIndex).join(" ");
          const secondHalf = words.slice(midIndex).join(" ");

          headingElement.innerHTML = `${firstHalf}<br>${secondHalf}`;
        }
        const contentElement = document.querySelector(".second-content");
        if (contentElement) {
          contentElement.innerHTML = packageDetails.pkG_DESCRIPTION;
        }

        const highlightsListElement = document.querySelector(".highlights ul");
        if (highlightsListElement && packageDetails.inF_DESCRIPTION) {
          highlightsListElement.innerHTML = packageDetails.inF_DESCRIPTION;
        }

        const additionalImageElement =
          document.querySelector(".additional-image");
        if (additionalImageElement) {
          additionalImageElement.src = firstImageUrl;
        }

        // calling all the below functions here using await..
        await fetchAndUpdateItinerary();
        await fetchAndUpdateInclusionsExclusions();
        await fetchAndUpdateHotelDetails();
      }
    } else {
      const a4Container = document.querySelector(".a4-container");
      a4Container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
          <div style="text-align: center;">
            <h1 style="font-size: 48px; color: #ff5722;">404</h1>
            <p style="font-size: 24px; color: #333;">No Data Found</p>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error fetching and updating content:", error);
  }
}

async function fetchAndUpdateItinerary() {
  try {
    const storedData = localStorage.getItem("travelFormData");
    if (storedData) {
      const formData = JSON.parse(storedData);
      const pkgID = formData.packageID;
      const packageItineraryApiUrl = `https://mobileapi.cultureholidays.com/api/Holidays/PacKageItieneary?PKG_ID=${pkgID}`;

      const packageItineraryResponse = await fetch(packageItineraryApiUrl);
      const packageItinerary = await packageItineraryResponse.json();

      if (packageItinerary && packageItinerary.length > 0) {
        const itineraryContainer = document.querySelector(".itinerary");
        if (itineraryContainer) {
          itineraryContainer.innerHTML = "";

          const startDate = new Date(formData.date);
          let currentDate = new Date(startDate);
          let firstDate = null;
          let lastDate = null;

          packageItinerary.forEach((itineraryItem, index) => {
            currentDate.setDate(startDate.getDate() + index);

            const formattedDate = currentDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            });

            if (index === 0) {
              firstDate = formattedDate;
            } else if (index === packageItinerary.length - 1) {
              lastDate = formattedDate;
            }

            const itineraryItemHTML = `
              <div class="itinerary-item page-break">
                <span class="itinerary-badge"><span uk-icon="check"></span></span>
                <img src="images/calender.png" alt="Arrival Image" class="itinerary-image" style="height: 40px; width: 40px;">
                <div class="itinerary-details page-break">
                  <div class="flex-container page-break">
                    <div class="image-container page-break">
                      <img src="images/date-arrow.png" alt="Image" style="width: 200px;">
                      <div class="image-content page-break" style = " margin-left:10px;">${formattedDate}</div>
                    </div>
                    <div class="title-box page-break">${itineraryItem.pkG_ITI_TITLE}</div>
                  </div>
                </div>
              </div>
              <div class="trip-details page-break">
                <div class="timeline page-break">
                  <div class="circle page-break"></div>
                </div>
                <div class="border-box page-break">
                  ${itineraryItem.pkG_ITI_DESC}
                </div>
                <div class="timeline page-break">
                  <div class="circle "></div>
                </div>
              </div>
            `;

            itineraryContainer.insertAdjacentHTML(
              "beforeend",
              itineraryItemHTML
            );
          });

          const dateElement = document.querySelector(".dates");
          if (dateElement) {
            dateElement.innerHTML += `
              <div class="first-date" >${firstDate}</div>
              <div class="last-date" style ="padding-left :30px">${lastDate}</div>
            `;
          }
        }
      }
    } else {
      console.error("No PKG_ID found in local storage.");
    }
  } catch (error) {
    console.error("Error fetching and updating itinerary:", error);
  }
}

async function fetchAndUpdateInclusionsExclusions() {
  try {
    const storedData = localStorage.getItem("travelFormData");
    if (storedData) {
      const formData = JSON.parse(storedData);
      const pkgID = formData.packageID;
      const inclusionExclusionApiUrl = `https://mobileapi.cultureholidays.com/api/Holidays/PacKageInclusionAndExclusion?PKG_ID=${pkgID}`;

      const inclusionExclusionResponse = await fetch(inclusionExclusionApiUrl);
      const inclusionExclusionData = await inclusionExclusionResponse.json();

      if (inclusionExclusionData && inclusionExclusionData.length > 0) {
        const inclusionBox = document.querySelector(".first-box .box ul");
        const exclusionBox = document.querySelector(".second-box .box ul");

        if (inclusionBox && exclusionBox) {
          inclusionBox.innerHTML = "";
          exclusionBox.innerHTML = "";

          inclusionExclusionData.forEach((item) => {
            const listItems = item.inC_DETAILS
              .split("<p>")
              .filter((p) => p.trim() !== "")
              .map((p) => `<li>${p.replace(/&nbsp;/g, "").trim()}</li>`)
              .join("");

            if (item.inC_TYPE === "inclusion") {
              inclusionBox.insertAdjacentHTML("beforeend", listItems);
            } else if (item.inC_TYPE === "exclusion") {
              exclusionBox.insertAdjacentHTML("beforeend", listItems);
            }
          });
        }
      }
    } else {
      console.error("No PKG_ID found in local storage.");
    }
  } catch (error) {
    console.error(
      "Error fetching and updating inclusions and exclusions:",
      error
    );
  }
}

async function fetchAndUpdateHotelDetails() {
  try {
    const storedData = localStorage.getItem("travelFormData");
    if (storedData) {
      const formData = JSON.parse(storedData);
      const pkgID = formData.packageID;
      const hotelDetailsApiUrl = `https://mobileapi.cultureholidays.com/api/Holidays/PacKageHotel?PKG_ID=${pkgID}`;

      const hotelDetailsResponse = await fetch(hotelDetailsApiUrl);
      const hotelDetails = await hotelDetailsResponse.json();

      if (hotelDetails && hotelDetails.length > 0) {
        const hotelDetailsContainer =
          document.querySelector(".container-custom");

        if (hotelDetailsContainer) {
          hotelDetailsContainer.innerHTML = ""; // Clear the existing content

          hotelDetails.forEach((hotelDetail) => {
            const hotelDetailsHTML = `
            <div class="container-custom" style="margin-top: 25px; border: 1px solid black; padding: 20px; position: relative; display:flex;align-items: stretch; height:auto;">
            <div class="left-half">
              <img src="${
                hotelDetail.hotelImage || "images/placeholder.jpg"
              }" alt="Hotel Image" style="width: 100% ; height:auto;  object-fit: cover;">
            </div>
            <div class="right-half">
              <h4>${hotelDetail.htL_NAME}</h4>
              <div class ="jj"    style="display: flex;">
              <div class="stars">${"&#9733;".repeat(
                parseInt(hotelDetail.htL_STAR)
              )}</div>
              <div class="date-box" style="color: royalblue;"><i class="ri-time-line"></i>Nights: ${
                hotelDetail.nights
              }</div>
              </div>
              <div class="custom-box">
                <p><i class="ri-map-pin-line"></i>${
                  hotelDetail.htL_ADDRESS
                }</p>
              </div>
              <p>${hotelDetail.htL_DESCRIPTION}</p>
            </div>
          </div>
              `;

            hotelDetailsContainer.insertAdjacentHTML(
              "beforeend",
              hotelDetailsHTML
            );
          });
        }
      }
    } else {
      console.error("No PKG_ID found in local storage.");
    }
  } catch (error) {
    console.error("Error fetching and updating hotel details:", error);
  }
}

async function downloadPDF() {
  const a4Container = document.querySelector('.a4-container');

  try {
    const storedData = localStorage.getItem("travelFormData");
    if (storedData) {
      const formData = JSON.parse(storedData);
      const pkgID = formData.packageID;
      const packageInfoApiUrl = `https://mobileapi.cultureholidays.com/api/Holidays/PacKageInfo?PKG_ID=${pkgID}`;
      const packageInfoResponse = await fetch(packageInfoApiUrl);
      const packageInfo = await packageInfoResponse.json();

      if (packageInfo && packageInfo.length > 0) {
        const packageName = packageInfo[0].packageName;
        const options = {
          margin: [1, -3, 2, 2],
          filename: `${packageName}.pdf`, // Set the filename dynamically
          enableLinks: true,
          image: { type: 'jpeg', quality: 0.98, useCORS: true },
          html2canvas: { scale: 2, logging: true, useCORS: true },
          jsPDF: { unit: 'mm', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        };
        html2pdf()
          .from(a4Container)
          .set(options)
          .save();
      } else {
        console.error("No package info found for the given PKG_ID.");
      }
    } 
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

let scrollToTopBtn = document.getElementById("scrollToTopBtn");

// Show or hide the button based on scroll position
window.onscroll = function() {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
}
// the moment this button will be clicked scrolled to the top
scrollToTopBtn.addEventListener("click", function() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
});

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}