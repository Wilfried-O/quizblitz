import { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
    // persist settings so refresh or direct nav to /play still works
    const [settings, setSettings] = useLocalStorage('quizblitz:settings', {
        amount: 5,
        difficulty: '',
        category: '',
    });

    const value = useMemo(
        () => ({ settings, setSettings }),
        [settings, setSettings]
    );

    // React 19 style: use the context object as a component
    return <QuizContext value={value}>{children}</QuizContext>;
}

export function useQuizCtx() {
    const ctx = useContext(QuizContext);
    if (!ctx) throw new Error('useQuizCtx must be used within <QuizProvider>');
    return ctx;
}
