## ADDED Requirements

#### Requirement: View Personal Profile

##### Scenario: Member views profile

Given authenticated member

When they navigate to /Member/Profile

Then they see their name, birth year, team info, login (disabled), Github, Scratch, Xbox links, and print ID button

#### Requirement: Edit Personal Profile

##### Scenario: Update profile fields

Given member on profile page

When they edit GithubLogin, ScratchName, XboxGamertag and save

Then changes are saved to database

And redirected to Profile page

##### Scenario: Validation on save

Given invalid inputs

When save attempted

Then errors displayed, page not redirected

#### Requirement: View Other Member Details

##### Scenario: View team member

Given authenticated user

When they navigate to /Member/TeamMember/{id}

Then they see the member's name, birth year, team, external links, earned belts, badges

#### Requirement: Print ID

##### Scenario: Print member ID

Given member on profile

When they click Print ID button

Then a printable ID page is opened