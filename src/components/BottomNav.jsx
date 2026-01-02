import { Link, useLocation } from "react-router-dom"

const BottomNav = ({ toggleSidebar }) => {
    const location = useLocation()
    const isCalc = location.pathname === "/"
    const isWhatIf = location.pathname === "/whatif"

    return (
        <nav className="bottom-nav">
            <Link to="/" className={`nav-item ${isCalc ? "active" : ""}`}>
                <i className="fas fa-calculator"></i>
                <span>Calculator</span>
            </Link>
            <Link to="/whatif" className={`nav-item ${isWhatIf ? "active" : ""}`}>
                <i className="fas fa-chart-line"></i>
                <span>What-If</span>
            </Link>
            <button className="nav-item options-toggle" onClick={toggleSidebar}>
                <i className="fas fa-sliders-h"></i>
                <span>Options</span>
            </button>
        </nav>
    )
}

export default BottomNav
