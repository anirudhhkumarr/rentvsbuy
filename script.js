// Rent vs Buy Calculator - Using calculator.js for calculations
class RentBuyUI {
    constructor() {
        this.calculator = new RentBuyCalculator();
        this.initializeElements();
        this.setupCustomSpinners();
        this.setupEventListeners();
        this.loadSavedValues();
        this.updateCalculatedFields();
        this.calculate();
    }

    initializeElements() {
        // Input elements - user-friendly names
        this.homePrice = document.getElementById('homePrice');
        this.downPaymentPercent = document.getElementById('downPaymentPercent');
        this.loanAmountDisplay = document.getElementById('loanAmountDisplay');
        this.downPaymentDisplay = document.getElementById('downPaymentDisplay');
        this.loanTerm = document.getElementById('loanTerm');
        this.mortgageRate = document.getElementById('mortgageRate');
        this.mortgagePoints = document.getElementById('mortgagePoints');
        this.propertyTax = document.getElementById('propertyTax');

        this.monthlyRent = document.getElementById('monthlyRent');
        this.annualRentDisplay = document.getElementById('annualRentDisplay');
        this.rentIncrease = document.getElementById('rentIncrease');
        this.propertyReassessment = document.getElementById('propertyReassessment');
        this.homeReturn = document.getElementById('homeReturn');
        this.stockReturn = document.getElementById('stockReturn');
        this.inflation = document.getElementById('inflation');
        this.closingCosts = document.getElementById('closingCosts');

        // Hidden fields for compatibility
        this.downPayment = document.getElementById('downPayment');
        this.loanAmount = document.getElementById('loanAmount');
        this.annualRent = document.getElementById('annualRent');
        this.propertyTaxAmount = document.getElementById('propertyTaxAmount');
        this.closingCostsAmount = document.getElementById('closingCostsAmount');

        // Output elements
        this.buyTotalCost = document.getElementById('buyTotalCost');
        this.rentTotalCost = document.getElementById('rentTotalCost');
        this.costDifference = document.getElementById('costDifference');
        this.recommendation = document.getElementById('recommendation');

        // Charts
        this.costComparisonChart = null;
        this.monthlyLineChart = null;

        this.breakdownTableBody = document.getElementById('breakdownTableBody');

        // Chart focus controls
        this.yearSlider = document.getElementById('yearSlider');
        this.yearSliderLabel = document.getElementById('yearSliderLabel');
        this.yearSliderContainer = this.yearSlider ? this.yearSlider.closest('.year-slider-container') : null;
        this.selectedYear = this.yearSlider ? parseInt(this.yearSlider.value, 10) || 1 : null;
        this.focusYearPlugin = this.createFocusYearPlugin();

        // Collapsible elements
        this.setupCollapsible();
    }

    loadSavedValues() {
        // List of all input fields to save/restore
        const inputFields = [
            'homePrice', 'downPaymentPercent', 'loanTerm', 'mortgageRate', 
            'mortgagePoints', 'monthlyRent', 'rentIncrease', 'propertyReassessment',
            'propertyTax', 'closingCosts', 'homeReturn', 'stockReturn', 'inflation'
        ];

        // Load saved values from localStorage
        inputFields.forEach(fieldName => {
            const savedValue = localStorage.getItem(`rentBuyCalc_${fieldName}`);
            const element = document.getElementById(fieldName);
            if (savedValue !== null && element) {
                element.value = savedValue;
            }
        });
    }

    saveValues() {
        // List of all input fields to save
        const inputFields = [
            'homePrice', 'downPaymentPercent', 'loanTerm', 'mortgageRate', 
            'mortgagePoints', 'monthlyRent', 'rentIncrease', 'propertyReassessment',
            'propertyTax', 'closingCosts', 'homeReturn', 'stockReturn', 'inflation'
        ];

        // Save current values to localStorage
        inputFields.forEach(fieldName => {
            const element = document.getElementById(fieldName);
            if (element) {
                localStorage.setItem(`rentBuyCalc_${fieldName}`, element.value);
            }
        });
    }

    setupCustomSpinners() {
        // Add custom spinners to all number inputs (except readonly)
        const numberInputs = document.querySelectorAll('input[type="number"]:not([readonly])');
        
        numberInputs.forEach(input => {
            if (input.closest('.input-spinner-wrapper')) return; // Already wrapped
            
            const isPercentageField = input.closest('.input-with-suffix');
            const isPrefixField = input.closest('.input-with-prefix');
            
            // Create wrapper div
            const wrapper = document.createElement('div');
            wrapper.className = 'input-spinner-wrapper';
            
            // Handle different field types
            if (isPercentageField) {
                // Insert wrapper before input and move input inside
                input.parentNode.insertBefore(wrapper, input);
                wrapper.appendChild(input);
                
                // Create spinner with adjusted positioning for percentage fields
                const spinner = document.createElement('div');
                spinner.className = 'number-input-spinner percentage-spinner';
                
                const upBtn = document.createElement('div');
                upBtn.className = 'spinner-btn up';
                upBtn.innerHTML = '▲';
                
                const downBtn = document.createElement('div');
                downBtn.className = 'spinner-btn down';
                downBtn.innerHTML = '▼';
                
                spinner.appendChild(upBtn);
                spinner.appendChild(downBtn);
                wrapper.appendChild(spinner);
            } else if (isPrefixField) {
                // Insert wrapper before input and move input inside
                input.parentNode.insertBefore(wrapper, input);
                wrapper.appendChild(input);
                
                // Create spinner with adjusted positioning for prefix fields
                const spinner = document.createElement('div');
                spinner.className = 'number-input-spinner prefix-spinner';
                
                const upBtn = document.createElement('div');
                upBtn.className = 'spinner-btn up';
                upBtn.innerHTML = '▲';
                
                const downBtn = document.createElement('div');
                downBtn.className = 'spinner-btn down';
                downBtn.innerHTML = '▼';
                
                spinner.appendChild(upBtn);
                spinner.appendChild(downBtn);
                wrapper.appendChild(spinner);
            } else {
                // Regular input handling
                input.parentNode.insertBefore(wrapper, input);
                wrapper.appendChild(input);
                
                const spinner = document.createElement('div');
                spinner.className = 'number-input-spinner';
                
                const upBtn = document.createElement('div');
                upBtn.className = 'spinner-btn up';
                upBtn.innerHTML = '▲';
                
                const downBtn = document.createElement('div');
                downBtn.className = 'spinner-btn down';
                downBtn.innerHTML = '▼';
                
                spinner.appendChild(upBtn);
                spinner.appendChild(downBtn);
                wrapper.appendChild(spinner);
            }
            
            // Add functionality to the buttons (get references from the created spinner)
            const finalUpBtn = wrapper.querySelector('.spinner-btn.up');
            const finalDownBtn = wrapper.querySelector('.spinner-btn.down');
            
            finalUpBtn.addEventListener('click', () => {
                const step = parseFloat(input.step) || 1;
                const max = parseFloat(input.max);
                const current = parseFloat(input.value.replace(/,/g, '')) || 0;
                const newValue = current + step;
                
                if (!max || newValue <= max) {
                    // Round to avoid floating point precision issues
                    const decimalPlaces = (step.toString().split('.')[1] || '').length;
                    input.value = parseFloat(newValue.toFixed(decimalPlaces));
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            
            finalDownBtn.addEventListener('click', () => {
                const step = parseFloat(input.step) || 1;
                const min = parseFloat(input.min);
                const current = parseFloat(input.value.replace(/,/g, '')) || 0;
                const newValue = current - step;
                
                if (!min || newValue >= min) {
                    // Round to avoid floating point precision issues
                    const decimalPlaces = (step.toString().split('.')[1] || '').length;
                    input.value = parseFloat(newValue.toFixed(decimalPlaces));
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });
    }



    setupCollapsible() {
        const collapsibleHeader = document.querySelector('.collapsible-header');
        const collapsiblePanel = document.querySelector('.input-panel.secondary');
        
        if (collapsibleHeader && collapsiblePanel) {
            collapsibleHeader.addEventListener('click', () => {
                collapsiblePanel.classList.toggle('collapsed');
            });
        }
    }

    setupEventListeners() {
        // Update calculated fields when inputs change
        this.homePrice.addEventListener('input', () => {
            this.updateCalculatedFields();
            this.saveValues();
            this.calculate();
        });

        this.downPaymentPercent.addEventListener('input', () => {
            this.updateCalculatedFields();
            this.saveValues();
            this.calculate();
        });

        // Link monthly and annual rent
        this.monthlyRent.addEventListener('input', () => {
            this.updateCalculatedFields();
            this.saveValues();
            this.calculate();
        });

        if (this.yearSlider) {
            this.yearSlider.addEventListener('input', () => {
                this.selectedYear = parseInt(this.yearSlider.value, 10) || 1;
                this.updateYearLabel();
                this.calculate();
            });
        }

        // Removed: Year slider for monthly costs chart (chart was removed)

        // Removed: Toggle buttons for buy/rent costs (chart was removed)

        // Recalculate on any input change  
        const inputs = document.querySelectorAll('input:not([readonly]), select');
        inputs.forEach(input => {
            if (!input.hasAttribute('readonly')) {
                input.addEventListener('input', () => {
                    this.saveValues();
                    this.calculate();
                });
                input.addEventListener('change', () => {
                    this.saveValues();
                    this.calculate();
                });
            }
        });
    }

    updateCalculatedFields() {
        // Calculate down payment amount from percentage
        const downPaymentAmount = this.homePrice.value * (this.downPaymentPercent.value / 100);
        
        // Update loan and down payment displays plus hidden fields
        const loanAmount = this.homePrice.value - downPaymentAmount;
        this.loanAmountDisplay.textContent = this.formatCurrency(loanAmount);
        this.loanAmount.value = loanAmount;
        this.downPaymentDisplay.textContent = this.formatCurrency(downPaymentAmount);
        this.downPayment.value = downPaymentAmount;
        
        // Update annual rent display and hidden field
        const annualRent = this.monthlyRent.value * 12;
        this.annualRentDisplay.textContent = this.formatCurrency(annualRent);
        this.annualRent.value = annualRent;
        
        // Update property tax amount
        const propertyTaxAmount = this.homePrice.value * (this.propertyTax.value / 100);
        this.propertyTaxAmount.value = propertyTaxAmount;
        
        // Update closing costs amount
        const closingCostsAmount = this.homePrice.value * (this.closingCosts.value / 100);
        this.closingCostsAmount.value = closingCostsAmount;
    }

    calculate() {
        const inputs = this.getInputs();
        const results = this.calculator.calculateAll(inputs);
        
        // Store results for chart updates
        this.lastResults = results;
        this.updateYearSlider(results);
        
        this.updateDisplay(results);
        this.updateCharts(results);
        this.updateBreakdownTable(results);
        
        return results;
    }

    getInputs() {
        // Convert user-friendly inputs to calculator inputs
        const monthlyRent = parseFloat(this.monthlyRent.value.replace(/,/g, '')) || 4500;
        const homePrice = parseFloat(this.homePrice.value.replace(/,/g, '')) || 1750000;
        const downPaymentPercent = parseFloat(this.downPaymentPercent.value) || 30;
        const downPayment = homePrice * (downPaymentPercent / 100);
        
        return {
            homePrice: homePrice,
            downPayment: downPayment,
            loanTerm: parseFloat(this.loanTerm.value) || 30,
            mortgageRate: parseFloat(this.mortgageRate.value) || 6.25,
            mortgagePoints: parseFloat(this.mortgagePoints.value) || 0,
            taxMaintenanceRate: parseFloat(this.propertyTax.value) || 1.11,
            rent: monthlyRent * 12, // Convert monthly to annual
            rentIncrease: parseFloat(this.rentIncrease.value) || 5,
            propertyReassessmentRate: parseFloat(this.propertyReassessment.value) || 1,
            homeReturn: parseFloat(this.homeReturn.value) || 3,
            stockReturn: parseFloat(this.stockReturn.value) || 6,
            inflation: parseFloat(this.inflation.value) || 2,
            closingCostRate: parseFloat(this.closingCosts.value) || 3
        };
    }

    updateDisplay(results) {
        const targetYear = this.getSelectedYear(results);
        const matchedIndex = results.years.indexOf(targetYear);
        const yearIndex = matchedIndex === -1 ? results.years.length - 1 : matchedIndex;
        const focusBuyReal = results.buyReals[yearIndex] || 0;
        const focusRentReal = results.rentReals[yearIndex] || 0;
        const totalDifference = focusRentReal - focusBuyReal;

        this.buyTotalCost.textContent = this.formatCurrency(focusBuyReal);
        this.rentTotalCost.textContent = this.formatCurrency(focusRentReal);
        this.costDifference.textContent = this.formatCurrency(totalDifference);

        // Labels updated in HTML

        // Recommendation
        if (totalDifference > 0) {
            this.recommendation.textContent = 'RENT';
            this.recommendation.style.color = '#007bff';
        } else {
            this.recommendation.textContent = 'BUY';
            this.recommendation.style.color = '#28a745';
        }
    }

    updateCharts(results) {
        this.updateCostComparisonChart(results);
        this.updateMonthlyLineChart(results);
        this.updateCumulativeCostChart(results);
        this.updateMonthlyBreakdownChart(results);
    }

    updateCostComparisonChart(results) {
        const ctx = document.getElementById('costComparisonChart').getContext('2d');
        
        if (this.costComparisonChart) {
            this.costComparisonChart.destroy();
        }

        // Use all data points
        const filteredYears = results.years;
        const filteredBuyReals = results.buyReals;
        const filteredRentReals = results.rentReals;

        this.costComparisonChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: filteredYears,
                datasets: [
                    {
                        label: 'Buy (Real) - Inflation Adjusted',
                        data: filteredBuyReals,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0
                    },
                    {
                        label: 'Rent (Real) - Inflation Adjusted',
                        data: filteredRentReals,
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        tension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                animation: false,
                plugins: {
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    },
                    x: {
                        ticks: {
                            callback: function(value, index) {
                                return results.years[index] || value;
                            }
                        }
                    }
                }
            },
            plugins: [this.focusYearPlugin]
        });
    }

    createFocusYearPlugin() {
        return {
            id: 'focusYearLine',
            afterDatasetsDraw: (chart) => {
                this.resizeSliderToChart(chart);
                if (!this.selectedYear) return;
                const labels = chart.data.labels || [];
                const targetIndex = labels.indexOf(this.selectedYear);
                if (targetIndex === -1) return;

                const meta = chart.getDatasetMeta(0);
                const point = meta?.data?.[targetIndex];
                if (!point) return;

                const { top, bottom } = chart.chartArea;
                const ctx = chart.ctx;
                ctx.save();
                ctx.strokeStyle = '#ff6384';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.moveTo(point.x, top);
                ctx.lineTo(point.x, bottom);
                ctx.stroke();
                ctx.restore();
            }
        };
    }

    resizeSliderToChart(chart) {
        if (!this.yearSliderContainer || !chart?.chartArea) return;
        const areaWidth = chart.chartArea.right - chart.chartArea.left;
        if (areaWidth <= 0) return;
        this.yearSliderContainer.style.width = `${areaWidth}px`;
        this.yearSliderContainer.style.marginLeft = `${chart.chartArea.left}px`;
        this.yearSliderContainer.style.marginRight = `${Math.max(chart.width - chart.chartArea.right, 0)}px`;
    }

    updateYearSlider(results) {
        if (!this.yearSlider || !results || !results.years.length) return;
        const maxYear = results.years[results.years.length - 1];
        this.yearSlider.max = maxYear;

        if (!this.selectedYear) {
            this.selectedYear = parseInt(this.yearSlider.value, 10) || maxYear;
        }

        if (this.selectedYear > maxYear) {
            this.selectedYear = maxYear;
        }

        this.yearSlider.value = this.selectedYear;
        this.updateYearLabel();
    }

    getSelectedYear(results) {
        if (!results || !results.years.length) {
            this.selectedYear = 1;
            return 1;
        }

        const maxYear = results.years[results.years.length - 1];
        if (!this.selectedYear || this.selectedYear < 1) {
            this.selectedYear = maxYear;
        } else if (this.selectedYear > maxYear) {
            this.selectedYear = maxYear;
        }

        if (this.yearSlider) {
            this.yearSlider.value = this.selectedYear;
        }

        this.updateYearLabel();
        return this.selectedYear;
    }

    updateYearLabel(year = this.selectedYear) {
        if (this.yearSliderLabel) {
            const value = year || 1;
            this.yearSliderLabel.textContent = `Year ${value}`;
        }
    }

    updateMonthlyLineChart(results) {
        const ctx = document.getElementById('monthlyLineChart').getContext('2d');
        
        if (this.monthlyLineChart) {
            this.monthlyLineChart.destroy();
        }

        // Calculate monthly costs for each year, using all data points
        const inputs = this.getInputs();
        const monthlyMortgagePayment = this.calculator.calculateMonthlyPayment(inputs);
        
        const filteredYears = results.years;
        const buyMonthlyCosts = [];
        const rentMonthlyCosts = [];
        
        for (let i = 0; i < results.years.length; i++) {
            const year = results.years[i];
            
            // Buy costs: mortgage + property tax/maintenance
            const monthlyPropertyTax = (results.taxMaintenances[i] || 0) / 12;
            
            // Mortgage payment stops after loan term
            const mortgagePayment = year <= inputs.loanTerm ? monthlyMortgagePayment : 0;
            const totalBuyCost = mortgagePayment + monthlyPropertyTax;
            
            // Rent costs
            const monthlyRent = (results.rentExpenses[i] || 0) / 12;
            
            buyMonthlyCosts.push(totalBuyCost);
            rentMonthlyCosts.push(monthlyRent);
        }

        this.monthlyLineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: filteredYears,
                datasets: [
                    {
                        label: 'Buy Monthly Costs',
                        data: buyMonthlyCosts,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0
                    },
                    {
                        label: 'Rent Monthly Costs',
                        data: rentMonthlyCosts,
                        borderColor: '#17a2b8',
                        backgroundColor: 'rgba(23, 162, 184, 0.1)',
                        tension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                animation: false,
                plugins: {
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        ticks: {
                            callback: function(value, index) {
                                return results.years[index] || value;
                            }
                        }
                    }
                }
            }
        });
    }

    updateCumulativeCostChart(results) {
        const ctx = document.getElementById('cumulativeCostChart').getContext('2d');
        
        if (this.cumulativeCostChart) {
            this.cumulativeCostChart.destroy();
        }

        // Calculate cumulative monthly costs over time
        const inputs = this.getInputs();
        const buyMonthlyCosts = [];
        const rentMonthlyCosts = [];
        let buyCumulative = 0;
        let rentCumulative = 0;

        for (let year = 1; year <= results.years.length; year++) {
            const yearIndex = year - 1;
            
            // Calculate monthly buy costs for this year
            let monthlyBuyCost = 0;
            if (results.loans[yearIndex] > 0) {
                // Calculate monthly payment from loan amount and rate
                const monthlyPayment = this.calculator.calculateMonthlyPayment(inputs);
                monthlyBuyCost = monthlyPayment;
            }
            monthlyBuyCost += (results.taxMaintenances[yearIndex] || 0) / 12;
            monthlyBuyCost += (inputs.insurance || 0) / 12;
            monthlyBuyCost += (inputs.maintenance || 0) / 12;
            
            // Add down payment to first year
            if (year === 1) {
                buyCumulative += inputs.downPayment;
            }
            
            // Calculate monthly rent cost for this year
            const monthlyRentCost = (results.rentExpenses[yearIndex] || 0) / 12;
            
            // Add to cumulative totals (multiply by 12 to get annual, then add to cumulative)
            buyCumulative += monthlyBuyCost * 12;
            rentCumulative += monthlyRentCost * 12;
            
            buyMonthlyCosts.push(buyCumulative);
            rentMonthlyCosts.push(rentCumulative);
        }

        this.cumulativeCostChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: results.years,
                datasets: [
                    {
                        label: 'Cumulative Buy Costs',
                        data: buyMonthlyCosts,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0
                    },
                    {
                        label: 'Cumulative Rent Costs',
                        data: rentMonthlyCosts,
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        tension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                animation: false,
                plugins: {
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    },
                    x: {
                        ticks: {
                            callback: function(value, index) {
                                return results.years[index] || value;
                            }
                        }
                    }
                }
            }
        });
    }

    updateMonthlyBreakdownChart(results) {
        if (!results) return;
        
        // Chart element removed - skip this method
        return;
        
        if (this.monthlyBreakdownChart) {
            this.monthlyBreakdownChart.destroy();
        }

        // Get selected year (1-based)
        const selectedYear = this.yearSlider ? parseInt(this.yearSlider.value) : 1;
        const yearIndex = selectedYear - 1; // Convert to 0-based index
        
        // Calculate costs for the selected year
        const inputs = this.getInputs();
        
        // Base monthly mortgage payment (principal + interest) - stays constant
        const monthlyMortgagePayment = this.calculator.calculateMonthlyPayment(inputs);
        
        if (this.showBuyCosts) {
            // BUY COSTS BREAKDOWN
            // Property tax and maintenance from calculated results
            const annualPropertyTax = results.taxMaintenances[yearIndex] || 0;
            const monthlyPropertyTax = annualPropertyTax / 12;

            this.monthlyBreakdownChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Mortgage Payment', 'Property Tax & Maintenance'],
                    datasets: [{
                        data: [monthlyMortgagePayment, monthlyPropertyTax],
                        backgroundColor: ['#28a745', '#ffc107']
                    }]
                },
                options: {
                    responsive: true,
                    animation: false,
                    plugins: {
                        title: {
                            display: false
                        },
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        } else {
            // RENT COSTS BREAKDOWN  
            const annualRentExpense = results.rentExpenses[yearIndex] || 0;
            const monthlyRentExpense = annualRentExpense / 12;

            this.monthlyBreakdownChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Monthly Rent'],
                    datasets: [{
                        data: [monthlyRentExpense],
                        backgroundColor: ['#17a2b8']
                    }]
                },
                options: {
                    responsive: true,
                    animation: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Monthly Rent Costs - Year ${selectedYear}`
                        },
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed;
                                    return `Monthly Rent: $${value.toLocaleString()}`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    updateBreakdownTable(results) {
        if (!this.breakdownTableBody) {
            console.log('breakdownTableBody element not found');
            return;
        }
        
        this.breakdownTableBody.innerHTML = '';

        for (let i = 0; i < results.years.length; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${results.years[i]}</td>
                <td>${this.formatCurrency(results.buyReals[i])}</td>
                <td>${this.formatCurrency(results.rentValues[i])}</td>
                <td>${this.formatCurrency(results.rentReals[i])}</td>
                <td>${this.formatCurrency(results.premiums[i])}</td>
            `;
            this.breakdownTableBody.appendChild(row);
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
}

// Initialize the UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RentBuyUI();
});
