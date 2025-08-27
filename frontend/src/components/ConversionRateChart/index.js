import React from 'react';
import './ChartStyles.css';

const ConversionRateChart = ({ timeframe }) => {
  return (
    <div className="chart-placeholder">
      <div className="chart-donut">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle 
            cx="60" 
            cy="60" 
            r="54" 
            fill="none" 
            stroke="var(--gray-200)" 
            strokeWidth="12" 
          />
          <circle 
            cx="60" 
            cy="60" 
            r="54" 
            fill="none" 
            stroke="var(--primary)" 
            strokeWidth="12" 
            strokeDasharray="339.3" 
            strokeDashoffset="254.5" 
            transform="rotate(-90 60 60)" 
          />
          <text 
            x="60" 
            y="65" 
            textAnchor="middle" 
            fontSize="24" 
            fontWeight="bold" 
            fill="var(--gray-900)"
          >
            25%
          </text>
        </svg>
      </div>
      
      <div className="conversion-stats">
        <div className="conversion-stat">
          <div className="conversion-label">Abriram</div>
          <div className="conversion-value">68%</div>
          <div className="conversion-bar">
            <div className="conversion-progress" style={{ width: '68%', backgroundColor: 'var(--info)' }}></div>
          </div>
        </div>
        <div className="conversion-stat">
          <div className="conversion-label">Clicaram</div>
          <div className="conversion-value">42%</div>
          <div className="conversion-bar">
            <div className="conversion-progress" style={{ width: '42%', backgroundColor: 'var(--warning)' }}></div>
          </div>
        </div>
        <div className="conversion-stat">
          <div className="conversion-label">Converteram</div>
          <div className="conversion-value">25%</div>
          <div className="conversion-bar">
            <div className="conversion-progress" style={{ width: '25%', backgroundColor: 'var(--primary)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionRateChart;