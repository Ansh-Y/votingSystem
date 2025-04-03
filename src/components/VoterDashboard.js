import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { pollsAPI } from "../services/api";

const VoterDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch polls on component mount
  useEffect(() => {
    fetchPolls();
  }, []);

  // Fetch ongoing polls
  const fetchPolls = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await pollsAPI.getOngoingPolls();
      setPolls(response.data);
    } catch (err) {
      console.error("Error fetching polls:", err);
      setError("Failed to load polls. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load poll details
  const loadPollDetails = async (pollId) => {
    try {
      setLoading(true);
      setSelectedCandidate(null);
      setError("");
      const response = await pollsAPI.getPollDetails(pollId);
      setSelectedPoll(response.data);
    } catch (err) {
      console.error("Error loading poll details:", err);
      setError("Failed to load poll details");
    } finally {
      setLoading(false);
    }
  };

  // Handle vote submission
  const handleVote = async () => {
    if (!selectedPoll || !selectedCandidate) {
      setError("Please select a candidate to vote");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await pollsAPI.vote(selectedPoll.id, selectedCandidate);
      
      setSuccessMessage("Your vote has been recorded successfully!");
      
      // Refresh poll details to update the hasVoted status
      await loadPollDetails(selectedPoll.id);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error submitting vote:", err);
      setError(err.response?.data?.error || "Failed to submit your vote");
    } finally {
      setLoading(false);
    }
  };

  // Go back to polls list
  const handleBackToPollsList = () => {
    setSelectedPoll(null);
    setSelectedCandidate(null);
  };

  // View poll results
  const viewPollResults = async (pollId) => {
    try {
      setLoading(true);
      setError("");
      const response = await pollsAPI.getResults(pollId);
      // Would navigate to results page or show results modal
      console.log("Poll results:", response.data);
    } catch (err) {
      console.error("Error fetching poll results:", err);
      setError("Failed to load poll results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voter-dashboard">
      <header className="dashboard-header">
        <h2>Voter Dashboard</h2>
        <div className="user-info">
          <span>Welcome, {currentUser.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {loading && <div className="loading">Loading...</div>}

      {!loading && !selectedPoll && (
        <div className="polls-list">
          <h3>Available Polls</h3>
          
          {polls.length === 0 && (
            <p>No active polls available at the moment.</p>
          )}

          {polls.map(poll => (
            <div key={poll.id} className="poll-item">
              <div className="poll-info">
                <h4>{poll.title}</h4>
                <p>{poll.description}</p>
                <div className="poll-dates">
                  <span>End date: {new Date(poll.end_date).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="poll-actions">
                <button 
                  onClick={() => loadPollDetails(poll.id)}
                  className="view-poll-btn"
                >
                  View Poll
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && selectedPoll && (
        <div className="poll-details">
          <button 
            onClick={handleBackToPollsList}
            className="back-btn"
          >
            &larr; Back to Polls
          </button>

          <h3>{selectedPoll.title}</h3>
          <p>{selectedPoll.description}</p>
          
          <div className="poll-info">
            <p>Voting ends: {new Date(selectedPoll.end_date).toLocaleString()}</p>
            <p>Total votes: {selectedPoll.vote_count}</p>
          </div>

          {selectedPoll.hasVoted ? (
            <div className="already-voted">
              <p>You have already voted in this poll.</p>
              <button 
                onClick={() => viewPollResults(selectedPoll.id)}
                className="view-results-btn"
              >
                View Results
              </button>
            </div>
          ) : (
            <div className="voting-area">
              <h4>Select a candidate to vote:</h4>
              
              <div className="candidates-list">
                {selectedPoll.candidates.map(candidate => (
                  <div 
                    key={candidate.id} 
                    className={`candidate-item ${selectedCandidate === candidate.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCandidate(candidate.id)}
                  >
                    <div className="candidate-info">
                      <h5>{candidate.name}</h5>
                    </div>
                    <div className="candidate-selector">
                      <input 
                        type="radio" 
                        name="candidate" 
                        checked={selectedCandidate === candidate.id}
                        onChange={() => setSelectedCandidate(candidate.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={handleVote}
                className="vote-btn"
                disabled={loading || !selectedCandidate}
              >
                {loading ? "Processing..." : "Submit Vote"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoterDashboard;
