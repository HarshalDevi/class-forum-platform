// FirestoreTest.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';

const FirestoreTest = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching Firestore data...");
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userList = [];
        querySnapshot.forEach((doc) => {
          console.log(doc.id, " => ", doc.data());
          userList.push(doc.data());
        });
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching Firestore data: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      Firestore Test Running...
      <ul>
        {users.length === 0 ? (
          <p>No users found in Firestore.</p>
        ) : (
          users.map((user, index) => (
            <li key={index}>{user.email} - {user.role}</li>
          ))
        )}
      </ul>
    </div>
  );
};

export default FirestoreTest;
