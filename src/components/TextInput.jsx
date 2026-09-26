import {useState} from 'react'

export default function TextInput({addTodo}) {
    const [value, setValue] = useState("");
    const [category, setCategory] = useState("study");
    const [priority, setPriority] = useState("medium");

    const trimmedValue = value.trim();
    const isEmpty = trimmedValue === "";

        const createTodo = (e) => {
        e.preventDefault();

        if (isEmpty) return;

        addTodo(trimmedValue, category, priority);
        setValue("");
    };


    return (
        <div>
            <form onSubmit={createTodo}><input placeholder='할 일을 입력해 주세요.' value={value} maxLength={20} onChange={(e) => setValue(e.target.value)}/>

            <span>{value.length}/20</span>

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="study">공부</option>
                <option value="daily">일상</option>
                <option value="exercise">운동</option>
            </select>

            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
            </select>

            <button type= "submit" disabled={isEmpty}>추가</button>
            </form>
        </div>
    );
}
