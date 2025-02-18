// src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import Layout from './layout';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { firestore, auth } from '../../service/firebaseconfig';

const Home = () => {
  const [academicNotes, setAcademicNotes] = useState([]);
  const [personalNotes, setPersonalNotes] = useState([]);
  const [healthNotes, setHealthNotes] = useState([]);
  const [currentSection, setCurrentSection] = useState('Academic');

  useEffect(() => {
    fetchAllNotes();
  }, []);

  // Unified Function to Fetch Notes from Firestore
  const fetchNotes = async (collectionName, setNotesState) => {
    try {
      const userId = auth.currentUser.uid;
      const notesRef = collection(firestore, 'users', userId, collectionName);
      const q = query(notesRef, where('status', 'in', ['inProgress', 'completed']));
      const snapshot = await getDocs(q);
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotesState(fetchedNotes);
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
    }
  };

  // Fetch All Notes
  const fetchAllNotes = () => {
    fetchNotes('academicNotes', setAcademicNotes);
    fetchNotes('personalNotes', setPersonalNotes);
    fetchNotes('healthNotes', setHealthNotes);
  };

  // Categorize Notes (Active, Overdue, Completed)
  const categorizeNotes = (notes) => {
    const today = new Date();
    const activeTasks = [];
    const overdueTasks = [];
    const completedTasks = [];

    notes.forEach((note) => {
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
      completed: completedTasks,
    };
  };

  const categorizedAcademicNotes = categorizeNotes(academicNotes);
  const categorizedPersonalNotes = categorizeNotes(personalNotes);
  const categorizedHealthNotes = categorizeNotes(healthNotes);

  // Render Notes List with Status Labels
  const renderNotes = (notes) => (
    <ul className="space-y-4">
      {notes.map((note) => (
        <li key={note.id} className="border p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-lg">{note.title}</h4>
              <p className="text-sm text-gray-600">{note.description}</p>
              {note.dueDate && (
                <p className="text-xs text-gray-500">
                  Due: {note.dueDate.toDate().toLocaleDateString()}
                </p>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                note.status === 'completed' ? 'bg-green-200 text-green-700' :
                note.status === 'overdue' ? 'bg-red-200 text-red-700' :
                'bg-yellow-200 text-yellow-700'
              }`}
            >
              {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );

  // Render Summary Cards for Task Counts
  const renderSummaryCards = () => {
    const summaryData = [
      {
        title: 'Active Tasks',
        count:
          categorizedAcademicNotes.active.length +
          categorizedPersonalNotes.active.length +
          categorizedHealthNotes.active.length,
        color: 'bg-blue-500',
      },
      {
        title: 'Overdue Tasks',
        count:
          categorizedAcademicNotes.overdue.length +
          categorizedPersonalNotes.overdue.length +
          categorizedHealthNotes.overdue.length,
        color: 'bg-red-500',
      },
      {
        title: 'Completed Tasks',
        count:
          categorizedAcademicNotes.completed.length +
          categorizedPersonalNotes.completed.length +
          categorizedHealthNotes.completed.length,
        color: 'bg-green-500',
      },
    ];

    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        {summaryData.map((card, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg text-white ${card.color} shadow-md`}
          >
            <h4 className="text-lg font-bold">{card.title}</h4>
            <p className="text-2xl font-semibold">{card.count}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-6">Welcome Back!</h2>

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Section Tabs */}
        <div className="flex justify-around mb-6 border-b">
          {['Academic', 'Personal', 'Health'].map((section) => (
            <button
              key={section}
              onClick={() => setCurrentSection(section)}
              className={`py-2 px-4 font-semibold ${
                currentSection === section
                  ? 'border-b-4 border-blue-500 text-blue-500'
                  : 'text-gray-500'
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        {/* Notes Display */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">{currentSection} Active Tasks</h3>
          {currentSection === 'Academic' && renderNotes(categorizedAcademicNotes.active)}
          {currentSection === 'Personal' && renderNotes(categorizedPersonalNotes.active)}
          {currentSection === 'Health' && renderNotes(categorizedHealthNotes.active)}

          <h3 className="text-xl font-semibold">Overdue</h3>
          {renderNotes([
            ...categorizedAcademicNotes.overdue,
            ...categorizedPersonalNotes.overdue,
            ...categorizedHealthNotes.overdue,
          ])}

          <h3 className="text-xl font-semibold">Completed</h3>
          {renderNotes([
            ...categorizedAcademicNotes.completed,
            ...categorizedPersonalNotes.completed,
            ...categorizedHealthNotes.completed,
          ])}
        </div>

        {/* Refresh Button */}
        <div className="mt-6">
          <button
            onClick={fetchAllNotes}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Refresh Tasks
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
