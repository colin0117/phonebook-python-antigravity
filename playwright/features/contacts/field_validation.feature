Feature: Contact Field Display and Validation Verification
  As a phone book user and system administrator
  I want to verify that all contact fields are properly displayed
  And ensure that field validation rules are enforced across UI and API

  Scenario: 1. Verify all fields are displayed in the contacts table
    Given I navigate to the phone book application
    Then I should see the following column headers in the contacts table:
      | Column Header |
      | #             |
      | Name          |
      | Phone Number  |
      | Email         |
      | Date of Birth |
      | Category      |
      | Notes         |
      | Actions       |
    And each contact row in the table should display all field cells:
      | Cell Class   |
      | col-id       |
      | col-name     |
      | col-phone    |
      | col-email    |
      | col-dob      |
      | col-category |
      | col-notes    |
      | col-actions  |

  Scenario: 2. Verify all fields are displayed on the new record form
    Given I navigate to the phone book application
    When I click on the "Add Contact" button
    Then the "Add New Contact" modal should be visible
    And the new contact form should display all input fields:
      | Field Name    | Selector                    | Element  |
      | First Name    | input[name="first_name"]    | input    |
      | Last Name     | input[name="last_name"]     | input    |
      | Phone Number  | input[name="phone_number"]  | input    |
      | Email         | input[name="email"]         | input    |
      | Date of Birth | input[name="date_of_birth"] | input    |
      | Category      | select[name="category"]     | select   |
      | Notes         | textarea[name="notes"]      | textarea |
    And the Category dropdown on the new contact form should contain the options:
      | Option   |
      | Work     |
      | Family   |
      | Friend   |
      | Services |
      | General  |

  Scenario: 3. Verify all fields are displayed and pre-populated on the edit record form
    Given a contact exists named "Ada FieldTest" with phone "+1 (555) 777-6666"
    And I navigate to the phone book application
    When I search for "FieldTest" in the search box
    And I click the edit button for "FieldTest"
    Then the "Edit Contact" modal should be visible
    And the edit contact form should display all input fields:
      | Field Name    | Selector            | Element  |
      | First Name    | #edit_first_name    | input    |
      | Last Name     | #edit_last_name     | input    |
      | Phone Number  | #edit_phone_number  | input    |
      | Email         | #edit_email         | input    |
      | Date of Birth | #edit_date_of_birth | input    |
      | Category      | #edit_category      | select   |
      | Notes         | #edit_notes         | textarea |
    And the edit contact form should be pre-populated with:
      | Field Name    | Expected Value     |
      | First Name    | Ada                |
      | Last Name     | FieldTest          |
      | Phone Number  | +1 (555) 777-6666  |
      | Date of Birth | 1990-05-15         |

  Scenario: 4. Field validation prevents creating a contact without First Name
    Given I navigate to the phone book application
    When I click on the "Add Contact" button
    Then the "Add New Contact" modal should be visible
    When I fill in the contact form with:
      | Field        | Value             |
      | Last Name    | NoFirstTest       |
      | Phone Number | +1 (555) 001-1111 |
    And I attempt to submit the new contact form
    Then the field "First Name" on the new contact form should be invalid
    And the "Add New Contact" modal should remain open

  Scenario: 5. Field validation prevents creating a contact without Last Name
    Given I navigate to the phone book application
    When I click on the "Add Contact" button
    Then the "Add New Contact" modal should be visible
    When I fill in the contact form with:
      | Field        | Value             |
      | First Name   | NoLastTest        |
      | Phone Number | +1 (555) 002-2222 |
    And I attempt to submit the new contact form
    Then the field "Last Name" on the new contact form should be invalid
    And the "Add New Contact" modal should remain open

  Scenario: 6. Field validation prevents creating a contact without Phone Number
    Given I navigate to the phone book application
    When I click on the "Add Contact" button
    Then the "Add New Contact" modal should be visible
    When I fill in the contact form with:
      | Field      | Value             |
      | First Name | NoPhoneTest       |
      | Last Name  | ValidationTest    |
    And I attempt to submit the new contact form
    Then the field "Phone Number" on the new contact form should be invalid
    And the "Add New Contact" modal should remain open

  Scenario: 7. Email field validates proper email format when provided
    Given I navigate to the phone book application
    When I click on the "Add Contact" button
    Then the "Add New Contact" modal should be visible
    When I fill in the contact form with:
      | Field      | Value                |
      | First Name | EmailFormat          |
      | Last Name  | ValidationTest       |
      | Email      | not-a-valid-email    |
    Then the field "Email" on the new contact form should be invalid
    When I fill in the contact form with:
      | Field      | Value                |
      | Email      | valid.email@test.com |
    Then the field "Email" on the new contact form should be valid

  Scenario: 8. Optional fields can be omitted when creating a contact
    Given I navigate to the phone book application
    When I click on the "Add Contact" button
    Then the "Add New Contact" modal should be visible
    When I fill in the contact form with:
      | Field        | Value             |
      | First Name   | Minimal           |
      | Last Name    | ContactTest       |
      | Phone Number | +1 (555) 003-3333 |
    And I submit the contact form
    Then I should see "Minimal" in the directory
    And I should see "ContactTest" in the directory

  Scenario: 9. Field validation prevents updating a contact when a required field is cleared
    Given a contact exists named "ClearField ValTest" with phone "+1 (555) 004-4444"
    And I navigate to the phone book application
    When I search for "ValTest" in the search box
    And I click the edit button for "ValTest"
    Then the "Edit Contact" modal should be visible
    When I clear the field "First Name" on the edit contact form
    And I attempt to submit the edit contact form
    Then the field "First Name" on the edit contact form should be invalid
    And the "Edit Contact" modal should remain open

  Scenario: 10. Backend API rejects contact creation with missing required fields
    When I send an API request to create a contact missing required fields:
      | last_name    | ApiMissingFirstTest |
      | phone_number | +1 (555) 005-5555   |
    Then the API response status should be 400
    And the API error message should contain "required"
    When I send an API request to create a contact missing required fields:
      | first_name   | ApiMissingLastTest |
      | phone_number | +1 (555) 005-5555  |
    Then the API response status should be 400
    And the API error message should contain "required"
    When I send an API request to create a contact missing required fields:
      | first_name | ApiMissingPhoneTest |
      | last_name  | ApiValidationTest   |
    Then the API response status should be 400
    And the API error message should contain "required"

  Scenario: 11. Date of Birth API validates query parameter requirements
    When I request DOB facts without the "dob" parameter
    Then the API response status should be 400
    And the API error message should contain "required"
    When I request DOB facts with an invalid date "invalid-date-string"
    Then the API response status should be 400
    And the API error message should contain "Invalid date"
