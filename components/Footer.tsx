"use client";

import React from "react";
import { Layout } from "antd";
import {
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Footer: AntFooter } = Layout;

const Footer: React.FC = () => {
  return (
    <AntFooter className="bg-gray-200! text-gray-800 py-6 px-6 mt-10 border-t border-gray-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Logo & About */}
        <div>
          <h2 className="text-gray-900 text-lg font-bold mb-3">CryptoTab</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Stay ahead of the crypto market. Get real-time prices, news, and insights in one place.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-gray-900 font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/cryptocurrencies"
                className="hover:text-blue-600 transition-colors"
              >
                Cryptocurrencies
              </Link>
            </li>
            <li>
              <Link href="/exchanges" className="hover:text-blue-600 transition-colors">
                Exchanges
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-blue-600 transition-colors">
                News
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-gray-900 font-semibold mb-3">Resources</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="hover:text-blue-600 transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-gray-900 font-semibold mb-3">Follow Us</h3>
          <div className="flex space-x-4 text-lg">
            <Link
              href="https://github.com"
              target="_blank"
              className="hover:text-blue-600"
            >
              <GithubOutlined />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              className="hover:text-blue-600"
            >
              <TwitterOutlined />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              className="hover:text-blue-600"
            >
              <LinkedinOutlined />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-400 mt-6 pt-3 text-center text-gray-700 text-sm">
        © {new Date().getFullYear()} CryptoTab. All rights reserved.
      </div>
    </AntFooter>
  );
};

export default Footer;
