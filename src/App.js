import { Component } from 'react';
import io from 'socket.io-client';
import ChatRoom from './ChatRoom';
import './App.css';

class App extends Component {
    state = {
        username: '',
        room: '',
        loggedIn: false
    }
    socket = io('https://real-time-chat-app-backend-hrej.onrender.com');
    joinRoom = () => {
        const { username, room } = this.state;
        if (username && room) {
            this.socket.emit('joinRoom', { username, room });
            this.setState({ loggedIn: true });
        }
    };
    render() {
        const { username, room, loggedIn } = this.state;
        if (!loggedIn) {
            return (
                <div className="login-container">
                    <h2>Join Chat</h2>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={e => this.setState({ username: e.target.value })}
                        className="login-input"
                    />
                    <input
                        type="text"
                        placeholder="Enter room name"
                        value={room}
                        onChange={e => this.setState({ room: e.target.value })}
                        className="login-input"
                    />
                    <button onClick={this.joinRoom} className="login-button">Join</button>
                </div>
            );
        }
        return <ChatRoom socket={this.socket} username={username} room={room} />;
    }
}

export default App;
