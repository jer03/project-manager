import React, { useState, useEffect } from 'react';
import Layout from './layout';
import { doc, collection, addDoc, deleteDoc, updateDoc, getDocs, Timestamp } from 'firebase/firestore';
import { firestore, auth } from '../../service/firebaseconfig'; // Check correct import path

function Health() {
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDescription, setNewNoteDescription] = useState('');
  const [newNoteDueDate, setNewNoteDueDate] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null); // State to track the currently edited note

  // Fetch notes on component mount
  useEffect(() => {
    fetchHealthNotes();
  }, []); 

  // Function to fetch health notes
  const fetchHealthNotes = async () => {
    try {
      const userId = auth.currentUser.uid;
      const notesRef = collection(firestore, 'users', userId, 'healthNotes');
      const snapshot = await getDocs(notesRef);
      if (!snapshot.empty) {
        const fetchedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotes(fetchedNotes);
      } else {
        console.log('No health notes available');
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching health notes: ', error);
    }
  };

  // Function to create a new health note
  const createNewNote = async () => {
    try {
      const userId = auth.currentUser.uid;
      const notesRef = collection(firestore, 'users', userId, 'healthNotes');
      const newNote = {
        title: newNoteTitle,
        description: newNoteDescription,
        dueDate: newNoteDueDate ? Timestamp.fromDate(new Date(newNoteDueDate)) : null,
        status: 'inProgress' // Default status
      };
      const docRef = await addDoc(notesRef, newNote);
      setNotes([...notes, { id: docRef.id, ...newNote }]);
      setNewNoteTitle('');
      setNewNoteDescription('');
      setNewNoteDueDate('');
    } catch (error) {
      console.error('Error adding health document: ', error);
    }
  };

  // Function to delete a health note
  const deleteNote = async (noteId) => {
    try {
      const userId = auth.currentUser.uid;
      const noteRef = doc(firestore, 'users', userId, 'healthNotes', noteId);
      await deleteDoc(noteRef);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting health document: ', error);
    }
  };

  // Function to edit a health note (set edit mode)
  const editNote = (noteId) => {
    setEditingNoteId(noteId);
    // Fetch current note details if needed
    // For simplicity, you can manage editing state in local state
  };

  // Function to save edited health note
  const saveEditedNote = async (noteId, updatedData) => {
    try {
      const userId = auth.currentUser.uid;
      const noteRef = doc(firestore, 'users', userId, 'healthNotes', noteId);
      await updateDoc(noteRef, updatedData);
      setNotes(notes.map(note => (note.id === noteId ? { ...note, ...updatedData } : note)));
      setEditingNoteId(null); // Clear editing state after saving
    } catch (error) {
      console.error('Error updating health document: ', error);
    }
  };

  // Function to mark a health note as completed
  const markNoteAsCompleted = async (noteId) => {
    try {
      const userId = auth.currentUser.uid;
      const noteRef = doc(firestore, 'users', userId, 'healthNotes', noteId);
      await updateDoc(noteRef, { status: 'completed' });
      setNotes(notes.map(note => (note.id === noteId ? { ...note, status: 'completed' } : note)));
    } catch (error) {
      console.error('Error marking health note as completed: ', error);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Health Notes</h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Create New Note:</h3>
          <input
            type="text"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            placeholder="Title"
            className="border border-gray-300 p-2 rounded mr-2"
          />
          <input
            type="text"
            value={newNoteDescription}
            onChange={(e) => setNewNoteDescription(e.target.value)}
            placeholder="Description"
            className="border border-gray-300 p-2 rounded mr-2"
          />
          <input
            type="date"
            value={newNoteDueDate}
            onChange={(e) => setNewNoteDueDate(e.target.value)}
            placeholder="Due Date"
            className="border border-gray-300 p-2 rounded mr-2"
          />
          <button onClick={createNewNote} className="bg-blue-500 text-white px-4 py-2 rounded">
            Create
          </button>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Current Notes:</h3>
          {notes.length === 0 ? (
            <p>No health notes available</p>
          ) : (
            <ul>
              {notes.map((note) => (
                <li key={note.id} className="border border-gray-300 p-2 rounded mb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      {editingNoteId === note.id ? (
                        // Render edit form instead of regular view
                        <div>
                          <input
                            type="text"
                            value={note.title}
                            onChange={(e) => setNotes(notes.map(n => (n.id === note.id ? { ...n, title: e.target.value } : n)))}
                            className="border border-gray-300 p-2 rounded mr-2"
                          />
                          <input
                            type="text"
                            value={note.description}
                            onChange={(e) => setNotes(notes.map(n => (n.id === note.id ? { ...n, description: e.target.value } : n)))}
                            className="border border-gray-300 p-2 rounded mr-2"
                          />
                          <input
                            type="date"
                            value={note.dueDate ? note.dueDate.toDate().toISOString().split('T')[0] : ''}
                            onChange={(e) => setNotes(notes.map(n => (n.id === note.id ? { ...n, dueDate: Timestamp.fromDate(new Date(e.target.value)) } : n)))}
                            className="border border-gray-300 p-2 rounded mr-2"
                          />
                          <button onClick={() => saveEditedNote(note.id, { title: note.title, description: note.description, dueDate: note.dueDate })} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                            Save
                          </button>
                          <button onClick={() => setEditingNoteId(null)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        // Render regular note view
                        <div>
                          <h4 className="text-xl font-semibold">{note.title}</h4>
                          <p className="text-gray-500">{note.description}</p>
                          {note.dueDate && (
                            <p className="text-sm text-gray-400">Due: {note.dueDate.toDate().toLocaleDateString()}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => editNote(note.id)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                      {note.status === 'inProgress' && (
                        <button
                          onClick={() => markNoteAsCompleted(note.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded ml-2"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Health;
