// Crop Rotation Planner JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables
    let currentYear = 1;
    let yearCount = 4; // Default 4 years
    const cropGroups = {
        'legumes': ['peas', 'beans', 'lentils'],
        'root': ['potatoes', 'carrots', 'beets'],
        'leafy': ['lettuce', 'spinach', 'kale'],
        'fruit': ['tomatoes', 'peppers', 'strawberries'],
        'grains': ['wheat', 'corn', 'rice']
    };
    
    // Compatibility matrix (simplified for demo)
    const cropCompatibility = {
        'legumes': {
            'after': ['fruit', 'leafy'],
            'before': ['root', 'fruit'],
            'nutrients': { 'nitrogen': 5, 'phosphorus': 2, 'potassium': 3 }
        },
        'root': {
            'after': ['legumes', 'leafy'],
            'before': ['leafy', 'fruit'],
            'nutrients': { 'nitrogen': 2, 'phosphorus': 4, 'potassium': 5 }
        },
        'leafy': {
            'after': ['root', 'legumes'],
            'before': ['legumes', 'fruit'],
            'nutrients': { 'nitrogen': 4, 'phosphorus': 3, 'potassium': 4 }
        },
        'fruit': {
            'after': ['legumes', 'root'],
            'before': ['leafy', 'grains'],
            'nutrients': { 'nitrogen': 3, 'phosphorus': 5, 'potassium': 4 }
        },
        'grains': {
            'after': ['legumes', 'root'],
            'before': ['legumes', 'root'],
            'nutrients': { 'nitrogen': 3, 'phosphorus': 3, 'potassium': 2 }
        }
    };
    
    // Get crop type from crop name
    const getCropType = (cropName) => {
        for (const [type, crops] of Object.entries(cropGroups)) {
            if (crops.includes(cropName)) {
                return type;
            }
        }
        return null;
    };
    
    // DOM Elements
    const addYearBtn = document.getElementById('add-year');
    const rotationYears = document.querySelector('.rotation-years');
    const yearTabs = document.querySelectorAll('.year-tab');
    const saveBtn = document.getElementById('save-plan');
    const printBtn = document.getElementById('print-plan');
    const exportBtn = document.getElementById('export-plan');
    const clearBtn = document.getElementById('clear-plan');
    const addFieldBtn = document.getElementById('add-field');
    
    // Add year button event listener
    addYearBtn.addEventListener('click', () => {
        yearCount++;
        
        // Create new year tab
        const newYearTab = document.createElement('button');
        newYearTab.className = 'year-tab';
        newYearTab.dataset.year = yearCount;
        newYearTab.textContent = `Year ${yearCount}`;
        
        // Insert before the add button
        rotationYears.insertBefore(newYearTab, addYearBtn);
        
        // Create season crops container for the new year
        const seasonContainer = document.querySelector('.season-planner');
        const yearCropsDiv = document.createElement('div');
        yearCropsDiv.className = 'season-crops';
        yearCropsDiv.id = `year-${yearCount}-crops`;
        yearCropsDiv.style.display = 'none'; // Hide initially
        
        // Create season slots
        const seasons = ['spring', 'summer', 'fall', 'winter'];
        seasons.forEach(season => {
            const seasonSlot = document.createElement('div');
            seasonSlot.className = `season-slot ${season}-slot`;
            seasonSlot.dataset.season = season;
            seasonSlot.dataset.year = yearCount;
            
            const cropSelector = document.createElement('div');
            cropSelector.className = 'crop-selector';
            
            const select = document.createElement('select');
            select.className = 'crop-select';
            select.innerHTML = `
                <option value="">Select Crop</option>
                <optgroup label="Legumes">
                    <option value="peas">Peas</option>
                    <option value="beans">Beans</option>
                    <option value="lentils">Lentils</option>
                </optgroup>
                <optgroup label="Root Vegetables">
                    <option value="potatoes">Potatoes</option>
                    <option value="carrots">Carrots</option>
                    <option value="beets">Beets</option>
                </optgroup>
                <optgroup label="Leafy Greens">
                    <option value="lettuce">Lettuce</option>
                    <option value="spinach">Spinach</option>
                    <option value="kale">Kale</option>
                </optgroup>
                <optgroup label="Grains">
                    <option value="wheat">Wheat</option>
                    <option value="corn">Corn</option>
                    <option value="rice">Rice</option>
                </optgroup>
                <optgroup label="Fruits">
                    <option value="tomatoes">Tomatoes</option>
                    <option value="peppers">Peppers</option>
                    <option value="strawberries">Strawberries</option>
                </optgroup>
            `;
            
            // Add event listener to crop select
            select.addEventListener('change', updateRecommendations);
            
            cropSelector.appendChild(select);
            seasonSlot.appendChild(cropSelector);
            yearCropsDiv.appendChild(seasonSlot);
        });
        
        seasonContainer.appendChild(yearCropsDiv);
        
        // Add event listener to the new year tab
        newYearTab.addEventListener('click', () => {
            switchYear(yearCount);
        });
    });
    
    // Year tab event listeners
    yearTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const year = parseInt(this.dataset.year);
            switchYear(year);
        });
    });
    
    // Switch between years
    function switchYear(year) {
        // Update active tab
        document.querySelectorAll('.year-tab').forEach(tab => {
            tab.classList.remove('active');
            if (parseInt(tab.dataset.year) === year) {
                tab.classList.add('active');
            }
        });
        
        // Hide all year crop divs
        document.querySelectorAll('.season-crops').forEach(div => {
            div.style.display = 'none';
        });
        
        // Show selected year
        const yearCrops = document.getElementById(`year-${year}-crops`);
        if (yearCrops) {
            yearCrops.style.display = 'grid';
        }
        
        currentYear = year;
    }
    
    // Add field button
    addFieldBtn.addEventListener('click', () => {
        const fieldName = document.getElementById('field-name').value.trim();
        const fieldSize = document.getElementById('field-size').value;
        const soilType = document.getElementById('soil-type').value;
        
        if (!fieldName || !fieldSize) {
            alert('Please enter field name and size.');
            return;
        }
        
        // Create a field object
        const field = {
            name: fieldName,
            size: parseFloat(fieldSize),
            soil: soilType,
            date: new Date()
        };
        
        // Store field info in local storage (temporary solution)
        const fields = JSON.parse(localStorage.getItem('crop_planner_fields') || '[]');
        fields.push(field);
        localStorage.setItem('crop_planner_fields', JSON.stringify(fields));
        
        // Clear form
        document.getElementById('field-name').value = '';
        document.getElementById('field-size').value = '';
        
        alert(`Field "${fieldName}" (${fieldSize} acres) added successfully!`);
    });
    
    // Add event listeners to all crop selects
    document.querySelectorAll('.crop-select').forEach(select => {
        select.addEventListener('change', updateRecommendations);
    });
    
    // Update recommendations based on selected crops
    function updateRecommendations() {
        const selectedCrops = [];
        
        // Get all selected crops
        document.querySelectorAll('.crop-select').forEach(select => {
            if (select.value) {
                const year = parseInt(select.closest('.season-slot').dataset.year);
                const season = select.closest('.season-slot').dataset.season;
                selectedCrops.push({
                    crop: select.value,
                    type: getCropType(select.value),
                    year: year,
                    season: season
                });
            }
        });
        
        // If no crops selected, hide recommendations
        if (selectedCrops.length === 0) {
            document.querySelector('.recommendation-placeholder').style.display = 'block';
            document.getElementById('recommendation-details').style.display = 'none';
            return;
        }
        
        // Show recommendation details
        document.querySelector('.recommendation-placeholder').style.display = 'none';
        document.getElementById('recommendation-details').style.display = 'block';
        
        // Calculate compatibility score
        let compatibilityScore = calculateCompatibilityScore(selectedCrops);
        
        // Update compatibility meter
        const scoreFill = document.querySelector('.score-fill');
        const scoreValue = document.querySelector('.score-value');
        scoreFill.style.width = `${compatibilityScore}%`;
        scoreValue.textContent = `${compatibilityScore}%`;
        
        // Update color based on score
        if (compatibilityScore < 50) {
            scoreFill.style.backgroundColor = 'var(--accent-red)';
            scoreValue.style.color = 'var(--accent-red)';
        } else if (compatibilityScore < 75) {
            scoreFill.style.backgroundColor = 'var(--accent-yellow)';
            scoreValue.style.color = 'var(--accent-yellow)';
        } else {
            scoreFill.style.backgroundColor = 'var(--accent-green)';
            scoreValue.style.color = 'var(--accent-green)';
        }
        
        // Generate suggestions
        const suggestions = generateSuggestions(selectedCrops);
        const suggestionsList = document.getElementById('suggestions-list');
        suggestionsList.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            suggestionsList.appendChild(li);
        });
        
        // Update nutrient chart
        updateNutrientChart(selectedCrops);
    }
    
    // Calculate compatibility score
    function calculateCompatibilityScore(crops) {
        if (crops.length <= 1) return 100; // Single crop is always 100% compatible
        
        let totalCompatibility = 0;
        let comparisons = 0;
        
        // Check crop rotation order
        for (let i = 0; i < crops.length; i++) {
            for (let j = 0; j < crops.length; j++) {
                if (i !== j) {
                    const crop1 = crops[i];
                    const crop2 = crops[j];
                    
                    // Check if crops are in sequential years or seasons
                    const isSequential = (crop1.year === crop2.year - 1) || 
                                        (crop1.year === crop2.year && 
                                        ['spring', 'summer', 'fall', 'winter'].indexOf(crop1.season) === 
                                        ['spring', 'summer', 'fall', 'winter'].indexOf(crop2.season) - 1);
                    
                    if (isSequential) {
                        // Check if crop2 is good to follow crop1
                        const compatibility = isGoodSuccession(crop1.type, crop2.type) ? 1 : 0;
                        totalCompatibility += compatibility;
                        comparisons++;
                    }
                }
            }
        }
        
        // Calculate final score
        return comparisons > 0 ? Math.round((totalCompatibility / comparisons) * 100) : 100;
    }
    
    // Check if crop2 is good to follow crop1
    function isGoodSuccession(crop1Type, crop2Type) {
        if (!crop1Type || !crop2Type) return true; // Skip if type unknown
        
        return cropCompatibility[crop1Type]?.before.includes(crop2Type) || false;
    }
    
    // Generate suggestions
    function generateSuggestions(crops) {
        const suggestions = [];
        
        // Check for missing crop types
        const usedTypes = new Set(crops.map(c => c.type).filter(t => t));
        const allTypes = new Set(Object.keys(cropGroups));
        const missingTypes = [...allTypes].filter(type => !usedTypes.has(type));
        
        if (missingTypes.length > 0) {
            suggestions.push(`Consider adding ${missingTypes.join(', ')} crops to your rotation for a more diverse plan.`);
        }
        
        // Check for crop succession issues
        for (let i = 0; i < crops.length; i++) {
            for (let j = 0; j < crops.length; j++) {
                if (i !== j) {
                    const crop1 = crops[i];
                    const crop2 = crops[j];
                    
                    // Check if crops are in sequential years or seasons
                    const isSequential = (crop1.year === crop2.year - 1) || 
                                        (crop1.year === crop2.year && 
                                        ['spring', 'summer', 'fall', 'winter'].indexOf(crop1.season) === 
                                        ['spring', 'summer', 'fall', 'winter'].indexOf(crop2.season) - 1);
                    
                    if (isSequential && !isGoodSuccession(crop1.type, crop2.type)) {
                        suggestions.push(`${capitalize(crop2.crop)} after ${crop1.crop} may not be ideal. Consider a different crop sequence.`);
                    }
                }
            }
        }
        
        // Add general suggestions
        if (crops.length < 4) {
            suggestions.push('Add more crops to your rotation plan to get better recommendations.');
        }
        
        if (suggestions.length === 0) {
            suggestions.push('Your crop rotation plan looks good! The selected crop sequence supports good soil health and pest management.');
        }
        
        return suggestions;
    }
    
    // Update nutrient chart
    function updateNutrientChart(crops) {
        const ctx = document.getElementById('nutrientChart').getContext('2d');
        
        // Calculate average nutrients by year
        const yearlyNutrients = {};
        
        crops.forEach(crop => {
            if (!crop.type) return;
            
            if (!yearlyNutrients[crop.year]) {
                yearlyNutrients[crop.year] = { 
                    nitrogen: 0, 
                    phosphorus: 0, 
                    potassium: 0,
                    count: 0
                };
            }
            
            const nutrients = cropCompatibility[crop.type].nutrients;
            yearlyNutrients[crop.year].nitrogen += nutrients.nitrogen;
            yearlyNutrients[crop.year].phosphorus += nutrients.phosphorus;
            yearlyNutrients[crop.year].potassium += nutrients.potassium;
            yearlyNutrients[crop.year].count++;
        });
        
        // Average the values
        const years = Object.keys(yearlyNutrients).sort();
        const nitrogenData = [];
        const phosphorusData = [];
        const potassiumData = [];
        
        years.forEach(year => {
            const count = yearlyNutrients[year].count || 1;
            nitrogenData.push(yearlyNutrients[year].nitrogen / count);
            phosphorusData.push(yearlyNutrients[year].phosphorus / count);
            potassiumData.push(yearlyNutrients[year].potassium / count);
        });
        
        // Create or update chart
        if (window.nutrientChart) {
            window.nutrientChart.data.labels = years.map(y => `Year ${y}`);
            window.nutrientChart.data.datasets[0].data = nitrogenData;
            window.nutrientChart.data.datasets[1].data = phosphorusData;
            window.nutrientChart.data.datasets[2].data = potassiumData;
            window.nutrientChart.update();
        } else {
            window.nutrientChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: years.map(y => `Year ${y}`),
                    datasets: [
                        {
                            label: 'Nitrogen',
                            data: nitrogenData,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Phosphorus',
                            data: phosphorusData,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Potassium',
                            data: potassiumData,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    scales: {
                        r: {
                            angleLines: {
                                display: true
                            },
                            suggestedMin: 0,
                            suggestedMax: 5
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }
    
    // Save plan button
    saveBtn.addEventListener('click', () => {
        const planName = prompt('Enter a name for this plan:', 'Rotation Plan ' + new Date().toLocaleDateString());
        
        if (!planName) return; // User cancelled
        
        // Collect all crop selections
        const planData = {
            name: planName,
            date: new Date(),
            years: {},
        };
        
        document.querySelectorAll('.season-slot').forEach(slot => {
            const year = slot.dataset.year;
            const season = slot.dataset.season;
            const cropSelect = slot.querySelector('.crop-select');
            const crop = cropSelect ? cropSelect.value : '';
            
            if (!planData.years[year]) {
                planData.years[year] = {};
            }
            
            planData.years[year][season] = crop;
        });
        
        // Save to local storage
        const savedPlans = JSON.parse(localStorage.getItem('crop_rotation_plans') || '[]');
        savedPlans.push(planData);
        localStorage.setItem('crop_rotation_plans', JSON.stringify(savedPlans));
        
        // Update saved plans display
        displaySavedPlans();
        
        alert('Plan saved successfully!');
    });
    
    // Display saved plans
    function displaySavedPlans() {
        const plansContainer = document.getElementById('plans-container');
        const savedPlans = JSON.parse(localStorage.getItem('crop_rotation_plans') || '[]');
        
        if (savedPlans.length === 0) {
            plansContainer.innerHTML = '<p class="no-plans-message">You haven\'t saved any plans yet.</p>';
            return;
        }
        
        plansContainer.innerHTML = '';
        
        savedPlans.forEach((plan, index) => {
            const planCard = document.createElement('div');
            planCard.className = 'plan-card';
            
            // Count number of crops in plan
            let cropCount = 0;
            for (const year in plan.years) {
                for (const season in plan.years[year]) {
                    if (plan.years[year][season]) {
                        cropCount++;
                    }
                }
            }
            
            const date = new Date(plan.date);
            
            planCard.innerHTML = `
                <div class="plan-title">
                    ${plan.name}
                    <button class="delete-plan" data-index="${index}"><i class="fas fa-trash"></i></button>
                </div>
                <div class="plan-meta">
                    Created: ${date.toLocaleDateString()}
                </div>
                <div class="plan-preview">
                    ${Object.keys(plan.years).length} years, ${cropCount} crops
                </div>
                <div class="plan-actions">
                    <button class="btn secondary-btn load-plan" data-index="${index}">Load</button>
                </div>
            `;
            
            plansContainer.appendChild(planCard);
        });
        
        // Add event listeners to load and delete buttons
        document.querySelectorAll('.load-plan').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                loadPlan(index);
            });
        });
        
        document.querySelectorAll('.delete-plan').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.dataset.index);
                deletePlan(index);
            });
        });
    }
    
    // Load a saved plan
    function loadPlan(index) {
        const savedPlans = JSON.parse(localStorage.getItem('crop_rotation_plans') || '[]');
        if (!savedPlans[index]) return;
        
        const plan = savedPlans[index];
        
        // Clear all current selections
        document.querySelectorAll('.crop-select').forEach(select => {
            select.value = '';
        });
        
        // Load plan data
        for (const year in plan.years) {
            // Make sure we have enough year tabs
            while (parseInt(year) > yearCount) {
                addYearBtn.click();
            }
            
            for (const season in plan.years[year]) {
                const value = plan.years[year][season];
                const slot = document.querySelector(`.season-slot[data-year="${year}"][data-season="${season}"]`);
                
                if (slot) {
                    const select = slot.querySelector('.crop-select');
                    if (select) {
                        select.value = value;
                    }
                }
            }
        }
        
        // Switch to year 1 and update recommendations
        switchYear(1);
        updateRecommendations();
        
        alert(`Plan "${plan.name}" loaded successfully!`);
    }
    
    // Delete a saved plan
    function deletePlan(index) {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        
        const savedPlans = JSON.parse(localStorage.getItem('crop_rotation_plans') || '[]');
        if (!savedPlans[index]) return;
        
        savedPlans.splice(index, 1);
        localStorage.setItem('crop_rotation_plans', JSON.stringify(savedPlans));
        
        displaySavedPlans();
    }
    
    // Clear plan button
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all crops from your current plan?')) {
            document.querySelectorAll('.crop-select').forEach(select => {
                select.value = '';
            });
            updateRecommendations();
        }
    });
    
    // Print plan button
    printBtn.addEventListener('click', () => {
        window.print();
    });
    
    // Helper function to capitalize first letter
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Load saved plans on page load
    displaySavedPlans();
}); 