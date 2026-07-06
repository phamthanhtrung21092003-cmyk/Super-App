# User Preferences and Rules

## Communication and Permissions
- Always ask for the user's explicit permission before installing new tools, dependencies, deleting files, or making significant architectural/code changes. State the reasons clearly and propose options before acting.

## Project Execution (Expo)
- The user prefers to test the Expo mobile application directly on their phone's web browser (Chrome) over the local network, rather than using the Expo Go app or tunneling (like ngrok).
- When starting the Expo development server, always use local LAN mode with web support (e.g., `npx expo start --lan --web`).
- Always provide the local IP link in the format `http://<LAN_IP>:8081` when asking the user to test the app on their phone.

## Repository Updates
- If the user asks to "get the project" (lấy dự án về), automatically pull the latest changes from the GitHub repository without asking for clarification.
