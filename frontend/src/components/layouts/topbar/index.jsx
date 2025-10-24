import { Link } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import SidenavToggle from './SidenavToggle';
import { LuBellRing, LuLogOut, LuMail, LuUser } from 'react-icons/lu';
import useAuth from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import DefaultAvatar from '@/assets/images/user/avatar-11.png';

const ProfileDropdown = () => {
    const { user, logout } = useAuth();

    const profileMenu = [
        {
            icon: <LuUser className="size-4" />,
            label: 'Profil Saya',
            to: '/profile',
        },
        {
            icon: <LuMail className="size-4" />,
            label: 'Inbox',
            to: '/mailbox',
        },
        {
            divider: true,
        },
        {
            icon: <LuLogOut className="size-4" />,
            label: 'Sign Out',
            action: () => logout(),
        },
    ];

    return (
        <div className="topbar-item hs-dropdown relative inline-flex">
            <button className="hs-dropdown-toggle cursor-pointer rounded-full">
                <img src={user?.photo_url || DefaultAvatar} alt="user" className="rounded-full size-9.5" />
            </button>
            <div className="hs-dropdown-menu min-w-48">
                <div className="p-2">
                    <Link to="#!" className="flex gap-3">
                        <div className="relative inline-block">
                            <img src={user?.photo_url || DefaultAvatar} alt="user" className="size-12 rounded" />
                            <span className="-top-1 -end-1 absolute w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
                        </div>
                        <div>
                            <h6 className="mb-1 text-sm font-semibold text-default-800">{user?.name}</h6>
                            <p className="text-default-500 text-xs">{user?.jabatan?.nama_jabatan}</p>
                        </div>
                    </Link>
                </div>
                <div className="border-t border-default-200 -mx-2 my-2"></div>
                <div className="flex flex-col gap-y-1">
                    {profileMenu.map((item, i) => {
                        if (item.divider) {
                            return <div key={i} className="border-t border-default-200 -mx-2 my-1"></div>;
                        }
                        if (item.action) {
                            return (
                                <button key={i} onClick={item.action} className="flex items-center gap-x-3.5 py-1.5 px-3 text-default-600 hover:bg-default-150 rounded font-medium w-full text-left">
                                    {item.icon}
                                    {item.label}
                                </button>
                            );
                        }
                        return (
                            <Link key={i} to={item.to || '#!'} className="flex items-center gap-x-3.5 py-1.5 px-3 text-default-600 hover:bg-default-150 rounded font-medium">
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};


const NotificationDropdown = () => {
    const { notifications, unreadCount, markAllAsRead } = useNotifications();

    return (
        <div className="topbar-item hs-dropdown [--auto-close:inside] relative inline-flex">
            <button type="button" className="hs-dropdown-toggle btn btn-icon size-8 hover:bg-default-150 rounded-full relative">
                <LuBellRing className="size-4.5" />
                {unreadCount > 0 && (
                    <span className="absolute end-1 top-1.5 size-4 flex items-center justify-center text-xs font-medium bg-primary text-white rounded-full">{unreadCount}</span>
                )}
            </button>
            <div className="hs-dropdown-menu max-w-sm w-full p-0">
                <div className="p-4 border-b border-default-200 flex items-center justify-between">
                    <h3 className="text-base text-default-800">Notifikasi</h3>
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-primary text-sm font-medium">
                            Tandai semua dibaca
                        </button>
                    )}
                </div>

                <SimpleBar className="h-80">
                    {notifications?.length === 0 ? (
                        <div className="text-center p-4 text-default-500">
                            Tidak ada notifikasi baru.
                        </div>
                    ) : (
                        notifications?.map((notif) => (
                            <Link key={notif.id} to={notif.data.url || '#!'} className={`flex gap-3 p-4 items-start hover:bg-default-150 ${!notif.read_at ? 'bg-blue-50' : ''}`}>
                                <div className="flex-grow">
                                    <h6 className="mb-1 font-medium text-default-800 text-sm" dangerouslySetInnerHTML={{ __html: notif.data.message }}></h6>
                                    <p className="text-default-500 text-xs">
                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                                    </p>
                                </div>
                                {!notif.read_at && (
                                    <div className="w-2.5 h-2.5 bg-primary rounded-full self-center"></div>
                                )}
                            </Link>
                        ))
                    )}
                </SimpleBar>

                <div className="p-2 border-t border-default-200">
                    <Link to="/notifications" className="w-full block text-center text-primary font-medium">
                        Lihat Semua
                    </Link>
                </div>
            </div>
        </div>
    );
};


const Topbar = () => {
    return (
        <div className="app-header min-h-topbar-height flex items-center sticky top-0 z-30 bg-card border-b border-default-200">
            <div className="w-full flex items-center justify-between px-6">
                <div className="flex items-center gap-5">
                    <SidenavToggle />
                </div>
                <div className="flex items-center gap-3">
                    <NotificationDropdown />
                    <ProfileDropdown />
                </div>
            </div>
        </div>
    );
};

export default Topbar;