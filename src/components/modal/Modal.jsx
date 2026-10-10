    import "./Modal.css";

    function ModalRoot({
    children,
    onClose,
    }) {
    const stopModalClick = (event) => {
        event.stopPropagation();
    };

    return (
        <div
        className="modal-overlay"
        onClick={onClose}
        >
        <section
            className="modal-content"
            role="dialog"
            aria-modal="true"
            onClick={stopModalClick}
        >
            {children}
        </section>
        </div>
    );
    }

    function ModalHeader({ children }) {
    return (
        <header className="modal-header">
        {children}
        </header>
    );
    }

    function ModalBody({ children }) {
    return (
        <div className="modal-body">
        {children}
        </div>
    );
    }

    function ModalFooter({ children }) {
    return (
        <footer className="modal-footer">
        {children}
        </footer>
    );
    }

    const Modal = {
    Root: ModalRoot,
    Header: ModalHeader,
    Body: ModalBody,
    Footer: ModalFooter,
    };

    export default Modal;