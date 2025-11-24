class RentBuyCalculator {
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

        // Calculate monthly mortgage payment (C12 reference)
        const monthlyPayment = this.calculateMonthlyPayment(inputs);
        const yearlyPayment = monthlyPayment * 12;

        // Initial values (Row 3 values) - Year 1
        // E3: =B10, where B10 is the loan amount after down payment and any adjustments
        let previousLoan = inputs.homePrice - inputs.downPayment; // E3: =B10 calculation
        let previousInterest = (inputs.mortgageRate / 100) * previousLoan; // F3: =$B$7*E3
        let previousTaxableValue = inputs.homePrice; // G3: =B3
        let previousTaxMaintenance = previousTaxableValue * (inputs.taxMaintenanceRate / 100); // H3: =G3*$B$13
        let previousHomeValue = inputs.homePrice * (1 + inputs.homeReturn / 100); // I3: =B3*(1+$B$20)
        let previousSellingPrice = previousHomeValue * 0.97; // J3: =I3*0.97
        let previousCapitalGain = Math.max(0, previousSellingPrice - previousTaxableValue); // K3: =max(0,J3-G3)
        let previousTax = Math.max(0, previousCapitalGain - 500000) * 0.33; // L3: =max(0,K3-500000)*0.33 (20% federal + 13% California)
        let previousBuyValue = previousSellingPrice - Math.max(0, previousLoan + previousInterest - yearlyPayment) - previousTax; // M3: =J3-E3-L3
        let previousBuyReal = previousBuyValue / Math.pow(1 + inputs.inflation / 100, 1); // N3: =M3/(1+$B$22)^D3
        
        // For rent side, start with down payment amount invested
        let previousRentStartBalance = inputs.downPayment; // P3: =B9+B8
        let previousRentReturn = previousRentStartBalance * (inputs.stockReturn / 100); // Q3: =(P3)*$B$21
        let previousRentExpense = inputs.rent; // R3: =B16
        let previousNewInvestment = (previousLoan > 0 ? yearlyPayment : 0) - previousRentExpense + previousTaxMaintenance; // S3: =IF(E3>0,-$C$12,0)-R3+H3 (C12 is negative, so -$C$12 is positive)
        let previousYearEndBalance = previousRentStartBalance + previousRentReturn + previousNewInvestment; // T3: =P3+Q3+S3
        let previousTotalInvested = inputs.downPayment + previousNewInvestment; // U3: =$P$3+sum($S$3:S3)
        let previousRentTax = (previousYearEndBalance - previousTotalInvested) * 0.368; // V3: =(T3-U3)*0.368 (20% federal + 13% California + 3.8% NIIT)
        let previousRentValue = previousYearEndBalance - previousRentTax; // W3: =T3-V3
        let previousRentReal = previousRentValue / Math.pow(1 + inputs.inflation / 100, 1); // X3: =W3/(1+$B$22)^D3

        // Calculator initialized and ready for web interface

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

        // Calculate number of years: use investingHorizon if provided (can be less or more than loanTerm), otherwise default to loanTerm + 10
        const maxYears = inputs.investingHorizon ? inputs.investingHorizon : inputs.loanTerm + 10;

        for (let year = 2; year <= maxYears; year++) {
            // Column E: Loan (Excel formula: =max(0,E{row-1}+F{row-1}+$C$12))
            // Since C12 is negative, this is: max(0, previous_loan + previous_interest - yearly_payment)
            const loan = Math.max(0, previousLoan + previousInterest - yearlyPayment);
            
            // Column F: Interest (Excel formula: =$B$7*E{row})
            const interest = (inputs.mortgageRate / 100) * loan;
            
            // Column G: Taxable value (Excel formula: =G{row-1}*(1+$B$18))
            const taxableValue = previousTaxableValue * (1 + inputs.propertyReassessmentRate / 100);
            
            // Column H: Tax + Maintenance (Excel formula: =G{row}*$B$13)
            const taxMaintenance = taxableValue * (inputs.taxMaintenanceRate / 100);
            
            // Column I: Home value (Excel formula: =I{row-1}*(1+$B$20))
            const homeValue = previousHomeValue * (1 + inputs.homeReturn / 100);
            
            // Column J: Selling price (Excel formula: =I{row}*0.97)
            const sellingPrice = homeValue * 0.97;
            
            // Column K: Capital gain (Excel formula: =max(0,J{row}-G{row}))
            const capitalGain = Math.max(0, sellingPrice - taxableValue);
            
            // Column L: Tax (Excel formula: =max(0,K{row}-500000)*0.33)
            const tax = Math.max(0, capitalGain - 500000) * 0.33; // 20% federal + 13% California
            
            // Column M: Buy Value (Excel formula: =J{row}-E{row}-L{row})
            // Use end-of-year loan balance (after making payments) for Buy Value calculation
            const endOfYearLoan = Math.max(0, loan + interest - yearlyPayment);
            const buyValue = sellingPrice - endOfYearLoan - tax;
            
            // Column N: Buy (Real) (Excel formula: =M{row}/(1+$B$22)^D{row})
            const buyReal = buyValue / Math.pow(1 + inputs.inflation / 100, year);
            
            // Column P: Start year balance (Excel formula: =T{row-1})
            const rentStartBalance = previousYearEndBalance;
            
            // Column Q: Return (Excel formula: =(P{row})*$B$21)
            const rentReturn = rentStartBalance * (inputs.stockReturn / 100);
            
            // Column R: Rent Expense (Excel formula: =R{row-1}*(1+$B$17))
            const rentExpense = previousRentExpense * (1 + inputs.rentIncrease / 100);
            
            // Column S: New Investments (Excel formula: =IF(E{row}>0,-$C$12,0)-R{row}+H{row})
            // Note: C12 is negative in Excel, so -$C$12 becomes positive
            const newInvestment = (loan > 0 ? yearlyPayment : 0) - rentExpense + taxMaintenance;
            
            // Column T: Year end balance (Excel formula: =P{row}+Q{row}+S{row})
            const yearEndBalance = rentStartBalance + rentReturn + newInvestment;
            
            // Column U: Total Invested (Excel formula: =$P$3+sum($S$3:S{row}))
            const totalInvested = previousTotalInvested + newInvestment;
            
            // Column V: Tax (Excel formula: =(T{row}-U{row})*0.368)
            const rentTax = (yearEndBalance - totalInvested) * 0.368; // 20% federal + 13% California + 3.8% NIIT
            
            // Column W: Rent Value (Excel formula: =T{row}-V{row})
            const rentValue = yearEndBalance - rentTax;
            
            // Column X: Rent (Real) (Excel formula: =W{row}/(1+$B$22)^D{row})
            const rentReal = rentValue / Math.pow(1 + inputs.inflation / 100, year);
            
            // Column Z: Premium (Excel formula: =X{row}-N{row})
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

            // Update previous values for next iteration
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
        const totalPayments = inputs.loanTerm * 12;
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
        const monthlyRate = annualRate / 12;
        const totalPayments = years * 12;
        
        // PMT formula: pv * rate * (1 + rate)^nper / ((1 + rate)^nper - 1)
        const pmtAnnual = loanAmount * annualRate * Math.pow(1 + annualRate, years) / (Math.pow(1 + annualRate, years) - 1);
        
        // Excel divides by 12: =-PMT(...)/12
        const monthlyPayment = pmtAnnual / 12;
        
        // Excel PMT calculation complete
        
        return monthlyPayment;
    }

    calculateMonthlyBuyCost(inputs, year) {
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

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RentBuyCalculator };
}
