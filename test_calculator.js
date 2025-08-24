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
    
    console.log('\nResults for key years:');
    for (let i = 0; i < results.years.length; i++) {
        const year = results.years[i];
        // Show first 3 years, then every 5 years, then years around loan payoff, then final years
        if (year <= 3 || year % 5 === 0 || year >= 28) {
            console.log(`Year ${year}:`);
            console.log(`  Home Value: $${results.homeValues[i].toLocaleString()}`);
            console.log(`  Loan Balance: $${results.loans[i].toLocaleString()}`);
            console.log(`  Buy Real: $${results.buyReals[i].toFixed(0)}`);
            console.log(`  Rent Real: $${results.rentReals[i].toFixed(0)}`);
            console.log('');
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

console.log('Test completed successfully!');
};

testCalculator();
