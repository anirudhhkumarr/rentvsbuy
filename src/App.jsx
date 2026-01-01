import { useState } from "react"
import CalculatorView from "./components/CalculatorView"
import WhatIfView from "./components/WhatIfView"

function App() {
    const [view, setView] = useState("calculator")

    return (
        <div className="app-container">
            <nav className="main-nav">
                <button
                    onClick={() => setView("calculator")}
                    className={view === "calculator" ? "active" : ""}
                >
                    Calculator
                </button>
                <button
                    onClick={() => setView("whatif")}
                    className={view === "whatif" ? "active" : ""}
                >
                    What-If Analysis
                </button>
            </nav>

            {view === "calculator" ? <CalculatorView /> : <WhatIfView />}
        </div>
    )
}

export default App
