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
- **login.spec.cjs**
- **register.spec.cjs**
- **pagenotfound.spec.cjs**
- **header.spec.cjs**

#### Integration testing
- **authRoute.test.js**: Handled login and registration logic.

#### Miscellaneous
- **server.js** + **.env**: Implemented dynamic port usage to prevent clashing ports during integration tests.
- **db.js**: Implemented an in-memory MongoDB database for integration testing.

### Benjy

#### UI Testing
**CreateCategory.js**: User Flow: Login Page (Login with admin account) => CreateCategory.js (where modifications of category is made) => CategoryForm.js (where applicable) => Categories.js (where all the categories are displayed with their links) => CategoryProduct.js (where applicable)

**Modified: createCategory.spec.cjs**
- Create a category
- Update a category
- Delete a category


#### Integration Testing
- **categoryRoutes.js**: Tested how categoryRoutes, categoryControllers, authMiddleware and MongoDB integrates with each other

**Modified: categoryRoutes.test.js**
- /create-category
- /update-category/:id
- /get-category
- /single-category/:slug
- /delete-category/:id

### Samuel

### Eric

### Pei Geng
