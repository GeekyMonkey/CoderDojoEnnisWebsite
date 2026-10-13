## ADDED Requirements
### Requirement: Coder welcome uses shared date and time formatting
The coder home SHALL display a returning coder's previous login date and time using the shared locale-aware date-and-time formatter. When no previous login timestamp exists, the previous-login detail SHALL be omitted.

#### Scenario: Returning coder opens coder home
- **WHEN** a coder opens their home page and has a previous login timestamp
- **THEN** the page displays the timestamp using the shared localized date-and-time formatter

#### Scenario: First-time coder opens coder home
- **WHEN** a coder opens their home page and has no previous login timestamp
- **THEN** the page omits the previous-login detail
