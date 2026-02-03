"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile-action";
import { toast } from "sonner";
import { TUser } from "@/lib/definition";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  number: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface PersonalInfoFormProps {
  user: TUser;
}

export function PersonalInfoForm({ user }: PersonalInfoFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      email: user.email,
      number: user.number || "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      if (data.number) formData.append("number", data.number);

      const fileInput = fileInputRef.current;
      if (fileInput?.files?.[0]) {
        formData.append("image", fileInput.files[0]);
      }

      const result = await updateProfile(user._id || user.id, formData);

      if (result.success) {
        toast.success("Profile updated");
        router.refresh();
      } else {
        toast.error(result.message || "Update failed");
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Edit profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar
              className="h-16 w-16 rounded-full ring-1 ring-border shadow-sm"
            >
              <AvatarImage
                src={previewUrl || user.profilePicture}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback
                className="text-xl font-semibold text-muted-foreground bg-muted"
              >
                {user.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <p className="text-sm font-medium">Profile photo</p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG. Max 5MB
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input {...register("name")} placeholder="Your name" />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register("email")} placeholder="you@example.com" />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Phone number</Label>
            <Input {...register("number")} placeholder="Optional" />
          </div>
          <Button type="submit" disabled={isSubmitting} className="bg-[#1F7AE0] hover:bg-[#1B6BB8]">
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
