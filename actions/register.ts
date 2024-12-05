"use server";

import { z } from "zod";
import { RegisterSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getUserByEmail } from "@/data/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid credentials",
    };
  }
  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return {
      error: "User already exists",
    };
  }

  await prisma.owner.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone: "",
    },
  });

  // TODO: Send verification email
  return {
    success: "Account created successfully!",
  };
};