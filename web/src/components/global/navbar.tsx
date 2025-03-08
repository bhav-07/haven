import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "../logo/logo-shape";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/my-profile", label: "Profile" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="fixed inset-x-0 top-1 flex justify-center p-2 pointer-events-none z-50">
      <nav className="pointer-events-auto bg-neutral-600 rounded-full backdrop-blur-md max-w-7xl w-full h-14 flex flex-row justify-center items-center">
        <div className="flex flex-row justify-between w-full px-6">
          {/* Logo and Brand */}
          <a
            href="/"
            className="md:text-3xl text-2xl font-serif flex flex-row items-center gap-1"
          >
            <Logo variant="gradient2" className="md:size-[24px] size-4" />
            <span>Haven</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-lg hover:text-neutral-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full mt-2 w-full bg-[#414345] rounded-lg shadow-lg border-slate-300 border-opacity-40 border-2 py-4 px-6 md:hidden">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-lg hover:text-slate-300 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
