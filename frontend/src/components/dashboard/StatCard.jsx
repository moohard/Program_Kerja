import React from 'react';

function StatCard({ title, value, icon, color }) {
    const colorClasses = {
        blue: {
            bg: 'bg-primary/10',
            text: 'text-primary',
        },
        green: {
            bg: 'bg-success/10',
            text: 'text-success',
        },
        yellow: {
            bg: 'bg-warning/10',
            text: 'text-warning',
        },
        red: {
            bg: 'bg-danger/10',
            text: 'text-danger',
        },
    };

    const selectedColor = colorClasses[color] || colorClasses.blue;

    return (
        <div className="card">
            <div className="card-body">
                <div className="flex items-center gap-3">
                    <div className={`btn ${selectedColor.bg} ${selectedColor.text} size-12`}>
                        {icon}
                    </div>
                    <div>
                        <h5 className="mb-1 text-base text-heading font-semibold">
                            <span className="counter-value">{value}</span>
                        </h5>
                        <p className="text-default-500">{title}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatCard;