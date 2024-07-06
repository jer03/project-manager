// Home.jsx

import React, { useState, useEffect } from 'react';
import Layout from './layout';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { firestore, auth } from '../../service/firebaseconfig'; // Check correct import path

const Home = () => {
  const [academicNotes, setAcademicNotes] = useState([]);
  const [personalNotes, setPersonalNotes] = useState([]);
  const [healthNotes, setHealthNotes] = useState([]);
  const [showAcademicNotes, setShowAcademicNotes] = useState(false);
  const [showPersonalNotes, setShowPersonalNotes] = useState(false);
  const [showHealthNotes, setShowHealthNotes] = useState(false);

  useEffect(() => {
    fetchAcademicNotes();
    fetchPersonalNotes();
    fetchHealthNotes(); // Fetch Health section notes
  }, []);

  const fetchAcademicNotes = async () => {
    try {
      const userId = auth.currentUser.uid;
      const notesRef = collection(firestore, 'users', userId, 'academicNotes');
      const q = query(notesRef, where('status', '==', 'inProgress'));
      const snapshot = await getDocs(q);
      const fetchedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAcademicNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching academic notes: ', error);
    }
  };

  const fetchPersonalNotes = async () => {
    try {
      const userId = auth.currentUser.uid;
      const notesRef = collection(firestore, 'users', userId, 'personalNotes');
      const q = query(notesRef, where('status', '==', 'inProgress'));
      const snapshot = await getDocs(q);
      const fetchedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPersonalNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching personal notes: ', error);
    }
  };

  const fetchHealthNotes = async () => {
    try {
      const userId = auth.currentUser.uid;
      const notesRef = collection(firestore, 'users', userId, 'healthNotes');
      const q = query(notesRef, where('status', '==', 'inProgress'));
      const snapshot = await getDocs(q);
      const fetchedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHealthNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching health notes: ', error);
    }
  };

  const categorizeNotes = (notes) => {
    const today = new Date();
    const activeTasks = [];
    const overdueTasks = [];
    const completedTasks = [];

    notes.forEach(note => {
      if (note.status === 'completed') {
        completedTasks.push(note);
      } else if (note.dueDate && note.dueDate.toDate() < today) {
        overdueTasks.push(note);
      } else {
        activeTasks.push(note);
      }
    });

    return {
      active: activeTasks,
      overdue: overdueTasks,
      completed: completedTasks
    };
  };

  const categorizedAcademicNotes = categorizeNotes(academicNotes);
  const categorizedPersonalNotes = categorizeNotes(personalNotes);
  const categorizedHealthNotes = categorizeNotes(healthNotes);

  const renderNotes = (notes) => (
    <ul>
      {notes.map(note => (
        <li key={note.id}>
          <h4>{note.title}</h4>
          <p>{note.description}</p>
          {note.dueDate && (
            <p>Due: {note.dueDate.toDate().toLocaleDateString()}</p>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Active Tasks:</h3>
          <div className="flex space-x-4 mb-4">
            <div>
              <button
                onClick={() => setShowAcademicNotes(!showAcademicNotes)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Academic
              </button>
              {showAcademicNotes && renderNotes(categorizedAcademicNotes.active)}
            </div>
            <div>
              <button
                onClick={() => setShowPersonalNotes(!showPersonalNotes)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Personal
              </button>
              {showPersonalNotes && renderNotes(categorizedPersonalNotes.active)}
            </div>
            <div>
              <button
                onClick={() => setShowHealthNotes(!showHealthNotes)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Health
              </button>
              {showHealthNotes && renderNotes(categorizedHealthNotes.active)}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Overdue:</h3>
            {renderNotes([...categorizedAcademicNotes.overdue, ...categorizedPersonalNotes.overdue, ...categorizedHealthNotes.overdue])}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Completed:</h3>
            {renderNotes([...categorizedAcademicNotes.completed, ...categorizedPersonalNotes.completed, ...categorizedHealthNotes.completed])}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
