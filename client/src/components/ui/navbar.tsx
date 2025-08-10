import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { VoiceIndicator } from "./voice-indicator";
import { Button } from "./button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Sparkles, User, Settings, LogOut } from "lucide-react";
import type { User as UserType } from "@shared/schema";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const typedUser = user as UserType | undefined;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-deep-black/90 backdrop-blur-lg border-b border-gray-800">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-neon-purple bg-clip-text text-transparent">
              Infinite Intelligence
            </h1>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/">
            <a className="hover:text-electric-blue transition-colors duration-300">Home</a>
          </Link>
          <Link href="/create">
            <a className="hover:text-electric-blue transition-colors duration-300">Create</a>
          </Link>
          <Link href="/marketplace">
            <a className="hover:text-electric-blue transition-colors duration-300">Marketplace</a>
          </Link>
          <Link href="/gallery">
            <a className="hover:text-electric-blue transition-colors duration-300">Gallery</a>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <VoiceIndicator />
          
          {isAuthenticated && typedUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={typedUser.profileImageUrl || undefined} alt={typedUser.firstName || "User"} />
                    <AvatarFallback className="bg-gradient-to-r from-electric-blue to-neon-purple">
                      {typedUser.firstName?.charAt(0) || typedUser.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {typedUser.firstName && (
                      <p className="font-medium">{typedUser.firstName} {typedUser.lastName}</p>
                    )}
                    {typedUser.email && (
                      <p className="w-[200px] truncate text-sm text-gray-400">
                        {typedUser.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <a href="/api/logout" className="flex items-center w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <a href="/api/login">
              <Button className="bg-gradient-to-r from-electric-blue to-neon-purple hover:shadow-lg hover:shadow-electric-blue/30 transition-all duration-300">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}