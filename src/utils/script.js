import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { RentBuyCalculator } from './calculator.js';

export class RentBuyUI {
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
        this.downPayment = document.getElementById('downPayment');
        this.loanAmount = document.getElementById('loanAmount');
        this.annualRent = document.getElementById('annualRent');
        this.propertyTaxAmount = document.getElementById('propertyTaxAmount');
        this.closingCostsAmount = document.getElementById('closingCostsAmount');
        this.buyTotalCost = document.getElementById('buyTotalCost');
        this.rentTotalCost = document.getElementById('rentTotalCost');
        this.costDifference = document.getElementById('costDifference');
        this.recommendation = document.getElementById('recommendation');
        this.costComparisonChart = null;
        this.monthlyLineChart = null;
        this.breakdownTableBody = document.getElementById('breakdownTableBody');
        this.yearSlider = document.getElementById('yearSlider');
        this.yearSliderLabel = document.getElementById('yearSliderLabel');
        this.yearSliderContainer = this.yearSlider ? this.yearSlider.closest('.year-slider-container') : null;
        this.selectedYear = this.yearSlider ? parseInt(this.yearSlider.value, 10) || 1 : null;
        this.focusYearPlugin = this.createFocusYearPlugin();
        this.setupCollapsible();
    }

    loadSavedValues() {
        const inputFields = ['homePrice', 'downPaymentPercent', 'loanTerm', 'mortgageRate', 'mortgagePoints', 'monthlyRent', 'rentIncrease', 'propertyReassessment', 'propertyTax', 'closingCosts', 'homeReturn', 'stockReturn', 'inflation'];
        inputFields.forEach(fieldName => {
            const savedValue = localStorage.getItem(`rentBuyCalc_${fieldName}`);
            const element = document.getElementById(fieldName);
            if (savedValue !== null && element) element.value = savedValue;
        });
    }

    saveValues() {
        const inputFields = ['homePrice', 'downPaymentPercent', 'loanTerm', 'mortgageRate', 'mortgagePoints', 'monthlyRent', 'rentIncrease', 'propertyReassessment', 'propertyTax', 'closingCosts', 'homeReturn', 'stockReturn', 'inflation'];
        inputFields.forEach(fieldName => {
            const element = document.getElementById(fieldName);
            if (element) localStorage.setItem(`rentBuyCalc_${fieldName}`, element.value);
        });
    }

    setupCustomSpinners() {
        const numberInputs = document.querySelectorAll('input[type="number"]:not([readonly])');
        numberInputs.forEach(input => {
            if (input.closest('.input-spinner-wrapper')) return;
            const wrapper = document.createElement('div');
            wrapper.className = 'input-spinner-wrapper';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            const spinner = document.createElement('div');
            spinner.className = 'number-input-spinner';
            const upBtn = document.createElement('div'); upBtn.className = 'spinner-btn up'; upBtn.innerHTML = '▲';
            const downBtn = document.createElement('div'); downBtn.className = 'spinner-btn down'; downBtn.innerHTML = '▼';
            spinner.appendChild(upBtn); spinner.appendChild(downBtn);
            wrapper.appendChild(spinner);
            upBtn.addEventListener('click', () => {
                const step = parseFloat(input.step) || 1;
                input.value = parseFloat((parseFloat(input.value.replace(/,/g, '')) || 0) + step).toFixed((step.toString().split('.')[1] || '').length);
                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
            downBtn.addEventListener('click', () => {
                const step = parseFloat(input.step) || 1;
                input.value = parseFloat((parseFloat(input.value.replace(/,/g, '')) || 0) - step).toFixed((step.toString().split('.')[1] || '').length);
                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
        });
    }

    setupCollapsible() {
        const header = document.querySelector('.collapsible-header');
        const panel = document.querySelector('.input-panel.secondary');
        if (header && panel) header.addEventListener('click', () => panel.classList.toggle('collapsed'));
    }

    setupEventListeners() {
        ['homePrice', 'downPaymentPercent', 'monthlyRent'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => { this.updateCalculatedFields(); this.saveValues(); this.calculate(); });
        });
        if (this.yearSlider) this.yearSlider.addEventListener('input', () => { this.selectedYear = parseInt(this.yearSlider.value, 10) || 1; this.updateYearLabel(); this.calculate(); });
        document.querySelectorAll('input:not([readonly]), select').forEach(input => {
            input.addEventListener('input', () => { this.saveValues(); this.calculate(); });
        });
    }

    updateCalculatedFields() {
        const homePrice = parseFloat(this.homePrice.value) || 0;
        const downPayment = homePrice * (parseFloat(this.downPaymentPercent.value) / 100);
        const loanAmount = homePrice - downPayment;
        this.loanAmountDisplay.textContent = this.formatCurrency(loanAmount);
        this.loanAmount.value = loanAmount;
        this.downPaymentDisplay.textContent = this.formatCurrency(downPayment);
        this.downPayment.value = downPayment;
        const annualRent = (parseFloat(this.monthlyRent.value) || 0) * 12;
        this.annualRentDisplay.textContent = this.formatCurrency(annualRent);
        this.annualRent.value = annualRent;
        this.propertyTaxAmount.value = homePrice * (parseFloat(this.propertyTax.value) / 100);
        this.closingCostsAmount.value = homePrice * (parseFloat(this.closingCosts.value) / 100);
    }

    calculate() {
        const results = this.calculator.calculateAll(this.getInputs());
        this.updateYearSlider(results);
        this.updateDisplay(results);
        this.updateCharts(results);
        this.updateBreakdownTable(results);
    }

    getInputs() {
        const homePrice = parseFloat(this.homePrice.value) || 0;
        return {
            homePrice,
            downPayment: homePrice * (parseFloat(this.downPaymentPercent.value) / 100),
            loanTerm: parseFloat(this.loanTerm.value) || 30,
            mortgageRate: parseFloat(this.mortgageRate.value) || 6.25,
            mortgagePoints: parseFloat(this.mortgagePoints.value) || 0,
            taxMaintenanceRate: parseFloat(this.propertyTax.value) || 1.11,
            rent: (parseFloat(this.monthlyRent.value) || 0) * 12,
            rentIncrease: parseFloat(this.rentIncrease.value) || 5,
            propertyReassessmentRate: parseFloat(this.propertyReassessment.value) || 1,
            homeReturn: parseFloat(this.homeReturn.value) || 3,
            stockReturn: parseFloat(this.stockReturn.value) || 6,
            inflation: parseFloat(this.inflation.value) || 2,
            closingCostRate: parseFloat(this.closingCosts.value) || 3
        };
    }

    updateDisplay(results) {
        const year = this.getSelectedYear(results);
        const idx = results.years.indexOf(year);
        const buy = results.buyReals[idx] || 0;
        const rent = results.rentReals[idx] || 0;
        const diff = rent - buy;
        this.buyTotalCost.textContent = this.formatCurrency(buy);
        this.rentTotalCost.textContent = this.formatCurrency(rent);
        this.costDifference.textContent = this.formatCurrency(diff);
        this.recommendation.textContent = diff > 0 ? 'RENT' : 'BUY';
        this.recommendation.style.color = diff > 0 ? '#007bff' : '#28a745';
    }

    updateCharts(results) {
        this.updateCostComparisonChart(results);
        this.updateMonthlyLineChart(results);
        this.updateCumulativeCostChart(results);
    }

    updateCostComparisonChart(results) {
        const ctx = document.getElementById('costComparisonChart').getContext('2d');
        if (this.costComparisonChart) this.costComparisonChart.destroy();
        this.costComparisonChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: results.years,
                datasets: [
                    { label: 'Buy (Real)', data: results.buyReals, borderColor: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.1)', tension: 0 },
                    { label: 'Rent (Real)', data: results.rentReals, borderColor: '#007bff', backgroundColor: 'rgba(0, 123, 255, 0.1)', tension: 0 }
                ]
            },
            options: { responsive: true, animation: false, scales: { y: { ticks: { callback: v => '$' + (v / 1000).toFixed(0) + 'K' } } } },
            plugins: [this.focusYearPlugin]
        });
    }

    createFocusYearPlugin() {
        return {
            id: 'focusYearLine',
            afterDatasetsDraw: (chart) => {
                this.resizeSliderToChart(chart);
                if (!this.selectedYear) return;
                const targetIndex = chart.data.labels.indexOf(this.selectedYear);
                const point = chart.getDatasetMeta(0).data[targetIndex];
                if (!point) return;
                const ctx = chart.ctx;
                ctx.save();
                ctx.strokeStyle = '#ff6384'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
                ctx.beginPath(); ctx.moveTo(point.x, chart.chartArea.top); ctx.lineTo(point.x, chart.chartArea.bottom); ctx.stroke();
                ctx.restore();
            }
        };
    }

    resizeSliderToChart(chart) {
        if (!this.yearSliderContainer) return;
        const width = chart.chartArea.right - chart.chartArea.left;
        this.yearSliderContainer.style.width = `${width}px`;
        this.yearSliderContainer.style.marginLeft = `${chart.chartArea.left}px`;
    }

    updateYearSlider(results) {
        if (!this.yearSlider) return;
        const max = results.years[results.years.length - 1];
        this.yearSlider.max = max;
        if (!this.selectedYear || this.selectedYear > max) this.selectedYear = max;
        this.yearSlider.value = this.selectedYear;
        this.updateYearLabel();
    }

    getSelectedYear(results) {
        const max = results.years[results.years.length - 1];
        if (!this.selectedYear) this.selectedYear = max;
        return Math.min(this.selectedYear, max);
    }

    updateYearLabel() { if (this.yearSliderLabel) this.yearSliderLabel.textContent = `Year ${this.selectedYear}`; }

    updateMonthlyLineChart(results) {
        const ctx = document.getElementById('monthlyLineChart').getContext('2d');
        if (this.monthlyLineChart) this.monthlyLineChart.destroy();
        const inputs = this.getInputs();
        const monthlyPmt = this.calculator.calculateMonthlyPayment(inputs);
        const buyCosts = results.years.map((y, i) => (y <= inputs.loanTerm ? monthlyPmt : 0) + (results.taxMaintenances[i] / 12));
        const rentCosts = results.rentExpenses.map(r => r / 12);
        this.monthlyLineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: results.years,
                datasets: [
                    { label: 'Buy Monthly', data: buyCosts, borderColor: '#28a745', tension: 0 },
                    { label: 'Rent Monthly', data: rentCosts, borderColor: '#17a2b8', tension: 0 }
                ]
            },
            options: { responsive: true, animation: false }
        });
    }

    updateCumulativeCostChart(results) {
        const ctx = document.getElementById('cumulativeCostChart').getContext('2d');
        if (this.cumulativeCostChart) this.cumulativeCostChart.destroy();
        const inputs = this.getInputs();
        let buySum = inputs.downPayment, rentSum = 0;
        const mPmt = this.calculator.calculateMonthlyPayment(inputs);
        const buyCum = [], rentCum = [];
        results.years.forEach((y, i) => {
            buySum += ((y <= inputs.loanTerm ? mPmt : 0) + (results.taxMaintenances[i] / 12)) * 12;
            rentSum += results.rentExpenses[i];
            buyCum.push(buySum); rentCum.push(rentSum);
        });
        this.cumulativeCostChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: results.years,
                datasets: [
                    { label: 'Cumul. Buy', data: buyCum, borderColor: '#28a745', tension: 0 },
                    { label: 'Cumul. Rent', data: rentCum, borderColor: '#007bff', tension: 0 }
                ]
            },
            options: { responsive: true, animation: false }
        });
    }

    updateBreakdownTable(results) {
        if (!this.breakdownTableBody) return;
        this.breakdownTableBody.innerHTML = results.years.map((y, i) => `
            <tr>
                <td>${y}</td>
                <td>${this.formatCurrency(results.buyReals[i])}</td>
                <td>${this.formatCurrency(results.rentReals[i])}</td>
                <td>${this.formatCurrency(results.premiums[i] / (y * 12))}</td>
            </tr>
        `).join('');
    }

    formatCurrency(v) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v); }
}
