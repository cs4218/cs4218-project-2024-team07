#!/bin/bash

# Directory containing the CSV files
INPUT_DIR="jmeter/outputs"

# Loop through all CSV files in the specified directory
for csv_file in "$INPUT_DIR"/*.csv; do
    # Check if the file exists (in case there are no CSV files)
    if [ -f "$csv_file" ]; then
        echo "Processing file: $csv_file"
        # Run the latency lingo command on the CSV file
        # latency lingo "$csv_file"
        latency-lingo-cli publish --file "$csv_file" \
                --api-key "e13d313f-efb0-41cf-af3a-ae45dce3060f" \
                --label "$csv_file JMeter Test Results" 
    else
        echo "No CSV files found in $INPUT_DIR"
        break
    fi
done