import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useChatContext } from "../chat/ChatContext";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username must be at most 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
});

type UsernameFormValues = z.infer<typeof usernameSchema>;

const UpdateUsername = () => {
  const { updateUsername, currentUserId } = useChatContext();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const form = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: "",
    },
  });

  const onSubmit = async (values: UsernameFormValues) => {
    try {
      await updateUsername(values.username);
      setStatus("success");
      setMessage("Username updated successfully!");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage("Failed to update username. Please try again.");
      console.error("Error updating username:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-6 bg-background rounded-lg">
      {status === "success" && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {message}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your new username"
                    {...field}
                    autoComplete="off"
                    className="focus:ring-2 focus:ring-primary/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full transition-all"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Updating..." : "Update Username"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default UpdateUsername;
