import { Box, Button, Image, SimpleGrid, Text, IconButton } from '@chakra-ui/react';
import { useRef, type ChangeEvent, useEffect, useState } from 'react';

interface ImageUploadProps {
    files: File[];
    setFiles: (files: File[]) => void;
}

export const ImageUpload = ({ files, setFiles }: ImageUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        // Create object URLs for previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);

        // Cleanup function to revoke object URLs
        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [files]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (files.length >= 2) return;

            const file = e.target.files[0];
            setFiles([...files, file]);
        }
    };

    const removeImage = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    return (
        <Box mb={8}>
            <Text fontSize="lg" fontWeight="bold" mb={2}>Bilder av området (Maks 2)</Text>
            <Text fontSize="sm" color="gray.500" mb={4}>
                Last opp bilder som viser at det er ryddig.
            </Text>

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={4}>
                {previews.map((preview, index) => (
                    <Box key={index} position="relative" borderRadius="md" overflow="hidden">
                        <Image src={preview} alt={`Opplastet bilde ${index + 1}`} objectFit="cover" h="150px" w="100%" />
                        <IconButton
                            aria-label="Fjern bilde"
                            icon={<Text fontWeight="bold">X</Text>}
                            size="xs"
                            colorScheme="red"
                            position="absolute"
                            top={1}
                            right={1}
                            onClick={() => removeImage(index)}
                        />
                    </Box>
                ))}
            </SimpleGrid>

            {files.length < 2 && (
                <>
                    <input
                        type="file"
                        accept="image/*"
                        ref={inputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <Button onClick={() => inputRef.current?.click()} colorScheme="teal" variant="outline" width="100%">
                        Legg til bilde
                    </Button>
                </>
            )}
        </Box>
    );
};
