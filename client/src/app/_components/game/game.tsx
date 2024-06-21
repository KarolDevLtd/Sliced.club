import { useState, useEffect } from 'react';
import Head from 'next/head';
import Button from './components/button';
import Header from './components/header';
import Modal from './components/modal';
import Game from './components/game';
import Image from 'next/image';
import Play from './components/play';

export default function Home() {
	const [showModal, setShowModal] = useState(false);
	const [playerChoice, setPlayerChoice] = useState('');
	const [score, setScore] = useState(0);

	const handleResetClick = () => {
		setScore(0);
		localStorage.setItem('score', JSON.stringify(score));
	};

	useEffect(() => {
		const scoreItem = JSON.parse(localStorage.getItem('score'));
		if (scoreItem) {
			setScore(scoreItem);
		}
	}, []);

	useEffect(() => {
		localStorage.setItem('score', JSON.stringify(score));
	}, [score]);

	return (
		<div>
			<Head>
				<meta name="description" content="Rock, paper, scissors - Game" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className="p-8 flex flex-col items-center">
				<Header score={score} />

				{playerChoice === '' ? (
					<Play setPlayerChoice={setPlayerChoice} />
				) : (
					<Game playerChoice={playerChoice} setPlayerChoice={setPlayerChoice} setScore={setScore} />
				)}
			</div>
		</div>
	);
}
