import { useEffect, useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import './App.css';
import { FaTrash, FaEdit } from 'react-icons/fa';

const API = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null);
  const [editInput, setEditInput] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummaryReady, setIsSummaryReady] = useState(false);
  const [slackStatus, setSlackStatus] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSendingToSlack, setIsSendingToSlack] = useState(false);

  const fetchTodos = async () => {
    try {
      const res = await axios.get(`${API}/todos`);
      setTodos(res.data);
    } catch (e) {
      toast.error('Failed to fetch todos');
    }
  };

  const addTodo = async () => {
    if (!input.trim()) return;
    try {
      await axios.post(`${API}/todos`, { title: input });
      toast.success('Todo added!');
      setInput('');
      fetchTodos();
    } catch (e) {
      toast.error('Failed to add todo');
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API}/todos/${id}`);
      toast.success('Todo deleted');
      fetchTodos();
    } catch (e) {
      toast.error('Failed to delete todo');
    }
  };

  const startEdit = (todo) => {
    setEditId(todo.id);
    setEditInput(todo.title);
  };

  const saveEdit = async (id) => {
    if (!editInput.trim()) return;
    try {
      await axios.put(`${API}/todos/${id}`, { title: editInput });
      toast.success('Todo updated!');
      setEditId(null);
      setEditInput('');
      fetchTodos();
    } catch (e) {
      toast.error('Failed to update todo');
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditInput('');
  };

  const summarizeTodos = async () => {
    setIsSummarizing(true);
    setIsSummaryReady(false);
    setSummary('');
    setSlackStatus(null);
    try {
      const res = await axios.post(`${API}/todos/summarize`);
      if (res.data?.summary) {
        setSummary(res.data.summary);
        setIsSummaryReady(true);
      } else {
        setSummary('❌ Failed to generate summary');
      }
    } catch (e) {
      setSummary('❌ Error while summarizing todos');
    } finally {
      setIsSummarizing(false);
    }
  };

  const sendSummaryToSlack = async () => {
    if (!summary) return;
    setIsSendingToSlack(true);
    setSlackStatus(null);
    try {
      await axios.post(`${API}/todos/slack`, { summary });
      setSlackStatus('✅ Summary sent to Slack!');
    } catch (e) {
      setSlackStatus('❌ Failed to send summary to Slack');
    } finally {
      setIsSendingToSlack(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="app-container">
      <Toaster position="top-right" />
      <div className="todo-box">
        <h1 className="title">📋 Todo Summary Assistant</h1>

        <div className="input-group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task..."
          />
          <button onClick={addTodo}>Add</button>
        </div>

        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className="todo-item">
              {editId === todo.id ? (
                <>
                  <input
                    value={editInput}
                    onChange={(e) => setEditInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                    className="edit-input"
                  />
                  <button onClick={() => saveEdit(todo.id)} className="edit-button">
                    Save
                  </button>
                  <button onClick={cancelEdit} className="delete-button">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span>{todo.title}</span>
                  <button onClick={() => startEdit(todo)} className="edit-button">
                    <FaEdit />
                  </button>
                  <button onClick={() => deleteTodo(todo.id)} className="delete-button">
                    <FaTrash />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        <button
          onClick={summarizeTodos}
          className="summary-button"
          disabled={isSummarizing}
        >
          {isSummarizing ? '⏳ Summarizing...' : '🧠 Generate Summary'}
        </button>

        {summary && (
          <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{summary}</p>
        )}

        {isSummaryReady && (
          <>
            <button
              onClick={sendSummaryToSlack}
              className="summary-button"
              style={{ marginTop: '10px' }}
              disabled={isSendingToSlack}
            >
              {isSendingToSlack ? '📨 Sending to Slack...' : '📨 Send Summary to Slack'}
            </button>
            {slackStatus && (
              <p style={{ marginTop: '5px', fontWeight: 'bold' }}>{slackStatus}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
