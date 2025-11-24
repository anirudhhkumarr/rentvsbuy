class WhatIfAnalysis {
    constructor() {
        this.calculator = new RentBuyCalculator();
        this.chart = null;
        this.setupEventListeners();
        this.setupDoubleRangeSliders();
        this.initializeDefaults();
        this.loadSavedSettings();
    }

    setupEventListeners() {
        document.getElementById('runAnalysis').addEventListener('click', () => {
            this.runAnalysis();
        });

        // Update axis parameter selections to avoid duplicates
        document.getElementById('xAxisParameter').addEventListener('change', () => {
            this.updateAxisOptions();
            this.saveSettings();
        });

        document.getElementById('yAxisParameter').addEventListener('change', () => {
            this.updateAxisOptions();
            this.saveSettings();
        });

        // Setup slider value updates
        this.setupSliderListeners();
        
        // Setup base scenario toggle
        this.setupBaseScenarioToggle();
    }

    setupSliderListeners() {
        const sliders = [
            // Base scenario sliders
            { id: 'baseRent', display: 'baseRentValue', format: (v) => `$${parseInt(v).toLocaleString()}` },
            { id: 'baseRentIncrease', display: 'baseRentIncreaseValue', format: (v) => `${parseFloat(v).toFixed(1)}%` },
            { id: 'baseTaxRate', display: 'baseTaxRateValue', format: (v) => `${parseFloat(v).toFixed(2)}%` },
            { id: 'baseHomeReturn', display: 'baseHomeReturnValue', format: (v) => `${parseFloat(v).toFixed(1)}%` },
            { id: 'baseStockReturn', display: 'baseStockReturnValue', format: (v) => `${parseFloat(v).toFixed(1)}%` },
            { id: 'baseInflation', display: 'baseInflationValue', format: (v) => `${parseFloat(v).toFixed(1)}%` },
            { id: 'baseLoanTerm', display: 'baseLoanTermValue', format: (v) => `${parseInt(v)}` },
            { id: 'investingHorizon', display: 'investingHorizonValue', format: (v) => `${parseInt(v)}` },
            
            // Range parameter sliders
            { id: 'interestMin', display: 'interestMinValue', format: (v) => `${parseFloat(v).toFixed(1)}%` },
            { id: 'interestMax', display: 'interestMaxValue', format: (v) => `${parseFloat(v).toFixed(1)}%` },
            { id: 'priceMin', display: 'priceMinValue', format: (v) => `$${(parseFloat(v) / 1000000).toFixed(1)}M` },
            { id: 'priceMax', display: 'priceMaxValue', format: (v) => `$${(parseFloat(v) / 1000000).toFixed(1)}M` },
            { id: 'downMin', display: 'downMinValue', format: (v) => `${parseInt(v)}%` },
            { id: 'downMax', display: 'downMaxValue', format: (v) => `${parseInt(v)}%` },
            
            // Single value sliders
            { id: 'interestSingle', display: 'interestSingleValue', format: (v) => `${parseFloat(v).toFixed(2)}%` },
            { id: 'priceSingle', display: 'priceSingleValue', format: (v) => `$${(parseFloat(v) / 1000000).toFixed(2)}M` },
            { id: 'downSingle', display: 'downSingleValue', format: (v) => `${parseInt(v)}%` },
            { id: 'horizonSingle', display: 'horizonSingleValue', format: (v) => `${parseInt(v)} years` },
            
            // Range parameter sliders for horizon
            { id: 'horizonMin', display: 'horizonMinValue', format: (v) => `${parseInt(v)} years` },
            { id: 'horizonMax', display: 'horizonMaxValue', format: (v) => `${parseInt(v)} years` }
        ];

        sliders.forEach(slider => {
            const element = document.getElementById(slider.id);
            const display = document.getElementById(slider.display);
            
            if (element && display) {
                // Update display on input
                element.addEventListener('input', () => {
                    display.textContent = slider.format(element.value);
                    
                    // Validate min/max relationships
                    this.validateRanges();
                    
                    // Save settings to localStorage
                    this.saveSettings();
                });
                
                // Initialize display
                display.textContent = slider.format(element.value);
            }
        });
    }

    setupBaseScenarioToggle() {
        const toggleButton = document.getElementById('toggleBaseScenario');
        const baseScenario = document.querySelector('.base-scenario');
        
        if (toggleButton && baseScenario) {
            toggleButton.addEventListener('click', () => {
                const isHidden = baseScenario.style.display === 'none';
                
                if (isHidden) {
                    baseScenario.style.display = 'block';
                    toggleButton.classList.add('expanded');
                    toggleButton.innerHTML = '<i class="fas fa-cog"></i> Hide Advanced Settings <i class="fas fa-chevron-up toggle-icon"></i>';
                } else {
                    baseScenario.style.display = 'none';
                    toggleButton.classList.remove('expanded');
                    toggleButton.innerHTML = '<i class="fas fa-cog"></i> Advanced Settings <i class="fas fa-chevron-down toggle-icon"></i>';
                }
            });
        }
    }

    validateRanges() {
        // Ensure min values don't exceed max values
        const interestMin = parseFloat(document.getElementById('interestMin').value);
        const interestMax = parseFloat(document.getElementById('interestMax').value);
        const priceMin = parseFloat(document.getElementById('priceMin').value);
        const priceMax = parseFloat(document.getElementById('priceMax').value);
        const downMin = parseInt(document.getElementById('downMin').value);
        const downMax = parseInt(document.getElementById('downMax').value);
        
        // Fix interest rate range if needed
        if (interestMin >= interestMax) {
            document.getElementById('interestMax').value = Math.min(interestMin + 1, 15);
            document.getElementById('interestMaxValue').textContent = `${parseFloat(document.getElementById('interestMax').value).toFixed(1)}%`;
        }
        
        // Fix price range if needed
        if (priceMin >= priceMax) {
            document.getElementById('priceMax').value = Math.min(priceMin + 500000, 5000000);
            document.getElementById('priceMaxValue').textContent = `$${(parseFloat(document.getElementById('priceMax').value) / 1000000).toFixed(1)}M`;
        }
        
        // Fix down payment range if needed
        if (downMin >= downMax) {
            document.getElementById('downMax').value = Math.min(downMin + 5, 50);
            document.getElementById('downMaxValue').textContent = `${document.getElementById('downMax').value}%`;
        }
    }

    setupDoubleRangeSliders() {
        // Setup double-range sliders for each parameter
        this.setupDoubleSlider('interest', '%');
        this.setupDoubleSlider('price', '$');
        this.setupDoubleSlider('down', '%');
        this.setupDoubleSlider('horizon', ' years');
    }

    setupDoubleSlider(paramName, suffix) {
        const minSlider = document.getElementById(`${paramName}Min`);
        const maxSlider = document.getElementById(`${paramName}Max`);
        const minValue = document.getElementById(`${paramName}MinValue`);
        const maxValue = document.getElementById(`${paramName}MaxValue`);
        const track = document.getElementById(`${paramName}Track`);

        if (!minSlider || !maxSlider || !minValue || !maxValue || !track) return;

        const updateTrack = () => {
            const min = parseFloat(minSlider.min);
            const max = parseFloat(minSlider.max);
            const minVal = parseFloat(minSlider.value);
            const maxVal = parseFloat(maxSlider.value);

            const percentMin = ((minVal - min) / (max - min)) * 100;
            const percentMax = ((maxVal - min) / (max - min)) * 100;

            track.style.left = percentMin + '%';
            track.style.width = (percentMax - percentMin) + '%';
        };

        const updateValues = () => {
            let minVal = parseFloat(minSlider.value);
            let maxVal = parseFloat(maxSlider.value);

            // Ensure max is not less than min
            if (maxVal < minVal) {
                maxVal = minVal;
                maxSlider.value = maxVal;
            }

            // Format values based on parameter type
            if (paramName === 'price') {
                minValue.textContent = '$' + (minVal / 1000000).toFixed(1) + 'M';
                maxValue.textContent = '$' + (maxVal / 1000000).toFixed(1) + 'M';
            } else if (suffix === '%') {
                minValue.textContent = minVal + '%';
                maxValue.textContent = maxVal + '%';
            } else {
                minValue.textContent = minVal + suffix;
                maxValue.textContent = maxVal + suffix;
            }

            updateTrack();
        };

        minSlider.addEventListener('input', updateValues);
        maxSlider.addEventListener('input', updateValues);

        // Initial update
        updateValues();
    }

    initializeDefaults() {
        // Set default axis parameters
        document.getElementById('xAxisParameter').value = 'mortgageRate';
        document.getElementById('yAxisParameter').value = 'homePrice';
        this.updateAxisOptions();
    }

    updateAxisOptions() {
        const xAxis = document.getElementById('xAxisParameter');
        const yAxis = document.getElementById('yAxisParameter');
        
        // Ensure X and Y axes are different
        if (xAxis.value === yAxis.value) {
            const allOptions = ['mortgageRate', 'homePrice', 'downPaymentPercent'];
            const currentX = xAxis.value;
            const availableForY = allOptions.filter(opt => opt !== currentX);
            yAxis.value = availableForY[0];
        }
        
        // Update parameter controls based on selection
        this.updateParameterControls();
    }

    updateParameterControls() {
        const xAxis = document.getElementById('xAxisParameter').value;
        const yAxis = document.getElementById('yAxisParameter').value;
        const selectedParams = [xAxis, yAxis];
        
        const paramMap = {
            'mortgageRate': 'interest',
            'homePrice': 'price', 
            'downPaymentPercent': 'down',
            'investingHorizon': 'horizon'
        };
        
        // Update each parameter group
        Object.entries(paramMap).forEach(([param, prefix]) => {
            const rangeContainer = document.getElementById(`${prefix}RangeContainer`);
            const groupId = prefix === 'interest' ? 'interestRateGroup' : 
                          prefix === 'price' ? 'homePriceGroup' : 
                          prefix === 'down' ? 'downPaymentGroup' : 
                          'investingHorizonGroup';
            const singleContainer = document.querySelector(`#${groupId} .single-slider-container`);
            
            if (selectedParams.includes(param)) {
                // Show range controls for selected parameters
                if (rangeContainer) rangeContainer.style.display = 'grid';
                if (singleContainer) singleContainer.style.display = 'none';
            } else {
                // Show single slider for non-selected parameters
                if (rangeContainer) rangeContainer.style.display = 'none';
                if (singleContainer) singleContainer.style.display = 'block';
            }
        });
    }

    async runAnalysis() {
        const button = document.getElementById('runAnalysis');
        const resultsSection = document.getElementById('resultsSection');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const chartResults = document.getElementById('chartResults');

        // Show loading state with progress in button
        button.disabled = true;
        this.updateButtonProgress(0);
        
        // Show results section but keep existing chart visible
        resultsSection.style.display = 'block';
        if (chartResults.style.display !== 'none') {
            // If chart already exists, keep it visible, hide loading indicator
            loadingIndicator.style.display = 'none';
            chartResults.style.display = 'block';
        } else {
            // First time, show loading indicator
            loadingIndicator.style.display = 'block';
            chartResults.style.display = 'none';
        }

        try {
            // Get parameters
            const xParam = document.getElementById('xAxisParameter').value;
            const yParam = document.getElementById('yAxisParameter').value;
            
            const xRange = this.getParameterRange(xParam);
            const yRange = this.getParameterRange(yParam);
            
            const baseScenario = this.getBaseScenario();



            // Run the analysis
            const results = await this.calculateHeatmapData(xParam, yParam, xRange, yRange, baseScenario);
            
            // Create the chart
            this.createHeatmapChart(results, xParam, yParam);
            
            // Show results
            loadingIndicator.style.display = 'none';
            chartResults.style.display = 'block';

        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed. Please check your parameters and try again.');
            loadingIndicator.style.display = 'none';
        } finally {
            // Reset button
            button.disabled = false;
            button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            button.innerHTML = '<i class="fas fa-play"></i> Run Analysis';
        }
    }

    updateButtonProgress(progress) {
        const button = document.getElementById('runAnalysis');
        const percentage = Math.round(progress * 100);
        
        if (progress === 0) {
            button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            button.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <span>Starting...</span>
            `;
        } else if (progress < 1) {
            // Create a gradient that fills from left to right based on progress
            const gradientStop = percentage;
            button.style.background = `linear-gradient(90deg, 
                #28a745 0%, 
                #28a745 ${gradientStop}%, 
                rgba(102, 126, 234, 0.3) ${gradientStop}%, 
                rgba(102, 126, 234, 0.3) 100%)`;
            button.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <span>Analyzing...</span>
            `;
        } else {
            button.style.background = '#28a745';
            button.innerHTML = `
                <i class="fas fa-check"></i>
                <span>Complete!</span>
            `;
        }
    }

    getParameterRange(paramName) {
        const xAxis = document.getElementById('xAxisParameter').value;
        const yAxis = document.getElementById('yAxisParameter').value;
        const selectedParams = [xAxis, yAxis];
        
        // If this parameter is selected for analysis, use range
        if (selectedParams.includes(paramName)) {
            const paramMap = {
                'mortgageRate': { min: 'interestMin', max: 'interestMax' },
                'homePrice': { min: 'priceMin', max: 'priceMax' },
                'downPaymentPercent': { min: 'downMin', max: 'downMax' },
                'investingHorizon': { min: 'horizonMin', max: 'horizonMax' }
            };

            const config = paramMap[paramName];
            const min = parseFloat(document.getElementById(config.min).value);
            const max = parseFloat(document.getElementById(config.max).value);
            
            // Get step size from HTML and calculate steps
            const stepSize = parseFloat(document.getElementById(config.min).step || 1);
            const steps = Math.round((max - min) / stepSize) + 1;

            // Validate inputs
            if (isNaN(min) || isNaN(max) || isNaN(steps)) {
                throw new Error(`Invalid range parameters for ${paramName}: min=${min}, max=${max}, steps=${steps}`);
            }

            const range = [];
            for (let i = 0; i < steps; i++) {
                const value = min + (max - min) * i / (steps - 1);
                range.push(value);
            }
            

            return range;
        } else {
            // If not selected, return single value
            const singleMap = {
                'mortgageRate': 'interestSingle',
                'homePrice': 'priceSingle',
                'downPaymentPercent': 'downSingle',
                'investingHorizon': 'horizonSingle'
            };
            
            const singleValue = parseFloat(document.getElementById(singleMap[paramName]).value);
            

    
            return [singleValue];
        }
    }

    getBaseScenario() {
        const baseScenario = {
            monthlyRent: parseFloat(document.getElementById('baseRent').value),
            rentIncrease: parseFloat(document.getElementById('baseRentIncrease').value),
            taxMaintenanceRate: parseFloat(document.getElementById('baseTaxRate').value),
            homeReturn: parseFloat(document.getElementById('baseHomeReturn').value),
            stockReturn: parseFloat(document.getElementById('baseStockReturn').value),
            inflation: parseFloat(document.getElementById('baseInflation').value),
            loanTerm: parseInt(document.getElementById('baseLoanTerm').value),
            investingHorizon: parseInt(document.getElementById('investingHorizon').value)
        };

        // Validate all base scenario values
        Object.keys(baseScenario).forEach(key => {
            if (isNaN(baseScenario[key]) || !isFinite(baseScenario[key])) {
                console.error(`Invalid base scenario value for ${key}:`, baseScenario[key]);
                throw new Error(`Invalid base scenario value for ${key}: ${baseScenario[key]}`);
            }
        });


        return baseScenario;
    }

    async calculateHeatmapData(xParam, yParam, xRange, yRange, baseScenario) {
        const results = {
            xValues: xRange,
            yValues: yRange,
            data: [],
            xParam,
            yParam
        };

        const totalCalculations = xRange.length * yRange.length;
        

        
        // Create all calculation items
        const allCalculations = [];
        for (let i = 0; i < yRange.length; i++) {
            for (let j = 0; j < xRange.length; j++) {
                const scenario = this.createScenario(xParam, xRange[j], yParam, yRange[i], baseScenario);
                allCalculations.push({
                    scenario,
                    rowIndex: i,
                    colIndex: j,
                    xValue: xRange[j],
                    yValue: yRange[i]
                });
            }
        }
        
        // Initialize results matrix
        for (let i = 0; i < yRange.length; i++) {
            results.data.push(new Array(xRange.length));
        }
        
        // Use optimized batched processing
        return this.calculateHeatmapDataOptimized(allCalculations, results, totalCalculations);
    }

    // Optimized batched calculation
    async calculateHeatmapDataOptimized(allCalculations, results, totalCalculations) {
        let completed = 0;
        
        for (const item of allCalculations) {
            const calculation = this.calculator.calculateAll(item.scenario);
            
            // Get investing horizon from the scenario (may vary if it's an axis parameter)
            const investingHorizon = item.scenario.investingHorizon;
            
            // Get comparison at investing horizon (or closest available year)
            // Find the index of the year that matches investingHorizon, or use the last available year
            let horizonIndex = calculation.years.length - 1;
            for (let i = 0; i < calculation.years.length; i++) {
                if (calculation.years[i] >= investingHorizon) {
                    horizonIndex = i;
                    break;
                }
            }
            
            const buyReal = calculation.buyReals[horizonIndex];
            const rentReal = calculation.rentReals[horizonIndex];
            
            // Check for NaN values
            if (isNaN(buyReal) || isNaN(rentReal)) {
                throw new Error('Calculator producing NaN values');
            }
            
            const difference = rentReal - buyReal;
            
            results.data[item.rowIndex][item.colIndex] = {
                buyReal,
                rentReal,
                difference,
                recommendation: difference > 0 ? 'rent' : 'buy'
            };
            
            completed++;
            
            // Update progress every 20 calculations
            if (completed % 20 === 0 || completed === totalCalculations) {
                const progress = completed / totalCalculations;
                this.updateButtonProgress(progress);
                
                // Allow UI to update
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        return results;
    }

    createScenario(xParam, xValue, yParam, yValue, baseScenario) {
        // Start with default values
        let scenario = {
            homePrice: 1750000,
            loanTerm: baseScenario.loanTerm,
            downPaymentPercent: 30,
            mortgageRate: 6.25,
            mortgagePoints: 0,
            taxMaintenanceRate: baseScenario.taxMaintenanceRate,
            rent: baseScenario.monthlyRent * 12, // Calculator expects annual rent
            rentIncrease: baseScenario.rentIncrease,
            propertyReassessmentRate: 1,
            homeReturn: baseScenario.homeReturn,
            stockReturn: baseScenario.stockReturn,
            inflation: baseScenario.inflation,
            investingHorizon: baseScenario.investingHorizon // Will be overridden if selected as axis parameter
        };

        // Override non-selected parameters with their single values FIRST
        const allParams = ['mortgageRate', 'homePrice', 'downPaymentPercent', 'investingHorizon'];
        const selectedParams = [xParam, yParam];
        
        allParams.forEach(param => {
            if (!selectedParams.includes(param)) {
                const range = this.getParameterRange(param);
                scenario[param] = range[0]; // Use the single value
            }
        });

        // Override with analysis parameters (round to avoid floating point issues)
        scenario[xParam] = Math.round(parseFloat(xValue) * 10000) / 10000;
        scenario[yParam] = Math.round(parseFloat(yValue) * 10000) / 10000;

        // Validate all numeric values
        Object.keys(scenario).forEach(key => {
            if (typeof scenario[key] === 'number' && (isNaN(scenario[key]) || !isFinite(scenario[key]))) {
                console.error(`Invalid value for ${key}:`, scenario[key]);
                throw new Error(`Invalid numeric value for ${key}: ${scenario[key]}`);
            }
        });

        // Calculate derived values
        scenario.downPayment = Math.round(scenario.homePrice * scenario.downPaymentPercent / 100);
        scenario.loanAmount = scenario.homePrice - scenario.downPayment;
        scenario.propertyTaxAmount = Math.round(scenario.homePrice * scenario.taxMaintenanceRate / 100 * 100) / 100;
        scenario.closingCostsAmount = Math.round(scenario.homePrice * 0.03);



        // Validate reasonable ranges to prevent calculation issues
        if (scenario.mortgageRate > 20 || scenario.mortgageRate < 0) {
            throw new Error(`Invalid mortgage rate: ${scenario.mortgageRate}%`);
        }
        if (scenario.stockReturn > 50 || scenario.stockReturn < -10) {
            throw new Error(`Invalid stock return: ${scenario.stockReturn}%`);
        }
        if (scenario.homeReturn > 50 || scenario.homeReturn < -10) {
            throw new Error(`Invalid home return: ${scenario.homeReturn}%`);
        }
        if (scenario.inflation > 20 || scenario.inflation < -5) {
            throw new Error(`Invalid inflation: ${scenario.inflation}%`);
        }

        return scenario;
    }

    createHeatmapChart(results, xParam, yParam) {
        const canvas = document.getElementById('heatmapChart');
        const ctx = canvas.getContext('2d');
        
        // Make chart much taller and wider
        const totalPoints = results.data.length * (results.data[0] ? results.data[0].length : 1);
        if (totalPoints > 100) {
            canvas.style.height = '900px';
            canvas.style.width = '1200px';
        } else if (totalPoints > 50) {
            canvas.style.height = '825px';
            canvas.style.width = '1100px';
        } else {
            canvas.style.height = '750px';
            canvas.style.width = '1000px';
        }

        // Prepare data for Chart.js scatter plot with magnitude-based styling
        const datasets = [];
        
        // Create 20 gradient levels for buy/rent categories and close calls
        const magnitudeCategories = {};
        
        // 20 levels for Buy Better (green gradients)
        for (let i = 1; i <= 20; i++) {
            const opacity = 0.1 + (i * 0.045); // 0.1 to 1.0
            const radius = Math.ceil(i / 4) + 4; // Size 5 to 10 (every 4 levels share same size)
            magnitudeCategories[`buy_${i}`] = {
                data: [],
                color: `rgba(40, 167, 69, ${opacity})`,
                label: 'Buy Better',
                radius: radius
            };
        }
        
        // 20 levels for Rent Better (red gradients)
        for (let i = 1; i <= 20; i++) {
            const opacity = 0.1 + (i * 0.045); // 0.1 to 1.0
            const radius = Math.ceil(i / 4) + 4; // Size 5 to 10 (every 4 levels share same size)
            magnitudeCategories[`rent_${i}`] = {
                data: [],
                color: `rgba(220, 53, 69, ${opacity})`,
                label: 'Rent Better',
                radius: radius
            };
        }
        

        
        // Categorize data points by recommendation and magnitude
        for (let i = 0; i < results.data.length; i++) {
            for (let j = 0; j < results.data[i].length; j++) {
                const point = results.data[i][j];
                const dataPoint = {
                    x: results.xValues[j],
                    y: results.yValues[i],
                    difference: point.difference
                };
                
                const absDiff = Math.abs(point.difference);
                
                // Calculate gradient level (1-20) using linear interpolation
                // Simple linear scale from $0 to $1M for gradient levels
                const maxDiff = 1000000; // $1M max for gradient scale
                const normalizedDiff = Math.min(1, absDiff / maxDiff);
                const gradientLevel = Math.max(1, Math.floor(normalizedDiff * 19) + 1);
                
                if (point.recommendation === 'buy') {
                    magnitudeCategories[`buy_${gradientLevel}`].data.push(dataPoint);
                } else if (point.recommendation === 'rent') {
                    magnitudeCategories[`rent_${gradientLevel}`].data.push(dataPoint);
                }
            }
        }

        // Add datasets for each magnitude category that has data
        Object.keys(magnitudeCategories).forEach(key => {
            const category = magnitudeCategories[key];
            if (category.data.length > 0) {
                datasets.push({
                    label: category.label,
                    data: category.data,
                    backgroundColor: category.color,
                    borderColor: category.color,
                    pointRadius: category.radius,
                    pointHoverRadius: category.radius + 4
                });
            }
        });

        const paramLabels = {
            'mortgageRate': 'Interest Rate (%)',
            'homePrice': 'Home Price ($)',
            'downPaymentPercent': 'Down Payment (%)',
            'loanTerm': 'Loan Term (years)'
        };

        // Destroy old chart only when new one is ready to be created
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'scatter',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: paramLabels[xParam],
                            font: { size: 14, weight: 'bold' }
                        },
                        ticks: {
                            callback: function(value) {
                                if (xParam === 'homePrice') {
                                    return '$' + (value / 1000000).toFixed(1) + 'M';
                                }
                                return value;
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: paramLabels[yParam],
                            font: { size: 14, weight: 'bold' }
                        },
                        ticks: {
                            callback: function(value) {
                                if (yParam === 'homePrice') {
                                    return '$' + (value / 1000000).toFixed(1) + 'M';
                                }
                                return value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const point = context[0];
                                let xLabel = paramLabels[xParam] + ': ';
                                let yLabel = paramLabels[yParam] + ': ';
                                
                                if (xParam === 'homePrice') {
                                    xLabel += '$' + (point.parsed.x / 1000000).toFixed(2) + 'M';
                                } else if (xParam === 'mortgageRate' || xParam === 'downPaymentPercent') {
                                    xLabel += point.parsed.x.toFixed(2) + '%';
                                } else {
                                    xLabel += point.parsed.x;
                                }
                                
                                if (yParam === 'homePrice') {
                                    yLabel += '$' + (point.parsed.y / 1000000).toFixed(2) + 'M';
                                } else if (yParam === 'mortgageRate' || yParam === 'downPaymentPercent') {
                                    yLabel += point.parsed.y.toFixed(2) + '%';
                                } else {
                                    yLabel += point.parsed.y;
                                }
                                
                                return [xLabel, yLabel];
                            },
                            label: function(context) {
                                const difference = context.raw.difference;
                                const absDiff = Math.abs(difference);
                                
                                let magnitudeText = '';
                                if (absDiff >= 1000000) {
                                    magnitudeText = `$${(absDiff/1000000).toFixed(1)}M`;
                                } else if (absDiff >= 1000) {
                                    magnitudeText = `$${(absDiff/1000).toFixed(0)}k`;
                                } else {
                                    magnitudeText = `$${absDiff.toFixed(0)}`;
                                }
                                
                                if (difference > 0) {
                                    return `Rent is better by ${magnitudeText}`;
                                } else {
                                    return `Buy is better by ${magnitudeText}`;
                                }
                            }
                        }
                    }
                }
            }
        });

        this.updateSummaryStats(results);
    }







    updateSummaryStats(results) {
        const total = results.data.length * results.data[0].length;
        let buyCount = 0;
        let rentCount = 0;

        results.data.forEach(row => {
            row.forEach(cell => {
                if (cell.recommendation === 'buy') buyCount++;
                else if (cell.recommendation === 'rent') rentCount++;
            });
        });

        const summaryDiv = document.getElementById('summaryStats');
        summaryDiv.innerHTML = `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h4>Summary Statistics</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 10px;">
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #28a745;">${buyCount}</div>
                        <div style="font-size: 0.9rem; color: #666;">Buy Better</div>
                        <div style="font-size: 0.8rem; color: #666;">(${(buyCount/total*100).toFixed(1)}%)</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #dc3545;">${rentCount}</div>
                        <div style="font-size: 0.9rem; color: #666;">Rent Better</div>
                        <div style="font-size: 0.8rem; color: #666;">(${(rentCount/total*100).toFixed(1)}%)</div>
                    </div>
                </div>
            </div>
        `;
    }

    saveSettings() {
        const settings = {
            xAxisParameter: document.getElementById('xAxisParameter').value,
            yAxisParameter: document.getElementById('yAxisParameter').value,
            
            // Base scenario sliders
            baseRent: document.getElementById('baseRent').value,
            baseRentIncrease: document.getElementById('baseRentIncrease').value,
            baseTaxRate: document.getElementById('baseTaxRate').value,
            baseHomeReturn: document.getElementById('baseHomeReturn').value,
            baseStockReturn: document.getElementById('baseStockReturn').value,
            baseInflation: document.getElementById('baseInflation').value,
            
            // Range sliders
            interestMin: document.getElementById('interestMin').value,
            interestMax: document.getElementById('interestMax').value,
            priceMin: document.getElementById('priceMin').value,
            priceMax: document.getElementById('priceMax').value,
            downMin: document.getElementById('downMin').value,
            downMax: document.getElementById('downMax').value,
            termMin: document.getElementById('termMin').value,
            termMax: document.getElementById('termMax').value,
            
            // Single value sliders
            interestSingle: document.getElementById('interestSingle').value,
            priceSingle: document.getElementById('priceSingle').value,
            downSingle: document.getElementById('downSingle').value,
            termSingle: document.getElementById('termSingle').value
        };
        
        localStorage.setItem('whatIfSettings', JSON.stringify(settings));
    }

    loadSavedSettings() {
        const saved = localStorage.getItem('whatIfSettings');
        if (!saved) return;
        
        try {
            const settings = JSON.parse(saved);
            
            // Load axis parameters
            if (settings.xAxisParameter) {
                document.getElementById('xAxisParameter').value = settings.xAxisParameter;
            }
            if (settings.yAxisParameter) {
                document.getElementById('yAxisParameter').value = settings.yAxisParameter;
            }
            
            // Load all slider values
            Object.keys(settings).forEach(key => {
                const element = document.getElementById(key);
                if (element && settings[key] !== undefined) {
                    element.value = settings[key];
                    
                    // Update display for this slider
                    const displayElement = document.getElementById(key + 'Value');
                    if (displayElement) {
                        // Find the corresponding slider config to get the format function
                        const sliderConfigs = [
                            { id: 'baseRent', format: (v) => `$${parseInt(v).toLocaleString()}` },
                            { id: 'baseRentIncrease', format: (v) => `${parseFloat(v).toFixed(1)}%` },
                            { id: 'baseTaxRate', format: (v) => `${parseFloat(v).toFixed(2)}%` },
                            { id: 'baseHomeReturn', format: (v) => `${parseFloat(v).toFixed(1)}%` },
                            { id: 'baseStockReturn', format: (v) => `${parseFloat(v).toFixed(1)}%` },
                            { id: 'baseInflation', format: (v) => `${parseFloat(v).toFixed(1)}%` },
                            { id: 'interestMin', format: (v) => `${parseFloat(v).toFixed(2)}%` },
                            { id: 'interestMax', format: (v) => `${parseFloat(v).toFixed(2)}%` },
                            { id: 'priceMin', format: (v) => `$${(parseFloat(v) / 1000000).toFixed(2)}M` },
                            { id: 'priceMax', format: (v) => `$${(parseFloat(v) / 1000000).toFixed(2)}M` },
                            { id: 'downMin', format: (v) => `${parseInt(v)}%` },
                            { id: 'downMax', format: (v) => `${parseInt(v)}%` },
                            { id: 'termMin', format: (v) => `${parseInt(v)}` },
                            { id: 'termMax', format: (v) => `${parseInt(v)}` },
                            { id: 'interestSingle', format: (v) => `${parseFloat(v).toFixed(2)}%` },
                            { id: 'priceSingle', format: (v) => `$${(parseFloat(v) / 1000000).toFixed(2)}M` },
                            { id: 'downSingle', format: (v) => `${parseInt(v)}%` },
                            { id: 'termSingle', format: (v) => `${parseInt(v)}` }
                        ];
                        
                        const config = sliderConfigs.find(c => c.id === key);
                        if (config) {
                            displayElement.textContent = config.format(element.value);
                        }
                    }
                }
            });
            
            // Update axis options after loading
            this.updateAxisOptions();
            
        } catch (error) {
            console.error('Error loading saved settings:', error);
        }
    }
}

// Initialize the what-if analysis when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WhatIfAnalysis();
});
