[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Lq2be5ao)
# Instructions on creating team repository using GitHub Classroom
## Step 1. Ensure that your team formation through Canvas has been confirmed.
Do not proceed to step 2 otherwise!

## Step 2. Visit the assignment link at https://classroom.github.com/a/Lq2be5ao
The first member of the team to access this link will be prompted to accept the assignment that gives your team access to the new repository.
Create a new team by typing 2024-TeamXX , where XX is the Team number as noted in Step 1 above. 
(Note that the naming convention must be followed strictly, e.g. capitalisation, dash, and spacing. 
If your group number is a single digit, i.e 2024-Team1 is fine as well.)

The other members in the team will be able to see an existing team with your team number in the “Join an existing team” section. Click Join.

## Step 3. All of you should be able to see the acceptance page. Click on the assignment link to see the project on GitHub.


# Quick Guide on jmeter
1. Download jmeter from the website. Follow instructions there to save file into desired location
2. Create a test plan. If you don't want to create, a test plan has been created and saved into the jmeter folder
3. Run the initial_load_test.sh file. It includes the shell command needed to run the initial_load_test.JMX test-plan under the test plan folder. Note you need jmeter and access to mongo db to run this. 
4. What is initial_load_test.JMX? It is a test configuration file which uses HTTP Get Requests to access the frontend sites and the backend apis. If initial_load_test.sh doesn't work try initial_load_test_debug.sh
5. After running the test results should appear in the outputs folder.