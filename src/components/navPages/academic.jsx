import React, { useState, useEffect } from 'react';
import Layout from './layout';
import { doc, collection, addDoc, deleteDoc, updateDoc, getDocs, Timestamp } from 'firebase/firestore';
import { firestore, auth } from '../../service/firebaseconfig'; // Check correct import path
import { RiDeleteBinLine, RiEdit } from 'react-icons/ri';
import { MdEdit, MdCheckCircle } from 'react-icons/md';

function Academic() {
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDescription, setNewNoteDescription] = useState('');
  const [newNoteDueDate, setNewNoteDueDate] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false); // State to show/hide create form
  const [editingNoteId, setEditingNoteId] = useState(null); // State to track the currently edited note

  // Fetch notes on component mount
  useEffect(() => {
    fetchAcademicNotes();
  }, []);

  // Function to fetch academic notes
  const fetchAcademicNotes = async () => {
    try {
      const userId = auth.currentUser.uid;
      const notesRef = collection(firestore, 'users', userId, 'academicNotes');
      const snapshot = await getDocs(notesRef);
      if (!snapshot.empty) {
        const fetchedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotes(fetchedNotes);
      } else {
        console.log('No academic notes available');
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching academic notes: ', error);
    }
  };

  // Function to create a new note
  const createNewNote = async () => {
    try {
      const userId = auth.currentUser.uid;
      const notesRef = collection(firestore, 'users', userId, 'academicNotes');
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
      setShowCreateForm(false); // Hide the create form after creating a note
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  // Function to delete a note
  const deleteNote = async (noteId) => {
    try {
      const userId = auth.currentUser.uid;
      const noteRef = doc(firestore, 'users', userId, 'academicNotes', noteId);
      await deleteDoc(noteRef);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  // Function to edit a note (set edit mode)
  const editNote = (noteId) => {
    setEditingNoteId(noteId);
    // Fetch current note details if needed
    // For simplicity, you can manage editing state in local state
  };

  // Function to save edited note
  const saveEditedNote = async (noteId, updatedData) => {
    try {
      const userId = auth.currentUser.uid;
      const noteRef = doc(firestore, 'users', userId, 'academicNotes', noteId);
      await updateDoc(noteRef, updatedData);
      setNotes(notes.map(note => (note.id === noteId ? { ...note, ...updatedData } : note)));
      setEditingNoteId(null); // Clear editing state after saving
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  // Function to mark a note as completed
  const markNoteAsCompleted = async (noteId) => {
    try {
      const userId = auth.currentUser.uid;
      const noteRef = doc(firestore, 'users', userId, 'academicNotes', noteId);
      await updateDoc(noteRef, { status: 'completed' });
      setNotes(notes.map(note => (note.id === noteId ? { ...note, status: 'completed' } : note)));
    } catch (error) {
      console.error('Error marking note as completed: ', error);
    }
  };

  // Filter notes based on status
  const inProgressNotes = notes.filter(note => note.status !== 'completed');
  const completedNotes = notes.filter(note => note.status === 'completed');

  return (
    <Layout>
      <div className="mt-20 ml-40 mr-40 border border-blue-300 rounded-lg flex flex-col w-1/16">
        <h3 className="text-4xl font-bold mb-4 text-center mt-6">Academic Projects</h3>
        <div className="mb-2">
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-blue-500 text-white text-3xl rounded mt-6 ml-9 h-10 w-10 pb-2">
            {showCreateForm ? '-' : '+'}
          </button>
          {showCreateForm && (
            <div className="mt-4 flex flex-col ml-8 space-y-8">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Title of Project"
                className="border border-gray-300 p-2 rounded mr-2 w-1/12"
              />
              <textarea
                value={newNoteDescription}
                onChange={(e) => setNewNoteDescription(e.target.value)}
                placeholder="Description of Project"
                className="border border-gray-300 p-2 rounded w-1/3"
                rows={10} // Adjust rows based on your UI preference
              />
              <input
                type="date"
                value={newNoteDueDate}
                onChange={(e) => setNewNoteDueDate(e.target.value)}
                placeholder="Due Date"
                className="border border-gray-300 p-2 rounded mr-2 w-1/12"
              />
              <button onClick={createNewNote} className="bg-blue-500 text-white py-2 rounded w-1/12">
                Create Project
              </button>
            </div>
          )}
        </div>
      <div className="mt-10 flex">
        <div className="flex-1 flex flex-col border">
          <h3 className="text-3xl font-semibold mb-2 ml-8 pb-5">Projects</h3>
          {inProgressNotes.length === 0 ? (
            <p className="ml-8 mb-5">No projects in progress</p>
          ) : (
            <ul className="ml-8">
              {inProgressNotes.map((note) => (
                <li key={note.id} className="border border-gray-300 p-2 rounded mb-3 mr-6">
                  <div className="flex justify-between items-center">
                    <div className="w-full mr-12">
                      {editingNoteId === note.id ? (
                        // Render edit form instead of regular view
                        <div className="mt-3 flex flex-col space-y-8">
                          <input
                            type="text"
                            value={note.title}
                            placeholder="Title of Project"
                            onChange={(e) => setNotes(notes.map(n => (n.id === note.id ? { ...n, title: e.target.value } : n)))}
                            className="border border-gray-300 p-2 rounded w-1/4"
                         
                          />
                          <textarea
                            value={note.description}
                            placeholder="Description of Project"
                            onChange={(e) => setNotes(notes.map(n => (n.id === note.id ? { ...n, description: e.target.value } : n)))}
                            className="border border-gray-300 p-2 rounded h-48 w-full"
                            row={6}
                          />
                          <input
                            type="date"
                            value={note.dueDate ? note.dueDate.toDate().toISOString().split('T')[0] : ''}
                            placeholder="Due Date"
                            onChange={(e) => setNotes(notes.map(n => (n.id === note.id ? { ...n, dueDate: Timestamp.fromDate(new Date(e.target.value)) } : n)))}
                            className="border border-gray-300 p-2 rounded w-1/4"
                          />
                          <div className="flex items-center space-x-4">
                            <button onClick={() => setEditingNoteId(null)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
                              Cancel
                            </button>
                            <button onClick={() => saveEditedNote(note.id, { title: note.title, description: note.description, dueDate: note.dueDate })} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                              Save
                            </button>
                            <button onClick={() => deleteNote(note.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                              <RiDeleteBinLine className="my-2" />
                            </button>
                          </div>
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
                    <div className="flex">
                      {note.status === 'inProgress' && (
                        <button
                          onClick={() => markNoteAsCompleted(note.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded mr-4"
                        >
                          <MdCheckCircle className="my-2" />
                        </button>
                      )}
                      <button
                        onClick={() => editNote(note.id)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                      >
                        <MdEdit className="my-2" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Completed Projects Section */}
        <div className="flex-1 flex-col border">
          <h3 className="text-3xl font-semibold mb-2 ml-8 pb-5">Completed</h3>
          {completedNotes.length === 0 ? (
            <p className="ml-8 mb-5">No completed projects</p>
          ) : (
            <ul className="ml-8">
              {completedNotes.map((note) => (
                <li key={note.id} className="flex items-center border border-gray-300 p-2 rounded mb-3 mr-6">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold">{note.title}</h4>
                    <p className="text-gray-500">{note.description}</p>
                    {note.dueDate && (
                      <p className="text-sm text-gray-400">Due: {note.dueDate.toDate().toLocaleDateString()}</p>
                    )} 
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="bg-red-500 text-white px-3 py-3 rounded opacity-0 transition duration-300 hover:opacity-100 mr-3"
                  >
                    <RiDeleteBinLine />
                  </button>       
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      </div>
    </Layout>
  );
}

export default Academic;

