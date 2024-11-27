import React from 'react';
import '../styles/Notification.css';

const Notification = ({ messages, onClose, notificationType }) => {
    return (
        <div className="sidebar-notification-container">
            <h3>Notifications</h3>
            <ul className="notification-list">
                {messages.map((message, index) => (
                    <li key={index} className="notification-item">
                        <div className="notification-content">
                            <span className="notification-label">{notificationType}:</span>
                            <div
                                className="notification-text"
                                dangerouslySetInnerHTML={{ __html: message.content }}
                            ></div>
                        </div>
                        <div className="notification-timestamp">
                            {message.timestamp ? message.timestamp.toDate().toLocaleString() : 'Timestamp not available'}
                        </div>
                    </li>
                ))}
            </ul>
            <button className="close-notification-button" onClick={onClose}>Close</button>
        </div>
    );
};

export default Notification;
