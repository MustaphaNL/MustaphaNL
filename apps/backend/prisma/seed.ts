import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  'activiteitenbegeleiding', 'maatje_buddy', 'gastvrijheid_horeca',
  'begeleiding_coaching', 'klussen_buiten_tuin', 'creativiteit_muziek',
  'taal_lezen', 'bestuur_organisatie', 'projectcoordinatie',
  'koken_maaltijden', 'vervoer_transport', 'hulp_bij_armoede',
  'administratie_receptie', 'techniek_reparatie', 'klussen_binnen',
  'marketing_communicatie', 'financien_fondsenwerving', 'winkel',
];

const KERNEN = [
  'Hoofddorp', 'Nieuw-Vennep', 'Badhoevedorp', 'Vijfhuizen',
  'Zwanenburg', 'Rijsenhout', 'Abbenes', 'Cruquius',
];

const LISTING_TITLES_HELP = [
  'Hulp nodig bij boodschappen',
  'Vervoer naar ziekenhuis',
  'Iemand die helpt met belastingformulier',
  'Gezelschap gevraagd voor wekelijkse wandeling',
  'Hulp bij kleine klusjes in huis',
  'Nederlandstalige oefenpartner gezocht',
  'Tuin opknappen voor de winter',
  'Hulp met computer en internet',
];

const LISTING_TITLES_OFFER = [
  'Ik help graag met vervoer',
  'Kooklessen voor beginners',
  'Administratieve hulp aangeboden',
  'Beschikbaar voor maatjesproject',
  'Tuinhulp aangeboden op zaterdag',
  'Vrijwilliger bij kinderactiviteiten',
  'Heb tijd voor gezelschap bij ouderen',
  'Technische reparaties voor weinig',
];

async function main() {
  console.log('Seeding database...');

  // Admin user
  const adminHash = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hve.nl' },
    update: {},
    create: {
      email: 'admin@hve.nl',
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'HvE',
      dateOfBirth: new Date('1985-01-01'),
      gender: 'prefer_not_to_say',
      postcode: '2132AA',
      neighbourhood: 'Hoofddorp',
      roles: ['volunteer'],
      isAdmin: true,
      isVerified: true,
    },
  });

  // Test volunteer
  const vol1Hash = await bcrypt.hash('Test1234!', 12);
  const volunteer1 = await prisma.user.upsert({
    where: { email: 'jan@example.nl' },
    update: {},
    create: {
      email: 'jan@example.nl',
      passwordHash: vol1Hash,
      firstName: 'Jan',
      lastName: 'de Vries',
      dateOfBirth: new Date('1978-06-15'),
      gender: 'man',
      postcode: '2134BB',
      neighbourhood: 'Hoofddorp',
      bio: 'Ik ben gepensioneerd en help graag mensen in de buurt.',
      roles: ['volunteer'],
      isVerified: true,
      interests: ['vervoer_transport', 'klussen_buiten_tuin', 'koken_maaltijden'],
      availability: ['weekday_morning', 'weekend_morning'],
    },
  });

  // Test help seeker
  const hs1Hash = await bcrypt.hash('Test1234!', 12);
  const helpSeeker1 = await prisma.user.upsert({
    where: { email: 'maria@example.nl' },
    update: {},
    create: {
      email: 'maria@example.nl',
      passwordHash: hs1Hash,
      firstName: 'Maria',
      lastName: 'Jansen',
      dateOfBirth: new Date('1945-03-20'),
      gender: 'vrouw',
      postcode: '2151CC',
      neighbourhood: 'Nieuw-Vennep',
      bio: 'Ik woon alleen en heb soms een beetje hulp nodig.',
      roles: ['help_seeker'],
      isVerified: true,
    },
  });

  // Test organisation
  const org1Hash = await bcrypt.hash('Test1234!', 12);
  const org1 = await prisma.user.upsert({
    where: { email: 'welzijn@example.nl' },
    update: {},
    create: {
      email: 'welzijn@example.nl',
      passwordHash: org1Hash,
      firstName: 'Welzijn',
      lastName: 'Haarlemmermeer',
      dateOfBirth: new Date('2000-01-01'),
      gender: 'prefer_not_to_say',
      postcode: '2132XY',
      neighbourhood: 'Hoofddorp',
      bio: 'Stichting voor welzijnswerk in de gemeente Haarlemmermeer.',
      roles: ['organisation'],
      isVerified: true,
    },
  });

  const users = [volunteer1, helpSeeker1, org1, admin];

  // Create listings
  const listings = [];

  for (let i = 0; i < LISTING_TITLES_HELP.length; i++) {
    const kern = KERNEN[i % KERNEN.length];
    const category = CATEGORIES[i % CATEGORIES.length];
    const author = users[i % users.length];

    listings.push(await prisma.listing.create({
      data: {
        title: LISTING_TITLES_HELP[i],
        type: 'help_request',
        status: 'active',
        categoryId: category,
        description: `Dit is een beschrijving voor "${LISTING_TITLES_HELP[i]}". We zijn op zoek naar iemand die ons hierbij kan helpen. De activiteit vindt plaats in ${kern} en is bedoeld voor mensen die hier baat bij hebben.`,
        neighbourhood: kern,
        frequency: ['once', 'recurring', 'flexible'][i % 3] as 'once' | 'recurring' | 'flexible',
        contactPreference: 'in_app',
        showPhone: false,
        showEmail: false,
        authorId: author.id,
      },
    }));
  }

  for (let i = 0; i < LISTING_TITLES_OFFER.length; i++) {
    const kern = KERNEN[i % KERNEN.length];
    const category = CATEGORIES[(i + 4) % CATEGORIES.length];
    const author = users[i % users.length];

    listings.push(await prisma.listing.create({
      data: {
        title: LISTING_TITLES_OFFER[i],
        type: 'volunteer_offer',
        status: 'active',
        categoryId: category,
        description: `Ik bied aan om te helpen met "${LISTING_TITLES_OFFER[i]}". Ik ben beschikbaar in ${kern} en heb hier ervaring mee. Neem gerust contact op als je interesse hebt.`,
        neighbourhood: kern,
        frequency: ['once', 'recurring', 'flexible'][i % 3] as 'once' | 'recurring' | 'flexible',
        contactPreference: ['in_app', 'both'][i % 2] as 'in_app' | 'both',
        showPhone: i % 3 === 0,
        showEmail: i % 4 === 0,
        authorId: author.id,
      },
    }));
  }

  // Seed some messages
  if (listings.length >= 2) {
    await prisma.message.create({
      data: {
        listingId: listings[0].id,
        senderId: volunteer1.id,
        receiverId: helpSeeker1.id,
        body: 'Hoi Maria, ik kan je helpen met boodschappen doen. Wanneer zou dat uitkomen?',
      },
    });
    await prisma.message.create({
      data: {
        listingId: listings[0].id,
        senderId: helpSeeker1.id,
        receiverId: volunteer1.id,
        body: 'Dank je wel Jan! Vrijdag ochtend zou perfect zijn.',
      },
    });
  }

  console.log(`Seeded: ${listings.length} listings, ${users.length} users`);
  console.log('Admin login: admin@hve.nl / Admin1234!');
  console.log('Volunteer login: jan@example.nl / Test1234!');
  console.log('Help seeker login: maria@example.nl / Test1234!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
