import { Container, Box } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Checklist } from './components/Checklist';
import { ImageUpload } from './components/ImageUpload';
import { SubmitSection } from './components/SubmitSection';


interface Task {
  id: number;
  task: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ordenselev, setOrdenselev] = useState<string>('Laster...');
  const [completedTaskIds, setCompletedTaskIds] = useState<number[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentClass = 'IM1'; // Hardcoded for now, could be in localStorage or a selector

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/tasks', {
          headers: {
            'X-Class': currentClass
          }
        });
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data.tasks);
        setOrdenselev(data.ordenselev);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setOrdenselev('Kunne ikke hente data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [currentClass]);

  const handleSubmit = async () => {

    const payload = {
      completedTaskIds: tasks.filter(t => completedTaskIds.includes(t.id)).map(t => t.id),
      nonCompletedTaskIds: tasks.filter(t => !completedTaskIds.includes(t.id)).map(t => t.id),
      image1: images[0] || null,
      image2: images[1] || null,
      comment: "", // No comment field in UI yet
      studentId: 1 // Hardcoded for now
    };

    try {
      const response = await fetch('http://localhost:3000/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Class': currentClass
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      // Reset form after success
      setCompletedTaskIds([]);
      setImages([]);
    } catch (error) {
      console.error('Error submitting:', error);
      throw error; // Re-throw to let SubmitSection handle the error UI
    }
  };

  return (
    <Box bg="gray.50" minH="100vh" py={{ base: 4, md: 8 }} px={{ base: 4, md: 8 }}>
      <Container maxW={{ base: "100%", sm: "container.sm", md: "container.md", lg: "container.lg" }} bg="white" p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="md">
        <Header ordenselev={ordenselev} />
        <Checklist
          tasks={tasks}
          completedTaskIds={completedTaskIds}
          setCompletedTaskIds={setCompletedTaskIds}
          isLoading={isLoading}
        />
        <ImageUpload
          images={images}
          setImages={setImages}
        />
        <SubmitSection
          completedTasksCount={completedTaskIds.length}
          totalTasksCount={tasks.length}
          images={images}
          onSubmit={handleSubmit}
        />
      </Container>
    </Box>
  );
}

export default App;
