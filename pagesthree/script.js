const mainurl = "https://mobileapi.cultureholidays.com/api/Holidays/";
const mainurl2 = "https://mobileapi.cultureholidays.com/api/Account/";
var lastday = 0;
var temp_pkg_name = '';
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

var itineraryID = getUrlParameter('itineraryID');
var agentIds = getUrlParameter('agentID');
var rateAvialDate = getUrlParameter('rateAvialDate');
console.log(rateAvialDate);
var pkgID = itineraryID;
var sess = rateAvialDate;

async function fetchPackageInfo() {
    try {
        const response = await fetch(mainurl + 'PacKageInfo?PKG_ID=' + pkgID);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const packageInfo = data[0];
   
            document.getElementById('pkgname').textContent = packageInfo.packageName;
            temp_pkg_name = packageInfo.packageName
            pkgnam = packageInfo.packageName;
            document.getElementById('tripdesc').innerHTML = packageInfo.inF_DESCRIPTION;
            document.getElementById('pkgdesc').innerHTML = packageInfo.pkG_DESCRIPTION;
        } else {
            console.error('No package info found in the response');
        }
    } catch (error) {
        console.error('Error fetching package info:', error);
    }
}

async function fetchItinerary() {
  try {
    const response = await fetch(mainurl + 'PacKageItieneary?PKG_ID=' + pkgID);
    const data = await response.json();
    const itineraryContainer = document.getElementById('itinerary-container');
    const maxDay = Math.max(...data.map(item => parseInt(item.pkG_ITI_DAY)));
    lastday = maxDay;
    document.getElementById('nightssss').innerHTML = ` ${maxDay} NIGHTS`;
    document.getElementById('dayssss').innerHTML = ` ${maxDay + 1} DAYS`;

    data.forEach(item => {
      const itineraryDiv = document.createElement('div');
      itineraryDiv.classList.add('iti');
      itineraryDiv.style.cssText = 'padding-top: 20px; display: flex; justify-content: space-between;';

      const leftDiv = document.createElement('div');
      leftDiv.classList.add('lefti');
      leftDiv.style.cssText = 'width: 500px; border-radius: 10px; height: 300px; object-fit: cover; background-repeat: no-repeat; position: relative;';
      const imageUrl = item.pkG_ITIENRARY_IMAGE !== "Not Available" ? item.pkG_ITIENRARY_IMAGE : '';
      leftDiv.style.backgroundImage = `url('${imageUrl}')`;

      // Add Day number on the image
      const dayNumber = document.createElement('div');
      dayNumber.style.cssText = 'position: absolute; top: 10px; right: -10px; background-color: rgb(255, 187, 0); padding: 10px 20px; border-radius: 2px;';
      dayNumber.innerText = `Day- ${item.pkG_ITI_DAY}`;
      leftDiv.appendChild(dayNumber);

      const rightDiv = document.createElement('div');
      rightDiv.classList.add('righti');
      rightDiv.style.cssText = 'width: 70%; padding-left: 15px;';

      const title = document.createElement('h1');
      title.style.fontWeight = 'normal';
      title.innerText = `${item.pkG_ITI_TITLE}`;

      const description = document.createElement('p');
      description.innerHTML = item.pkG_ITI_DESC;

      rightDiv.appendChild(title);
      rightDiv.appendChild(description);
      itineraryDiv.appendChild(leftDiv);
      itineraryDiv.appendChild(rightDiv);

      itineraryContainer.appendChild(itineraryDiv);
    });
  } catch (error) {
    console.error('Error fetching the API data:', error);
  }
}

async function fetchincexc(){
  fetch( mainurl+'PacKageInclusionAndExclusion?PKG_ID=' + pkgID)
    .then(response => response.json())
    .then(data => {
        const inclusionsContent = document.getElementById('inclusions-content');
        const exclusionsContent = document.getElementById('exclusions-content');

        data.forEach(item => {
            if (item.inC_TYPE === 'inclusion') {
                inclusionsContent.innerHTML = item.inC_DETAILS;
            } else if (item.inC_TYPE === 'exclusion') {
                exclusionsContent.innerHTML = item.inC_DETAILS;
            }
        });
    })
    .catch(error => console.error('Error fetching inclusion/exclusion data:', error));
}

async function hotelsusu(){
  fetch(mainurl+"PacKageHotel?PKG_ID="+pkgID)
  .then(response => response.json())
  .then(data => {
    const hotelsContainer = document.getElementById("hotels-container");
    
    data.forEach(hotel => {
      // Create a div for each hotel
      const hotelDiv = document.createElement("div");
      hotelDiv.classList.add("htl-cnt");
      hotelDiv.style.marginBottom = "20px";

      hotelDiv.innerHTML = `
        <div class="hotels-content-three" style="display: flex; padding-bottom: 5px; padding-right: 10px; padding-top: 5px;">
        <div class="left-hotel-image" style="width: 40%; height: 300px; object-fit: cover; background-repeat: no-repeat; background-image: url('${hotel.hotelImage}'); background-size: cover; border-radius: 10px"></div>
        <div class="right-hotel-content" style="width: 70%; margin-left: 15px; display:flex; flex-direction:column; justify-content: flex-end; padding-bottom:50px;">
            <h2 style="font-weight: bold; font-size: 20px; color:#333;">${hotel.htL_NAME}</h2>
            <div class="stars" style="display:flex; align-items: center; gap:40px;">
                <div>
                 
                ${'<i class="ri-star-fill" style="color: rgb(255, 230, 0); ">  &nbsp;</i>'.repeat(hotel.htL_STAR)}
                </div>
                 &nbsp;
                 <p  style= " color:#33"> ( ${hotel.nights} Nights )</p>
              </div>
            <div class="stats" style="display: flex; justify-content: space-between; margin-top: 10px;">
              
               <p style="color: #474646;">${hotel.htL_ADDRESS}</p>
              
            </div>
           
          </div>
        </div>
        
      `;

      hotelsContainer.appendChild(hotelDiv);
    });
  })
  .catch(error => console.error('Error fetching hotel data:', error));
}

async function fetchAndDisplayQRCode() {
  const apiUrl =  mainurl2 + 'GenrateQr';
  const agentId = sessionStorage.getItem('agentID');
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

async function fetchimgs() {
  try {
    const response = await fetch(mainurl + "PackageImages?PKG_ID=" + pkgID);
    const images = await response.json();
    const thumbnailsContainer = document.getElementById("thumbnailsContainer1");
    let selectedImageElement = null;

    images.forEach((image, index) => {
      const imgElement = document.createElement("img");
      const imgUrl = image.pkG_IMG_URl;
      
      imgElement.src = imgUrl;
      imgElement.style.width = "200px";
      imgElement.style.height = "100px";
      imgElement.style.margin = "10px";
      imgElement.style.cursor = "pointer";
      imgElement.style.objectFit = "cover";

      imgElement.addEventListener("click", () => {
        if (selectedImageElement) {
          selectedImageElement.classList.remove("selected-img");
        }
        imgElement.classList.add("selected-img");
        selectedImageElement = imgElement;

        document.querySelector(".top-most-image").style.backgroundImage = `url('${imgUrl}')`;
        
        // Set the second image (if available)
        if (images[1]) {
          document.getElementById("second-img").style.backgroundImage = `url('${images[1].pkG_IMG_URl}')`;
        }
      });

      thumbnailsContainer.appendChild(imgElement);
    });

    // Set initial images
    if (images.length > 0) {
      const firstImageUrl = images[0].pkG_IMG_URl;
      document.querySelector(".top-most-image").style.backgroundImage = `url('${firstImageUrl}')`;
      
      if (images[1]) {
        const secondImageUrl = images[1].pkG_IMG_URl;
        document.getElementById("second-img").style.backgroundImage = `url('${secondImageUrl}')`;
      }
      
      const firstImageElement = thumbnailsContainer.firstChild;
      firstImageElement.classList.add("selected-img");
      selectedImageElement = firstImageElement;
    }
  } catch (error) {
    console.error('Error fetching package images:', error);
  }
}

async function fetchpackagerates() {
  try {
    const response = await fetch( mainurl + `PacKageRate?PKG_ID=${pkgID}&AgentID=${agentIds}&tourdate=${encodeURIComponent(sess)}`);
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

window.addEventListener('load', async () => {
  
    await fetchPackageInfo();
    await fetchItinerary();
    await fetchincexc();
    await hotelsusu();
    await fetchimgs();  
    await fetchpackagerates();
    await fetchAndDisplayQRCode();
    await fetchAgencyDetails();
});


async function fetchAgencyDetails() {
  const apiUrl = mainurl2 + 'GetAgencyProfileDetails?AgentID=' + agentIds;
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    
     companyLogo = data.companyLogo || '';
     whatsappContact = data.whatsappNumber || '';
     emailID = data.emailid || '';
      document.getElementById('phone-stg').innerHTML = whatsappContact;
      document.getElementById('email-stg').innerHTML = emailID;


  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

const [day, month, year] = sess.split('/');
      
const startDate = new Date(year, month - 1, day); 


const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formattedStartDate = formatDate(startDate);
document.getElementById('tour-date-table').innerHTML = formattedStartDate;

const filepdfname = `${formattedStartDate}_${temp_pkg_name}`;
document.getElementById('det').innerHTML = formattedStartDate;


document.getElementById("download-pdf").addEventListener("click", function () {
  window.scrollTo(0, 0);
 
  var options = {
      filename: filepdfname,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, logging: true, useCORS: true },
      jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
      pagebreak: { mode: 'avoid-all' , avoid: 'cstbl' },
      margin: [0,2,0,0],
  };

  var element = document.getElementById("bomss");
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



  

