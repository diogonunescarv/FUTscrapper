# Node Module Server

This project serves as a Node.js server that handles various operations as defined in the provided codebase. The server is designed to be run in a Docker container for easy deployment and management.

## Installation

### Using Docker

#### Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine.

#### Build the Docker Image

Navigate to the project directory and build the Docker image:

```bash
cd node_module
docker build -t node-module-server .
```

## Environment Variables

To use the integrations in this project, you need to create an .env file in the root directory with the following credentials:

```bash
# Use outlook credentials
EMAIL_USER
EMAIL_PASS

TWILIO_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER

GEMINI_API_KEY
```
