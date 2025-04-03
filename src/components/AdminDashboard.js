import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { pollsAPI } from "../services/api";

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [polls, setPolls] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // New poll form state
  const [newPoll, setNewPoll] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    candidates: []
  });

  // Fetch polls on component mount
  useEffect(() => {
    fetchPolls();
    fetchCandidates();
  }, []);

  // Fetch all polls
  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await pollsAPI.getOngoingPolls();
      setPolls(response.data);
    } catch (err) {
      console.error("Error fetching polls:", err);
      setError("Failed to load polls. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch candidates for poll creation
  const fetchCandidates = async () => {
    try {
      // This would need a new API endpoint to get all candidates
      // For now, using dummy data
      setCandidates([
        { id: 1, name: "Candidate 1" },
        { id: 2, name: "Candidate 2" },
        { id: 3, name: "Candidate 3" },
      ]);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPoll({ ...newPoll, [name]: value });
  };

  // Handle candidate selection
  const handleCandidateSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setNewPoll({ ...newPoll, candidates: selectedOptions });
  };

  // Create new poll
  const handleCreatePoll = async (e) => {
    e.preventDefault();
    
    if (newPoll.candidates.length < 2) {
      setError("Please select at least two candidates");
      return;
    }
    
    try {
      setLoading(true);
      await pollsAPI.createPoll(newPoll);
      
      // Reset form and fetch updated polls
      setNewPoll({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        candidates: []
      });
      setShowCreateForm(false);
      fetchPolls();
    } catch (err) {
      console.error("Error creating poll:", err);
      setError(err.response?.data?.error || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  // End a poll
  const handleEndPoll = async (pollId) => {
    if (!window.confirm("Are you sure you want to end this poll?")) {
      return;
    }
    
    try {
      setLoading(true);
      await pollsAPI.endPoll(pollId);
      fetchPolls();
    } catch (err) {
      console.error("Error ending poll:", err);
      setError("Failed to end poll");
    } finally {
      setLoading(false);
    }
  };

  // View poll results
  const viewPollResults = async (pollId) => {
    // This would navigate to a results page
    console.log("View results for poll:", pollId);
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div className="user-info">
          <span>Welcome, {currentUser.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-actions">
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-poll-btn"
        >
          {showCreateForm ? "Cancel" : "Create New Poll"}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-poll-form">
          <h3>Create New Poll</h3>
          <form onSubmit={handleCreatePoll}>
            <div className="form-group">
              <label htmlFor="title">Poll Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newPoll.title}
                onChange={handleInputChange}
                required
                minLength={5}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newPoll.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={newPoll.startDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={newPoll.endDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="candidates">Select Candidates</label>
              <select
                multiple
                id="candidates"
                name="candidates"
                value={newPoll.candidates}
                onChange={handleCandidateSelection}
                required
              >
                {candidates.map(candidate => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
              <small>Hold Ctrl (or Cmd on Mac) to select multiple candidates</small>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Poll"}
            </button>
          </form>
        </div>
      )}

      <div className="polls-list">
        <h3>Ongoing Polls</h3>
        
        {loading && <p>Loading polls...</p>}
        
        {!loading && polls.length === 0 && (
          <p>No active polls found. Create one to get started.</p>
        )}

        {polls.map(poll => (
          <div key={poll.id} className="poll-item">
            <div className="poll-info">
              <h4>{poll.title}</h4>
              <p>{poll.description}</p>
              <div className="poll-dates">
                <span>Start: {new Date(poll.start_date).toLocaleString()}</span>
                <span>End: {new Date(poll.end_date).toLocaleString()}</span>
              </div>
              <div className="vote-count">
                <span>Votes: {poll.vote_count || 0}</span>
              </div>
            </div>
            
            <div className="poll-actions">
              <button 
                onClick={() => handleEndPoll(poll.id)}
                className="end-poll-btn"
                disabled={loading}
              >
                End Poll
              </button>
              <button 
                onClick={() => viewPollResults(poll.id)}
                className="view-results-btn"
              >
                View Results
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
