import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

export const usePermissions = () => {
    const { user } = useContext(AuthContext);
    const permissions = user?.permissions || [];

    const can = (permissionName) => {
        return permissions.includes(permissionName);
    };

    return { can };
};
