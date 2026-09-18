import {useEffect, useState} from 'react'

export default function UserProfile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            const response = await fetch(
                "https://randomuser.me/api/"
            );

            const data = await response.json();

            setUser(data.results[0]);
        };

        loadUser();
    }, []);

    if (user === null) {
        return <p>사용자 정보를 불러오는 중...</p>
    }

    return (
        <div>
            <img src={user.picture.large} alt="사용자 프로필" />
            <p>{user.name.first} {user.name.last}</p>
            <p>{user.email}</p>
        </div>
    )
}
