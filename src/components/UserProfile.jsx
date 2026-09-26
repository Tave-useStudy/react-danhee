import {useEffect, useState} from 'react'

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadUser = async () => {
            try{
            const response = await fetch(
                "https://randomuser.me/api/"
            );

            if (!response.ok) {
                throw new Error("사용자 요청 실패");
            }

            const data = await response.json();

            setUser(data.results[0]);
        } catch {
            setError("사용자 정보를 불러오지 못했습니다.");
        }
    };

        loadUser();
    }, []);

    if (error) {
        return <p>{error}</p>
    }

    if (user === null) {
        return <p>사용자 정보를 불러오는 중...</p>
    }

    return (
        <div>
            <img src={user.picture.large} alt={`${user.name.first} ${user.name.last} 프로필`} />
            <p>{user.name.first} {user.name.last}</p>
            <p>{user.email}</p>
        </div>
    );
}
