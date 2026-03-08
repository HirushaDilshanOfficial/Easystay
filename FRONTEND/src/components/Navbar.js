import React from 'react';
import { Link } from 'react-router-dom';
import { Home, List, PlusSquare } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <Home className="nav-icon" />
                    Easy Stay
                </Link>
                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/" className="nav-links">
                            Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin" className="nav-links">
                            <List className="nav-icon" /> Dashboard
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/add" className="nav-links">
                            <PlusSquare className="nav-icon" /> Add Boarding
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
