import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StartUpContextType {
	startingUp: boolean;
	hasCompletedStartUp: (completed: boolean) => void;
	setStartingUp: (startingUp: boolean) => void;
}

const StartUpContext = createContext<StartUpContextType | undefined>(undefined);

export const useStartUpProvider = (): StartUpContextType => {
	const context = useContext(StartUpContext);
	if (!context) {
		throw new Error('useStartUpProvider must be used within a StartUpProvider');
	}
	return context;
};

export const StartUpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [startingUp, setStartingUp] = useState(false);

	const hasCompletedStartUp = (completed: boolean) => {
		setStartingUp(completed);
	};

	return (
		<StartUpContext.Provider value={{ startingUp, hasCompletedStartUp, setStartingUp }}>
			{children}
		</StartUpContext.Provider>
	);
};
