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
  const [studentId, setStudentId] = useState<number | null>(null);
  const [currentClass, setCurrentClass] = useState<string>('IM1'); // Default fallback

  const [completedTaskIds, setCompletedTaskIds] = useState<number[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        // 1. Fetch daily person info
        const personRes = await fetch(`${baseUrl}/daily-person`);
        let fetchedClass = currentClass;

        if (personRes.ok) {
          const personData = await personRes.json();
          setOrdenselev(personData.name);
          setStudentId(personData.id);
          setCurrentClass(personData.class);
          fetchedClass = personData.class;
        } else {
          setOrdenselev("Ingen ansvarlig funnet");
        }

        // 2. Fetch tasks for that class (or default)
        const tasksRes = await fetch(`${baseUrl}/tasks`, {
          headers: {
            'X-Class': fetchedClass
          }
        });

        if (!tasksRes.ok) throw new Error('Failed to fetch tasks');

        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks);

        // If the daily-person endpoint failed, api/tasks might return a name or "Ingen..."
        // but we prioritize daily-person if it succeeded. 
        if (!personRes.ok && tasksData.ordenselev) {
          setOrdenselev(tasksData.ordenselev);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setOrdenselev('Kunne ikke hente data');
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  const handleSubmit = async () => {
    if (!studentId) {
      console.error("No student ID available for submission");
      // We could show a toast here, but for now we let the backend handle/fail naturally or use fallback
    }

    const payload = {
      completedTaskIds: tasks.filter(t => completedTaskIds.includes(t.id)).map(t => t.id),
      nonCompletedTaskIds: tasks.filter(t => !completedTaskIds.includes(t.id)).map(t => t.id),
      image1: images[0] || null,
      image2: images[1] || null,
      comment: "", // No comment field in UI yet
      studentId: studentId // Use state ID
    };

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/submit`, {
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
