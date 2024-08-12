const mainurl = 'https://apidev.cultureholidays.com/api/Holidays/';
const mainurl2 = 'https://apidev.cultureholidays.com/api/Account/';
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
let [day, month, year] = sess.split('/');
let formattedDateStr = `${month}/${day}/${year}`;
const startDate = new Date(formattedDateStr);
const pkgID = itineraryID;
const agentIds=  agentID;

document.querySelectorAll('.dates').forEach((dateElement) => {
  dateElement.innerHTML = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
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
        document.getElementById('agency-name').innerHTML  = '';
      }
      else {
        document.getElementById('agency-name').innerHTML = data.company_Name;
      }
      document.getElementById('kompani-logo').src = companyLogo;
      document.getElementById('phone-stg').innerHTML = whatsappContact;
      document.getElementById('email-stg').innerHTML = emailID;
      document.getElementById('phone-stg-2').innerHTML = whatsappContact;
      document.getElementById('email-stg-2').innerHTML = emailID;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}


async function fetchPackageInfo() {
  return fetch(mainurl + "PacKageInfo?PKG_ID=" + pkgID)
    .then((response) => response.json())
    .then((data) => {
      const packageInfo = data[0];
       const pkgNameElement = document.getElementById("pkgname");
      const pkgDescElement = document.getElementById("pkgdesc");
      const infDescElement = document.getElementById("infdesc");

      if (packageInfo) {
         pkgNameElement.innerHTML = packageInfo.packageName;
        pkgDescElement.innerHTML = packageInfo.pkG_DESCRIPTION;
        infDescElement.innerHTML = packageInfo.inF_DESCRIPTION;
      } else {
        console.error("Package info not available.");
      }
      fetchAgencyDetails();
      return fetchPackageItinerary();
    })
    .catch((error) => console.error("Error fetching package info:", error));
}

async function fetchPackageItinerary() {
  const itineraryContainer = document.querySelector(".itinerary");
  itineraryContainer.innerHTML = ""; 

  

  return fetch(mainurl + "PacKageItieneary?PKG_ID=" + pkgID)
    .then((response) => response.json())
    .then((data) => {
      data.forEach((itinerary, index) => {
        const day = document.createElement("div");
        day.classList.add("day");

        const itineraryItem = document.createElement("div");
        itineraryItem.classList.add("itinerary-item");

        const badge = document.createElement("span");
        badge.classList.add("itinerary-badge");
        const icon = document.createElement("span");
        icon.setAttribute("uk-icon", "check");
        badge.appendChild(icon);
        itineraryItem.appendChild(badge);

        const arrivalImage = document.createElement("img");
        arrivalImage.src = "images/calender.png";
        arrivalImage.alt = "Arrival Image";
        arrivalImage.classList.add("itinerary-image");
        arrivalImage.style.height = "40px";
        arrivalImage.style.width = "40px";
        itineraryItem.appendChild(arrivalImage);

        const itineraryDetails = document.createElement("div");
        itineraryDetails.classList.add("itinerary-details");

        const flexContainer = document.createElement("div");
        flexContainer.classList.add("flex-container");

        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-container");

        const dateImage = document.createElement("img");
        dateImage.src = "images/date-arrow.png";
        dateImage.alt = "Image";
        dateImage.style.width = "200px";
        imageContainer.appendChild(dateImage);

        const imageContent = document.createElement("div");
        imageContent.style.textAlign = 'center';
        imageContent.classList.add("image-content");
        imageContent.style.width = '100%';

        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + index);
        const formattedDate = currentDate.toLocaleDateString("en-US", {
          day: "numeric",
            month: "short",
            year: "numeric",
        });
        imageContent.textContent = formattedDate;

        if(index == 0){
          document.getElementById('tour-date-table').textContent = formattedDate;
          pdf_filename = "pratap";
        }

        imageContainer.appendChild(imageContent);
        flexContainer.appendChild(imageContainer);

        const titleBox = document.createElement("div");
        titleBox.classList.add("title-box");
        titleBox.textContent = itinerary.pkG_ITI_TITLE;
        flexContainer.appendChild(titleBox);

        itineraryDetails.appendChild(flexContainer);
        itineraryItem.appendChild(itineraryDetails);
        day.appendChild(itineraryItem);

        const tripDetails = document.createElement("div");
        tripDetails.classList.add("trip-details");

        const timeline = document.createElement("div");
        timeline.classList.add("timeline");
        const circle = document.createElement("div");
        circle.classList.add("circle");
        timeline.appendChild(circle);
        tripDetails.appendChild(timeline);

        const borderBox = document.createElement("div");
        borderBox.classList.add("border-box");
        const tripDescription = document.createElement("div");
        tripDescription.innerHTML = itinerary.pkG_ITI_DESC;
        borderBox.appendChild(tripDescription);
        tripDetails.appendChild(borderBox);

        const overnightLine = document.createElement("div");
        overnightLine.classList.add("timeline");
        const overnightCircle = document.createElement("div");
        overnightCircle.classList.add("circle");
        overnightLine.appendChild(overnightCircle);
        tripDetails.appendChild(overnightLine);

       

        day.appendChild(tripDetails);
        itineraryContainer.appendChild(day);
      });
    })
    .catch((error) => console.error("Error fetching package itinerary:", error));
}

async function fetchAndUpdateInclusionsExclusions() {
    try {
        const inclusionExclusionApiUrl =  mainurl + `PacKageInclusionAndExclusion?PKG_ID=${pkgID}`;
        const inclusionExclusionResponse = await fetch(inclusionExclusionApiUrl);
        const inclusionExclusionData = await inclusionExclusionResponse.json();
        
        if (Array.isArray(inclusionExclusionData) && inclusionExclusionData.length > 0) {
            const inclusionList = document.querySelector('.inclusion-list');
            const exclusionList = document.querySelector('.exclusion-list');

            inclusionList.innerHTML = ''; 
            exclusionList.innerHTML = ''; 

            inclusionExclusionData.forEach(item => {
                const listItems = item.inC_DETAILS
                    .split('<p>')
                    .filter(p => p.trim() !== '')
                    .map(p => `<li>${p.replace(/<\/?[^>]+(>|$)/g, '').trim()}</li>`)
                    .join('');

                if (item.inC_TYPE === 'inclusion') {
                    inclusionList.insertAdjacentHTML('beforeend', listItems);
                } else if (item.inC_TYPE === 'exclusion') {
                    exclusionList.insertAdjacentHTML('beforeend', listItems);
                }
            });
        } else {
            console.error('No inclusion/exclusion data found or data format is invalid.');
        }
    } catch (error) {
        console.error('Error fetching and updating inclusions and exclusions:', error);
    }
}

async function fetchAndUpdateHotels() {
  try {
      const hotelApiUrl = `${mainurl}PacKageHotel?PKG_ID=${pkgID}`;
      const hotelResponse = await fetch(hotelApiUrl);
      const hotelData = await hotelResponse.json();

      const hotelListContainer = document.getElementById('hotel-list');
      hotelListContainer.innerHTML = ''; 

      if (Array.isArray(hotelData) && hotelData.length > 0) {
          hotelData.forEach(hotel => {
              const hotelHTML = `
                  <div class="container-custom" style="margin-top: 25px; border: 1px solid black; padding: 10px; position: relative;">
                      <div class="left-half">
                          <img src="${hotel.hotelImage}" alt="${hotel.htL_NAME}" style="width: 250px; height: -webkit-fill-available; object-fit: cover;">
                      </div>
                      <div class="right-half">
                          <h2>${hotel.htL_NAME}</h2>
                          <div class = "middal" style = "display : flex; justify-content: space-between; margin-bottom :10px;">
   <div class="stars">${'&#9733; '.repeat(hotel.htL_STAR)}</div>
                                                    <div class="date-box" style="color: royalblue; display: flex; justify-content: center; align-items: center;"><i class="ri-time-line"></i> ${hotel.nights} Nights</div>

                         
                          </div>
                        <div class="custom-box">
                              <p><i class="ri-map-pin-line"></i>${hotel.htL_ADDRESS}</p>
                          </div>
                          <p>${hotel.htL_DESCRIPTION}</p>
                      </div>
                  </div>`;
              hotelListContainer.insertAdjacentHTML('beforeend', hotelHTML);
          });
      } else {
          console.error('No hotel data found or data format is invalid.');
      }
  } catch (error) {
      console.error('Error fetching and updating hotels:', error);
  }
}

async function fetchPackageImgs() {
    return fetch(mainurl + "PackageImages?PKG_ID=" + pkgID)
      .then((response) => response.json())
      .then((data) => {
        const images = data.map(item => item.pkG_IMG_URl);
            const mainImage = document.getElementById('topmostimage');
            const thumbnailContainer = document.getElementById('thumbnail-container');

            if (images.length > 0) {
                mainImage.src = images[0];
            }

            images.forEach((image, index) => {
                const img = document.createElement('img');
                img.src = image;
                img.style.width = '150px';  
                img.style.height = '100px'; 
                img.style.margin = '5px';   
                img.style.cursor = 'pointer';
                img.dataset.index = index;
                img.addEventListener('click', () => {
                    mainImage.src = image;
                });
                thumbnailContainer.appendChild(img);
            });
      })
      .catch((error) => console.error("Error fetching package info:", error));
}

async function fetchAndDisplayQRCode() {
  const apiUrl =  mainurl2 + 'GenrateQr';
  const agentId = agentID;
  const emailId = sessionStorage.getItem('emailid');
  const selected = sessionStorage.getItem('selectedDate');
  const packageId = pkgID;
  const amount = '1111';
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


fetchAndUpdateHotels();
fetchAndUpdateInclusionsExclusions();
fetchPackageInfo();
fetchPackageItinerary();
fetchPackageImgs();
fetchAndDisplayQRCode();
fetchpackagerates();

document.getElementById("download-pdf").addEventListener("click", function () {
  window.scrollTo(0, 0);
  document.getElementById("price-btn-dis").style.display = 'none';

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