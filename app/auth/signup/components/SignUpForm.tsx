"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { School } from "@/types/entities";

export default function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
    image: "",
    schoolId: "",
  });
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch schools on component mount
    fetchSchools();
  }, []);

  useEffect(() => {
    // Filter schools based on search
    if (schoolSearch.trim() === "") {
      setFilteredSchools(schools);
    } else {
      const filtered = schools.filter((school) =>
        school.name.toLowerCase().includes(schoolSearch.toLowerCase())
      );
      setFilteredSchools(filtered);
    }
  }, [schoolSearch, schools]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#school") && !target.closest(".school-dropdown")) {
        setShowSchoolDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSchools = async () => {
    try {
      console.log("Fetching schools...");
      const response = await fetch("/api/schools");
      console.log("Response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Schools data:", data);
        setSchools(data);
        setFilteredSchools(data);
      } else {
        console.error("Failed to fetch schools:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch schools:", error);
    }
  };

  const handleSchoolSelect = (school: School) => {
    setFormData({ ...formData, schoolId: school.id.toString() });
    setSchoolSearch(school.name);
    setShowSchoolDropdown(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, image: base64String });
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!formData.schoolId) {
      setError("Please select a school");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          image: formData.image || undefined,
          schoolId: parseInt(formData.schoolId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Auto sign in after successful registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Account created but sign in failed. Please sign in manually."
        );
        setTimeout(() => router.push("/auth/signin"), 2000);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            Profile Picture (Optional)
          </label>
          <div className="flex items-center gap-4">
            {previewImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewImage}
                alt="Profile preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
              />
            )}
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Max size: 5MB. Supported formats: JPG, PNG, GIF
          </p>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="STUDENT" className="bg-gray-900">
              Student
            </option>
            <option value="TEACHER" className="bg-gray-900">
              Teacher
            </option>
            <option value="ADMIN" className="bg-gray-900">
              Admin
            </option>
          </select>
        </div>

        <div className="relative">
          <label
            htmlFor="school"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            School <span className="text-red-400">*</span>
          </label>
          <input
            id="school"
            name="school"
            type="text"
            required
            value={schoolSearch}
            onChange={(e) => {
              setSchoolSearch(e.target.value);
              setShowSchoolDropdown(true);
              if (e.target.value === "") {
                setFormData({ ...formData, schoolId: "" });
              }
            }}
            onFocus={() => setShowSchoolDropdown(true)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Search for your school..."
            autoComplete="off"
          />
          {showSchoolDropdown && filteredSchools.length > 0 && (
            <div className="school-dropdown absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {filteredSchools.map((school) => (
                <button
                  key={school.id}
                  type="button"
                  onClick={() => handleSchoolSelect(school)}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition text-white border-b border-white/10 last:border-b-0"
                >
                  <div className="font-medium">{school.name}</div>
                  {school.address && (
                    <div className="text-sm text-gray-400 mt-1">
                      {school.address}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          {showSchoolDropdown &&
            schoolSearch &&
            filteredSchools.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-xl p-4 text-center text-gray-400">
                No schools found. Please try a different search.
              </div>
            )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Create a password"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Confirm your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true" && (
        <>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-300">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="mt-4 w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </button>
          </div>
        </>
      )}

      <p className="mt-6 text-center text-sm text-gray-300">
        Already have an account?{" "}
        <Link
          href="/auth/signin"
          className="font-medium text-blue-400 hover:text-blue-300 transition"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
