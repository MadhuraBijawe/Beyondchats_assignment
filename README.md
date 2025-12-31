BeyondChats Project

Overview

This repository contains a Python backend built with Django a simple frontend built with Vite and React and a small scraper implemented in Python. The instructions below explain how to set up and run each part in a development environment.

Requirements

1. Python version three point ten or later
2. Node version sixteen or later and npm or yarn
3. Access to a terminal and basic command line familiarity

Backend setup and run

1. Open a terminal and change to the folder named backend underscore django
2. Create a Python virtual environment using the venv module and activate it using the platform specific activation command
3. Install Python dependencies from the file named requirements dot txt inside the backend underscore django folder
4. Apply database migrations using Django manage commands and start the development server

Notes about the backend

The project includes a local sqlite database file so no separate database server is required for development. Use the manage script in the backend underscore django folder to run migrations and to start the server.

Frontend setup and run

1. Open a terminal and change to the frontend folder with the name article frontend where the two words are joined by a punctuation mark in the actual folder name
2. Install node packages using npm or yarn
3. Start the development server with the script named dev in the frontend package file

The frontend uses Vite and will show the local address and port in the terminal when the server starts.

Scraper and import scripts

The folder named scraper python contains scripts that can be used to scrape and to import articles. To run the scraper create and activate a Python virtual environment then install the requirements from the file in that folder and run the scraper script provided there.

Running tests

Run Django tests by using the manage script in the backend underscore django folder and invoking the test command.

Final notes

Use the repository root as your starting location when following these instructions. If you would like I can update this file with explicit example commands for your operating system.
