import { RootState } from '@/lib/store';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
    const { admin, isAuthenticated } = useSelector((state: RootState) => state.admin);

    useEffect(() => {
        if (!isAuthenticated || !admin) {
            router.replace('/(auth)/login');
            return;
        }

        // Check if user has admin privileges
        const hasAdminRole = admin.roles.includes('Admin') || admin.roles.includes('SuperAdmin');
        if (!hasAdminRole) {
            router.replace('/(auth)/login');
            return;
        }
    }, [isAuthenticated, admin]);

    if (!isAuthenticated || !admin || (!admin.roles.includes('Admin') && !admin.roles.includes('SuperAdmin'))) {
        return null;
    }

    return <>{children}</>;
}