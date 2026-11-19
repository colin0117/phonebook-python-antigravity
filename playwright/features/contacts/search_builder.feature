Feature: DataTables SearchBuilder and SearchPanes Advanced Filtering

  Scenario: SearchBuilder and SearchPanes are both displayed alongside the directory table
    Given I navigate to the phone book application
    Then the SearchPanes filter container should be visible
    And the SearchBuilder query container should be visible
    And SearchPanes and SearchBuilder should be aligned side by side in the same layout row
    And the SearchBuilder "Add Condition" button should be visible

  Scenario: Hide SearchPanes using the Filter Panes toggle button
    Given I navigate to the phone book application
    When I click the "Filter Panes" toggle button
    Then the SearchPanes filter container should be hidden
    And the SearchBuilder query container should be visible

  Scenario: Restore hidden SearchPanes using the Filter Panes toggle button
    Given I navigate to the phone book application
    And I click the "Filter Panes" toggle button
    When I click the "Filter Panes" toggle button
    Then the SearchPanes filter container should be visible

  Scenario: Hide SearchBuilder using the Search Builder toggle button
    Given I navigate to the phone book application
    When I click the "Search Builder" toggle button
    Then the SearchBuilder query container should be hidden
    And the SearchPanes filter container should be visible

  Scenario: Restore hidden SearchBuilder using the Search Builder toggle button
    Given I navigate to the phone book application
    And I click the "Search Builder" toggle button
    When I click the "Search Builder" toggle button
    Then the SearchBuilder query container should be visible

  Scenario: Hide both SearchPanes and SearchBuilder search controls simultaneously
    Given I navigate to the phone book application
    When I click the "Filter Panes" toggle button
    And I click the "Search Builder" toggle button
    Then the SearchPanes filter container should be hidden
    And the SearchBuilder query container should be hidden

  Scenario: Filter contacts using a SearchBuilder condition
    Given a contact exists named "Claude Shannon-SBTest" with phone "+1 (555) 301-1916"
    And a contact exists named "John McCarthy-SBTest" with phone "+1 (555) 302-1927"
    And I navigate to the phone book application
    When I add a SearchBuilder condition where "Name" "Contains" "Shannon-SBTest"
    Then the directory table should display "Shannon-SBTest"
    And the directory table should not display "McCarthy-SBTest"

  Scenario: Clear all SearchBuilder conditions to restore filtered contacts
    Given a contact exists named "Claude Shannon-SBClearTest" with phone "+1 (555) 301-1917"
    And a contact exists named "John McCarthy-SBClearTest" with phone "+1 (555) 302-1928"
    And I navigate to the phone book application
    And I add a SearchBuilder condition where "Name" "Contains" "Shannon-SBClearTest"
    When I clear all SearchBuilder conditions
    Then the directory table should display "McCarthy-SBClearTest"

  Scenario: Combine SearchPanes category filter with SearchBuilder condition
    Given a contact exists named "Niklaus Wirth-ComboTest" with phone "+1 (555) 303-1934"
    And I navigate to the phone book application
    When I select the "Work" category in SearchPanes
    And I add a SearchBuilder condition where "Name" "Contains" "Wirth-ComboTest"
    Then the directory table should display "Wirth-ComboTest"
