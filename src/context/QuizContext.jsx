import { createContext, useContext, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
    // persist settings so refresh or direct nav to /play still works
    const [settings, setSettings] = useLocalStorage('quizblitz:settings', {
        amount: 5,
        difficulty: '',
        category: '',
    });

    // result now includes a review array
    // shape: { score: number, total: number, review: Array<{ question, answers, correctId, selectedId }> } | null
    const [result, setResult] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const value = useMemo(
        () => ({
            settings,
            setSettings,

            result,
            setResult,

            isPlaying,
            setIsPlaying,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [settings, result, isPlaying]
    );

    // React 19 style: use the context object as a component
    return <QuizContext value={value}>{children}</QuizContext>;
}

export function useQuizCtx() {
    const ctx = useContext(QuizContext);
    if (!ctx) throw new Error('useQuizCtx must be used within <QuizProvider>');
    return ctx;
}
