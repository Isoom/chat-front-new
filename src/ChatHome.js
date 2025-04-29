import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoom from './ChatRoom';
import ChatBox from './ChatBox';

const ChatHome = () => {
    const [connection, setConnection] = useState(null);
    const [usermessages, setUserMessages] = useState([]);
    const [userName, setUserName] = useState('');
    const [chatRoom, setChatRoom] = useState('announcements'); //standard chatrum
    const [newRoom, setNewRoom] = useState(''); //skapa ett nytt rum
    const [role, setRole] = useState('student'); //standard roll
    const [loading, setLoading] = useState(false);
    const [roomType, setRoomType] = useState('announcements');

    useEffect(() => {
        if (connection) {
            connection.on("ReceiveMessage", (user, message) => {
                setUserMessages(prevMessages => [...prevMessages, { user, message }]);
            });

            connection.onclose(() => {
                console.log("Connection closed");
            });
        }
    }, [connection]);


    const sendMessage = async (message) => {
        if (connection) {
            if (chatRoom === 'announcements' && role !== 'teacher') {
                //Blockera elever från att skicka meddelanden i 'announcements'
                console.log('Only teachers can send messages in announcements');
                return;
            }
            try {
                await connection.invoke("SendMessage", chatRoom, userName, message);
            } catch (error) {
                console.error("Error sending message: ", error);
            }
        }
    };


    const joinChatRoom = async (userName, chatRoom, role) => {
        setLoading(true);
        const connection = new HubConnectionBuilder()
            .withUrl("http://localhost:5028/chat") //min backend URL
            .configureLogging(LogLevel.Information)
            .build();

        await connection.start();
        await connection.invoke("JoinChatRoom", userName, chatRoom, role);
        setConnection(connection);
        setLoading(false);
    };


    const createNewRoom = async () => {
        if (newRoom.trim()) {
            setLoading(true);
            const connection = new HubConnectionBuilder()
                .withUrl("http://localhost:5028/chat") //min backend URL
                .configureLogging(LogLevel.Information)
                .build();

            await connection.start();
            await connection.invoke("CreateChatRoom", userName, newRoom);


            setChatRoom(newRoom);
            setConnection(connection);
            setLoading(false);
            setNewRoom('');
        }
    };


    const handleJoinOrCreate = async () => {
        if (roomType === 'new-chat-room') {
            createNewRoom();
        } else {
            joinChatRoom(userName, chatRoom, role);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            <main className="container flex-grow mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white">Connecting to chat room...</p>
                    </div>
                ) : (
                    connection ? (
                        <>
                            <ChatRoom usermessages={usermessages} role={role} />

                            {/*Visa ChatBox för alla användare som är i rum som inte är announcements*/}
                            {chatRoom !== 'announcements' && (
                                <ChatBox sendMessage={sendMessage} role={role} roomType={chatRoom} />
                            )}

                            {/*Lägg till ChatBox för lärare i announcements*/}
                            {chatRoom === 'announcements' && role === 'teacher' && (
                                <ChatBox sendMessage={sendMessage} role={role} roomType={chatRoom} />
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center min-h-screen bg-gray-900">
                            <div className="w-full max-w-lg p-8 mx-4 bg-white rounded-lg shadow-lg md:mx-auto">
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="block w-full p-2 my-2 border rounded"
                                />

                                {/*Välj mellan ew Chat Room"eller Announcements*/}
                                <select
                                    value={roomType}
                                    onChange={(e) => setRoomType(e.target.value)}
                                    className="block w-full p-2 my-2 border rounded"
                                >
                                    <option value="announcements">Announcements</option>
                                    <option value="new-chat-room">New Chat Room</option>
                                </select>

                                {/*Om användaren väljer New Chat Room, visa inputfält för namn på nytt rum*/}
                                {roomType === 'new-chat-room' && (
                                    <input
                                        type="text"
                                        placeholder="Enter new room name"
                                        value={newRoom}
                                        onChange={(e) => setNewRoom(e.target.value)}
                                        className="block w-full p-2 my-2 border rounded"
                                    />
                                )}

                                {/*Välj mellan elev eller lärare*/}
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="block w-full p-2 my-2 border rounded"
                                >
                                    <option value="student">Elev</option>
                                    <option value="teacher">Lärare</option>
                                </select>

                                {/*Join/Create button*/}
                                <button onClick={handleJoinOrCreate} className="block w-full p-2 my-2 bg-blue-500 text-white rounded">
                                    {roomType === 'new-chat-room' ? 'Create Room' : 'Join Room'}
                                </button>
                            </div>
                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default ChatHome;
