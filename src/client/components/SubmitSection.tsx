import { Button, Text, Box, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { tasks } from '../config/tasks';

interface SubmitSectionProps {
    completedTasks: string[];
    images: string[];
    onSubmit: () => Promise<void>;
}

export const SubmitSection = ({ completedTasks, images, onSubmit }: SubmitSectionProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const today = new Date();
    const dayOfWeek = today.getDay();
    const todaysTasks = tasks.filter(task =>
        !task.days || task.days.length === 0 || task.days.includes(dayOfWeek)
    );

    const completedCount = completedTasks.filter(id => todaysTasks.some(t => t.id === id)).length;

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
            {images.length > 0 && (
                <Text fontSize="sm" color="gray.600" mt={2}>
                    {images.length} {images.length === 1 ? 'bilde' : 'bilder'} vedlagt.
                </Text>
            )}
            {completedCount < todaysTasks.length && (
                <Text fontSize="sm" color="orange.500" mt={2}>
                    {completedCount} av {todaysTasks.length} oppgaver fullført.
                </Text>
            )}
        </Box>
    );
};
