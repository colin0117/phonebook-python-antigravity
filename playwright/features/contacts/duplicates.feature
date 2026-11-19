Feature: Duplicate Contacts Detection Driven by Database Settings

  Scenario: Duplicate UI is hidden when duplicate detection is disabled in database settings
    Given the database setting "duplicates_enabled" is "false"
    And the following duplicate test contacts exist:
      | First Name | Last Name      | Phone Number      | Email                   | Date of Birth |
      | Grace      | DupHidden-Test | +1 (555) 909-0001 | grace1@duphidden.test   | 1985-01-10    |
      | Hedy       | DupHidden-Test | +1 (555) 909-0001 | hedy2@duphidden.test    | 1986-02-20    |
    And I navigate to the phone book application
    When I search for "DupHidden-Test" in the search box
    Then the "Duplicates" toolbar button should be hidden
    And the row for "DupHidden-Test" should not display a "Duplicate" warning badge

  Scenario: Duplicate Phone Number is flagged when phone matching is enabled in database settings
    Given the database setting "duplicates_enabled" is "true"
    And the database setting "duplicates_match_phone" is "true"
    And the following duplicate test contacts exist:
      | First Name | Last Name          | Phone Number      | Email                  | Date of Birth |
      | Grace      | DupPhoneFirst-Test | +1 (555) 909-1010 | grace.p1@dupphone.test | 1981-03-11    |
      | Hedy       | DupPhoneSec-Test   | +1 (555) 909-1010 | hedy.p2@dupphone.test  | 1982-04-12    |
    And I navigate to the phone book application
    When I search for "909-1010" in the search box
    And I click the "Duplicates" button
    Then the row for "DupPhoneFirst-Test" should display a "Duplicate" warning badge
    And the row for "DupPhoneSec-Test" should display a "Duplicate" warning badge
    And the "Duplicate Contacts" modal should be visible
    And the Duplicates modal should list a "Duplicate Phone Number" group for "+1 (555) 909-1010" with "DupPhoneFirst-Test" and "DupPhoneSec-Test"

  Scenario: Duplicate Name is flagged when name matching is enabled in database settings
    Given the database setting "duplicates_enabled" is "true"
    And the database setting "duplicates_match_name" is "true"
    And the following duplicate test contacts exist:
      | First Name | Last Name    | Phone Number      | Email                 | Date of Birth |
      | Ada        | DupName-Test | +1 (555) 909-2021 | ada.n1@dupname.test   | 1983-05-13    |
      | Ada        | DupName-Test | +1 (555) 909-2022 | ada.n2@dupname.test   | 1984-06-14    |
    And I navigate to the phone book application
    When I search for "DupName-Test" in the search box
    And I click the "Duplicates" button
    Then the row for "DupName-Test" should display a "Duplicate" warning badge
    And the "Duplicate Contacts" modal should be visible
    And the Duplicates modal should list a "Duplicate Name" group for "DupName-Test, Ada" with "+1 (555) 909-2021" and "+1 (555) 909-2022"

  Scenario: Duplicate Email is flagged when email matching is enabled in database settings
    Given the database setting "duplicates_enabled" is "true"
    And the database setting "duplicates_match_email" is "true"
    And the following duplicate test contacts exist:
      | First Name | Last Name          | Phone Number      | Email                   | Date of Birth |
      | Margaret   | DupEmailFirst-Test | +1 (555) 909-3031 | shared@dupemail.test    | 1985-07-15    |
      | Katherine  | DupEmailSec-Test   | +1 (555) 909-3032 | shared@dupemail.test    | 1986-08-16    |
    And I navigate to the phone book application
    When I search for "shared@dupemail.test" in the search box
    And I click the "Duplicates" button
    Then the row for "DupEmailFirst-Test" should display a "Duplicate" warning badge
    And the row for "DupEmailSec-Test" should display a "Duplicate" warning badge
    And the "Duplicate Contacts" modal should be visible
    And the Duplicates modal should list a "Duplicate Email" group for "shared@dupemail.test" with "DupEmailFirst-Test" and "DupEmailSec-Test"

  Scenario: Duplicate Date of Birth is flagged when DOB matching is enabled in database settings
    Given the database setting "duplicates_enabled" is "true"
    And the database setting "duplicates_match_dob" is "true"
    And the following duplicate test contacts exist:
      | First Name | Last Name        | Phone Number      | Email                | Date of Birth |
      | Radia      | DupDobFirst-Test | +1 (555) 909-4041 | radia@dupdob.test    | 1951-12-18    |
      | Carol      | DupDobSec-Test   | +1 (555) 909-4042 | carol@dupdob.test    | 1951-12-18    |
    And I navigate to the phone book application
    When I search for "1951-12-18" in the search box
    And I click the "Duplicates" button
    Then the row for "DupDobFirst-Test" should display a "Duplicate" warning badge
    And the row for "DupDobSec-Test" should display a "Duplicate" warning badge
    And the "Duplicate Contacts" modal should be visible
    And the Duplicates modal should list a "Duplicate Date of Birth" group for "1951-12-18" with "DupDobFirst-Test" and "DupDobSec-Test"

  Scenario: Duplicate detection dynamically adapts assertions to the active database settings
    Given the following duplicate test contacts exist:
      | First Name | Last Name         | Phone Number      | Email                    | Date of Birth |
      | Alan       |CfgName-Test       | +1 (555) 919-0001 | alan1@cfg.test           | 1971-01-01    |
      | Alan       |CfgName-Test       | +1 (555) 919-0002 | alan2@cfg.test           | 1971-01-02    |
      | Barbara    |CfgPhoneA-Test     | +1 (555) 919-5555 | barbara1@cfg.test        | 1972-02-01    |
      | Claude     |CfgPhoneB-Test     | +1 (555) 919-5555 | claude2@cfg.test         | 1972-02-02    |
      | Donald     |CfgEmailA-Test     | +1 (555) 919-0005 | shared.cfg@cfg.test      | 1973-03-01    |
      | Edsger     |CfgEmailB-Test     | +1 (555) 919-0006 | shared.cfg@cfg.test      | 1973-03-02    |
      | Frances    |CfgDobA-Test       | +1 (555) 919-0007 | frances1@cfg.test        | 1932-08-04    |
      | John       |CfgDobB-Test       | +1 (555) 919-0008 | john2@cfg.test           | 1932-08-04    |
    And I navigate to the phone book application
    Then the duplicate detection UI and modal groups should match the active database settings
