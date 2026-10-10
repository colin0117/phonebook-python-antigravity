Feature: Header Summary Bar Statistics and Category Counts

  Scenario: Summary header bar displays all category cards and matches directory counts
    Given I navigate to the phone book application
    Then I should see the following summary stat cards in the header bar:
      | Card Label       | Selector     |
      | Total Contacts   | #stat-total  |
      | Work             | #stat-work   |
      | Family           | #stat-family |
      | Friends & Others | #stat-other  |
    And the "Total Contacts" summary stat should equal the sum of "Work", "Family", and "Friends & Others"
    And each summary stat card should match the actual number of contacts in that category

  Scenario: Adding a Work contact increments Total Contacts and Work summary stats
    Given I navigate to the phone book application
    And I record the current summary stat counts
    When I click on the "Add Contact" button
    And I fill in the contact form with:
      | Field        | Value             |
      | First Name   | Grace             |
      | Last Name    | Hopper-WorkTest   |
      | Phone Number | +1 (555) 201-0001 |
      | Category     | Work              |
    And I submit the contact form
    Then the summary stat counts should have changed by:
      | Card Label       | Change |
      | Total Contacts   | +1     |
      | Work             | +1     |
      | Family           | 0      |
      | Friends & Others | 0      |

  Scenario: Adding a Friend contact increments Total Contacts and Friends & Others summary stats
    Given I navigate to the phone book application
    And I record the current summary stat counts
    When I click on the "Add Contact" button
    And I fill in the contact form with:
      | Field        | Value               |
      | First Name   | Edsger              |
      | Last Name    | Dijkstra-FriendTest |
      | Phone Number | +1 (555) 201-0002   |
      | Category     | Friend              |
    And I submit the contact form
    Then the summary stat counts should have changed by:
      | Card Label       | Change |
      | Total Contacts   | +1     |
      | Work             | 0      |
      | Family           | 0      |
      | Friends & Others | +1     |

  Scenario: Changing a contact's category updates the respective category summary stats without changing Total Contacts
    Given a contact exists named "Barbara Liskov-CatUpdateTest" with phone "+1 (555) 201-0003"
    And I navigate to the phone book application
    And I record the current summary stat counts
    When I search for "Liskov-CatUpdateTest" in the search box
    And I click the edit button for "Liskov-CatUpdateTest"
    And I update the contact details with:
      | Field    | Value  |
      | Category | Family |
    And I save the changes
    Then the summary stat counts should have changed by:
      | Card Label       | Change |
      | Total Contacts   | 0      |
      | Work             | -1     |
      | Family           | +1     |
      | Friends & Others | 0      |

  Scenario: Deleting a contact decrements Total Contacts and its category summary stat
    Given a contact exists named "Donald Knuth-StatDeleteTest" with phone "+1 (555) 201-0004"
    And I navigate to the phone book application
    And I record the current summary stat counts
    When I search for "Knuth-StatDeleteTest" in the search box
    And I click the delete button for "Knuth-StatDeleteTest" and confirm the prompt
    Then the summary stat counts should have changed by:
      | Card Label       | Change |
      | Total Contacts   | -1     |
      | Work             | -1     |
      | Family           | 0      |
      | Friends & Others | 0      |
