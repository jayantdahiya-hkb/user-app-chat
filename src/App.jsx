import { useEffect, createContext, useContext, useState } from "react";
import "./App.css";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from "axios";
import Chatbot from "./Chatbot/Chatbot";

const AppContext = createContext();

export function useAppContext() {
  return useContext(AppContext);
}


function App() {
  // chatbox open state
  const [isOpen, setIsOpen] = useState(false);
  // tying animation state in the chat
  const [isTyping, setIsTyping] = useState(false);
  // check for user login
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  // state of the connection of the websocket
  const [socketConnected, setSocketConnected] = useState(false);
  // name of the channel for the websocket
  const [channelName, setChannelName] = useState("");
  // is satisfied prompt state that is used to connect to the operator after the ai
  const [satisfactionPrompted, setSatisfactionPrompted] = useState(false);
  // state of the connection status of operator in the chat
  const [operatorConnected, setOperatorConnected] = useState(false);

  // array of FAQ Data
  const [faqData, setFaqData] = useState();
  // array of the chats that are displayed in the chat box
  const [chatArray, setChatArray] = useState([]);

  // const [chatArray, setChatArray] = useState([
  //   {
  //     message: "Welcome to Gamatron. How can I help you today?",
  //     from: "operator",
  //     time: new Date().toLocaleTimeString(),
  //   },
  //   {
  //     message: "hi, how are you?",
  //     from: "user",
  //     time: new Date().toLocaleTimeString(),
  //   },
  //   {
  //     message: "Hi, I am fine. What about you?",
  //     from: "chatbot",
  //     time: new Date().toLocaleTimeString(),
  //   },
  //   {
  //     message: "Sorry there seems to be an error. Please try again.",
  //     from: "error",
  //     time: new Date().toLocaleTimeString(),
  //   },
  //   {
  //     message: "Select one of the options below",
  //     from: "selection-trigger",
  //     time: new Date().toLocaleTimeString(),
  //   },
  //   {
  //     message: "FAQ sample reply message",
  //     from: 'faq',
  //     time: new Date().toLocaleTimeString(),
  //   }
  // ]);


  // const faqData = {
  //   "Account": {
  //     subcategories: [
  //       {
  //         subcategoryName: "Account Issues",
  //         questions: [
  //           "How do I reset my password?",
  //           "What should I do if my account is hacked?",
  //           "How can I update my account information?",
  //           "I forgot my username. What should I do?",
  //           "How do I verify my email address?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Gameplay Assistance",
  //         questions: [
  //           "How do I complete level X?",
  //           "What are the controls for the game?",
  //           "How do I unlock new characters?",
  //           "What should I do if I encounter a bug?",
  //           "How can I improve my gameplay skills?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Payment and Purchases",
  //         questions: [
  //           "How do I make a purchase in the game?",
  //           "What payment methods are accepted?",
  //           "I didn't receive my in-game purchase. What should I do?",
  //           "How can I get a refund for a purchase?",
  //           "What are the prices of in-game items?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Technical Issues",
  //         questions: [
  //           "The game crashes on startup. What should I do?",
  //           "How do I update the game to the latest version?",
  //           "I'm experiencing lag in the game. How can I fix it?",
  //           "How do I clear the game cache?",
  //           "What are the minimum system requirements for the game?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Feedback and Suggestions",
  //         questions: [
  //           "How can I provide feedback about the game?",
  //           "Are there any official forums or communities for players?",
  //           "Can I suggest new features for the game?",
  //           "How do I report a player for misconduct?",
  //           "Does the development team review player suggestions?",
  //         ],
  //       },
  //     ],
  //   },
  //   "Support": {
  //     subcategories: [
  //       {
  //         subcategoryName: "Account Issues",
  //         questions: [
  //           "How do I reset my password?",
  //           "What should I do if my account is hacked?",
  //           "How can I update my account information?",
  //           "I forgot my username. What should I do?",
  //           "How do I verify my email address?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Gameplay Assistance",
  //         questions: [
  //           "How do I complete level X?",
  //           "What are the controls for the game?",
  //           "How do I unlock new characters?",
  //           "What should I do if I encounter a bug?",
  //           "How can I improve my gameplay skills?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Payment and Purchases",
  //         questions: [
  //           "How do I make a purchase in the game?",
  //           "What payment methods are accepted?",
  //           "I didn't receive my in-game purchase. What should I do?",
  //           "How can I get a refund for a purchase?",
  //           "What are the prices of in-game items?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Technical Issues",
  //         questions: [
  //           "The game crashes on startup. What should I do?",
  //           "How do I update the game to the latest version?",
  //           "I'm experiencing lag in the game. How can I fix it?",
  //           "How do I clear the game cache?",
  //           "What are the minimum system requirements for the game?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Feedback and Suggestions",
  //         questions: [
  //           "How can I provide feedback about the game?",
  //           "Are there any official forums or communities for players?",
  //           "Can I suggest new features for the game?",
  //           "How do I report a player for misconduct?",
  //           "Does the development team review player suggestions?",
  //         ],
  //       },
  //     ],
  //   },
  //   "Login and Signup": {
  //     subcategories: [
  //       {
  //         subcategoryName: "Account Issues",
  //         questions: [
  //           "How do I reset my password?",
  //           "What should I do if my account is hacked?",
  //           "How can I update my account information?",
  //           "I forgot my username. What should I do?",
  //           "How do I verify my email address?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Gameplay Assistance",
  //         questions: [
  //           "How do I complete level X?",
  //           "What are the controls for the game?",
  //           "How do I unlock new characters?",
  //           "What should I do if I encounter a bug?",
  //           "How can I improve my gameplay skills?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Payment and Purchases",
  //         questions: [
  //           "How do I make a purchase in the game?",
  //           "What payment methods are accepted?",
  //           "I didn't receive my in-game purchase. What should I do?",
  //           "How can I get a refund for a purchase?",
  //           "What are the prices of in-game items?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Technical Issues",
  //         questions: [
  //           "The game crashes on startup. What should I do?",
  //           "How do I update the game to the latest version?",
  //           "I'm experiencing lag in the game. How can I fix it?",
  //           "How do I clear the game cache?",
  //           "What are the minimum system requirements for the game?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Feedback and Suggestions",
  //         questions: [
  //           "How can I provide feedback about the game?",
  //           "Are there any official forums or communities for players?",
  //           "Can I suggest new features for the game?",
  //           "How do I report a player for misconduct?",
  //           "Does the development team review player suggestions?",
  //         ],
  //       },
  //     ],
  //   },
  //   "FAQ": {
  //     subcategories: [
  //       {
  //         subcategoryName: "Account Issues",
  //         questions: [
  //           "How do I reset my password?",
  //           "What should I do if my account is hacked?",
  //           "How can I update my account information?",
  //           "I forgot my username. What should I do?",
  //           "How do I verify my email address?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Gameplay Assistance",
  //         questions: [
  //           "How do I complete level X?",
  //           "What are the controls for the game?",
  //           "How do I unlock new characters?",
  //           "What should I do if I encounter a bug?",
  //           "How can I improve my gameplay skills?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Payment and Purchases",
  //         questions: [
  //           "How do I make a purchase in the game?",
  //           "What payment methods are accepted?",
  //           "I didn't receive my in-game purchase. What should I do?",
  //           "How can I get a refund for a purchase?",
  //           "What are the prices of in-game items?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Technical Issues",
  //         questions: [
  //           "The game crashes on startup. What should I do?",
  //           "How do I update the game to the latest version?",
  //           "I'm experiencing lag in the game. How can I fix it?",
  //           "How do I clear the game cache?",
  //           "What are the minimum system requirements for the game?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Feedback and Suggestions",
  //         questions: [
  //           "How can I provide feedback about the game?",
  //           "Are there any official forums or communities for players?",
  //           "Can I suggest new features for the game?",
  //           "How do I report a player for misconduct?",
  //           "Does the development team review player suggestions?",
  //         ],
  //       },
  //     ],
  //   },
  //   "Lorem Ipsum Dolor": {
  //     subcategories: [
  //       {
  //         subcategoryName: "Account Issues",
  //         questions: [
  //           "How do I reset my password?",
  //           "What should I do if my account is hacked?",
  //           "How can I update my account information?",
  //           "I forgot my username. What should I do?",
  //           "How do I verify my email address?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Gameplay Assistance",
  //         questions: [
  //           "How do I complete level X?",
  //           "What are the controls for the game?",
  //           "How do I unlock new characters?",
  //           "What should I do if I encounter a bug?",
  //           "How can I improve my gameplay skills?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Payment and Purchases",
  //         questions: [
  //           "How do I make a purchase in the game?",
  //           "What payment methods are accepted?",
  //           "I didn't receive my in-game purchase. What should I do?",
  //           "How can I get a refund for a purchase?",
  //           "What are the prices of in-game items?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Technical Issues",
  //         questions: [
  //           "The game crashes on startup. What should I do?",
  //           "How do I update the game to the latest version?",
  //           "I'm experiencing lag in the game. How can I fix it?",
  //           "How do I clear the game cache?",
  //           "What are the minimum system requirements for the game?",
  //         ],
  //       },
  //       {
  //         subcategoryName: "Feedback and Suggestions",
  //         questions: [
  //           "How can I provide feedback about the game?",
  //           "Are there any official forums or communities for players?",
  //           "Can I suggest new features for the game?",
  //           "How do I report a player for misconduct?",
  //           "Does the development team review player suggestions?",
  //         ],
  //       },
  //     ],
  //   }
  // }

  // const tenant_id = "6405cea9e053eb4f51027185";

  const token =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvdXNlci9sb2dpbiIsImlhdCI6MTcwMDc0MTU2OCwibmJmIjoxNzAwNzQxNTY4LCJqdGkiOiJiaVBTVUxhczJqVnZwYkZrIiwic3ViIjoiNjQyZDQ2ZTlmOGRhNDJjOGY2MGNmNTkyIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.__XTBd5wbVaMBirH20rh1QbEXZSRl90u5EHvIGyu4F8";





  // function to get FAQ Data using tenant_id
  const fetchFAQData = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/user/memo/getTenantFaqData',
        {
          // tenant_id: `${tenant_id}`,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
            'Content-Type': 'application/json',
            'tenant_sub_domain': 'gamatron',
          },
        }
      );

      console.log('FAQ DATA =', response.data.faq_data);
      setFaqData(response.data.faq_data);
    } catch (error) {
      console.error('Error fetching FAQ data:', error);
    }
  };

  useEffect(() => {
    fetchFAQData();
  }, []);


  // function to connect to the websocket and response => channelName
  function connectChat() {
    console.log("connecting to websocket");
    if (userLoggedIn) {
      const url = "http://localhost:8000/user/memo/connectChat";
      const headers = {
        Authorization: `Bearer ${token}`,
        tenant_sub_domain: "gamatron",
      };

      axios
        .post(url, null, { headers })
        .then((response) => {
          const channelName = response.data.channelName;
          console.log("Channel Name:", channelName);
          setChannelName(channelName);
          setSocketConnected(true);
          addMessage("Hi, please enter your query below in min 10 words and hit enter", "notify");
        })
        .catch((error) => {
          console.error("Error:", error);
          // Handle error
          addMessage("Error occurred. Please try again", "error");
        });
    } else {
      const url = "http://localhost:8000/user/memo/connectChat";
      const headers = {
        tenant_sub_domain: "gamatron",
      };

      axios
        .post(url, null, { headers })
        .then((response) => {
          const channelName = response.data.channelName;
          console.log("Channel Name:", channelName);
          setChannelName(channelName);
          setSocketConnected(true);
          addMessage("Hi, now you've been connected to the operator", "notify");
        })
        .catch((error) => {
          console.error("Error:", error);
          // Handle error
          addMessage("Error occurred. Please try again", "error");
        });
    }
  }



  function addMessage(message, from) {
    const newMessage = {
      message,
      from,
      time: new Date().toLocaleTimeString(),
    };

    setChatArray((prevChatArray) => [...prevChatArray, newMessage]);
    setIsTyping(false);
  }





  // using pusher js to listen to public New Message event
  useEffect(() => {
    if (channelName) {

      // pusher client
      const client = new Pusher("app-key", {
        wsHost: "127.0.0.1",
        wsPort: 6001,
        wssPort: 6001,
        cluster: "mt1",
        forceTLS: false,
        encrypted: true,
        enableStats: false,
        enabledTransports: ["ws", "wss"],
      });

      // Laravel-echo
      const echo = new Echo({
        broadcaster: "pusher",
        cluster: "mt1",
        key: "app-key",
        wsHost: "127.0.0.1",
        wsPort: 6001,
        wssPort: 6001,
        forceTLS: false,
        encrypted: false,
        enableStats: false,
        enabledTransports: ["ws", "wss"],
      });

      let channel = client.subscribe(`${channelName}`);

      channel.bind("pusher:subscription_succeeded", () => {
        console.log("Pusher: subscription_succeeded", channel);
        setSocketConnected(true);
      });

      channel.bind("pusher:subscription_error", (e) => {
        console.error("Pusher: subscription_error", e);
      });

      channel.bind("OperatorMessage", (data) => {
        console.log('Event Triggered = ', data);
        if (data.from !== "user") {
          addMessage(data.message, data.from);
        }
      });

      // Clean up the subscription when the component unmounts
      return () => {
        channel.unsubscribe(channelName);
      };
    }

  }, [channelName]);



  // trigger to ask the user if the responses are satisfactory or not?
  useEffect(() => {
    // console.log('operator connected status =', operatorConnected);
    // console.log('chat array length =', chatArray.length);
    // console.log('is satisfied prompted = ', satisfactionPrompted);
    if (!operatorConnected) {
      if (chatArray.length === 7 && !satisfactionPrompted) {
        addMessage('satisfied trigger?', 'satisfied-trigger');
        setSatisfactionPrompted(true);
      }
    }
  }, [chatArray]);


  // Global pusher logs
  Pusher.logToConsole = false;

  return (
    <>
      <AppContext.Provider
        value={{
          isOpen,
          setIsOpen,
          chatArray,
          setChatArray,
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
          faqData,
          operatorConnected,
          setOperatorConnected
        }}
      >
        <div className=" flex flex-col items-center justify-center h-screen gap-4">
          <Chatbot />
        </div>
      </AppContext.Provider>
    </>
  );
}

export default App;
