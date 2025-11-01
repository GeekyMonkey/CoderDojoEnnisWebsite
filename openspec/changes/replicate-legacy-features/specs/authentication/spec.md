## ADDED Requirements

#### Requirement: User Authentication

##### Scenario: Successful Login

Given a user with valid credentials

When they submit the login form with username and password

Then they are authenticated via Supabase Auth

And redirected to their role-specific dashboard (mentor, parent, member)

##### Scenario: Failed Login

Given a user with invalid credentials

When they submit the login form

Then an error message "Username or password is not correct" is displayed

And they remain on the login page

##### Scenario: Logout

Given an authenticated user

When they click logout

Then they are logged out

And redirected to the home page

##### Scenario: Remember Me

Given a user checks "Remember" on login

When they login

Then their session persists across browser sessions

##### Scenario: Role-based Access

Given different user roles (mentor, parent, member)

When they login

Then they are redirected to appropriate pages (Mentor/Index, Parent/Index, Member/Index)