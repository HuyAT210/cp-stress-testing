import subprocess

# Start frontend
subprocess.Popen(["python", "-m", "http.server", "3000"])

# Start backend
subprocess.run(["python", "app.py"])
