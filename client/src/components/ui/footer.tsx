import { motion } from "framer-motion";
import { 
  Sparkles, 
  Heart, 
  Zap,
  Github,
  Twitter,
  Globe
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-space-black to-deep-black border-t border-purple-500/20 relative overflow-hidden">
      {/* Floating Magic Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-10, -30, -10],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center neural-pulse">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  Magic AI Studio
                </h3>
                <p className="text-xs text-gray-400">Maya's Neural Kingdom</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Where <span className="text-yellow-400 font-semibold">Jadoo</span> meets 
              Oscar-winning AI magic. Create cinematic masterpieces with the power of 
              neural intelligence.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-yellow-400" />
              Magic Portals
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Neural Genesis", href: "/create" },
                { name: "Jadoo Marketplace", href: "/marketplace" },
                { name: "Vision Gallery", href: "/gallery" },
                { name: "AI Training", href: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social & Connect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Globe className="h-4 w-4 mr-2 text-cyan-400" />
              Connect with Maya
            </h4>
            <div className="flex space-x-4 mb-4">
              {[
                { icon: Github, href: "#", color: "text-gray-400 hover:text-white" },
                { icon: Twitter, href: "#", color: "text-gray-400 hover:text-blue-400" },
                { icon: Globe, href: "https://cognomega.com", color: "text-gray-400 hover:text-purple-400" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className={`${social.color} transition-colors`}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              Deploy on{" "}
              <span className="text-cyan-400 font-semibold">cognomega.com</span>
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className="border-t border-purple-500/20 pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="text-gray-400 text-sm mb-4 md:mb-0 flex items-center">
            Made with{" "}
            <Heart className="h-4 w-4 mx-2 text-red-400 neural-pulse" />
            by AI Magic
          </p>
          <p className="text-gray-500 text-xs">
            © 2025 Magic AI Studio. All spells reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}