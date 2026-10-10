    import Card from "./Card";

    export default function Column({
        title,
        status,
        todos,
        }) {
    const columnTodos = todos.filter(
        (todo) => todo.status === status
    );

    return (
        <section className="column">
        <h2>
            {title} ({columnTodos.length})
        </h2>

        {columnTodos.length === 0 ? (
            <p>할 일이 없습니다.</p>
        ) : (
            columnTodos.map((todo) => (
            <Card
                key={todo.id}
                todo={todo}
                />
            ))
        )}
        </section>
    );
    }