# Notification and Data Analysis System

## Description

This repository implements a **Notification and Data Analysis System** for the GCC129 – Distributed Systems - 2024/1 project. The system performs data scraping from FUTBIN, processes and cleans the data with Python, and makes it available on a Node.js server. Additionally, it includes client notification functionalities and utilizes artificial intelligence as a bonus.

## Features

1. **Data Scraping with Bash [X]**
   - **Description:** Bash scripts for data scraping from FUTBIN.
   - **Problem Encountered:** Unable to scrape their page due to intermediary protection.
   - **Solution:** Scrape data from FUTWIZ instead.

2. **Data Cleaning with Python [X]**
   - **Description:** Python scripts to clean and prepare the scraped data.
   - **Solution:** The data cleaning process uses the `BeautifulSoup` library. After scraping the data, the script uses BeautifulSoup to parse and extract relevant information from the HTML. This includes player ratings, positions, names, skill moves, weak foot, and prices. The cleaned data is structured into a Pandas DataFrame and saved into a CSV file for further analysis.

3. **Sending Dataset to Node Server [X]**
   - **Description:** Creation and sending of a dataset to a Node.js server.
   - **Solution:** Developed a Python script to scrape player data, save it as `players_data.csv`, and send it to a Node.js server endpoint (`http://localhost:3000/receive-data`). The script manages data in chunks of 500 entries and is scheduled to run every 10 minutes.

4. **Displaying Charts on Node Server [X]**
   - **Description:** Generation and display of charts from the data.
   - **Solution:** Implemented a `/dashboard` endpoint to serve `dashboard.html` from the `public/dashboard` directory. The HTML file includes a `<select>` dropdown for player selection and a `<canvas>` element for displaying charts using Chart.js. The `/players` endpoint lists available players, and the `/chart-data/:playerName` endpoint provides data for the selected player. Charts update in real-time based on player selection.

5. **Client Notifications [X]**
   - **Description:** Client event registration and notifications.
   - **Solution:**
     - **Email Notifications:** Use `nodemailer` with configured SMTP credentials to send emails. Notifications include user details and custom text.
     - **SMS Notifications:** Utilize the `twilio` package with the Twilio API to send SMS messages. Notifications are sent to the user's phone number.

6. **AI Usage (Bonus) [X]**
   - **Description:** Implementation of artificial intelligence modules.
   - **Solution:** Use the Gemini API to generate personalized notification texts. A function (`generatePersonalizedText`) sends a prompt to the API, including user details and filtered results, and receives a customized message to enhance engagement.

## Project Structure

- **Python Module [X]:** Scripts for scraping and cleaning data.
- **Node.js Server Module [X]:** Node.js server to receive data, display charts, and manage notifications.
