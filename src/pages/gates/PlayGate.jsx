// Computes canAccess (currently from URL), then delegates to ProtectedRoute.
import { useSearchParams } from 'react-router-dom';
import ProtectedRoute from '../../components/routing/ProtectedRoute'; // generic guard

export default function PlayGate({ children }) {
    const [params] = useSearchParams();
    const amount = Number(params.get('amount') ?? 0);
    const canAccess = Number.isFinite(amount) && amount >= 1; // current rule

    return (
        <ProtectedRoute canAccess={canAccess} redirectTo="/">
            {children}
        </ProtectedRoute>
    );
}
