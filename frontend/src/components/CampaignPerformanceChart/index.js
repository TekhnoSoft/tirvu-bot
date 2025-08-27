import React from 'react';
import './ChartStyles.css';

const CampaignPerformanceChart = ({ timeframe }) => {
    // Em um projeto real, você carregaria dados baseados no timeframe

    return (
        <div className="chart-placeholder">
            <div className="chart-bars">
                <div className="chart-bar-group">
                    <div className="chart-bar" style={{ height: '65%', backgroundColor: 'var(--primary)' }}></div>
                    <div className="chart-bar" style={{ height: '40%', backgroundColor: 'var(--info)' }}></div>
                    <div className="chart-label">Seg</div>
                </div>
                <div className="chart-bar-group">
                    <div className="chart-bar" style={{ height: '75%', backgroundColor: 'var(--primary)' }}></div>
                    <div className="chart-bar" style={{ height: '50%', backgroundColor: 'var(--info)' }}></div>
                    <div className="chart-label">Ter</div>
                </div>
                <div className="chart-bar-group">
                    <div className="chart-bar" style={{ height: '85%', backgroundColor: 'var(--primary)' }}></div>
                    <div className="chart-bar" style={{ height: '60%', backgroundColor: 'var(--info)' }}></div>
                    <div className="chart-label">Qua</div>
                </div>
                <div className="chart-bar-group">
                    <div className="chart-bar" style={{ height: '55%', backgroundColor: 'var(--primary)' }}></div>
                    <div className="chart-bar" style={{ height: '35%', backgroundColor: 'var(--info)' }}></div>
                    <div className="chart-label">Qui</div>
                </div>
                <div className="chart-bar-group">
                    <div className="chart-bar" style={{ height: '70%', backgroundColor: 'var(--primary)' }}></div>
                    <div className="chart-bar" style={{ height: '45%', backgroundColor: 'var(--info)' }}></div>
                    <div className="chart-label">Sex</div>
                </div>
                <div className="chart-bar-group">
                    <div className="chart-bar" style={{ height: '60%', backgroundColor: 'var(--primary)' }}></div>
                    <div className="chart-bar" style={{ height: '30%', backgroundColor: 'var(--info)' }}></div>
                    <div className="chart-label">Sáb</div>
                </div>
                <div className="chart-bar-group">
                    <div className="chart-bar" style={{ height: '40%', backgroundColor: 'var(--primary)' }}></div>
                    <div className="chart-bar" style={{ height: '20%', backgroundColor: 'var(--info)' }}></div>
                    <div className="chart-label">Dom</div>
                </div>
            </div>

            <div className="chart-legend">
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: 'var(--primary)' }}></div>
                    <div className="legend-label">Abertura</div>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: 'var(--info)' }}></div>
                    <div className="legend-label">Conversão</div>
                </div>
            </div>
        </div>
    );
};

export default CampaignPerformanceChart;