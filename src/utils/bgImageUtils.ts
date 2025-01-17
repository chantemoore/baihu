export const getBackgroundImage = (username: string): string => {
    try {
        return `/images/bg/${username}-bg.jpg`;
    } catch {
        return ''
    }
}

export const getAvatarImage = (username: string): string => {
    try {
        return `/images/avatar/${username}-avatar.jpg`;
    } catch {
        return ''
    }
}