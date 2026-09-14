export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} MyApp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}