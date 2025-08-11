import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Home, 
  Plus, 
  ShoppingBag, 
  Image as Gallery, 
  Sparkles,
  LogOut,
  Brain
} from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/create", label: "Create", icon: Plus },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/gallery", label: "Gallery", icon: Gallery },
  ];

  return (
    <motion.nav 
      className="fixed top-0 w-full z-50 bg-space-black/80 backdrop-blur-xl border-b border-purple-500/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <motion.div 
              className="flex items-center space-x-4 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Stunning Brain Icon with Advanced Glow Effect */}
              <div className="relative logo-float-effect">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 rounded-2xl blur-xl opacity-50 animate-pulse animation-delay-1000"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-purple-600 via-cyan-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:rotate-12 logo-glow-effect">
                  <Brain className="h-8 w-8 text-white drop-shadow-lg animate-pulse" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-white/0 to-white/30 shimmer-text"></div>
                </div>
              </div>
              
              {/* Stunning Text Logo */}
              <div className="flex flex-col">
                <div className="flex items-baseline space-x-2">
                  <h1 className="text-3xl font-black tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 drop-shadow-sm">
                      COGNO
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 drop-shadow-sm">
                      MEGA
                    </span>
                  </h1>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <div className="h-px w-4 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                  <p className="text-[11px] font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 uppercase">
                    Production Intelligence
                  </p>
                  <div className="h-px w-4 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer group ${
                    location === item.href
                      ? "bg-gradient-to-r from-purple-600/30 to-cyan-600/30 text-white border border-purple-500/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              </Link>
            ))}

            {/* Logout Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                onClick={() => window.location.href = "/api/logout"}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}