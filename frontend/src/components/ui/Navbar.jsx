import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">

        <Link
          to="/"
          className="font-bold hover:text-blue-600 transition-colors"
        >
          Home
        </Link>

        <nav className="flex gap-6 font-medium text-slate-600">
          <Link
            to="/"
            className="hover:text-blue-600 transition-colors"
          >
            Home
          </Link>

          <Link
            to="/profile"
            className="hover:text-blue-600 transition-colors"
          >
            Profile
          </Link>

              <Link
            to="/about-us"
            className="hover:text-blue-600 transition-colors"
          >
            About Us
          </Link>
        </nav>

      </div>
    </header>
  );
}