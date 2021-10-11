# BITAngularExamBe

SQL script to boot the DB: 
```
CREATE DATABASE Cow_Farm;
USE Cow_Farm;
CREATE TABLE Cows(
	id INT  AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(64) NOT NULL,
	weight DECIMAL(6, 2)  NOT NULL,
	total_milk DECIMAL(7, 1)  NOT NULL,
	last_milking_time DATETIME NOT NULL
);

SELECT * FROM Cows;
```
