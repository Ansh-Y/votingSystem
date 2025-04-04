import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { Polls, Votes } from "../services/api";

const VoterDashboard = () => {
  const { user, logout, checkToken } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("ongoing");
  const [ongoingPolls, setOngoingPolls] = useState([]);
  const [pastPolls, setPastPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Check authentication token on component mount
  useEffect(() => {
    const tokenInfo = checkToken();
    console.log("VoterDashboard - Token check on mount:", tokenInfo.token ? "Token exists" : "No token");
    if (!tokenInfo.token) {
      setError("Authentication issue: No valid token found");
    }
  }, [checkToken]);
  
  const fetchPollsDebug = async () => {
    try {
      console.log("Fetching debug polls directly");
      const response = await fetch('http://localhost:5000/api/polls/debug/ongoing');
      const data = await response.json();
      console.log("Debug data:", data);
      setDebugInfo(data);
      
      if (data.polls && data.polls.length > 0) {
        setOngoingPolls(data.polls);
      }
    } catch (err) {
      console.error("Debug fetch error:", err);
      setError(`Debug error: ${err.message}`);
    }
  };
  
  const fetchPollsDirectly = async () => {
    try {
      setLoading(true);
      console.log("Fetching polls directly with token");
      
      // Check token first
      const tokenInfo = checkToken();
      if (!tokenInfo.token) {
        setError("No authentication token available");
        setLoading(false);
        return;
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenInfo.token}`
      };
      
      console.log("Using headers:", headers);
      
      const response = await fetch('http://localhost:5000/api/polls/ongoing', {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      console.log("Direct fetch response:", data);
      
      if (Array.isArray(data)) {
        setOngoingPolls(data);
        console.log(`Direct fetch got ${data.length} ongoing polls`);
      } else {
        console.error("Unexpected response format:", data);
        setError("Unexpected response format");
      }
    } catch (err) {
      console.error("Direct fetch error:", err);
      setError(`Fetch error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPolls = async () => {
    try {
      setLoading(true);
      console.log("=============================================");
      console.log("Fetching polls for voter dashboard...");
      
      // Check token first
      const tokenInfo = checkToken();
      
      try {
        const ongoingRes = await Polls.getOngoing();
        console.log("Voter dashboard - Ongoing polls:", ongoingRes);
        console.log(`Received ${ongoingRes.length} ongoing polls`);
        
        const pastRes = await Polls.getPast();
        console.log("Voter dashboard - Past polls:", pastRes);
        console.log(`Received ${pastRes.length} past polls`);
        
        // Get user votes to mark polls they've already voted on
        const userVotesRes = await Votes.getUserVotes();
        console.log("User votes:", userVotesRes);
        const userVotedPollIds = new Set(userVotesRes.map(vote => vote.poll_id));
        
        // Mark polls that the user has voted on
        const markVotedPolls = (polls) => {
          return polls.map(poll => ({
            ...poll,
            hasVoted: userVotedPollIds.has(poll.id)
          }));
        };
        
        setOngoingPolls(markVotedPolls(ongoingRes));
        setPastPolls(markVotedPolls(pastRes));
        setError(null); // Clear any existing error
      } catch (apiErr) {
        console.error('Error with authenticated API:', apiErr);
        
        // Fall back to debug endpoint if authenticated fetch fails
        console.log("Falling back to debug endpoint");
        try {
          const response = await fetch('http://localhost:5000/api/polls/debug/ongoing');
          const data = await response.json();
          
          if (data.polls && data.polls.length > 0) {
            console.log("Using debug data as fallback:", data.polls.length, "polls");
            setOngoingPolls(data.polls);
            setError("Using data from debug endpoint (authentication issue)");
          } else {
            setError("Failed to load polls even from debug endpoint");
          }
        } catch (debugErr) {
          console.error('Debug fallback also failed:', debugErr);
          setError("Failed to load polls. Server might be unreachable.");
        }
      }
    } catch (err) {
      console.error('Error in fetchPolls:', err);
      setError('Failed to load polls. Please try again later.');
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
  
  const viewPoll = (pollId) => {
    navigate(`/polls/${pollId}`);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid date';
    }
  };
  
  // Calculate time remaining for a poll
  const getTimeRemaining = (endDate) => {
    // Handle null or invalid end date
    if (!endDate) return 'No end date';
    
    const total = Date.parse(endDate) - Date.parse(new Date());
    if (total <= 0) return 'Ended';
    
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    return `${seconds} second${seconds !== 1 ? 's' : ''} remaining`;
  };
  
  const renderPolls = () => {
    const polls = activeTab === "ongoing" ? ongoingPolls : pastPolls;
    
    if (loading && polls.length === 0) {
      return <div className="loading">Loading polls...</div>;
    }
    
    if (polls.length === 0) {
      return <div>No {activeTab} polls found.</div>;
    }
    
    return (
      <div className="polls-list">
        <h3>{activeTab === "ongoing" ? "Ongoing" : "Past"} Polls</h3>
        {polls.map(poll => (
          <div key={poll.id} className={`poll-item ${poll.status}`}>
            <div className="poll-info">
              <h4>{poll.title}</h4>
              <p className="poll-description">{poll.description}</p>
              <div className="poll-question">{poll.question}</div>
              <div className="poll-dates">
                <span>Start: {formatDate(poll.start_date)}</span>
                <span>End: {formatDate(poll.end_date)}</span>
                {activeTab === "ongoing" && 
                  <span>{getTimeRemaining(poll.end_date)}</span>
                }
              </div>
              {poll.vote_count !== undefined && 
                <div className="vote-count">{poll.vote_count} vote{poll.vote_count !== 1 ? 's' : ''}</div>
              }
              {poll.hasVoted && 
                <div className="badge-voted">Voted</div>
              }
            </div>
            <div className="poll-actions">
              {activeTab === "ongoing" && !poll.hasVoted ? (
                <button 
                  className="vote-btn"
                  onClick={() => viewPoll(poll.id)}
                >
                  Vote Now
                </button>
              ) : (
                <button 
                  className="view-results-btn"
                  onClick={() => viewPoll(poll.id)}
                >
                  View {poll.hasVoted ? "Results" : "Details"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="voter-dashboard">
      <div className="dashboard-header">
        <h2>Voter Dashboard</h2>
        <div className="user-info">
          <span>Welcome, {user?.name || 'Voter'}</span>
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
      
      <div className="dashboard-actions">
        <button 
          className="refresh-btn"
          onClick={fetchPolls}
        >
          Refresh Polls
        </button>
        <button 
          className="debug-btn"
          onClick={fetchPollsDebug}
        >
          Debug Fetch
        </button>
        <button 
          className="direct-fetch-btn"
          onClick={fetchPollsDirectly}
        >
          Direct Fetch
        </button>
      </div>
      
      <div className="poll-status">
        {loading ? "Loading polls..." : 
          `${ongoingPolls.length} ongoing poll(s), ${pastPolls.length} past poll(s)`}
      </div>
      
      {debugInfo && (
        <div className="debug-info">
          <h4>Debug Info:</h4>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
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

export default VoterDashboard;
