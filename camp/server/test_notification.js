const io = require('socket.io-client');
// Node 18+ has native fetch

// Configuration
const SERVER_URL = 'http://localhost:3000';
const SENDER_ID = 1; // Saul
const RECEIVER_ID = 2; // Cuyoyol

async function test() {
    console.log('--- Starting Notification Test ---');

    // 1. Connect Socket as Receiver
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
        console.log('Socket connected as Receiver. Joining room...');
        // Emulate Client joining logic
        socket.emit('join_user', RECEIVER_ID);
    });

    // Listen for events
    socket.on('new_notification', (data) => {
        console.log('✅ SUCCESS: Received new_notification:', data);
        process.exit(0);
    });

    socket.on('new_message', (data) => {
        console.log('ℹ️ INFO: Received new_message event:', data);
    });

    // Wait a bit for connection
    setTimeout(async () => {
        console.log('Sending message via API...');
        try {
            const response = await fetch(`${SERVER_URL}/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: SENDER_ID,
                    receiverId: RECEIVER_ID,
                    content: "Test message for notification " + Date.now()
                })
            });
            const data = await response.json();
            console.log('API Response status:', response.status);
            console.log('API Response data:', data);
            console.log('Waiting for notification...');
        } catch (error) {
            console.error('API Error:', error);
        }
    }, 1000);

    // Timeout (Fail)
    setTimeout(() => {
        console.error('❌ TIMEOUT: Did not receive notification in time.');
        process.exit(1);
    }, 5000);
}

test();
