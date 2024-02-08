#!/bin/bash

# Define the virtual environment directory name
VENV_DIR="venv"

# Define the requirements file
REQUIREMENTS_FILE="requirements.txt"

# Define your Python application entry point
APP_PY="tayble/app.py"

# Check if the virtual environment directory exists
if [ ! -d "$VENV_DIR" ]; then
    echo "Virtual environment not found, creating one..."

    # Create the virtual environment
    python3 -m venv $VENV_DIR

    # Activate the virtual environment
    source $VENV_DIR/bin/activate

    # Check if requirements.txt exists
    if [ -f "$REQUIREMENTS_FILE" ]; then
        # Install requirements
        pip install -r $REQUIREMENTS_FILE
    else
        echo "Requirements file not found. Skipping dependencies installation."
    fi
else
    echo "Virtual environment found, activating it..."
    # Activate the virtual environment
    echo "source .$VENV_DIR/bin/activate"

    source $VENV_DIR/bin/activate
fi

# Run your Python application
echo "Running app.py..."
python3 $APP_PY
