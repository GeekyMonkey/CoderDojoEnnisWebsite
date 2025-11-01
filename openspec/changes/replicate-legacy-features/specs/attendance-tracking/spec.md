## ADDED Requirements

#### Requirement: View Personal Attendance

##### Scenario: Member attendance history

Given authenticated member

When they view attendance

Then see total sessions, list of attendance dates

#### Requirement: Mentor Attendance Management

##### Scenario: View session attendance

Given mentor selects date

When viewing attendance page

Then see list of members/adults with present checkboxes, images, belt stripes, search filter

##### Scenario: Mark attendance

Given member list

When checkbox changed

Then attendance updated in database, count refreshed

##### Scenario: Random member selection

Given attendance page

When random button clicked

Then a random member highlighted

#### Requirement: Sign In for Sessions

##### Scenario: Manual sign in

Given user at sign in page

When enter username/password

Then signed in, attendance marked

##### Scenario: QR code sign in

Given QR code scanned

When id submitted

Then member signed in

##### Scenario: View signed in members

Given sign in mode active

When viewing

Then list of signed in members/adults for session