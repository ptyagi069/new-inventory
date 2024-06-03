window.onload = async function() {
  await fetchAndUpdateContent();

};

async function fetchAndUpdateContent() {
  try {
    const pkgID = parseInt(localStorage.getItem('selectedPackageID'));
    if (pkgID) {
      const packageInfoApiUrl = `https://devapi.cultureholidays.com/GetPKGInfo?PKG_ID=${pkgID}`;
      const packageImagesApiUrl = `https://devapi.cultureholidays.com/GetPKGImage?PKG_ID=${pkgID}`;

      const [packageInfoResponse, packageImagesResponse] = await Promise.all([
        fetch(packageInfoApiUrl),
        fetch(packageImagesApiUrl)
      ]);

      const [packageInfo, packageImages] = await Promise.all([
        packageInfoResponse.json(),
        packageImagesResponse.json()
      ]);

      // Continue processing even if some data is missing
      processPackageInfo(packageInfo);
      processPackageImages(packageImages);

      await fetchAndUpdateItinerary();
      await fetchAndUpdateInclusionsExclusions();
      await fetchAndUpdateHotelDetails();
    } else {
      showNoDataFound();
    }
  } catch (error) {
    console.error("Error fetching and updating content:", error);
  }
}

function processPackageInfo(packageInfo) {
  if (packageInfo && packageInfo.length > 0) {
    const packageDetails = packageInfo[0];
    const headingElement = document.querySelector(".heading");
    
    if (headingElement) {
      headingElement.innerHTML = packageDetails.inF_TITLE;
    }

    const contentElement = document.querySelector(".second-content");
    if (contentElement) {
      contentElement.innerHTML = packageDetails.inF_DESCRIPTION;
    }

    const highlightsListElement = document.querySelector(".highlights ul");
    if (highlightsListElement && packageDetails.inF_DESCRIPTION) {
      const listItems = packageDetails.inF_DESCRIPTION
        .split("<p>")
        .filter((p) => p.trim() !== "")
        .map((p) => `<li>${p.replace(/&nbsp;/g, "").trim()}</li>`)
        .join("");
      highlightsListElement.innerHTML = listItems;
    }
  }
}

function processPackageImages(packageImages) {
  if (packageImages && packageImages.length > 0) {
    const firstImageUrl = packageImages[0].pkG_IMG_NAME;
    console.log(firstImageUrl);
    const finalimgurl = 'https://cultureholidays.com' + firstImageUrl.replace('../', '/');

    const additionalImageElement = document.querySelector(".additional-image");
    if (additionalImageElement) {
      additionalImageElement.src = finalimgurl;
    }
  }
}
async function fetchAndUpdateItinerary() {
  try {
    const pkgID = parseInt(localStorage.getItem('selectedPackageID'));
    if (pkgID) {
      const packageItineraryApiUrl = `https://devapi.cultureholidays.com/GetPKGItinerary?PKG_ID=${pkgID}`;

      const packageItineraryResponse = await fetch(packageItineraryApiUrl);
      const packageItinerary = await packageItineraryResponse.json();

      if (packageItinerary && packageItinerary.length > 0) {
        const itineraryContainer = document.querySelector(".itinerary");
        if (itineraryContainer) {
          itineraryContainer.innerHTML = "";

          packageItinerary.sort((a, b) => a.pkG_ITI_DAY - b.pkG_ITI_DAY);

          packageItinerary.forEach((itineraryItem) => {
            const itineraryItemHTML = `
              <div class="itinerary-item page-break">
                <span class="itinerary-badge"><span uk-icon="check"></span></span>
                <img src="../images/calender.png" alt="Arrival Image" class="itinerary-image" style="height: 40px; width: 40px;">
                <div class="itinerary-details page-break">
                  <div class="flex-container page-break">
                    <div class="image-container page-break">
                      <img src="../images/date-arrow.png" alt="Image" style="width: 200px;">
                      <div class="image-content page-break" style="margin-left:10px;">DAY -${itineraryItem.pkG_ITI_DAY}</div>
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
                  <div class="circle"></div>
                </div>
              </div>
            `;

            itineraryContainer.insertAdjacentHTML("beforeend", itineraryItemHTML);
          });

          const dateElement = document.querySelector(".dates");
          if (dateElement) {
            const firstDate = packageItinerary[0].createD_DATE;
            const lastDate = packageItinerary[packageItinerary.length - 1].createD_DATE;
            dateElement.innerHTML += `
              <div class="first-date">${firstDate}</div>
              <div class="last-date" style="padding-left: 30px;">${lastDate}</div>
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
    const pkgID = parseInt(localStorage.getItem('selectedPackageID'));
    if (pkgID) {
      const inclusionExclusionApiUrl = `https://devapi.cultureholidays.com/GetPKGIncExc?PKG_ID=${pkgID}`;
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
    console.error("Error fetching and updating inclusions and exclusions:", error);
  }
}

async function fetchAndUpdateHotelDetails() {
  try {
    const pkgID = parseInt(localStorage.getItem('selectedPackageID'));
    if (pkgID) {
      const hotelDetailsApiUrl = `https://mobileapi.cultureholidays.com/api/Holidays/PacKageHotel?PKG_ID=${pkgID}`;
      const hotelDetailsResponse = await fetch(hotelDetailsApiUrl);
      const hotelDetails = await hotelDetailsResponse.json();
      console.log(hotelDetails);
      if (hotelDetails && hotelDetails.length > 0) {
        const hotelDetailsContainer = document.querySelector(".container-custom");

        if (hotelDetailsContainer) {
          hotelDetailsContainer.innerHTML = ""; // Clear the existing content

          hotelDetails.forEach((hotelDetail) => {
            const hotelDetailsHTML = `
              <div class="container-custom" style="margin-top: 25px; border: 1px solid black; padding: 20px; position: relative; display: flex; align-items: stretch; height: auto;">
                <div class="right-half">
                  <h4>${hotelDetail.htL_NAME}</h4>
                  <div class="jj" style="display: flex;">
                    <div class="stars">${"&#9733;".repeat(parseInt(hotelDetail.htL_STAR))}</div>
                    <div class="date-box" style="color: royalblue;"><i class="ri-time-line"></i>Nights: ${hotelDetail.nights}</div>
                  </div>
                  <div class="custom-box">
                    <p><i class="ri-map-pin-line"></i>${hotelDetail.htL_CITY_NAME}</p>
                  </div>
                  
                </div>
              </div>
            `;

            hotelDetailsContainer.insertAdjacentHTML("beforeend", hotelDetailsHTML);
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

document.getElementById('addRateButton').addEventListener('click', function() {
  document.getElementById('rateFormContainer').style.display = 'block';
});

document.getElementById('rateForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const pkgID = parseInt(localStorage.getItem('selectedPackageID'));
  const pkgTitle = localStorage.getItem('selectedPackageTitle').toString();
  const noOfPax = document.getElementById('noOfPax').value;
  const formDate = document.getElementById('formDate').value;
  const toDate = document.getElementById('toDate').value;
  const singleOcc = document.getElementById('singleOcc').value;
  const doubleOcc = document.getElementById('doubleOcc').value;
  const extraBed = document.getElementById('extraBed').value;
  const markup = document.getElementById('markup').value;

  const requestData = {
    staffId: 0,
    formDate: formDate,
    toDate: toDate,
    noOfPax: parseInt(noOfPax),
    markup: parseInt(markup),
    pkG_ID: parseInt(pkgID),
    pkG_Name: pkgTitle,
    createBy: "string",
    singleOcc: parseInt(singleOcc),
    doubleOcc: parseInt(doubleOcc),
    extraBed: parseInt(extraBed)
  };

  try {
    const response = await fetch('https://devapi.cultureholidays.com/AddInventorySupplierRate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify(requestData)
    });

    if (response.ok) {
      const contentBox = document.querySelector('.content-box');
      const newRow = document.createElement('div');
      newRow.innerHTML = `
        <p>${noOfPax}</p>
        <p>${formDate} <br> to  <br> ${toDate}</p>
        <p>${singleOcc}</p>
        <p>${doubleOcc}</p>
        <p>${extraBed}</p>
      `;
      contentBox.appendChild(newRow);
      document.getElementById('rateForm').reset();
      document.getElementById('rateFormContainer').style.display = 'none';
    } else {
      console.error('Failed to add rate');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});


async function downloadPDF() {
  const a4Container = document.querySelector('.a4-container');
  const pkgID = parseInt(localStorage.getItem('selectedPackageID'));
  try {
    if (pkgID) {
     const selectedPackageTitle = localStorage.getItem('selectedPackageTitle');
      if (selectedPackageTitle) {

        const options = {
          margin: [1, -3, 2, 2],
          filename: `${selectedPackageTitle}.pdf`,
          image: { type: 'jpeg', quality: 0.98, useCORS: true },
          html2canvas: { scale: 2, logging: true, useCORS: true },
          jsPDF: { unit: 'mm', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        };
        console.log("Options:", options);

        html2pdf()
          .from(a4Container)
          .set(options)
          .save();
        console.log("PDF Saved");
      } else {
        console.error("No package info found for the given PKG_ID.");
      }
    } 
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}


let scrollToTopBtn = document.getElementById("scrollToTopBtn");

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

function showNoDataFound() {
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
