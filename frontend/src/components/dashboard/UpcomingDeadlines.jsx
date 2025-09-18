import React from 'react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

function UpcomingDeadlines({ data }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mendekati Tenggat Waktu (7 Hari)</h3>
            <div className="space-y-4">
                {data.length > 0 ? (
                    data.map(item => (
                        <div key={item.id} className="border-l-4 border-yellow-400 pl-4">
                            <p className="font-semibold text-sm text-gray-700">{item.deskripsi_aksi}</p>
                            <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                <span>
                                    Tenggat: {format(parseISO(item.target_tanggal), 'dd MMMM yyyy', { locale: id })}
                                </span>
                                {item.assigned_user && <span>PIC: {item.assigned_user.name}</span>}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">Tidak ada tugas yang mendekati tenggat waktu.</p>
                )}
            </div>
        </div>
    );
}

export default UpcomingDeadlines;