import React from 'react';
import './ChartStyles.css';

const EngagementChart = () => {
  const channels = [
    { name: 'Email', value: 45, color: 'var(--primary)' },
    { name: 'WhatsApp', value: 30, color: 'var(--success)' },
    { name: 'SMS', value: 15, color: 'var(--info)' },
    { name: 'Redes Sociais', value: 10, color: 'var(--warning)' }
  ];
  
  const total = channels.reduce((sum, channel) => sum + channel.value, 0);
  
  let startAngle = 0;
  
  return (
    <div className="chart-placeholder">
      <div className="chart-pie">
        <svg width="120" height="120" viewBox="0 0 120 120">
          {channels.map((channel, index) => {
            const angle = (channel.value / total) * 360;
            const endAngle = startAngle + angle;
            
            // Converte ângulos para coordenadas
            const startRadians = (startAngle - 90) * Math.PI / 180;
            const endRadians = (endAngle - 90) * Math.PI / 180;
            
            const startX = 60 + 50 * Math.cos(startRadians);
            const startY = 60 + 50 * Math.sin(startRadians);
            const endX = 60 + 50 * Math.cos(endRadians);
            const endY = 60 + 50 * Math.sin(endRadians);
            
            // Determina se o arco é maior que 180 graus
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            // Cria o caminho do arco
            const path = [
              `M 60 60`,
              `L ${startX} ${startY}`,
              `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `Z`
            ].join(' ');
            
            // Atualiza o ângulo inicial para o próximo segmento
            startAngle = endAngle;
            
            return (
              <path 
                key={index} 
                d={path} 
                fill={channel.color} 
              />
            );
          })}
        </svg>
      </div>
      
      <div className="chart-legend vertical">
        {channels.map((channel, index) => (
          <div key={index} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: channel.color }}></div>
            <div className="legend-label">{channel.name}</div>
            <div className="legend-value">{channel.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngagementChart;