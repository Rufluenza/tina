#!/bin/bash

# 1. Check if rpi_venv exists
if [ ! -d "rpi_venv" ]; then
  echo "Creating Python virtual environment 'rpi_venv'..."
  python3 -m venv rpi_venv
  source rpi_venv/bin/activate
  echo "Installing dependencies: fastapi, uvicorn, pyserial..."
  pip install --upgrade pip
  pip install fastapi uvicorn pyserial
else
  echo "Virtual environment 'rpi_venv' already exists."
fi

# 2. Activate the virtual environment
echo "Activating virtual environment..."
source rpi_venv/bin/activate

# 3. Run the FastAPI server
echo "Starting FastAPI server on 0.0.0.0:8000..."
uvicorn main:app --host 0.0.0.0 --port 8000
