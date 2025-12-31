import { ChakraProvider, Box, Container, Input, Button, VStack, Heading, Text, useToast } from '@chakra-ui/react'
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { History } from './components/History'

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [passcode, setPasscode] = useState('')
    const toast = useToast()

    const handleVerify = () => {
        const correctPasscode = import.meta.env.VITE_HISTORY_PASSCODE
        if (passcode === correctPasscode) {
            setIsAuthenticated(true)
        } else {
            toast({
                title: 'Feil passord',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
            setPasscode('')
        }
    }

    if (!isAuthenticated) {
        return (
            <Box bg="gray.50" minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <VStack spacing={6} p={8} bg="white" borderRadius="xl" boxShadow="lg" maxW="400px" w="full">
                    <Heading size="md">Adgangskontroll</Heading>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                        Vennligst skriv inn passordet for å se historikken.
                    </Text>
                    <Input
                        type="password"
                        placeholder="Passord"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    />
                    <Button colorScheme="teal" onClick={handleVerify} w="full">
                        Lås opp
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
                        Tilbake
                    </Button>
                </VStack>
            </Box>
        )
    }

    return (
        <Box bg="gray.50" minH="100vh" py={{ base: 4, md: 8 }} px={{ base: 4, md: 8 }}>
            <Container maxW="container.xl" bg="white" p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="md">
                <History onBack={() => window.location.href = '/'} />
            </Container>
        </Box>
    )
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ChakraProvider>
            <App />
        </ChakraProvider>
    </StrictMode>,
)
