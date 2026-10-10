Feature: Phone Book CRUD Operations

  Scenario: Read contacts in the directory
    Given I navigate to the phone book application
    Then I should see the contacts table
    And I should see existing contact entries in the directory
    And the contacts count in the summary card should match the table

  Scenario: Create a new contact
    Given I navigate to the phone book application
    When I click on the "Add Contact" button
    Then the "Add New Contact" modal should be visible
    When I fill in the contact form with:
      | Field         | Value                 |
      | First Name    | Ada                   |
      | Last Name     | Lovelace-Create       |
      | Phone Number  | +1 (555) 111-2222     |
      | Email         | ada@create-test.org   |
      | Date of Birth | 1995-12-10            |
      | Category      | Work                  |
      | Notes         | Create test isolation |
    And I submit the contact form
    Then I should see "Lovelace-Create, Ada" in the directory
    And I should see "+1 (555) 111-2222" in the directory
    And I should see "1995-12-10" in the directory

  Scenario: Update an existing contact
    Given a contact exists named "Margaret Hamilton-Update" with phone "+1 (555) 333-4444"
    And I navigate to the phone book application
    When I search for "Hamilton-Update" in the search box
    Then I should see "Hamilton-Update" in the directory
    When I click the edit button for "Hamilton-Update"
    Then the "Edit Contact" modal should be visible
    When I update the contact details with:
      | Field         | Value                   |
      | Phone Number  | +1 (555) 999-8888       |
      | Date of Birth | 1980-08-17              |
      | Notes         | Apollo guidance updated |
    And I save the changes
    Then I should see "+1 (555) 999-8888" for "Hamilton-Update"
    And I should see "1980-08-17" for "Hamilton-Update"

  Scenario: Cancel delete confirmation prompt retains contact in directory
    Given a contact exists named "Katherine Johnson-CancelDelete" with phone "+1 (555) 555-6666"
    And I navigate to the phone book application
    When I search for "Johnson-CancelDelete" in the search box
    Then I should see "Johnson-CancelDelete" in the directory
    When I click the delete button for "Johnson-CancelDelete" and cancel the confirmation prompt
    Then the confirmation dialog should ask 'Are you sure you want to delete contact "Katherine Johnson-CancelDelete"?'
    And I should still see "Johnson-CancelDelete" in the directory

  Scenario: Confirm delete prompt removes contact from directory
    Given a contact exists named "Katherine Johnson-ConfirmDelete" with phone "+1 (555) 555-7777"
    And I navigate to the phone book application
    When I search for "Johnson-ConfirmDelete" in the search box
    Then I should see "Johnson-ConfirmDelete" in the directory
    When I click the delete button for "Johnson-ConfirmDelete" and confirm the prompt
    Then the confirmation dialog should ask 'Are you sure you want to delete contact "Katherine Johnson-ConfirmDelete"?'
    And I should not see "Johnson-ConfirmDelete" in the directory
