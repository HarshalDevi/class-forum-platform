import React from 'react';
import RoleBasedLayout from './RoleBasedLayout'; // Import the role-based layout
import logo from '../assets/logo.png'; // Import the logo
import '../styles/Contact.css';

const Contact = () => {
  return (
    <RoleBasedLayout>
      <div className="contact-page">
        {/* Logo and title */}
        <div className="contact-header">
          <img src={logo} alt="Class Forum Logo" className="contact-logo" />
          <h2>Contact Us</h2>
        </div>

        <p>If you have any questions or need assistance, feel free to reach out to us.</p>
        
        <div className="contact-info">
          <h3>Contact Details:</h3>
          <p><strong>Phone:</strong> +1 469-348-5652</p>
          <p><strong>Email:</strong> harshaldevi986@gmail.com</p>
        </div>
        
        <div className="additional-info">
          <h3>Office Hours:</h3>
          <p>Monday - Friday: 9 AM - 5 PM</p>
          <p>Saturday - Sunday: Closed</p>

          <h3>Location:</h3>
          <p>123 Admin Street, City, Country</p>
          
          <h3>Social Media:</h3>
          <p>Follow us on our social media for the latest updates.</p>
        </div>
      </div>
    </RoleBasedLayout>
  );
};

export default Contact;
