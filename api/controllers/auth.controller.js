import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const getCookieOptions = (maxAge) => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge,
  };
};

export const register = async (req, res) => {
  // db operations
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required." });
    }

    if (!process.env.JWT_SECRET_KEY) {
      return res
        .status(500)
        .json({ message: "Server authentication is not configured correctly." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    // Generate JWT token
    const age = 1000 * 60 * 60 * 24 * 7; // 7 days expiration
    const token = jwt.sign(
      {
        id: newUser.id,
        isAdmin: false, // Set this based on your app's user role logic
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: age,
      }
    );

    // Set the JWT token in a cookie
    res
      .cookie("token", token, getCookieOptions(age))
      .status(201)
      .json({ message: "User created successfully!", userInfo: newUser });
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "That username or email is already registered." });
    }

    res
      .status(500)
      .json({ message: "We couldn't create your account right now." });
  }
};
export const login = async (req, res) => {
  // db operations
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    if (!process.env.JWT_SECRET_KEY) {
      return res
        .status(500)
        .json({ message: "Server authentication is not configured correctly." });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT token
    const age = 1000 * 60 * 60 * 24 * 7; // 7 days expiration
    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin, // Set this based on your app's user role logic
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: age,
      }
    );

    const { password: userPassword, ...userInfo } = user;

    // Set the JWT token in a cookie
    res
      .cookie("token", token, getCookieOptions(age))
      .status(200)
      .json(userInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "We couldn't log you in right now." });
  }
};
export const logout = (req, res) => {
  //db operations
  res
    .clearCookie("token", getCookieOptions(0))
    .status(200)
    .json({ message: "Logout Successful" });
};
