# Simple greedy timetable generator for demo purposes
from typing import Dict, Any, List


def greedy_timetable(data: Dict[str, Any]) -> List[dict]:
    # This is a placeholder: just assign each session to the first available teacher, room, and slot
    sessions = data.get("sessions", [])
    teachers = data.get("teachers", [])
    rooms = data.get("rooms", [])
    import json
    import sys

    print(f"[DEBUG] Teachers count: {len(teachers)}", file=sys.stderr)
    print(f"[DEBUG] Teachers sample: {teachers[:3]}", file=sys.stderr)
    print(f"[DEBUG] Sessions count: {len(sessions)}", file=sys.stderr)
    print(f"[DEBUG] Sessions sample: {sessions[:3]}", file=sys.stderr)
    if not teachers:
        print(
            "[WARNING] No teachers provided in payload! Cannot assign teachers.",
            file=sys.stderr,
        )
    schedule_config = data.get("scheduleConfig") or {}
    # scheduleConfig may contain JSON strings (from DB) or already-parsed arrays (from assembleAllEntitiesForSchool)
    raw_days = schedule_config.get("days", [])
    if isinstance(raw_days, str):
        days = json.loads(raw_days)
    else:
        days = raw_days or []

    raw_time_slots = schedule_config.get("timeSlots", [])
    if isinstance(raw_time_slots, str):
        time_slots = json.loads(raw_time_slots)
    else:
        time_slots = raw_time_slots or []

    assignments = []
    unschedulable = []
    import traceback

    # Track group sessions per day for gap and orphan checks
    group_day_slots = {}
    used_slots = {}
    from collections import defaultdict

    # Build subject_map for quick lookup
    subject_map = {s["id"]: s for s in data.get("subjects", [])}
    # Track teacher day count for possible future constraints (not strictly needed here)
    teacher_day_count = defaultdict(lambda: defaultdict(int))

    for i, session in enumerate(sessions):
        try:
            eligible_teachers = [
                t
                for t in teachers
                if t.get("specializedSubjectIds")
                and session["subjectId"] in t["specializedSubjectIds"]
            ]
            if not eligible_teachers:
                unschedulable.append(session)
                continue

            subject = subject_map.get(session["subjectId"])
            name = subject["name"] if subject and "name" in subject else ""
            slots_needed = 2 if "workshop" in name.lower() else 1

            assigned = False
            for day in days:
                if day == "Saturday":
                    continue
                found_soft = False
                for teacher in eligible_teachers:
                    for slot_idx in range(len(time_slots) - (slots_needed - 1)):
                        # Try to satisfy no-gaps (adjacency) constraint first
                        slots_ok = True
                        prefers_adjacent = True
                        for offset in range(slots_needed):
                            slot_key = (teacher["id"], day, slot_idx + offset)
                            group_key = (session["groupId"], day, slot_idx + offset)
                            room = rooms[i % len(rooms)] if rooms else None
                            room_key = (
                                (room["id"], day, slot_idx + offset) if room else None
                            )
                            prev_slot = (session["groupId"], day, slot_idx + offset - 1)
                            next_slot = (session["groupId"], day, slot_idx + offset + 1)
                            group_slots_today = group_day_slots.get(
                                (session["groupId"], day), set()
                            )
                            if (
                                used_slots.get(slot_key)
                                or used_slots.get(group_key)
                                or (room_key and used_slots.get(room_key))
                            ):
                                slots_ok = False
                                break
                            # Only prefer adjacency, not require it
                            if group_slots_today and not (
                                prev_slot in group_slots_today
                                or next_slot in group_slots_today
                            ):
                                prefers_adjacent = False
                        if slots_ok and prefers_adjacent:
                            for offset in range(slots_needed):
                                slot = time_slots[slot_idx + offset]
                                room = rooms[i % len(rooms)] if rooms else None
                                assignment = {
                                    "sessionId": session["id"],
                                    "subjectId": session["subjectId"],
                                    "groupId": session["groupId"],
                                    "teacherId": teacher["id"],
                                    "roomId": room["id"] if room else None,
                                    "day": day,
                                    "startTime": slot["startTime"],
                                    "endTime": slot["endTime"],
                                }
                                assignments.append(assignment)
                                used_slots[(teacher["id"], day, slot_idx + offset)] = (
                                    True
                                )
                                used_slots[
                                    (session["groupId"], day, slot_idx + offset)
                                ] = True
                                if room:
                                    used_slots[(room["id"], day, slot_idx + offset)] = (
                                        True
                                    )
                                group_day_slots.setdefault(
                                    (session["groupId"], day), set()
                                ).add(slot_idx + offset)
                            teacher_day_count[teacher["id"]][day] += slots_needed
                            assigned = True
                            found_soft = True
                            break
                    if assigned:
                        break
                if assigned:
                    break
                # If not found with adjacency, try again without adjacency preference
                if not found_soft:
                    for teacher in eligible_teachers:
                        for slot_idx in range(len(time_slots) - (slots_needed - 1)):
                            slots_ok = True
                            for offset in range(slots_needed):
                                slot_key = (teacher["id"], day, slot_idx + offset)
                                group_key = (session["groupId"], day, slot_idx + offset)
                                room = rooms[i % len(rooms)] if rooms else None
                                room_key = (
                                    (room["id"], day, slot_idx + offset)
                                    if room
                                    else None
                                )
                                if (
                                    used_slots.get(slot_key)
                                    or used_slots.get(group_key)
                                    or (room_key and used_slots.get(room_key))
                                ):
                                    slots_ok = False
                                    break
                            if slots_ok:
                                for offset in range(slots_needed):
                                    slot = time_slots[slot_idx + offset]
                                    room = rooms[i % len(rooms)] if rooms else None
                                    assignment = {
                                        "sessionId": session["id"],
                                        "subjectId": session["subjectId"],
                                        "groupId": session["groupId"],
                                        "teacherId": teacher["id"],
                                        "roomId": room["id"] if room else None,
                                        "day": day,
                                        "startTime": slot["startTime"],
                                        "endTime": slot["endTime"],
                                    }
                                    assignments.append(assignment)
                                    used_slots[
                                        (teacher["id"], day, slot_idx + offset)
                                    ] = True
                                    used_slots[
                                        (session["groupId"], day, slot_idx + offset)
                                    ] = True
                                    if room:
                                        used_slots[
                                            (room["id"], day, slot_idx + offset)
                                        ] = True
                                    group_day_slots.setdefault(
                                        (session["groupId"], day), set()
                                    ).add(slot_idx + offset)
                                teacher_day_count[teacher["id"]][day] += slots_needed
                                assigned = True
                                break
                        if assigned:
                            break
                    if assigned:
                        break
            if not assigned:
                for teacher in eligible_teachers:
                    for slot_idx in range(len(time_slots) - (slots_needed - 1)):
                        slots_ok = True
                        for offset in range(slots_needed):
                            slot_key = (teacher["id"], "Saturday", slot_idx + offset)
                            group_key = (
                                session["groupId"],
                                "Saturday",
                                slot_idx + offset,
                            )
                            room = rooms[i % len(rooms)] if rooms else None
                            room_key = (
                                (room["id"], "Saturday", slot_idx + offset)
                                if room
                                else None
                            )
                            prev_slot = (
                                session["groupId"],
                                "Saturday",
                                slot_idx + offset - 1,
                            )
                            next_slot = (
                                session["groupId"],
                                "Saturday",
                                slot_idx + offset + 1,
                            )
                            group_slots_today = group_day_slots.get(
                                (session["groupId"], "Saturday"), set()
                            )
                            if (
                                used_slots.get(slot_key)
                                or used_slots.get(group_key)
                                or (room_key and used_slots.get(room_key))
                            ):
                                slots_ok = False
                                break
                            if group_slots_today and not (
                                prev_slot in group_slots_today
                                or next_slot in group_slots_today
                            ):
                                slots_ok = False
                                break
                        if slots_ok:
                            for offset in range(slots_needed):
                                slot = time_slots[slot_idx + offset]
                                room = rooms[i % len(rooms)] if rooms else None
                                assignment = {
                                    "sessionId": session["id"],
                                    "subjectId": session["subjectId"],
                                    "groupId": session["groupId"],
                                    "teacherId": teacher["id"],
                                    "roomId": room["id"] if room else None,
                                    "day": "Saturday",
                                    "startTime": slot["startTime"],
                                    "endTime": slot["endTime"],
                                }
                                assignments.append(assignment)
                                used_slots[
                                    (teacher["id"], "Saturday", slot_idx + offset)
                                ] = True
                                used_slots[
                                    (session["groupId"], "Saturday", slot_idx + offset)
                                ] = True
                                if room:
                                    used_slots[
                                        (room["id"], "Saturday", slot_idx + offset)
                                    ] = True
                                group_day_slots.setdefault(
                                    (session["groupId"], "Saturday"), set()
                                ).add(slot_idx + offset)
                            teacher_day_count[teacher["id"]]["Saturday"] += slots_needed
                            assigned = True
                            break
                    if assigned:
                        break
            if not assigned:
                unschedulable.append(session)
        except Exception as e:
            print(f"[ERROR] Failed to assign session: {session}", file=sys.stderr)
            print(f"[ERROR] Exception: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            raise

    # Remove orphan (single) sessions for any group on any day
    # Attempt to rescue orphan group-days by moving another session of the same group into that day
    group_day_assignments = defaultdict(list)
    for a in assignments:
        group_day_assignments[(a["groupId"], a["day"])].append(a)

    # Map sessionId -> list of its assignment entries (these are contiguous offsets for workshops)
    # Build this mapping early because helper functions below rely on it.
    session_assignments = defaultdict(list)
    for a in assignments:
        session_assignments[a["sessionId"]].append(a)

    def find_slot_index_by_time(start_time: str):
        for idx, s in enumerate(time_slots):
            if s.get("startTime") == start_time:
                return idx
        return None

    def removal_creates_gap_or_orphan(candidate_or_session, mapping):
        # Determine if removing candidate from its original day would create an orphan or break adjacency
        # candidate_or_session can be either an assignment entry or a sessionId
        if isinstance(candidate_or_session, (str, int)):
            session_id = candidate_or_session
            entries = session_assignments.get(session_id, [])
            if not entries:
                return False
            candidate = entries[0]
        else:
            candidate = candidate_or_session
            session_id = candidate.get("sessionId")

        key = (candidate["groupId"], candidate["day"])
        sessions_for_day = mapping.get(key, [])
        if len(sessions_for_day) <= 1:
            # Removing last/only session would create an empty day -> treat as breaking constraint
            return True
        # Removing a whole session: find all indices belonging to the session
        entries = session_assignments.get(session_id, [])
        session_indices = [find_slot_index_by_time(e.get("startTime")) for e in entries]
        session_indices = [i for i in session_indices if i is not None]
        if not session_indices:
            return True
        indices = [
            find_slot_index_by_time(s.get("startTime"))
            for s in sessions_for_day
            if find_slot_index_by_time(s.get("startTime")) is not None
        ]
        for idx in session_indices:
            if idx in indices:
                indices.remove(idx)
        if len(indices) == 0:
            return True
        # Check adjacency: indices should be consecutive
        indices_sorted = sorted(indices)
        if indices_sorted[-1] - indices_sorted[0] + 1 != len(indices_sorted):
            # Not contiguous => gap
            return True
        return False

    def removal_severity(session_id, mapping):
        """Return severity of removing a session: 0=no problem, 1=creates gap, 2=creates orphan/empty day"""
        entries = session_assignments.get(session_id, [])
        if not entries:
            return 0
        key = (entries[0]["groupId"], entries[0]["day"])
        sessions_for_day = mapping.get(key, [])
        if len(sessions_for_day) <= 1:
            return 2
        # Check if removal causes non-contiguity
        session_indices = [find_slot_index_by_time(e.get("startTime")) for e in entries]
        session_indices = [i for i in session_indices if i is not None]
        indices = [
            find_slot_index_by_time(s.get("startTime"))
            for s in sessions_for_day
            if find_slot_index_by_time(s.get("startTime")) is not None
        ]
        indices = [i for i in indices if i not in session_indices]
        if not indices:
            return 2
        indices_sorted = sorted(indices)
        if indices_sorted[-1] - indices_sorted[0] + 1 != len(indices_sorted):
            return 1
        return 0

    orphan_group_days = [
        key
        for key, group_sessions in group_day_assignments.items()
        if len(group_sessions) == 1
    ]
    rescued = 0
    for orphan_key in list(orphan_group_days):
        group_id, orphan_day = orphan_key
        orphan_assignment = group_day_assignments[orphan_key][0]
        # Determine slots needed for this orphan (based on subject name)
        sub = subject_map.get(orphan_assignment.get("subjectId"), {})
        slots_needed = 2 if "workshop" in (sub.get("name", "").lower()) else 1

        # Try to find another assignment for the same group that we can move into orphan_day
        moved = False
        # Consider candidates at session level so multi-slot sessions move as a block
        # Gather candidate sessions for this group (session-level) and sort by removal severity
        candidates = []
        for session_obj in sessions:
            cand_sid = session_obj.get("id")  # This line is retained for context
            sess_entries = session_assignments.get(cand_sid, [])
            if not sess_entries:
                continue
            # representative assignment
            cand_rep = sess_entries[0]
            if cand_rep.get("groupId") != group_id:
                continue
            # skip the orphan itself
            if cand_rep is orphan_assignment:
                continue
            # skip workshops for moves
            subj = subject_map.get(cand_rep.get("subjectId"), {})
            if "workshop" in subj.get("name", "").lower():
                continue
            # Use group_day_assignments here: final mapping will be computed later
            severity = removal_severity(cand_sid, group_day_assignments)
            candidates.append((severity, cand_sid, sess_entries))
        # sort by severity (0 first, then 1, then 2)
        candidates.sort(key=lambda t: t[0])
        for severity, cand_sid, sess_entries in candidates:
            cand = sess_entries[0]
            if not sess_entries:
                continue
            # pick a representative entry
            cand = sess_entries[0]
            # now test the candidate block as before
            if cand.get("groupId") != group_id:
                continue
            # skip the orphan itself
            if cand is orphan_assignment:
                continue
            # compute candidate original slot index and slots needed for candidate
            cand_slots_needed = len(sess_entries)
            cand_orig_idx_candidates = [
                find_slot_index_by_time(e.get("startTime")) for e in sess_entries
            ]
            cand_orig_idx_candidates = [
                i for i in cand_orig_idx_candidates if i is not None
            ]
            if not cand_orig_idx_candidates:
                continue
            cand_orig_idx = min(cand_orig_idx_candidates)
            if cand_orig_idx is None:
                continue
            cand_teacher = cand.get("teacherId")
            cand_room = cand.get("roomId")

            # try to find an insertion slot index on orphan_day for cand_slots_needed
            for slot_idx in range(len(time_slots) - (cand_slots_needed - 1)):
                conflict = False
                chosen_room_id = None
                # try the candidate's room first
                possible_rooms = [r for r in rooms] if rooms else []
                # check room availability per room
                for room in possible_rooms:
                    room_ok = True
                    for offset in range(cand_slots_needed):
                        if used_slots.get(
                            (cand_teacher, orphan_day, slot_idx + offset)
                        ):
                            room_ok = False
                            break
                        if used_slots.get((group_id, orphan_day, slot_idx + offset)):
                            room_ok = False
                            break
                        if used_slots.get((room["id"], orphan_day, slot_idx + offset)):
                            room_ok = False
                            break
                    if room_ok:
                        chosen_room_id = room["id"]
                        break
                if chosen_room_id is None:
                    continue

                # We found a place to move cand to orphan_day at slot_idx with chosen_room_id
                # Free cand's original used_slots (for all offsets)
                for offset in range(cand_slots_needed):
                    old_key_teacher = (
                        cand_teacher,
                        cand.get("day"),
                        cand_orig_idx + offset,
                    )
                    old_key_group = (group_id, cand.get("day"), cand_orig_idx + offset)
                    old_key_room = (
                        (cand_room, cand.get("day"), cand_orig_idx + offset)
                        if cand_room is not None
                        else None
                    )
                    used_slots.pop(old_key_teacher, None)
                    used_slots.pop(old_key_group, None)
                    if old_key_room:
                        used_slots.pop(old_key_room, None)

                # Mark new used_slots
                for offset in range(cand_slots_needed):
                    used_slots[(cand_teacher, orphan_day, slot_idx + offset)] = True
                    used_slots[(group_id, orphan_day, slot_idx + offset)] = True
                    used_slots[(chosen_room_id, orphan_day, slot_idx + offset)] = True

                # Update all entries for this session
                for offset_idx, entry in enumerate(sess_entries):
                    entry["day"] = orphan_day
                    entry["startTime"] = time_slots[slot_idx + offset_idx]["startTime"]
                    entry["endTime"] = time_slots[slot_idx + offset_idx]["endTime"]
                    entry["roomId"] = chosen_room_id

                # Update group_day_assignments: remove cand from old day and add to orphan_day
                old_key = (group_id, cand.get("day"))
                # rebuild mapping since cand["day"] was mutated; recompute old key differently
                # We removed old used_slots above; now add cand into orphan_day in mapping
                for entry in sess_entries:
                    group_day_assignments.setdefault((group_id, orphan_day), []).append(
                        entry
                    )
                # Remove cand from any previous key entries
                for k in list(group_day_assignments.keys()):
                    if k != (group_id, orphan_day):
                        group_day_assignments[k] = [
                            x for x in group_day_assignments[k] if x not in sess_entries
                        ]
                        if len(group_day_assignments[k]) == 0:
                            del group_day_assignments[k]

                moved = True
                rescued += 1
                break
            if moved:
                break

        # if we moved something into orphan_day, orphan is resolved
        if moved:
            orphan_group_days = [k for k in orphan_group_days if k != orphan_key]

    # After scheduling, for each orphan group-day, try to move a non-workshop session from another day of the same group into the orphan day
    final_group_day_assignments = defaultdict(list)
    for a in assignments:
        final_group_day_assignments[(a["groupId"], a["day"])].append(a)

    # Map sessionId -> list of its assignment entries (these are contiguous offsets for workshops)
    session_assignments = defaultdict(list)
    for a in assignments:
        session_assignments[a["sessionId"]].append(a)

    moved_count = 0
    # Iteratively try to fill orphans by moving any possible non-workshop session
    # Two passes: strict (do not break group gaps) then relaxed (allow breaking gap)
    for allow_break_gaps in (False, True):
        while True:
            orphans = [
                key
                for key, group_sessions in final_group_day_assignments.items()
                if len(group_sessions) == 1
            ]
            progress = False
            for orphan_key in orphans:
                group_id, orphan_day = orphan_key
                orphan_assignment = final_group_day_assignments[orphan_key][0]
                # Try every non-workshop session for this group on other days
                for k, group_sessions in list(final_group_day_assignments.items()):
                    if k[0] != group_id or k[1] == orphan_day:
                        continue
                    for s in list(group_sessions):
                        subj = subject_map.get(s["subjectId"], {})
                        if "workshop" in subj.get("name", "").lower():
                            continue
                        # Try to move s to orphan_day
                        severity = removal_severity(
                            s.get("sessionId"), final_group_day_assignments
                        )
                        if not allow_break_gaps and severity > 0:
                            # skip candidate in strict pass
                            continue
                        for slot_idx in range(len(time_slots)):
                            slot_key = (s["teacherId"], orphan_day, slot_idx)
                            group_key = (group_id, orphan_day, slot_idx)
                            room = None
                            for r in rooms:
                                room_key = (r["id"], orphan_day, slot_idx)
                                if (
                                    not used_slots.get(slot_key)
                                    and not used_slots.get(group_key)
                                    and not used_slots.get(room_key)
                                ):
                                    room = r
                                    break
                            if room:
                                # Check whether removing candidate from original day breaks its adjacency/orphan
                                if (
                                    not allow_break_gaps
                                    and removal_creates_gap_or_orphan(
                                        s, final_group_day_assignments
                                    )
                                ):
                                    # Skip this candidate in strict pass
                                    print(
                                        f"[DEBUG] Skipping candidate {s.get('sessionId')} from {s.get('day')} because removal would create gap/orphan (strict)",
                                        file=sys.stderr,
                                    )
                                    continue
                                # Free s's old slot
                                old_slot_idx = None
                                for idx, ts in enumerate(time_slots):
                                    if ts["startTime"] == s["startTime"]:
                                        old_slot_idx = idx
                                        break
                                if old_slot_idx is not None:
                                    used_slots.pop(
                                        (s["teacherId"], s["day"], old_slot_idx), None
                                    )
                                    used_slots.pop(
                                        (group_id, s["day"], old_slot_idx), None
                                    )
                                    used_slots.pop(
                                        (s["roomId"], s["day"], old_slot_idx), None
                                    )
                                # Assign new slot
                                used_slots[(s["teacherId"], orphan_day, slot_idx)] = (
                                    True
                                )
                                used_slots[(group_id, orphan_day, slot_idx)] = True
                                used_slots[(room["id"], orphan_day, slot_idx)] = True
                                s["day"] = orphan_day
                                s["startTime"] = time_slots[slot_idx]["startTime"]
                                s["endTime"] = time_slots[slot_idx]["endTime"]
                                s["roomId"] = room["id"]
                                # Check whether removing candidate from original day breaks its adjacency/orphan
                                if (
                                    not allow_break_gaps
                                    and removal_creates_gap_or_orphan(
                                        s, final_group_day_assignments
                                    )
                                ):
                                    # Skip this candidate in strict pass
                                    continue
                                # Update mapping
                                final_group_day_assignments[orphan_key].append(s)
                                final_group_day_assignments[k] = [
                                    x
                                    for x in final_group_day_assignments[k]
                                    if x is not s
                                ]
                                moved_count += 1
                                print(
                                    f"[DEBUG] Candidate moved: session {s.get('sessionId')} -> {orphan_day} (allow_break_gaps={allow_break_gaps})",
                                    file=sys.stderr,
                                )
                                progress = True
                                break
                    if progress:
                        break
                if progress:
                    break
            if not progress:
                break
        # End current allow_break_gaps pass; move on to the next (relaxed) pass if any

    # If some orphans couldn't be filled yet, allow swaps: try to swap a non-workshop session
    # from another group's day into the orphan day when direct moves aren't possible.
    # We'll run strict swaps first, then relaxed swaps allowing gaps.
    for allow_break_gaps in (False, True):
        # Build a day lookup for quick iteration
        day_assignments = defaultdict(list)
        for a in assignments:
            day_assignments[a["day"]].append(a)

        # Try swapping for remaining orphans
        orphans = [
            key
            for key, group_sessions in final_group_day_assignments.items()
            if len(group_sessions) == 1
        ]
        for orphan_key in orphans:
            group_id, orphan_day = orphan_key
            orphan_assignment = final_group_day_assignments[orphan_key][0]
            # Try to find a candidate in another day for the same group (non-workshop)
            for k, group_sessions in list(final_group_day_assignments.items()):
                if k[0] != group_id or k[1] == orphan_day:
                    continue
                for cand in list(group_sessions):
                    subj = subject_map.get(cand["subjectId"], {})
                    if "workshop" in subj.get("name", "").lower():
                        continue
                    cand_severity = removal_severity(
                        cand.get("sessionId"), final_group_day_assignments
                    )
                    if not allow_break_gaps and cand_severity > 0:
                        # skip this cand in strict swap pass
                        continue
                    cand_old_day = cand["day"]
                    cand_sid = cand.get("sessionId")
                    cand_entries = session_assignments.get(cand_sid, [cand])
                    cand_slots_needed = len(cand_entries)
                    cand_idx_candidates = [
                        find_slot_index_by_time(e.get("startTime"))
                        for e in cand_entries
                    ]
                    cand_idx_candidates = [
                        i for i in cand_idx_candidates if i is not None
                    ]
                    if not cand_idx_candidates:
                        continue
                    cand_idx = min(cand_idx_candidates)
                    if cand_idx is None:
                        continue
                    # Try to find a session in orphan_day to swap with (non-workshop preferred)
                    for t in list(day_assignments[orphan_day]):
                        # Skip if same group or t is a workshop
                        if t["groupId"] == group_id:
                            continue
                        t_subj = subject_map.get(t["subjectId"], {})
                        if "workshop" in t_subj.get("name", "").lower():
                            continue
                        t_sid = t.get("sessionId")
                        t_entries = session_assignments.get(t_sid, [t])
                        t_slots_needed = len(t_entries)
                        t_idx_candidates = [
                            find_slot_index_by_time(e.get("startTime"))
                            for e in t_entries
                        ]
                        t_idx_candidates = [
                            i for i in t_idx_candidates if i is not None
                        ]
                        if not t_idx_candidates:
                            continue
                        t_idx = min(t_idx_candidates)
                        if t_idx is None:
                            continue
                        # Check if candidate's teacher can take t's original slot in cand_old_day
                        cand_teacher = cand.get("teacherId")
                        cand_room = cand.get("roomId")
                        t_teacher = t.get("teacherId")
                        t_room = t.get("roomId")

                        # Verify availability for swap
                        cand_new_teacher_key = (cand_teacher, orphan_day, t_idx)
                        cand_new_group_key = (group_id, orphan_day, t_idx)
                        cand_new_room_key = (
                            (cand_room, orphan_day, t_idx)
                            if cand_room is not None
                            else None
                        )

                        t_new_teacher_key = (t_teacher, cand_old_day, cand_idx)
                        t_new_group_key = (t["groupId"], cand_old_day, cand_idx)
                        t_new_room_key = (
                            (t_room, cand_old_day, cand_idx)
                            if t_room is not None
                            else None
                        )

                        # Need to ensure target block is free for all offsets
                        cand_block_free = True
                        for off in range(cand_slots_needed):
                            if (
                                used_slots.get((cand_teacher, orphan_day, t_idx + off))
                                or used_slots.get((group_id, orphan_day, t_idx + off))
                                or (
                                    cand_new_room_key
                                    and used_slots.get(
                                        (cand_new_room_key[0], orphan_day, t_idx + off)
                                    )
                                )
                            ):
                                cand_block_free = False
                                break
                        if not cand_block_free:
                            continue
                            continue
                        t_block_free = True
                        for off in range(t_slots_needed):
                            if (
                                used_slots.get(
                                    (t_teacher, cand_old_day, cand_idx + off)
                                )
                                or used_slots.get(
                                    (t["groupId"], cand_old_day, cand_idx + off)
                                )
                                or (
                                    t_new_room_key
                                    and used_slots.get(
                                        (
                                            t_new_room_key[0],
                                            cand_old_day,
                                            cand_idx + off,
                                        )
                                    )
                                )
                            ):
                                t_block_free = False
                                break
                        if not t_block_free:
                            continue
                            continue

                        # perform swap
                        # free old slots
                        # Free blocks
                        for off in range(cand_slots_needed):
                            used_slots.pop(
                                (cand_teacher, cand_old_day, cand_idx + off), None
                            )
                            used_slots.pop(
                                (group_id, cand_old_day, cand_idx + off), None
                            )
                        if cand_room:
                            used_slots.pop((cand_room, cand_old_day, cand_idx), None)

                        for off in range(t_slots_needed):
                            used_slots.pop((t_teacher, orphan_day, t_idx + off), None)
                            used_slots.pop(
                                (t["groupId"], orphan_day, t_idx + off), None
                            )
                        if t_room:
                            used_slots.pop((t_room, orphan_day, t_idx), None)

                        # Check if swapping would break gaps for the groups involved
                        cand_breaks = removal_creates_gap_or_orphan(
                            cand, final_group_day_assignments
                        )
                        t_breaks = removal_creates_gap_or_orphan(
                            t, final_group_day_assignments
                        )
                        # If we're in strict mode and either swap breaks gaps, skip
                        if not allow_break_gaps and (cand_breaks or t_breaks):
                            print(
                                f"[DEBUG] Skipping swap for cand={cand.get('sessionId')} or t={t.get('sessionId')} because it would create gap/orphan (strict)",
                                file=sys.stderr,
                            )
                            continue
                        for off in range(cand_slots_needed):
                            used_slots[(cand_teacher, orphan_day, t_idx + off)] = True
                            used_slots[(group_id, orphan_day, t_idx + off)] = True
                            if cand_new_room_key:
                                used_slots[
                                    (cand_new_room_key[0], orphan_day, t_idx + off)
                                ] = True
                        if cand_new_room_key:
                            used_slots[cand_new_room_key] = True

                        for off in range(t_slots_needed):
                            used_slots[(t_teacher, cand_old_day, cand_idx + off)] = True
                            used_slots[(t["groupId"], cand_old_day, cand_idx + off)] = (
                                True
                            )
                            if t_new_room_key:
                                used_slots[
                                    (t_new_room_key[0], cand_old_day, cand_idx + off)
                                ] = True
                        if t_new_room_key:
                            used_slots[t_new_room_key] = True

                        # swap days/times
                        old_cand_day = cand["day"]
                        old_cand_start = cand["startTime"]
                        # Update session entries for cand
                        for off_idx, e in enumerate(cand_entries):
                            e["day"] = orphan_day
                            e["startTime"] = time_slots[t_idx + off_idx]["startTime"]
                            e["endTime"] = time_slots[t_idx + off_idx]["endTime"]

                        # Update session entries for t
                        for off_idx, e in enumerate(t_entries):
                            e["day"] = old_cand_day
                            e["startTime"] = time_slots[cand_idx + off_idx]["startTime"]
                            e["endTime"] = time_slots[cand_idx + off_idx]["endTime"]
                        # No need to update endTime if same slot length

                        # Update day_assignments and final_group_day_assignments mappings
                        day_assignments[orphan_day] = [
                            x for x in day_assignments[orphan_day] if x not in t_entries
                        ]
                        day_assignments[old_cand_day] = [
                            x
                            for x in day_assignments[old_cand_day]
                            if x not in cand_entries
                        ]
                        for e in cand_entries:
                            day_assignments[orphan_day].append(e)
                        for e in t_entries:
                            day_assignments[old_cand_day].append(e)

                        # Add swapped session entries
                        for e in cand_entries:
                            final_group_day_assignments[orphan_key].append(e)
                        for e in t_entries:
                            final_group_day_assignments.setdefault(
                                (t["groupId"], old_cand_day), []
                            ).append(e)
                        # Remove from old keys
                        final_group_day_assignments[(group_id, old_cand_day)] = [
                            x
                            for x in final_group_day_assignments.get(
                                (group_id, old_cand_day), []
                            )
                            if x not in cand_entries
                        ]
                        final_group_day_assignments[(t["groupId"], orphan_day)] = [
                            x
                            for x in final_group_day_assignments.get(
                                (t["groupId"], orphan_day), []
                            )
                            if x not in t_entries
                        ]

                        moved_count += 1
                        progress = True
                        break
                    if progress:
                        break
                if progress:
                    break
            if progress:
                break
    to_remove = set(
        key
        for key, group_sessions in final_group_day_assignments.items()
        if len(group_sessions) == 1
    )
    really_filtered_assignments = [
        a for a in assignments if (a["groupId"], a["day"]) not in to_remove
    ]
    if to_remove:
        print(
            f"[CONSTRAINT] FINAL: Removed {len(to_remove)} group-day(s) with only one session: {list(to_remove)}",
            file=sys.stderr,
        )
    if moved_count > 0:
        print(
            f"[INFO] Moved {moved_count} non-workshop session(s) to fill orphan days.",
            file=sys.stderr,
        )

    if rescued > 0:
        print(
            f"[INFO] Rescued {rescued} orphan session(s) by moving other sessions.",
            file=sys.stderr,
        )

    if unschedulable:
        print(
            f"[CONSTRAINT] {len(unschedulable)} sessions could not be scheduled due to no eligible teacher or no available consecutive slots:",
            file=sys.stderr,
        )
        for s in unschedulable:
            print(
                f"  Session ID {s['id']} (subjectId={s['subjectId']}, groupId={s['groupId']})",
                file=sys.stderr,
            )
    return really_filtered_assignments
