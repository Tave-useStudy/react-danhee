    import "./Board.css";

    import Column from "./Column";
    import Card from "./Card";

    function Board({ children }) {
    return (
        <main className="board">
        {children}
        </main>
    );
    }

    Board.Column = Column;
    Board.Card = Card;

    export default Board;