# server_fastapi.py
import os
import subprocess
import tempfile
from typing import Optional

from fastapi import FastAPI,Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# ---------- FastAPI setup ----------
app = FastAPI(title="Local Stress Tester")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000","http://localhost:3000"], 
    allow_credentials=True,                 
    allow_methods=["*"],                      
    allow_headers=["*"],                     
)

# ---------- Data Model ----------
class CodeInput(BaseModel):
    folderName: Optional[str] = "session"
    genCode: str
    slowCode: str
    fastCode: str

# ---------- Helper Functions ----------
def compile_cpp(src: str, out: str):
    try:
        subprocess.check_output(
            ["g++", "-std=c++17", src, "-o", out],
            stderr=subprocess.STDOUT
        )
        return True, f"Compiled {os.path.basename(src)} successfully."
    except subprocess.CalledProcessError as e:
        return False, e.output.decode()

# ---------- Routes ----------
@app.post("/run")
def run_stress_test(input: CodeInput):
    folder = input.folderName

    session_dir = os.path.join("storage", folder)
    os.makedirs(session_dir, exist_ok=True)

    # Save code files
    gen_file = os.path.join(session_dir, "gen.cpp")
    slow_file = os.path.join(session_dir, "slow.cpp")
    fast_file = os.path.join(session_dir, "fast.cpp")
    print(input.genCode)
    with open(gen_file, "w") as f: f.write(input.genCode.replace("\r\n", "\n"))
    with open(slow_file, "w") as f: f.write(input.slowCode.replace("\r\n", "\n"))
    with open(fast_file, "w") as f: f.write(input.fastCode.replace("\r\n", "\n"))

    output_log = []

    # Compile programs
    ok1, msg1 = compile_cpp(gen_file, os.path.join(session_dir, "gen"))
    ok2, msg2 = compile_cpp(slow_file, os.path.join(session_dir, "slow"))
    ok3, msg3 = compile_cpp(fast_file, os.path.join(session_dir, "fast"))
    output_log.extend([msg1, msg2, msg3])
    print(f"Compiled")

    if not (ok1 and ok2 and ok3):
        print("Failed")
        return {"output": "\n".join(output_log)}

    # Run stress testing loop
    try:
        for i in range(1, 101):  # 100 test cases
            print(f"Testing test {i}")
            # generate input
            gen_out = subprocess.check_output([os.path.join(session_dir, "gen")])

            slow_out = subprocess.check_output([os.path.join(session_dir, "slow")], input=gen_out)
            fast_out = subprocess.check_output([os.path.join(session_dir, "fast")], input=gen_out)

            if slow_out != fast_out:
                output_log.append(f"Test {i} failed ❌")
                output_log.append("Input:\n" + gen_out.decode())
                output_log.append("Slow Output:\n" + slow_out.decode())
                output_log.append("Fast Output:\n" + fast_out.decode())
                break
            else:
                output_log.append(f"Test {i} passed ✅")

    except Exception as e:
        output_log.append(f"Error during testing: {str(e)}")
    print("Reached the end")
    return {"output": "\n".join(output_log)}

class FileData(BaseModel):
    name: str
    content: str

class ProjectData(BaseModel):
    projectName: str
    files: list[FileData]

@app.post("/create-project")
async def create_project(data: ProjectData):
    project_name = data.projectName
    files = data.files

    project_dir = os.path.join("storage", project_name)

    # Create folder if not exists
    os.makedirs(project_dir, exist_ok=True)

    # Write default files
    for f in files:
        file_path = os.path.join(project_dir, f.name)
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(f.content)

    return {"success": True, "project": project_name}
# --- Read project endpoint ---
@app.get("/read-project")
async def read_project(name: str = Query(...)):
    project_dir = os.path.join("storage", name)

    if not os.path.exists(project_dir):
        return {"error": "Project does not exist"}

    files_data = []
    for file_name in os.listdir(project_dir):
        if not file_name.endswith(".cpp"):
            continue  # skip binaries or other files

        file_path = os.path.join(project_dir, file_name)
        with open(file_path, "r", encoding="utf-8") as f:
            files_data.append({"name": file_name, "content": f.read()})


    return {"project": name, "files": files_data}

# ---------- Run ----------
if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
