// Computes canAccess from Context, then delegates to ProtectedRoute.
import ProtectedRoute from '../../components/routing/ProtectedRoute';
import { useQuizCtx } from '../../context/QuizContext';

export default function PlayGate({ children }) {
    const { settings } = useQuizCtx();
    const canAccess = Number.isFinite(settings.amount) && settings.amount >= 1;

    return (
        <ProtectedRoute canAccess={canAccess} redirectTo="/">
            {children}
        </ProtectedRoute>
    );
}
