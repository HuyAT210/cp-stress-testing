# server_fastapi.py
import os
import subprocess
import tempfile
from typing import Optional

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# ---------- FastAPI setup ----------
app = FastAPI(title="Local Stress Tester")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000"], 
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
    session_dir = os.path.join("sessions", folder)
    os.makedirs(session_dir, exist_ok=True)

    # Save code files
    gen_file = os.path.join(session_dir, "gen.cpp")
    slow_file = os.path.join(session_dir, "slow.cpp")
    fast_file = os.path.join(session_dir, "fast.cpp")

    with open(gen_file, "w") as f: f.write(input.genCode)
    with open(slow_file, "w") as f: f.write(input.slowCode)
    with open(fast_file, "w") as f: f.write(input.fastCode)

    output_log = []

    # Compile programs
    ok1, msg1 = compile_cpp(gen_file, os.path.join(session_dir, "gen"))
    ok2, msg2 = compile_cpp(slow_file, os.path.join(session_dir, "slow"))
    ok3, msg3 = compile_cpp(fast_file, os.path.join(session_dir, "fast"))
    output_log.extend([msg1, msg2, msg3])

    if not (ok1 and ok2 and ok3):
        return {"output": "\n".join(output_log)}

    # Run stress testing loop
    try:
        for i in range(1, 11):  # 10 test cases
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

    return {"output": "\n".join(output_log)}

# ---------- Run ----------
if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
