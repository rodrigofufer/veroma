import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Globe, Info, Users, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link to="/">
              <img 
                src="/logowh2.png" 
                alt="Veroma" 
                className="h-8 w-auto mb-4"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = '/logowh.png';
                }}
              />
            </Link>
            <p className="text-sm mb-4">
              Veroma is a civic platform for real participation – from your neighborhood to the world.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  About Veroma
                </Link>
              </li>
              <li>
                <Link to="/roles" className="hover:text-white transition-colors flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Roles & Permissions
                </Link>
              </li>
              <li>
                <Link to="/representatives" className="hover:text-white transition-colors flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Representatives
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white transition-colors flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-white transition-colors">
                  Legal Notice
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <a href="mailto:hello@veroma.org" className="hover:text-white transition-colors">
                  hello@veroma.org
                </a>
              </li>
              <li className="flex items-start">
                <Globe className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <a href="https://veroma.org" className="hover:text-white transition-colors">
                  www.veroma.org
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Veroma. All rights reserved.
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Global civic platform for citizen participation.
          </p>
        </div>
      </div>
    </footer>
  );
}