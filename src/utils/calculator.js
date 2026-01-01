export class RentBuyCalculator {
    constructor() {
        // No DOM initialization - pure calculation class
    }

    setInputs(inputs) {
        this.testInputs = inputs;
    }

    getInputs() {
        if (this.testInputs) {
            return this.testInputs;
        }
        // Default inputs for testing - using exact Excel values
        return {
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
        };
    }

    calculateAll(inputs) {
        const results = {
            years: [],
            loans: [],
            interests: [],
            taxableValues: [],
            taxMaintenances: [],
            homeValues: [],
            sellingPrices: [],
            capitalGains: [],
            taxes: [],
            buyValues: [],
            buyReals: [],
            rentStartBalances: [],
            rentReturns: [],
            rentExpenses: [],
            newInvestments: [],
            yearEndBalances: [],
            totalInvested: [],
            rentTaxes: [],
            rentValues: [],
            rentReals: [],
            premiums: []
        };

        // Constants for Tax Logic
        const FED_RATE = 0.238; // 20% Capital Gains + 3.8% NIIT
        const CA_BASE_RATE = 0.123;
        const CA_MENTAL_HEALTH_TAX = 0.01; // 1% MHSA Tax on income > $1M
        const CA_RATE = CA_BASE_RATE + CA_MENTAL_HEALTH_TAX; // 13.3% Total CA Rate
        const TAX_RATE = FED_RATE + CA_RATE; // 37.1% Total Capital Gains Rate

        const CAPITAL_GAINS_EXCLUSION = 500000;

        // Mortgage Interest Deduction Limits
        const FED_LOAN_LIMIT = 750000;
        const CA_LOAN_LIMIT = 1000000;
        const FED_STD = 29200; // 2024 MFJ
        const CA_STD = 10726;  // 2024 MFJ
        const FED_SALT_CAP = 10000;

        // Calculate monthly mortgage payment (C12 reference)
        const monthlyPayment = this.calculateMonthlyPayment(inputs);
        const yearlyPayment = monthlyPayment * 12;

        // Initial values (Row 3 values) - Year 1
        let previousLoan = inputs.homePrice - inputs.downPayment;
        let previousInterest = (inputs.mortgageRate / 100) * previousLoan;
        let previousTaxableValue = inputs.homePrice;
        let previousTaxMaintenance = previousTaxableValue * (inputs.taxMaintenanceRate / 100);
        let previousHomeValue = inputs.homePrice * (1 + inputs.homeReturn / 100);
        let previousSellingPrice = previousHomeValue * (1 - inputs.closingCostRate / 100);

        // Capital Gains Tax Logic
        // Basis is Purchase Price (inputs.homePrice), not Taxable Value
        let previousCapitalGain = Math.max(0, previousSellingPrice - inputs.homePrice);
        // Apply Exclusion to entire gain
        let previousTaxableGain = Math.max(0, previousCapitalGain - CAPITAL_GAINS_EXCLUSION);
        let previousTax = previousTaxableGain * TAX_RATE;

        let previousBuyValue = previousSellingPrice - Math.max(0, previousLoan + previousInterest - yearlyPayment) - previousTax;
        let previousBuyReal = previousBuyValue / Math.pow(1 + inputs.inflation / 100, 1);

        // Tax Savings Calculation (Year 1)
        // Updated to split Federal and CA for accurate deduction limits
        // Using constants defined above

        let fedDeductibleInterest = previousInterest * Math.min(1, FED_LOAN_LIMIT / (inputs.homePrice - inputs.downPayment));
        let caDeductibleInterest = previousInterest * Math.min(1, CA_LOAN_LIMIT / (inputs.homePrice - inputs.downPayment));

        // Federal Calculation
        // Federal Itemized = Deductible Mortgage Interest + SALT Cap ($10k)
        let fedItemized = fedDeductibleInterest + FED_SALT_CAP;
        let fedSavings = Math.max(0, fedItemized - FED_STD) * FED_RATE;

        // California Calculation
        // CA Itemized = Deductible Mortgage Interest + Property Tax (no SALT cap)
        let caItemized = caDeductibleInterest + previousTaxMaintenance;
        let caSavings = Math.max(0, caItemized - CA_STD) * CA_RATE;

        let taxSavings = fedSavings + caSavings;

        // For rent side, start with down payment amount invested
        let previousRentStartBalance = inputs.downPayment;
        let previousRentReturn = previousRentStartBalance * (inputs.stockReturn / 100);
        let previousRentExpense = inputs.rent;

        // New Investment Calculation
        // Buyer's Cost = Mortgage + Tax/Maint - Tax Savings
        // Renter's Surplus = Buyer's Cost - Rent
        // Note: yearlyPayment includes Principal + Interest
        let buyerAnnualCost = (previousLoan > 0 ? yearlyPayment : 0) + previousTaxMaintenance - taxSavings;
        let previousNewInvestment = buyerAnnualCost - previousRentExpense;

        let previousYearEndBalance = previousRentStartBalance + previousRentReturn + previousNewInvestment;
        let previousTotalInvested = inputs.downPayment + previousNewInvestment;
        let previousRentTax = (previousYearEndBalance - previousTotalInvested) * TAX_RATE;
        let previousRentValue = previousYearEndBalance - previousRentTax;
        let previousRentReal = previousRentValue / Math.pow(1 + inputs.inflation / 100, 1);

        // Store initial values (Year 1)
        results.years.push(1);
        results.loans.push(previousLoan);
        results.interests.push(previousInterest);
        results.taxableValues.push(previousTaxableValue);
        results.taxMaintenances.push(previousTaxMaintenance);
        results.homeValues.push(previousHomeValue);
        results.sellingPrices.push(previousSellingPrice);
        results.capitalGains.push(previousCapitalGain);
        results.taxes.push(previousTax);
        results.buyValues.push(previousBuyValue);
        results.buyReals.push(previousBuyReal);
        results.rentStartBalances.push(previousRentStartBalance);
        results.rentReturns.push(previousRentReturn);
        results.rentExpenses.push(previousRentExpense);
        results.newInvestments.push(previousNewInvestment);
        results.yearEndBalances.push(previousYearEndBalance);
        results.totalInvested.push(previousTotalInvested);
        results.rentTaxes.push(previousRentTax);
        results.rentValues.push(previousRentValue);
        results.rentReals.push(previousRentReal);
        results.premiums.push(previousRentReal - previousBuyReal);

        const maxYears = inputs.investingHorizon ? inputs.investingHorizon : inputs.loanTerm + 10;

        for (let year = 2; year <= maxYears; year++) {
            const loan = Math.max(0, previousLoan + previousInterest - yearlyPayment);
            const interest = (inputs.mortgageRate / 100) * loan;
            const taxableValue = previousTaxableValue * (1 + inputs.propertyReassessmentRate / 100);
            const taxMaintenance = taxableValue * (inputs.taxMaintenanceRate / 100);
            const homeValue = previousHomeValue * (1 + inputs.homeReturn / 100);
            const sellingPrice = homeValue * (1 - inputs.closingCostRate / 100); // Column J: Selling price (Excel formula: =I{row}*0.97)

            // Capital Gains
            const capitalGain = Math.max(0, sellingPrice - inputs.homePrice);
            const taxableGain = Math.max(0, capitalGain - CAPITAL_GAINS_EXCLUSION);
            const tax = taxableGain * TAX_RATE;

            const endOfYearLoan = Math.max(0, loan + interest - yearlyPayment);
            const buyValue = sellingPrice - endOfYearLoan - tax;
            const buyReal = buyValue / Math.pow(1 + inputs.inflation / 100, year);

            // Tax Savings (Year N)
            // Updated to split Federal and CA for accurate deduction limits
            // Using constants defined above

            let fedDeductibleInterest = 0;
            let caDeductibleInterest = 0;

            if (loan > 0) {
                fedDeductibleInterest = interest * Math.min(1, FED_LOAN_LIMIT / loan);
                caDeductibleInterest = interest * Math.min(1, CA_LOAN_LIMIT / loan);
            }

            // Federal Calculation
            // Federal Itemized = Deductible Mortgage Interest + SALT Cap ($10k)
            let fedItemized = fedDeductibleInterest + FED_SALT_CAP;
            let fedSavings = Math.max(0, fedItemized - FED_STD) * FED_RATE;

            // California Calculation
            // CA Itemized = Deductible Mortgage Interest + Property Tax (no SALT cap)
            let caItemized = caDeductibleInterest + taxMaintenance;
            let caSavings = Math.max(0, caItemized - CA_STD) * CA_RATE;

            let taxSavings = fedSavings + caSavings;

            const rentStartBalance = previousYearEndBalance;
            const rentReturn = rentStartBalance * (inputs.stockReturn / 100);
            const rentExpense = previousRentExpense * (1 + inputs.rentIncrease / 100);

            // New Investment
            let buyerAnnualCost = (loan > 0 ? yearlyPayment : 0) + taxMaintenance - taxSavings;
            const newInvestment = buyerAnnualCost - rentExpense;

            const yearEndBalance = rentStartBalance + rentReturn + newInvestment;
            const totalInvested = previousTotalInvested + newInvestment;
            const rentTax = (yearEndBalance - totalInvested) * TAX_RATE;
            const rentValue = yearEndBalance - rentTax;
            const rentReal = rentValue / Math.pow(1 + inputs.inflation / 100, year);
            const premium = rentReal - buyReal;

            // Store results
            results.years.push(year);
            results.loans.push(loan);
            results.interests.push(interest);
            results.taxableValues.push(taxableValue);
            results.taxMaintenances.push(taxMaintenance);
            results.homeValues.push(homeValue);
            results.sellingPrices.push(sellingPrice);
            results.capitalGains.push(capitalGain);
            results.taxes.push(tax);
            results.buyValues.push(buyValue);
            results.buyReals.push(buyReal);
            results.rentStartBalances.push(rentStartBalance);
            results.rentReturns.push(rentReturn);
            results.rentExpenses.push(rentExpense);
            results.newInvestments.push(newInvestment);
            results.yearEndBalances.push(yearEndBalance);
            results.totalInvested.push(totalInvested);
            results.rentTaxes.push(rentTax);
            results.rentValues.push(rentValue);
            results.rentReals.push(rentReal);
            results.premiums.push(premium);

            // Update previous values
            previousLoan = loan;
            previousInterest = interest;
            previousTaxableValue = taxableValue;
            previousTaxMaintenance = taxMaintenance;
            previousHomeValue = homeValue;
            previousSellingPrice = sellingPrice;
            previousCapitalGain = capitalGain;
            previousTax = tax;
            previousBuyValue = buyValue;
            previousBuyReal = buyReal;
            previousRentStartBalance = rentStartBalance;
            previousRentReturn = rentReturn;
            previousRentExpense = rentExpense;
            previousNewInvestment = newInvestment;
            previousYearEndBalance = yearEndBalance;
            previousTotalInvested = totalInvested;
            previousRentTax = rentTax;
            previousRentValue = rentValue;
            previousRentReal = rentReal;
        }

        return results;
    }

    calculateLoanAmount(inputs, year) {
        if (year === 0) return inputs.homePrice - inputs.downPayment;

        const monthlyRate = inputs.mortgageRate / 100 / 12;
        const monthlyPayment = this.calculateMonthlyPayment(inputs);

        // Calculate remaining balance after 'year' years of payments
        const remainingPayments = (inputs.loanTerm - year) * 12;
        const remainingBalance = monthlyPayment * (1 - Math.pow(1 + monthlyRate, -remainingPayments)) / monthlyRate;

        return remainingBalance;
    }

    calculateMonthlyPayment(inputs) {
        // Excel PMT formula: =-PMT(B7,B5,B10,0,0)/12
        // Where B7=annual rate, B5=years, B10=loan amount
        const annualRate = inputs.mortgageRate / 100;  // B7
        const years = inputs.loanTerm;                 // B5  
        const loanAmount = inputs.homePrice - inputs.downPayment; // B10

        // Excel PMT function calculation
        // PMT(rate, nper, pv, fv, type) where fv=0, type=0

        // PMT formula: pv * rate * (1 + rate)^nper / ((1 + rate)^nper - 1)
        const pmtAnnual = loanAmount * annualRate * Math.pow(1 + annualRate, years) / (Math.pow(1 + annualRate, years) - 1);

        // Excel divides by 12: =-PMT(...)/12
        const monthlyPayment = pmtAnnual / 12;

        // Excel PMT calculation complete

        return monthlyPayment;
    }

    calculateMonthlyBuyCost(inputs) {
        const monthlyPayment = this.calculateMonthlyPayment(inputs);
        const monthlyTaxMaintenance = inputs.homePrice * (inputs.taxMaintenanceRate / 100) / 12;
        return monthlyPayment + monthlyTaxMaintenance;
    }

    // Method for testing without DOM
    calculateForTesting() {
        const inputs = this.getInputs();
        return this.calculateAll(inputs);
    }
}
