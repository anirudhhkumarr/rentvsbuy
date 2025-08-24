// Rent vs Buy Calculator - Using calculator.js for calculations
class RentBuyUI {
    constructor() {
        this.calculator = new RentBuyCalculator();
        this.initializeElements();
        this.setupCustomSpinners();
        this.setupNumberFormatting();
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
        this.monthlyBreakdownChart = null;
        this.breakdownTableBody = document.getElementById('breakdownTableBody');
        
        // Year slider for monthly costs
        this.yearSlider = document.getElementById('yearSlider');
        this.yearDisplay = document.getElementById('yearDisplay');
        
        // Cost type toggle buttons
        this.buyToggle = document.getElementById('buyToggle');
        this.rentToggle = document.getElementById('rentToggle');
        this.showBuyCosts = true; // Default to buy costs
        
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
        
        const currencyFields = ['homePrice', 'monthlyRent'];

        // Load saved values from localStorage
        inputFields.forEach(fieldName => {
            const savedValue = localStorage.getItem(`rentBuyCalc_${fieldName}`);
            const element = document.getElementById(fieldName);
            if (savedValue && element) {
                element.value = savedValue;
                
                // Format currency fields after loading from localStorage
                if (currencyFields.includes(fieldName)) {
                    const numValue = parseFloat(savedValue.replace(/,/g, ''));
                    if (!isNaN(numValue) && numValue > 0) {
                        element.value = this.formatNumber(numValue);
                    }
                }
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
                const current = parseFloat(input.value) || 0;
                const newValue = current + step;
                
                if (!max || newValue <= max) {
                    input.value = newValue;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            
            finalDownBtn.addEventListener('click', () => {
                const step = parseFloat(input.step) || 1;
                const min = parseFloat(input.min);
                const current = parseFloat(input.value) || 0;
                const newValue = current - step;
                
                if (!min || newValue >= min) {
                    input.value = newValue;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        });
    }

    setupNumberFormatting() {
        // Format currency inputs (Home Price, Monthly Rent)
        const currencyInputs = ['homePrice', 'monthlyRent'];
        
        currencyInputs.forEach(fieldName => {
            const input = document.getElementById(fieldName);
            if (!input) return;
            
            // Format on blur (when user finishes editing)
            input.addEventListener('blur', () => {
                const value = parseFloat(input.value.replace(/,/g, ''));
                if (!isNaN(value) && value > 0) {
                    input.value = this.formatNumber(value);
                }
            });
            
            // Remove formatting on focus (for easier editing)
            input.addEventListener('focus', () => {
                const value = parseFloat(input.value.replace(/,/g, ''));
                if (!isNaN(value) && value > 0) {
                    input.value = value.toString();
                }
            });
            
            // Prevent formatting conflicts during manual input
            input.addEventListener('input', (e) => {
                // Only allow digits and basic editing
                const cursorPos = e.target.selectionStart;
                const rawValue = e.target.value.replace(/[^0-9]/g, '');
                if (rawValue !== e.target.value.replace(/,/g, '')) {
                    e.target.value = rawValue;
                    e.target.setSelectionRange(cursorPos, cursorPos);
                }
            });
            
            // Format the initial value
            const initialValue = parseFloat(input.value);
            if (!isNaN(initialValue) && initialValue > 0) {
                input.value = this.formatNumber(initialValue);
            }
        });
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
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

        // Year slider for monthly costs chart
        if (this.yearSlider && this.yearDisplay) {
            this.yearSlider.addEventListener('input', () => {
                this.yearDisplay.textContent = this.yearSlider.value;
                this.updateMonthlyBreakdownChart(this.lastResults);
            });
        }

        // Toggle buttons for buy/rent costs
        if (this.buyToggle && this.rentToggle) {
            this.buyToggle.addEventListener('click', () => {
                this.showBuyCosts = true;
                this.buyToggle.classList.add('active');
                this.rentToggle.classList.remove('active');
                this.updateMonthlyBreakdownChart(this.lastResults);
            });

            this.rentToggle.addEventListener('click', () => {
                this.showBuyCosts = false;
                this.rentToggle.classList.add('active');
                this.buyToggle.classList.remove('active');
                this.updateMonthlyBreakdownChart(this.lastResults);
            });
        }

        // Recalculate on any input change  
        const inputs = document.querySelectorAll('input:not([readonly]), select');
        inputs.forEach(input => {
            if (!input.hasAttribute('readonly')) {
                input.addEventListener('input', () => {
                    this.saveValues();
                    this.calculate();
                });
            }
        });
    }

    updateCalculatedFields() {
        // Calculate down payment amount from percentage
        const downPaymentAmount = this.homePrice.value * (this.downPaymentPercent.value / 100);
        
        // Update loan amount display and hidden field
        const loanAmount = this.homePrice.value - downPaymentAmount;
        this.loanAmountDisplay.textContent = this.formatCurrency(loanAmount);
        this.loanAmount.value = loanAmount;
        
        // Update annual rent display and hidden field
        const annualRent = this.monthlyRent.value * 12;
        this.annualRentDisplay.textContent = this.formatCurrency(annualRent);
        this.annualRent.value = annualRent;
        
        // Update hidden down payment field
        this.downPayment.value = downPaymentAmount;
        
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
        // Show the final year values (Year 30), not the sum
        const finalYearIndex = results.years.length - 1;
        const finalBuyReal = results.buyReals[finalYearIndex] || 0;
        const finalRentReal = results.rentReals[finalYearIndex] || 0;
        const totalDifference = finalRentReal - finalBuyReal;

        this.buyTotalCost.textContent = this.formatCurrency(finalBuyReal);
        this.rentTotalCost.textContent = this.formatCurrency(finalRentReal);
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
        this.updateMonthlyBreakdownChart(results);
    }

    updateCostComparisonChart(results) {
        const ctx = document.getElementById('costComparisonChart').getContext('2d');
        
        if (this.costComparisonChart) {
            this.costComparisonChart.destroy();
        }

        // Filter to show only 5-year increments
        const filteredYears = [];
        const filteredBuyReals = [];
        const filteredRentReals = [];
        
        for (let i = 0; i < results.years.length; i++) {
            const year = results.years[i];
            if (year % 5 === 0 || year === 1) {
                filteredYears.push(year);
                filteredBuyReals.push(results.buyReals[i]);
                filteredRentReals.push(results.rentReals[i]);
            }
        }

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
                        tension: 0.4
                    },
                    {
                        label: 'Rent (Real) - Inflation Adjusted',
                        data: filteredRentReals,
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        tension: 0.4
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
                    }
                }
            }
        });
    }

    updateMonthlyLineChart(results) {
        const ctx = document.getElementById('monthlyLineChart').getContext('2d');
        
        if (this.monthlyLineChart) {
            this.monthlyLineChart.destroy();
        }

        // Calculate monthly costs for each year, filtering to 5-year increments
        const inputs = this.getInputs();
        const monthlyMortgagePayment = this.calculator.calculateMonthlyPayment(inputs);
        
        const filteredYears = [];
        const buyMonthlyCosts = [];
        const rentMonthlyCosts = [];
        
        for (let i = 0; i < results.years.length; i++) {
            const year = results.years[i];
            if (year % 5 === 0 || year === 1) {
                // Buy costs: mortgage + property tax/maintenance
                const monthlyPropertyTax = (results.taxMaintenances[i] || 0) / 12;
                const totalBuyCost = monthlyMortgagePayment + monthlyPropertyTax;
                
                // Rent costs
                const monthlyRent = (results.rentExpenses[i] || 0) / 12;
                
                filteredYears.push(year);
                buyMonthlyCosts.push(totalBuyCost);
                rentMonthlyCosts.push(monthlyRent);
            }
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
                        tension: 0.4
                    },
                    {
                        label: 'Rent Monthly Costs',
                        data: rentMonthlyCosts,
                        borderColor: '#17a2b8',
                        backgroundColor: 'rgba(23, 162, 184, 0.1)',
                        tension: 0.4
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
                    }
                }
            }
        });
    }

    updateMonthlyBreakdownChart(results) {
        if (!results) return;
        
        const ctx = document.getElementById('monthlyBreakdownChart').getContext('2d');
        
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
