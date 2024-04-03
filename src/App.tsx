import React, { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import clsx from 'clsx';

const cellSize = 30;
type Char = { id: string, str: string, selected: boolean, x: number, y: number };
type Area = { point1: { x: number; y: number }, point2: { x: number; y: number } };

function App() {
	const [value, setValue] = useState<Char[]>([]);
	const area = useRef<Area | null>(null);
	const enteredString = value.map(character => character.str).join('');

	const onChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
		setValue(
			event.target.value
				.split('')
				.map((inputChar, index) => {
					return { id: uuidv4(), str: inputChar, selected: false, x: (index * cellSize) + 300, y: 180 };
				})
		);
	};

	const dragOverHandler = (event: DragEvent<HTMLHeadingElement>) => {
		event.preventDefault();
	};

	const dropHandler = (event: DragEvent<HTMLHeadingElement>, elem: Char) => {
		event.preventDefault();
		const alignedX = event.pageX - event.pageX % cellSize;
		const alignedY = event.pageY - event.pageY % cellSize;

		const cell = value.find(char => char.x === alignedX && char.y === alignedY);

		if(elem.selected) {
			const moveX = elem.x - alignedX;
			const moveY = elem.y - alignedY;

			setValue(prev => prev.map(char => {
				if(char.selected) {
					return { ...char, selected: false, x: char.x - moveX, y: char.y - moveY };
				}
				return char;
			}));

		} else {
			setValue(prev => prev.map(char => {
				if(char.id === cell?.id) {
					return { ...cell, x: elem.x, y: elem.y };
				} else if(char.id === elem.id) {
					return { ...char, x: alignedX, y: alignedY };
				}
				return char;
			}));
		}
	};

	const selectCharacter = (event: React.MouseEvent<HTMLHeadingElement, MouseEvent>, elem: Char) => {
		if(!event.ctrlKey || event.button !== 0) return;
		setValue(prev => prev.map(char => {
			if(char.id === elem.id) {
				return { ...char, selected: !char.selected };
			}

			return char;
		}));
	};

	const mouseDownHandler = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		area.current = { point1: { x: event.pageX, y: event.pageY }, point2: { x: event.pageX, y: event.pageY } };
	};

	const mouseUpHandler = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		console.log(area);
		if(!area.current) return;
		area.current = { ...area.current, point2: { x: event.pageX, y: event.pageY } };
		const { point1, point2 } = area.current;

		if(point1.x === point2.x && point1.y === point2.y) return; // disable selection if it's a click

		setValue(prev => {
			return prev.map(char => {
				// select chars that are inside selected area
				if(
					((char.x >= point1.x && char.x <= point2.x) || (char.x >= point2.x && char.x <= point1.x)) &&
					((char.y >= point1.y && char.y <= point2.y) || (char.y >= point2.y && char.y <= point1.y))
				) {
					return { ...char, selected: true };
				}
				return { ...char, selected: false };
			});
		});
	};

	return (
		<div
			className="relative min-w-[100vw] min-h-screen"
			onDragOver={ e => dragOverHandler(e) }
			onMouseDown={ e => mouseDownHandler(e) }
			onMouseUp={ e => mouseUpHandler(e) }
		>
			<div className="flex items-center ml-[300px] pt-[120px]">
				<label htmlFor="inputValue" className="text-xl px-2 select-none">Value: </label>
				<input
					id="inputValue"
					type="text"
					className="border text-xl p-2 select-none"
					value={ enteredString }
					onChange={ onChangeInput }
				/>
				{ value.map(elem => {
					return (
						<div className="flex items-center">
							<h3
								key={ elem.id }
								style={ { left: elem.x, top: elem.y } }
								className={ clsx(
									"text-3xl cursor-pointer absolute px-2 py-0.5",
									elem.selected && "bg-slate-600"
								) }
								onClick={ e => selectCharacter(e, elem) }
								onDragEnd={ e => dropHandler(e, elem) }
								onDrop={ e => dropHandler(e, elem) }
								draggable
							>
								{ elem.str }
							</h3>
						</div>
					);
				}) }
			</div>
		</div>
	);
}

export default App;
  