import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiSend } from 'react-icons/fi';

const ChatBox = ({ sendMessage, role, roomType }) => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    //Kontrollera om anv�ndaren kan skriva baserat p� roll och rumstyp
    const canWrite = !(roomType === 'teacher' && role !== 'teacher');

    //Maxl�ngd f�r meddelanden
    const maxLength = 50;

    const handleSend = () => {
        //Kontrollera om meddelandet �r tomt eller om det �r f�r l�ngt
        if (message.trim() === '') {
            setError('Message can not be empty!');
            return;
        } else if (message.length > maxLength) {
            setError(`Message can not be more than ${maxLength} charachters.`);
            return;
        }


        if (canWrite && message.trim()) {
            sendMessage(message);
            setMessage('');
            setError('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600">
            <div className="flex items-end space-x-2">
                <textarea
                    className="w-full p-2 bg-white rounded-2xl resize-none"
                    rows="1"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                        canWrite ? `Type a message, (max ${maxLength} characters)` : "You are not allowed to write in this chat."
                    }
                    disabled={!canWrite} //G�r s� the textarea inte funkar f�r studenter in teacher room
                    maxLength={maxLength} //S�tter maxl�ngd f�r textarea till 50 tecken
                />
                <button onClick={handleSend} disabled={!canWrite || message.length > maxLength}>
                    <FiSend className="w-5 h-5 text-white" />
                </button>
            </div>

            {error && (
                <div className="mt-2 text-red-500 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

ChatBox.propTypes = {
    sendMessage: PropTypes.func.isRequired,
    role: PropTypes.string.isRequired,
    roomType: PropTypes.string.isRequired
};

export default ChatBox;
