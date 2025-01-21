document.addEventListener('DOMContentLoaded', function() {
    const input = document.querySelector('.agent-input');
    const verifyBtn = document.querySelector('.verify-btn');
    const statusDiv = document.querySelector('.agent-verification-status');
    const searchInput = document.querySelector('.search-input');
    const suggestionsContainer = document.querySelector('.suggestions-container');
    const continueBtn = document.querySelector('.continue-btn');
    const durationInput = document.querySelector('.duration-input');
    const durationList = document.querySelector('.duration-list');
    const loader = document.querySelector('.loader');
    const errorMessage = document.querySelector('.error-message');

    let countries = [];
    let verifiedAgentId = '';
    let selectedCountryCode = '';

    function validateAgentId(id) {
        return /^chagt\d{9}$/.test(id);
    }

    function showStatus(message, isSuccess) {
        statusDiv.textContent = message;
        statusDiv.className = 'agent-verification-status ' + (isSuccess ? 'success' : 'error');
    }

    function getCountryCode(countryName) {
        const country = countries.find(c => c.countryName === countryName);
        return country ? country.countryCode.toLowerCase() : '';
    }

    async function fetchDurations(countryCode, agentId) {
        loader.style.display = 'block';
        errorMessage.style.display = 'none';
        durationList.innerHTML = '';
        
        try {
            const response = await fetch(`https://mobileapi.cultureholidays.com/api/Account/PackageDetailsbyCountryCode?CountryCode=${countryCode}&AgentID=${agentId}`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                data.forEach(package => {
                    const div = document.createElement('div');
                    div.className = 'duration-item';
                    div.textContent = `${package.nights} Nights`;
                    div.addEventListener('click', () => {
                        durationInput.value = `${package.nights} Nights`;
                        durationList.style.display = 'none';
                    });
                    durationList.appendChild(div);
                });
            } else {
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching durations:', error);
            errorMessage.style.display = 'block';
        } finally {
            loader.style.display = 'none';
        }
    }

    async function fetchDestinations() {
        try {
            const response = await fetch('https://mobileapi.cultureholidays.com/api/Holidays/Countrylist');
            const data = await response.json();
            countries = data.sort((a, b) => a.countryName.localeCompare(b.countryName));
        } catch (error) {
            console.error('Error fetching destinations:', error);
            countries = [];
        }
    }

    function filterCountries(searchText) {
        return countries.filter(country => 
            country.countryName.toLowerCase().includes(searchText.toLowerCase())
        );
    }

    function showSuggestions(filteredCountries) {
        suggestionsContainer.innerHTML = '';
        filteredCountries.forEach(country => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = country.countryName;
            div.addEventListener('click', () => {
                searchInput.value = country.countryName;
                selectedCountryCode = country.countryCode.toLowerCase();
                suggestionsContainer.style.display = 'none';
                
                if (verifiedAgentId) {
                    fetchDurations(selectedCountryCode, verifiedAgentId);
                }
            });
            suggestionsContainer.appendChild(div);
        });
        suggestionsContainer.style.display = filteredCountries.length ? 'block' : 'none';
    }

    verifyBtn.addEventListener('click', async function() {
        const agentId = input.value.trim();
    
        if (!agentId) {
            showStatus('Please enter an agent ID', false);
            return;
        }
    
        if (!validateAgentId(agentId)) {
            showStatus('Invalid agent ID format. Must start with "chagt" followed by 9 digits', false);
            return;
        }
    
        try {
            const response = await fetch(`https://mobileapi.cultureholidays.com/api/Holidays/HolidaysAgencyDetails?AgentID=${agentId}`);
            
          
            const data = await response.json();
            console.log('API Response:', data);  
    
            if (response.ok) {
                verifiedAgentId = agentId;
                showStatus('Agent verified successfully!', true);
    
                if (selectedCountryCode) {
                    fetchDurations(selectedCountryCode, verifiedAgentId);
                }
            } else {
               
                console.log('Error Response:', data);
                showStatus('Failed to verify agent. Please try again.', false);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            showStatus('Error connecting to server. Please try again later.', false);
        }
    });
    

    searchInput.addEventListener('input', (e) => {
        const searchText = e.target.value.trim();
        if (searchText) {
            const filteredCountries = filterCountries(searchText);
            showSuggestions(filteredCountries);
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim()) {
            const filteredCountries = filterCountries(searchInput.value.trim());
            showSuggestions(filteredCountries);
        }
    });

    durationInput.addEventListener('focus', () => {
        if (verifiedAgentId && selectedCountryCode) {
            durationList.style.display = 'block';
        }
    });

    document.addEventListener('click', (e) => {
        if (!suggestionsContainer.contains(e.target) && e.target !== searchInput) {
            suggestionsContainer.style.display = 'none';
        }
        if (!durationList.contains(e.target) && e.target !== durationInput) {
            durationList.style.display = 'none';
        }
    });

    // Initialize by fetching destinations
    fetchDestinations();
});