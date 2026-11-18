Feature: Duplicate Contacts Detection and Review

  Scenario: Duplicate contacts are flagged in the table and listed in the Duplicates modal
    Given a contact exists named "Grace DupFirst-Test" with phone "+1 (555) 909-1010"
    And a contact exists named "Hedy DupSecond-Test" with phone "+1 (555) 909-1010"
    And I navigate to the phone book application
    When I search for "909-1010" in the search box
    Then the row for "DupFirst-Test" should display a "Duplicate" warning badge
    And the row for "DupSecond-Test" should display a "Duplicate" warning badge
    When I click the "Duplicates" button
    Then the "Duplicate Contacts" modal should be visible
    And the Duplicates modal should list a "Duplicate Phone Number" group for "+1 (555) 909-1010" with "DupFirst-Test" and "DupSecond-Test"
