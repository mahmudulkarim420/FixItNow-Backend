import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Clearing existing data...');
  // Delete all existing data to prevent duplicates on multiple runs
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.technicianProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding database...');

  // Hash password
  const password = await bcrypt.hash('password123', 10);

  // 1. Create Categories
  const catPlumbing = await prisma.category.create({
    data: {
      name: 'Plumbing',
      description: 'Expert plumbing services including leaks, installations, and repairs.',
    },
  });

  const catElectrical = await prisma.category.create({
    data: {
      name: 'Electrical',
      description: 'Professional electrical installations, repairs, and maintenance.',
    },
  });

  const catCleaning = await prisma.category.create({
    data: {
      name: 'Cleaning',
      description: 'Deep cleaning, regular housekeeping, and move-out cleaning.',
    },
  });

  // 2. Create Admin
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@fixitnow.com',
      password,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 3. Create Customers
  const customer1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });

  // 4. Create Technicians with Profiles
  const tech1 = await prisma.user.create({
    data: {
      name: 'Mike Builder',
      email: 'mike@example.com',
      password,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      technicianProfile: {
        create: {
          bio: 'Experienced plumber with 10 years of fixing pipes.',
          skills: ['Pipe Fitting', 'Leak Repair', 'Water Heaters'],
          experience: 10,
          hourlyRate: 50.0,
          location: 'New York, NY',
          totalReviews: 1,
          availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
          isVerified: true,
        },
      },
    },
    include: {
      technicianProfile: true,
    },
  });

  const tech2 = await prisma.user.create({
    data: {
      name: 'Sarah Spark',
      email: 'sarah@example.com',
      password,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      technicianProfile: {
        create: {
          bio: 'Licensed electrician ready to help with your wiring needs.',
          skills: ['Wiring', 'Lighting', 'Panel Upgrades'],
          experience: 8,
          hourlyRate: 65.0,
          location: 'Brooklyn, NY',
          totalReviews: 1,
          availability: { days: ['Wednesday', 'Thursday', 'Friday', 'Saturday'] },
          isVerified: true,
        },
      },
    },
    include: {
      technicianProfile: true,
    },
  });

  // 5. Create Services
  const service1 = await prisma.service.create({
    data: {
      title: 'Fix Leaking Pipe',
      description: 'Quick and reliable repair for leaking pipes.',
      price: 100.0,
      categoryId: catPlumbing.id,
      technicianProfileId: tech1.technicianProfile!.id,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      title: 'Install Ceiling Fan',
      description: 'Safe and professional installation of any ceiling fan.',
      price: 150.0,
      categoryId: catElectrical.id,
      technicianProfileId: tech2.technicianProfile!.id,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      title: 'Water Heater Replacement',
      description: 'Full replacement and installation of your water heater.',
      price: 450.0,
      categoryId: catPlumbing.id,
      technicianProfileId: tech1.technicianProfile!.id,
    },
  });

  // 6. Create Bookings
  const booking1 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      serviceId: service1.id,
      technicianProfileId: tech1.technicianProfile!.id,
      servicePrice: service1.price,
      contactNumber: '+1234567890',
      scheduledDate: new Date('2026-08-01'),
      timeSlot: '10:00 AM - 12:00 PM',
      status: 'COMPLETED',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      customerId: customer2.id,
      serviceId: service2.id,
      technicianProfileId: tech2.technicianProfile!.id,
      servicePrice: service2.price,
      contactNumber: '+0987654321',
      scheduledDate: new Date('2026-08-02'),
      timeSlot: '02:00 PM - 04:00 PM',
      status: 'PAID',
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      serviceId: service3.id,
      technicianProfileId: tech1.technicianProfile!.id,
      servicePrice: service3.price,
      contactNumber: '+1234567890',
      scheduledDate: new Date('2026-08-05'),
      timeSlot: '09:00 AM - 11:00 PM',
      status: 'REQUESTED',
    },
  });

  // 7. Create Reviews (for completed bookings)
  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      customerId: customer1.id,
      technicianProfileId: tech1.technicianProfile!.id,
      rating: 5,
      comment: 'Mike did a fantastic job fixing the pipe quickly!',
    },
  });

  // 8. Create Payments (for paid/completed bookings)
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      amount: service1.price,
      transactionId: 'TXN-123456-PLB',
      provider: 'Stripe',
      status: 'COMPLETED',
      paidAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      amount: service2.price,
      transactionId: 'TXN-789012-ELE',
      provider: 'PayPal',
      status: 'COMPLETED',
      paidAt: new Date(),
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
