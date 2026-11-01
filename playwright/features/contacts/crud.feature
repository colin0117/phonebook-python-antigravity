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

  Scenario: Quick inline edit across all fields using Enter to save
    Given a contact exists named "Edsger Dijkstra-InlineUpdate" with phone "+1 (555) 222-3333"
    And I navigate to the phone book application
    When I search for "Dijkstra-InlineUpdate" in the search box
    And I inline edit the "Phone Number" cell for "Dijkstra-InlineUpdate" to "+1 (555) 888-0000" using "Enter"
    And I inline edit the "Email" cell for "Dijkstra-InlineUpdate" to "edsger.enter@inline.test" using "Enter"
    And I inline edit the "Date of Birth" cell for "Dijkstra-InlineUpdate" to "1930-05-11" using "Enter"
    And I inline edit the "Category" cell for "Dijkstra-InlineUpdate" to "Family" using "Enter"
    And I inline edit the "Notes" cell for "Dijkstra-InlineUpdate" to "Shortest path Enter edit" using "Enter"
    Then I should see "+1 (555) 888-0000" for "Dijkstra-InlineUpdate"
    And I should see "edsger.enter@inline.test" for "Dijkstra-InlineUpdate"
    And I should see "1930-05-11" for "Dijkstra-InlineUpdate"
    And I should see "Family" for "Dijkstra-InlineUpdate"
    And I should see "Shortest path Enter edit" for "Dijkstra-InlineUpdate"
    When I click the edit button for "Dijkstra-InlineUpdate"
    Then the "Edit Contact" modal should be visible
    And the edit contact form should be pre-populated with:
      | Field Name    | Expected Value           |
      | Phone Number  | +1 (555) 888-0000        |
      | Date of Birth | 1930-05-11               |

  Scenario: Quick inline edit across all fields using blur to save while keeping icon links for tel and mailto
    Given a contact exists named "Barbara Liskov-BlurUpdate" with phone "+1 (555) 222-4444"
    And I navigate to the phone book application
    When I search for "Liskov-BlurUpdate" in the search box
    Then the "Phone Number" cell for "Liskov-BlurUpdate" should have a separate icon link for "tel:" and editable text
    And the "Email" cell for "Liskov-BlurUpdate" should have a separate icon link for "mailto:" and editable text
    When I inline edit the "Phone Number" cell for "Liskov-BlurUpdate" to "+1 (555) 777-9999" using "blur"
    And I inline edit the "Email" cell for "Liskov-BlurUpdate" to "barbara.blur@inline.test" using "blur"
    And I inline edit the "Date of Birth" cell for "Liskov-BlurUpdate" to "1939-11-07" using "blur"
    And I inline edit the "Category" cell for "Liskov-BlurUpdate" to "Friend" using "blur"
    And I inline edit the "Notes" cell for "Liskov-BlurUpdate" to "Saved on blur across fields" using "blur"
    Then I should see "+1 (555) 777-9999" for "Liskov-BlurUpdate"
    And I should see "barbara.blur@inline.test" for "Liskov-BlurUpdate"
    And I should see "1939-11-07" for "Liskov-BlurUpdate"
    And I should see "Friend" for "Liskov-BlurUpdate"
    And I should see "Saved on blur across fields" for "Liskov-BlurUpdate"

  Scenario: Cancel inline edit using Escape retains the original cell value
    Given a contact exists named "Donald Knuth-EscTest" with phone "+1 (555) 222-5555"
    And I navigate to the phone book application
    When I search for "Knuth-EscTest" in the search box
    And I start inline editing the "Phone Number" cell for "Knuth-EscTest" to "+1 (555) 000-0000" and press Escape
    And I start inline editing the "Date of Birth" cell for "Knuth-EscTest" to "2000-01-01" and press Escape
    And I start inline editing the "Category" cell for "Knuth-EscTest" to "Services" and press Escape
    Then I should see "+1 (555) 222-5555" for "Knuth-EscTest"
    And I should see "1990-05-15" for "Knuth-EscTest"
    And I should see "Work" for "Knuth-EscTest"

  Scenario: Inline editing the Name cell parses both "Last, First" and "First Last" formats into first and last names
    Given a contact exists named "Initial Person-NameTest" with phone "+1 (555) 222-6666"
    And I navigate to the phone book application
    When I search for "Person-NameTest" in the search box
    And I inline edit the "Name" cell for "Person-NameTest" to "Hopper-NameTest, Grace" using "Enter"
    Then I should see "Hopper-NameTest, Grace" in the directory
    When I click the edit button for "Hopper-NameTest"
    Then the "Edit Contact" modal should be visible
    And the edit contact form should be pre-populated with:
      | Field Name | Expected Value  |
      | First Name | Grace           |
      | Last Name  | Hopper-NameTest |
    When I close the "Edit Contact" modal
    And I inline edit the "Name" cell for "Hopper-NameTest" to "Adele Goldberg-NameTest" using "blur"
    Then I should see "Goldberg-NameTest, Adele" in the directory
    When I click the edit button for "Goldberg-NameTest"
    Then the "Edit Contact" modal should be visible
    And the edit contact form should be pre-populated with:
      | Field Name | Expected Value    |
      | First Name | Adele             |
      | Last Name  | Goldberg-NameTest |

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
