export default function Navbar() {
  return (
    <nav className="bg-slate-800 text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          Dashboard Mieszkaniowy Polski
        </h1>
        <p className="text-slate-400 text-sm">
          Dane: GUS BDL + NBP
        </p>
      </div>
    </nav>
  );
}
