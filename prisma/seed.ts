import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

const SEED_PASSWORD = 'password123';

// Delete all application data in reverse dependency order to avoid FK errors.
async function cleanDatabase() {
  console.log('Cleaning existing application data...');
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.technicianProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log('Database cleaned successfully.');
}

async function main() {
  await cleanDatabase();

  console.log('Inserting fresh bulk seed data...');
  const password = await bcrypt.hash(SEED_PASSWORD, 10);

  // 1. ADMIN USERS
  console.log('Seeding Admin users...');
  await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@gmail.com',
      password,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin2@gmail.com',
      password,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // 2. CUSTOMER USERS
  console.log('Seeding Customer users...');
  const customerUsersData = [
    { name: 'John Doe', email: 'customer@gmail.com' },
    { name: 'Alice Smith', email: 'customer2@gmail.com' },
    { name: 'Bob Johnson', email: 'customer3@gmail.com' },
    { name: 'Sophia Martinez', email: 'customer4@gmail.com' },
    { name: 'David Lee', email: 'customer5@gmail.com' },
    { name: 'Emma Watson', email: 'customer6@gmail.com' },
  ];

  const customers = [];
  for (const c of customerUsersData) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        password,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    customers.push(user);
  }

  // 3. TECHNICIAN USERS & PROFILES
  console.log('Seeding Technician users and profiles...');
  const technicianSeedDefs = [
    {
      user: { name: 'Rahim Uddin (Plumbing Expert)', email: 'technician@gmail.com' },
      profile: {
        bio: 'Master Plumber with over 8 years of experience in residential and commercial pipe fittings, leak repairs, and drainage systems.',
        skills: ['Pipe Fitting', 'Leak Detection', 'Sanitary Repair', 'Water Heater Setup', 'Drain Unclogging'],
        experience: 8,
        hourlyRate: 45.0,
        location: 'Gulshan, Dhaka',
        availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
        isVerified: true,
      },
    },
    {
      user: { name: 'Karim Electrician', email: 'technician2@gmail.com' },
      profile: {
        bio: 'Certified electrical engineer specializing in home rewiring, circuit breakers, smart home installations, and emergency fault fixing.',
        skills: ['Electrical Wiring', 'Circuit Breakers', 'Light Fixtures', 'Generator Setup', 'Smart Home Setup'],
        experience: 6,
        hourlyRate: 50.0,
        location: 'Dhanmondi, Dhaka',
        availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
        isVerified: true,
      },
    },
    {
      user: { name: 'Nadia HVAC Specialist', email: 'technician3@gmail.com' },
      profile: {
        bio: 'Expert AC & Refrigeration technician providing jet wash servicing, gas refills, compressor overhauls, and duct cleaning.',
        skills: ['AC Jet Wash', 'Gas Refill', 'Compressor Repair', 'HVAC Installation', 'Inverter PCB Repair'],
        experience: 7,
        hourlyRate: 55.0,
        location: 'Uttara, Dhaka',
        availability: { days: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] },
        isVerified: true,
      },
    },
    {
      user: { name: 'Tanvir Appliance Repair', email: 'technician4@gmail.com' },
      profile: {
        bio: 'Specialized in repairing home appliances including washing machines, microwaves, refrigerators, and induction cooktops.',
        skills: ['Washing Machine Repair', 'Microwave Repair', 'Refrigerator Servicing', 'Dishwasher Fix'],
        experience: 5,
        hourlyRate: 40.0,
        location: 'Banani, Dhaka',
        availability: { days: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
        isVerified: true,
      },
    },
    {
      user: { name: 'Sabbir Carpenter', email: 'technician5@gmail.com' },
      profile: {
        bio: 'Skilled woodcrafter and furniture specialist. Expert in door lock installation, custom wardrobe assembly, and wood polish.',
        skills: ['Custom Furniture', 'Door Lock Installation', 'Wood Polishing', 'Cabinet Repair', 'Furniture Assembly'],
        experience: 10,
        hourlyRate: 38.0,
        location: 'Mirpur, Dhaka',
        availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
        isVerified: true,
      },
    },
  ];

  const technicians: Array<{ user: any; profile: any }> = [];
  for (const item of technicianSeedDefs) {
    const techUser = await prisma.user.create({
      data: {
        name: item.user.name,
        email: item.user.email,
        password,
        role: 'TECHNICIAN',
        status: 'ACTIVE',
      },
    });

    const techProfile = await prisma.technicianProfile.create({
      data: {
        userId: techUser.id,
        bio: item.profile.bio,
        skills: item.profile.skills,
        experience: item.profile.experience,
        hourlyRate: item.profile.hourlyRate,
        location: item.profile.location,
        availability: item.profile.availability,
        isVerified: item.profile.isVerified,
        totalReviews: 0,
        averageRating: 0.0,
      },
    });

    technicians.push({ user: techUser, profile: techProfile });
  }

  // 4. CATEGORIES
  console.log('Seeding Categories...');
  const categoryDefs = [
    { name: 'Home Plumbing', description: 'Comprehensive pipe leak, water tank, heater, and sanitary fixture services.' },
    { name: 'Electrical & Wiring', description: 'Safe house rewiring, circuit breaker installation, lights, and smart home setups.' },
    { name: 'AC & Refrigeration', description: 'Split & cassette AC cleaning, refrigerant gas refilling, and compressor fixing.' },
    { name: 'Home Appliance Repair', description: 'Quick diagnostic and repair services for washing machines, fridges, and ovens.' },
    { name: 'Cleaning & Sanitization', description: 'Professional deep house cleaning, sofa steam wash, and carpet sanitization.' },
    { name: 'Carpentry & Woodwork', description: 'Custom furniture assembly, cabinet repair, door lock changing, and wood polish.' },
    { name: 'Painting & Decoration', description: 'Interior and exterior wall painting, damp proofing, and decorative finishes.' },
  ];

  const categoriesMap = new Map<string, any>();
  for (const cat of categoryDefs) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        description: cat.description,
      },
    });
    categoriesMap.set(cat.name, createdCat);
  }

  // 5. SERVICES
  console.log('Seeding Services...');
  const serviceDefs = [
    // Plumbing (Technician 0: Rahim)
    { title: 'Emergency Pipe Leak Repair', description: 'Fast fixing of burst pipes, leaking joints, and major water lines.', price: 45.0, categoryName: 'Home Plumbing', techIndex: 0 },
    { title: 'Full House Plumbing Inspection', description: 'Comprehensive checkup of drainage, water pressure, and pipe health.', price: 80.0, categoryName: 'Home Plumbing', techIndex: 0 },
    { title: 'Water Heater Installation & Repair', description: 'Installation and thermostat/heating element repair for electric geysers.', price: 120.0, categoryName: 'Home Plumbing', techIndex: 0 },

    // Electrical (Technician 1: Karim)
    { title: 'Circuit Breaker & DB Box Fitting', description: 'Installation and safety testing of modern circuit breakers and distribution boxes.', price: 65.0, categoryName: 'Electrical & Wiring', techIndex: 1 },
    { title: 'Ceiling Fan & Light Fitting Setup', description: 'Mounting chandeliers, LED lights, decorative fixtures, and ceiling fans.', price: 35.0, categoryName: 'Electrical & Wiring', techIndex: 1 },
    { title: 'Smart Home Wiring & Socket Setup', description: 'Wiring high-load sockets and smart switches with proper earthing.', price: 95.0, categoryName: 'Electrical & Wiring', techIndex: 1 },

    // AC & HVAC (Technician 2: Nadia)
    { title: 'Split AC Jet Wash Servicing', description: 'Deep high-pressure water jet cleaning of AC indoor blower and outdoor condenser.', price: 40.0, categoryName: 'AC & Refrigeration', techIndex: 2 },
    { title: 'AC Gas Refill & Leak Detection', description: 'R410a/R32 eco-friendly refrigerant gas top-up along with copper pipe leak repair.', price: 75.0, categoryName: 'AC & Refrigeration', techIndex: 2 },
    { title: 'Inverter AC PCB & Compressor Repair', description: 'Advanced diagnostic and component replacement for inverter unit circuit boards.', price: 130.0, categoryName: 'AC & Refrigeration', techIndex: 2 },

    // Appliance Repair (Technician 3: Tanvir)
    { title: 'Washing Machine Repair & Maintenance', description: 'Fixing drum motor spin issues, drain pump blockages, and water inlet valves.', price: 55.0, categoryName: 'Home Appliance Repair', techIndex: 3 },
    { title: 'Microwave & Convection Oven Repair', description: 'Replacing magnetron, high voltage diode, and touch pad control panels.', price: 45.0, categoryName: 'Home Appliance Repair', techIndex: 3 },
    { title: 'Refrigerator Cooling & Gas Charge', description: 'Thermostat replacement, cooling coil unfreezing, and gas charging.', price: 70.0, categoryName: 'Home Appliance Repair', techIndex: 3 },

    // Carpentry (Technician 4: Sabbir)
    { title: 'Custom Furniture Assembly & Fitting', description: 'Flat-pack furniture assembly, bed frame setup, and modular wardrobe fitting.', price: 50.0, categoryName: 'Carpentry & Woodwork', techIndex: 4 },
    { title: 'Door & Window Lock Replacement', description: 'Heavy-duty deadbolt installation, handle replacement, and alignment fix.', price: 40.0, categoryName: 'Carpentry & Woodwork', techIndex: 4 },
    { title: 'Wood Cabinet Repair & Polish', description: 'Hinge adjustment, drawer channel replacement, and protective varnish application.', price: 60.0, categoryName: 'Carpentry & Woodwork', techIndex: 4 },

    // Additional Services cross-assigned
    { title: 'Bathroom Fixture & Tap Fitting', description: 'Replacing old faucets, shower heads, mixers, and sink traps.', price: 38.0, categoryName: 'Home Plumbing', techIndex: 0 },
    { title: 'Emergency Generator & UPS Repair', description: 'Diagnostic and repair of backup power UPS units and home generators.', price: 85.0, categoryName: 'Electrical & Wiring', techIndex: 1 },
    { title: 'Cassette AC Servicing & Chemical Wash', description: 'Commercial & large residential cassette AC chemical foam cleaning.', price: 110.0, categoryName: 'AC & Refrigeration', techIndex: 2 },
    { title: 'Full Apartment Deep Cleaning', description: 'Floor scrubbing, glass window cleaning, bathroom sanitization, and dust removal.', price: 160.0, categoryName: 'Cleaning & Sanitization', techIndex: 3 },
    { title: 'Interior Wall Painting (Per Room)', description: 'Premium plastic emulsion paint coating with wall putty smoothing.', price: 120.0, categoryName: 'Painting & Decoration', techIndex: 4 },
  ];

  const services = [];
  for (const s of serviceDefs) {
    const category = categoriesMap.get(s.categoryName);
    const tech = technicians[s.techIndex];
    const service = await prisma.service.create({
      data: {
        title: s.title,
        description: s.description,
        price: s.price,
        categoryId: category.id,
        technicianProfileId: tech.profile.id,
      },
    });
    services.push({ ...service, techIndex: s.techIndex });
  }

  // 6. BOOKINGS
  console.log('Seeding Bookings...');
  const bookingDataList = [
    // 10 Completed Bookings for Reviews
    { customerIdx: 0, serviceIdx: 0, status: 'COMPLETED' as const, date: new Date('2026-07-01'), slot: '10:00 AM - 12:00 PM', phone: '+8801711111101' },
    { customerIdx: 1, serviceIdx: 2, status: 'COMPLETED' as const, date: new Date('2026-07-03'), slot: '02:00 PM - 04:00 PM', phone: '+8801711111102' },
    { customerIdx: 2, serviceIdx: 3, status: 'COMPLETED' as const, date: new Date('2026-07-05'), slot: '09:00 AM - 11:00 AM', phone: '+8801711111103' },
    { customerIdx: 3, serviceIdx: 5, status: 'COMPLETED' as const, date: new Date('2026-07-08'), slot: '03:00 PM - 05:00 PM', phone: '+8801711111104' },
    { customerIdx: 4, serviceIdx: 6, status: 'COMPLETED' as const, date: new Date('2026-07-10'), slot: '11:00 AM - 01:00 PM', phone: '+8801711111105' },
    { customerIdx: 5, serviceIdx: 7, status: 'COMPLETED' as const, date: new Date('2026-07-12'), slot: '04:00 PM - 06:00 PM', phone: '+8801711111106' },
    { customerIdx: 0, serviceIdx: 9, status: 'COMPLETED' as const, date: new Date('2026-07-15'), slot: '10:00 AM - 12:00 PM', phone: '+8801711111101' },
    { customerIdx: 1, serviceIdx: 10, status: 'COMPLETED' as const, date: new Date('2026-07-18'), slot: '01:00 PM - 03:00 PM', phone: '+8801711111102' },
    { customerIdx: 2, serviceIdx: 12, status: 'COMPLETED' as const, date: new Date('2026-07-20'), slot: '09:00 AM - 11:00 AM', phone: '+8801711111103' },
    { customerIdx: 3, serviceIdx: 13, status: 'COMPLETED' as const, date: new Date('2026-07-22'), slot: '02:00 PM - 04:00 PM', phone: '+8801711111104' },

    // Additional Bookings with varied statuses
    { customerIdx: 4, serviceIdx: 1, status: 'PAID' as const, date: new Date('2026-08-01'), slot: '10:00 AM - 12:00 PM', phone: '+8801711111105' },
    { customerIdx: 5, serviceIdx: 4, status: 'IN_PROGRESS' as const, date: new Date('2026-08-02'), slot: '02:00 PM - 04:00 PM', phone: '+8801711111106' },
    { customerIdx: 0, serviceIdx: 8, status: 'ACCEPTED' as const, date: new Date('2026-08-03'), slot: '11:00 AM - 01:00 PM', phone: '+8801711111101' },
    { customerIdx: 1, serviceIdx: 11, status: 'REQUESTED' as const, date: new Date('2026-08-04'), slot: '03:00 PM - 05:00 PM', phone: '+8801711111102' },
    { customerIdx: 2, serviceIdx: 14, status: 'CANCELLED' as const, date: new Date('2026-07-28'), slot: '09:00 AM - 11:00 AM', phone: '+8801711111103', cancellationReason: 'Customer rescheduled trip' },
    { customerIdx: 3, serviceIdx: 15, status: 'PAID' as const, date: new Date('2026-08-05'), slot: '10:00 AM - 12:00 PM', phone: '+8801711111104' },
    { customerIdx: 4, serviceIdx: 16, status: 'ACCEPTED' as const, date: new Date('2026-08-06'), slot: '04:00 PM - 06:00 PM', phone: '+8801711111105' },
  ];

  const createdBookings = [];
  for (const b of bookingDataList) {
    const customer = customers[b.customerIdx];
    const service = services[b.serviceIdx];
    const tech = technicians[service.techIndex];

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId: service.id,
        technicianProfileId: tech.profile.id,
        servicePrice: service.price,
        contactNumber: b.phone,
        scheduledDate: b.date,
        timeSlot: b.slot,
        status: b.status,
        cancellationReason: b.cancellationReason || null,
      },
    });
    createdBookings.push({ booking, customer, service, tech });
  }

  // 7. REVIEWS (EXACTLY 10 REVIEWS ADDED)
  console.log('Seeding 10 Reviews...');
  const reviewDefs = [
    {
      bookingIdx: 0, // Booking for Rahim (Plumbing - Emergency Pipe Leak Repair)
      rating: 5,
      comment: 'Rahim arrived within 30 minutes of booking and resolved our water pipe leak effortlessly! Clean, professional, and very polite.',
    },
    {
      bookingIdx: 1, // Booking for Rahim (Plumbing - Water Heater Installation)
      rating: 5,
      comment: 'Outstanding geyser installation! Tested all valves and explained safety precautions thoroughly. Highly recommended.',
    },
    {
      bookingIdx: 2, // Booking for Karim (Electrical - Circuit Breaker Box Fitting)
      rating: 4,
      comment: 'Karim fixed our tripping circuit breaker quickly and organized the main distribution board neatly. Great electrical work.',
    },
    {
      bookingIdx: 3, // Booking for Karim (Electrical - Smart Home Wiring)
      rating: 5,
      comment: 'Flawless smart switch & socket setup! Karim tested each gang switch and helped integrate them with our WiFi home automation.',
    },
    {
      bookingIdx: 4, // Booking for Nadia (AC & HVAC - Split AC Jet Wash)
      rating: 5,
      comment: 'Nadia provided a deep pressure jet wash service. The AC cooling efficiency has increased dramatically and smells fresh!',
    },
    {
      bookingIdx: 5, // Booking for Nadia (AC & HVAC - AC Gas Refill)
      rating: 4,
      comment: 'Very professional refrigerant leak test and gas refill. Fair pricing and transparent explanations throughout.',
    },
    {
      bookingIdx: 6, // Booking for Tanvir (Appliance Repair - Washing Machine Repair)
      rating: 5,
      comment: 'Tanvir diagnosed our washing machine drum noise right away and replaced the worn belt. Operates like brand new now!',
    },
    {
      bookingIdx: 7, // Booking for Tanvir (Appliance Repair - Microwave Repair)
      rating: 5,
      comment: 'Saved us from buying a new microwave! Fixed the heating element within an hour. Excellent response time.',
    },
    {
      bookingIdx: 8, // Booking for Sabbir (Carpentry - Custom Furniture Assembly)
      rating: 5,
      comment: 'Sabbir assembled a complex 4-door wooden wardrobe with master precision. Sturdy build and zero alignment flaws.',
    },
    {
      bookingIdx: 9, // Booking for Sabbir (Carpentry - Door Lock Replacement)
      rating: 4,
      comment: 'Replaced all exterior door locks with high-security deadbolts. Smooth latch operation and high quality work.',
    },
  ];

  for (const rev of reviewDefs) {
    const targetBooking = createdBookings[rev.bookingIdx];
    await prisma.review.create({
      data: {
        bookingId: targetBooking.booking.id,
        customerId: targetBooking.customer.id,
        technicianProfileId: targetBooking.tech.profile.id,
        rating: rev.rating,
        comment: rev.comment,
      },
    });
  }

  // 8. PAYMENTS
  console.log('Seeding Payments for completed and paid bookings...');
  const paidBookingIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15];
  for (let i = 0; i < paidBookingIndices.length; i++) {
    const bIndex = paidBookingIndices[i];
    const targetBooking = createdBookings[bIndex];
    await prisma.payment.create({
      data: {
        bookingId: targetBooking.booking.id,
        amount: targetBooking.booking.servicePrice,
        transactionId: `TXN_SEED_${Date.now()}_${i + 1}`,
        provider: i % 2 === 0 ? 'STRIPE' : 'BKASH',
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });
  }

  // 9. UPDATE TECHNICIAN PROFILE RATINGS & TOTAL REVIEWS COUNT
  console.log('Updating Technician Profile rating statistics...');
  for (const tech of technicians) {
    const techReviews = await prisma.review.findMany({
      where: { technicianProfileId: tech.profile.id },
      select: { rating: true },
    });

    const totalReviews = techReviews.length;
    const averageRating =
      totalReviews > 0
        ? parseFloat((techReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
        : 0;

    await prisma.technicianProfile.update({
      where: { id: tech.profile.id },
      data: {
        totalReviews,
        averageRating,
      },
    });
  }

  console.log('----------------------------------------------------');
  console.log('🎉 Database bulk seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log(`Default accounts login password: ${SEED_PASSWORD}`);
  console.log('User Accounts Summary:');
  console.log('  - Admins: admin@gmail.com, admin2@gmail.com');
  console.log('  - Customers: customer@gmail.com, customer2@gmail.com, customer3@gmail.com, customer4@gmail.com, customer5@gmail.com, customer6@gmail.com');
  console.log('  - Technicians: technician@gmail.com, technician2@gmail.com, technician3@gmail.com, technician4@gmail.com, technician5@gmail.com');
  console.log('Seeded Data Counts:');
  console.log(`  - Users: ${2 + customerUsersData.length + technicianSeedDefs.length}`);
  console.log(`  - Technician Profiles: ${technicianSeedDefs.length}`);
  console.log(`  - Categories: ${categoryDefs.length}`);
  console.log(`  - Services: ${serviceDefs.length}`);
  console.log(`  - Bookings: ${bookingDataList.length}`);
  console.log(`  - Reviews: ${reviewDefs.length}`);
  console.log(`  - Payments: ${paidBookingIndices.length}`);
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
