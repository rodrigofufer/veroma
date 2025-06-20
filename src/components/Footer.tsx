import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Building2, Mail, Phone, MapPin, Globe } from 'lucide-react';

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
              Veroma es una plataforma cívica para participación real – desde tu vecindario hasta el mundo entero.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/veroma_civic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/veroma-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/company/veroma"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Acerca de Veroma
                </Link>
              </li>
              <li>
                <Link to="/roles" className="hover:text-white transition-colors flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Roles y Permisos
                </Link>
              </li>
              <li>
                <Link to="/representatives" className="hover:text-white transition-colors flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Representantes
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white transition-colors flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Centro de Ayuda
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-white transition-colors">
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition-colors">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <a href="mailto:hello@veroma.org" className="hover:text-white transition-colors">
                  hello@veroma.org
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Global (Plataforma en línea)</span>
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
            &copy; {new Date().getFullYear()} Veroma. Todos los derechos reservados.
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Plataforma cívica para participación ciudadana global.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Add missing imports
import { Info, Users, HelpCircle } from 'lucide-react';