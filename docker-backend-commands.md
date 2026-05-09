Now that your backend is running inside Docker, you don't use `npm start` in the backend folder anymore. Instead, you manage it entirely using **Docker Compose**.

Here are the essential commands you need to know. Run these directly in your VS Code terminal at the root of your project (labourapp):

### 1. How to View Backend Logs (and Errors)
To see what's happening in your backend, including `console.log` output and error messages, use:
```bash
docker compose logs -f backend
```
*Tip: The `-f` flag stands for "follow". It keeps the log stream open in your terminal in real-time, just like `npm start` used to do. Press `Ctrl+C` to exit the log view.*

### 2. How to Start the Backend
If you restart your computer or stop the containers, start them up again with:
```bash
docker compose up -d
```
*Tip: The `-d` flag runs it in "detached" mode (in the background) so you can keep using your terminal.*

### 3. How to Apply New Code Changes
If you edit your backend code (like modifying a controller or route), you need to rebuild the Docker image to apply the changes:
```bash
docker compose up --build -d
```

### 4. How to Stop Everything
To cleanly shut down the backend and Redis:
```bash
docker compose down
```

**Workflow Recommendation:**
Most of the time, you will just run `docker compose up -d` once when you start working, and then open a second terminal tab to run `docker compose logs -f backend` so you can watch for errors while you test your frontend app.