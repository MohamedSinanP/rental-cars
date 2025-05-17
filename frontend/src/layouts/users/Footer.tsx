import React from "react";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import { FooterLink } from "../../types/types";


const Footer: React.FC = () => {
  const sections: { title: string; links: FooterLink[] }[] = [
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "#" },
        { name: "News", href: "#" },
      ],
    },
    {
      title: "Follow us",
      links: [
        { name: "Github", href: "https://github.com/MohamedSinanP/rental-cars", external: true },
        { name: "Discord", href: "#", external: true },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Terms & Conditions", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Logo />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                  {section.title}
                </h2>
                <ul className="text-gray-500 dark:text-gray-400 font-medium">
                  {section.links.map((link) => (
                    <li key={link.name} className="mb-4">
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link to={link.href} className="hover:underline">
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2023 <Link to="/" className="hover:underline">OwnCars™</Link>. All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            {["Facebook", "Discord", "Twitter", "GitHub", "Instagram"].map((platform, index) => (
              <a
                key={platform}
                href="#"
                className={`text-gray-500 hover:text-gray-900 dark:hover:text-white ${index !== 0 ? "ms-5" : ""}`}
              >
                <span className="sr-only">{platform} page</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
