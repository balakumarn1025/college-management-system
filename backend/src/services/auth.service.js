// ============ REGISTER ============
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Admin from "../models/Admin.js";
import { signToken } from "../utils/jwt.js";

async function getUserName(user) {
  const profileModels = { admin: Admin, student: Student, teacher: Teacher };
  const profileModel = profileModels[user.role];
  const profile = user.ref_id && profileModel
    ? await profileModel.findById(user.ref_id)
    : null;
  return profile?.name || user.email;
}

function serializeAuthUser(user, name) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    ref_id: user.ref_id?.toString() ?? null,
    name,
  };
}

export async function login(email, password) {
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user || !user.is_active || !(await bcrypt.compare(password, user.password_hash))) {
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });
  }

  const name = await getUserName(user);
  const ref_id = user.ref_id?.toString();
  const access_token = signToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    ref_id,
  });

  return {
    access_token,
    token_type: "bearer",
    user: serializeAuthUser(user, name),
  };
}

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user || !user.is_active) {
    throw Object.assign(new Error("User account is unavailable"), { status: 401 });
  }

  return serializeAuthUser(user, await getUserName(user));
}

export async function register({ email, password, name, role = "student" }) {
  // Validate
  if (!email || !password || !name) {
    throw Object.assign(new Error("Email, password and name are required"), { status: 400 });
  }
  if (password.length < 6) {
    throw Object.assign(new Error("Password must be at least 6 characters"), { status: 400 });
  }
  if (!["student", "teacher"].includes(role)) {
    throw Object.assign(new Error("Role must be student or teacher"), { status: 400 });
  }

  // Check duplicate
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    throw Object.assign(new Error("Email already registered"), { status: 400 });
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    email: email.toLowerCase(),
    password_hash,
    role,
    is_active: true,
  });

  // Create role-specific profile
  let ref_id = null;
  if (role === "student") {
    const count = await Student.countDocuments();
    const student = await Student.create({
      student_id: `STU${String(count + 1).padStart(3, "0")}`,
      name,
      email: email.toLowerCase(),
      year: 1,
      semester: 1,
      section: "A",
    });
    ref_id = student._id;
  } else {
    const count = await Teacher.countDocuments();
    const teacher = await Teacher.create({
      teacher_id: `TCH${String(count + 1).padStart(3, "0")}`,
      name,
      email: email.toLowerCase(),
    });
    ref_id = teacher._id;
  }

  user.ref_id = ref_id;
  await user.save();

  // Generate token
  const token = signToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    ref_id: ref_id.toString(),
  });

  return {
    access_token: token,
    token_type: "bearer",
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      ref_id: ref_id.toString(),
      name,
    },
  };
}

// ============ GOOGLE LOGIN ============
export async function googleLogin(credential) {
  const { OAuth2Client } = await import("google-auth-library");
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { email, name, picture, email_verified } = payload;

  if (!email_verified) {
    throw Object.assign(new Error("Google email not verified"), { status: 400 });
  }

  // Find or create user
  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Auto-register as student
    const count = await Student.countDocuments();
    const student = await Student.create({
      student_id: `STU${String(count + 1).padStart(3, "0")}`,
      name,
      email: email.toLowerCase(),
      profile_image: picture || "",
      year: 1,
      semester: 1,
      section: "A",
    });

    user = await User.create({
      email: email.toLowerCase(),
      password_hash: await bcrypt.hash(Math.random().toString(36), 10),
      role: "student",
      ref_id: student._id,
      is_active: true,
    });
  }

  // Determine display name
  let displayName = name;
  if (user.role === "student" && user.ref_id) {
    const s = await Student.findById(user.ref_id);
    displayName = s?.name || name;
  } else if (user.role === "teacher" && user.ref_id) {
    const t = await Teacher.findById(user.ref_id);
    displayName = t?.name || name;
  }

  const token = signToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    ref_id: user.ref_id?.toString(),
  });

  return {
    access_token: token,
    token_type: "bearer",
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      ref_id: user.ref_id?.toString(),
      name: displayName,
    },
  };
}