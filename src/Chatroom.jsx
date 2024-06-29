import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./Chatroom.css"; // Import the CSS file

const socket = io("http://localhost:3001");

const Chatroom = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const messagesEndRef = useRef(null);
  const userColors = useRef({});
  const clickCount = useRef(0);

  useEffect(() => {
    // Listen for previous messages
    socket.on("previous messages", (msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });

    // Listen for new messages
    socket.on("chat message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
      scrollToBottom();
    });

    return () => {
      socket.off("previous messages");
      socket.off("chat message");
    };
  }, []);

  const handleLogin = () => {
    if (username) {
      setLoggedIn(true);
    }
  };

  const handleSendMessage = () => {
    if (message) {
      socket.emit("chat message", `${username}: ${message}`);
      setMessage("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getUserColor = (user) => {
    if (!userColors.current[user]) {
      const color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 75%)`;
      userColors.current[user] = color;
    }
    return userColors.current[user];
  };

  const handleHeaderClick = () => {
    clickCount.current += 1;
    if (clickCount.current === 5) {
      setMessages([]);
      clickCount.current = 0;
    }
  };

  return (
    <div className="chat-container">
      {!loggedIn ? (
        <div className="login-container">
          <h3>Enter username</h3>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleLogin} type="submit">
            Enter Chatroom
          </button>
        </div>
      ) : (
        <div className="chatroom-container">
          <h2 className="chatroom-header" onClick={handleHeaderClick}>
            Chatroom
          </h2>
          <div className="messages-container">
            {messages.map((msg, index) => {
              const [user, ...messageParts] = msg.split(": ");
              const messageText = messageParts.join(": ");
              const userColor = getUserColor(user);
              return (
                <div key={index}>
                  <span style={{ backgroundColor: userColor }}>
                    <strong>{user}:</strong>
                  </span>{" "}
                  {messageText}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="message-input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="message-input"
            />
            <button onClick={handleSendMessage} className="send-button">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatroom;
