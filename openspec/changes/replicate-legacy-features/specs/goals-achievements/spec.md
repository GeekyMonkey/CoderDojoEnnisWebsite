## ADDED Requirements

#### Requirement: View Goals

##### Scenario: Member views goals

Given authenticated member

When they navigate to goals page

Then they see short-term goal, long-term goal, next belt info, badge goals by belt

#### Requirement: Edit Goals

##### Scenario: Update goals

Given member on goals page

When they edit short-term, long-term goals and save

Then changes saved, redirected to profile

#### Requirement: Badge Goal Management

##### Scenario: Add badge goal

Given member

When they select a badge to goal for

Then it is added to their goals

##### Scenario: Remove badge goal

Given existing badge goal

When they remove it

Then it is removed from goals

#### Requirement: Apply for Badge

##### Scenario: Badge application

Given member selects available badge

When they enter message (min 5 chars) and apply

Then application submitted, page reloads with pending status

##### Scenario: Validation

Given message <5 chars

When apply

Then label highlighted red, field focused

#### Requirement: Apply for Belt

##### Scenario: Belt application

Given member selects next belt

When they enter message (min 5 chars) and apply

Then application submitted

#### Requirement: View Earned Badges/Belts

##### Scenario: View achievements

Given member

When viewing profile or achievements

Then see list of earned badges/belts with dates and notes

#### Requirement: Mentor Badge Approval

##### Scenario: Approve badge

Given mentor views pending badge applications

When they approve with notes

Then application approved, member notified

##### Scenario: Reject badge

Given pending application

When reject with notes

Then rejected, member can reapply

#### Requirement: Mentor Belt Approval

##### Scenario: Approve belt

Given pending belt application

When approve

Then belt awarded

#### Requirement: Manage Belts/Badges (Admin)

##### Scenario: CRUD belts

Given mentor/admin

When add/edit/delete belts

Then database updated

##### Scenario: CRUD badges

Given mentor/admin

When manage badges and categories

Then updated