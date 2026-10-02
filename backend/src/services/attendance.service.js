import Attendance from "../models/Attendance.js";
import AttendanceHistory from "../models/AttendanceHistory.js";
import Student from "../models/Student.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const VALID = ["Present", "Absent", "Late", "Leave"];

export async function getRoster(classId, dateStr, period, subjectId) {
  // classId like "CSE-1A"
  const parts = classId.split("-");
  const year = parts[1]?.[0] ? parseInt(parts[1][0]) : null;
  const section = parts[1]?.slice(1) || null;

  const filter = {};
  if (year) filter.year = year;
  if (section) filter.section = section;

  const students = await Student.find(filter).sort({ student_id: 1 });
  const studentIds = students.map(s => s._id);

  const existing = await Attendance.find({
    date: dateStr,
    period_number: period,
    subject_id: subjectId,
    student_id: { $in: studentIds },
  });
  const map = new Map(existing.map(e => [e.student_id.toString(), e]));

  return students.map(s => {
    const ex = map.get(s._id.toString());
    return {
      student_id: s._id.toString(),
      student_code: s.student_id,
      name: s.name,
      status: ex ? ex.status : "Present",
      reason: ex?.reason || null,
      attendance_id: ex ? ex._id.toString() : null,
    };
  });
}

export async function saveBulk(payload, teacherRefId) {
  const { class_id, date, period_number, subject_id, items } = payload;
  if (period_number < 1 || period_number > 12) {
    throw Object.assign(new Error("Invalid period"), { status: 400 });
  }

  let saved = 0, modified = 0;
  const modifiedIds = [];

  for (const item of items) {
    if (!VALID.includes(item.status)) {
      throw Object.assign(new Error(`Invalid status: ${item.status}`), { status: 400 });
    }

    const existing = await Attendance.findOne({
      student_id: item.student_id,
      date,
      period_number,
      subject_id,
    });

    if (existing) {
      if (existing.status !== item.status) {
        if (!item.reason) {
          throw Object.assign(
            new Error(`Reason required to modify attendance for ${item.student_id}`),
            { status: 400 }
          );
        }
        await AttendanceHistory.create({
          attendance_id: existing._id,
          student_id: existing.student_id,
          subject_id: existing.subject_id,
          date: existing.date,
          period_number: existing.period_number,
          old_status: existing.status,
          new_status: item.status,
          reason: item.reason,
          modified_by: teacherRefId,
        });
        existing.status = item.status;
        existing.reason = item.reason;
        existing.modified_by = teacherRefId;
        await existing.save();

        // Notify student
        const studentUser = await User.findOne({ ref_id: existing.student_id, role: "student" });
        const subj = await Subject.findById(existing.subject_id);
        if (studentUser) {
          await Notification.create({
            user_id: studentUser._id,
            title: "Attendance updated",
            message: `Your attendance for ${subj?.name || "subject"} Period ${period_number} on ${date} was changed from ${existing.status === item.status ? "" : ""}${item.status}. Reason: ${item.reason}`,
            type: "modification",
          });
        }
        modified++;
        modifiedIds.push(item.student_id);
      } else {
        saved++;
      }
    } else {
      await Attendance.create({
        student_id: item.student_id,
        teacher_id: teacherRefId,
        subject_id,
        class_id,
        date,
        period_number,
        status: item.status,
        reason: item.reason || null,
      });
      saved++;
    }
  }

  return { saved, modified, modified_ids: modifiedIds };
}

export async function modifySingle(attendanceId, status, reason, modifierId) {
  if (!VALID.includes(status)) throw Object.assign(new Error("Invalid status"), { status: 400 });
  if (!reason || reason.trim().length < 3) {
    throw Object.assign(new Error("Reason required (min 3 chars)"), { status: 400 });
  }

  const att = await Attendance.findById(attendanceId);
  if (!att) throw Object.assign(new Error("Attendance not found"), { status: 404 });
  if (att.status === status) return { message: "No change" };

  await AttendanceHistory.create({
    attendance_id: att._id,
    student_id: att.student_id,
    subject_id: att.subject_id,
    date: att.date,
    period_number: att.period_number,
    old_status: att.status,
    new_status: status,
    reason,
    modified_by: modifierId,
  });

  const oldStatus = att.status;
  att.status = status;
  att.reason = reason;
  att.modified_by = modifierId;
  await att.save();

  const studentUser = await User.findOne({ ref_id: att.student_id, role: "student" });
  const subj = await Subject.findById(att.subject_id);
  if (studentUser) {
    await Notification.create({
      user_id: studentUser._id,
      title: "Attendance updated",
      message: `Your attendance for ${subj?.name || "subject"} Period ${att.period_number} on ${att.date} was changed from ${oldStatus} to ${status}. Reason: ${reason}`,
      type: "modification",
    });
  }
  return { message: "Updated" };
}

export async function studentPercentage(studentId) {
  const docs = await Attendance.find({ student_id: studentId });
  const total = docs.length;
  const attended = docs.filter(d => ["Present", "Late", "Leave"].includes(d.status)).length;
  const pct = total ? (attended / total) * 100 : 0;
  return {
    total,
    attended,
    absent: total - attended,
    percentage: Math.round(pct * 100) / 100,
  };
}

export async function percentageBySubject(studentId) {
  const rows = await Attendance.aggregate([
    { $match: { student_id: new (await import("mongoose")).default.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: "$subject_id",
        total: { $sum: 1 },
        attended: { $sum: { $cond: [{ $in: ["$status", ["Present", "Late", "Leave"]] }, 1, 0] } },
      },
    },
  ]);
  const out = [];
  for (const r of rows) {
    const subj = await Subject.findById(r._id);
    const pct = r.total ? (r.attended / r.total) * 100 : 0;
    out.push({
      subject_id: r._id.toString(),
      subject_name: subj?.name || "Unknown",
      total: r.total,
      attended: r.attended,
      percentage: Math.round(pct * 100) / 100,
    });
  }
  return out;
}