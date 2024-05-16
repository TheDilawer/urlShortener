const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const shortId = require('shortid');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // Allow the HTTP methods you're using
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow the headers you're using
    next();
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// In-memory storage for URL mappings
const urlMap = new Map();
const clientsMap = new Map();

// WebSocket connection handler
// WebSocket connection handler
wss.on('connection', (ws, req) => {
    let sessionId = null;

    // Check if there is a session ID in the request
    if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';');
        for (const element of cookies) {
            const cookie = element.trim();
            if (cookie.startsWith('sessionId=')) {
                sessionId = cookie.substring('sessionId='.length);
                break;
            }
        }
    }

    if (!sessionId) {
        // Generate session ID if not found in the request
        sessionId = shortId.generate();
        console.log('New user connected with session ID:', sessionId);
    } else {
        console.log('Returning user connected with session ID:', sessionId);
    }

    // Store the WebSocket connection with the session ID
    clientsMap.set(sessionId, ws);

    // Send session ID to the client
    ws.send(JSON.stringify({ type: 'sessionId', data: sessionId }));

    console.log(`Client connected with session ID ${sessionId}`);

    // Event listener for closing connection
    ws.on('close', () => {
        console.log(`Client with session ID ${sessionId} disconnected`);
        // Remove the WebSocket connection from the map when the client disconnects
        clientsMap.delete(sessionId);
    });

    // Event listener for messages from client
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'acknowledge') {
            console.log(`Client with session ID ${sessionId} acknowledged receiving the message`);
            // If acknowledgment received, remove the hasSentMessage flag
            delete wsClient.hasSentMessage;
            // Handle acknowledgment from client
        }
    });

    // Check if there was a previous message sent to this client with the same session ID
    const wsClient = clientsMap.get(sessionId);
    if (wsClient.hasSentMessage && wsClient) {
        // Retry sending the previous message with retry mechanism
        const previousMessage = wsClient.previousMessage;
        sendMessageWithRetry(wsClient, previousMessage);
    }
});
// Function to send message to connected clients with retry mechanism
function sendMessageWithRetry(client, message, retries = 3) {
    client.send(message, (error) => {
        if (error) {
            console.error('Error sending message to client:', error);
            if (retries > 0) {
                // Retry sending
                console.log(`Retrying sending message, ${retries} attempts left...`);
                setTimeout(() => {
                    sendMessageWithRetry(client, message, retries - 1);
                }, 1000); // Retry after 1 second
            } else {
                console.error('Maximum retry attempts reached, message not delivered.');
                // Handle maximum retry attempts
            }
        }
    });
}

// POST endpoint to handle new URL submissions
app.post('/url', (req, res) => {
    const { url } = req.body;
    const sessionId = req.body.sessionId; // Retrieve session ID from cookie

    if (!url || !sessionId) {
        return res.status(400).json({ error: 'URL parameter and sessionId cookie are required' });
    }

    // Check if the URL is valid
    if (!isValidURL(url)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    // Check if a URL exists in the map and get its shortcode
    let shortCode = getShortcode(url);

    if (shortCode === null) {
        // Generate short code
        shortCode = shortId.generate();
        // Store mapping
        urlMap.set(shortCode, url);
    }

    // Construct shortened URL
    const shortenedUrl = `http://localhost:${PORT}/${shortCode}`;

    // Store mapping
    urlMap.set(shortCode, url);

    // Send shortened URL to the client who initiated the POST request
    const wsClient = clientsMap.get(sessionId);
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        console.log('Sending message to client...');
        const message = JSON.stringify({ type: 'shortenedUrl', sessionId, data: shortenedUrl });


        // Send the message with retry mechanism
        sendMessageWithRetry(wsClient, message);

        // Update the flag indicating whether a message has been sent to this client
        wsClient.hasSentMessage = true;

    } else {
        console.error('Client not found or WebSocket connection not open');
        // Handle error (e.g., notify server)
    }

    res.status(201).json({ message: 'URL shortened successfully' });
});

// GET endpoint to redirect to original URL
app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;

    const originalUrl = urlMap.get(shortCode);

    if (!originalUrl) {
        return res.status(404).json({ error: 'Shortened URL not found' });
    }

    // Redirect to original URL
    res.redirect(originalUrl);
});

// Function to check if the URL is valid
function isValidURL(url) {
    // Regex for complex URL validation
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
        '(\\#[-a-z\\d_]*)?$','i');
    return pattern.test(url);
}

function getShortcode(url) {
    // Iterate over each entry in the map
    for (let [shortcode, storedUrl] of urlMap) {
        // Check if the stored URL matches the given URL
        if (storedUrl === url) {
            // If a match is found, return the corresponding shortcode
            return shortcode;
        }
    }
    // If no matching URL is found in the map, return null
    return null;
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
