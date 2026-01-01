import sharp from 'sharp';

/**
 * Validates and processes an image buffer, converting it to optimized JPG.
 * @param buffer - The raw image buffer.
 * @param quality - JPG quality from 1 to 100 (default: 80).
 * @returns A Promise resolving to the processed JPG Buffer.
 */
export async function processImage(buffer: Buffer, quality: number = Number(process.env.SUBMITTED_JPG_QUALITY) || 35): Promise<Buffer> {
    try {
        // Sharp constructor will validate the image buffer
        const image = sharp(buffer);

        // Get metadata to ensure it's a valid image and get dimensions if needed later
        await image.metadata();

        // Convert to JPG with compression
        return await image
            .jpeg({
                quality,
                mozjpeg: true
            })
            // Optional: Resize if too large? For now, just convert/compress.
            // .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true }) 
            .toBuffer();
    } catch (error) {
        console.error("Error processing image:", error);
        throw new Error("Invalid image file or processing failed.");
    }
}
