import React from 'react';
import { SubjectConfig } from '../types';

interface SubjectCardProps {
  config: SubjectConfig;
  onClick: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ config, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden group p-6 rounded-3xl text-right transition-all duration-300 transform hover:scale-105 hover:shadow-xl
        bg-white border-2 border-transparent hover:border-${config.color}-400
        shadow-md h-full flex flex-col
      `}
    >
      <div className={`absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl`}>
        {config.icon}
      </div>
      
      <div className="z-10 mt-auto">
        <span className="text-4xl mb-3 block">{config.icon}</span>
        <h3 className="text-xl font-bold text-gray-800 mb-1">{config.name}</h3>
        <p className="text-sm text-gray-500 font-medium">{config.description}</p>
      </div>
      
      <div className={`absolute inset-0 bg-${config.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
    </button>
  );
};

export default SubjectCard;