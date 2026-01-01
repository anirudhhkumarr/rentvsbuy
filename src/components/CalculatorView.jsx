import { useEffect, useRef } from "react"
import "../assets/css/styles.css"
import { RentBuyCalculator } from "../utils/calculator.js"
import { RentBuyUI } from "../utils/script.js"

const CalculatorView = () => {
    const isInitialized = useRef(false)

    useEffect(() => {
        // Attach to window so legacy script can find it
        window.RentBuyCalculator = RentBuyCalculator

        if (!isInitialized.current) {
            new RentBuyUI()
            isInitialized.current = true
        }
    }, [])

    return (
        <div className="container">
            <header>
                <h1><i className="fas fa-home"></i> Rent vs Buy Calculator</h1>
                <p>Compare the financial implications of renting vs buying a home</p>
            </header>

            <div className="main-layout">
                <div className="sidebar">
                    <div className="input-panel primary">
                        <h3><i className="fas fa-home"></i> Property Details</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="homePrice">Home Price</label>
                                <div className="input-with-suffix">
                                    <input type="number" id="homePrice" defaultValue="1750000" min="100000" step="100000" />
                                    <span className="suffix">$</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="downPaymentPercent">Down Payment</label>
                                <div className="input-with-suffix">
                                    <input type="number" id="downPaymentPercent" defaultValue="30" min="0" step="5" />
                                    <span className="suffix">%</span>
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="loanTerm">Loan Term</label>
                                <div className="input-with-suffix">
                                    <input type="number" id="loanTerm" defaultValue="30" min="15" max="40" step="5" />
                                    <span className="suffix">Yr</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="mortgageRate">Mortgage Rate</label>
                                <div className="input-with-suffix">
                                    <input type="number" id="mortgageRate" defaultValue="6.25" min="2" max="10" step="0.1" />
                                    <span className="suffix">%</span>
                                </div>
                            </div>
                        </div>
                        <div className="calculated-fields-row">
                            <div className="calculated-field">
                                <span className="calc-label">Down Payment:</span>
                                <span id="downPaymentDisplay" className="calc-value">$525,000</span>
                            </div>
                            <div className="calculated-field">
                                <span className="calc-label">Loan Amount:</span>
                                <span id="loanAmountDisplay" className="calc-value">$1,225,000</span>
                            </div>
                        </div>
                    </div>

                    <div className="input-panel primary">
                        <h3><i className="fas fa-key"></i> Rental Option</h3>
                        <div className="form-group">
                            <label htmlFor="monthlyRent">Monthly Rent</label>
                            <div className="input-with-prefix">
                                <span className="prefix">$</span>
                                <input type="number" id="monthlyRent" defaultValue="4500" min="1000" step="100" />
                            </div>
                        </div>
                        <div className="calculated-field">
                            <span className="calc-label">Annual Rent:</span>
                            <span id="annualRentDisplay" className="calc-value">$54,000</span>
                        </div>
                    </div>

                    <div className="input-panel secondary collapsed">
                        <h3 className="collapsible-header">
                            <i className="fas fa-cog"></i> Advanced Settings
                            <i className="fas fa-chevron-down toggle-icon"></i>
                        </h3>
                        <div className="collapsible-content">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="rentIncrease">Annual Rent Increase</label>
                                    <div className="input-with-suffix">
                                        <input type="number" id="rentIncrease" defaultValue="5" min="0" max="10" step="0.5" />
                                        <span className="suffix">%</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="propertyReassessment">Reassessment Rate</label>
                                    <div className="input-with-suffix">
                                        <input type="number" id="propertyReassessment" defaultValue="1" min="0" max="5" step="0.1" />
                                        <span className="suffix">%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="propertyTax">Property Tax Rate</label>
                                    <div className="input-with-suffix">
                                        <input type="number" id="propertyTax" defaultValue="1.11" min="0" max="5" step="0.01" />
                                        <span className="suffix">%</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="closingCosts">Closing Costs</label>
                                    <div className="input-with-suffix">
                                        <input type="number" id="closingCosts" defaultValue="3" min="0" max="10" step="0.1" />
                                        <span className="suffix">%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="homeReturn">Home Appreciation</label>
                                    <div className="input-with-suffix">
                                        <input type="number" id="homeReturn" defaultValue="3" min="0" max="10" step="0.1" />
                                        <span className="suffix">%</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="stockReturn">Investment Return</label>
                                    <div className="input-with-suffix">
                                        <input type="number" id="stockReturn" defaultValue="6" min="0" max="15" step="0.1" />
                                        <span className="suffix">%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="inflation">Inflation Rate</label>
                                    <div className="input-with-suffix">
                                        <input type="number" id="inflation" defaultValue="2" min="0" max="10" step="0.1" />
                                        <span className="suffix">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="main-content">
                    <input type="hidden" id="downPayment" defaultValue="525000" />
                    <input type="hidden" id="loanAmount" defaultValue="1225000" />
                    <input type="hidden" id="annualRent" defaultValue="54000" />
                    <input type="hidden" id="propertyTaxAmount" defaultValue="19425" />
                    <input type="hidden" id="closingCostsAmount" defaultValue="52500" />
                    <input type="hidden" id="mortgagePoints" defaultValue="0" />

                    <div className="results-section">
                        <div className="summary-cards">
                            <div className="summary-card">
                                <div className="card-icon buy">
                                    <i className="fas fa-home"></i>
                                </div>
                                <div className="card-content">
                                    <h3>Buy Net Worth</h3>
                                    <p id="buyTotalCost">$0</p>
                                </div>
                            </div>
                            <div className="summary-card">
                                <div className="card-icon rent">
                                    <i className="fas fa-key"></i>
                                </div>
                                <div className="card-content">
                                    <h3>Rent Net Worth</h3>
                                    <p id="rentTotalCost">$0</p>
                                </div>
                            </div>
                            <div className="summary-card">
                                <div className="card-icon difference">
                                    <i className="fas fa-balance-scale"></i>
                                </div>
                                <div className="card-content">
                                    <h3>Difference</h3>
                                    <p id="costDifference">$0</p>
                                </div>
                            </div>
                            <div className="summary-card">
                                <div className="card-icon recommendation">
                                    <i className="fas fa-lightbulb"></i>
                                </div>
                                <div className="card-content">
                                    <h3>Recommendation</h3>
                                    <p id="recommendation">-</p>
                                </div>
                            </div>
                        </div>

                        <div className="charts-main-section">
                            <div className="charts-left">
                                <div className="chart-container">
                                    <div className="chart-header">
                                        <h3>Net Worth Comparison Over Time</h3>
                                    </div>
                                    <canvas id="costComparisonChart"></canvas>
                                    <div className="year-slider-container">
                                        <input type="range" id="yearSlider" className="year-slider" min="1" max="40" defaultValue="30" />
                                    </div>
                                </div>
                                <div className="chart-container">
                                    <h3>Monthly Costs Over Time</h3>
                                    <canvas id="monthlyLineChart"></canvas>
                                </div>
                                <div className="chart-container">
                                    <h3>Total Cost</h3>
                                    <canvas id="cumulativeCostChart"></canvas>
                                </div>
                            </div>
                        </div>

                        <div className="detailed-breakdown">
                            <h3>Detailed Yearly Breakdown</h3>
                            <div className="breakdown-table">
                                <table id="breakdownTable">
                                    <thead>
                                        <tr>
                                            <th>Year</th>
                                            <th>Buy (Real)</th>
                                            <th>Rent (Real)</th>
                                            <th>Monthly Buy Premium</th>
                                        </tr>
                                    </thead>
                                    <tbody id="breakdownTableBody">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CalculatorView
