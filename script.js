        async function fetchData() {
            const response = await fetch('https://devapi.cultureholidays.com/GetCountry');
            const data = await response.json();
            return data;
        }

        async function populateButtons() {
            const data = await fetchData();
            const regionNames = [...new Set(data.map(country => country.regionName))];
            const regionButtonsContainer = document.getElementById('regionButtons');
            regionNames.forEach(regionName => {
                const button = document.createElement('button');
                button.classList.add('button');
                button.textContent = regionName;
                button.addEventListener('click', () => {
                    document.querySelectorAll('#regionButtons .button').forEach(btn => btn.classList.remove('selected'));
                    button.classList.add('selected');
                    displayCountries(regionName, data);
                    resetDisplay();
                });
                regionButtonsContainer.appendChild(button);
            });
        }

        async function displayCountries(regionName, data) {
            const countries = data.filter(country => country.regionName === regionName);
            const countryButtonsContainer = document.getElementById('countryButtons');
            countryButtonsContainer.innerHTML = ''; // Clear previous country buttons

            countries.forEach((country, index) => {
                const button = document.createElement('button');
                button.classList.add('button');
                button.textContent = country.countryName;
                button.setAttribute('data-country-code', country.countryCode);
                button.addEventListener('click', () => {
                    document.querySelectorAll('#countryButtons .button').forEach(btn => btn.classList.remove('selected'));
                    button.classList.add('selected');
                    fetchPackages(country.countryCode);
                    resetDisplay();
                });
                countryButtonsContainer.appendChild(button);

                // Automatically click the first country button
                if (index === 0) {
                    button.click();
                }
            });
        }

        async function fetchPackages(countryCode) {
            const response = await fetch(`https://devapi.cultureholidays.com/GetPackageUsingCountry?CountryCode=${countryCode}`);
            const packages = await response.json();
            displayPackages(packages);
        }

        function displayPackages(packages) {
            const packageButtonsContainer = document.getElementById('packageButtons');
            packageButtonsContainer.innerHTML = ''; // Clear previous package buttons

            const uniqueDays = [...new Set(packages.map(pkg => pkg.pkG_NOOFDAY))].sort((a, b) => a - b);

            uniqueDays.forEach((day, index) => {
                const button = document.createElement('button');
                button.classList.add('button');
                button.textContent = `${day} Days`;
                button.addEventListener('click', () => {
                    document.querySelectorAll('#packageButtons .button').forEach(btn => btn.classList.remove('selected'));
                    button.classList.add('selected');
                    displayFilteredPackages(packages, day);
                    resetDisplay();
                });
                packageButtonsContainer.appendChild(button);

                // Automatically click the first unique day button
                if (index === 0) {
                    button.click();
                }
            });
        }

        function displayFilteredPackages(packages, filterDay) {
            const filteredPackagesContainer = document.getElementById('filteredPackages');
            const packageDetailsContainer = document.getElementById('packageDetails');
            filteredPackagesContainer.innerHTML = ''; // Clear previous filtered packages
            // filteredPackagesContainer.style.display = 'block'; // Ensure it is visible
            //packageDetailsContainer.style.display = 'none'; // Hide details container

            const filteredPackages = filterDay ? packages.filter(pkg => pkg.pkG_NOOFDAY === filterDay) : packages;

            filteredPackages.forEach(pkg => {
                const div = document.createElement('div');
                div.classList.add('package');
                div.innerHTML = `
                    <h4>${pkg.pkG_TITLE}</h4>
                    <p>Category: ${pkg.pkG_CATEGORY_NAME}</p>
                    <p>Price: ${pkg.pkG_OFFERPRICE}</p>
                `;
                div.addEventListener('click', () => {
                    localStorage.setItem('selectedPackageID', pkg.pkG_ID);
                    displayPackageDetails(pkg.pkG_ID, pkg.pkG_TITLE);

                });
                filteredPackagesContainer.appendChild(div);
            });
        }

        async function displayPackageDetails(pkg_ID, pkg_TITLE) {
    const response = await fetch(`https://devapi.cultureholidays.com/GetPKGInfo?PKG_ID=${pkg_ID}`);
    const packageInfo = await response.json();

    const packageDetailsContainer = document.getElementById('packageDetails');
    const filteredPackagesContainer = document.getElementById('filteredPackages');

    if (packageInfo.length > 0) {
        const pkg = packageInfo[0];
        packageDetailsContainer.innerHTML = `
            <h3>${pkg_TITLE}</h3>
            <div>${pkg.inF_DESCRIPTION}</div>
        `;
        filteredPackagesContainer.style.display = 'none';
        packageDetailsContainer.style.display = 'block';
        await displayitineraryitems(pkg_ID);
        await displayHotelDetails(pkg_ID); // Add this line to display hotel details
    }
}

        async function displayitineraryitems(pkg_ID) {
            const response = await fetch(`https://devapi.cultureholidays.com/GetPKGItinerary?PKG_ID=${pkg_ID}`);
            const itineraryitems = await response.json();
            fetchInclusionsExclusions(pkg_ID);
            fetchHotelData(pkg_ID);
            // Sort itinerary items based on pkG_ITI_DAY
            itineraryitems.sort((a, b) => a.pkG_ITI_DAY - b.pkG_ITI_DAY);

            const accordionContainer = document.getElementById('accordionContainer');
            accordionContainer.innerHTML = ''; // Clear previous items

            itineraryitems.forEach(item => {
                const accordionItem = document.createElement('div');
                accordionItem.classList.add('accordion-item');

                const heading = document.createElement('div');
                heading.classList.add('accordion-header');
                heading.textContent = `Day ${item.pkG_ITI_DAY} - ${item.pkG_ITI_TITLE}`;
                heading.addEventListener('click', () => {
                    const isActive = accordionBody.classList.contains('show');
                    accordionBody.classList.toggle('show', !isActive);
                });

                const accordionBody = document.createElement('div');
                accordionBody.classList.add('accordion-body');
                accordionBody.innerHTML = item.pkG_ITI_DESC;

                accordionItem.appendChild(heading);
                accordionItem.appendChild(accordionBody);

                accordionContainer.appendChild(accordionItem);
            });
        }
        
        async function fetchInclusionsExclusions(pkg_ID) {
            const response = await fetch(`https://devapi.cultureholidays.com/GetPKGIncExc?PKG_ID=${pkg_ID}`);
            const data = await response.json();
        
            const inclusionsContainer = document.getElementById('inclusionsDetails');
            const exclusionsContainer = document.getElementById('exclusionsDetails');
        
            // Clear previous items
            inclusionsContainer.innerHTML = '';
            exclusionsContainer.innerHTML = '';
        
            data.forEach(item => {
                const details = `<p>${item.inC_DETAILS}</p>`;
        
                if (item.inC_TYPE === 'inclusion') {
                    inclusionsContainer.insertAdjacentHTML('beforeend', details);
                } else {
                    exclusionsContainer.insertAdjacentHTML('beforeend', details);
                }
            });
        }
        

        const inclusionsButton = document.getElementById('inclusionsButton');
        const exclusionsButton = document.getElementById('exclusionsButton');

        inclusionsButton.addEventListener('click', () => {
            inclusionsButton.classList.add('active');
            exclusionsButton.classList.remove('active');
            document.getElementById('inclusionsDetails').classList.add('active');
            document.getElementById('exclusionsDetails').classList.remove('active');
        });

        exclusionsButton.addEventListener('click', () => {
            exclusionsButton.classList.add('active');
            inclusionsButton.classList.remove('active');
            document.getElementById('exclusionsDetails').classList.add('active');
            document.getElementById('inclusionsDetails').classList.remove('active');
        });
       
        async function fetchHotelData(pkg_ID) {
            const response = await fetch(`https://devapi.cultureholidays.com/GetPKGHotel?PKG_ID=${pkg_ID}`);
            const data = await response.json();
            console.log(data);
            return data;
        }

        async function displayHotelDetails(pkg_ID) {
            const hotelData = await fetchHotelData(pkg_ID);
            const hotelDetailsContainer = document.querySelector('.hotel-details');

            hotelDetailsContainer.innerHTML = ''; // Clear previous hotel details

            hotelData.forEach(hotel => {
                const hotelDiv = document.createElement('div');
                hotelDiv.classList.add('hotel');
                hotelDiv.style.display = 'inline-block';
                hotelDiv.style.width = '400px';

                const starCount = '<i class="ri-star-fill"></i>'.repeat(hotel.htL_STAR); 

                hotelDiv.innerHTML = `
                    <h3>${hotel.htL_NAME}</h3>
                    <p>City: ${hotel.htL_CITY_NAME}</p>
                    <p>Stars: ${starCount}</p>
                    <p>Nights: ${hotel.nights}</p>
                `;

                hotelDetailsContainer.appendChild(hotelDiv);
            });
        }

        function resetDisplay() {
            document.getElementById('filteredPackages').style.display = 'block';
            document.getElementById('pkginfo').style.display = 'none';
        }
        document.getElementById('downloadItineraryButton').addEventListener('click', () => {
            // Open the new HTML page in a new tab
            window.open('../pages/itinerary.html', '_blank');
        });
        

        populateButtons();
