let is5star = true;
var pkgpdfname = "";
const mainurl = "https://apidev.cultureholidays.com/api/Holidays/";
const mainurl2 = "https://apidev.cultureholidays.com/api/Account/";
let finalday = 0;
var companyLogo = '';
var whatsappContact = '';
var emailID = '';
var packg_name = '';
var pdf_filename = '';

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

var itineraryID = getUrlParameter('itineraryID');
var agentID = getUrlParameter('agentID');
var rateAvialDate = getUrlParameter('rateAvialDate');
const sess = rateAvialDate;
const pkgID = itineraryID;
const agentIds = agentID;

document.addEventListener("DOMContentLoaded", () => {
  fetchPackageInfo()
  .then (fetchAgencyDetails)
    .then(fetchPackageImages)
    .then(fetchPackageItinerary)
    .then (fetchAndDisplayQRCode)
    .then(fetchPackageInclusionExclusion)
    .then(fetchHotels)
    .then(fetchpackagerates)
    .catch(error => console.error('Error in the chain of function execution:', error));
});




async function fetchAgencyDetails() {
  const apiUrl = mainurl2 + 'GetAgencyProfileDetails?AgentID=' + agentID;
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Storing the response entities in variables
     companyLogo = data.companyLogo || '';
     whatsappContact = data.whatsappNumber || '';
     emailID = data.emailid || '';


      if(data.company_Name = '') {
        document.getElementById('company-name-stg').innerHTML  = '';
      }
      else {
        document.getElementById('company-name-stg').innerHTML = data.company_Name;
      }
      document.getElementById('kompani-logo').src = companyLogo;
      document.getElementById('phone-stg').innerHTML = whatsappContact;
      document.getElementById('email-stg').innerHTML = emailID;


  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}



async function fetchPackageInfo() {
  return fetch(mainurl + "PacKageInfo?PKG_ID=" + pkgID)
    .then((response) => response.json())
    .then((data) => {
      const packageInfo = data[0];
      const fufa = document.getElementById("pkgname");
      pkgpdfname = fufa.toString();
      document.getElementById("pkgname").innerText = packageInfo.packageName;
      fufa.style.fontWeight = "bold";
      document.getElementById("tripdesc").innerText =
        packageInfo.pkG_DESCRIPTION;
      document.getElementById("inf_desc").innerHTML =
        packageInfo.inF_DESCRIPTION;
      const citiesDiv = document.getElementById("cities");
      citiesDiv.innerHTML = ""; 

      const destinations = packageInfo.pkG_DESTINATION.split(",");
      destinations.forEach((destination) => {
        const destinationDiv = document.createElement("div");
        destinationDiv.style.backgroundColor = "white";
        destinationDiv.style.color = "blue";
        destinationDiv.style.display = "inline-block";
        destinationDiv.style.padding = "0.5rem";
        destinationDiv.style.marginRight = "0.5rem";
        destinationDiv.style.borderRadius = "15px";
        destinationDiv.style.marginTop  = "15px";
        destinationDiv.textContent = destination.trim();
        citiesDiv.appendChild(destinationDiv);
      });
    })
    .catch((error) => console.error("Error fetching package info:", error));
}

async function fetchPackageImages() {
  return fetch(mainurl + "PackageImages?PKG_ID=" + pkgID)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.length > 0) {
        const thumbnailsContainer1 = document.getElementById('thumbnailsContainer1');
        const thumbnailsContainer2 = document.getElementById('thumbnailsContainer2');
        thumbnailsContainer1.innerHTML = ''; // Clear any existing thumbnails
        thumbnailsContainer2.innerHTML = ''; // Clear any existing thumbnails

        data.forEach((image, index) => {
          const imgElement1 = document.createElement('img');
          imgElement1.src = image.pkG_IMG_URl;
          imgElement1.alt = `Image ${index + 1}`;
          imgElement1.style.cursor = 'pointer';
          imgElement1.style.margin = '5px';
          imgElement1.style.width = '150px';
          imgElement1.style.height = '100px';
          imgElement1.style.objectFit = 'cover';
          imgElement1.addEventListener('click', () => {
            updateMainImage(image.pkG_IMG_URl, 'topmost');
            setSelectedImage(imgElement1, thumbnailsContainer1);
          });

          const imgElement2 = document.createElement('img');
          imgElement2.src = image.pkG_IMG_URl;
          imgElement2.alt = `Image ${index + 1}`;
          imgElement2.style.cursor = 'pointer';
          imgElement2.style.margin = '5px';
          imgElement2.style.width = '150px';
          imgElement2.style.height = '100px';
          imgElement2.style.objectFit = 'cover';
          imgElement2.addEventListener('click', () => {
            updateMainImage(image.pkG_IMG_URl, 'tripOverview');
            setSelectedImage(imgElement2, thumbnailsContainer2);
          });

          thumbnailsContainer1.appendChild(imgElement1);
          thumbnailsContainer2.appendChild(imgElement2);
        });

        // Set initial images if required
        if (data.length > 1) {
          updateMainImage(data[0].pkG_IMG_URl, 'topmost'); // Set the first image as initial for topmost container
          setSelectedImage(thumbnailsContainer1.children[0], thumbnailsContainer1);
          updateMainImage(data[1].pkG_IMG_URl, 'tripOverview'); // Set the second image as initial for trip overview container
          setSelectedImage(thumbnailsContainer2.children[1], thumbnailsContainer2);
        }
      } else {
        console.error('No images available to display.');
      }
    })
    .catch(error => console.error('Error fetching package images:', error));
}

function updateMainImage(imageUrl, containerType) {
  if (containerType === 'topmost') {
    const topmostContainer = document.querySelector('.topmost-container');
    topmostContainer.style.backgroundImage = `url(${imageUrl})`;
  } else if (containerType === 'tripOverview') {
    const tripOverviewContainer = document.querySelector('.trip-overview-heading');
    tripOverviewContainer.style.backgroundImage = `url(${imageUrl})`;
  }
}

function setSelectedImage(selectedImage, container) {
  const images = container.querySelectorAll('img');
  images.forEach(img => img.classList.remove('selected-image'));
  selectedImage.classList.add('selected-image');
}

async function fetchPackageItinerary() {
  return fetch(mainurl + "PacKageItieneary?PKG_ID=" + pkgID)
    .then((response) => response.json())
    .then((data) => {
      finalday = Math.max(...data.map((item) => item.pkG_ITI_DAY));
      const tripDurationElement = document.getElementById('trip-duratomo');
      tripDurationElement.textContent = `Trip Duration: ${finalday - 1} Nights | ${finalday} Days`;
      document.getElementById(
        "daycount"
      ).innerHTML = `<i class="ri-sun-fill"></i> ${
        finalday - 1
      } Nights | ${finalday} Days`;

      const selectedDate = sess;
      // console.log("Selected date from session storage:", selectedDate);
      const [day, month, year] = selectedDate.split('/');
      
      const startDate = new Date(year, month - 1, day); 
      const endDate = new Date(startDate);

      endDate.setDate(startDate.getDate() + finalday - 1);

      const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      };

      const formattedStartDate = formatDate(startDate);
      document.getElementById('tour-date-table').innerHTML = formattedStartDate;
      pdf_filename = `${packg_name}-${formattedStartDate}`;
      const formattedEndDate = formatDate(endDate);

      const dateRangeElement = document.querySelector('.date-range-element');
      dateRangeElement.innerHTML = `
        <i class="ri-calendar-2-line"></i> ${formattedStartDate} - ${formattedEndDate}
      `;

      const daysContainer = document.querySelector(".all-days");
      daysContainer.innerHTML = ''; // Clear existing content

      data.forEach((item, index) => {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        const overnightLocation = item.pkG_ITI_DESC.match(/Overnight:\s*([^<>]+)/)?.[1].trim() || "N/A";
        const meals = [
          { type: 'breakfast', label: 'Breakfast', image: 'assets/breakfast.png' },
          { type: 'lunch', label: 'Lunch', image: 'assets/lunch.png' },
          { type: 'dinner', label: 'Dinner', image: 'assets/dinner.png' }
        ];

        const mealIcons = meals.filter(meal => item[meal.type] === 'yes')
          .map(meal => `<div style="text-align: center; margin-right: 10px; gap:20px;">
                          <img src="${meal.image}" alt="${meal.label}" style="width: 40px;">
                          <div>${meal.label}</div>
                        </div>`).join('');

        const mealSection = mealIcons ? mealIcons : 'Meal Not Available';

        // Calculate the date for this day
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + index);

        // Format the date as "DD Month YYYY"
        const formattedDate = currentDate.toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });

        dayDiv.innerHTML = `
          <div class="top-bar" style="display: flex;" id="tttt">
            <div class="day-count" style="width: 5%; background-color: #3620ED; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <p style="transform: rotate(-90deg); font-weight: bold; font-size: 15px; white-space: nowrap;">DAY - ${item.pkG_ITI_DAY}</p>
            </div>
            <div class="day-title" style="width: 60%; background-color: #FBCD85;">
              <div class="day-and-date" style="display: flex; gap: 20px;">
                <p style="font-weight: bold;">DAY - ${item.pkG_ITI_DAY} :</p>
                <p style="font-weight: bold;">${formattedDate}</p>
              </div>
              <div class="arrival">
                <p style="font-weight: 350;">${item.pkG_ITI_TITLE}</p>
              </div>
            </div>
            <div class="overnight-top" style="width: 35%; background-color: rgb(240, 236, 236); display: flex; justify-content: center; align-items: center;">
              <p><i class="ri-moon-cloudy-line" style="background-color: rgb(0, 110, 255); padding: 8px; color: white; border-radius: 8px;"></i> <span style="font-weight: bold; margin-left: 4px; color: #3620ED;"> Overnight</span> : ${overnightLocation}</p>
            </div>
          </div>
          <div class="bottom-content" style="background-color: #ffffff; padding: 40px;">
            <div class="content">
              <p>${item.pkG_ITI_DESC}</p>
            </div>
            <div class= "bottom-content-2" style = "display: flex; justify-content: space-between; padding-top:20px;">
              <div class="meal-section" style="margin-top: 15px; display: flex; justify-content: space-between; width:60%; gap:30px;">
                <div class = "one-meal" style= "display:flex; flex-direction: column; justify-content: center; align-items: center;">
                  <h2 style="font-size: 20px; color: #3620ED;">Your Meals for Today !</h2>
                  <div class="meal-icons" style="display: flex; align-items: center;">
                    ${mealSection}
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        daysContainer.appendChild(dayDiv);
      });
    })
    .catch((error) => console.error("Error fetching itinerary:", error));
}

async function fetchPackageInclusionExclusion() {
  return fetch(mainurl + "PacKageInclusionAndExclusion?PKG_ID=" + pkgID)
    .then((response) => response.json())
    .then((data) => {
      const inclusionDetailsContainer = document.getElementById("inclusionDetails");
      const exclusionDetailsContainer = document.getElementById("exclusionDetails");
      inclusionDetailsContainer.innerHTML = "";
      exclusionDetailsContainer.innerHTML = "";

      data.forEach((item) => {
        const detailsElement = document.createElement("div");
        detailsElement.innerHTML = item.inC_DETAILS.replace(
          /style="color: rgb\(.*?\);"/g,
          ""
        ); // Remove inline color styles

        if (item.inC_TYPE === "inclusion") {
          detailsElement.style.color = "#FFF !important"; // Use !important
          inclusionDetailsContainer.appendChild(detailsElement);
        } else if (item.inC_TYPE === "exclusion") {
          detailsElement.style.color = "#000 !important"; // Use !important
          exclusionDetailsContainer.appendChild(detailsElement);
        }
      });
    })
    .catch((error) =>
      console.error("Error fetching inclusion/exclusion details:", error)
    );
}

async function fetchHotels() {
  return fetch(mainurl + "PacKageHotel?PKG_ID=" + pkgID)
    .then((response) => response.json())
    .then((data) => {
      const totalNights = data.reduce((sum, hotel) => sum + parseInt(hotel.nights), 0) + 1;
      
      if (totalNights === finalday) {
        const hotelContainer = document.getElementById("hotelContainer");
        hotelContainer.innerHTML = "";
        let currentStartDay = 1;

        data.forEach((hotelData) => {
          let startDay = currentStartDay;
          let endDay = parseInt(hotelData.nights) + startDay;
          if (startDay >= finalday) {
            startDay = finalday - parseInt(hotelData.nights);
            endDay = finalday;
          }

          const card = document.createElement("div");
          card.classList.add("card");
          
    card.innerHTML = `
    <div class="top-card" style="display: flex;">
      <div class="left-side" style="display: flex; background-color: #3620ed; color: white; padding: 8px 15px;">
        <h3 style="font-weight: 400">DAY ${startDay} - DAY ${endDay}</h3>
      </div>
    </div>
    <div class="outer-bottom-card">
      <div class="bottom-card-container" style="position: relative;">
        <div class="bottom-card" style=" background-color: #f7f7f7; display: flex; justify-content: space-between;">
          <div class="lefties" style="padding: 40px; width:70%">
            <div class = "mast" style = "display:flex; justify-content: space-between;">
<div class="stars" style="background-color: #fffefe; border: 1px solid rgb(255, 217, 0); padding: 10px; border-radius: 15px; width: 200px; display: flex; gap: 10px; align-items: center; justify-content: center; margin-bottom: 20px;">
                ${Array(is5star ? 5 : 4)
                 .fill('<i class="ri-star-fill" style="color: rgb(255, 217, 0);"></i>')
                    .join("")}
                  <p  style="font-weight: bold;">${is5star ? "5 star" : "4 star"}</p>
              </div>
              <div class="nights" style="    background-color: rgba(0, 0, 255, 0.185);
border: 2px dotted blue;
width: fit-content;
margin-left: 10px;
color: blue;
border-radius: 20px;
padding: 7px;
display: flex;
justify-content: center;
align-items: center;
  height: fit-content;">
              <p><i class="ri-time-line"></i> <span>${
                hotelData.nights
              }</span> Nights</p>
            </div>
            </div>

            <h1 style="font-weight: 600; font-size: 25px;">${
              hotelData.htL_NAME
            }</h1>
            <p><i class="ri-map-pin-line"></i> <span>${
              hotelData.htL_ADDRESS
            }</span></p>
          </div>
          <div class="rightie" style="width: 30%; background-image: url('${
            hotelData.hotelImage
          }'); background-size: cover; background-position: center; ">
          </div>
        </div>
      </div>
    </div>
  `;
          hotelContainer.appendChild(card);
          currentStartDay = endDay;
        });
      } else {
        // Proceed with the existing logic to divide into maps
        const fiveStarHotels = new Map();
        const fourStarHotels = new Map();

        data.forEach((hotel, index) => {
          const hotelData = {
            htL_ID: hotel.htL_ID,
            htL_NAME: hotel.htL_NAME,
            hotelImage: hotel.hotelImage,
            htL_DESCRIPTION: hotel.htL_DESCRIPTION,
            htL_CITY_CODE: hotel.htL_CITY_CODE,
            htL_CITY_NAME: hotel.htL_CITY_NAME,
            htL_COUNTRY_CODE: hotel.htL_COUNTRY_CODE,
            htL_ADDRESS: hotel.htL_ADDRESS,
            nights: hotel.nights,
          };

          if (hotel.htL_STAR === "5") {
            fiveStarHotels.set(index, hotelData);
          } else if (hotel.htL_STAR === "4") {
            fourStarHotels.set(index, hotelData);
          }
        });

        if (fiveStarHotels.size === 0 && fourStarHotels.size === 0) {
          console.log("No hotel data available.");
          return;
        }

        if (fiveStarHotels.size === 0) {
          displayHotels(fourStarHotels);
        } else if (fourStarHotels.size === 0) {
          displayHotels(fiveStarHotels);
        } else {
          promptUserForHotelSelection(fiveStarHotels, fourStarHotels);
        }
      }
    })
    .catch((error) => console.error("Error fetching hotels:", error));
}

function promptUserForHotelSelection(fiveStarHotels, fourStarHotels) {
  const popupContainer = document.getElementById("popupContainer");
  const fiveStarOption = document.getElementById("fiveStarOption");
  const fourStarOption = document.getElementById("fourStarOption");

  popupContainer.style.display = "flex";
fiveStarOption.addEventListener("click", () => {
  is5star = true;
  displayHotels(fiveStarHotels);
  closePopup();
});

fourStarOption.addEventListener("click", () => {
  is5star = false;
  displayHotels(fourStarHotels);
  closePopup();
});
}

function closePopup() {
  const popupContainer = document.getElementById("popupContainer");
  popupContainer.style.display = "none";
}

function displayHotels(hotels) {
  const hotelContainer = document.getElementById("hotelContainer");
  hotelContainer.innerHTML = "";
  let currentStartDay = 1;
  hotels.forEach((hotelData) => {
    let startDay = currentStartDay;
    let endDay = parseInt(hotelData.nights) + startDay;
    if (startDay >= finalday) {
      startDay = finalday -  parseInt(hotelData.nights);
      endDay = finalday;
    }
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
          <div class="top-card" style="display: flex;">
            <div class="left-side" style="display: flex; background-color: #3620ed; color: white; padding: 8px 15px;">
              <h3 style="font-weight: 400">DAY ${startDay} - DAY ${endDay}</h3>
            </div>
          </div>
          <div class="outer-bottom-card">
            <div class="bottom-card-container" style="position: relative;">
              <div class="bottom-card" style=" background-color: #f7f7f7; display: flex; justify-content: space-between;">
                <div class="lefties" style="padding: 40px; width:70%">
                  <div class = "mast" style = "display:flex; justify-content: space-between;">
     <div class="stars" style="background-color: #fffefe; border: 1px solid rgb(255, 217, 0); padding: 10px; border-radius: 15px; width: 200px; display: flex; gap: 10px; align-items: center; justify-content: center; margin-bottom: 20px;">
                      ${Array(is5star ? 5 : 4)
                       .fill('<i class="ri-star-fill" style="color: rgb(255, 217, 0);"></i>')
                          .join("")}
                        <p  style="font-weight: bold;">${is5star ? "5 star" : "4 star"}</p>
                    </div>
                    <div class="nights" style="    background-color: rgba(0, 0, 255, 0.185);
    border: 2px dotted blue;
    width: fit-content;
    margin-left: 10px;
    color: blue;
    border-radius: 20px;
    padding: 7px;
    display: flex;
    justify-content: center;
    align-items: center;
        height: fit-content;">
                    <p><i class="ri-time-line"></i> <span>${
                      hotelData.nights
                    }</span> Nights</p>
                  </div>
                  </div>

                  <h1 style="font-weight: 600; font-size: 25px;">${
                    hotelData.htL_NAME
                  }</h1>
                  <p><i class="ri-map-pin-line"></i> <span>${
                    hotelData.htL_ADDRESS
                  }</span></p>
                </div>
                <div class="rightie" style="width: 30%; background-image: url('${
                  hotelData.hotelImage
                }'); background-size: cover; background-position: center; ">
                </div>
              </div>
            </div>
          </div>
        `;

    hotelContainer.appendChild(card);
    currentStartDay = endDay;
  });
}

async function fetchAndDisplayQRCode() {
  const apiUrl =  mainurl2 + 'GenrateQr';
  const agentId =  agentID;
  const emailId = sessionStorage.getItem('emailid');
  const selected = sess;
  const packageId = pkgID;
  const amount = '111111';
  const depositAmount = '200'; 
  const ipAddress = '::1';
  const requestBody = {};

  const queryString = new URLSearchParams({
    agentid: agentId,
    emailid: emailId,
    packageid: packageId,
    tourdate: selected,
    Amount: amount,
    DepositAmount: depositAmount,
    ipaddress: ipAddress,
  }).toString();

  const fullUrl = `${apiUrl}?${queryString}`;
  console.log(fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Error !');
    }

    const data = await response.json();
    if (data.success && data.message.startsWith('data:image/png;base64,')) {
      console.log(data.message);
      const base64ImageData = data.message.replace('data:image/png;base64,', '');
      const qrImage = new Image();
      qrImage.src = 'data:image/png;base64,' + base64ImageData;
      qrImage.style.width = '150px';
      qrImage.style.borderRadius = '5px'
      qrImage.style.zIndex = '100'
      

      const imageContainer = document.getElementById('qrCodeContainer');
      imageContainer.appendChild(qrImage);
    } else {
      console.error('Invalid API response format');
    }
  } catch (error) {
    console.error('Error fetching API:', error);
  }
}

async function fetchpackagerates() {
  try {
    const response = await fetch(mainurl + `PacKageRate?PKG_ID=${pkgID}&AgentID=${agentIds}&tourdate=${encodeURIComponent(sess)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(data);
    if (data.length > 0) {
      const packageRate = data[0];
      document.getElementById('twin-triple').value = Math.round(packageRate.dbldclienT_PRICE);
      document.getElementById('single').value =Math.round( packageRate.singdclienT_PRICE);
      document.getElementById('room_category_tbl').textContent = packageRate.roomCategory;
    }
    
    return data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
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

document.getElementById("download-pdf").addEventListener("click", function () {
  window.scrollTo(0, 0);
  document.getElementById("price-btn-dis").style.display = "none";

  var options = {
    filename: pdf_filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, logging: true, useCORS: true },
    jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
    pagebreak: { mode: 'avoid-all'},
    margin: [10,0,0,0],
  };

  var element = document.getElementById("sanu");
  html2pdf().set(options).from(element).save();
  document.getElementById("price-btn-dis").style.display = "block";

});


let isEditing = false;

function toggleEdit() {
    const twinTriple = document.getElementById("twin-triple");
    const single = document.getElementById("single");
    const editBtn = document.querySelector(".edit-btn");

    if (!isEditing) {
        twinTriple.disabled = false;
        single.disabled = false;
        twinTriple.parentElement.classList.add("editable");
        single.parentElement.classList.add("editable");
        editBtn.textContent = "Save";
        isEditing = true;
    } else {
        // Save changes and exit edit mode
        twinTriple.disabled = true;
        single.disabled = true;
        twinTriple.parentElement.classList.remove("editable");
        single.parentElement.classList.remove("editable");
        editBtn.textContent = "Edit Rate";
        isEditing = false;
    }
}

// limit input to 5 digits
document.getElementById("twin-triple").addEventListener("input", function(e) {
    if (e.target.value.length > 5) {
        e.target.value = e.target.value.slice(0, 5);
    }
});

document.getElementById("single").addEventListener("input", function(e) {
    if (e.target.value.length > 5) {
        e.target.value = e.target.value.slice(0, 5);
    }
});