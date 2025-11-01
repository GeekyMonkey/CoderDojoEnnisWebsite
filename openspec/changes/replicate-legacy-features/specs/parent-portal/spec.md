## ADDED Requirements

#### Requirement: Parent Dashboard

##### Scenario: View dashboard

Given authenticated parent

When navigating to parent index

Then see parent name

#### Requirement: My Kids

##### Scenario: View children

Given parent

When viewing my kids

Then list of linked children with names, images, details

##### Scenario: View child details

Given child

When selected

Then see name, birth year, team, belts, badges, attendance

#### Requirement: My Account

##### Scenario: View account

Given parent

When viewing account

Then see name, email, phone, password change

##### Scenario: Edit account

Given changes to name, email, phone, new password

When saved

Then updated, redirected

#### Requirement: Child Management

##### Scenario: Edit child profile

Given parent-child relationship

When editing child birth year, logins, goals

Then saved (limited editing, no name)

##### Scenario: View child belts/badges/attendance/goals

Given child

When viewing

Then see full details

#### Requirement: Parent Sessions

##### Scenario: View sessions

Given parent

When viewing sessions

Then same as member sessions

#### Requirement: Parent Team Member View

##### Scenario: View other members

Given parent

When viewing team member

Then same as member view