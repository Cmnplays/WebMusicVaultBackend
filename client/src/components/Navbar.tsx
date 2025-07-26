import { Link } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <Link to="/musics">
          <h1 className="select-none font-semibold italic text-xl sm:text-2xl md:text-3xl text-gray-900 flex items-center cursor-pointer">
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
          </h1>
        </Link>

        {/* Hamburger button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-800 sm:hidden focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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

      {/* Mobile nav (optional) */}
      {isOpen && (
        <div className="sm:hidden px-6 pb-4">
          <ul className="space-y-2">
            <li>
              <Link to="/musics" className="block text-gray-800 font-medium">
                Musics
              </Link>
            </li>
            <li>
              <Link to="/upload" className="block text-gray-800 font-medium">
                Upload
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
