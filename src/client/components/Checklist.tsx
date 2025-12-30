import { VStack, Checkbox, Text, Box, Heading } from '@chakra-ui/react';
import { tasks } from '../config/tasks';

interface ChecklistProps {
    completedTasks: string[];
    setCompletedTasks: (tasks: string[]) => void;
}

export const Checklist = ({ completedTasks, setCompletedTasks }: ChecklistProps) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0-6 (Sun-Sat)

    // Filter tasks: show if days array is empty OR contains current day
    const todaysTasks = tasks.filter(task =>
        !task.days || task.days.length === 0 || task.days.includes(dayOfWeek)
    );

    const handleToggle = (taskId: string) => {
        if (completedTasks.includes(taskId)) {
            setCompletedTasks(completedTasks.filter(id => id !== taskId));
        } else {
            setCompletedTasks([...completedTasks, taskId]);
        }
    };

    return (
        <Box mb={8}>
            <Heading size="md" mb={4}>Dagens gjøremål</Heading>
            <VStack align="stretch" spacing={3}>
                {todaysTasks.map(task => (
                    <Box
                        key={task.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        _hover={{ bg: 'gray.50' }}
                        bg={completedTasks.includes(task.id) ? 'green.50' : 'white'}
                        borderColor={completedTasks.includes(task.id) ? 'green.200' : 'gray.200'}
                        transition="all 0.2s"
                    >
                        <Checkbox
                            isChecked={completedTasks.includes(task.id)}
                            onChange={() => handleToggle(task.id)}
                            size="lg"
                            colorScheme="teal"
                            width="100%"
                        >
                            <Text ml={2} fontSize="md">
                                {task.text}
                            </Text>
                        </Checkbox>
                    </Box>
                ))}
                {todaysTasks.length === 0 && (
                    <Text color="gray.500" fontStyle="italic">Ingen oppgaver for i dag!</Text>
                )}
            </VStack>
        </Box>
    );
};
