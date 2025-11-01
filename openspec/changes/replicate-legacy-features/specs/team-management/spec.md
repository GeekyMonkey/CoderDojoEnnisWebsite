## ADDED Requirements

#### Requirement: View Teams

##### Scenario: Mentor views teams

Given mentor

When navigating to teams

Then list of teams with name, goal, hex code

#### Requirement: CRUD Teams

##### Scenario: Add team

Given mentor

When creating team with name, goal, notes, hex code

Then team saved

##### Scenario: Edit team

Given team

When edited

Then updated

##### Scenario: Delete team

Given team

When deleted

Then removed

#### Requirement: Member Team Info

##### Scenario: View team details

Given member

When viewing profile

Then see team name, goal, members list