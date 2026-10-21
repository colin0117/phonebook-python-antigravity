Feature: DataTables SearchBuilder and SearchPanes Advanced Filtering

  Scenario: SearchBuilder and SearchPanes are both displayed alongside the directory table
    Given I navigate to the phone book application
    Then the SearchPanes filter container should be visible
    And the SearchBuilder query container should be visible
    And SearchPanes and SearchBuilder should be aligned side by side in the same layout row
    And the SearchBuilder "Add Condition" button should be visible

  Scenario: Hide and restore SearchPanes using the Filter Panes toggle button
    Given I navigate to the phone book application
    Then the SearchPanes filter container should be visible
    When I click the "Filter Panes" toggle button
    Then the SearchPanes filter container should be hidden
    And the SearchBuilder query container should be visible
    When I click the "Filter Panes" toggle button
    Then the SearchPanes filter container should be visible

  Scenario: Hide and restore SearchBuilder using the Search Builder toggle button
    Given I navigate to the phone book application
    Then the SearchBuilder query container should be visible
    When I click the "Search Builder" toggle button
    Then the SearchBuilder query container should be hidden
    And the SearchPanes filter container should be visible
    When I click the "Search Builder" toggle button
    Then the SearchBuilder query container should be visible

  Scenario: Hide both SearchPanes and SearchBuilder search controls simultaneously
    Given I navigate to the phone book application
    When I click the "Filter Panes" toggle button
    And I click the "Search Builder" toggle button
    Then the SearchPanes filter container should be hidden
    And the SearchBuilder query container should be hidden

  Scenario: Filter contacts using a SearchBuilder condition and clear the filter
    Given a contact exists named "Claude Shannon-SBTest" with phone "+1 (555) 301-1916"
    And a contact exists named "John McCarthy-SBTest" with phone "+1 (555) 302-1927"
    And I navigate to the phone book application
    When I add a SearchBuilder condition where "Name" "Contains" "Shannon-SBTest"
    Then the directory table should display "Shannon-SBTest"
    And the directory table should not display "McCarthy-SBTest"
    When I clear all SearchBuilder conditions
    Then the directory table should display "McCarthy-SBTest"

  Scenario: Combine SearchPanes category filter with SearchBuilder condition
    Given a contact exists named "Niklaus Wirth-ComboTest" with phone "+1 (555) 303-1934"
    And I navigate to the phone book application
    When I select the "Work" category in SearchPanes
    And I add a SearchBuilder condition where "Name" "Contains" "Wirth-ComboTest"
    Then the directory table should display "Wirth-ComboTest"
