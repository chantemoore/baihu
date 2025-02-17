export const playAudio = (audioObj: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const audio = new Audio(audioObj);

        audio.onended = () => resolve();
        audio.onerror = (error) => reject(error);

        audio.play()
            .catch(error => {
                console.error('Audio playback failed:', error);
                reject(error);
            });
    });
};
