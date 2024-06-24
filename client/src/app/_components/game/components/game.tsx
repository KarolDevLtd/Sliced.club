import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaHandPaper, FaHandRock, FaHandScissors } from 'react-icons/fa';
import { Icon } from '@mui/material';

const variantsShiftLeft = {
	inital: {
		left: '0',
	},
	animate: {
		left: '-15px',
	},
};
const variantsShiftRight = {
	inital: {
		right: 0,
	},
	animate: {
		right: '-15px',
	},
};

const Game = ({ playerChoice, setPlayerChoice, setScore }) => {
	const [computerChoice, setComputerChoice] = useState('');
	const [result, setResult] = useState('');
	const [counter, setCounter] = useState(3);

	const handlePlayAgain = () => {
		setComputerChoice('');
		setPlayerChoice('');
	};

	const handleComputerChoice = () => {
		const choices = ['rock', 'paper', 'scissors'];
		const houseChoice = choices[Math.floor(Math.random() * choices.length)];
		setComputerChoice(houseChoice);
	};

	useEffect(() => {
		handleComputerChoice();
	}, []);

	const results = () => {
		if (playerChoice === computerChoice) {
			setResult('draw');
		} else if (
			(playerChoice === 'rock' && computerChoice === 'scissors') ||
			(playerChoice === 'paper' && computerChoice === 'rock') ||
			(playerChoice === 'scissors' && computerChoice === 'paper')
		) {
			setResult('win');
			setScore((prevScore) => (prevScore += 1));
		} else {
			setResult('lose');
			setScore((prevScore) => (prevScore === 0 ? (prevScore = 0) : (prevScore -= 1)));
		}
	};

	useEffect(() => {
		const timer =
			counter > 0
				? setInterval(() => {
						setCounter(counter - 1);
					}, 1000)
				: results();

		return () => {
			clearInterval(timer);
		};
	}, [counter]);

	const renderChoiceImage = (choice) => {
		switch (choice) {
			case 'paper':
				return (
					<div id="paper" className="text-3xl">
						<FaHandPaper />
					</div>
				);
			case 'scissors':
				return (
					<div id="scissors" className="text-3xl">
						<FaHandScissors />
					</div>
				);

			case 'rock':
				return (
					<div id="rock" className="text-3xl">
						<FaHandRock />
					</div>
				);

			default:
				break;
		}
	};
	return (
		<div className="flex flex-col ">
			<div className="flex gap-10">
				<motion.div
					animate={counter === 0 ? 'animate' : 'initial'}
					variants={variantsShiftLeft}
					className="flex flex-col items-center justify-between"
				>
					<div
						className={`${
							result === 'win' && 'shadow-winner-sm lg:shadow-winner-lg'
						} rounded-full lg:order-2`}
					>
						{renderChoiceImage(playerChoice)}
					</div>

					<h2 className="text-sm sm:text-base text-white uppercase mt-4 tracking-widest text-center lg:order-1">
						You Picked
					</h2>
				</motion.div>
				<div className="hidden lg:block lg:self-center">
					<h1 className="mt-8 uppercase text-3xl leading-3 text-white text-center">
						{result === 'win'
							? 'You win'
							: result === 'lose'
								? 'You lose'
								: result === 'draw'
									? 'Draw'
									: ''}
					</h1>
					{counter == 0 && (
						<button
							onClick={handlePlayAgain}
							className="mt-8 uppercase bg-white tracking-wider p-2 px-14 rounded-lg "
						>
							Play Again
						</button>
					)}
				</div>
				<motion.div
					animate={counter === 0 ? 'animate' : 'initial'}
					variants={variantsShiftRight}
					className="flex flex-col items-center justify-between"
				>
					{counter === 0 ? (
						<div
							className={`${
								result === 'lose' && 'shadow-winner-sm lg:shadow-winner-lg'
							} rounded-full lg:order-2`}
						>
							{renderChoiceImage(computerChoice)}
						</div>
					) : (
						<div className="w-32 h-20 rounded-full bg-black/20 animate-pulse lg:order-2" />
					)}
					<h2 className="text-sm sm:text-base text-white uppercase mt-4 tracking-widest text-center lg:order-1">
						The House picked
					</h2>
				</motion.div>
			</div>

			{/* for Mobile devices */}

			{/* <div className="lg:hidden">
				<h1 className="mt-8 uppercase text-5xl text-white text-center leading-3">
					{result === 'win' ? 'You win' : result === 'lose' ? 'You lose' : result === 'draw' ? 'Draw' : ''}
				</h1>
				{counter == 0 && (
					<button
						onClick={handlePlayAgain}
						className="mt-8 uppercase bg-white p-2 px-14 rounded-lg tracking-wider hover:text-red-600"
					>
						Play Again
					</button>
				)}
			</div> */}
		</div>
	);
};

export default Game;
