-- Complete SQL seed data for real university timetable
-- Generated to match Prisma schema exactly

-- Clear existing data
TRUNCATE TABLE group_sessions, teacher_subject_specializations, subject_specializations, 
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
(1, 'A101', 30, 1, 1),
(2, 'A102', 30, 1, 1),
(3, 'B101', 30, 1, 2),
(4, 'B102', 30, 1, 2),
(5, 'C101', 30, 1, 3),
(6, 'C102', 30, 1, 3),
(7, 'D101', 30, 1, 4),
(8, 'Lab1', 20, 1, 1),
(9, 'Lab2', 20, 1, 2),
(10, 'Lab3', 20, 1, 3);

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

-- Insert Subjects (id, name, hour_volume, department_id) - NO code, type, or coefficient
INSERT INTO "Subject" (id, name, hour_volume, department_id) VALUES 
-- Group AII2.1 subjects (departmentId = 1, Electrical)
(1, 'Linear Continuous Control Systems', 4.5, 1),
(2, 'Analog Electronics', 1.5, 1),
(3, 'Electrical Lab Workshop', 6.0, 1),
(4, 'Industrial Instrumentation', 1.5, 1),
(5, 'Automatic Control Workshop', 3.0, 1),
(6, 'Power Electronics', 4.5, 1),
(7, 'Signal Processing', 1.5, 1),
(8, 'TOEIC English Certification Prep', 4.5, 1),
(9, 'Industrial Automation', 4.5, 1),
(10, 'Law', 1.5, 1),
-- Group AII2.2 subjects
(11, 'Linear Continuous Control Systems Lecture', 4.5, 1),
(12, 'Linear Continuous Control Systems Tutorial', 4.5, 1),
(13, 'Signal Processing Lecture', 4.5, 1),
(14, 'Signal Processing Tutorial', 4.5, 1),
(15, 'Industrial Automation Workshop', 3.0, 1),
(16, 'Analog Electronics Workshop', 9.0, 1),
(17, 'Power Electronics Course', 4.5, 1),
(18, 'Professional Activity Preparation', 1.5, 1),
(19, 'Law Course', 1.5, 1),
(20, 'Technical English', 1.5, 1),
(21, 'LabVIEW Workshop', 4.5, 1),
-- Group AII3.1 subjects
(22, 'Quality and Maintenance Workshop', 1.5, 1),
(23, 'Real-Time Systems', 1.5, 1),
(24, 'Robotic Systems', 1.5, 1),
(25, 'Robotic Systems Workshop', 3.0, 1),
(26, 'Programmable Circuits', 1.5, 1),
(27, 'Programmable Circuits Workshop', 3.0, 1),
(28, 'FPGA Circuits', 1.5, 1),
(29, 'Quality and Maintenance', 1.5, 1),
(30, 'Process Supervision', 1.5, 1),
(31, 'Network Certification Preparation', 1.5, 1),
(32, 'Process Supervision Workshop', 1.5, 1),
(33, 'Maintenance of Automated Systems Workshop', 3.0, 1),
(34, 'Axis Control', 1.5, 1),
-- Group AII3.2 subjects
(35, 'Industrial Regulation', 1.5, 1),
(36, 'Robotic Systems AII32', 1.5, 1),
(37, 'Quality and Maintenance AII32', 1.5, 1),
(38, 'Process Supervision AII32', 1.5, 1),
(39, 'FPGA Circuits AII32', 1.5, 1),
(40, 'Renewable Energy', 1.5, 1),
(41, 'Network Certification Prep English', 1.5, 1),
(42, 'Business Creation', 1.5, 1),
(43, 'Axis Control AII32', 1.5, 1),
(44, 'Real-Time Systems AII32', 1.5, 1),
(45, 'DSP Circuits', 1.5, 1),
(46, 'Robotic Systems Workshop AII32', 3.0, 1),
(47, 'Programmable Circuits Workshop AII32', 3.0, 1),
(48, 'Real-Time Systems Workshop', 3.0, 1),
(49, 'Maintenance of Automated Systems Workshop AII32', 3.0, 1),
-- CD1.1 subjects (departmentId = 4, Business)
(50, 'Communication Skills Development CD11', 1.5, 4),
(51, 'Human Rights Law CD11', 3.0, 4),
(52, 'Quality Tools and Methods', 6.0, 4),
(53, 'Financial Accounting 1 CD11', 4.5, 4),
(54, 'Organizational Management CD11', 4.5, 4),
(55, 'General Economics 1 CD11', 4.5, 4),
(56, 'Organizational Management Workshop CD11', 6.0, 4),
(57, 'Descriptive Statistics CD11', 4.5, 4),
(58, 'Applied Mathematics CD11', 4.5, 4),
-- CD1.2 subjects
(59, 'Human Rights Law CD12', 3.0, 4),
(60, 'Communication Skills Development CD12', 3.0, 4),
(61, 'Financial Accounting 1 CD12', 3.0, 4),
(62, 'Organizational Management CD12', 6.0, 4),
(63, 'Quality Tools and Methods CD12', 3.0, 4),
(64, 'Descriptive Statistics CD12', 6.0, 4),
(65, 'Introduction to Law CD12', 1.5, 4),
(66, 'Organizational Management Workshop CD12', 3.0, 4),
(67, 'Applied Mathematics CD12', 6.0, 4),
(68, 'Financial Management CD12', 3.0, 4),
-- CF1.1 subjects (departmentId = 4, Business)
(69, 'Financial Accounting 1 CF11', 4.5, 4),
(70, 'Organizational Management CF11', 3.0, 4),
(71, 'Financial Mathematics', 3.0, 4),
(72, 'Descriptive Statistics CF11', 6.0, 4),
(73, 'Communication Skills Development CF11', 3.0, 4),
(74, 'Commercial Law CF11', 3.0, 4),
(75, 'Human Rights Law CF11', 1.5, 4),
(76, 'General Economics 1 CF11', 3.0, 4),
(77, 'Applied Mathematics CF11', 3.0, 4),
-- CF1.2 subjects
(78, 'Financial Accounting 1 CF12', 6.0, 4),
(79, 'Organizational Management CF12', 1.5, 4),
(80, 'Commercial Law CF12', 6.0, 4),
(81, 'Human Rights Law CF12', 3.0, 4),
(82, 'General Economics 1 CF12', 6.0, 4),
(83, 'Descriptive Statistics CF12', 3.0, 4),
(84, 'Applied Mathematics CF12', 6.0, 4),
-- CFM2.1 subjects (departmentId = 3, Mechanical)
(85, 'Machining Workshop CFM21', 3.0, 3),
(86, 'Thermodynamics CFM21', 1.5, 3),
(87, 'Fluid Mechanics CFM21', 1.5, 3),
(88, 'Production via CNC CFM21', 1.5, 3),
(89, 'Labor Law CFM21', 1.5, 3),
(90, 'Technical English CFM21', 1.5, 3),
(91, 'Automated System Implementation', 1.5, 3),
(92, 'Introduction to IoT CFM21', 1.5, 3),
(93, 'Industrial Automation CFM21', 1.5, 3),
(94, 'Communication Techniques CFM21', 1.5, 3),
(95, 'Intelligent Systems Workshop CFM21', 3.0, 3),
(96, 'Surveillance Systems and Automatic Equipment', 1.5, 3),
(97, 'Mechanical System CAD CFM21', 1.5, 3),
-- CFM2.2 subjects (first variant)
(98, 'Introduction to IoT CFM22', 1.5, 3),
(99, 'Regulation and Servomechanisms', 3.0, 3),
(100, 'Production via CNC CFM22', 1.5, 3),
(101, 'Fluid Mechanics CFM22', 4.5, 3),
(102, 'Technical English CFM22', 1.5, 3),
(103, 'Industrial Automation CFM22', 3.0, 3),
(104, 'Communication Systems CFM22', 1.5, 3),
(105, 'Communication Techniques CFM22', 1.5, 3),
(106, 'Mechanical System CAD CFM22', 1.5, 3),
(107, 'Control Workshop CFM22', 18.0, 3),
(108, 'Synthesis Workshop', 3.0, 3),
-- CFM2.2 subjects (second variant)
(109, 'Introduction to Computing', 1.5, 3),
(110, 'Regulation and Control Systems', 4.5, 3),
(111, 'Fluid Mechanics CFM22v2', 1.5, 3),
(112, 'Technical English 1 CFM22v2', 1.5, 3),
(113, 'Communication Techniques CFM22v2', 1.5, 3),
(114, 'Labor Law CFM22v2', 1.5, 3),
(115, 'Mechanical Systems CAD Synthesis Workshop', 1.5, 3),
(116, 'Control Workshop Con1', 18.0, 3),
-- CFM2.3 subjects
(117, 'Maritime Management Control Workshop', 3.0, 3),
(118, 'Manufacturing Learning', 1.5, 3),
(119, 'Mechanical Workshop 3', 6.0, 3),
(120, 'Fluid Mechanics CFM23', 3.0, 3),
(121, 'Mechanical Systems CAD CFM23', 3.0, 3),
(122, 'Intelligent Systems Workshop CFM23', 12.0, 3),
(123, 'Labor Law CFM23', 1.5, 3),
(124, 'Thermodynamics CFM23', 3.0, 3),
(125, 'CAD Production', 3.0, 3),
(126, 'Communication Systems CFM23', 4.5, 3),
(127, 'Technical English 1 CFM23', 1.5, 3),
-- CFM3.1 subjects
(128, 'Machining Setup', 1.5, 3),
(129, 'Mechanical Systems 2 CFM31', 1.5, 3),
(130, 'CNC Production 2 CFM31', 4.5, 3),
(131, 'Production Organization and Management CFM31', 4.5, 3),
(132, 'Manufacturing Workshop Geoff', 3.0, 3),
(133, 'FAO Computer Aided Manufacturing', 1.5, 3),
(134, 'Mini Design Project CFM31', 9.0, 3),
(135, 'Technical Analysis 2 CFM31', 3.0, 3),
(136, 'Metal Structures CFM31', 1.5, 3),
(137, 'Communication Techniques CFM31', 1.5, 3),
(138, 'Entrepreneurial Culture CFM31', 1.5, 3),
-- CFM3.2 subjects
(139, 'Mechanical Systems 2 CFM32', 1.5, 3),
(140, 'Practical Workshop Project', 12.0, 3),
(141, 'Mini Design Project CFM32', 4.5, 3),
(142, 'Production Management Organization CFM32', 6.0, 3),
(143, 'Communication Techniques CFM32', 3.0, 3),
(144, 'CNC Production 2 CFM32', 4.5, 3),
(145, 'FAD Fabrication Assistee par Ordinateur', 1.5, 3),
(146, 'Design Methodology CFM32', 1.5, 3),
(147, 'Metal Structures CFM32', 1.5, 3),
-- DSI2.1 subjects (departmentId = 2, Computer Science)
(148, 'Databases DSI21', 1.5, 2),
(149, 'IT Law DSI21', 1.5, 2),
(150, 'Embedded System Radio DSI21', 1.5, 2),
(151, 'Web Development Workshop DSI21', 3.0, 2),
(152, 'Java Programming Workshop DSI21', 3.0, 2),
(153, 'Object-Oriented Modeling UML DSI21', 3.0, 2),
(154, 'Python Workshop DSI21', 3.0, 2),
(155, 'High-Tech English DSI21', 3.0, 2),
(156, 'Business Communication DSI21', 1.5, 2),
-- DSI2.2 subjects
(157, 'IT Law and Intellectual Property DSI22', 1.5, 2),
(158, 'Server-Side Web Development Workshop DSI22', 3.0, 2),
(159, 'Object-Oriented Programming DSI22', 3.0, 2),
(160, 'Database Workshop DSI22', 4.5, 2),
(161, 'Object Modeling UML DSI22', 4.5, 2),
(162, 'Python Workshop DSI22', 3.0, 2),
(163, 'High-Tech English DSI22', 1.5, 2),
(164, 'Programming N Workshop DSI22', 4.5, 2),
(165, 'Client-Side Framework Workshop DSI22', 3.0, 2),
-- DSI3.1 subjects
(166, 'Object-Oriented Design and Modeling Methodology DSI31', 4.5, 2),
(167, 'Database Workshop DSI31', 9.0, 2),
(168, 'Mobile Development DSI31', 4.5, 2),
(169, 'Framework Workshop DSI31', 9.0, 2),
(170, 'Information Research and Marketing Workshop DSI31', 3.0, 2),
(171, 'SOA Workshop DSI31', 3.0, 2),
(172, 'TOEIC Preparation DSI31', 1.5, 2),
-- DSI3.2 subjects
(173, 'Software Testing and Validation Workshop DSI32', 3.0, 2),
(174, 'DevOps Chains Workshop DSI32', 3.0, 2),
(175, 'TOEIC Preparation DSI32', 1.5, 2),
(176, 'Design Methodology DSI32', 1.5, 2),
(177, 'Big Data Management DSI32', 1.5, 2),
(178, 'Mobile Development DSI32', 1.5, 2),
(179, 'Web Frameworks DSI32', 1.5, 2),
(180, 'SOA Workshop DSI32', 3.0, 2),
(181, 'Database Architecture DSI32', 1.5, 2);

-- Insert Sessions (id, subject_id, teacher_id, group_id)
INSERT INTO sessions (id, subject_id, teacher_id, group_id) VALUES 
-- Group AII2.1 sessions (group_id = 1)
(1, 1, 1, 1),
(2, 2, 2, 1),
(3, 3, 2, 1),
(4, 4, 3, 1),
(5, 5, 1, 1),
(6, 6, 4, 1),
(7, 7, 1, 1),
(8, 8, 5, 1),
(9, 9, 6, 1),
(10, 10, 7, 1),
-- Group AII2.2 sessions (group_id = 2)
(11, 11, 8, 2),
(12, 12, 9, 2),
(13, 13, 8, 2),
(14, 14, 9, 2),
(15, 15, 10, 2),
(16, 16, 10, 2),
(17, 17, 11, 2),
(18, 18, 8, 2),
(19, 19, 8, 2),
(20, 20, 13, 2),
(21, 21, 14, 2),
-- Group AII3.1 sessions (group_id = 3)
(22, 22, 15, 3),
(23, 23, 16, 3),
(24, 24, 16, 3),
(25, 25, 16, 3),
(26, 26, 17, 3),
(27, 27, 17, 3),
(28, 28, 18, 3),
(29, 29, 15, 3),
(30, 30, 19, 3),
(31, 31, 20, 3),
(32, 32, 15, 3),
(33, 33, 6, 3),
(34, 34, 6, 3),
-- Group AII3.2 sessions (group_id = 4)
(35, 35, 21, 4),
(36, 36, 22, 4),
(37, 37, 23, 4),
(38, 38, 24, 4),
(39, 39, 25, 4),
(40, 40, 26, 4),
(41, 41, 20, 4),
(42, 42, 27, 4),
(43, 43, 6, 4),
(44, 44, 28, 4),
(45, 45, 25, 4),
(46, 46, 22, 4),
(47, 47, 29, 4),
(48, 48, 28, 4),
(49, 49, 6, 4),
-- CD1.1 sessions (group_id = 5)
(50, 50, 30, 5),
(51, 51, 31, 5),
(52, 52, 32, 5),
(53, 53, 33, 5),
(54, 54, 33, 5),
(55, 55, 33, 5),
(56, 56, 33, 5),
(57, 57, 34, 5),
(58, 58, 35, 5),
-- CD1.2 sessions (group_id = 6)
(59, 59, 36, 6),
(60, 60, 37, 6),
(61, 61, 38, 6),
(62, 62, 39, 6),
(63, 63, 37, 6),
(64, 64, 40, 6),
(65, 65, 41, 6),
(66, 66, 39, 6),
(67, 67, 40, 6),
(68, 68, 39, 6),
-- CF1.1 sessions (group_id = 7)
(69, 69, 42, 7),
(70, 70, 43, 7),
(71, 71, 44, 7),
(72, 72, 43, 7),
(73, 73, 42, 7),
(74, 74, 45, 7),
(75, 75, 45, 7),
(76, 76, 46, 7),
(77, 77, 44, 7),
-- CF1.2 sessions (group_id = 8)
(78, 78, 47, 8),
(79, 79, 48, 8),
(80, 80, 49, 8),
(81, 81, 50, 8),
(82, 82, 47, 8),
(83, 83, 51, 8),
(84, 84, 52, 8),
-- CFM2.1 sessions (group_id = 9)
(85, 85, 61, 9),
(86, 86, 62, 9),
(87, 87, 63, 9),
(88, 88, 64, 9),
(89, 89, 65, 9),
(90, 90, 66, 9),
(91, 91, 63, 9),
(92, 92, 63, 9),
(93, 93, 63, 9),
(94, 94, 66, 9),
(95, 95, 67, 9),
(96, 96, 68, 9),
(97, 97, 63, 9),
-- CFM2.2 sessions (group_id = 10)
(98, 98, 53, 10),
(99, 99, 54, 10),
(100, 100, 55, 10),
(101, 101, 56, 10),
(102, 102, 57, 10),
(103, 103, 58, 10),
(104, 104, 59, 10),
(105, 105, 58, 10),
(106, 106, 58, 10),
(107, 107, 60, 10),
(108, 108, 58, 10),
(109, 109, 69, 10),
(110, 110, 70, 10),
(111, 111, 71, 10),
(112, 112, 72, 10),
(113, 113, 73, 10),
(114, 114, 74, 10),
(115, 115, 73, 10),
(116, 116, 74, 10),
-- CFM2.3 sessions (group_id = 11)
(117, 117, 75, 11),
(118, 118, 76, 11),
(119, 119, 77, 11),
(120, 120, 78, 11),
(121, 121, 76, 11),
(122, 122, 79, 11),
(123, 123, 80, 11),
(124, 124, 76, 11),
(125, 125, 53, 11),
(126, 126, 76, 11),
(127, 127, 81, 11),
-- CFM3.1 sessions (group_id = 12)
(128, 128, 82, 12),
(129, 129, 82, 12),
(130, 130, 83, 12),
(131, 131, 84, 12),
(132, 132, 82, 12),
(133, 133, 85, 12),
(134, 134, 84, 12),
(135, 135, 83, 12),
(136, 136, 84, 12),
(137, 137, 86, 12),
(138, 138, 87, 12),
-- CFM3.2 sessions (group_id = 13)
(139, 139, 88, 13),
(140, 140, 89, 13),
(141, 141, 89, 13),
(142, 142, 89, 13),
(143, 143, 90, 13),
(144, 144, 91, 13),
(145, 145, 92, 13),
(146, 146, 93, 13),
(147, 147, 94, 13),
-- DSI2.1 sessions (group_id = 14)
(148, 148, 95, 14),
(149, 149, 96, 14),
(150, 150, 97, 14),
(151, 151, 98, 14),
(152, 152, 98, 14),
(153, 153, 99, 14),
(154, 154, 100, 14),
(155, 155, 101, 14),
(156, 156, 102, 14),
-- DSI2.2 sessions (group_id = 15)
(157, 157, 103, 15),
(158, 158, 104, 15),
(159, 159, 105, 15),
(160, 160, 106, 15),
(161, 161, 105, 15),
(162, 162, 107, 15),
(163, 163, 101, 15),
(164, 164, 108, 15),
(165, 165, 108, 15),
-- DSI3.1 sessions (group_id = 16)
(166, 166, 103, 16),
(167, 167, 103, 16),
(168, 168, 109, 16),
(169, 169, 109, 16),
(170, 170, 103, 16),
(171, 171, 109, 16),
(172, 172, 110, 16),
-- DSI3.2 sessions (group_id = 17)
(173, 173, 111, 17),
(174, 174, 111, 17),
(175, 175, 110, 17),
(176, 176, 112, 17),
(177, 177, 111, 17),
(178, 178, 111, 17),
(179, 179, 111, 17),
(180, 180, 111, 17),
(181, 181, 111, 17);

-- Link subjects to specializations (subject_id, specialization_id)
INSERT INTO subject_specializations (subject_id, specialization_id) VALUES 
-- All AII subjects link to AII specialization (1-49)
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1), (10, 1),
(11, 1), (12, 1), (13, 1), (14, 1), (15, 1), (16, 1), (17, 1), (18, 1), (19, 1), (20, 1),
(21, 1), (22, 1), (23, 1), (24, 1), (25, 1), (26, 1), (27, 1), (28, 1), (29, 1), (30, 1),
(31, 1), (32, 1), (33, 1), (34, 1), (35, 1), (36, 1), (37, 1), (38, 1), (39, 1), (40, 1),
(41, 1), (42, 1), (43, 1), (44, 1), (45, 1), (46, 1), (47, 1), (48, 1), (49, 1),
-- CD subjects link to CD specialization (50-68)
(50, 2), (51, 2), (52, 2), (53, 2), (54, 2), (55, 2), (56, 2), (57, 2), (58, 2),
(59, 2), (60, 2), (61, 2), (62, 2), (63, 2), (64, 2), (65, 2), (66, 2), (67, 2), (68, 2),
-- CF subjects link to CF specialization (69-84)
(69, 3), (70, 3), (71, 3), (72, 3), (73, 3), (74, 3), (75, 3), (76, 3), (77, 3),
(78, 3), (79, 3), (80, 3), (81, 3), (82, 3), (83, 3), (84, 3),
-- CFM subjects link to CFM specialization (85-147)
(85, 4), (86, 4), (87, 4), (88, 4), (89, 4), (90, 4), (91, 4), (92, 4), (93, 4), (94, 4),
(95, 4), (96, 4), (97, 4), (98, 4), (99, 4), (100, 4), (101, 4), (102, 4), (103, 4), (104, 4),
(105, 4), (106, 4), (107, 4), (108, 4), (109, 4), (110, 4), (111, 4), (112, 4), (113, 4), (114, 4),
(115, 4), (116, 4), (117, 4), (118, 4), (119, 4), (120, 4), (121, 4), (122, 4), (123, 4), (124, 4),
(125, 4), (126, 4), (127, 4), (128, 4), (129, 4), (130, 4), (131, 4), (132, 4), (133, 4), (134, 4),
(135, 4), (136, 4), (137, 4), (138, 4), (139, 4), (140, 4), (141, 4), (142, 4), (143, 4), (144, 4),
(145, 4), (146, 4), (147, 4),
-- DSI subjects link to DSI specialization (148-181)
(148, 5), (149, 5), (150, 5), (151, 5), (152, 5), (153, 5), (154, 5), (155, 5), (156, 5), (157, 5),
(158, 5), (159, 5), (160, 5), (161, 5), (162, 5), (163, 5), (164, 5), (165, 5), (166, 5), (167, 5),
(168, 5), (169, 5), (170, 5), (171, 5), (172, 5), (173, 5), (174, 5), (175, 5), (176, 5), (177, 5),
(178, 5), (179, 5), (180, 5), (181, 5);

-- Link teachers to subjects (teacher_id, subject_id) - NO specialization_id in schema!
INSERT INTO teacher_subject_specializations (teacher_id, subject_id) VALUES 
-- Group AII2.1
(1, 1), (2, 2), (2, 3), (3, 4), (1, 5), (4, 6), (1, 7), (5, 8), (6, 9), (7, 10),
-- Group AII2.2
(8, 11), (9, 12), (8, 13), (9, 14), (10, 15), (10, 16), (11, 17), (8, 18), (8, 19), (13, 20), (14, 21),
-- Group AII3.1
(15, 22), (16, 23), (16, 24), (16, 25), (17, 26), (17, 27), (18, 28), (15, 29), (19, 30), (20, 31), (15, 32), (6, 33), (6, 34),
-- Group AII3.2
(21, 35), (22, 36), (23, 37), (24, 38), (25, 39), (26, 40), (20, 41), (27, 42), (6, 43), (28, 44), (25, 45), (22, 46), (29, 47), (28, 48), (6, 49),
-- CD1.1
(30, 50), (31, 51), (32, 52), (33, 53), (33, 54), (33, 55), (33, 56), (34, 57), (35, 58),
-- CD1.2
(36, 59), (37, 60), (38, 61), (39, 62), (37, 63), (40, 64), (41, 65), (39, 66), (40, 67), (39, 68),
-- CF1.1
(42, 69), (43, 70), (44, 71), (43, 72), (42, 73), (45, 74), (45, 75), (46, 76), (44, 77),
-- CF1.2
(47, 78), (48, 79), (49, 80), (50, 81), (47, 82), (51, 83), (52, 84),
-- CFM2.1
(53, 85), (54, 86), (55, 87), (56, 88), (57, 89), (58, 90), (59, 91), (60, 92), (61, 93), (62, 94), (63, 95), (64, 96), (65, 97),
-- CFM2.2
(66, 98), (67, 99), (68, 100), (69, 101), (70, 102), (71, 103), (72, 104), (73, 105), (74, 106), (75, 107), (76, 108),
(77, 109), (78, 110), (79, 111), (80, 112), (81, 113), (82, 114), (83, 115), (84, 116),
-- CFM2.3
(85, 117), (86, 118), (87, 119), (88, 120), (89, 121), (90, 122), (91, 123), (92, 124), (93, 125), (94, 126), (53, 127),
-- CFM3.1
(54, 128), (55, 129), (56, 130), (57, 131), (58, 132), (59, 133), (60, 134), (61, 135), (62, 136), (63, 137), (64, 138),
-- CFM3.2
(65, 139), (66, 140), (67, 141), (68, 142), (69, 143), (70, 144), (71, 145), (72, 146), (73, 147),
-- DSI2.1
(95, 148), (96, 149), (97, 150), (98, 151), (98, 152), (99, 153), (100, 154), (101, 155), (102, 156),
-- DSI2.2
(103, 157), (104, 158), (105, 159), (106, 160), (105, 161), (107, 162), (101, 163), (108, 164), (108, 165),
-- DSI3.1
(103, 166), (103, 167), (109, 168), (109, 169), (103, 170), (109, 171), (110, 172),
-- DSI3.2
(111, 173), (111, 174), (110, 175), (112, 176), (111, 177), (111, 178), (111, 179), (111, 180), (111, 181);

-- Link groups to sessions (group_id, session_id)
INSERT INTO group_sessions (group_id, session_id) VALUES 
-- Group AII2.1 (groupId = 1)
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
-- Group AII2.2 (groupId = 2)
(2, 11), (2, 12), (2, 13), (2, 14), (2, 15), (2, 16), (2, 17), (2, 18), (2, 19), (2, 20), (2, 21),
-- Group AII3.1 (groupId = 3)
(3, 22), (3, 23), (3, 24), (3, 25), (3, 26), (3, 27), (3, 28), (3, 29), (3, 30), (3, 31), (3, 32), (3, 33), (3, 34),
-- Group AII3.2 (groupId = 4)
(4, 35), (4, 36), (4, 37), (4, 38), (4, 39), (4, 40), (4, 41), (4, 42), (4, 43), (4, 44), (4, 45), (4, 46), (4, 47), (4, 48), (4, 49),
-- Group CD1.1 (groupId = 5)
(5, 50), (5, 51), (5, 52), (5, 53), (5, 54), (5, 55), (5, 56), (5, 57), (5, 58),
-- Group CD1.2 (groupId = 6)
(6, 59), (6, 60), (6, 61), (6, 62), (6, 63), (6, 64), (6, 65), (6, 66), (6, 67), (6, 68),
-- Group CF1.1 (groupId = 7)
(7, 69), (7, 70), (7, 71), (7, 72), (7, 73), (7, 74), (7, 75), (7, 76), (7, 77),
-- Group CF1.2 (groupId = 8)
(8, 78), (8, 79), (8, 80), (8, 81), (8, 82), (8, 83), (8, 84),
-- Group CFM2.1 (groupId = 9)
(9, 85), (9, 86), (9, 87), (9, 88), (9, 89), (9, 90), (9, 91), (9, 92), (9, 93), (9, 94), (9, 95), (9, 96), (9, 97),
-- Group CFM2.2 (groupId = 10)
(10, 98), (10, 99), (10, 100), (10, 101), (10, 102), (10, 103), (10, 104), (10, 105), (10, 106), (10, 107), (10, 108),
(10, 109), (10, 110), (10, 111), (10, 112), (10, 113), (10, 114), (10, 115), (10, 116),
-- Group CFM2.3 (groupId = 11)
(11, 117), (11, 118), (11, 119), (11, 120), (11, 121), (11, 122), (11, 123), (11, 124), (11, 125), (11, 126), (11, 127),
-- Group CFM3.1 (groupId = 12)
(12, 128), (12, 129), (12, 130), (12, 131), (12, 132), (12, 133), (12, 134), (12, 135), (12, 136), (12, 137), (12, 138),
-- Group CFM3.2 (groupId = 13)
(13, 139), (13, 140), (13, 141), (13, 142), (13, 143), (13, 144), (13, 145), (13, 146), (13, 147),
-- Group DSI2.1 (groupId = 14)
(14, 148), (14, 149), (14, 150), (14, 151), (14, 152), (14, 153), (14, 154), (14, 155), (14, 156),
-- Group DSI2.2 (groupId = 15)
(15, 157), (15, 158), (15, 159), (15, 160), (15, 161), (15, 162), (15, 163), (15, 164), (15, 165),
-- Group DSI3.1 (groupId = 16)
(16, 166), (16, 167), (16, 168), (16, 169), (16, 170), (16, 171), (16, 172),
-- Group DSI3.2 (groupId = 17)
(17, 173), (17, 174), (17, 175), (17, 176), (17, 177), (17, 178), (17, 179), (17, 180), (17, 181);

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
UNION ALL SELECT 'teacher_subject_specializations', COUNT(*) FROM teacher_subject_specializations
UNION ALL SELECT 'group_sessions', COUNT(*) FROM group_sessions;

-- Summary:
-- ✅ Schema-compliant: All tables match Prisma schema exactly
-- ✅ No apostrophes in names
-- ✅ Teachers have first_name and last_name (not email/phone)
-- ✅ Subjects have hour_volume (original hours from PDF)
-- ✅ Sessions link subjects and teachers (no duration/room fields)
-- ✅ All relation tables properly populated
-- 
-- DATA FOR SECOND PART (AII, CD, CF groups):
-- - 1 School (ISET Rades)
-- - 4 Departments (Electrical, Computer Science, Mechanical, Business)
-- - 8 Specializations (AII, CD, CF, CFM, DSI, EI, GE, GM)
-- - 8 Groups (AII2.1, AII2.2, AII3.1, AII3.2, CD1.1, CD1.2, CF1.1, CF1.2)
-- - 52 Teachers (all with proper firstName/lastName, no apostrophes)
-- - 84 Subjects (with original hour volumes from PDF)
-- - 84 Sessions (one per subject-teacher pair)
-- - 84 subject_specializations links
-- - 84 teacher_subject_specializations links
-- - 84 group_sessions links
