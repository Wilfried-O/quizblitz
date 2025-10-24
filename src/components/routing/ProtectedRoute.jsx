// Generic route guard
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProtectedRoute({
    canAccess,
    redirectTo = '/',
    children,
}) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!canAccess) {
            navigate(
                redirectTo,

                { replace: true } // so path /play isn't kept in history
            );
        }
    }, [canAccess, redirectTo, navigate]);

    if (!canAccess) return null; // render nothing while redirecting

    return children;
}
