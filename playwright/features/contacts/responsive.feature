Feature: Responsive Table and Card View
  As a phone book user on various devices and screen sizes
  I want the table to adapt responsively by collapsing non-essential fields into an openable details container
  So that all fields remain fully editable and Card View displays all contact fields cleanly

  Scenario: Non-essential fields are collapsed into an openable container on small viewports
    Given a contact exists named "Grace ResponsiveTest" with phone "+1 (555) 444-1111"
    And I resize the viewport to 500 by 800 pixels
    And I navigate to the phone book application
    When I search for "ResponsiveTest" in the search box
    Then the contact row for "ResponsiveTest" should display essential columns:
      | Cell Class |
      | col-name   |
      | col-phone  |
    And the contact row for "ResponsiveTest" should hide non-essential columns from the main row:
      | Cell Class   |
      | col-email    |
      | col-dob      |
      | col-category |
      | col-notes    |
    When I expand the responsive container for "ResponsiveTest"
    Then the openable container for "ResponsiveTest" should display the fields:
      | Field Name    |
      | Email         |
      | Date of Birth |
      | Category      |
      | Notes         |

  Scenario: Hidden fields remain fully editable and persist when edited from small viewports
    Given a contact exists named "Katherine EditRespTest" with phone "+1 (555) 444-2222"
    And I resize the viewport to 500 by 800 pixels
    And I navigate to the phone book application
    When I search for "EditRespTest" in the search box
    And I click the edit button for "EditRespTest"
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
    When I update the contact details with:
      | Field         | Value                        |
      | Date of Birth | 1975-03-25                   |
      | Notes         | Updated from responsive view |
    And I save the changes
    When I search for "EditRespTest" in the search box
    And I expand the responsive container for "EditRespTest"
    Then the openable container for "EditRespTest" should contain "1975-03-25"
    And the openable container for "EditRespTest" should contain "Updated from responsive view"

  Scenario: Card View displays all contact fields on small viewports
    Given a contact exists named "Barbara SmallCardTest" with phone "+1 (555) 444-3333"
    And I resize the viewport to 500 by 800 pixels
    And I navigate to the phone book application
    When I search for "SmallCardTest" in the search box
    And I switch to Card View
    Then the contact card for "SmallCardTest" should display all fields:
      | Cell Class   |
      | col-id       |
      | col-name     |
      | col-phone    |
      | col-email    |
      | col-dob      |
      | col-category |
      | col-notes    |
      | col-actions  |
    When I click the edit button for "SmallCardTest"
    Then the "Edit Contact" modal should be visible
    When I update the contact details with:
      | Field         | Value                      |
      | Notes         | Edited from card view mode |
    And I save the changes
    When I search for "SmallCardTest" in the search box
    And I switch to Card View
    Then the contact card for "SmallCardTest" should contain "Edited from card view mode"

  Scenario: Card View displays all contact fields on desktop viewports
    Given a contact exists named "Dorothy DeskCardTest" with phone "+1 (555) 444-5555"
    And I navigate to the phone book application
    When I search for "DeskCardTest" in the search box
    And I switch to Card View
    Then the contact card for "DeskCardTest" should display all fields:
      | Cell Class   |
      | col-id       |
      | col-name     |
      | col-phone    |
      | col-email    |
      | col-dob      |
      | col-category |
      | col-notes    |
      | col-actions  |
