import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import bcrypt from "bcryptjs";
import { prisma } from "~/lib/prisma.server";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const authenticator = new Authenticator(sessionStorage);

const formStrategy = new FormStrategy(async ({ form }) => {
  const email = form.get("email") as string;
  const password = form.get("password") as string;
  const user = await prisma.user.findUnique({
    where: { email },
  });
  console.log(user);
  if (!user) {
    console.log("you entered a wrong email");
    throw new AuthorizationError();
  }

  const passwordsMatch = await bcrypt.compare(
    password,
    user.hashedPassword as string
  );

  if (!passwordsMatch) {
    console.log("wrong password or email");
    throw new AuthorizationError();
  }
  console.log(user);
  return user;
});

authenticator.use(formStrategy, "form");

export { authenticator };