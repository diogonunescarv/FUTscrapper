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


3. **Sending Dataset to Node Server []**
   - Creation and sending of a dataset to a Node.js server.

4. **Displaying Charts on Node Server []**
   - Generation and display of charts from the data.

5. **Client Notifications []**
   - Client event registration via a POST form at the `/notify` path.
   - Sending notifications via email, SMS, or Telegram.

6. **AI Usage (Bonus) []**
   - Implementation of modules with artificial intelligence.

## Project Structure

- **Python Module**: Scripts for scraping and cleaning data.
- **Node.js Server Module**: Node.js server to receive data, display charts, and manage notifications.


