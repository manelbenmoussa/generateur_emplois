# University Timetable Data Import Summary

## 📊 Complete Database Structure

### Overview

This SQL script creates a complete real university timetable dataset with **301 sessions** across **28 groups** in **8 specializations**.

---

## 🎓 Specializations & Groups

### 1. **AII** - Automatisme Informatique Industrielle (Electrical/Computer Science)

- **4 groups**: AII2.1, AII2.2, AII3.1, AII3.2
- **50 subjects** total
- **28 teachers**

### 2. **CD** - Commerce et Distribution (Business)

- **2 groups**: CD1.1, CD1.2
- **20 subjects** total
- **12 teachers**

### 3. **CF** - Comptabilité et Finance (Accounting & Finance)

- **2 groups**: CF1.1, CF1.2
- **16 subjects** total
- **11 teachers**

### 4. **CFM** - Conception et Fabrication Mécanique (Mechanical Engineering)

- **5 groups**: CFM2.1, CFM2.2, CFM2.3, CFM3.1, CFM3.2
- **62 subjects** total
- **40 teachers**

### 5. **DSI** - Développement des Systèmes d'Information (Computer Science)

- **4 groups**: DSI2.1, DSI2.2, DSI3.1, DSI3.2
- **34 subjects** total
- **19 teachers**

### 6. **EI** - Electrical Engineering (Advanced)

- **3 groups**: EI2.1, EI3.1, GE1.2
- **31 subjects** total
- **17 teachers**

### 7. **GE** - Génie Électrique (Electrical Engineering Foundations)

- **4 groups**: GE1.1, GE1.3, GE1.4, GE1.5
- **53 subjects** total
- **25 teachers**

### 8. **GM** - Génie Mécanique (Mechanical Engineering Foundations)

- **4 groups**: GM1.1, GM1.2, GM1.3, GM1.4
- **35 subjects** total
- **15 teachers**

---

## 📈 Database Statistics

| Metric                              | Count |
| ----------------------------------- | ----- |
| **Schools**                         | 1     |
| **Specializations**                 | 8     |
| **Groups**                          | 28    |
| **Teachers**                        | 167   |
| **Rooms**                           | 20    |
| **Subjects**                        | 301   |
| **Sessions**                        | 301   |
| **Teacher-Specialization Mappings** | ~400+ |

---

## 🏫 Resource Details

### Rooms (20 total)

- **Standard Classrooms**: 9 rooms (Rooms A101-A103, B201-B203, C301-C302, D401)
- **Large Rooms**: 5 rooms (D402, E501-E502, and others)
- **Labs**: 4 labs (Lab 1-4) - capacity 30 each
- **Workshops**: 3 workshops (Workshop 1-3) - capacity 25 each
- **Amphitheater**: 1 (capacity 100)

### Teachers (167 total)

All teachers are assigned with:

- Unique email addresses
- Subject-specialization mappings
- Multiple subjects for some teachers (shared across groups)

---

## ⏰ Scheduling Constraints

### Time Structure

- **Days per week**: 5 (Monday-Friday)
- **Time slots per day**: 6
- **Total available slots**: 30 per week
- **Time slots**:
  - 08:00-10:00
  - 10:00-12:00
  - 12:00-14:00
  - 14:00-16:00
  - 16:00-18:00
  - 18:00-19:00

### Course Load

- **Hour volumes**: Range from 1h to 18h per week per subject
- **Workshop sessions**: Typically 3-18 hours (indicated with 🔧)
- **Theory sessions**: Typically 1.5-6 hours
- **Average**: ~2-4 hours per subject

---

## 🚀 How to Use

### 1. Execute the SQL Script

```sql
-- Run in your PostgreSQL database
psql -U your_username -d your_database -f seed-data.sql
```

### 2. Verify the Import

```sql
-- Check all tables
SELECT COUNT(*) as total_schools FROM "School"; -- Expected: 1
SELECT COUNT(*) as total_teachers FROM "Teacher"; -- Expected: 167
SELECT COUNT(*) as total_rooms FROM "Room"; -- Expected: 20
SELECT COUNT(*) as total_specializations FROM "Specialization"; -- Expected: 8
SELECT COUNT(*) as total_groups FROM "Group"; -- Expected: 28
SELECT COUNT(*) as total_subjects FROM "Subject"; -- Expected: 301
SELECT COUNT(*) as total_sessions FROM "Session"; -- Expected: 301
```

### 3. Test the Genetic Algorithm

After importing, use the `/api/generate-timetable` endpoint to generate optimized timetables.

---

## 🎯 Genetic Algorithm Testing

This dataset provides an **excellent real-world test** for the genetic algorithm:

### Complexity Factors

✅ **301 sessions** to schedule across **30 time slots**  
✅ **Multiple constraints**:

- No teacher conflicts (167 teachers teaching various combinations)
- No room conflicts (20 rooms available)
- No student conflicts (28 groups)
- Soft constraints: minimum 2 sessions/day, minimize gaps, teacher max hours

✅ **Real university data** with authentic course structures  
✅ **Varying hour volumes** (1-18 hours per week)  
✅ **Workshop sessions** requiring special room types

### Expected Behavior

- The algorithm should handle this realistic dataset
- If scheduling fails, error messages will identify:
  - Insufficient rooms
  - Teacher overload
  - Impossible constraint combinations
  - Suggested parameter adjustments

---

## 📝 Notes

### Data Source

- Based on real university timetables for **Semester 1, 2025-2026**
- Includes courses from **Electrical Engineering**, **Mechanical Engineering**, **Computer Science**, and **Business** departments

### Naming Conventions

- All tables use **PascalCase** (Prisma convention)
- French course names preserved for authenticity
- Teacher names anonymized but realistic

### Data Quality

✅ All foreign keys properly linked  
✅ No duplicate entries  
✅ All teachers assigned to appropriate specializations  
✅ Hour volumes match original PDF data  
✅ Workshop indicators preserved

---

## 🔧 Maintenance

### Adding More Data

To add additional groups or subjects:

1. Add teachers to the `Teacher` table
2. Add subjects to the `Subject` table with correct `specializationId`
3. Add groups to the `Group` table
4. Create sessions linking groups, subjects, and teachers
5. Map teachers to specializations in `TeacherSpecialization`

### Modifying Constraints

Edit `constants/schedule.ts` to adjust:

- Available days
- Time slots
- Maximum teacher hours
- Other scheduling parameters

---

## 📞 Support

If you encounter any issues:

1. Check foreign key constraints are satisfied
2. Verify sequence IDs start from 1
3. Ensure all referenced IDs exist
4. Review Prisma schema matches SQL structure

---

**Generated**: November 2, 2025  
**Total Records**: 301 sessions, 167 teachers, 28 groups, 8 specializations
