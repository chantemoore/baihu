export const getBackgroundImage = (username: string): string => {
    try {
        return `/images/bg/${username}-bg.jpg`;
    } catch {
        return ''
    }
}

export const getAvatarImage = (username: string) => {
    const requestImage = `/images/avatar/${username}-avatar.jpg`
    const defaultImage = '/images/avatar/default-avatar.jpg'

    const img = new Image()
    img.src = requestImage

    return new Promise((resolve) => {
        img.onload = () => resolve(requestImage)
        img.onerror = () => resolve(defaultImage)
    })
}