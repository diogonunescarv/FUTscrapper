# Notification and Data Analysis System

## Description

This repository implements a **Notification and Data Analysis System** for the GCC129 – Distributed Systems - 2024/1 project. The system performs data scraping from FUTBIN, processes and cleans the data with Python, and makes it available on a Node.js server. Additionally, it includes client notification functionalities and utilizes artificial intelligence as a bonus.

## Features

1. **Data Scraping with Bash [X]**
   - Bash scripts for data scraping from FUTBIN.
   - **Problem Encountered:** Unable to scrape their page due to intermediary protection.
   - **Solution:** Scrape data from FUTWIZ instead.

2. **Data Cleaning with Python [X]** 
   - Python scripts to clean and prepare the scraped data.
   - **Solution:** The data cleaning process is handled using the `BeautifulSoup` library. After scraping the data from the website, the script uses BeautifulSoup to parse and extract the relevant information from the HTML structure. This involves navigating through the HTML tags and attributes to isolate the required data fields, such as player ratings, positions, names, skill moves, weak foot, and prices. The cleaned data is then structured into a Pandas DataFrame for easy manipulation and saving. Finally, the processed data is saved into a CSV file for further analysis or use.

3. **Sending Dataset to Node Server [X]**
   - Creation and sending of a dataset to a Node.js server.
   - **Solution:** Developed a Python script that scrapes player data from multiple pages, saves it as a CSV file in the data directory, and sends the dataset to a Node.js server endpoint (http://localhost:3000/receive-data). The script ensures that the CSV file is consistently saved with the name players_data.csv and manages the data in chunks of 500 entries when sending to the endpoint. Scheduled to run every 10 minutes.

4. **Displaying Charts on Node Server [X]**
   - Generation and display of charts from the data.
   - **Solution:** Implemented a /dashboard endpoint to serve the dashboard.html file from the public/dashboard directory. The dashboard.html file contains a <select> dropdown for choosing players and a <canvas> element for displaying the chart. The chart is dynamically updated based on the selected player using Chart.js. An additional /players endpoint provides a list of available players, while the /chart-data/:playerName endpoint supplies the chart data for the selected player. The chart refreshes automatically when a new player is selected, ensuring real-time data visualization.

5. **Client Notifications [X]**
   - Client event registration via a POST form at the `/notify` path.
   - Sending notifications via email, SMS, or Telegram.
   **Solution:**
   - **Email Notifications:** Use `nodemailer` with configured SMTP credentials to send email notifications. Emails are sent with the user's provided details and a notification text crafted for each request.
   - **SMS Notifications:** Utilize the `twilio` package with the Twilio API to send SMS messages. SMS messages are dispatched with the notification text to the user's phone number.

6. **AI Usage (Bonus) [X]**
   - Implementation of modules with artificial intelligence.
   - **Solution:** Use the Gemini API to generate personalized notification texts. Implement a function (generatePersonalizedText) that sends a prompt to the Gemini API, incorporating user details and filtered results. The API responds with a customized message, enhancing the quality and engagement of notifications. This setup leverages AI to produce more natural and tailored communication for the users.

## Project Structure

- **Python Module [X]**: Scripts for scraping and cleaning data.
- **Node.js Server Module [X]**: Node.js server to receive data, display charts, and manage notifications.


