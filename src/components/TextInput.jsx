import {useState} from 'react'

export default function TextInput({addTodo}) {
    const [value, setValue] = useState("");

    const overLimit = value.length > 20;

    const createTodo = () => {
        if (value.trim() === "") {
            return;
        }

        addTodo(value);
        setValue("");
    };


    return (
        <div>
            <input placeholder='할 일을 입력해 주세요.' value={value} onChange={(e) => setValue(e.target.value)}/>

            <span>{value.length}/20</span>

            {overLimit && (<p>20자 이내로 입력해 주세요.</p>)}

            <button onClick={createTodo} disabled={overLimit}>추가</button>
        </div>
    );
}
