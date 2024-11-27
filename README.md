# Class Forum Platform

## Overview

The **Class Forum Platform** is a web application designed for educational institutions to facilitate communication and collaboration between professors (admins) and students. Users can register, log in, create posts, reply, and receive notifications. Admins have the ability to create and manage posts, while students can view and respond. The platform provides different user experiences for admins and students, depending on their roles.

## Features

- **User Registration & Authentication**: Users can register as either a student or an admin. The platform uses Firebase Authentication for secure sign-in.
- **Role-based Access**: Depending on whether a user registers as a student or an admin, different functionalities are available.
- **Profile Management**: Users can update their profile information, including uploading a profile picture.
- **Posting and Replying**: Admins can create new posts, while students can view and reply to posts.
- **Liking and Pinning Posts**: Students can like posts and pin important posts for quick access.
- **Notification System**: Users receive notifications for new posts and replies. Admins receive notifications about replies to their posts, while students get notified of new posts.
- **Edit Posts**: Admins can edit their posts after creation to update any information if needed.
- **Password Reset**: Users can reset their passwords via email if they forget their credentials.

## Tech Stack

- **Frontend**: ReactJS, CSS, Firebase Authentication
- **Backend**: Firebase Firestore for database storage, Firebase Storage for media storage
- **Libraries**:
  - `react-router-dom`: For client-side routing.
  - `firebase`: For authentication, Firestore, and storage.
  - `react-firebase-hooks`: To simplify the use of Firebase with React.
  - `react-quill`: For a rich text editor interface to create posts.

## Prerequisites

- **Node.js**: You need to have Node.js installed to run the development server. You can download it from [Node.js official website](https://nodejs.org/).
- **Firebase Account**: A Firebase account is required to create your own Firebase project for database, authentication, and storage.

## Installation

1. **Extract the project zip file**:
   - Extract the provided zip file to a suitable location on your system.

2. **Navigate to the frontend folder**:
   ```bash
   cd Team 02/frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up Firebase**:
   - Create a Firebase project on [Firebase Console](https://console.firebase.google.com/).
   - Enable Firestore, Authentication, and Storage.
   - Get your Firebase config details and add them to a new file named `firebaseConfig.js` under the `src/firebase` folder.
   - If you wish to use your own Firebase project, replace the existing configuration in `firebaseConfig.js` with your project details. For now, the `firebaseConfig.js` file contains the configuration for our team's project.

5. **Run the development server**:
   ```bash
   npm start
   ```

## Project Structure

- **frontend/src/components**: Contains React components such as AdminDashboard, AdminLayout, AdminSidebar, Contact, FeedPage, Login, LogoutButton, Notification, PinnedPosts, Post, ReadOnlyPost, Register, RoleBasedLayout, SearchBar, StudentDashboard, StudentLayout, StudentSidebar, and UserProfile.
- **frontend/src/styles**: Contains CSS files for styling different components.
- **frontend/src/firebase/firebaseConfig.js**: Contains the Firebase configuration and initialization.
- **frontend/src/App.js**: Handles the main routing logic and role-based redirects.

## Usage

- **Registration & Login**: Users can register as either an admin or a student. After successful registration, they are redirected to the login page.
- **Dashboard**: Admins are first redirected to the create post page where they can create new posts, view replies, and manage posts. Students are redirected to their dashboard, where they can view posts, reply, and receive notifications about new posts.
- **Feed Page**: Admins can view replies, manage posts, and handle interactions in the feed page.
- **Notifications**: Admins are notified of new replies to their posts, while students are notified of new posts made by admins. The `Notification` component handles notifications for both types of users, with appropriate text (`New Reply` for admins and `New Post` for students).
- **Profile Editing**: Users can edit their profile information, including uploading a profile picture. The changes are updated in Firebase Firestore.
- **Password Reset**: Users can reset their passwords by entering their registered email address, and they will receive a password reset link.

## Key Components

- **AdminSidebar** and **StudentSidebar**: Sidebar navigation components with profile picture, notifications, and navigation links.
- **Notification**: Displays a list of notifications, which can either be new posts for students or replies for admins.
- **Login** and **Register**: Pages to authenticate users and allow registration.
- **App.js**: Handles role-based routing and redirection to ensure users land on the appropriate pages based on their roles.

## Important Notes

- Ensure you have added proper Firebase credentials in `firebaseConfig.js` for the app to run correctly.
- The registration requires a strong password, with at least one uppercase letter and one special character.
- The platform distinguishes between `student` and `admin` roles to provide differentiated user experiences.
- The notification system is integrated to provide real-time notifications of new posts or replies.
- If you plan to create your own Firebase instance, follow the setup instructions in the "Set up Firebase" section.


### Testing Instructions

# 1. Start ChromeDriver on the specified port:
chromedriver --port=9515

# 2. Run the frontend server (in a separate terminal):
npm start

# 3. Run all end-to-end tests:
npm run test:e2e

# Ensure the following are running and accessible:
# - The frontend server at http://localhost:3000
# - The Selenium server via ChromeDriver at http://localhost:9515
