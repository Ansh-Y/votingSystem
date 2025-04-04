import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { pollsAPI } from "../services/api";

const CandidateDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [ongoingPolls, setOngoingPolls] = useState([]);
  const [pastPolls, setPastPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ongoing");

  // Fetch polls on component mount
  useEffect(() => {
    fetchPolls();
  }, []);

  // Fetch ongoing and past polls
  const fetchPolls = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch ongoing polls
      const ongoingResponse = await pollsAPI.getOngoingPolls();
      setOngoingPolls(ongoingResponse.data);
      
      // Fetch past polls
      const pastResponse = await pollsAPI.getPastPolls();
      setPastPolls(pastResponse.data);
      
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

  // Go back to polls list
  const handleBackToPollsList = () => {
    setSelectedPoll(null);
  };

  // View poll results
  const viewPollResults = async (pollId) => {
    try {
      setLoading(true);
      setError("");
      loadPollDetails(pollId);
    } catch (err) {
      console.error("Error fetching poll results:", err);
      setError("Failed to load poll results");
    } finally {
      setLoading(false);
    }
  };

  // Filter polls where current candidate is participating
  const filterCandidatePolls = (polls) => {
    return polls.filter(poll => {
      // This is a placeholder - in a real implementation, 
      // we would check if the candidate ID is in the poll's candidates list
      // For now, assume all polls include this candidate
      return true;
    });
  };

  return (
    <div className="candidate-dashboard">
      <header className="dashboard-header">
        <h2>Candidate Dashboard</h2>
        <div className="user-info">
          <span>Welcome, {currentUser.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Loading...</div>}

      {!loading && !selectedPoll && (
        <div className="polls-container">
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
          </div>

          {activeTab === "ongoing" && (
            <div className="polls-list">
              <h3>Ongoing Elections</h3>
              
              {filterCandidatePolls(ongoingPolls).length === 0 && (
                <p>You are not participating in any active polls at the moment.</p>
              )}

              {filterCandidatePolls(ongoingPolls).map(poll => (
                <div key={poll.id} className="poll-item">
                  <div className="poll-info">
                    <h4>{poll.title}</h4>
                    <p>{poll.description}</p>
                    <div className="poll-dates">
                      <span>End date: {new Date(poll.end_date).toLocaleString()}</span>
                    </div>
                    <div className="vote-count">
                      <span>Current votes: {poll.vote_count || 0}</span>
                    </div>
                  </div>
                  
                  <div className="poll-actions">
                    <button 
                      onClick={() => loadPollDetails(poll.id)}
                      className="view-poll-btn"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "past" && (
            <div className="polls-list">
              <h3>Past Elections</h3>
              
              {filterCandidatePolls(pastPolls).length === 0 && (
                <p>You have not participated in any past polls.</p>
              )}

              {filterCandidatePolls(pastPolls).map(poll => (
                <div key={poll.id} className="poll-item">
                  <div className="poll-info">
                    <h4>{poll.title}</h4>
                    <p>{poll.description}</p>
                    <div className="poll-dates">
                      <span>Ended: {new Date(poll.end_date).toLocaleString()}</span>
                    </div>
                    <div className="vote-count">
                      <span>Total votes: {poll.vote_count || 0}</span>
                    </div>
                  </div>
                  
                  <div className="poll-actions">
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
          )}
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
            <p>Status: <span className="poll-status">{selectedPoll.status}</span></p>
            <p>Start date: {new Date(selectedPoll.start_date).toLocaleString()}</p>
            <p>End date: {new Date(selectedPoll.end_date).toLocaleString()}</p>
            <p>Total votes: {selectedPoll.vote_count}</p>
          </div>

          <div className="candidates-results">
            <h4>Current Results:</h4>
            <div className="results-list">
              {selectedPoll.candidates && selectedPoll.candidates.map(candidate => {
                // Highlight the current candidate
                const isCurrentCandidate = candidate.id === currentUser.id;
                const totalVotes = selectedPoll.vote_count || 1; // Prevent division by zero
                const votePercentage = (candidate.votes / totalVotes) * 100 || 0;
                
                return (
                  <div 
                    key={candidate.id} 
                    className={`result-item ${isCurrentCandidate ? 'current-candidate' : ''}`}
                  >
                    <div className="candidate-info">
                      <h5>{candidate.name} {isCurrentCandidate && "(You)"}</h5>
                      <div className="vote-bar">
                        <div 
                          className="vote-progress" 
                          style={{ width: `${votePercentage}%` }}
                        ></div>
                      </div>
                      <div className="vote-stats">
                        <span>{candidate.votes} votes</span>
                        <span>{votePercentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
