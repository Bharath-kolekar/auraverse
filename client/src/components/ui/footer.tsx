import { Link } from "wouter";
import { Github, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-deep-black border-t border-gray-800 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
              Infinite Intelligence
            </h3>
            <p className="text-gray-400 text-sm">
              Creating Oscar-quality content with AI-powered tools for the next generation of creators.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Product</h4>
            <div className="space-y-2">
              <Link href="/create">
                <a className="block text-sm text-gray-400 hover:text-electric-blue transition-colors">Create</a>
              </Link>
              <Link href="/marketplace">
                <a className="block text-sm text-gray-400 hover:text-electric-blue transition-colors">Marketplace</a>
              </Link>
              <Link href="/gallery">
                <a className="block text-sm text-gray-400 hover:text-electric-blue transition-colors">Gallery</a>
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Features</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Voice Commands</p>
              <p className="text-sm text-gray-400">AI Video Generation</p>
              <p className="text-sm text-gray-400">VFX & CGI</p>
              <p className="text-sm text-gray-400">Multi-device Recording</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2025 Infinite Intelligence. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}