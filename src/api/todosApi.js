    const TODOS_API_URL =
    "https://jsonplaceholder.typicode.com/todos";

    export async function fetchTodos(signal) {
    const response = await fetch(TODOS_API_URL, {
        signal,
    });

    if (!response.ok) {
        throw new Error(
        `투두를 불러오지 못했습니다. (${response.status})`
        );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error(
        "올바르지 않은 투두 데이터입니다."
        );
    }

    return data.slice(0, 10).map((todo) => ({
        id: `api-${todo.id}`,
        text: todo.title,
        category: "daily",
        priority: "medium",
        done: todo.completed,
    }));
    }