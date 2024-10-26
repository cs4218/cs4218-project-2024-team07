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

# Milestone Submission Instructions
In the repository of your team, tag the submitted commit with a tag name “ms1” (meaning milestone 1). 
1. Create a tag, e.g., git tag -a ms1 -m “Milestone 1”
2. Push the created tag into the repository, e.g., git push origin ms1
3. More details are in: http://git-scm.com/book/en/v2/Git-Basics-Tagging

## Team Member Contributions
Note that the files responsibilities and contributions below are only for MS2.

## Hong Sheng

### Product Management
- Organized and facilitated team meetings.
- Allocated tasks during meetings and ensured the team met important deadlines.
- Detailed the action items after each team meeting and follow up in subsequent meetings.
- Created and allocated product backlogs; managed sprint planning on **Trofos**.
- Tagging and submission of MS deliverables.

### File Responsibilities / Contributions

#### UI testing
- **login.spec.cjs**: [User Flow: Navigate to Login Page => Log in with valid credentials (Verify redirection to Home Page) => Log in with invalid credentials (Check for error message) => Forgot Password Navigation (Verify navigation to Forgot Password page)]
- **register.spec.cjs**: [User Flow: Navigate to Register Page => Register with unique details (Verify redirection to Login Page) => Register with already registered email (Check for error message) => Clean up by deleting test user account after each test].
- **pagenotfound.spec.cjs**: [User Flow: Navigate to Non-Existent Page => Verify 404 error message and "Go Back" button => Click "Go Back" button (Verify redirection to Home Page)].
- **header.spec.cjs**: [User Flow: Start at Home Page => Header (Logo and navigation links verification) => Categories Dropdown (Validate dropdown and links) => Cart Navigation (Check navigation to Cart page) => User Authentication Flow (Verify Login, Register, and User Dropdown based on authentication state) => Logout Flow (Ensure successful logout and redirection to Login page)]

#### Integration testing
- **authRoute.test.js**: Handled login and registration logic, performing integration test between the interaction of the backend with the database itself

#### Miscellaneous
- **server.js** + **.env**: Implemented dynamic port usage to prevent clashing ports during integration tests.
- **db.js**: Implemented an in-memory MongoDB database for integration testing.

### Benjy

### Samuel

### Eric

### Pei Geng
