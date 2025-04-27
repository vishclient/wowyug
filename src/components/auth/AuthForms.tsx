import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import InfoBanner from "../InfoBanner";

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(20, { message: "Username must be less than 20 characters" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores",
      }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthFormsProps {
  onLogin?: (data: LoginFormValues) => void;
  onRegister?: (data: RegisterFormValues) => void;
  isLoading?: boolean;
  error?: string | null;
}

const AuthForms = ({
  onLogin = () => {},
  onRegister = () => {},
  isLoading = false,
  error = null,
}: AuthFormsProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const {
    register: registerSignup,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLogin = (data: LoginFormValues) => {
    try {
      // In a real app, this would make an API call to authenticate the user
      console.log("Login data:", data);
      // For demo purposes, we're just passing the data to the parent component
      onLogin(data);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleRegister = (data: RegisterFormValues) => {
    try {
      // In a real app, this would make an API call to register the user
      console.log("Register data:", data);
      // For demo purposes, we're just passing the data to the parent component
      onRegister(data);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <InfoBanner />
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">
            Chat App
          </CardTitle>
          <CardDescription className="text-center">
            Connect with friends and colleagues in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "login" | "register")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <form
                onSubmit={handleLoginSubmit(handleLogin)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    {...registerLogin("email")}
                    autoComplete="email"
                    className="focus:ring-2 focus:ring-primary/20"
                  />
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">
                      {loginErrors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-xs"
                      type="button"
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    {...registerLogin("password")}
                    autoComplete="current-password"
                    className="focus:ring-2 focus:ring-primary/20"
                  />
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">
                      {loginErrors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>

                {/* Demo credentials */}
                <div className="text-xs text-center text-muted-foreground mt-2">
                  <p>For demo: Use any email and password</p>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form
                onSubmit={handleRegisterSubmit(handleRegister)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    placeholder="John Doe"
                    {...registerSignup("name")}
                    className="focus:ring-2 focus:ring-primary/20"
                  />
                  {registerErrors.name && (
                    <p className="text-sm text-destructive">
                      {registerErrors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    placeholder="johndoe123"
                    {...registerSignup("username")}
                    className="focus:ring-2 focus:ring-primary/20"
                  />
                  {registerErrors.username && (
                    <p className="text-sm text-destructive">
                      {registerErrors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    {...registerSignup("email")}
                    autoComplete="email"
                    className="focus:ring-2 focus:ring-primary/20"
                  />
                  {registerErrors.email && (
                    <p className="text-sm text-destructive">
                      {registerErrors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    {...registerSignup("password")}
                    autoComplete="new-password"
                    className="focus:ring-2 focus:ring-primary/20"
                  />
                  {registerErrors.password && (
                    <p className="text-sm text-destructive">
                      {registerErrors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">
                    Confirm Password
                  </Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    {...registerSignup("confirmPassword")}
                    autoComplete="new-password"
                    className="focus:ring-2 focus:ring-primary/20"
                  />
                  {registerErrors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {registerErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-4">
          <div className="text-sm text-center text-muted-foreground">
            {activeTab === "login" ? (
              <p>
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={() => setActiveTab("register")}
                >
                  Sign up
                </Button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={() => setActiveTab("login")}
                >
                  Sign in
                </Button>
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForms;
