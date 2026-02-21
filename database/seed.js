const { initDB, prepare, exec } = require('./db');

async function seed() {
    console.log('🌱 Seeding database...');
    await initDB();

    // ── Clear all tables (reverse FK order) ─────────────────────────────
    exec('DELETE FROM classroom_amenities');
    exec('DELETE FROM reservations');
    exec('DELETE FROM timetable');
    exec('DELETE FROM faculty');
    exec('DELETE FROM courses');
    exec('DELETE FROM amenities');
    exec('DELETE FROM classrooms');
    exec('DELETE FROM departments');
    exec('DELETE FROM time_slots');
    exec('DELETE FROM blocks');

    // ── MODULE 1: Blocks ─────────────────────────────────────────────────
    const blocksData = [
        { id: 'A', name: 'Alpha Block', description: 'Main academic building – Sciences & Engineering' },
        { id: 'B', name: 'Beta Block', description: 'Technology & Computer Science wing' },
        { id: 'C', name: 'Gamma Block', description: 'Humanities & Management wing' },
        { id: 'D', name: 'Delta Block', description: 'Laboratories & Research wing' }
    ];
    const insertBlock = prepare('INSERT INTO blocks (id, name, description) VALUES (?, ?, ?)');
    blocksData.forEach(b => insertBlock.run(b.id, b.name, b.description));
    console.log('✅ Blocks created');

    // ── MODULE 2: Departments ────────────────────────────────────────────
    const departmentsData = [
        { name: 'Computer Science & Engineering', block_id: 'B' },
        { name: 'Electronics & Communication', block_id: 'A' },
        { name: 'Mechanical Engineering', block_id: 'A' },
        { name: 'Business Administration', block_id: 'C' }
    ];
    const insertDept = prepare('INSERT INTO departments (name, block_id) VALUES (?, ?)');
    departmentsData.forEach(d => insertDept.run(d.name, d.block_id));
    // dept IDs: 1=CSE, 2=ECE, 3=MECH, 4=BBA
    console.log('✅ Departments created');

    // ── MODULE 3: Classrooms ─────────────────────────────────────────────
    // 20 rooms across 4 blocks, 3 floors each (floors 0–2)
    const roomConfig = [
        { block: 'A', roomsPerFloor: 3, capBase: 60 },
        { block: 'B', roomsPerFloor: 3, capBase: 50 },
        { block: 'C', roomsPerFloor: 2, capBase: 40 },
        { block: 'D', roomsPerFloor: 2, capBase: 30 }
    ];
    const insertRoom = prepare('INSERT INTO classrooms (id, block_id, floor, capacity) VALUES (?, ?, ?, ?)');
    roomConfig.forEach(({ block, roomsPerFloor, capBase }) => {
        for (let floor = 0; floor <= 2; floor++) {
            for (let r = 1; r <= roomsPerFloor; r++) {
                const id = `${block}${floor}0${r}`;
                const capacity = capBase + (r - 1) * 10;
                insertRoom.run(id, block, floor, capacity);
            }
        }
    });
    console.log('✅ Classrooms created');

    // ── MODULE 4: Time Slots ─────────────────────────────────────────────
    const timeSlotsData = [
        { id: 1, start: '08:00', end: '09:00', label: 'Period 1' },
        { id: 2, start: '09:00', end: '10:00', label: 'Period 2' },
        { id: 3, start: '10:15', end: '11:15', label: 'Period 3' },
        { id: 4, start: '11:15', end: '12:15', label: 'Period 4' },
        { id: 5, start: '13:00', end: '14:00', label: 'Period 5' },
        { id: 6, start: '14:00', end: '15:00', label: 'Period 6' },
        { id: 7, start: '15:15', end: '16:15', label: 'Period 7' },
        { id: 8, start: '16:15', end: '17:15', label: 'Period 8' },
        { id: 9, start: '17:15', end: '19:30', label: 'Period 9 (Evening)' }
    ];
    const insertSlot = prepare('INSERT INTO time_slots (id, start_time, end_time, label) VALUES (?, ?, ?, ?)');
    timeSlotsData.forEach(s => insertSlot.run(s.id, s.start, s.end, s.label));
    console.log('✅ Time slots created');

    // ── MODULE 9: Amenities ──────────────────────────────────────────────
    const amenitiesData = ['Projector', 'Air Conditioning', 'Smart Board', 'Whiteboard', 'Lab Equipment'];
    const insertAmenity = prepare('INSERT INTO amenities (name) VALUES (?)');
    amenitiesData.forEach(a => insertAmenity.run(a));
    // amenity IDs: 1=Projector, 2=AC, 3=SmartBoard, 4=Whiteboard, 5=LabEquip
    console.log('✅ Amenities created');

    // ── MODULE 5: Courses ────────────────────────────────────────────────
    const coursesData = [
        { code: 'CS101', name: 'Data Structures', dept: 1 },
        { code: 'CS102', name: 'Database Systems', dept: 1 },
        { code: 'CS103', name: 'Machine Learning', dept: 1 },
        { code: 'CS104', name: 'Computer Networks', dept: 1 },
        { code: 'EC101', name: 'Digital Electronics', dept: 2 },
        { code: 'EC102', name: 'Signal Processing', dept: 2 },
        { code: 'EC103', name: 'Embedded Systems', dept: 2 },
        { code: 'ME101', name: 'Engineering Mechanics', dept: 3 },
        { code: 'ME102', name: 'Thermodynamics', dept: 3 },
        { code: 'ME103', name: 'Manufacturing Processes', dept: 3 },
        { code: 'BA101', name: 'Business Communication', dept: 4 },
        { code: 'BA102', name: 'Financial Management', dept: 4 }
    ];
    const insertCourse = prepare('INSERT INTO courses (code, name, department_id) VALUES (?, ?, ?)');
    coursesData.forEach(c => insertCourse.run(c.code, c.name, c.dept));
    console.log('✅ Courses created');

    // ── MODULE 6: Faculty ────────────────────────────────────────────────
    const facultyData = [
        { name: 'Dr. Arjun Sharma', dept: 1 },
        { name: 'Prof. Priya Nair', dept: 1 },
        { name: 'Dr. Ravi Menon', dept: 2 },
        { name: 'Prof. Sunita Joshi', dept: 2 },
        { name: 'Dr. Kiran Patel', dept: 3 },
        { name: 'Prof. Anita Verma', dept: 3 },
        { name: 'Dr. Suresh Rao', dept: 4 },
        { name: 'Prof. Meena Iyer', dept: 4 }
    ];
    const insertFaculty = prepare('INSERT INTO faculty (name, department_id) VALUES (?, ?)');
    facultyData.forEach(f => insertFaculty.run(f.name, f.dept));
    console.log('✅ Faculty created');

    // ── MODULE 7: Timetable ──────────────────────────────────────────────
    // Map blocks to department course/faculty pools
    const blockSchedule = {
        'A': { courseIds: [5, 6, 7, 8, 9, 10], facultyIds: [3, 4, 5, 6] },
        'B': { courseIds: [1, 2, 3, 4], facultyIds: [1, 2] },
        'C': { courseIds: [11, 12], facultyIds: [7, 8] },
        'D': { courseIds: [1, 5, 8], facultyIds: [1, 3, 5] }
    };
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const insertTimetable = prepare(
        'INSERT INTO timetable (room_id, slot_id, course_id, faculty_id, day) VALUES (?, ?, ?, ?, ?)'
    );
    const allRooms = prepare('SELECT id, block_id FROM classrooms').all();

    allRooms.forEach(room => {
        const pool = blockSchedule[room.block_id] || blockSchedule['B'];
        days.forEach(day => {
            const numClasses = 3 + Math.floor(Math.random() * 3); // 3–5 per day
            const usedSlots = new Set();
            for (let i = 0; i < numClasses; i++) {
                let slotId;
                let attempts = 0;
                do {
                    slotId = Math.floor(Math.random() * 8) + 1; // periods 1–8
                    attempts++;
                } while (usedSlots.has(slotId) && attempts < 20);
                if (usedSlots.has(slotId)) continue;
                usedSlots.add(slotId);

                const courseId = pool.courseIds[Math.floor(Math.random() * pool.courseIds.length)];
                const facultyId = pool.facultyIds[Math.floor(Math.random() * pool.facultyIds.length)];
                insertTimetable.run(room.id, slotId, courseId, facultyId, day);
            }
        });
    });
    console.log('✅ Timetable created');

    // ── MODULE 8: Reservations ───────────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const insertReservation = prepare(
        'INSERT INTO reservations (room_id, slot_id, date, purpose, booked_by) VALUES (?, ?, ?, ?, ?)'
    );
    const sampleReservations = [
        { room: 'A101', slot: 6, purpose: 'Faculty Meeting', by: 'Admin Office' },
        { room: 'B201', slot: 7, purpose: 'Workshop', by: 'Prof. Priya Nair' },
        { room: 'C101', slot: 5, purpose: 'Guest Lecture', by: 'HOD Office' },
        { room: 'D001', slot: 9, purpose: 'Evening Lab', by: 'Dr. Kiran Patel' },
        { room: 'A201', slot: 9, purpose: 'Study Group', by: 'Students Union' }
    ];
    sampleReservations.forEach(res => {
        insertReservation.run(res.room, res.slot, today, res.purpose, res.by);
    });
    console.log('✅ Reservations created');

    // ── MODULE 10: Classroom–Amenities Mapping ───────────────────────────
    // Block A → Projector(1), AC(2), Whiteboard(4)
    // Block B → Projector(1), Smart Board(3), AC(2)
    // Block C → Projector(1), Whiteboard(4)
    // Block D → Lab Equipment(5), AC(2)
    const blockAmenities = {
        'A': [1, 2, 4],
        'B': [1, 2, 3],
        'C': [1, 4],
        'D': [2, 5]
    };
    const insertMapping = prepare(
        'INSERT OR IGNORE INTO classroom_amenities (classroom_id, amenity_id) VALUES (?, ?)'
    );
    allRooms.forEach(room => {
        const amenIds = blockAmenities[room.block_id] || [1, 4];
        amenIds.forEach(amenityId => insertMapping.run(room.id, amenityId));
    });
    console.log('✅ Classroom–Amenities mapped');

    console.log('\n🎉 Database seeding complete! All 10 modules populated.');
}

// Export for use by server.js auto-seed
module.exports = { seed };

// Run directly when called via CLI: node database/seed.js
if (require.main === module) {
    seed().catch(console.error);
}
