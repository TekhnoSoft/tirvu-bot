import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMainContext } from '../../helpers/MainContext';
import Logo from '../Logo';
import './style.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { user, logout } = useMainContext();
  const [activeItem, setActiveItem] = useState('');
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Define o item ativo com base na URL atual
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveItem('dashboard');
    } else {
      // Remove a barra inicial e pega o primeiro segmento da URL
      const segment = path.substring(1).split('/')[0];
      setActiveItem(segment);
    }
  }, [location]);

  // Detecta se é dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Lista completa de itens do menu
  const allMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      path: '/',
      priority: 1
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: 'fas fa-users',
      path: '/leads',
      priority: 3
    },
    /*{
      id: 'campaigns',
      label: 'Campanhas',
      icon: 'fas fa-bullhorn',
      path: '/campaigns',
      priority: 2
    },*/
    {
      id: 'automation',
      label: 'Automação',
      icon: 'fas fa-robot',
      path: '/automation',
      priority: 4
    },
    /*{
      id: 'conversations',
      label: 'Conversas',
      icon: 'fa-solid fa-comments',
      path: '/conversations',
      priority: 6
    },*/
    {
      id: 'instances',
      label: 'Instâncias',
      icon: 'fas fa-server',
      path: '/instances',
      priority: 5
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'fas fa-chart-line',
      path: '/analytics',
      priority: 6
    },
    /*{
      id: 'settings',
      label: 'Configurações',
      icon: 'fas fa-cog',
      path: '/settings',
      priority: 7
    },*/
  ];

  // Itens para o bottom tab (5 principais)
  const bottomTabItems = allMenuItems
    .filter(item => item.priority <= 5)
    .sort((a, b) => a.priority - b.priority);

  // Itens para o drawer (restantes)
  const drawerItems = allMenuItems
    .filter(item => item.priority > 5)
    .sort((a, b) => a.priority - b.priority);

  // Função para lidar com o logout
  const handleLogout = () => {
    logout(true);
  };

  // Função para abrir/fechar o drawer mobile
  const toggleMobileDrawer = () => {
    setShowMobileDrawer(!showMobileDrawer);
  };

  // Fecha o drawer ao clicar em um item
  const handleItemClick = () => {
    if (isMobile && showMobileDrawer) {
      setShowMobileDrawer(false);
    }
  };

  return (
    <>
      {/* Sidebar para desktop */}
      <div className={`sidebar desktop-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <Logo size={isOpen ? 'medium' : 'small'} />
          </Link>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`fas ${isOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>

        <div className="sidebar-content">
          <nav className="sidebar-nav">
            <ul className="sidebar-menu">
              {allMenuItems.map((item) => (
                <li key={item.id} className={`sidebar-menu-item ${activeItem === item.id ? 'active' : ''}`}>
                  <Link to={item.path} className="sidebar-menu-link" onClick={handleItemClick}>
                    <i className={`sidebar-menu-icon ${item.icon}`}></i>
                    {isOpen && <span className="sidebar-menu-text">{item.label}</span>}
                    {!isOpen && <span className="sidebar-tooltip">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="sidebar-footer">
          {isOpen && user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name || 'Usuário'}</div>
                <div className="sidebar-user-email">{user.email || ''}</div>
              </div>
            </div>
          )}
          
          <button className="sidebar-logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt sidebar-logout-icon"></i>
            {isOpen && <span className="sidebar-logout-text">Sair</span>}
            {!isOpen && <span className="sidebar-tooltip">Sair</span>}
          </button>
        </div>
      </div>
      
      {/* Bottom Tab Navigation para mobile */}
      <div className="mobile-tab-nav">
        {bottomTabItems.map((item) => (
          <Link 
            key={item.id} 
            to={item.path} 
            className={`mobile-tab-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={handleItemClick}
          >
            <i className={`mobile-tab-icon ${item.icon}`}></i>
            <span className="mobile-tab-text">{item.label}</span>
          </Link>
        ))}
        
        <button 
          className={`mobile-tab-item mobile-menu-button ${showMobileDrawer ? 'active' : ''}`}
          onClick={toggleMobileDrawer}
        >
          <i className="mobile-tab-icon fas fa-ellipsis-h"></i>
          <span className="mobile-tab-text">Menu</span>
        </button>
      </div>
      
      {/* Mobile Drawer Menu */}
      <div className={`mobile-drawer ${showMobileDrawer ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-user">
            {user && (
              <>
                <div className="mobile-drawer-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="mobile-drawer-user-info">
                  <div className="mobile-drawer-user-name">{user.name || 'Usuário'}</div>
                  <div className="mobile-drawer-user-email">{user.email || ''}</div>
                </div>
              </>
            )}
            <button className="mobile-drawer-close" onClick={toggleMobileDrawer}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div className="mobile-drawer-content">
          <nav className="mobile-drawer-nav">
            <ul className="mobile-drawer-menu">
              {drawerItems.map((item) => (
                <li key={item.id} className={`mobile-drawer-item ${activeItem === item.id ? 'active' : ''}`}>
                  <Link to={item.path} className="mobile-drawer-link" onClick={handleItemClick}>
                    <i className={`mobile-drawer-icon ${item.icon}`}></i>
                    <span className="mobile-drawer-text">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        <div className="mobile-drawer-footer">
          <button className="mobile-drawer-logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Sair</span>
          </button>
        </div>
      </div>
      
      {/* Overlay para mobile drawer */}
      {showMobileDrawer && (
        <div className="mobile-drawer-overlay" onClick={toggleMobileDrawer}></div>
      )}
      
      {/* Overlay para sidebar em telas médias */}
      {isOpen && !isMobile && window.innerWidth <= 992 && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;