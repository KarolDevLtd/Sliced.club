import React, { useEffect, useState } from 'react';

import PageHeader from '~/app/_components/ui/PageHeader';

import useStore from '~/stores/utils/useStore';
import { useUserStore } from '~/providers/store-providers/userStoreProvider';
import { type UserState } from '~/stores/userStore';

type DashboardHeaderProps = object;

export const DashboardHeader = ({}: DashboardHeaderProps) => {
	const [greetingMessage, setGreetingMessage] = useState('');

	const userFirstName = useStore(useUserStore, (state: UserState) => state.userFirstName);

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

	return <PageHeader text={`Hello ${userFirstName}!`} subtext={greetingMessage} />;
};
