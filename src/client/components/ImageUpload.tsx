import { Box, Button, Image, SimpleGrid, Text, IconButton } from '@chakra-ui/react';
import { useRef, type ChangeEvent } from 'react';

interface ImageUploadProps {
    images: string[];
    setImages: (images: string[]) => void;
}

export const ImageUpload = ({ images, setImages }: ImageUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (images.length >= 2) return;

            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImages([...images, base64String]);
            };

            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    return (
        <Box mb={8}>
            <Text fontSize="lg" fontWeight="bold" mb={2}>Bilder av området (Maks 2)</Text>
            <Text fontSize="sm" color="gray.500" mb={4}>
                Last opp bilder som viser at det er ryddig.
            </Text>

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={4}>
                {images.map((img, index) => (
                    <Box key={index} position="relative" borderRadius="md" overflow="hidden">
                        <Image src={img} alt={`Opplastet bilde ${index + 1}`} objectFit="cover" h="150px" w="100%" />
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

            {images.length < 2 && (
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
