import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api, { Polls } from "../services/api";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("ongoing");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [ongoingPolls, setOngoingPolls] = useState([]);
  const [pastPolls, setPastPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Poll form state
  const [pollTitle, setPollTitle] = useState("");
  const [pollDescription, setPollDescription] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const fetchPolls = async () => {
    setLoading(true);
    setError(null);
    console.log("==============================================");
    console.log("Starting poll fetch (AdminDashboard)");
    
    try {
      console.log("Fetching ongoing polls...");
      const ongoingRes = await Polls.getOngoing();
      console.log("Ongoing polls received:", ongoingRes);
      console.log(`Received ${ongoingRes.length} ongoing polls`);
      
      const pastRes = await Polls.getPast();
      console.log("Past polls received:", pastRes);
      console.log(`Received ${pastRes.length} past polls`);
      
      setOngoingPolls(ongoingRes);
      setPastPolls(pastRes);
      
      // Immediately after creating a poll, fetch again to ensure we have the latest data
      console.log("Polls fetched successfully - ongoing:", ongoingRes.length, "past:", pastRes.length);
    } catch (err) {
      console.error("Error fetching polls:", err);
      setError("Failed to load polls. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
    // Poll for updates every minute
    const intervalId = setInterval(fetchPolls, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (pollTitle.trim().length < 5) {
      setError("Poll title must be at least 5 characters");
      return;
    }
    
    if (!pollDescription.trim() || !pollQuestion.trim()) {
      setError("Description and question are required");
      return;
    }
    
    // Filter out empty options
    const filteredOptions = pollOptions.filter(opt => opt.trim() !== "");
    if (filteredOptions.length < 2) {
      setError("At least 2 options are required");
      return;
    }

    setLoading(true);
    setError(null);
    
    const pollData = {
      title: pollTitle,
      description: pollDescription,
      question: pollQuestion,
      options: filteredOptions
    };
    
    console.log("==========================================");
    console.log("Creating poll with data:", JSON.stringify(pollData, null, 2));
    
    try {
      console.log("Calling Polls.create API endpoint");
      const response = await Polls.create(pollData);
      console.log("Poll created successfully, server response:", response);
      setSuccess("Poll created successfully!");
      
      // Reset form
      setPollTitle("");
      setPollDescription("");
      setPollQuestion("");
      setPollOptions(["", ""]);
      setShowCreateForm(false);
      
      // Refresh polls list
      console.log("Refreshing polls list after creation");
      fetchPolls();
    } catch (err) {
      console.error("Error creating poll:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        data: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.error || err.message || "Failed to create poll. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const removeOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };

  const endPoll = async (pollId) => {
    try {
      await Polls.end(pollId);
      setSuccess("Poll ended successfully");
      fetchPolls();
    } catch (err) {
      setError("Failed to end poll");
      console.error(err);
    }
  };

  // Renders the appropriate polls based on the active tab
  const renderPolls = () => {
    let polls = activeTab === "ongoing" ? ongoingPolls : pastPolls;
    
    if (loading && polls.length === 0) {
      return <div className="loading">Loading polls...</div>;
    }
    
    if (polls.length === 0) {
      return <div>No {activeTab} polls found.</div>;
    }
    
    return (
      <div className="polls-list">
        <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Polls</h3>
        {polls.map(poll => (
          <div key={poll.id} className={`poll-item ${poll.status}`}>
            <div className="poll-info">
              <h4>{poll.title}</h4>
              <p className="poll-description">{poll.description}</p>
              <div className="poll-question">{poll.question}</div>
              {poll.vote_count !== undefined && 
                <div className="vote-count">{poll.vote_count} vote{poll.vote_count !== 1 ? "s" : ""}</div>
              }
            </div>
            <div className="poll-actions">
              {activeTab === "ongoing" && (
                <button 
                  className="end-poll-btn"
                  onClick={() => endPoll(poll.id)}
                >
                  End Poll
                </button>
              )}
              <button className="view-results-btn">
                View Results
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div className="user-info">
          <span>Welcome, {user?.name || "Admin"}</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" onClick={() => setError(null)}>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message" onClick={() => setSuccess(null)}>
          {success}
        </div>
      )}

      <div className="admin-actions">
        <button 
          className="create-poll-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Cancel" : "Create New Poll"}
        </button>
        <button 
          className="refresh-btn"
          onClick={fetchPolls}
        >
          Refresh Polls
        </button>
      </div>
      
      <div className="poll-status">
        {loading ? "Loading polls..." : 
          `${ongoingPolls.length} ongoing poll(s), ${pastPolls.length} past poll(s)`}
      </div>

      {showCreateForm && (
        <div className="create-poll-form">
          <h3>Create New Poll</h3>
          <form onSubmit={handleCreatePoll}>
            <div className="form-group">
              <label htmlFor="pollTitle">Poll Title</label>
              <input
                type="text"
                id="pollTitle"
                value={pollTitle}
                onChange={(e) => setPollTitle(e.target.value)}
                placeholder="Enter poll title (min 5 characters)"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="pollDescription">Description</label>
              <textarea
                id="pollDescription"
                value={pollDescription}
                onChange={(e) => setPollDescription(e.target.value)}
                placeholder="Enter poll description"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="pollQuestion">Question</label>
              <input
                type="text"
                id="pollQuestion"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Enter the question for voters"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Options (at least 2)</label>
              {pollOptions.map((option, index) => (
                <div key={index} className="option-input-group">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required={index < 2}
                  />
                  {index >= 2 && (
                    <button
                      type="button"
                      className="remove-option-btn"
                      onClick={() => removeOption(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="add-option-btn"
                onClick={addOption}
              >
                + Add Option
              </button>
            </div>
            
            <button type="submit" className="submit-poll-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Poll"}
            </button>
          </form>
        </div>
      )}

      <div className="polls-tabs">
        <div className="tabs-header">
          <button
            className={activeTab === "ongoing" ? "active" : ""}
            onClick={() => setActiveTab("ongoing")}
          >
            Ongoing Polls
          </button>
          <button
            className={activeTab === "past" ? "active" : ""}
            onClick={() => setActiveTab("past")}
          >
            Past Polls
          </button>
        </div>
        
        {renderPolls()}
      </div>
    </div>
  );
};

export default AdminDashboard;
