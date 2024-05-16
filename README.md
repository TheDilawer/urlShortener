# URL Shortener Application

This is a simple URL shortener application built with Node.js, Express.js, WebSocket, and shortid.

## Overview

URL shortening is a technique in which a long URL is converted into a shorter and more manageable URL. This application provides a simple web interface for users to submit long URLs and receive shortened URLs in return. It also includes real-time communication between the server and clients using WebSocket.

## Features

- Shorten long URLs into shorter, more manageable URLs.
- Real-time updates: Clients receive shortened URLs in real-time without the need to refresh the page.
- Retry mechanism: If there are connection issues, the server retries sending messages to clients.
- Session management: Each user is assigned a session ID to track their interactions with the server.

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies by running `npm install`.

## Usage

1. Start the server by running `npm start` or `node app.js`.
2. Open `index.html` in your browser.
3. Enter a long URL in the input field and click "Shorten URL".
4. The shortened URL will be displayed in real-time.

## Dependencies

- Express.js: Web framework for Node.js.
- WebSocket: Real-time communication between server and clients.
- shortid: Library for generating short IDs.
- cookie-parser: Middleware for parsing cookies in Express.js.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.
