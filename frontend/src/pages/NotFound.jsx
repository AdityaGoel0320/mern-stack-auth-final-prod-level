import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-7xl font-bold">404</h1>

      <p className="text-slate-600">Oops! Page not found.</p>

    
    </div>
  );
}