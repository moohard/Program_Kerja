import React from 'react';
import { FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const RecentActivity = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h3>
                <p className="text-sm text-gray-500">Tidak ada aktivitas terbaru.</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h3>
            <div className="max-h-96 overflow-y-auto pr-2">
                <ul className="space-y-4">
                    {data.map((activity) => (
                        <li key={activity.id} className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {activity.user ? activity.user.name.charAt(0) : '?'}
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: activity.description }} />
                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                    <FiClock className="mr-1" />
                                    <span>
                                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: id })}
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default RecentActivity;
