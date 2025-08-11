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
import { LogoAdvanced } from "@/components/logos/LogoAdvanced";

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
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogoAdvanced size="default" />
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