import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Info, Phone, User, ShieldCheck, PlusCircle } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon-container">
                        <Home className="logo-icon" size={24} />
                    </div>
                    <span className="logo-text">Easy Stay</span>
                </Link>
                
                <div className="nav-links">
                    <Link to="/" className="nav-item">
                        <Home size={18} />
                        <span>Home</span>
                    </Link>
                    <Link to="/about" className="nav-item">
                        <Info size={18} />
                        <span>About</span>
                    </Link>
                    <Link to="/contact" className="nav-item">
                        <Phone size={18} />
                        <span>Contact</span>
                    </Link>
                    <div className="nav-divider"></div>
                    <Link to="/owner" className="nav-item">
                        <User size={18} />
                        <span>Owner</span>
                    </Link>
                    <Link to="/admin" className="nav-item">
                        <ShieldCheck size={18} />
                        <span>Admin</span>
                    </Link>
                    <Link to="/add" className="btn-add-boarding">
                        <PlusCircle size={18} /> 
                        <span>Add Listing</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
