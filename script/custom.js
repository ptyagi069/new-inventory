// API endpoints
const API_BASE_URL = "https://mobileapi.cultureholidays.com/api/";
const PACKAGE_API_URL = "https://pdfi.cultureholidays.com/inv/getfilteredpackages";

// State management
let currentPage = 1;
let selectedDestination = "";
let selectedActivities = new Set();
let selectedNights = "";
let allActivities = new Set();

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    populateDestinations();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    document.getElementById('destination').addEventListener('change', handleDestinationChange);
    document.getElementById('nights').addEventListener('input', debounce(handleNightsChange, 500));
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    document.getElementById('applyFilters').addEventListener('click', handleSearch);
    document.getElementById('loadMore').addEventListener('click', handleLoadMore);
}

// Destination handling
async function populateDestinations() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}Holidays/Countrylist`);
        const destinations = await response.json();

        const destinationSelect = document.getElementById('destination');
        destinationSelect.innerHTML = '<option value="">Select destination</option>';

        destinations.forEach(dest => {
            const option = document.createElement('option');
            option.value = dest.countryCode;
            option.textContent = dest.countryName;
            destinationSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching destinations:', error);
        showError('Failed to load destinations');
    } finally {
        showLoading(false);
    }
}

async function handleDestinationChange(e) {
    selectedDestination = e.target.value;
    if (selectedDestination) {
        currentPage = 1;
        await fetchInitialPackageData();
    }
}

// Filter handling
async function fetchInitialPackageData() {
    try {
        showLoading(true);
        const response = await fetchPackages(selectedDestination, 1);
        if (response.data && response.data[0]) {
            populateActivitiesFilter(response.data[0]);
            await handleSearch();
        }
    } catch (error) {
        console.error('Error fetching initial package data:', error);
        showError('Failed to load filter options');
    } finally {
        showLoading(false);
    }
}

function populateActivitiesFilter(packageData) {
    const activities = parseJsonString(packageData.TopActivities) || [];
    const activitiesList = document.getElementById('activitiesList');
    activitiesList.innerHTML = '';

    activities.forEach(activity => {
        allActivities.add(activity.Activity);

        const checkbox = document.createElement('div');
        checkbox.className = 'activity-item';
        checkbox.innerHTML = `
            <label class="flex items-center">
                <input type="checkbox"
                       class="activity-checkbox"
                       value="${activity.Activity}"
                       ${selectedActivities.has(activity.Activity) ? 'checked' : ''}>
                <span>${activity.Activity}</span>
            </label>
        `;

        checkbox.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedActivities.add(activity.Activity);
            } else {
                selectedActivities.delete(activity.Activity);
            }
            updateActiveFilters();
        });

        activitiesList.appendChild(checkbox);
    });
}

function handleNightsChange(e) {
    selectedNights = e.target.value;
    updateActiveFilters();
}

function clearFilters() {
    document.getElementById('nights').value = '';
    selectedNights = '';
    selectedActivities.clear();
    document.querySelectorAll('.activity-checkbox').forEach(cb => {
        cb.checked = false;
    });
    updateActiveFilters();
    handleSearch();
}

// Search and display
async function handleSearch() {
    currentPage = 1;
    await fetchAndDisplayPackages();
}

async function fetchAndDisplayPackages(append = false) {
    if (!selectedDestination) return;

    try {
        showLoading(true);
        const response = await fetchPackages(selectedDestination, currentPage);
        displayPackages(response.data, append);
        updateResultsCount(response.data.length);
    } catch (error) {
        console.error('Error fetching packages:', error);
        showError('Failed to load packages');
    } finally {
        showLoading(false);
    }
}

async function fetchPackages(countryCode, page) {
    const response = await fetch(PACKAGE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            region: "",
            country: countryCode,
            userid: "ALL",
            type: "Country",
            pkg_category_id: "",
            nights: selectedNights,
            pagenumber: page,
            pagesize: 0
        })
    });

    return await response.json();
}

function displayPackages(packages, append = false) {
    const container = document.getElementById('packagesContainer');

    if (!append) {
        container.innerHTML = '';
    }

    const filteredPackages = filterPackagesByActivities(packages);

    filteredPackages.forEach(package => {
        const activities = parseJsonString(package.TopActivities) || [];

        const packageCard = document.createElement('div');
        packageCard.className = 'package-card';
        packageCard.innerHTML = `
            <h3>${package.PackageName}</h3>
            <p>${package.Description}</p>
            <p>Nights: ${package.Nights}</p>
            <p>Price: ${package.Price}</p>
            <div class="activities">
                ${activities.map(activity => `<span>${activity.Activity}</span>`).join('')}
            </div>
        `;

        container.appendChild(packageCard);
    });

    document.getElementById('loadMore').classList.toggle('hidden', filteredPackages.length < 10);
}

function filterPackagesByActivities(packages) {
    if (selectedActivities.size === 0) return packages;

    return packages.filter(pkg => {
        const activities = parseJsonString(pkg.TopActivities) || [];
        return activities.some(activity => selectedActivities.has(activity.Activity));
    });
}

function updateResultsCount(count) {
    document.getElementById('resultsCount').textContent = `Showing ${count} packages`;
}

function updateActiveFilters() {
    const activeFilters = document.getElementById('activeFilters');
    activeFilters.innerHTML = '';

    if (selectedNights) {
        const nightsFilter = document.createElement('span');
        nightsFilter.textContent = `Nights: ${selectedNights}`;
        activeFilters.appendChild(nightsFilter);
    }

    selectedActivities.forEach(activity => {
        const activityFilter = document.createElement('span');
        activityFilter.textContent = `Activity: ${activity}`;
        activeFilters.appendChild(activityFilter);
    });
}

function showLoading(isLoading) {
    const loadingState = document.getElementById('loadingState');
    loadingState.classList.toggle('hidden', !isLoading);
}

function showError(message) {
    alert(message);
}

function parseJsonString(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON string:', error);
        return null;
    }
}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

async function handleLoadMore() {
    currentPage++;
    await fetchAndDisplayPackages(true);
}