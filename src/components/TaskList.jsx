import TodoItem from "./TodoItem"

export default function TaskList({todos, updateTodoStatus, deleteTodo, updateTodoText}) {
    return (
        <div>
            <h2>할 일 목록</h2>

            <ul>
                {todos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} updateTodoStatus={updateTodoStatus} deleteTodo={deleteTodo} updateTodoText={updateTodoText}/>
                ))}
            </ul>
        </div>
    )
}
