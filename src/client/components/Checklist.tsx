import { VStack, Checkbox, Text, Box, Heading, Spinner, Center } from '@chakra-ui/react';

interface Task {
    id: number;
    task: string;
}

interface ChecklistProps {
    tasks: Task[];
    completedTaskIds: number[];
    setCompletedTaskIds: (tasks: number[]) => void;
    isLoading?: boolean;
}

export const Checklist = ({ tasks, completedTaskIds, setCompletedTaskIds, isLoading }: ChecklistProps) => {
    const handleToggle = (taskId: number) => {
        if (completedTaskIds.includes(taskId)) {
            setCompletedTaskIds(completedTaskIds.filter(id => id !== taskId));
        } else {
            setCompletedTaskIds([...completedTaskIds, taskId]);
        }
    };

    if (isLoading) {
        return (
            <Box mb={8}>
                <Heading size="md" mb={4}>Dagens gjøremål</Heading>
                <Center p={8}>
                    <Spinner color="teal.500" size="xl" />
                </Center>
            </Box>
        );
    }

    return (
        <Box mb={8}>
            <Heading size="md" mb={4}>Dagens gjøremål</Heading>
            <VStack align="stretch" spacing={3}>
                {tasks.map(task => (
                    <Box
                        key={task.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        _hover={{ bg: 'gray.50' }}
                        bg={completedTaskIds.includes(task.id) ? 'green.50' : 'white'}
                        borderColor={completedTaskIds.includes(task.id) ? 'green.200' : 'gray.200'}
                        transition="all 0.2s"
                    >
                        <Checkbox
                            isChecked={completedTaskIds.includes(task.id)}
                            onChange={() => handleToggle(task.id)}
                            size="lg"
                            colorScheme="teal"
                            width="100%"
                        >
                            <Text ml={2} fontSize="md">
                                {task.task}
                            </Text>
                        </Checkbox>
                    </Box>
                ))}
                {tasks.length === 0 && (
                    <Text color="gray.500" fontStyle="italic">Ingen oppgaver for i dag!</Text>
                )}
            </VStack>
        </Box>
    );
};
