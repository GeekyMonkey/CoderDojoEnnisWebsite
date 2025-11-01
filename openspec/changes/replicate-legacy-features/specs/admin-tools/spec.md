## ADDED Requirements

#### Requirement: Data Maintenance

##### Scenario: Delete old records

Given mentor

When running data cleanup

Then inactive members/parents deleted, registrations purged, results displayed

#### Requirement: Passports

##### Scenario: Print member passport

Given member id

When printing

Then display/print passport with details, badges, belts

##### Scenario: Print mentor passport

Given mentor id

When printing

Then display/print with badge categories

##### Scenario: Print all passports

Given request

When printing all

Then batch print

##### Scenario: Print certificates

Given belt

When printing

Then certificate

##### Scenario: Print team cards

Given team

When printing

Then cards

#### Requirement: Tools Page

##### Scenario: Access tools

Given authenticated user

When navigating to tools

Then display tools page