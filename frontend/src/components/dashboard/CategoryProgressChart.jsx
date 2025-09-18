import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function CategoryProgressChart({ data }) {
    const chartData = {
        labels: data.map(item => item.category_name),
        datasets: [
            {
                label: 'Rata-rata Progress (%)',
                data: data.map(item => item.average_progress),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Progress Rata-Rata per Kategori Utama',
                font: { size: 16 }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Persentase (%)'
                }
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <Bar data={chartData} options={options} />
        </div>
    );
}

export default CategoryProgressChart;