Feature: Interesting Date of Birth Facts and Star Sign Pop-up
  As a phone book user
  When I add or update a contact with a Date of Birth
  I want a pop-up alert displaying:
    1. A fun fact pulled from the web
    2. A refresh button to display the next fun fact
    3. An astrological star sign fact
  And I want the facts to cycle dynamically when clicking the refresh button

  Scenario: Pop-up displays web facts, star sign, and allows refreshing facts on new contact
    Given I navigate to the phone book application
    When I click on the "Add Contact" button
    Then the "Add New Contact" modal should be visible
    When I fill in the contact form with:
      | Field         | Value                        |
      | First Name    | Alan                         |
      | Last Name     | Turing-FactTest              |
      | Phone Number  | +1 (555) 777-1912            |
      | Email         | alan.turing@fact.test        |
      | Date of Birth | 1912-06-23                   |
      | Category      | Work                         |
      | Notes         | Artificial Intelligence test |
    And I submit the contact form
    Then the birthday discovery pop-up should be visible
    And the pop-up should display the star sign "Cancer"
    And the pop-up should display a fun fact pulled from the web
    When I click the refresh button for the next fun fact in the pop-up
    Then the pop-up should display an updated fun fact

  Scenario: Pop-up displays web facts, star sign, and allows refreshing facts on updating contact
    Given a contact exists named "Neil Apollo-FactTest" with phone "+1 (555) 888-1969"
    And I navigate to the phone book application
    When I search for "Apollo-FactTest" in the search box
    And I click the edit button for "Apollo-FactTest"
    Then the "Edit Contact" modal should be visible
    When I update the contact details with:
      | Field         | Value        |
      | Date of Birth | 1969-07-20   |
    And I save the changes
    Then the birthday discovery pop-up should be visible
    And the pop-up should display the star sign "Cancer"
    And the pop-up should display a fun fact pulled from the web
    When I click the refresh button for the next fun fact in the pop-up
    Then the pop-up should display an updated fun fact
