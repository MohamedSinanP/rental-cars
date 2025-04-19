import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="https://flowbite.com/" className="flex items-center">
              <img
                src="https://flowbite.com/docs/images/logo.svg"
                className="h-8 me-3"
                alt="FlowBite Logo"
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                Flowbite
              </span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            {[
              {
                title: "Resources",
                links: [
                  { name: "Flowbite", href: "https://flowbite.com/" },
                  { name: "Tailwind CSS", href: "https://tailwindcss.com/" },
                ],
              },
              {
                title: "Follow us",
                links: [
                  { name: "Github", href: "https://github.com/themesberg/flowbite" },
                  { name: "Discord", href: "https://discord.gg/4eeurUVvTy" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { name: "Privacy Policy", href: "#" },
                  { name: "Terms & Conditions", href: "#" },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                  {section.title}
                </h2>
                <ul className="text-gray-500 dark:text-gray-400 font-medium">
                  {section.links.map((link) => (
                    <li key={link.name} className="mb-4">
                      <a href={link.href} className="hover:underline">
                        {link.name}
                      </a>
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
            © 2023 <a href="https://flowbite.com/" className="hover:underline">Flowbite™</a>. All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            {["Facebook", "Discord", "Twitter", "GitHub", "Instagram"].map((platform, index) => (
              <a
                key={platform}
                href="#"
                className={`text-gray-500 hover:text-gray-900 dark:hover:text-white ${index !== 0 ? "ms-5" : ""
                  }`}
              >
                <span className="sr-only">{platform} page</span>
                {/* Replace with respective SVGs */}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
