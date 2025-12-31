import {
    Table, Thead, Tbody, Tr, Th, Td, Box, Heading, Text, Badge, Image, Stack, Spinner, Center,
    Button
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

interface Task {
    id: number;
    task: string;
}

interface Completion {
    id: number;
    date: string;
    student: {
        name: string;
    };
    completedTasks: Task[];
    nonCompletedTasks: Task[];
    image1?: string;
    image2?: string;
    comment?: string;
}

export const History = ({ onBack }: { onBack: () => void }) => {
    const [completions, setCompletions] = useState<Completion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompletions = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/completions');
                if (!response.ok) throw new Error('Failed to fetch completions');
                const data = await response.json();
                setCompletions(data);
            } catch (error) {
                console.error('Error fetching completions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompletions();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('no-NO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <Center py={10}>
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    return (
        <Box>
            <Stack direction="row" justify="space-between" align="center" mb={6}>
                <Heading size="lg">Oversikt over utførte oppgaver</Heading>
                <Button onClick={onBack} colorScheme="blue" variant="outline">Tilbake til sjekkliste</Button>
            </Stack>

            <Box overflowX="auto">
                <Table variant="simple" bg="white">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>Dato</Th>
                            <Th>Ansvarlig</Th>
                            <Th>Fullførte oppgaver</Th>
                            <Th>Ikke fullførte</Th>
                            <Th>Bilde 1</Th>
                            <Th>Bilde 2</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {completions.length === 0 ? (
                            <Tr>
                                <Td colSpan={6} textAlign="center">Ingen rapporter funnet</Td>
                            </Tr>
                        ) : (
                            completions.map((comp) => (
                                <Tr key={comp.id}>
                                    <Td fontWeight="medium">{formatDate(comp.date)}</Td>
                                    <Td>{comp.student.name}</Td>
                                    <Td>
                                        <Stack spacing={1}>
                                            {comp.completedTasks.map(t => (
                                                <Badge key={t.id} colorScheme="green" variant="subtle" fontSize="xs">
                                                    {t.task}
                                                </Badge>
                                            ))}
                                        </Stack>
                                    </Td>
                                    <Td>
                                        <Stack spacing={1}>
                                            {comp.nonCompletedTasks.map(t => (
                                                <Badge key={t.id} colorScheme="red" variant="subtle" fontSize="xs">
                                                    {t.task}
                                                </Badge>
                                            ))}
                                        </Stack>
                                    </Td>
                                    <Td>
                                        {comp.image1 ? (
                                            <Image
                                                src={comp.image1}
                                                fallbackSrc="https://via.placeholder.com/100"
                                                alt="Bilde 1"
                                                maxW="100px"
                                                borderRadius="md"
                                                cursor="pointer"
                                                onClick={() => window.open(comp.image1, '_blank')}
                                            />
                                        ) : <Text color="gray.400">Ingen</Text>}
                                    </Td>
                                    <Td>
                                        {comp.image2 ? (
                                            <Image
                                                src={comp.image2}
                                                fallbackSrc="https://via.placeholder.com/100"
                                                alt="Bilde 2"
                                                maxW="100px"
                                                borderRadius="md"
                                                cursor="pointer"
                                                onClick={() => window.open(comp.image2, '_blank')}
                                            />
                                        ) : <Text color="gray.400">Ingen</Text>}
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
};
