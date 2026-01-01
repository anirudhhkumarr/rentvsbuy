import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { RentBuyCalculator } from './calculator.js';

export class WhatIfAnalysis {
    constructor() {
        this.calculator = new RentBuyCalculator();
        this.chart = null;
        this.setupEventListeners();
        this.setupDoubleRangeSliders();
        this.initializeDefaults();
        this.loadSavedSettings();
    }

    setupEventListeners() {
        const ids = ['xAxisParameter', 'yAxisParameter'];
        ids.forEach(id => document.getElementById(id).addEventListener('change', () => { this.updateAxisOptions(); this.saveSettings(); }));
        document.getElementById('runAnalysis').addEventListener('click', () => this.runAnalysis());
        this.setupSliderListeners();
        this.setupBaseScenarioToggle();
    }

    setupSliderListeners() {
        const sliders = [
            { id: 'baseRent', display: 'baseRentValue', format: v => `$${parseInt(v).toLocaleString()}` },
            { id: 'baseRentIncrease', display: 'baseRentIncreaseValue', format: v => `${parseFloat(v).toFixed(1)}%` },
            { id: 'baseTaxRate', display: 'baseTaxRateValue', format: v => `${parseFloat(v).toFixed(2)}%` },
            { id: 'baseHomeReturn', display: 'baseHomeReturnValue', format: v => `${parseFloat(v).toFixed(1)}%` },
            { id: 'baseStockReturn', display: 'baseStockReturnValue', format: v => `${parseFloat(v).toFixed(1)}%` },
            { id: 'baseInflation', display: 'baseInflationValue', format: v => `${parseFloat(v).toFixed(1)}%` },
            { id: 'baseLoanTerm', display: 'baseLoanTermValue', format: v => `${parseInt(v)}` },
            { id: 'investingHorizon', display: 'investingHorizonValue', format: v => `${parseInt(v)}` },
            { id: 'baseClosingCost', display: 'baseClosingCostValue', format: v => `${parseFloat(v).toFixed(1)}%` },
            { id: 'interestMin', display: 'interestMinValue', format: v => `${parseFloat(v).toFixed(2)}%` },
            { id: 'interestMax', display: 'interestMaxValue', format: v => `${parseFloat(v).toFixed(2)}%` },
            { id: 'priceMin', display: 'priceMinValue', format: v => `$${(parseFloat(v) / 1000000).toFixed(1)}M` },
            { id: 'priceMax', display: 'priceMaxValue', format: v => `$${(parseFloat(v) / 1000000).toFixed(1)}M` },
            { id: 'downMin', display: 'downMinValue', format: v => `$${(parseFloat(v) / 1000).toFixed(0)}K` },
            { id: 'downMax', display: 'downMaxValue', format: v => `$${(parseFloat(v) / 1000).toFixed(0)}K` },
            { id: 'interestSingle', display: 'interestSingleValue', format: v => `${parseFloat(v).toFixed(2)}%` },
            { id: 'priceSingle', display: 'priceSingleValue', format: v => `$${(parseFloat(v) / 1000000).toFixed(2)}M` },
            { id: 'downSingle', display: 'downSingleValue', format: v => `$${(parseFloat(v) / 1000).toFixed(0)}K` },
            { id: 'horizonSingle', display: 'horizonSingleValue', format: v => `${v} years` },
            { id: 'horizonMin', display: 'horizonMinValue', format: v => `${v} years` },
            { id: 'horizonMax', display: 'horizonMaxValue', format: v => `${v} years` }
        ];

        sliders.forEach(s => {
            const el = document.getElementById(s.id);
            const disp = document.getElementById(s.display);
            if (el && disp) el.addEventListener('input', () => { disp.textContent = s.format(el.value); this.validateRanges(); this.saveSettings(); });
        });
    }

    setupBaseScenarioToggle() {
        const btn = document.getElementById('toggleBaseScenario');
        const section = document.querySelector('.base-scenario');
        if (btn && section) btn.addEventListener('click', () => {
            const hidden = section.style.display === 'none';
            section.style.display = hidden ? 'block' : 'none';
            btn.innerHTML = hidden ? '<i class="fas fa-cog"></i> Hide Advanced Settings <i class="fas fa-chevron-up"></i>' : '<i class="fas fa-cog"></i> Advanced Settings <i class="fas fa-chevron-down"></i>';
        });
    }

    validateRanges() {
        // Basic range validation
        ['interest', 'price', 'down', 'horizon'].forEach(p => {
            const min = document.getElementById(`${p}Min`), max = document.getElementById(`${p}Max`);
            if (min && max && parseFloat(min.value) >= parseFloat(max.value)) {
                max.value = parseFloat(min.value) + (parseFloat(min.step) || 1);
                const disp = document.getElementById(`${p}MaxValue`);
                if (disp) disp.textContent = max.value + (p === 'interest' ? '%' : '');
            }
        });
    }

    setupDoubleRangeSliders() {
        ['interest', 'price', 'down', 'horizon'].forEach(p => this.setupDoubleSlider(p));
    }

    setupDoubleSlider(p) {
        const minS = document.getElementById(`${p}Min`), maxS = document.getElementById(`${p}Max`);
        const track = document.getElementById(`${p}Track`);
        if (!minS || !maxS || !track) return;
        const update = () => {
            const min = parseFloat(minS.min), max = parseFloat(minS.max);
            const p1 = (parseFloat(minS.value) - min) / (max - min) * 100;
            const p2 = (parseFloat(maxS.value) - min) / (max - min) * 100;
            track.style.left = p1 + '%';
            track.style.width = (p2 - p1) + '%';
        };
        minS.addEventListener('input', update); maxS.addEventListener('input', update);
        update();
    }

    initializeDefaults() {
        document.getElementById('xAxisParameter').value = 'mortgageRate';
        document.getElementById('yAxisParameter').value = 'homePrice';
        this.updateAxisOptions();
    }

    updateAxisOptions() {
        const x = document.getElementById('xAxisParameter'), y = document.getElementById('yAxisParameter');
        if (x.value === y.value) y.value = ['mortgageRate', 'homePrice', 'downPayment'].find(o => o !== x.value);
        this.updateParameterControls();
    }

    updateParameterControls() {
        const selected = [document.getElementById('xAxisParameter').value, document.getElementById('yAxisParameter').value];
        const map = { 'mortgageRate': 'interest', 'homePrice': 'price', 'downPayment': 'down', 'investingHorizon': 'horizon' };
        Object.entries(map).forEach(([param, prefix]) => {
            const range = document.getElementById(`${prefix}RangeContainer`);
            const single = document.querySelector(`#${prefix === 'interest' ? 'interestRateGroup' : prefix === 'price' ? 'homePriceGroup' : prefix === 'down' ? 'downPaymentGroup' : 'investingHorizonGroup'} .single-slider-container`);
            if (range) range.style.display = selected.includes(param) ? 'grid' : 'none';
            if (single) single.style.display = selected.includes(param) ? 'none' : 'block';
        });
    }

    async runAnalysis() {
        const btn = document.getElementById('runAnalysis');
        const load = document.getElementById('loadingIndicator');
        const res = document.getElementById('chartResults');
        const section = document.getElementById('resultsSection');
        btn.disabled = true; section.style.display = 'block'; load.style.display = 'block'; res.style.display = 'none';
        try {
            const xParam = document.getElementById('xAxisParameter').value, yParam = document.getElementById('yAxisParameter').value;
            const xRange = this.getParameterRange(xParam), yRange = this.getParameterRange(yParam);
            const base = this.getBaseScenario();
            const results = await this.calculateHeatmapData(xParam, yParam, xRange, yRange, base);
            this.createHeatmapChart(results, xParam, yParam);
            load.style.display = 'none'; res.style.display = 'block';
        } catch (e) {
            console.error(e); alert('Analysis failed.');
        } finally {
            btn.disabled = false; btn.innerHTML = '<i class="fas fa-play"></i> Run Analysis';
        }
    }

    getParameterRange(p) {
        const isSelected = [document.getElementById('xAxisParameter').value, document.getElementById('yAxisParameter').value].includes(p);
        if (isSelected) {
            const map = { 'mortgageRate': 'interest', 'homePrice': 'price', 'downPayment': 'down', 'investingHorizon': 'horizon' };
            const min = parseFloat(document.getElementById(`${map[p]}Min`).value), max = parseFloat(document.getElementById(`${map[p]}Max`).value);
            const step = parseFloat(document.getElementById(`${map[p]}Min`).step || 1);
            const range = [];
            for (let v = min; v <= max + 0.0001; v += step) range.push(v);
            return range;
        }
        const singleMap = { 'mortgageRate': 'interestSingle', 'homePrice': 'priceSingle', 'downPayment': 'downSingle', 'investingHorizon': 'horizonSingle' };
        return [parseFloat(document.getElementById(singleMap[p]).value)];
    }

    getBaseScenario() {
        return {
            monthlyRent: parseFloat(document.getElementById('baseRent').value),
            rentIncrease: parseFloat(document.getElementById('baseRentIncrease').value),
            taxMaintenanceRate: parseFloat(document.getElementById('baseTaxRate').value),
            homeReturn: parseFloat(document.getElementById('baseHomeReturn').value),
            stockReturn: parseFloat(document.getElementById('baseStockReturn').value),
            inflation: parseFloat(document.getElementById('baseInflation').value),
            loanTerm: parseInt(document.getElementById('baseLoanTerm').value),
            investingHorizon: parseInt(document.getElementById('investingHorizon').value),
            closingCostRate: parseFloat(document.getElementById('baseClosingCost').value)
        };
    }

    async calculateHeatmapData(xParam, yParam, xRange, yRange, base) {
        const results = { xValues: xRange, yValues: yRange, data: [], xParam, yParam };
        for (let i = 0; i < yRange.length; i++) {
            results.data.push([]);
            for (let j = 0; j < xRange.length; j++) {
                const scenario = this.createScenario(xParam, xRange[j], yParam, yRange[i], base);
                const calc = this.calculator.calculateAll(scenario);
                const hIdx = calc.years.findIndex(y => y >= scenario.investingHorizon);
                const idx = hIdx === -1 ? calc.years.length - 1 : hIdx;
                const diff = calc.rentReals[idx] - calc.buyReals[idx];
                results.data[i].push({ difference: diff, recommendation: diff > 0 ? 'rent' : 'buy' });
            }
            if (i % 2 === 0) await new Promise(r => setTimeout(r, 0));
        }
        return results;
    }

    createScenario(xP, xV, yP, yV, base) {
        let s = { ...base, rent: base.monthlyRent * 12, mortgageRate: 6.25, homePrice: 1750000, downPayment: 525000 };
        ['mortgageRate', 'homePrice', 'downPayment', 'investingHorizon'].forEach(p => {
            if (![xP, yP].includes(p)) s[p] = this.getParameterRange(p)[0];
        });
        s[xP] = xV; s[yP] = yV;
        return s;
    }

    createHeatmapChart(results, xParam, yParam) {
        const ctx = document.getElementById('heatmapChart').getContext('2d');
        if (this.chart) this.chart.destroy();
        const datasets = [];
        const buyData = [], rentData = [];
        results.data.forEach((row, i) => {
            row.forEach((p, j) => {
                const pt = { x: results.xValues[j], y: results.yValues[i], diff: p.difference };
                if (p.recommendation === 'buy') buyData.push(pt); else rentData.push(pt);
            });
        });
        datasets.push({ label: 'Buy Better', data: buyData, backgroundColor: 'rgba(40, 167, 69, 0.6)', pointRadius: 6 });
        datasets.push({ label: 'Rent Better', data: rentData, backgroundColor: 'rgba(0, 123, 255, 0.6)', pointRadius: 6 });
        this.chart = new Chart(ctx, {
            type: 'scatter',
            data: { datasets },
            options: {
                scales: {
                    x: { title: { display: true, text: xParam } },
                    y: { title: { display: true, text: yParam } }
                }
            }
        });
    }

    loadSavedSettings() { }
    saveSettings() { }
}
