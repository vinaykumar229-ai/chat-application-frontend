import { Component } from 'react';
import './ChatRoom.css';

class ChatRoom extends Component {
    state = {
        message: '',
        messages: [],
        typing: [],
        onlineUsers: [],
        isDarkMode: true,
    };
    typingTimeout = null;
    componentDidMount() {
        const { socket } = this.props;

        socket.on('message', (message) => {
            this.setState(prevState => ({
                messages: [...prevState.messages, message]
            }));
        });

        socket.on('typing', (typingUser) => {
            if (!this.state.typing.includes(typingUser)) {
                this.setState(prevState => ({
                    typing: [...prevState.typing, typingUser]
                }));
            }
        });

        socket.on('stopTyping', (stoppedTypingUser) => {
            this.setState(prevState => ({
                typing: prevState.typing.filter(user => user !== stoppedTypingUser)
            }));
        });

        socket.on('onlineUsers', (users) => {
            this.setState({ onlineUsers: users });
        });

        socket.on('userJoined', (username) => {
            this.addNotification(`${username} has joined the chat!`);
        });

        socket.on('userLeft', (username) => {
            this.addNotification(`${username} has left the chat.`);
        });

        socket.on('chatHistory', (chatHistory) => {
            this.setState({ messages: chatHistory });
        });
    }

    componentWillUnmount() {
        const { socket } = this.props;
        socket.off('message');
        socket.off('typing');
        socket.off('stopTyping');
        socket.off('onlineUsers');
        socket.off('userJoined');
        socket.off('userLeft');
        socket.off('chatHistory');
    }

    sendMessage = () => {
        const { username, room, socket } = this.props;
        const { message } = this.state;

        if (message.trim()) {
            socket.emit('chatMessage', { username, room, message });
            this.setState({ message: '' });
        }
    };

    handleTyping = () => {
        const { username, room, socket } = this.props;
        socket.emit('typing', { username, room });

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            socket.emit('stopTyping', { room, username });
        }, 2000);
    };

    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.messages.length !== this.state.messages.length) {
            const chatWindow = document.querySelector('.chat-window');
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }

    render() {
        const { message, messages, typing, onlineUsers, isDarkMode } = this.state;
        const { username, room } = this.props;
        return (
            <div className={`chatroom-container ${isDarkMode ? 'dark' : 'light'}`}>
                <div className="room-name">
                    <h3>Room: {room}</h3>
                </div>
                <div className="chat-window">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={msg.username === username ? 'message-self' : 'message'}
                        >
                            <strong className="username">{msg.username}:</strong> {msg.message}
                        </div>
                    ))}
                    {typing.length > 0 && (
                        <div className="typing-indicator">
                            {typing.join(', ')} {typing.length === 1 ? '' : ''}
                        </div>
                    )}
                </div>
                <div className="online-users">
                    <h4>Online Users:</h4>
                    <ul>
                        {onlineUsers.map((user, index) => (
                            <li key={index} className="online-user">{user}</li>
                        ))}
                    </ul>
                </div>
                <div className="message-input-container">
                    <input
                        type="text"
                        value={message}
                        onChange={e => this.setState({ message: e.target.value })}
                        onKeyPress={this.handleKeyPress}
                        onKeyUp={this.handleTyping}
                        className="message-input"
                        placeholder="Type your message..."
                    />
                    <button onClick={this.sendMessage} className="send-button">Send</button>
                </div>
            </div>
    );
    }
}
export default ChatRoom;
