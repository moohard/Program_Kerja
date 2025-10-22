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
        labels: data.map(item => item.name),
        datasets: [
            {
                label: 'Rata-rata Progress (%)',
                data: data.map(item => item.progress),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // <-- Tambahkan ini
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Progress Rata-Rata',
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
        <div className="bg-white p-4 rounded-lg shadow-md max-h-[500px] h-[500px]"> {/* <-- Ubah padding & tambah tinggi */}
            <Bar data={chartData} options={options} />
        </div>
    );
}

export default CategoryProgressChart;