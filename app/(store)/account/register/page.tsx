import Link from "next/link";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "./actions";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center px-4 py-8 container">
      <div className="w-full max-w-md">
        <h1 className="mb-8 font-bold text-3xl lg:text-4xl text-center tracking-tight">
          Register
        </h1>
        <form action={signup} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Name</Label>
            <Input id={useId()} name="fullName" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id={useId()} name="email" type="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id={useId()} name="password" type="password" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id={useId()} name="confirmPassword" type="password" />
          </div>
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
        <p className="mt-4 text-muted-foreground text-sm text-center">
          Already have an account?{" "}
          <Link href="/account/login" className="underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
