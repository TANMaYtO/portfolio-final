import React, { useState } from 'react';

/**
 * Portfolio navbar customized for Tanmay Tomar with responsive mobile overlay.
 */
export function Navbar(): React.JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const navLinks = ['Projects', 'Experience', 'Music Archive', 'Skills'];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-10 px-5 sm:px-8 py-4 sm:py-5 flex flex-row justify-between items-center bg-transparent">
        {/* Logo (Left side) */}
        <div className="flex flex-row items-center gap-3">
          <span className="text-[21px] sm:text-[26px] tracking-tight text-black font-medium select-none uppercase">
            Tanmay&reg;
          </span>
          <span className="text-[25px] sm:text-[30px] text-black select-none tracking-[-0.02em] font-medium leading-none mb-1">
            &#10033;
          </span>
        </div>

        {/* Desktop Nav Links (Center) */}
        <nav className="hidden md:flex flex-row items-center text-[23px] text-black">
          {navLinks.map((link, idx) => (
            <React.Fragment key={link}>
              <a href={`#${link.toLowerCase()}`} className="hover:opacity-60 transition-opacity">
                {link}
              </a>
              {idx < navLinks.length - 1 && <span className="opacity-40">,&nbsp;</span>}
            </React.Fragment>
          ))}
        </nav>

        {/* Desktop CTA (Right) */}
        <a
          href="mailto:tomartanmay1109@gmail.com"
          className="hidden md:block text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity font-medium"
        >
          Get in touch
        </a>

        {/* Mobile Hamburger button */}
        <button
          onClick={toggleMenu}
          aria-label="Toggle Mobile Menu"
          className="md:hidden flex flex-col justify-between w-6 h-4 z-20 focus:outline-none relative"
        >
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-[9] bg-white/95 backdrop-blur-sm flex flex-col justify-center items-center gap-8 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-3xl font-medium text-black hover:opacity-60 transition-opacity"
          >
            {link}
          </a>
        ))}
        <a
          href="mailto:tomartanmay1109@gmail.com"
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-3xl font-medium text-black underline underline-offset-4 mt-4"
        >
          Get in touch
        </a>
      </div>
    </>
  );
}
