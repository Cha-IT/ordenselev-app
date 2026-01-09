import { Button, Text, Box, useToast } from '@chakra-ui/react';
import { useState } from 'react';

interface SubmitSectionProps {
    completedTasksCount: number;
    totalTasksCount: number;
    files: File[];
    onSubmit: () => Promise<void>;
}

export const SubmitSection = ({ completedTasksCount, totalTasksCount, files, onSubmit }: SubmitSectionProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit();
            toast({
                title: "Sendt!",
                description: "Rapporten er sendt til læreren.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Feil",
                description: "Kunne ikke sende rapporten. Prøv igjen.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box mt={8} textAlign="center">
            <Button
                colorScheme="teal"
                size="lg"
                width="100%"
                onClick={handleSubmit}
                isLoading={isSubmitting}
            >
                Send Rapport
            </Button>
            {files.length > 0 && (
                <Text fontSize="sm" color="gray.600" mt={2}>
                    {files.length} {files.length === 1 ? 'bilde' : 'bilder'} vedlagt.
                </Text>
            )}
            {completedTasksCount < totalTasksCount && (
                <Text fontSize="sm" color="orange.500" mt={2}>
                    {completedTasksCount} av {totalTasksCount} oppgaver fullført.
                </Text>
            )}
        </Box>
    );
};
