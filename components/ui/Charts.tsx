import React from 'react';
import { COLORS } from './DesignSystem';

// Line Chart Component
interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showDots?: boolean;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  color = COLORS.primary[500],
  showGrid = true,
  showDots = true,
  className = ''
}) => {
  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const width = 400;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + ((maxValue - point.value) / range) * chartHeight;
    return { x, y, ...point };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-20">
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
              <line
                key={ratio}
                x1={padding}
                y1={padding + ratio * chartHeight}
                x2={width - padding}
                y2={padding + ratio * chartHeight}
                stroke={COLORS.gray[400]}
                strokeWidth="1"
              />
            ))}
          </g>
        )}
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        
        {/* Area fill */}
        <path
          d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`}
          fill={color}
          fillOpacity="0.1"
        />
        
        {/* Data points */}
        {showDots && points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={color}
            className="drop-shadow-sm hover:r-6 transition-all cursor-pointer"
          />
        ))}
      </svg>
      
      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.map((point, index) => (
          <span key={index} className="text-center">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// Bar Chart Component
interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  height?: number;
  showValues?: boolean;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  showValues = true,
  className = ''
}) => {
  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className={`space-y-3 ${className}`}>
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        const color = item.color || COLORS.primary[500];
        
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
              {showValues && (
                <span className="text-gray-500 dark:text-gray-400">
                  {item.value}
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: color
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Donut Chart Component
interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  centerText?: string;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 200,
  centerText,
  className = ''
}) => {
  if (!data.length) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativePercentage = 0;

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={COLORS.gray[200]}
          strokeWidth="20"
        />
        
        {/* Data segments */}
        {data.map((item, index) => {
          const percentage = item.value / total;
          const strokeDasharray = `${percentage * circumference} ${circumference}`;
          const strokeDashoffset = -cumulativePercentage * circumference;
          
          cumulativePercentage += percentage;
          
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="20"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      
      {/* Center text */}
      {centerText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {centerText}
            </div>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {item.label}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Gauge Chart Component
interface GaugeChartProps {
  value: number;
  max: number;
  min?: number;
  label: string;
  size?: number;
  color?: string;
  className?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  max,
  min = 0,
  label,
  size = 200,
  color = COLORS.primary[500],
  className = ''
}) => {
  const radius = size / 2 - 20;
  const circumference = Math.PI * radius; // Half circle
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const strokeDasharray = `${percentage * circumference} ${circumference}`;

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size / 2 + 40} className="overflow-visible">
        {/* Background arc */}
        <path
          d={`M 20 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
          fill="none"
          stroke={COLORS.gray[200]}
          strokeWidth="20"
          strokeLinecap="round"
        />
        
        {/* Value arc */}
        <path
          d={`M 20 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {label}
        </div>
      </div>
    </div>
  );
};

// Heatmap Component
interface HeatmapProps {
  data: Array<Array<{ value: number; label?: string }>>;
  colorScale?: string[];
  cellSize?: number;
  className?: string;
}

export const Heatmap: React.FC<HeatmapProps> = ({
  data,
  colorScale = [COLORS.gray[100], COLORS.primary[200], COLORS.primary[500], COLORS.primary[700]],
  cellSize = 20,
  className = ''
}) => {
  if (!data.length) return null;

  const flatData = data.flat();
  const maxValue = Math.max(...flatData.map(d => d.value));
  const minValue = Math.min(...flatData.map(d => d.value));
  const range = maxValue - minValue || 1;

  const getColor = (value: number) => {
    const normalized = (value - minValue) / range;
    const index = Math.floor(normalized * (colorScale.length - 1));
    return colorScale[Math.min(index, colorScale.length - 1)];
  };

  return (
    <div className={className}>
      <svg 
        width={data[0].length * (cellSize + 2)} 
        height={data.length * (cellSize + 2)}
        className="overflow-visible"
      >
        {data.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex * (cellSize + 2)}
              y={rowIndex * (cellSize + 2)}
              width={cellSize}
              height={cellSize}
              fill={getColor(cell.value)}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              title={cell.label || `${cell.value}`}
            />
          ))
        )}
      </svg>
    </div>
  );
};
