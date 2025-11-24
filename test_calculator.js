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
        loanTerm: 1,
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

    const results = calculator.calculateAll(calculator.getInputs());
    
    // Complete data breakdown with all columns
    console.log('\n=== COMPLETE DATA BREAKDOWN ===\n');
    
    for (let i = 0; i < results.years.length; i++) {
        const year = results.years[i];
        
        console.log(`YEAR ${year}:`);
        console.log(`  BUY SCENARIO:`);
        console.log(`    Loan Balance: $${results.loans[i].toLocaleString()}`);
        console.log(`    Interest Paid: $${results.interests[i].toLocaleString()}`);
        console.log(`    Taxable Value: $${results.taxableValues[i].toLocaleString()}`);
        console.log(`    Tax + Maintenance: $${results.taxMaintenances[i].toLocaleString()}`);
        console.log(`    Home Value: $${results.homeValues[i].toLocaleString()}`);
        console.log(`    Selling Price: $${results.sellingPrices[i].toLocaleString()}`);
        console.log(`    Capital Gain: $${results.capitalGains[i].toLocaleString()}`);
        console.log(`    Tax on Gain: $${results.taxes[i].toLocaleString()}`);
        console.log(`    Buy Value (After Tax): $${results.buyValues[i].toLocaleString()}`);
        console.log(`    Buy Real (Inflation Adjusted): $${results.buyReals[i].toFixed(0)}`);
        
        console.log(`  RENT SCENARIO:`);
        console.log(`    Start Balance: $${results.rentStartBalances[i].toLocaleString()}`);
        console.log(`    Stock Return (6%): $${results.rentReturns[i].toLocaleString()}`);
        console.log(`    Rent Expense: $${results.rentExpenses[i].toLocaleString()}`);
        console.log(`    New Investment: $${results.newInvestments[i].toLocaleString()}`);
        console.log(`    Year End Balance: $${results.yearEndBalances[i].toLocaleString()}`);
        console.log(`    Total Invested: $${results.totalInvested[i].toLocaleString()}`);
        console.log(`    Gains: $${(results.yearEndBalances[i] - results.totalInvested[i]).toLocaleString()}`);
        console.log(`    Tax on Gains (33%): $${results.rentTaxes[i].toLocaleString()}`);
        console.log(`    Rent Value (After Tax): $${results.rentValues[i].toLocaleString()}`);
        console.log(`    Rent Real (Inflation Adjusted): $${results.rentReals[i].toFixed(0)}`);
        
        console.log(`  COMPARISON:`);
        console.log(`    Premium (Rent - Buy): $${results.premiums[i].toFixed(0)}`);
        console.log(`    Recommendation: ${results.premiums[i] > 0 ? 'RENT' : 'BUY'}`);
        console.log('');
    }
};

testCalculator();
