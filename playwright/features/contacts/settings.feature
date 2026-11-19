Feature: Application Settings Panel Read/Write Lifecycle and UI Visibility

  Scenario: Header Settings button is hidden when settings display is disabled in database settings
    Given the database setting "settings_display_enabled" is "false"
    When I navigate to the phone book application
    Then the "Settings" header button should be hidden

  Scenario: Header Settings button opens the Application Settings panel in read-only mode matching the database
    Given the database setting "settings_display_enabled" is "true"
    And I navigate to the phone book application
    When I click the "Settings" button in the header
    Then the "Application Settings" modal should be visible
    And the Application Settings modal should be in "Read-Only" mode
    And the Application Settings modal should display all database settings keys, descriptions, and values
    And the UI elements on the page should match the values displayed in the Application Settings panel

  Scenario: Clicking Edit Settings switches the Application Settings panel to editing mode
    Given I have opened the Application Settings modal in read-only mode
    When I click the "Edit Settings" button in the Application Settings modal
    Then the Application Settings modal should be in "Editing" mode

  Scenario: Cancelling the save confirmation prompt does not persist changes
    Given I have opened the Application Settings modal in editing mode
    When I toggle the "duplicates_match_dob" setting in the Application Settings modal
    And I click "Save Settings" and cancel the confirmation prompt
    Then the settings confirmation dialog should ask "Are you sure you want to save these application settings changes?"
    And the Application Settings modal should remain in "Editing" mode
    And the database value for setting "duplicates_match_dob" should remain unchanged

  Scenario: Confirming the save prompt persists toggled settings, returns to read-only mode, and updates the UI
    Given I have opened the Application Settings modal in editing mode
    When I toggle the "duplicates_enabled" setting in the Application Settings modal
    And I click "Save Settings" and confirm the prompt
    Then the settings confirmation dialog should ask "Are you sure you want to save these application settings changes?"
    And the Application Settings modal should be in "Read-Only" mode
    And the database value for setting "duplicates_enabled" should reflect the toggled value
    And the UI elements on the page should match the values displayed in the Application Settings panel

  Scenario: Settings button visibility and panel contents dynamically adapt to the active database configuration
    Given I navigate to the phone book application
    Then the Settings button and Application Settings panel should dynamically match the active database settings
