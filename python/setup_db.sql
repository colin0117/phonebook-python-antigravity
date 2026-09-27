-- -------------------------------------------------------------
-- SQL Initialization Script for Phone Book Database
-- -------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `phonebook_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `phonebook_db`;

CREATE TABLE IF NOT EXISTS `contacts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(50) NOT NULL,
    `email` VARCHAR(150),
    `date_of_birth` DATE NULL,
    `category` VARCHAR(50) DEFAULT 'General',
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Seed Data
INSERT INTO `contacts` (`first_name`, `last_name`, `phone_number`, `email`, `date_of_birth`, `category`, `notes`) VALUES
('Alice', 'Johnson', '+1 (555) 234-5678', 'alice.johnson@example.com', '1988-03-15', 'Work', 'Engineering team lead at TechCorp. Available 9am-5pm.'),
('Bob', 'Smith', '+1 (555) 345-6789', 'bob.smith@example.org', '1975-08-14', 'Family', 'Uncle Bob. Birthday: August 14th.'),
('Clara', 'Davis', '+1 (555) 456-7890', 'clara.davis@example.com', '1993-11-22', 'Friend', 'Met at college reunion. Coffee lover.'),
('David', 'Miller', '+1 (555) 567-8901', 'david.miller@lawfirm.example', '1981-06-30', 'Services', 'Corporate attorney and legal consultant.'),
('Elena', 'Rostova', '+44 20 7946 0912', 'elena.r@designstudio.uk', '1990-09-05', 'Work', 'Senior UX / UI designer based in London.'),
('Frank', 'Wright', '+1 (555) 678-9012', 'frank.wright@plumbing.local', '1972-01-18', 'Services', 'Reliable 24/7 plumber and contractor.'),
('Grace', 'Hopper', '+1 (555) 789-0123', 'grace.hopper@compiler.org', '1906-12-09', 'Work', 'Systems architecture mentor.'),
('Hannah', 'Abbott', '+1 (555) 890-1234', 'hannah.a@herbology.net', '1996-04-27', 'Friend', 'Weekend hiking club organizer.'),
('Ian', 'Malcolm', '+1 (555) 901-2345', 'ian.malcolm@chaos.edu', '1984-10-12', 'Work', 'Chaos theory consultant and mathematician.'),
('Julia', 'Chen', '+1 (555) 012-3456', 'julia.chen@healthclinic.org', '1987-07-03', 'Services', 'Family physician. Office: Suite 300.'),
('Liam', 'O\'Connor', '+353 1 496 0123', 'liam.oconnor@dublintech.ie', '1991-12-25', 'Family', 'Cousin Liam in Dublin.'),
('Maya', 'Patel', '+1 (555) 123-9876', 'maya.patel@creativelab.io', '1994-05-19', 'Friend', 'Photography partner and book club member.');
