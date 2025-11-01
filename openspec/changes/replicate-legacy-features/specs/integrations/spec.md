## ADDED Requirements

#### Requirement: Github Accounts API

##### Scenario: Get member github logins

Given external request

When GET /api/GithubAccounts

Then return JSON list of members and mentors with github logins

#### Requirement: Chatbot API

##### Scenario: Get badges data

Given chatbot request

When GET /api/Chatbot/Badges

Then return JSON list of badges

##### Scenario: Get belts data

Given request

When GET /api/Chatbot/Belts

Then return JSON list of belts

#### Requirement: Real-time Updates

##### Scenario: Attendance changes

Given attendance update

When broadcasted via Supabase realtime

Then clients update in real-time

##### Scenario: Session changes

Given session update

When broadcasted

Then clients notified

#### Requirement: Image Upload

##### Scenario: Upload image

Given file and filename

When POST to upload

Then upload to storage, return success

#### Requirement: Session Pod Login

##### Scenario: Pod attendance

Given member id

When POST to pod login

Then mark attendance, return JSON success