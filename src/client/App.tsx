import { Container, Box } from '@chakra-ui/react';
import { useState } from 'react';
import { Header } from './components/Header';
import { Checklist } from './components/Checklist';
import { ImageUpload } from './components/ImageUpload';
import { SubmitSection } from './components/SubmitSection';
import { getTodaysOrdenselev, getWeekNumber } from './config/ordenselever';

function App() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = async () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('no-NO');
    const weekNum = getWeekNumber(today);
    const ordenselev = getTodaysOrdenselev();

    const payload = {
      ordenselev,
      date: dateStr,
      weekNumber: weekNum,
      completedTasks,
      images
    };

    try {
      const response = await fetch('http://localhost:3000/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      // Reset form after success
      setCompletedTasks([]);
      setImages([]);
    } catch (error) {
      console.error('Error submitting:', error);
      throw error; // Re-throw to let SubmitSection handle the error UI
    }
  };

  return (
    <Box bg="gray.50" minH="100vh" py={{ base: 4, md: 8 }} px={{ base: 4, md: 8 }}>
      <Container maxW={{ base: "100%", sm: "container.sm", md: "container.md", lg: "container.lg" }} bg="white" p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="md">
        <Header />
        <Checklist
          completedTasks={completedTasks}
          setCompletedTasks={setCompletedTasks}
        />
        <ImageUpload
          images={images}
          setImages={setImages}
        />
        <SubmitSection
          completedTasks={completedTasks}
          images={images}
          onSubmit={handleSubmit}
        />
      </Container>
    </Box>
  );
}

export default App;
