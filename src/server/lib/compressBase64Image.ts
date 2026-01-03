import sharp from 'sharp';

/**
 * Compresses a base64 image and outputs a JPG base64 string.
 * @param base64Str - The source image (e.g., "data:image/png;base64,..." or raw base64).
 * @param quality - JPG quality from 1 to 100 (default: 80).
 * @returns A Promise resolving to a JPG base64 string.
 */

export async function compressImageToJPG(base64Str: string, quality: number = Number(process.env.SUBMITTED_JPG_QUALITY || 80)): Promise<string> {
    try {
        // 1. Remove the Data URL prefix if it exists (e.g., "data:image/png;base64,")
        const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, "");

        // 2. Convert base64 string to a Buffer
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // 3. Process with Sharp
        const compressedBuffer = await sharp(imageBuffer)
            .jpeg({
                quality: quality,
                mozjpeg: true // Optional: enables better compression algorithms
            })
            .toBuffer();

        // 4. Convert back to base64
        return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
    } catch (error) {
        console.error("Error compressing image:", error);
        throw error;
    }
}
