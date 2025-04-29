import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiSend } from 'react-icons/fi';

const ChatBox = ({ sendMessage, role, roomType }) => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    //Kontrollera om användaren kan skriva baserat på roll och rumstyp
    const canWrite = !(roomType === 'teacher' && role !== 'teacher');

    //Maxlängd för meddelanden
    const maxLength = 50;

    const handleSend = () => {
        //Kontrollera om meddelandet är tomt eller om det är för långt
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
                    disabled={!canWrite} //Gör så the textarea inte funkar för studenter in teacher room
                    maxLength={maxLength} //Sätter maxlängd för textarea till 50 tecken
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
