// Mulberry32 algorithm for a simple, seeded PRNG
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

/**
 * Shuffles an array in a deterministic way based on a string seed.
 * @param array The array to shuffle.
 * @param seed A string seed to ensure the shuffle is reproducible.
 * @returns A new array with the elements shuffled.
 */
export const seededShuffle = <T,>(array: T[], seed: string): T[] => {
    // Create a simple numeric hash from the string seed
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }

    const random = mulberry32(h);
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        const randomIndex = Math.floor(random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [shuffled[currentIndex], shuffled[randomIndex]] = [
            shuffled[randomIndex], shuffled[currentIndex]
        ];
    }
    return shuffled;
};
