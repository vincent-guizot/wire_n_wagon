import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../app/context/AuthContext";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Package,
  Settings,
  Shield,
  BarChart2,
  Crown,
  Boxes,
  MapPin,
  Globe,
  Truck,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("client1");
  const [password, setPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(username, password);
      navigate(`/dashboard/${loggedInUser.role}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login verification failed. Please check your cipher credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (roleUser) => {
    setUsername(roleUser);
    setPassword("password123");
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-cover bg-center bg-no-repeat font-serif"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 16, 14, 0.45), rgba(8, 12, 10, 0.7)), url('/background.png')`,
      }}
    >
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Hero Brand & Narrative */}
        <div className="lg:col-span-6 text-white space-y-6 lg:ml-24">
          {/* Logo Badge */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-[#382613]/90 border border-[#a17638] p-1.5 flex items-center justify-center shadow-lg">
              <img
                src="/compass.png"
                alt="Wire & Wagon Compass"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <div className="font-heading font-bold text-xl text-[#ecd89f] tracking-widest drop-shadow">
                WIRE & WAGON
              </div>
              <div className="text-[10px] text-[#cca967] font-mono tracking-widest uppercase font-semibold">
                EST. 1900 · EXPEDITION & FREIGHT
              </div>
            </div>
          </div>

          {/* Hero Heading */}
          <div className="pt-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#fbf5e6] leading-[1.1] drop-shadow-md">
              Your next dispatch <br />
              <span className="italic font-normal text-[#f4e2be]">
                begins here.
              </span>
            </h1>
            <div className="w-24 h-0.5 bg-gradient-to-r from-[#cca967] to-transparent my-4"></div>
            <p className="text-[#e2d5bd] text-base sm:text-lg max-w-lg font-serif drop-shadow-sm leading-relaxed">
              Secure logistics operations for a further world. Connecting ports,
              locomotives, and telegraph waybills with precision.
            </p>
          </div>

          {/* Features Row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 text-xs font-mono tracking-wider text-[#d5c7a5]">
            <div className="flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-[#cca967]" />
              <span className="font-bold">PEOPLE</span>
            </div>
            <span className="text-[#7e6e52]">|</span>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#cca967]" />
              <span className="font-bold">FREIGHT</span>
            </div>
            <span className="text-[#7e6e52]">|</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#cca967]" />
              <span className="font-bold">ROUTES</span>
            </div>
            <span className="text-[#7e6e52]">|</span>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#cca967]" />
              <span className="font-bold">OPPORTUNITIES</span>
            </div>
          </div>
        </div>

        {/* Right Parchment Login Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div
            className="w-full max-w-[480px] bg-[#fdfbf6] text-[#241c14] border-4 border-[#3d2c1c] rounded-lg shadow-2xl p-6 sm:p-8 relative overflow-hidden"
            style={{
              backgroundImage: `url('/parchment-paper.png')`,
              backgroundSize: "cover",
            }}
          >
            {/* Top Right Vintage Postal Stamp */}
            <div className="absolute top-3 right-3 w-16 h-16 pointer-events-none opacity-85">
              <img
                src="/est-1900-stamp.png"
                alt="1900 Postal Stamp"
                className="w-full h-full object-contain filter contrast-125"
              />
            </div>

            {/* Top Left Vintage Postal Stamp */}
            <div className="absolute top-3 left-3 w-16 h-16 pointer-events-none opacity-85">
              <img
                src="/est-1900-stamp.png"
                alt="1900 Postal Stamp"
                className="w-full h-full object-contain filter contrast-125"
              />
            </div>

            {/* Top Center Compass Emblem */}
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="w-32 mb-2">
                <img
                  src="/logo.png"
                  alt="Emblem"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#21170d] tracking-wider text-center">
                TELEGRAPH STATION GATE
              </h2>
              <div className="text-[10px] text-[#785b3b] font-mono tracking-widest uppercase font-bold mt-0.5">
                WIRE & WAGON · LOGISTICS SIGN-IN
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-[#fdf2f2] border border-[#f5c2c2] rounded text-[#8b1c1c] text-xs font-serif leading-relaxed">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#453421] uppercase tracking-wider mb-1 font-mono">
                  USERNAME OR REGISTERED EMAIL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#735e46]">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. client1 or admin1@wirewagon.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#ffffff]/90 border border-[#b8a88f] rounded text-sm text-[#241c14] focus:outline-none focus:ring-2 focus:ring-[#853c12] focus:border-[#853c12] shadow-inner font-serif"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#453421] uppercase tracking-wider mb-1 font-mono">
                  SECURITY CIPHER (PASSWORD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#735e46]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 bg-[#ffffff]/90 border border-[#b8a88f] rounded text-sm text-[#241c14] focus:outline-none focus:ring-2 focus:ring-[#853c12] focus:border-[#853c12] shadow-inner font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#735e46] hover:text-[#241c14] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#4d3a24]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#853c12] text-[#853c12] focus:ring-[#853c12] accent-[#853c12]"
                  />
                  <span>Remember me</span>
                </label>

                <span className="text-[#853c12] hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-b from-[#873e16] to-[#59260a] hover:from-[#9c481a] hover:to-[#6b2e0c] text-[#fff0cf] font-heading font-bold text-xs uppercase tracking-widest rounded border-2 border-[#b57a2b] shadow-md flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                <span>
                  {isSubmitting
                    ? "Authenticating..."
                    : "ENTER EXPEDITION OFFICE"}
                </span>
                <ArrowRight className="w-4 h-4 text-[#ffd885]" />
              </button>
            </form>

            {/* Quick-Station Access Header */}
            <div className="mt-6 pt-4 border-t border-[#d8caba]">
              <div className="flex items-center justify-center gap-2 text-[#785b3b] text-[10px] uppercase font-mono tracking-widest font-bold">
                <span>❖</span>
                <span>QUICK-STATION ACCESS</span>
                <span>❖</span>
              </div>
              <p className="text-[10px] text-center text-[#735e46] mt-0.5 font-serif italic">
                (Preset credentials available for demo access)
              </p>

              {/* 2x3 Grid Demo Accounts */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { role: "client1", label: "Client", icon: User },
                  { role: "courier1", label: "Courier", icon: Package },
                  { role: "admin1", label: "Admin", icon: Settings },
                  { role: "supervisor1", label: "Supervisor", icon: Shield },
                  { role: "manager1", label: "Manager", icon: BarChart2 },
                  { role: "owner1", label: "Owner", icon: Crown },
                ].map(({ role, label, icon: IconComponent }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleQuickLogin(role)}
                    className="p-2 bg-[#f0e7d5]/80 hover:bg-[#e6dcbe] active:bg-[#d8ccab] border border-[#cfc0a3] rounded text-[#3d2d1b] flex items-center justify-center gap-1.5 text-xs font-serif shadow-2xs transition cursor-pointer"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-[#853c12]" />
                    <span className="font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Registration link */}
            <div className="mt-4 text-center">
              <Link
                to="/register"
                className="text-xs text-[#853c12] hover:underline font-serif"
              >
                Apply for New Merchant Client Account &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
