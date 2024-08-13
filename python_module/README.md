# FUTscraper

This project scrapes player information from Futwiz and saves the data to a CSV file.

Currently, the scraper is configured to search for gold players with a price greater than 350 coins.

## Installation

### Using Docker

#### Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine.

#### Build the Docker Image

Navigate to the project directory and build the Docker image:

```bash
cd FUTscrapper/python_module
docker build -t python-module-image .
```

## Notes

Please note that the available Bash script is not being used to download the data and is only provided for the purpose of course evaluation. All scraping operations are performed in the Python code.

### Important

Make sure that the **server is running before** you execute the Docker commands. The server must be operational to ensure proper communication and data handling during the Docker build and execution processes.

