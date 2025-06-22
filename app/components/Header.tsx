export default function Header() {
  return (
    <header className="w-full py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-agnp-orange rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">AGNP</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">ABIERTO GNP SEGUROS</h1>
              <p className="text-sm text-white/60">WTA 500</p>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-agnp-yellow font-semibold">16-23 AGOSTO 2025</p>
            <p className="text-white/80">MONTERREY</p>
          </div>
        </div>
      </div>
    </header>
  );
}