    import {
    useNavigate,
    } from "react-router-dom";

    import {
    useBoard,
    } from "../../context/BoardContext";

    import Modal from "./Modal";

    export default function TodoDetailModal() {
    const navigate = useNavigate();

    const {
        state: {
        todos,
        modal,
        },

        actions: {
        closeModal,
        },
    } = useBoard();

    if (
        !modal ||
        modal.type !== "detail"
    ) {
        return null;
    }

    const todo = todos.find(
        (todo) =>
        String(todo.id) ===
        String(modal.todoId)
    );

    if (!todo) {
        return null;
    }

    const statusText = {
        todo: "할 일",
        doing: "진행 중",
        done: "완료",
    }[todo.status];

    const goToDetailPage = () => {
        closeModal();
        navigate(`/todos/${todo.id}`);
    };

    return (
        <Modal.Root onClose={closeModal}>
        <Modal.Header>
            <h2>할 일 상세</h2>

            <button
            type="button"
            onClick={closeModal}
            >
            닫기
            </button>
        </Modal.Header>

        <Modal.Body>
            <p>내용: {todo.text}</p>
            <p>
            카테고리: {todo.category}
            </p>
            <p>
            우선순위: {todo.priority}
            </p>
            <p>상태: {statusText}</p>
        </Modal.Body>

        <Modal.Footer>
            <button
            type="button"
            onClick={closeModal}
            >
            취소
            </button>

            <button
            type="button"
            onClick={goToDetailPage}
            >
            상세 페이지
            </button>
        </Modal.Footer>
        </Modal.Root>
    );
    }