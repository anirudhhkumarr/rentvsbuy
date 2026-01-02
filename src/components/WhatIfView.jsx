import { useEffect, useRef } from "react"
import "../assets/css/styles.css"
import "../assets/css/whatif.css"
import { RentBuyCalculator } from "../utils/calculator.js"
import { WhatIfAnalysis } from "../utils/whatif.js"

const WhatIfView = () => {
    const isInitialized = useRef(false)

    useEffect(() => {
        // Attach to window so legacy script can find it
        window.RentBuyCalculator = RentBuyCalculator

        if (!isInitialized.current) {
            new WhatIfAnalysis()
            isInitialized.current = true
        }
    }, [])

    return (
        <div className="analysis-container">
            <div className="analysis-header">
                <h1><i className="fas fa-chart-line"></i> What-If Analysis</h1>
                <p>Explore how different scenarios affect your rent vs buy decision</p>
            </div>

            <div className="analysis-controls">
                <h3><i className="fas fa-sliders-h"></i> Analysis Parameters</h3>

                <div className="axis-selection">
                    <div className="axis-group">
                        <h4>X-Axis (Horizontal)</h4>
                        <select id="xAxisParameter">
                            <option value="mortgageRate">Interest Rate (%)</option>
                            <option value="homePrice">Home Price ($)</option>
                            <option value="downPayment">Down Payment ($)</option>
                            <option value="investingHorizon">Investing Horizon (years)</option>
                        </select>
                    </div>
                    <div className="axis-group">
                        <h4>Y-Axis (Vertical)</h4>
                        <select id="yAxisParameter">
                            <option value="homePrice">Home Price ($)</option>
                            <option value="mortgageRate">Interest Rate (%)</option>
                            <option value="downPayment">Down Payment ($)</option>
                            <option value="investingHorizon">Investing Horizon (years)</option>
                        </select>
                    </div>
                </div>

                <div className="parameter-selection">
                    <div className="parameter-group" id="interestRateGroup">
                        <h4><i className="fas fa-percentage"></i> Interest Rate</h4>
                        <div className="single-slider-container" style={{ display: 'none' }}>
                            <label><span id="interestSingleValue">6.25%</span></label>
                            <input type="range" id="interestSingle" min="3" max="8" defaultValue="6.25" step="0.05" className="slider" />
                        </div>
                        <div className="range-inputs-with-sliders" id="interestRangeContainer">
                            <div className="double-range-container">
                                <div className="double-range-values">
                                    <span id="interestMinValue">3.0%</span>
                                    <span id="interestMaxValue">8.0%</span>
                                </div>
                                <div className="double-range-slider" id="interestDoubleSlider">
                                    <div className="track" id="interestTrack"></div>
                                    <input type="range" id="interestMin" min="3" max="8" defaultValue="3" step="0.05" />
                                    <input type="range" id="interestMax" min="3" max="8" defaultValue="8" step="0.05" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="parameter-group" id="homePriceGroup">
                        <h4><i className="fas fa-home"></i> Home Price</h4>
                        <div className="single-slider-container" style={{ display: 'none' }}>
                            <label><span id="priceSingleValue">$1.75M</span></label>
                            <input type="range" id="priceSingle" min="500000" max="5000000" defaultValue="1750000" step="50000" className="slider" />
                        </div>
                        <div className="range-inputs-with-sliders" id="priceRangeContainer">
                            <div className="double-range-container">
                                <div className="double-range-values">
                                    <span id="priceMinValue">$1.0M</span>
                                    <span id="priceMaxValue">$3.0M</span>
                                </div>
                                <div className="double-range-slider" id="priceDoubleSlider">
                                    <div className="track" id="priceTrack"></div>
                                    <input type="range" id="priceMin" min="10000" max="5000000" defaultValue="1000000" step="50000" />
                                    <input type="range" id="priceMax" min="10000" max="5000000" defaultValue="3000000" step="50000" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="parameter-group" id="downPaymentGroup">
                        <h4><i className="fas fa-piggy-bank"></i> Down Payment</h4>
                        <div className="single-slider-container">
                            <label><span id="downSingleValue">$525K</span></label>
                            <input type="range" id="downSingle" min="10000" max="2000000" defaultValue="525000" step="10000" className="slider" />
                        </div>
                        <div className="range-inputs-with-sliders" id="downRangeContainer" style={{ display: 'none' }}>
                            <div className="double-range-container">
                                <div className="double-range-values">
                                    <span id="downMinValue">$100K</span>
                                    <span id="downMaxValue">$1.0M</span>
                                </div>
                                <div className="double-range-slider" id="downDoubleSlider">
                                    <div className="track" id="downTrack"></div>
                                    <input type="range" id="downMin" min="10000" max="2000000" defaultValue="100000" step="10000" />
                                    <input type="range" id="downMax" min="10000" max="2000000" defaultValue="1000000" step="10000" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="parameter-group" id="investingHorizonGroup">
                        <h4><i className="fas fa-calendar-alt"></i> Investing Horizon</h4>
                        <div className="single-slider-container">
                            <label><span id="horizonSingleValue">30 years</span></label>
                            <input type="range" id="horizonSingle" min="1" max="40" defaultValue="30" step="1" className="slider" />
                        </div>
                        <div className="range-inputs-with-sliders" id="horizonRangeContainer" style={{ display: 'none' }}>
                            <div className="double-range-container">
                                <div className="double-range-values">
                                    <span id="horizonMinValue">10 years</span>
                                    <span id="horizonMaxValue">40 years</span>
                                </div>
                                <div className="double-range-slider" id="horizonDoubleSlider">
                                    <div className="track" id="horizonTrack"></div>
                                    <input type="range" id="horizonMin" min="1" max="40" defaultValue="10" step="1" />
                                    <input type="range" id="horizonMax" min="1" max="40" defaultValue="40" step="1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="base-scenario">
                    <h4><i className="fas fa-anchor"></i> Base Scenario (Fixed Parameters)</h4>
                    <div className="base-inputs">
                        <div className="base-slider-row">
                            <div className="form-group">
                                <label htmlFor="baseRent">Monthly Rent ($): <span id="baseRentValue">$4,500</span></label>
                                <input type="range" id="baseRent" min="2000" max="10000" defaultValue="4500" step="100" className="slider" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="baseRentIncrease">Rent Increase (%): <span id="baseRentIncreaseValue">5.0%</span></label>
                                <input type="range" id="baseRentIncrease" min="2" max="10" defaultValue="5" step="0.5" className="slider" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="baseTaxRate">Property Tax Rate (%): <span id="baseTaxRateValue">1.11%</span></label>
                                <input type="range" id="baseTaxRate" min="0.5" max="3" defaultValue="1.11" step="0.05" className="slider" />
                            </div>
                        </div>
                        <div className="base-slider-row">
                            <div className="form-group">
                                <label htmlFor="baseHomeReturn">Home Appreciation (%): <span id="baseHomeReturnValue">3.0%</span></label>
                                <input type="range" id="baseHomeReturn" min="0" max="8" defaultValue="3" step="0.25" className="slider" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="baseStockReturn">Stock Return (%): <span id="baseStockReturnValue">6.0%</span></label>
                                <input type="range" id="baseStockReturn" min="3" max="12" defaultValue="6" step="0.25" className="slider" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="baseInflation">Inflation (%): <span id="baseInflationValue">2.0%</span></label>
                                <input type="range" id="baseInflation" min="0" max="5" defaultValue="2" step="0.25" className="slider" />
                            </div>
                        </div>
                        <div className="base-slider-row">
                            <div className="form-group">
                                <label htmlFor="baseLoanTerm">Loan Term (years): <span id="baseLoanTermValue">30</span></label>
                                <input type="range" id="baseLoanTerm" min="10" max="40" defaultValue="30" step="1" className="slider" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="investingHorizon">Investing Horizon (years): <span id="investingHorizonValue">30</span></label>
                                <input type="range" id="investingHorizon" min="1" max="40" defaultValue="30" step="1" className="slider" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="baseClosingCost">Closing Cost (%): <span id="baseClosingCostValue">3.0%</span></label>
                                <input type="range" id="baseClosingCost" min="0" max="10" defaultValue="3" step="0.5" className="slider" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="button-row" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', margin: '20px 0' }}>
                    <button className="analysis-button" id="runAnalysis">
                        <i className="fas fa-play"></i> Run Analysis
                    </button>
                    <button type="button" id="toggleBaseScenario" className="toggle-button">
                        <i className="fas fa-cog"></i> Advanced Settings
                        <i className="fas fa-chevron-down toggle-icon"></i>
                    </button>
                </div>
            </div>

            <div className="results-section" id="resultsSection" style={{ display: 'none' }}>
                <h3><i className="fas fa-chart-area"></i> Analysis Results</h3>
                <div id="loadingIndicator" className="loading">
                    <i className="fas fa-spinner"></i>
                    <p>Running analysis...</p>
                </div>
                <div id="chartResults" style={{ display: 'none' }}>
                    <div className="legend-container">
                        <div className="legend-item">
                            <div className="legend-color" style={{ background: '#28a745' }}></div>
                            <span>Buy is Better</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color" style={{ background: '#007bff' }}></div>
                            <span>Rent is Better</span>
                        </div>
                    </div>
                    <div className="whatif-chart-container">
                        <canvas id="heatmapChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WhatIfView
