import React, { useState, useEffect } from 'react';
import Layout from './layout';
import { doc, collection, addDoc, deleteDoc, updateDoc, getDocs, Timestamp } from 'firebase/firestore';
import { firestore, auth, storage } from '../../service/firebaseconfig';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { RiDeleteBinLine } from 'react-icons/ri';
import { MdCheckCircle, MdDeleteForever } from 'react-icons/md';
import '../../styles.css';

function Academic() {
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDescription, setNewNoteDescription] = useState('');
  const [newNoteDueDate, setNewNoteDueDate] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState([]);
  const [tasks, setTasks] = useState([{ id: crypto.randomUUID(), title: '', description: '', }])



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

  // Function to Create a New Note with Proper Tasks
  const createNewNote = async () => {
    try {
      const userId = auth.currentUser.uid;
      const notesRef = collection(firestore, 'users', userId, 'academicNotes');

      const newNote = {
        title: newNoteTitle,
        description: newNoteDescription,
        dueDate: newNoteDueDate ? Timestamp.fromDate(new Date(newNoteDueDate)) : null,
        status: 'inProgress',
        files: urls,
        tasks: tasks.map(task => ({
          id: task.id ?? crypto.randomUUID(), // Always assign a unique ID
          title: task.title ?? '',
          description: task.description ?? '',
          completed: task.completed ?? false
        }))
      };

      const docRef = await addDoc(notesRef, newNote);
      setNotes([...notes, { id: docRef.id, ...newNote }]);

      // Reset form
      setNewNoteTitle('');
      setNewNoteDescription('');
      setNewNoteDueDate('');
      setUrls('');
      setTasks([]);
      alert("New project created successfully");
    } catch (error) {
      console.error('Error adding document:', error);
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

  // Function to edit a note
  const editNote = (noteId) => {
    setEditingNoteId(noteId);
  };

  // Function to Save Note with Unique Task References
  const saveEditedNote = async (noteId, updatedData) => {
    try {
      const userId = auth.currentUser.uid;
      const noteRef = doc(firestore, 'users', userId, 'academicNotes', noteId);

      // Deep clone tasks to ensure unique objects
      const cleanTasks = updatedData.tasks?.map(task => ({
        id: task.id ?? crypto.randomUUID(), // Ensure every task has a unique ID
        title: task.title ?? '',
        description: task.description ?? '',
        completed: task.completed ?? false
      }));

      const payload = {
        ...updatedData,
        tasks: cleanTasks
      };

      // Update Firestore document
      await updateDoc(noteRef, payload);

      // Update Local State Immediately
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId ? { ...note, ...payload } : note
        )
      );

      setEditingNoteId(null);
    } catch (error) {
      console.error('Error updating document in Firestore:', error);
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

  // Function to filter notes
  const filteredNotes = notes.filter(note => {
    if (filter === 'all') return true;
    if (filter === 'inProgress') return note.status === 'inProgress';
    if (filter === 'completed') return note.status === 'completed';
    if (filter === 'overdue') {
      return note.dueDate && note.dueDate.toDate() < new Date() && note.status !== 'completed';
    }
    return false;
  });

  const handleDropdownSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    setShowDropdown(false);
  };

  const handleFileUpload = async (file) => {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const storageRef = ref(storage, `${user.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    try {
      // Upload file
      await uploadTask;

      // Get download URL
      const url = await getDownloadURL(uploadTask.snapshot.ref);

      // Update state with new file and URL
      setFiles(prevFiles => [...prevFiles, file]);
      setUrls(prevUrls => [...prevUrls, url]);

      console.log('File uploaded and available at: ', url);
    } catch (error) {
      console.error('Upload failed or error retrieving download URL: ', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    selectedFiles.forEach(file => handleFileUpload(file));
  };

  const handleDeleteFile = async (url, index) => {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const storageRef = ref(storage, `${user.uid}/${files[index].name}`);

      // Delete file from Firebase Storage
      await deleteObject(storageRef);

      // Update UI state (remove file and URL)
      setFiles(prevFiles => {
        const newFiles = [...prevFiles];
        newFiles.splice(index, 1);
        return newFiles;
      });

      setUrls(prevUrls => {
        const newUrls = [...prevUrls];
        newUrls.splice(index, 1);
        return newUrls;
      });

      // Update note.files to be empty for the currently editing note
      const updatedNotes = notes.map(note => {
        if (note.id === editingNoteId) {
          return {
            ...note,
            files: note.files.filter(file => file !== url)  // Remove the deleted file from note.files
          };
        }
        return note;
      });

      setNotes(updatedNotes);
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file: ', error);
    }
  };

  const addTask = async () => {
    const newTask = { id: crypto.randomUUID(), title: '', description: '' };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id, field, value) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, [field]: value } : task
    );
    setTasks(updatedTasks);
  };

  return (
    <Layout>
      <div className="rounded-lg flex flex-col">
        <h3 className="text-4xl font-bold mb-4 text-center mt-6">Academic Projects</h3>
        <div className="mb-2 mr-40">
          {/* Dropdown Filter Button */}
          <div className="relative ml-9 mt-10">
            <button onClick={() => setShowDropdown(!showDropdown)} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Filter Project
            </button>
            {showDropdown && (
              <div className="absolute mt-2 py-2 w-48 bg-white rounded-lg shadow-xl">
                <button onClick={() => handleDropdownSelect('all')} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200">All</button>
                <button onClick={() => handleDropdownSelect('inProgress')} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200">In Progress</button>
                <button onClick={() => handleDropdownSelect('completed')} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200">Completed</button>
                <button onClick={() => handleDropdownSelect('overdue')} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200">Overdue</button>
              </div>
            )}
          </div>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-blue-500 text-white text-3xl rounded-full mt-6 ml-10 h-10 w-10 pb-2 hover:bg-blue-600">
            {showCreateForm ? '-' : '+'}
          </button>
          <div className={`transition-all duration-500 overflow-auto ${showCreateForm ? 'max-h-screen' : 'max-h-0'}`}>
            <div className="mt-4 flex flex-col ml-8 space-y-8">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Title of Project"
                className="border border-gray-300 p-2 rounded mr-2 w-1/3"
              />
              <textarea
                value={newNoteDescription}
                onChange={(e) => setNewNoteDescription(e.target.value)}
                placeholder="Description of Project"
                className="border border-gray-300 p-2 rounded w-1/2 overflow-x w-full"
                rows={10}
                style={{ whiteSpace: 'pre' }}
              />
              <div>
                <label htmlFor="upload-file" className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                  Upload File
                </label>
                <input
                  type="file"
                  id="upload-file"
                  accept="*"  // Accept all file types
                  className="hidden"
                  onChange={handleFileChange}
                  multiple  // Allow multiple file selection
                />

                {urls.length > 0 && (
                  <div className="mt-4">
                    <ul>
                      {urls.map((url, index) => (
                        <li key={index} className="inline-block max-w-max flex items-center justify-between hover:bg-gray-300">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{files[index].name}</a>
                          <div className="flex items-center">
                            <button onClick={() => handleDeleteFile(url, index)} className="text-red-500 hover:text-red-700 transition-colors duration-300 ml-2">
                              <MdDeleteForever className="text-xl" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div>
                <button
                  className="bg-green-500 text-white p-2 mb-4 rounded px-4"
                  onClick={addTask}
                >
                  Add Task
                </button>

                {tasks.map((task, index) => (
                  <div key={task.id} className="border p-4 mb-4 rounded shadow-lg">
                    <input
                      className="border p-2 mb-2 w-full"
                      type="text"
                      placeholder={`Task ${index + 1} Title`}
                      value={task.title}
                      onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                    />
                    <textarea
                      className="border p-2 mb-2 w-full"
                      placeholder={`Task ${index + 1} Description`}
                      value={task.description}
                      onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button onClick={createNewNote} className="bg-blue-500 text-white py-2 rounded w-1/6 hover:bg-blue-600">
                Create Project
              </button>
            </div>

          </div>
        </div>


        {/* Filtered Notes Section */}
        <div className="mt-10 flex flex-col">
          {filteredNotes.length === 0 ? (
            <p className="ml-10 mb-5">No projects found</p>
          ) : (
            <ul className="ml-8 mr-20">
              {filteredNotes.map((note) => (
                <li key={note.id} className="border border-gray-300 p-2 rounded mb-5 ml-1">
                  <div className="flex justify-between items-center">
                    <div className="w-full mr-12">
                      {editingNoteId === note.id ? (
                        <div className="mt-3 flex flex-col space-y-8">
                          <input
                            type="text"
                            value={note.title}
                            placeholder="Title of Project"
                            onChange={(e) => setNotes(notes.map(n => (n.id === note.id ? { ...n, title: e.target.value } : n)))}
                            className="border border-gray-300 p-2 rounded w-1/2"
                          />
                          <textarea
                            value={note.description}
                            placeholder="Description of Project"
                            onChange={(e) => setNotes(notes.map(n => (n.id === note.id ? { ...n, description: e.target.value } : n)))}
                            className="border border-gray-300 p-2 rounded"
                            rows={10}
                            style={{ whiteSpace: 'pre' }}
                          />

                          {/* Tasks Section */}
                          <div className="mt-4 space-y-4">
                            <h4 className="text-lg font-semibold">Tasks</h4>

                            {/* Show Tasks */}
                            {note.tasks?.length > 0 ? (
                              note.tasks.map((task) => (
                                <div key={task.id} className="flex flex-col space-y-2 border p-3 rounded shadow">
                                  {/* Task Title Input */}
                                  <input
                                    type="text"
                                    value={task.title}
                                    placeholder="Task Title"
                                    onChange={(e) =>
                                      setNotes(prevNotes =>
                                        prevNotes.map(n =>
                                          n.id === note.id
                                            ? {
                                              ...n,
                                              tasks: n.tasks.map(t =>
                                                t.id === task.id ? { ...t, title: e.target.value } : t
                                              )
                                            }
                                            : n
                                        )
                                      )
                                    }
                                    className="border p-2 rounded w-full"
                                  />

                                  {/* Task Description Input */}
                                  <textarea
                                    value={task.description || ''}
                                    placeholder="Task Description"
                                    onChange={(e) =>
                                      setNotes(prevNotes =>
                                        prevNotes.map(n =>
                                          n.id === note.id
                                            ? {
                                              ...n,
                                              tasks: n.tasks.map(t =>
                                                t.id === task.id ? { ...t, description: e.target.value } : t
                                              )
                                            }
                                            : n
                                        )
                                      )
                                    }
                                    className="border p-2 rounded w-full"
                                    rows={2}
                                  />

                                  {/* Task Actions (Delete) */}
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() =>
                                        setNotes(prevNotes =>
                                          prevNotes.map(n =>
                                            n.id === note.id
                                              ? { ...n, tasks: n.tasks.filter(t => t.id !== task.id) }
                                              : n
                                          )
                                        )
                                      }
                                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500">No tasks added yet.</p>
                            )}

                            {/* Add New Task */}
                            <button
                              onClick={() =>
                                setNotes(prevNotes =>
                                  prevNotes.map(n =>
                                    n.id === note.id
                                      ? {
                                        ...n,
                                        tasks: [
                                          ...n.tasks,
                                          {
                                            id: crypto.randomUUID(),
                                            title: '',
                                            description: '', // Added description for new task
                                            completed: false
                                          }
                                        ]
                                      }
                                      : n
                                  )
                                )
                              }
                              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                              Add Task
                            </button>

                          </div>


                          {/* Display existing URLs */}
                          {note.files && note.files.length > 0 && (
                            <div className="mt-4">
                              <ul>
                                {note.files.map((url, index) => (
                                  <li key={index} className="inline-block max-w-max flex items-center justify-between hover:bg-gray-300">
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{files[index].name}</a>
                                    <div className="flex items-center">
                                      <button onClick={() => handleDeleteFile(url, index)} className="text-red-500 hover:text-red-700 transition-colors duration-300 ml-2">
                                        <MdDeleteForever className="text-xl" />
                                      </button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex text-left flex-col">
                            <label className="mr-2 mb-2 ml-1 font-bold">Due Date</label>
                            <input
                              type="date"
                              value={note.dueDate ? note.dueDate.toDate().toISOString().split('T')[0] : ''}
                              onChange={(e) => setNotes(notes.map(n => (n.id === note.id ? { ...n, dueDate: Timestamp.fromDate(new Date(e.target.value)) } : n)))}
                              className="border border-gray-300 p-2 rounded w-1/6"
                            />
                          </div>
                          <div className="flex items-center space-x-4">
                            <button onClick={() => setEditingNoteId(null)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
                              Cancel
                            </button>
                            <button onClick={() => saveEditedNote(note.id, {
                              title: note.title, description: note.description, dueDate: note.dueDate, files: note.files, tasks: note.tasks?.map(task => ({
                                id: task.id || crypto.randomUUID(),
                                title: task.title || '',
                                description: task.description || '',
                                completed: task.completed ?? false
                              })) || []
                            })} className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600">
                              Save
                            </button>

                            <button onClick={() => deleteNote(note.id)} className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600">
                              <RiDeleteBinLine className="my-2" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <button onClick={() => editNote(note.id)} className="text-md font-semibold w-full text-left py-1">{note.title}</button>
                          {note.dueDate && (
                            <button onClick={() => editNote(note.id)} className="text-sm text-gray-400 w-full text-left py-1">Due: {note.dueDate.toDate().toLocaleDateString()}</button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex">
                      {note.status === 'inProgress' && (
                        <button
                          onClick={() => markNoteAsCompleted(note.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded-full mr-1 text-xs hover:bg-green-600"
                        >
                          <MdCheckCircle className="my-2" />
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

export default Academic;
