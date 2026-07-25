const Home = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">

      {/* ================= BACKGROUND IMAGE ================= */}
      <img
        src="https://images.unsplash.com/photo-1557404763-69708cd8b9ce?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="City traffic"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* ================= DARK GRADIENT ================= */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10" />

      {/* ================= NAVBAR ================= */}
      <header className="relative z-20 flex h-20 items-center justify-between px-6 text-white md:px-12 lg:px-16">

        {/* Uber Logo */}
        <div className="text-3xl font-bold tracking-tight">
          Rider
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">

          <a
            href="#"
            className="text-sm font-medium transition hover:text-gray-300"
          >
            Ride
          </a>

          <a
            href="#"
            className="text-sm font-medium transition hover:text-gray-300"
          >
            Drive
          </a>

          <a
            href="#"
            className="text-sm font-medium transition hover:text-gray-300"
          >
            Business
          </a>

          <a
            href="#"
            className="text-sm font-medium transition hover:text-gray-300"
          >
            About
          </a>

        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">

          <button className="rounded-full px-5 py-2.5 text-sm font-medium transition hover:bg-white/15">
            Log in
          </button>

          <button className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200">
            Sign up
          </button>

        </div>

      </header>


      {/* ================= HERO CONTENT ================= */}
      <main className="relative z-10 flex min-h-[calc(100vh-80px)] items-center px-6 md:px-12 lg:px-16">

        <div className="max-w-2xl text-white">

         

          {/* Main Heading */}
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Go anywhere.
            <br />
            Get there.
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-xl text-base leading-relaxed text-gray-200 md:text-lg">
            Request a ride and get where you need to go.
            Fast, reliable, and available whenever you need it.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-wrap gap-4">

            <button className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-black shadow-lg transition hover:-translate-y-1 hover:bg-gray-100">
              Get a ride
            </button>

            <button className="rounded-full border border-white/70 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white hover:text-black">
              Drive with Uber
            </button>

          </div>

        </div>

      </main>


      {/* ================= BOTTOM INFO ================= */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between text-white md:left-12 md:right-12 lg:left-16 lg:right-16">

        

        

      </div>

    </div>
  );
};

export default Home;