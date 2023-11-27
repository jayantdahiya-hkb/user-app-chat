import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../App'
import FAQComponent from './FaqComponent';
import axios from 'axios';

function Chatbot() {
    const chatBodyRef = useRef(null);
    const [inputMessage, setInputMessage] = useState("");
    const { isOpen, setIsOpen, faqData, chatArray, setChatArray, addMessage, socketConnected, setSocketConnected, connectChat, token, userLoggedIn, operatorConnected, setOperatorConnected } = useAppContext();

    const openChat = (e) => {
        e.preventDefault();
        setIsOpen(true);
    }

    const closeChat = () => {
        setIsOpen(false);
        setChatArray([]);
        setSocketConnected(false);
    }

    // function to handle the NO button selection after the FAQ component
    const handleSelection = async (e) => {
        e.preventDefault();
        addMessage(e.target.textContent, "user");
        await connectChat();
        if (!userLoggedIn && !operatorConnected) {
            connectOperator(e);
        }
    }

    function connectOperator(e) {
        e.preventDefault();
        setOperatorConnected(true);
        addMessage('Connected to an operator', 'notify');
    }

    const guestMessage = async (message) => {
        try {
            const response = await axios.post('http://localhost:8000/user/memo/guestMessage', {
                message
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'tenant_sub_domain': 'gamatron'
                }
            });

            return response.data;
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    const userMessage = async (message) => {

    }


    const chatCompletion = (message) => {
        const wordCount = message.split(/\s+/).length;

        if (wordCount < 7) {
            addMessage('Please descibe your query with more than 10 words', 'operator');
            return;
        }

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
                    if (response.data.status === 'ERROR' && response.data.code === 'internal_err') {
                        // Handle the specific error condition
                        addMessage('An internal error occurred. Please try again later.', 'error');
                    } else if (response.data.status === 'Error') {
                        // Handle other error conditions
                        addMessage('Error occurred. Please try again', 'error');
                    } else {
                        // Handle a successful response

                        return;
                    }
                } catch {
                    console.log("Error = ", response);
                    // Handle API error
                    addMessage("Error occurred. Please try again", "error");
                }
            })
            .catch((error) => {
                console.error("API Error:", error);
                // Handle API error
                addMessage("Error occurred. Please try again", "error");
            });
    }

    const handleImageUpload = (e) => {
        const image = e.target.files[0];

        if (image) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageDataURL = e.target.result;
                addMessage(imageDataURL, 'image');
            };
            reader.readAsDataURL(image);
        } else {
            console.log('Could not upload the image', e);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const message = inputMessage;

        if (message.trim() === "") {
            return;
        }

        addMessage(message, "user");

        if (userLoggedIn && !operatorConnected) {
            chatCompletion(message);
        } else if (!userLoggedIn) {
            guestMessage(message);
        } else {
            userMessage(message);
        }

        setInputMessage("");
    }

    useEffect(() => {
        // Scroll to the bottom of the chat body
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }

    }, [chatArray]);

    if (isOpen) {
        return (
            <div className='fixed flex flex-col bottom-0 right-[10vw] h-[80vh] lg:w-[25vw] md:w-[50vw] sm:w-[80vw] border-x-4 border-t-4 border-gray-900'>
                {/* chatbot head */}
                <div className='flex flex-row justify-between h-[5vh] items-center p-2 border-b-2 border-gray-700'>
                    <div className='flex flex-row gap-2'>
                        <div></div>
                        <div>Status: {socketConnected ? 'Connected' : 'Disconnected'}</div>
                    </div>
                    <div className='flex flex-row gap-2'>
                        <div className='text-gray-800 font-semibold hover:cursor-pointer' onClick={() => setIsOpen(false)} >Min</div>
                        <div className='text-gray-800 font-semibold hover:cursor-pointer' onClick={closeChat}>Close</div>
                    </div>
                </div>
                {/* chatbot head end */}
                {/* chatbot body */}
                <div className='min-h-[40vh] max-h-[100%] p-4 overflow-y-scroll' ref={chatBodyRef}>
                    <FAQComponent faqData={faqData} />
                    {chatArray?.map((chat, index) => {
                        switch (chat.from) {
                            case 'faq':
                                return (
                                    <div className='float-left border-2 border-yellow-600 rounded-lg p-4 clear-both my-2 shadow-md shadow-yellow-300/30' key={index}>
                                        <p>{chat.message}</p>
                                    </div>
                                );

                            case 'notify':
                                return (
                                    <div className='float-left bg-gray-900 text-white border-2 border-gray-900 rounded-lg p-4 clear-both my-2 shadow-md shadow-gray-300/30' key={index}>
                                        <p>{chat.message}</p>
                                    </div>
                                )

                            case "user":
                                return (
                                    <div className='float-right border-2 border-gray-700 rounded-lg p-4 clear-both my-2 shadow-md shadow-gray-600/30' key={index}>
                                        <p>{chat.message}</p>
                                    </div>
                                );

                            case "chatbot":
                                return (
                                    <div className='float-left border-2 border-violet-700 rounded-lg p-4 clear-both my-2 shadow-md shadow-violet-400/30' key={index}>
                                        <p>{chat.message}</p>
                                    </div>
                                );

                            case "operator":
                                return (
                                    <div className='float-left border-2 border-gray-700 rounded-lg p-4 clear-both my-2 shadow-md shadow-gray-600/30 bg-gray-700 text-white' key={index}>
                                        <p>{chat.message}</p>
                                    </div>
                                );

                            case "error":
                                return (
                                    <div className='float-left border-2 border-red-600 rounded-lg p-4 clear-both my-2 shadow-md shadow-red-300/30' key={index}>
                                        <p>{chat.message}</p>
                                    </div>
                                );

                            case "image":
                                return (
                                    <div className='float-right clear-both max-w-[80%]' key={index}>
                                        <img src={chat.message} alt='chat-image' className=' w-full' />
                                    </div>
                                )

                            case "selection-trigger":
                                return (
                                    <div className='m-auto max-w-[80%] border-2 border-gray-500 rounded-lg p-2 items-center clear-both my-4 shadow-md shadow-gray-600/30' key={index}>
                                        <p>{chat.message}</p>
                                        <form className='flex flex-row justify-between mx-3 mt-1'>
                                            <button className='p-2 border-2 border-gray-700 rounded-lg w-[50%] mr-2 hover:bg-black hover:text-white' onClick={(e) => closeChat(e)}>Yes</button>
                                            <button className='p-2 border-2 border-gray-700 rounded-lg w-[50%] hover:bg-black hover:text-white' onClick={(e) => handleSelection(e)}>No</button>
                                        </form>
                                    </div>
                                );

                            case "satisfied-trigger":
                                return (
                                    <div className='m-auto max-w-[80%] border-2 border-gray-500 rounded-lg p-2 items-center clear-both my-4 shadow-md shadow-gray-600/30' key={index}>
                                        <p>{chat.message}</p>
                                        <form className='flex flex-row justify-between mx-3 mt-1'>
                                            <button className='p-2 border-2 border-gray-700 rounded-lg w-[50%] mr-2 hover:bg-black hover:text-white' onClick={(e) => closeChat(e)}>Yes</button>
                                            <button className='p-2 border-2 border-gray-700 rounded-lg w-[50%] hover:bg-black hover:text-white' onClick={(e) => connectOperator(e)}>No</button>
                                        </form>
                                    </div>
                                );

                            default:
                                return null;
                        }
                    })}
                </div>
                {/* chatbot body end */}
                <div>
                    {socketConnected ? (
                        <form className='flex flex-row w-full border-t-2 border-gray-900' onSubmit={(e) => handleSubmit(e)}>
                            <input className='w-[80%] p-2' type="text" placeholder='Enter message' value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
                            {/* only enable upload image input when the user is connected to the operator */}
                            {operatorConnected ? (
                                <label className='relative cursor-pointer flex items-center'>
                                    <input type="file" className='hidden' accept="image/*" onChange={(e) => handleImageUpload(e)} />
                                    <div className='text-gray-600 border-l-2 border-gray-900 h-full p-2'>
                                        <svg width="20px" height="20px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 1H12.5C13.3284 1 14 1.67157 14 2.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V2.5C1 1.67157 1.67157 1 2.5 1ZM2.5 2C2.22386 2 2 2.22386 2 2.5V8.3636L3.6818 6.6818C3.76809 6.59551 3.88572 6.54797 4.00774 6.55007C4.12975 6.55216 4.24568 6.60372 4.32895 6.69293L7.87355 10.4901L10.6818 7.6818C10.8575 7.50607 11.1425 7.50607 11.3182 7.6818L13 9.3636V2.5C13 2.22386 12.7761 2 12.5 2H2.5ZM2 12.5V9.6364L3.98887 7.64753L7.5311 11.4421L8.94113 13H2.5C2.22386 13 2 12.7761 2 12.5ZM12.5 13H10.155L8.48336 11.153L11 8.6364L13 10.6364V12.5C13 12.7761 12.7761 13 12.5 13ZM6.64922 5.5C6.64922 5.03013 7.03013 4.64922 7.5 4.64922C7.96987 4.64922 8.35078 5.03013 8.35078 5.5C8.35078 5.96987 7.96987 6.35078 7.5 6.35078C7.03013 6.35078 6.64922 5.96987 6.64922 5.5ZM7.5 3.74922C6.53307 3.74922 5.74922 4.53307 5.74922 5.5C5.74922 6.46693 6.53307 7.25078 7.5 7.25078C8.46693 7.25078 9.25078 6.46693 9.25078 5.5C9.25078 4.53307 8.46693 3.74922 7.5 3.74922Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                    </div>
                                </label>
                            ) : (<></>)}
                            <button className='w-[20%] p-2 border-l-2 border-gray-900' onClick={(e) => handleSubmit(e)}>Send</button>
                        </form>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        )
    } else {
        return (
            <div className='fixed flex flex-col bottom-0 right-[10vw] lg:w-[25vw] md:w-[50vw] sm:w-[80vw] border-x-4 border-t-4 border-gray-900'>
                <div className='flex flex-row justify-between h-[5vh] items-center p-2'>
                    <div className='flex flex-row gap-2'>
                        <div></div>
                        <div>Status: {socketConnected ? 'Connected' : 'Disconnected'}</div>
                    </div>
                    <div className='flex flex-row gap-2'>
                        <div className='text-gray-800 font-semibold hover:cursor-pointer' onClick={(e) => openChat(e)} >Max</div>
                        <div className='text-gray-800 font-semibold hover:cursor-pointer' onClick={closeChat}>Close</div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Chatbot