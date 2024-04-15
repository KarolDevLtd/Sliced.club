import React, { useEffect, useState } from 'react';

type DashboardHeaderProps = {
	userFirstName: string;
};

export const DashboardHeader = ({ userFirstName }: DashboardHeaderProps) => {
	const [greetingMessage, setGreetingMessage] = useState('');

	useEffect(() => {
		const greetings = [
			"It's good to see you again",
			'Welcome back',
			'Wag1',
			`${userFirstName}! In the flesh, as I live and breathe!`,
			"What's good, boo boo?",
			'Welcome to the club, boss',
			'How farest thou?',
			'Namaste',
			'Well met, kind soul.',
			'Hola paapi',
		];

		const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

		setGreetingMessage(randomGreeting ?? 'Welcome back');
	}, [userFirstName]);

	return (
		<div>
			<h1 className="text-5xl">Hello {userFirstName}!</h1>
			<p>{greetingMessage}</p>
		</div>
	);
};
