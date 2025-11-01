## ADDED Requirements

#### Requirement: View Upcoming Sessions

##### Scenario: Member views sessions

Given authenticated user

When navigating to sessions

Then see list of non-mentor-only sessions with topic, hosts, join button

Or Google calendar iframe if no sessions

#### Requirement: Join Session

##### Scenario: Join session

Given session with join button

When clicked

Then open new window to session URL, mark attendance via API

#### Requirement: Mentor Session CRUD

##### Scenario: View sessions

Given mentor

When viewing sessions

Then list of sessions with topic, mentors, end date

##### Scenario: Add session

Given mentor

When creating session with adult, topic, url, mentors only flag

Then session saved

##### Scenario: Edit session

Given existing session

When edited

Then updated

##### Scenario: Delete session

Given session

When deleted

Then removed

#### Requirement: Session Pod Login

##### Scenario: Pod login

Given member id

When POST to pod login

Then mark attendance, return success