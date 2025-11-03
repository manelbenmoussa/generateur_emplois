-- Complete SQL seed data for real university timetable
-- Generated to match Prisma schema exactly

-- Clear existing data
TRUNCATE TABLE teacher_subject, subject_specializations, 
               sessions, "Subject", "Teacher", groups, rooms, "Specialization", "Department", "School" CASCADE;

-- Insert School (id, name, address)
INSERT INTO "School" (id, name, address) VALUES 
(1, 'ISET Rades', '1 Rue des Entrepreneurs, Rades, Tunisia');

-- Insert Departments (id, name, school_id)
INSERT INTO "Department" (id, name, school_id) VALUES 
(1, 'Electrical Engineering', 1),
(2, 'Computer Science', 1),
(3, 'Mechanical Engineering', 1),
(4, 'Business Administration', 1);

-- Insert Specializations (id, name, department_id) - NO code field
INSERT INTO "Specialization" (id, name, department_id) VALUES 
(1, 'AII - Automatisme Informatique Industrielle', 1),
(2, 'CD - Commerce et Distribution', 4),
(3, 'CF - Comptabilite et Finance', 4),
(4, 'CFM - Conception et Fabrication Mecanique', 3),
(5, 'DSI - Developpement des Systemes d Information', 2),
(6, 'EI - Electrique Industrielle', 1),
(7, 'GE - Genie Electrique', 1),
(8, 'GM - Genie Mecanique', 3);

-- Insert Rooms (id, name, capacity, school_id, department_id) - NO type field
INSERT INTO rooms (id, name, capacity, school_id, department_id) VALUES 
-- Computer Science rooms (I1-I12) + labs (LI1-LI5)
(1, 'I1', 30, 1, 2),
(2, 'I2', 30, 1, 2),
(3, 'I3', 30, 1, 2),
(4, 'I4', 30, 1, 2),
(5, 'I5', 30, 1, 2),
(6, 'I6', 30, 1, 2),
(7, 'I7', 30, 1, 2),
(8, 'I8', 30, 1, 2),
(9, 'I9', 30, 1, 2),
(10, 'I10', 30, 1, 2),
(11, 'I11', 30, 1, 2),
(12, 'I12', 30, 1, 2),
(13, 'LI1', 20, 1, 2),
(14, 'LI2', 20, 1, 2),
(15, 'LI3', 20, 1, 2),
(16, 'LI4', 20, 1, 2),
(17, 'LI5', 20, 1, 2),
-- Business rooms (G1-G12) + labs (LG1-LG5)
(18, 'G1', 30, 1, 4),
(19, 'G2', 30, 1, 4),
(20, 'G3', 30, 1, 4),
(21, 'G4', 30, 1, 4),
(22, 'G5', 30, 1, 4),
(23, 'G6', 30, 1, 4),
(24, 'G7', 30, 1, 4),
(25, 'G8', 30, 1, 4),
(26, 'G9', 30, 1, 4),
(27, 'G10', 30, 1, 4),
(28, 'G11', 30, 1, 4),
(29, 'G12', 30, 1, 4),
(30, 'LG1', 20, 1, 4),
(31, 'LG2', 20, 1, 4),
(32, 'LG3', 20, 1, 4),
(33, 'LG4', 20, 1, 4),
(34, 'LG5', 20, 1, 4),
-- Electrical rooms (E1-E12) + labs (LE1-LE5)
(35, 'E1', 30, 1, 1),
(36, 'E2', 30, 1, 1),
(37, 'E3', 30, 1, 1),
(38, 'E4', 30, 1, 1),
(39, 'E5', 30, 1, 1),
(40, 'E6', 30, 1, 1),
(41, 'E7', 30, 1, 1),
(42, 'E8', 30, 1, 1),
(43, 'E9', 30, 1, 1),
(44, 'E10', 30, 1, 1),
(45, 'E11', 30, 1, 1),
(46, 'E12', 30, 1, 1),
(47, 'LE1', 20, 1, 1),
(48, 'LE2', 20, 1, 1),
(49, 'LE3', 20, 1, 1),
(50, 'LE4', 20, 1, 1),
(51, 'LE5', 20, 1, 1),
-- Mechanical rooms (M1-M12) + labs (LM1-LM5)
(52, 'M1', 30, 1, 3),
(53, 'M2', 30, 1, 3),
(54, 'M3', 30, 1, 3),
(55, 'M4', 30, 1, 3),
(56, 'M5', 30, 1, 3),
(57, 'M6', 30, 1, 3),
(58, 'M7', 30, 1, 3),
(59, 'M8', 30, 1, 3),
(60, 'M9', 30, 1, 3),
(61, 'M10', 30, 1, 3),
(62, 'M11', 30, 1, 3),
(63, 'M12', 30, 1, 3),
(64, 'LM1', 20, 1, 3),
(65, 'LM2', 20, 1, 3),
(66, 'LM3', 20, 1, 3),
(67, 'LM4', 20, 1, 3),
(68, 'LM5', 20, 1, 3);

-- Insert Groups (id, level, specialization_id)
INSERT INTO groups (id, level, specialization_id) VALUES 
(1, 'AII2.1', 1),
(2, 'AII2.2', 1),
(3, 'AII3.1', 1),
(4, 'AII3.2', 1),
(5, 'CD1.1', 2),
(6, 'CD1.2', 2),
(7, 'CF1.1', 3),
(8, 'CF1.2', 3),
(9, 'CFM2.1', 4),
(10, 'CFM2.2', 4),
(11, 'CFM2.3', 4),
(12, 'CFM3.1', 4),
(13, 'CFM3.2', 4),
(14, 'DSI2.1', 5),
(15, 'DSI2.2', 5),
(16, 'DSI3.1', 5),
(17, 'DSI3.2', 5);

-- Insert Teachers (id, first_name, last_name, school_id) - NO email or phoneNumber
INSERT INTO "Teacher" (id, first_name, last_name, school_id) VALUES 
-- AII Teachers (1-29)
(1, 'Walid', 'BEN YAHIA', 1),
(2, 'Hatem', 'JEDAY', 1),
(3, 'Ghizlane', 'FATINE', 1),
(4, 'Hassan', 'MOUSSA', 1),
(5, 'Wadi', 'ZOUILI', 1),
(6, 'Foued', 'MAROUK', 1),
(7, 'Said', 'SFAR', 1),
(8, 'M', 'BOUZID', 1),
(9, 'FERH', 'SIRDA', 1),
(10, 'FACT', 'FACT', 1),
(11, 'Hossam', 'MOUSSA', 1),
(12, 'FATHI', 'GHIOUL', 1),
(13, 'RAMDANI', 'WAFA', 1),
(14, 'Samir', 'BRAHAM SOUHEIB', 1),
(15, 'WASSIM', 'SFEIR', 1),
(16, 'ZAHRA', 'LAS', 1),
(17, 'MOHAMED FETHI', 'CHATENI', 1),
(18, 'AMIRA', 'CHAOUCH', 1),
(19, 'RANIA', 'CHAKROUN', 1),
(20, 'WAJDI', 'WAHAJ', 1),
(21, 'Ahmed', 'BEN AYED', 1),
(22, 'ZAHRA', 'JLASSI', 1),
(23, 'RAJA', 'KRIFA', 1),
(24, 'FATEN', 'GHOUL', 1),
(25, 'ASMA', 'CHAOUCH', 1),
(26, 'HICHEM', 'KASSRAOUI', 1),
(27, 'AMAL', 'GAFSI', 1),
(28, 'JAMEL', 'TURKI', 1),
(29, 'MOHAMED FEHMI', 'CHATENI', 1),
-- CD Teachers (30-41)
(30, 'Salahddine', 'BERRAD', 1),
(31, 'Samir', 'HATTAB', 1),
(32, 'Mohamed', 'BENHIDA', 1),
(33, 'Hanen', 'HAMMA', 1),
(34, 'Manel', 'LABYAD', 1),
(35, 'Hanen', 'BABA', 1),
(36, 'Samia', 'MATRI', 1),
(37, 'Samir', 'SFER', 1),
(38, 'Amel', 'GS', 1),
(39, 'John', 'MOURLIN', 1),
(40, 'HANEE', 'DABBA', 1),
(41, 'Thabet', 'S', 1),
-- CF Teachers (42-52)
(42, 'Raffa', 'BATOUCH', 1),
(43, 'Hatem', 'KRAIEM', 1),
(44, 'Atlas', 'ARFA', 1),
(45, 'Firas', 'KSOURI', 1),
(46, 'NIZARHA', 'GHALI', 1),
(47, 'Rania', 'BAYDOUH', 1),
(48, 'BEN', 'JAZA', 1),
(49, 'Mehdi', 'SAADLOU', 1),
(50, 'NIZAR', 'DIMASSI', 1),
(51, 'Akila', 'AFAFA', 1),
(52, 'JIHENE', 'BELG TLAF', 1),
-- CFM Teachers (53-94)
(53, 'Ben', 'BOUKAR', 1),
(54, 'M', 'ZAHI', 1),
(55, 'Ben', 'TACHIOU', 1),
(56, 'Mohamed', 'HADJOU', 1),
(57, 'FARIS', 'MIRA', 1),
(58, 'ZAHI', 'M.A', 1),
(59, 'M', 'NEGZOUA', 1),
(60, 'NADIRA', 'WAFA', 1),
(61, 'SAEB', 'SIR', 1),
(62, 'NADHI', 'WAFA', 1),
(63, 'ZAMMEL', 'HATEM', 1),
(64, 'TRIKI', 'FAKHRI', 1),
(65, 'MEHREZ', 'MONIA', 1),
(66, 'John', 'BOUROUIS', 1),
(67, 'John', 'SADOKI', 1),
(68, 'MAHREZ', 'ZAMMEL', 1),
(69, 'Yassine', 'BEN BOUARAR', 1),
(70, 'Mohamed', 'ZAMEL', 1),
(71, 'Mohamed', 'HADJER', 1),
(72, 'FATIMA', 'BEN FARAH', 1),
(73, 'Mohamed', 'NEZGAOUI', 1),
(74, 'HICHAM', 'ZAMEL', 1),
(75, 'John', 'HANTCHEU', 1),
(76, 'John', 'ZAMO', 1),
(77, 'John', 'KAMDEM', 1),
(78, 'John', 'MOHAMADOU', 1),
(79, 'John', 'VAC', 1),
(80, 'MICHEL', 'CHANEB', 1),
(81, 'John', 'MBOGNI', 1),
(82, 'MELLO', 'ZID', 1),
(83, 'FATHI', 'TRAIKIA', 1),
(84, 'MIMOUNE', 'SOUSSI', 1),
(85, 'John', 'ABDALAH', 1),
(86, 'MARIE', 'BEN DELLA', 1),
(87, 'FADWA', 'HAMOUDIA', 1),
(88, 'CHIKHI', 'NADIR', 1),
(89, 'MEBARKI', 'ABDELKRIM', 1),
(90, 'MAMERI', 'BEN DJELLA', 1),
(91, 'KACEM', 'TAHAROUN', 1),
(92, 'Anis', 'BAKLI', 1),
(93, 'MAMERI', 'SOUISSI', 1),
(94, 'BEN', 'AHMED', 1),
-- DSI teachers (95-130)
(95, 'Nesrine', 'SAIDI', 1),
(96, 'Mejda', 'BOUASKER', 1),
(97, 'CHAHED', 'BEN HAMED', 1),
(98, 'HELMI', 'BEN AHMED', 1),
(99, 'Mouna', 'BOUASKER CHAHED', 1),
(100, 'HELA', 'BOUJEMAAOUI', 1),
(101, 'SIRINE', 'FODHA', 1),
(102, 'FIRAS', 'HAKKOLA', 1),
(103, 'RACHID', 'BEN SLAMA', 1),
(104, 'RANIA', 'BOUZIDI', 1),
(105, 'LOUBNA', 'BEN RHOUMA', 1),
(106, 'AMINA', 'BOUSSAID CHLA', 1),
(107, 'NADER', 'KARRAY', 1),
(108, 'ALYA', 'KHIATI', 1),
(109, 'Mohamed', 'HERMOUUD', 1),
(110, 'Meriem', 'SENE', 1),
(111, 'Hafedh', 'BOUCHRIHA', 1),
(112, 'Leon', 'BEN NOUMA', 1);

-- Insert Subjects (id, name, hour_volume, department_id) - Consolidated unique subjects
INSERT INTO "Subject" (id, name, hour_volume, department_id) VALUES 
-- Electrical Engineering subjects (department 1)
(1, 'Linear Continuous Control Systems', 4.5, 1),
(2, 'Analog Electronics', 1.5, 1),
(3, 'Electrical Lab Workshop', 6.0, 1),
(4, 'Industrial Instrumentation', 1.5, 1),
(5, 'Automatic Control Workshop', 3.0, 1),
(6, 'Power Electronics', 4.5, 1),
(7, 'Signal Processing', 4.5, 1),
(8, 'Industrial Automation', 4.5, 1),
(9, 'Analog Electronics Workshop', 9.0, 1),
(10, 'Professional Activity Preparation', 1.5, 1),
(11, 'LabVIEW Workshop', 4.5, 1),
(12, 'Quality and Maintenance', 1.5, 1),
(13, 'Real-Time Systems', 1.5, 1),
(14, 'Robotic Systems', 1.5, 1),
(15, 'Robotic Systems Workshop', 3.0, 1),
(16, 'Programmable Circuits', 1.5, 1),
(17, 'Programmable Circuits Workshop', 3.0, 1),
(18, 'FPGA Circuits', 1.5, 1),
(19, 'Process Supervision', 1.5, 1),
(20, 'Process Supervision Workshop', 1.5, 1),
(21, 'Maintenance of Automated Systems Workshop', 3.0, 1),
(22, 'Axis Control', 1.5, 1),
(23, 'Industrial Regulation', 1.5, 1),
(24, 'Renewable Energy', 1.5, 1),
(25, 'Business Creation', 1.5, 1),
(26, 'DSP Circuits', 1.5, 1),
(27, 'Real-Time Systems Workshop', 3.0, 1),
-- Computer Science subjects (department 2)
(28, 'Databases', 1.5, 2),
(29, 'IT Law', 1.5, 2),
(30, 'Embedded System Radio', 1.5, 2),
(31, 'Web Development Workshop', 3.0, 2),
(32, 'Java Programming Workshop', 3.0, 2),
(33, 'Object-Oriented Modeling UML', 3.0, 2),
(34, 'Python Workshop', 3.0, 2),
(35, 'Server-Side Web Development Workshop', 3.0, 2),
(36, 'Object-Oriented Programming', 3.0, 2),
(37, 'Database Workshop', 4.5, 2),
(38, 'Programming Workshop', 4.5, 2),
(39, 'Client-Side Framework Workshop', 3.0, 2),
(40, 'Object-Oriented Design and Modeling Methodology', 4.5, 2),
(41, 'Mobile Development', 4.5, 2),
(42, 'Framework Workshop', 9.0, 2),
(43, 'Information Research and Marketing Workshop', 3.0, 2),
(44, 'SOA Workshop', 3.0, 2),
(45, 'Software Testing and Validation Workshop', 3.0, 2),
(46, 'DevOps Chains Workshop', 3.0, 2),
(47, 'Design Methodology', 1.5, 2),
(48, 'Big Data Management', 1.5, 2),
(49, 'Web Frameworks', 1.5, 2),
(50, 'Database Architecture', 1.5, 2),
-- Mechanical Engineering subjects (department 3)
(51, 'Machining Workshop', 3.0, 3),
(52, 'Thermodynamics', 1.5, 3),
(53, 'Fluid Mechanics', 4.5, 3),
(54, 'Production via CNC', 1.5, 3),
(55, 'Automated System Implementation', 1.5, 3),
(56, 'Introduction to IoT', 1.5, 3),
(57, 'Industrial Automation Mechanical', 1.5, 3),
(58, 'Intelligent Systems Workshop', 3.0, 3),
(59, 'Surveillance Systems and Automatic Equipment', 1.5, 3),
(60, 'Mechanical System CAD', 1.5, 3),
(61, 'Regulation and Servomechanisms', 3.0, 3),
(62, 'Communication Systems', 1.5, 3),
(63, 'Control Workshop', 18.0, 3),
(64, 'Synthesis Workshop', 3.0, 3),
(65, 'Introduction to Computing', 1.5, 3),
(66, 'Regulation and Control Systems', 4.5, 3),
(67, 'Maritime Management Control Workshop', 3.0, 3),
(68, 'Manufacturing Learning', 1.5, 3),
(69, 'Mechanical Workshop', 6.0, 3),
(70, 'CAD Production', 3.0, 3),
(71, 'Machining Setup', 1.5, 3),
(72, 'Mechanical Systems 2', 1.5, 3),
(73, 'CNC Production 2', 4.5, 3),
(74, 'Production Organization and Management', 4.5, 3),
(75, 'Manufacturing Workshop', 3.0, 3),
(76, 'FAO Computer Aided Manufacturing', 1.5, 3),
(77, 'Mini Design Project', 9.0, 3),
(78, 'Technical Analysis 2', 3.0, 3),
(79, 'Metal Structures', 1.5, 3),
(80, 'Practical Workshop Project', 12.0, 3),
(81, 'FAD Fabrication Assistee par Ordinateur', 1.5, 3),
-- Business Management subjects (department 4)
(82, 'Communication Skills Development', 1.5, 4),
(83, 'Human Rights Law', 3.0, 4),
(84, 'Quality Tools and Methods', 6.0, 4),
(85, 'Financial Accounting 1', 4.5, 4),
(86, 'Organizational Management', 4.5, 4),
(87, 'General Economics 1', 4.5, 4),
(88, 'Organizational Management Workshop', 6.0, 4),
(89, 'Descriptive Statistics', 4.5, 4),
(90, 'Applied Mathematics', 4.5, 4),
(91, 'Introduction to Law', 1.5, 4),
(92, 'Financial Management', 3.0, 4),
(93, 'Financial Mathematics', 3.0, 4),
(94, 'Commercial Law', 3.0, 4),
-- Common subjects (shared across departments)
(95, 'Technical English', 1.5, 1),
(96, 'TOEIC English Certification Prep', 4.5, 1),
(97, 'Network Certification Preparation', 1.5, 1),
(98, 'Law', 1.5, 1),
(99, 'Labor Law', 1.5, 3),
(100, 'Communication Techniques', 1.5, 3),
(101, 'High-Tech English', 3.0, 2),
(102, 'TOEIC Preparation', 1.5, 2),
(103, 'Business Communication', 1.5, 2),
(104, 'Entrepreneurial Culture', 1.5, 3);

-- Insert Sessions (id, subject_id, group_id)
INSERT INTO sessions (id, subject_id, group_id) VALUES 
-- Group AII2.1 sessions (group_id = 1)
(1, 1, 1),   -- Linear Continuous Control Systems
(2, 2, 1),   -- Analog Electronics
(3, 3, 1),   -- Electrical Lab Workshop
(4, 4, 1),   -- Industrial Instrumentation
(5, 5, 1),   -- Automatic Control Workshop
(6, 6, 1),   -- Power Electronics
(7, 7, 1),   -- Signal Processing
(8, 96, 1),  -- TOEIC English Certification Prep
(9, 8, 1),   -- Industrial Automation
(10, 98, 1), -- Law
-- Group AII2.2 sessions (group_id = 2)
(11, 1, 2),  -- Linear Continuous Control Systems
(12, 7, 2),  -- Signal Processing
(13, 8, 2),  -- Industrial Automation
(14, 9, 2),  -- Analog Electronics Workshop
(15, 6, 2),  -- Power Electronics
(16, 10, 2), -- Professional Activity Preparation
(17, 98, 2), -- Law
(18, 95, 2), -- Technical English
(19, 11, 2), -- LabVIEW Workshop
-- Group AII3.1 sessions (group_id = 3)
(20, 12, 3), -- Quality and Maintenance
(21, 13, 3), -- Real-Time Systems
(22, 14, 3), -- Robotic Systems
(23, 15, 3), -- Robotic Systems Workshop
(24, 16, 3), -- Programmable Circuits
(25, 17, 3), -- Programmable Circuits Workshop
(26, 18, 3), -- FPGA Circuits
(27, 19, 3), -- Process Supervision
(28, 97, 3), -- Network Certification Preparation
(29, 20, 3), -- Process Supervision Workshop
(30, 21, 3), -- Maintenance of Automated Systems Workshop
(31, 22, 3), -- Axis Control
-- Group AII3.2 sessions (group_id = 4)
(32, 23, 4), -- Industrial Regulation
(33, 14, 4), -- Robotic Systems
(34, 12, 4), -- Quality and Maintenance
(35, 19, 4), -- Process Supervision
(36, 18, 4), -- FPGA Circuits
(37, 24, 4), -- Renewable Energy
(38, 97, 4), -- Network Certification Preparation
(39, 25, 4), -- Business Creation
(40, 22, 4), -- Axis Control
(41, 13, 4), -- Real-Time Systems
(42, 26, 4), -- DSP Circuits
(43, 15, 4), -- Robotic Systems Workshop
(44, 17, 4), -- Programmable Circuits Workshop
(45, 27, 4), -- Real-Time Systems Workshop
(46, 21, 4), -- Maintenance of Automated Systems Workshop
-- CD1.1 sessions (group_id = 5)
(47, 82, 5), -- Communication Skills Development
(48, 83, 5), -- Human Rights Law
(49, 84, 5), -- Quality Tools and Methods
(50, 85, 5), -- Financial Accounting 1
(51, 86, 5), -- Organizational Management
(52, 87, 5), -- General Economics 1
(53, 88, 5), -- Organizational Management Workshop
(54, 89, 5), -- Descriptive Statistics
(55, 90, 5), -- Applied Mathematics
-- CD1.2 sessions (group_id = 6)
(56, 83, 6), -- Human Rights Law
(57, 82, 6), -- Communication Skills Development
(58, 85, 6), -- Financial Accounting 1
(59, 86, 6), -- Organizational Management
(60, 84, 6), -- Quality Tools and Methods
(61, 89, 6), -- Descriptive Statistics
(62, 91, 6), -- Introduction to Law
(63, 88, 6), -- Organizational Management Workshop
(64, 90, 6), -- Applied Mathematics
(65, 92, 6), -- Financial Management
-- CF1.1 sessions (group_id = 7)
(66, 85, 7), -- Financial Accounting 1
(67, 86, 7), -- Organizational Management
(68, 93, 7), -- Financial Mathematics
(69, 89, 7), -- Descriptive Statistics
(70, 82, 7), -- Communication Skills Development
(71, 94, 7), -- Commercial Law
(72, 83, 7), -- Human Rights Law
(73, 87, 7), -- General Economics 1
(74, 90, 7), -- Applied Mathematics
-- CF1.2 sessions (group_id = 8)
(75, 85, 8), -- Financial Accounting 1
(76, 86, 8), -- Organizational Management
(77, 94, 8), -- Commercial Law
(78, 83, 8), -- Human Rights Law
(79, 87, 8), -- General Economics 1
(80, 89, 8), -- Descriptive Statistics
(81, 90, 8), -- Applied Mathematics
-- CFM2.1 sessions (group_id = 9)
(82, 51, 9),  -- Machining Workshop
(83, 52, 9),  -- Thermodynamics
(84, 53, 9),  -- Fluid Mechanics
(85, 54, 9),  -- Production via CNC
(86, 99, 9),  -- Labor Law
(87, 95, 9),  -- Technical English
(88, 55, 9),  -- Automated System Implementation
(89, 56, 9),  -- Introduction to IoT
(90, 57, 9),  -- Industrial Automation Mechanical
(91, 100, 9), -- Communication Techniques
(92, 58, 9),  -- Intelligent Systems Workshop
(93, 59, 9),  -- Surveillance Systems and Automatic Equipment
(94, 60, 9),  -- Mechanical System CAD
-- CFM2.2 sessions (group_id = 10)
(95, 56, 10),  -- Introduction to IoT
(96, 61, 10),  -- Regulation and Servomechanisms
(97, 54, 10),  -- Production via CNC
(98, 53, 10),  -- Fluid Mechanics
(99, 95, 10),  -- Technical English
(100, 57, 10), -- Industrial Automation Mechanical
(101, 62, 10), -- Communication Systems
(102, 100, 10),-- Communication Techniques
(103, 60, 10), -- Mechanical System CAD
(104, 63, 10), -- Control Workshop
(105, 64, 10), -- Synthesis Workshop
(106, 65, 10), -- Introduction to Computing
(107, 66, 10), -- Regulation and Control Systems
(108, 99, 10), -- Labor Law
-- CFM2.3 sessions (group_id = 11)
(109, 67, 11), -- Maritime Management Control Workshop
(110, 68, 11), -- Manufacturing Learning
(111, 69, 11), -- Mechanical Workshop
(112, 53, 11), -- Fluid Mechanics
(113, 60, 11), -- Mechanical System CAD
(114, 58, 11), -- Intelligent Systems Workshop
(115, 99, 11), -- Labor Law
(116, 52, 11), -- Thermodynamics
(117, 70, 11), -- CAD Production
(118, 62, 11), -- Communication Systems
(119, 95, 11), -- Technical English
-- CFM3.1 sessions (group_id = 12)
(120, 71, 12),  -- Machining Setup
(121, 72, 12),  -- Mechanical Systems 2
(122, 73, 12),  -- CNC Production 2
(123, 74, 12),  -- Production Organization and Management
(124, 75, 12),  -- Manufacturing Workshop
(125, 76, 12),  -- FAO Computer Aided Manufacturing
(126, 77, 12),  -- Mini Design Project
(127, 78, 12),  -- Technical Analysis 2
(128, 79, 12),  -- Metal Structures
(129, 100, 12), -- Communication Techniques
(130, 104, 12), -- Entrepreneurial Culture
-- CFM3.2 sessions (group_id = 13)
(131, 72, 13),  -- Mechanical Systems 2
(132, 80, 13),  -- Practical Workshop Project
(133, 77, 13),  -- Mini Design Project
(134, 74, 13),  -- Production Organization and Management
(135, 100, 13), -- Communication Techniques
(136, 73, 13),  -- CNC Production 2
(137, 81, 13),  -- FAD Fabrication Assistee par Ordinateur
(138, 47, 13),  -- Design Methodology
(139, 79, 13),  -- Metal Structures
-- DSI2.1 sessions (group_id = 14)
(140, 28, 14), -- Databases
(141, 29, 14), -- IT Law
(142, 30, 14), -- Embedded System Radio
(143, 31, 14), -- Web Development Workshop
(144, 32, 14), -- Java Programming Workshop
(145, 33, 14), -- Object-Oriented Modeling UML
(146, 34, 14), -- Python Workshop
(147, 101, 14),-- High-Tech English
(148, 103, 14),-- Business Communication
-- DSI2.2 sessions (group_id = 15)
(149, 29, 15), -- IT Law
(150, 35, 15), -- Server-Side Web Development Workshop
(151, 36, 15), -- Object-Oriented Programming
(152, 37, 15), -- Database Workshop
(153, 33, 15), -- Object-Oriented Modeling UML
(154, 34, 15), -- Python Workshop
(155, 101, 15),-- High-Tech English
(156, 38, 15), -- Programming Workshop
(157, 39, 15), -- Client-Side Framework Workshop
-- DSI3.1 sessions (group_id = 16)
(158, 40, 16), -- Object-Oriented Design and Modeling Methodology
(159, 37, 16), -- Database Workshop (larger hours)
(160, 41, 16), -- Mobile Development
(161, 42, 16), -- Framework Workshop
(162, 43, 16), -- Information Research and Marketing Workshop
(163, 44, 16), -- SOA Workshop
(164, 102, 16),-- TOEIC Preparation
-- DSI3.2 sessions (group_id = 17)
(165, 45, 17), -- Software Testing and Validation Workshop
(166, 46, 17), -- DevOps Chains Workshop
(167, 102, 17),-- TOEIC Preparation
(168, 47, 17), -- Design Methodology
(169, 48, 17), -- Big Data Management
(170, 41, 17), -- Mobile Development
(171, 49, 17), -- Web Frameworks
(172, 44, 17), -- SOA Workshop
(173, 50, 17); -- Database Architecture

INSERT INTO teacher_subject (teacher_id, subject_id) VALUES 
-- AII teachers (Walid BEN YAHIA = 1, Hatem JEDAY = 2, etc.)
(1, 1), (1, 5), (1, 7),  -- Walid BEN YAHIA: Linear Control, Automatic Control Workshop, Signal Processing
(2, 2), (2, 3),           -- Hatem JEDAY: Analog Electronics, Electrical Lab Workshop
(3, 4),                   -- Ghizlane FATINE: Industrial Instrumentation
(4, 6),                   -- Hassan MOUSSA: Power Electronics
(5, 8),                   -- Wadi ZOUILI: TOEIC English
(6, 9),                   -- Foued MAROUK: Industrial Automation
(7, 98),                  -- Said SFAR: Law
(8, 1), (8, 8), (8, 10), (8, 98),  -- M. BOUZID: Linear Control, Industrial Automation, Professional Activity, Law
(9, 7), (9, 9),           -- FERH SIRDA: Signal Processing, Analog Electronics Workshop
(10, 8), (10, 9),         -- FACT: Industrial Automation Workshop, Analog Electronics Workshop
(11, 6),                  -- Hossam/FATHI GHIOUL: Power Electronics
(13, 95),                 -- RAMDANI WAFA: Technical English
(14, 11),                 -- Samir BRAHAM: LabVIEW Workshop
(15, 12), (15, 20),       -- WASSIM SFEIR: Quality and Maintenance, Process Supervision Workshop
(16, 13), (16, 14), (16, 15),  -- ZAHRA LAS/JLASSI: Real-Time Systems, Robotic Systems, Robotic Workshop
(17, 16), (17, 17),       -- MOHAMED FETHI CHATENI: Programmable Circuits, Workshop
(18, 18),                 -- AMIRA CHAOUCH: FPGA Circuits
(19, 19),                 -- RANIA CHAKROUN: Process Supervision
(20, 97),                 -- WAJDI WAHAJ: Network Certification Preparation
(21, 23),                 -- Ahmed BEN AYED: Industrial Regulation
(22, 14), (22, 15),       -- ZAHRA JLASSI: Robotic Systems, Workshop
(23, 12),                 -- RAJA KRIFA: Quality and Maintenance
(24, 19),                 -- FATEN GHOUL: Process Supervision
(25, 18), (25, 26),       -- ASMA CHAOUCH: FPGA Circuits, DSP Circuits
(26, 24),                 -- HICHEM KASSRAOUI: Renewable Energy
(27, 25),                 -- AMAL GAFSI: Business Creation
(28, 13), (28, 27),       -- JAMEL TURKI: Real-Time Systems, Workshop
(29, 17),                 -- MOHAMED FEHMI CHATENI: Programmable Circuits Workshop
-- CD teachers (Salahddine BERRAD = 30, Samir HATTAB = 31, etc.)
(30, 82),                 -- Salahddine BERRAD: Communication Skills Development
(31, 83),                 -- Samir HATTAB: Human Rights Law
(32, 84),                 -- Mohamed BENHIDA: Quality Tools and Methods
(33, 85), (33, 86), (33, 87), (33, 88),  -- Hanen HAMMA: Financial Accounting, Org Management, Economics, Workshop
(34, 89),                 -- Manel LABYAD: Descriptive Statistics
(35, 90),                 -- Hanen BABA: Applied Mathematics
(36, 83),                 -- Samia MATRI: Human Rights Law
(37, 82), (37, 84),       -- Samir SFER: Communication Skills, Quality Tools
(38, 85),                 -- Amel GS: Financial Accounting
(39, 86), (39, 88), (39, 92),  -- Mourlin: Organizational Management, Workshop, Financial Management
(40, 89), (40, 90),       -- HANÈE DABBA: Descriptive Statistics, Applied Mathematics
(41, 91),                 -- Thabet S.: Introduction to Law
-- CF teachers (Raffa BATOUCH = 42, Hatem KRAIEM = 43, etc.)
(42, 85), (42, 82),       -- Raffa BATOUCH: Financial Accounting, Communication Skills
(43, 86), (43, 89),       -- Hatem KRAIEM: Organizational Management, Descriptive Statistics
(44, 93), (44, 90),       -- Atlas ARFA: Financial Mathematics, Applied Mathematics
(45, 94), (45, 83),       -- Firas KSOURI: Commercial Law, Human Rights Law
(46, 87),                 -- NIZARHA GHALI: General Economics
(47, 85), (47, 87),       -- Rania BAYDOUH: Financial Accounting, General Economics
(48, 86),                 -- BEN JAZA: Organizational Management
(49, 94),                 -- Mehdi SAADLOU: Commercial Law
(50, 83),                 -- NIZAR DIMASSI: Human Rights Law
(51, 89),                 -- Akila AFAFA: Descriptive Statistics
(52, 90),                 -- JIHENE BELG TLAF: Applied Mathematics
-- CFM teachers (SAEB SIR = 53, NADHI WAFA = 54, etc.)
(53, 51), (53, 95),       -- SAEB SIR: Machining Workshop, Technical English
(54, 52), (54, 71),       -- NADHI WAFA: Thermodynamics, Machining Setup
(55, 53), (55, 72),       -- ZAMMEL Hatem/Mohamed HADJER: Fluid Mechanics, Mechanical Systems 2
(56, 54), (56, 73),       -- TRIKI FAKHRI/Ben TACHIOU: Production via CNC, CNC Production 2
(57, 99), (57, 74),       -- MEHREZ MONIA/MIMOUNE SOUSSI: Labor Law, Production Organization
(58, 95), (58, 75),       -- BOUROUIS/FATIMA BEN FARAH: Technical English, Manufacturing Workshop
(59, 55), (59, 76),       -- SADOKI/ABDALAH: Automated System Implementation, FAO
(60, 56), (60, 77),       -- ZAMMEL Hatem/Mohamed HERMOUUD: Introduction to IoT, Mini Design Project
(61, 57), (61, 78),       -- ZAMMEL Hatem/FATHI TRAIKIA: Industrial Automation, Technical Analysis 2
(62, 100), (62, 79),      -- BOUROUIS/MARIE BEN DELLA: Communication Techniques, Metal Structures
(63, 58), (63, 100),      -- MAHREZ ZAMMEL/FADWA HAMOUDIA: Intelligent Systems Workshop, Communication Techniques
(64, 59), (64, 104),      -- ZAMMEL Hatem: Surveillance Systems, Entrepreneurial Culture
(65, 60), (65, 72),       -- ZAMMEL Hatem/CHIKHI Nadir: Mechanical System CAD, Mechanical Systems 2
(66, 56), (66, 80),       -- Yassine BEN BOUARAR/MEBARKI Abdelkrim: Intro to IoT, Practical Workshop
(67, 61), (67, 77),       -- M. ZAHI/Mohamed ZAMEL: Regulation and Servomechanisms, Mini Design Project
(68, 54), (68, 74),       -- Ben TACHIOU/MEBARKI Abdelkrim: Production via CNC, Production Management
(69, 53), (69, 100),      -- Mohamed HADJOU/MAMERI BEN DJELLA: Fluid Mechanics, Communication Techniques
(70, 95), (70, 73),       -- FARIS MIRA/KACEM TAHAROUN: Technical English, CNC Production 2
(71, 57), (71, 81),       -- ZAHI M.A/Anis BAKLI: Industrial Automation, FAD
(72, 62), (72, 47),       -- M. NEGZOUA/MAMERI SOUISSI: Communication Systems, Design Methodology
(73, 100), (73, 79),      -- ZAHI M.A/BEN AHMED: Communication Techniques, Metal Structures
(74, 60),                 -- ZAHI M.A: Mechanical System CAD
(75, 63),                 -- NADIRA Wafa: Control Workshop
(76, 64),                 -- ZAHI M.A: Synthesis Workshop
(77, 65),                 -- Yassine BEN BOUARAR: Introduction to Computing
(78, 66),                 -- Mohamed ZAMEL: Regulation and Control Systems
(79, 53),                 -- Mohamed HADJER: Fluid Mechanics
(80, 95),                 -- FATIMA BEN FARAH: Technical English
(81, 100),                -- Mohamed NEZGAOUI: Communication Techniques
(82, 99),                 -- HICHAM ZAMEL: Labor Law
(83, 60),                 -- Mohamed NEZGAOUI: Mechanical Systems CAD
(84, 63),                 -- HICHAM ZAMEL: Control Workshop
(85, 67),                 -- HANTCHEU: Maritime Management Control Workshop
(86, 68),                 -- ZAMO: Manufacturing Learning
(87, 69),                 -- KAMDEM: Mechanical Workshop
(88, 53),                 -- MOHAMADOU: Fluid Mechanics
(89, 60),                 -- ZAMO: Mechanical Systems CAD
(90, 58),                 -- VAC: Intelligent Systems Workshop
(91, 99),                 -- MICHEL CHANEB: Labor Law
(92, 52),                 -- ZAMO: Thermodynamics
(93, 70),                 -- BON BOUKAR: CAD Production
(94, 62),                 -- ZAMO: Communication Systems
-- DSI teachers (Nesrine SAIDI = 95, Mejda BOUASKER = 96, etc.)
(95, 28),                 -- Nesrine SAIDI: Databases
(96, 29),                 -- Mejda BOUASKER: IT Law
(97, 30),                 -- CHAHED BEN HAMED: Embedded System Radio
(98, 31), (98, 32),       -- HELMI BEN AHMED: Web Development Workshop, Java Programming
(99, 33),                 -- Mouna BOUASKER CHAHED: Object-Oriented Modeling UML
(100, 34),                -- HELA BOUJEMAAOUI: Python Workshop
(101, 101),               -- SIRINE FODHA: High-Tech English
(102, 103),               -- FIRAS HAKKOLA: Business Communication
(103, 29), (103, 40), (103, 37), (103, 43),  -- RACHID BEN SLAMA: IT Law, OO Design, Database Workshop, Research
(104, 35),                -- RANIA BOUZIDI: Server-Side Web Development
(105, 36), (105, 33),     -- LOUBNA BEN RHOUMA: OO Programming, Object Modeling UML
(106, 37),                -- AMINA BOUSSAID CHLA: Database Workshop
(107, 34),                -- NADER KARRAY: Python Workshop
(108, 38), (108, 39),     -- ALYA KHIATI: Programming Workshop, Client-Side Framework
(109, 41), (109, 42), (109, 44),  -- Mohamed HERMOUUD: Mobile Development, Framework Workshop, SOA
(110, 102),               -- Meriem SENE: TOEIC Preparation
(111, 45), (111, 46), (111, 48), (111, 41), (111, 49), (111, 44), (111, 50),  -- Hafedh BOUCHRIHA: Testing, DevOps, Big Data, Mobile, Web Frameworks, SOA, DB Architecture
(112, 47);                -- Leon BEN NOUMA: Design Methodology



-- Verification queries
SELECT 'School' AS table_name, COUNT(*) AS count FROM "School"
UNION ALL SELECT 'Departments', COUNT(*) FROM "Department"
UNION ALL SELECT 'Specializations', COUNT(*) FROM "Specialization"
UNION ALL SELECT 'Groups', COUNT(*) FROM groups
UNION ALL SELECT 'Teachers', COUNT(*) FROM "Teacher"
UNION ALL SELECT 'Subjects', COUNT(*) FROM "Subject"
UNION ALL SELECT 'Sessions', COUNT(*) FROM sessions
UNION ALL SELECT 'Rooms', COUNT(*) FROM rooms
UNION ALL SELECT 'subject_specializations', COUNT(*) FROM subject_specializations
UNION ALL SELECT 'teacher_subject', COUNT(*) FROM teacher_subject;
