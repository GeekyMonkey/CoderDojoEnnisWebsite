## ADDED Requirements

#### Requirement: Mentor Dashboard

##### Scenario: View dashboard

Given mentor

When navigating to mentor index

Then see pending belt/badge applications for current session members

#### Requirement: Member Management

##### Scenario: List members

Given mentor

When viewing members

Then list with names, images, present status

##### Scenario: View/Edit member details

Given member

When viewing

Then see name, birth year, logins, team, badges, belts, attendance, goals, parents

##### Scenario: Signup new member

Given mentor

When creating member

Then saved

##### Scenario: Merge members

Given duplicate members

When merging

Then combined

#### Requirement: Adult Management

##### Scenario: List adults

Given mentor

When viewing adults

Then list with names, images

##### Scenario: View/Edit adult details

Given adult

When viewing

Then see name, email, phone, logins, badge categories

##### Scenario: Signup adult

Given mentor

When creating adult

Then saved

##### Scenario: Merge adults

Given duplicates

When merging

Then combined

#### Requirement: Belt/Badge Approvals

##### Scenario: Approve/Reject applications

Given pending applications

When approve/reject with notes

Then status updated

#### Requirement: Manage Belts/Badges

##### Scenario: CRUD belts

Given mentor

When managing belts

Then add/edit/delete with color, description, etc.

##### Scenario: CRUD badges

Given mentor

When managing badges

Then add/edit/delete with category

##### Scenario: Manage categories

Given mentor

When managing categories

Then CRUD

#### Requirement: Data Maintenance

##### Scenario: Cleanup data

Given mentor

When running cleanup

Then delete old inactive records, show results

#### Requirement: Sign In Mode

##### Scenario: Initiate sign in

Given mentor

When starting sign in mode

Then redirect to sign in page