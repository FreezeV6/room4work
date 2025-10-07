import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import NavBar from './components/NavBar/NavBar';
import Home from './components/Home/Home';
import Offers from './components/Offers/Offers';
import OfferDetails from './components/OfferDetails/OfferDetails';
import Auth from './components/Auth/Auth';
import Contact from './components/Contact/Contact';
import About from './components/About/About';
import UserProfile from './components/UserProfile/UserProfile';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavBar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/offers/:id" element={<OfferDetails />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
