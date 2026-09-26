import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
    const navigate = useNavigate();

    return (
        <div>
        <h1>설정 페이지</h1>

        <p>투두리스트 설정 화면입니다.</p>

        <button onClick={() => navigate("/")}>메인으로</button>
        </div>
    );
}