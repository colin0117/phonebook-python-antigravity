Feature: Interesting Date of Birth Facts and Star Sign Pop-up

  Scenario: Pop-up displays web facts, star sign, and allows refreshing facts on new contact
    Given I navigate to the phone book application
    When I click on the "Add Contact" button
    And I fill in the contact form with:
      | Field         | Value                        |
      | First Name    | Alan                         |
      | Last Name     | Turing-FactTest              |
      | Phone Number  | +1 (555) 777-1912            |
      | Email         | alan.turing@fact.test        |
      | Date of Birth | 1912-06-23                   |
      | Category      | Work                         |
      | Notes         | Artificial Intelligence test |
    And I submit the contact form
    And I click the refresh button for the next fun fact in the pop-up
    Then the birthday discovery pop-up should be visible
    And the pop-up should display the star sign "Cancer"
    And the pop-up should display a fun fact pulled from the web
    And the pop-up should display an updated fun fact

  @colin
  Scenario: Pop-up displays web facts, star sign, and allows refreshing facts on updating contact
    Given a contact exists named "Neil Apollo-FactTest" with phone "+1 (555) 888-1969"
    And I navigate to the phone book application
    When I search for "Apollo-FactTest" in the search box
    And I click the edit button for "Apollo-FactTest"
    And I update the contact details with:
      | Field         | Value        |
      | Date of Birth | 1969-07-20   |
    And I save the changes
    And I click the refresh button for the next fun fact in the pop-up
    Then the birthday discovery pop-up should be visible
    And the pop-up should display the star sign "Cancer"
    And the pop-up should display a fun fact pulled from the web
    And the pop-up should display an updated fun fact
