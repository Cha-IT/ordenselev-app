import { PrismaClient, Class } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const student = await prisma.people.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Ola Nordmann',
            class: Class.IM1,
        },
    });
    console.log('Seed successful:', student);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
