import React from 'react';

function StatCard({ title, value, icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className={`p-3 rounded-full mr-4 ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

export default StatCard;