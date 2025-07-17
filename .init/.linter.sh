#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-calculator-web-app-15e9b7c7/calculator_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

