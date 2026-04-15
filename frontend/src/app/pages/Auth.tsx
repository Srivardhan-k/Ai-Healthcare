import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ShoppingBag } from "lucide-react";

export function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === "/login";
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <ShoppingBag className="w-10 h-10 text-[#4F46E5]" />
            <span className="font-semibold text-2xl">CampusMarket</span>
          </Link>
          <h1 className="text-3xl font-bold">{isLogin ? "Welcome back" : "Create account"}</h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? "Sign in to your account" : "Join the student marketplace"}
          </p>
        </div>

        <div className="bg-background p-8 rounded-2xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-transparent focus:border-[#4F46E5] focus:outline-none transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-transparent focus:border-[#4F46E5] focus:outline-none transition-colors"
                placeholder="you@university.edu"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-transparent focus:border-[#4F46E5] focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="text-[#4F46E5] hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="text-[#4F46E5] hover:underline">
                  Sign up
                </Link>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-[#4F46E5] hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
