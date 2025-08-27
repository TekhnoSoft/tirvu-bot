import React from 'react';
import './ChartStyles.css';

const LeadsGrowthChart = ({ timeframe }) => {
  return (
    <div className="chart-placeholder">
      <div className="chart-area">
        <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Área do gráfico */}
          <path 
            d="M0,120 C20,100 40,110 60,90 C80,70 100,60 120,50 C140,40 160,45 180,30 C200,15 220,25 240,20 C260,15 280,10 300,5 L300,150 L0,150 Z" 
            fill="url(#areaGradient)" 
          />
          
          {/* Linha do gráfico */}
          <path 
            d="M0,120 C20,100 40,110 60,90 C80,70 100,60 120,50 C140,40 160,45 180,30 C200,15 220,25 240,20 C260,15 280,10 300,5" 
            fill="none" 
            stroke="var(--primary)" 
            strokeWidth="2" 
          />
          
          {/* Pontos de dados */}
          <circle cx="0" cy="120" r="4" fill="var(--primary)" />
          <circle cx="60" cy="90" r="4" fill="var(--primary)" />
          <circle cx="120" cy="50" r="4" fill="var(--primary)" />
          <circle cx="180" cy="30" r="4" fill="var(--primary)" />
          <circle cx="240" cy="20" r="4" fill="var(--primary)" />
          <circle cx="300" cy="5" r="4" fill="var(--primary)" />
        </svg>
        
        <div className="chart-labels-x">
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
          <span>Dom</span>
        </div>
      </div>
      
      <div className="chart-summary">
        <div className="chart-summary-item">
          <span className="summary-label">Total</span>
          <span className="summary-value">+487</span>
        </div>
        <div className="chart-summary-item">
          <span className="summary-label">Média Diária</span>
          <span className="summary-value">69.5</span>
        </div>
      </div>
    </div>
  );
};

export default LeadsGrowthChart;