import React, { ChangeEvent, DragEvent, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import clsx from 'clsx';

const cellSize = 30;
type Char = { id: string, str: string, selected: boolean, x: number, y: number };

function App() {
	const [value, setValue] = useState<Char[]>([]);
	const enteredString = value.map(character => character.str).join('');

	const onChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
		setValue(
			event.target.value
				.split('')
				.map((inputChar, index) => {
					return { id: uuidv4(), str: inputChar, selected: false, x: (index * cellSize) + 300, y: 180 }
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
			}))
		} else {
			setValue(prev => prev.map(char => {
				if(char.id === cell?.id) {
					return { ...cell, x: elem.x, y: elem.y }
				} else if(char.id === elem.id) {
					return { ...char, x: alignedX, y: alignedY }
				}
				return char;
			}))
		}
	};

	const selectCharacter = (event: React.MouseEvent<HTMLHeadingElement, MouseEvent>, elem: Char) => {
		if(!event.ctrlKey || event.button !== 0) return
		setValue(prev => prev.map(char => {
			if(char.id === elem.id) {
				return { ...char, selected: !char.selected }
			}

			return char;
		}))
	}

	return (
		<div className="relative min-w-[100vw] min-h-screen" onDragOver={ e => dragOverHandler(e) }>
			<div className="flex items-center ml-[300px] pt-[120px]">
				<label htmlFor="inputValue" className="text-xl px-2">Value: </label>
				<input
					id="inputValue"
					type="text"
					className="border text-xl p-2"
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
  