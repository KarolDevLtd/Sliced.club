import React from 'react';
import Image from 'next/image';
import { FaHandPaper, FaHandRock, FaHandScissors } from 'react-icons/fa';

const Play = ({ setPlayerChoice }) => {
	const handlePlayerChoice = (e) => {
		e.preventDefault();
		setPlayerChoice(e.currentTarget.id);
	};

	return (
		<div className="relative">
			{/* <img src={`/utils/bg-triangle.svg`} alt="triangle" /> */}

			<button
				id="paper"
				onClick={handlePlayerChoice}
				className="text-5xl my-2 mx-4"
				// className="absolute top-0 translate-y-[-50%] translate-x-[-50%] w-28 h-28 sm:w-36 sm:h-36 border-transparent border-[13px] sm:border-[18px] border-gradient-t-light-blue-white  rounded-full flex items-center justify-center shadow-blue animate-slide-paper hover:scale-[1.1] transition-transform duration-300 "
			>
				<FaHandPaper />
			</button>
			<button
				id="scissors"
				onClick={handlePlayerChoice}
				className="text-5xl my-2 mx-4"

				// className="absolute right-0 top-0 translate-y-[-50%] translate-x-[50%] w-28 h-28 sm:w-36 sm:h-36 sm:border-[18px]  border-transparent border-[13px] border-gradient-t-light-orange-white shadow-orange  rounded-full flex items-center justify-center animate-slide-scissors hover:scale-[1.1] transition-transform duration-300 "
			>
				<FaHandScissors />
			</button>
			<button
				id="rock"
				onClick={handlePlayerChoice}
				className="text-5xl my-2 mx-4"

				// className="absolute bottom-0 left-[50%]  translate-x-[-50%] w-28 h-28 sm:w-36 sm:h-36 sm:border-[18px] border-transparent border-[13px] border-gradient-t-light-red-white  rounded-full flex items-center justify-center shadow-red animate-slide-rock hover:scale-[1.1] transition-transform duration-300 "
			>
				<FaHandRock />
			</button>
		</div>
	);
};

export default Play;
