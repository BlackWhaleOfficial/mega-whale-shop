const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const user = await prisma.user.findFirst();
        console.log("Testing user:", user.id);

        const maxAgeOrSomething = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                discounts: {
                    where: { quantity: { gt: 0 } }
                }
            }
        });

        console.log("Success!", maxAgeOrSomething);
    } catch (err) {
        console.error("PRISMA ERROR:", err);
    }
}
test();
