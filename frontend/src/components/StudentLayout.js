import React from 'react';
import StudentSidebar from './StudentSidebar';
import '../styles/StudentLayout.css';

const StudentLayout = ({ children }) => {
  return (
    <div className="student-layout">
      <StudentSidebar />
      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default StudentLayout;
