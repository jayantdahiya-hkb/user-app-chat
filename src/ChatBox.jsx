import { useState, useEffect, useRef } from "react";
import axios from "axios";

import "./chatBox.css";
import { useAppContext } from "./App";

function ChatBox() {
  const chatBodyRef = useRef(null);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    isOpen,
    setIsOpen,
    chatArray,
    isTyping,
    setIsTyping,
    addMessage,
    token,
    socketConnected,
    setSocketConnected,
    channelName,
    setChannelName,
    userLoggedIn,
    setUserLoggedIn,
    connectChat,
  } = useAppContext();

  const faqQuestionArray = [
    "1. this is question 1",
    "2. this is question 2",
    "3. this is question 3",
    "4. this is question 4",
    "5. this is question 5",
    "6. this is question 6",
  ];

  function handleOpen(e) {
    e.preventDefault();
    setIsOpen(true);
  }

  function handleFAQClick(e) {
    const url = "http://localhost:8000/user/memo/faqQuestion";
    const tenantSubDomain = "gamatron";

    const data = {
      faqQuestion: e.target.textContent,
    };

    const headers = {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
      tenant_sub_domain: tenantSubDomain,
    };

    addMessage(e.target.textContent, "User");

    setIsTyping(true);

    axios
      .post(url, data, { headers })
      .then((response) => {
        // console.log("FAQ response = ", response.data);
        addMessage(response.data.message, "Chatbot");
        setIsTyping(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function chatCompletion(e) {
    e.preventDefault();
    axios
      .post(
        "http://localhost:8000/user/memo/chatCompletion",
        {
          playerQuery: message,
          is_satisfied: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
            tenant_sub_domain: "gamatron",
          },
        }
      )
      .then((response) => {
        console.log(response);
        try {
          console.log("chatCompletion API Response:", response.data);
        } catch {
          console.log("Error = ", response);
          // Handle API error
          addMessage("Error occurred. Please try again", "Operator");
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
        // Handle API error
        addMessage("Error occurred. Please try again", "Operator");
      });
  }

  function operatorChat(e) {
    e.preventDefault();
    let operatorChat = 'This is a test message when the user chats with the operator';
    addMessage(operatorChat, "Operator");
    setIsTyping(false);
    return null;
  }


  function handleFileChange(e) {
    setSelectedFile(e.target.files[0]);
  }

  function handleSubmit(e) {
    const message = inputMessage;

    if (message.trim() === "") {
      return;
    }

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        // Handle base64 image data here
        console.log('Base64 image:', base64Data);
        addMessage(base64Data, "Image");

        // Reset the input and selected file
        setInputMessage("");
        setSelectedFile(null);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // Handle case when no file is selected
    }

    addMessage(message, "User");
    setInputMessage("");
    setIsTyping(true);

    if (userLoggedIn) {
      chatCompletion(e);
    } else {
      operatorChat(e);
    }
  }

  function handleClose(e) {
    e.preventDefault();
    setIsOpen(false);
  }


  useEffect(() => {
    connectChat();
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the chat body
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatArray]);

  return (
    <>
      {isOpen ? (
        <div className="chat-box">
          <div className="chat-header">
            <div className="header-status">
              <div
                className={socketConnected ? "status-online" : "status-offline"}
              ></div>
              <div className="status-name">Support</div>
            </div>
            <div className="close-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                onClick={handleClose}
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          </div>
          <div className="chat-body" ref={chatBodyRef}>
            {userLoggedIn &&
              // Mapping all the FAQ questions for the user
              faqQuestionArray.map((faqQuestion, index) => (
                <div
                  className="chat-body-faq"
                  key={index}
                  onClick={handleFAQClick}
                >
                  {faqQuestion}
                </div>
              ))}
            <div className="chat-body-faq" onClick={connectChat}>
              Connect chat
            </div>
            {/* show when the chat is connected */}
            {chatArray.length > 0 &&
              chatArray.map((chat, index) => {
                let chatMessageClass = "";
                let messageClass = "";

                switch (chat.from) {
                  case "User":
                    chatMessageClass = "chat-message-right";
                    messageClass = "message-user";
                    break;
                  case "Operator":
                    chatMessageClass = "chat-message-left";
                    messageClass = "message-operator";
                    break;
                  case "Chatbot":
                    chatMessageClass = "chat-message-left";
                    messageClass = "message-chatbot";
                    break;
                  // case "Image":
                  //   chatMessageClass = "chat-message-left";
                  //   messageClass = "message-image";
                  //   break;
                  default:
                    // Handle other cases or provide a default class
                    break;
                }

                return (
                  <div className={chatMessageClass} key={index}>
                    {chat.from === "Image" && (
                      <img
                        src={chat.message}
                        alt="image"
                        className="message-image"
                      />
                    )}
                    <div className={messageClass}>{chat.message}</div>
                    <div className="message-details">
                      <div className="from">{chat.from}</div>
                      <div className="time">{chat.time}</div>
                    </div>
                  </div>
                );
              })}
            {/* show when typing is true */}
            {isTyping && (
              <div className="chat-message-left">
                <div className="chat-message-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
          <div className="chat-footer">
            <form onSubmit={handleSubmit} className="message-form">
              <label htmlFor="file-upload" className="upload-button">
                Upload
              </label>
              <input
                id="file-upload"
                type="file"
                className="file-input"
                onChange={handleFileChange}
                disabled={socketConnected ? false : true}
              />
              <input
                type="text"
                placeholder="Type a message"
                className="message-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={socketConnected ? false : true}
              />
              <button type="submit" className="message-send-button">
                Send
              </button>
            </form>
          </div>
        </div>
      ) : (
        // when the chat is minimized
        <div className="chat-box" onClick={handleOpen}>
          <div className="chat-header">
            <div className="header-status">
              <div
                className={socketConnected ? "status-online" : "status-offline"}
              ></div>
              <div className="status-name">Support</div>
            </div>
            <div className="open-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBox;
