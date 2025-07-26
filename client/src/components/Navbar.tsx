import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import gsap from "gsap";

const links = [
  { name: "Musics", path: "/musics" },
  { name: "Upload", path: "/upload" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!menuRef.current) return;

    if (isOpen) {
      gsap.to(menuRef.current, {
        height: "auto",
        duration: 0.3,
        ease: "power2.out",
        opacity: 1,
        display: "block",
        paddingTop: "1rem",
        paddingBottom: "1rem",
      });
    } else {
      gsap.to(menuRef.current, {
        height: 0,
        duration: 0.3,
        ease: "power2.in",
        opacity: 0,
        paddingTop: 0,
        paddingBottom: 0,
        onComplete: () => {
          if (menuRef.current) {
            menuRef.current.style.display = "none";
          }
        },
      });
    }
  }, [isOpen]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <h1 className="select-none font-semibold italic text-xl sm:text-2xl md:text-3xl text-gray-900 flex items-center">
          {/* Mobile: tighter letters + music icon right next to it */}
          <span className="flex items-center text-blue-600 sm:hidden tracking-tight">
            <span className="mr-0.5">WmV</span>
            <svg
              className="w-6 h-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
            </svg>
          </span>

          {/* Desktop: full text + icon with normal spacing */}
          <span className="hidden sm:flex items-center tracking-wide">
            Web Music Vault
            <svg
              className="w-5 h-5 ml-1 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
            </svg>
          </span>
        </h1>

        {/* Desktop navigation */}
        <ul className="hidden md:flex space-x-8">
          {links.map(({ name, path }) => (
            <li key={name}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 underline font-semibold"
                    : "text-gray-700 hover:text-blue-600 transition-colors duration-200"
                }
              >
                {name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Hamburger button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <ul
        ref={menuRef}
        className="md:hidden bg-white overflow-hidden px-6 border-t border-gray-200 opacity-0"
        style={{ display: "none", height: 0, paddingTop: 0, paddingBottom: 0 }}
      >
        {links.map(({ name, path }) => (
          <li key={name}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                isActive
                  ? "block text-blue-600 underline font-semibold py-2"
                  : "block text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2"
              }
              onClick={() => setIsOpen(false)}
            >
              {name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
