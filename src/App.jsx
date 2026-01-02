import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import CalculatorView from "./components/CalculatorView"
import WhatIfView from "./components/WhatIfView"
import BottomNav from "./components/BottomNav"
import "./assets/css/index.css"

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    return (
        <div className="app-container">
            <Routes>
                <Route path="/" element={<CalculatorView isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
                <Route path="/whatif" element={<WhatIfView />} />
            </Routes>
            <BottomNav toggleSidebar={toggleSidebar} />
        </div>
    )
}

export default App
