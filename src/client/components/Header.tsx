import { Box, Heading, Text, VStack, Card, CardBody } from '@chakra-ui/react';
import { getWeekNumber } from '../config/ordenselever';

interface HeaderProps {
    ordenselev: string;
}

export const Header = ({ ordenselev }: HeaderProps) => {
    const today = new Date();
    const weekNum = getWeekNumber(today);

    const dayName = today.toLocaleDateString('no-NO', { weekday: 'long' });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const dateStr = today.toLocaleDateString('no-NO', { day: 'numeric', month: 'long' });

    return (
        <VStack spacing={4} align="stretch" mb={8}>
            <Heading as="h1" size="xl" textAlign="center" color="teal.600">
                Ordenselev Sjekkliste
            </Heading>

            <Card variant="outline" borderColor="teal.200" bg="teal.50">
                <CardBody>
                    <VStack spacing={2}>
                        <Text fontSize="2xl" fontWeight="bold">
                            {capitalizedDay}, {dateStr}
                        </Text>
                        <Text fontSize="lg" color="gray.600">
                            Uke {weekNum}
                        </Text>
                        <Box p={3} bg="white" borderRadius="md" boxShadow="sm" width="100%" textAlign="center">
                            <Text fontSize="sm" color="gray.500" mb={1}>Dagens ordenselev</Text>
                            <Text fontSize="xl" fontWeight="bold" color="teal.700">
                                {ordenselev}
                            </Text>
                        </Box>
                    </VStack>
                </CardBody>
            </Card>
        </VStack>
    );
};
