"use client";

import Link from "next/link";

import navLinks from "@/data/navLinks";

const NavBar = () => {
  return (
    <div className="w-full">
      <div className="flex justify-center items-center w-full lg:h-full px-2 2xl:px-16 h-[0px] p-0 m-0">
        <div className="h-6 overflow-y-hidden">
          <ul className="hidden lg:flex">
            {navLinks.map((link) => (
              <li
                key={link.href}
                className="text-black ml-10 text-sm uppercase hover:border-pink hover:border-b-4"
              >
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
