#!/bin/bash

# Loop through all .jmx files in the test-plans directory
for jmx_file in ./jmeter/test-plans/*.jmx; do
    # Extract the base name of the jmx file without the path and extension
    base_name=$(basename "$jmx_file" .jmx)
    
    # Define the output paths using the base name
    log_file="./jmeter/outputs/${base_name}.log"
    result_file="./jmeter/outputs/${base_name}.csv"
    
    # Run the JMeter test for the current jmx file
    jmeter -n \
        -t "$jmx_file" \
        -j "$log_file" \
        -f -l "$result_file"
        
    # Check if the JMeter command was successful
    if [ $? -eq 0 ]; then
        echo "Completed: $jmx_file"
        echo "Log saved to: $log_file"
        echo "Results saved to: $result_file"
    else
        echo "Error running JMeter test: $jmx_file"
        exit 1
    fi
done