// Test script for Rent vs Buy Calculator
// This will test the actual script.js implementation

// Mock DOM elements for testing
global.document = {
    getElementById: (id) => ({
        value: '0',
        textContent: '',
        addEventListener: () => {},
        querySelectorAll: () => []
    })
};

// Mock Chart.js
global.Chart = class {
    constructor() {}
    destroy() {}
};

// Mock console to capture output
const originalConsoleLog = console.log;
const capturedLogs = [];
console.log = (...args) => {
    capturedLogs.push(args.join(' '));
    originalConsoleLog(...args);
};

// Test the calculator logic
const { RentBuyCalculator } = require('./calculator.js');

const testCalculator = () => {
    const calculator = new RentBuyCalculator();
    
    // Set test inputs matching Excel parameters exactly
    calculator.setInputs({
        homePrice: 1750000,  // G3: $1.75M (actual Excel value)
        downPayment: 525000, // B9: $525K
        loanTerm: 30,
        mortgageRate: 6.25,
        mortgagePoints: 0,    // B8: $0
        taxMaintenanceRate: 1.11,
        rent: 54000,         // B16: $54K
        rentIncrease: 5,
        propertyReassessmentRate: 1,
        homeReturn: 3,
        stockReturn: 6,
        inflation: 2,
        closingCostRate: 3
    });

    console.log('Testing calculator with Excel parameters...');
    const results = calculator.calculateForTesting();
    
    console.log('\n=== COMPREHENSIVE YEARLY BREAKDOWN ===');
    for (let i = 0; i < results.years.length; i++) {
        const year = results.years[i];
        console.log(`\n--- YEAR ${year} ---`);
        
        // BUY SCENARIO
        console.log(`BUY SCENARIO:`);
        console.log(`  Loan Balance: $${results.loans[i].toLocaleString()}`);
        console.log(`  Interest Paid: $${results.interests[i].toLocaleString()}`);
        console.log(`  Property Tax + Maintenance: $${results.taxMaintenances[i].toLocaleString()}`);
        console.log(`  Home Value: $${results.homeValues[i].toLocaleString()}`);
        console.log(`  Selling Price: $${results.sellingPrices[i].toLocaleString()}`);
        console.log(`  Capital Gain: $${results.capitalGains[i].toLocaleString()}`);
        console.log(`  Tax on Gain: $${results.taxes[i].toLocaleString()}`);
        console.log(`  Buy Value (After Tax): $${results.buyValues[i].toLocaleString()}`);
        console.log(`  Buy Real (Inflation Adjusted): $${results.buyReals[i].toFixed(0)}`);
        
        // RENT SCENARIO
        console.log(`RENT SCENARIO:`);
        console.log(`  Start Balance: $${results.rentStartBalances[i].toLocaleString()}`);
        console.log(`  Stock Return (6%): $${results.rentReturns[i].toLocaleString()}`);
        console.log(`  Rent Expense: $${results.rentExpenses[i].toLocaleString()}`);
        console.log(`  New Investment: $${results.newInvestments[i].toLocaleString()}`);
        console.log(`  Year End Balance: $${results.yearEndBalances[i].toLocaleString()}`);
        console.log(`  Total Invested: $${results.totalInvested[i].toLocaleString()}`);
        console.log(`  Gains: $${(results.yearEndBalances[i] - results.totalInvested[i]).toLocaleString()}`);
        console.log(`  Tax on Gains (33%): $${results.rentTaxes[i].toLocaleString()}`);
        console.log(`  Rent Value (After Tax): $${results.rentValues[i].toLocaleString()}`);
        console.log(`  Rent Real (Inflation Adjusted): $${results.rentReals[i].toFixed(0)}`);
        
        // COMPARISON
        console.log(`COMPARISON:`);
        console.log(`  Premium (Rent - Buy): $${results.premiums[i].toFixed(0)}`);
        console.log(`  Recommendation: ${results.premiums[i] > 0 ? 'RENT' : 'BUY'}`);
        
        // Only show detailed breakdown for first 5 years and last 5 years to avoid spam
        if (year > 5 && year < results.years.length - 5) {
            console.log(`  [Skipping detailed output for middle years...]`);
            break;
        }
    }
    
        // Final comparison
    const finalYear = results.years.length - 1;
    const actualFinalYear = results.years[finalYear];
    console.log(`\n=== FINAL COMPARISON (Year ${actualFinalYear}) ===`);
    console.log(`Buy Real (Final): $${results.buyReals[finalYear].toFixed(2)}`);
    console.log(`Rent Real (Final): $${results.rentReals[finalYear].toFixed(2)}`);
    console.log(`Difference (Rent - Buy): $${(results.rentReals[finalYear] - results.buyReals[finalYear]).toFixed(2)}`);

    if (results.rentReals[finalYear] > results.buyReals[finalYear]) {
        console.log('RECOMMENDATION: RENT is better');
    } else {
        console.log('RECOMMENDATION: BUY is better');
    }
    
    console.log('\n=== ANALYSIS SUMMARY ===');
    console.log(`Total Years Analyzed: ${results.years.length}`);
    console.log(`Loan Term: ${results.loans[0]} years`);
    console.log(`Initial Down Payment: $${results.rentStartBalances[0].toLocaleString()}`);
    console.log(`Initial Home Price: $${results.homeValues[0].toLocaleString()}`);
    
    // Check for anomalies in rent investment
    console.log('\n=== RENT INVESTMENT ANALYSIS ===');
    const lastFewYears = results.years.slice(-5);
    lastFewYears.forEach((year, index) => {
        const yearIndex = results.years.length - 5 + index;
        console.log(`Year ${year}: New Investment: $${results.newInvestments[yearIndex].toLocaleString()}, Total Invested: $${results.totalInvested[yearIndex].toLocaleString()}`);
    });
    
    // Check if rent scenario is getting artificial boosts
    console.log('\n=== POTENTIAL ISSUES ===');
    const lastYearIndex = results.years.length - 1;
    const lastYearInvestment = results.newInvestments[lastYearIndex];
    const lastYearTaxMaintenance = results.taxMaintenances[lastYearIndex];
    console.log(`Last Year Investment: $${lastYearInvestment.toLocaleString()}`);
    console.log(`Last Year Tax/Maintenance: $${lastYearTaxMaintenance.toLocaleString()}`);
    console.log(`Last Year Loan Balance: $${results.loans[lastYearIndex].toLocaleString()}`);
    
    if (results.loans[lastYearIndex] === 0 && lastYearInvestment > 0) {
        console.log('⚠️  WARNING: Renter still investing after loan is paid off!');
    }

console.log('Test completed successfully!');
};

testCalculator();
