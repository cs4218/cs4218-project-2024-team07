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

#### For Milestone 2, please also add a section to your repo's README that lists out the contribution made by each member, and the files edited by each member. 
## Team Member Contributions
Note that the files responsibilities and contributions below are only for MS2.

## Hong Sheng

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

#### UI Testing
**Contact.spec.cjs**: Ensure page is displayed correctly with all the relevant information

**Search.spec.cjs**: Ensure search function works and displays corresponding information properly
- Search When No Product Is Found
- Search When Product Is Found
- Click Product Details for Available Product (Expected to Fail)
- Check "Add to Cart" Functionality for Available Product (Expected to Fail)


#### Integration Testing
- **productRoutes.js**: Tested productRoutes, productControllers, mongoDB and authMiddleware and how they integrate with each other.

**Modified: productRoutes.test.js for the following APIs:**
- /create-product
- /get-product
- /get-product/:slug
- /product-category/:slug
- /delete-product/:pid


### Eric

#### UI Testing
**createProduct.js/updateProduct.js**: User Flow: Login Page -> Login to admin account -> Dashboard -> Create Product/Products to update/delete existing products

**Modified: createProduct.spec.cjs**
- Create a product and submit successfully
- Update a product successfully
- Delete a product successfully

#### Integration Testing: 
**productRoutes.js**: Tested productRoutes, productControllers, mongoDB and authMiddleware and how they integrate with each other.

**Modified: productRoutes.test.js for the following APIs**:
- /update-product/:pid
- /product-count
- /product-list/:page
- /product-filters
- /search/:keyword

### Pei Geng

#### UI Testing
**Profile.js**: User Flow: Login Page -> Login to user account -> Dashboard -> Profile Page -> Edit Profile details

**Modified: Profile.spec.cjs**
- Update profile details successfully and get a confirmation toast
- Update profile details successfully and see the changed details on dashboard
- Update password successfully and now use a new password to login
- Update profile details unsuccessfully and get a failure toast

#### Integration Testing
**authRoute.js**: Handled forgot password logic, performing integration test between the interaction of the backend with the database itself, and that consistent behavior is observed from the login controller logic

**Modified: authRoute.test.js**:
