import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const DEMO_USERS = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Sara Tadesse",
    isActor: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Dawit Kebede",
    isActor: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Bethlehem Tilahun",
    isActor: true,
  },
];

export const PLACE_IDS = {
  NATIONAL_MUSEUM: "10000000-0000-0000-0000-000000000001",
  HOLY_TRINITY: "10000000-0000-0000-0000-000000000002",
  ENTOTO_PARK: "10000000-0000-0000-0000-000000000003",
  UNITY_PARK: "10000000-0000-0000-0000-000000000004",
  RED_TERROR: "10000000-0000-0000-0000-000000000005",
  ETHNOLOGICAL_MUSEUM: "10000000-0000-0000-0000-000000000006",
  MOUNT_ENTOTO: "10000000-0000-0000-0000-000000000007",
  MESKEL_SQUARE: "10000000-0000-0000-0000-000000000008",
  FRIENDSHIP_PARK: "10000000-0000-0000-0000-000000000009",
  BUNA_HERITAGE: "10000000-0000-0000-0000-000000000010",
};

export const PLACES = [
  {
    id: PLACE_IDS.NATIONAL_MUSEUM,
    name: "National Museum of Ethiopia",
    category: "History",
    description:
      "One of the most important cultural repositories in Sub-Saharan Africa. The museum holds the world-famous 3.2-million-year-old fossilized skeleton of Lucy ('Dinkinesh'), alongside an extensive collection of ancient Axumite artifacts, imperial ceremonial crowns, and Ethiopian modern fine art.",
    openingHours: "9:00 AM - 5:00 PM (Daily)",
    address: "King George VI St, Arat Kilo, Addis Ababa",
    imageUrl:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: PLACE_IDS.HOLY_TRINITY,
    name: "Holy Trinity Cathedral",
    category: "History",
    description:
      "The premier Ethiopian Orthodox Cathedral, consecrated in 1942 to commemorate the liberation from Italian occupation. Renowned for its magnificent copper dome, monumental stained-glass windows, and the marble imperial tombs of Emperor Haile Selassie I and Empress Menen Asfaw.",
    openingHours: "8:00 AM - 6:00 PM (Daily)",
    address: "Arat Kilo, Addis Ababa",
    imageUrl:
      "https://images.unsplash.com/photo-1548625361-195fe61a55c3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: PLACE_IDS.ENTOTO_PARK,
    name: "Entoto Park",
    category: "Nature",
    description:
      "A scenic eco-recreational mountain park nestled in the aromatic eucalyptus forests of Mount Entoto. Features pristine walking and cycling trails, treetop suspension bridges, horseback riding, and panoramic viewpoints offering sprawling vistas across the Addis Ababa skyline.",
    openingHours: "6:00 AM - 9:00 PM (Daily)",
    address: "Entoto Hills, Northern Addis Ababa",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: PLACE_IDS.UNITY_PARK,
    name: "Unity Park",
    category: "History",
    description:
      "Set inside the historical Grand Menelik II Palace compound, Unity Park spans 40 hectares of imperial heritage. Highlights include the restored 19th-century Throne Hall, the historical banquet hall, indigenous botanical gardens, and an open-air regional zoo.",
    openingHours: "9:00 AM - 4:30 PM (Tue - Sun)",
    address: "Grand Palace Compound, Central Addis Ababa",
    imageUrl:
      "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: PLACE_IDS.RED_TERROR,
    name: "Red Terror Martyrs Memorial Museum",
    category: "History",
    description:
      "An evocative and sobering memorial museum chronicling the atrocities committed during the Derg regime's military dictatorship in the 1970s. Exhibits showcase authentic photographs, personal mementos, victim testimonies, and historical dioramas dedicated to truth and reconciliation.",
    openingHours: "8:30 AM - 6:30 PM (Daily)",
    address: "Bole Road, Next to Meskel Square, Addis Ababa",
    imageUrl:
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: PLACE_IDS.ETHNOLOGICAL_MUSEUM,
    name: "Ethnological Museum",
    category: "History",
    description:
      "Housed within Emperor Haile Selassie's former Genete Leul Palace on the Addis Ababa University main campus. The exhibits provide deep anthropological insights into the life cycles, music, sacred icons, ceremonies, and architecture of over 80 Ethiopian nationalities.",
    openingHours: "8:30 AM - 5:00 PM (Mon - Sat)",
    address: "Siddist Kilo, University Main Campus, Addis Ababa",
    imageUrl:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: PLACE_IDS.MOUNT_ENTOTO,
    name: "Mount Entoto",
    category: "Nature",
    description:
      "Rising 3,200 meters above sea level, Mount Entoto is the highest peak overlooking the Ethiopian capital. Famed for its crisp mountain climate, historic 19th-century Entoto Maryam church, and trail networks favored by world-class Ethiopian distance runners.",
    openingHours: "Open 24 hours (Daylight visits recommended)",
    address: "Entoto Ridge, Northern Suburbs, Addis Ababa",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: PLACE_IDS.MESKEL_SQUARE,
    name: "Meskel Square",
    category: "History",
    description:
      "The expansive historic civic plaza and gathering hub of Addis Ababa. Host to the UNESCO-inscribed annual Meskel Demera bonfire celebration, open-air concerts, and morning fitness sessions along its tiered amphitheater steps.",
    openingHours: "Open 24 hours",
    address: "Central Addis Ababa (Intersection of Joma Kenyatta & Ras Birru)",
    imageUrl:
      "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: PLACE_IDS.FRIENDSHIP_PARK,
    name: "Friendship Park",
    category: "Nature",
    description:
      "A magnificent urban landscaped park nestled between the Prime Minister's office and the Sheraton. Features dancing musical fountains, artificial lakes, serene botanical garden walkways, sculptures, and modern open-air event plazas.",
    openingHours: "9:00 AM - 9:00 PM (Tue - Sun)",
    address: "Opposite Sheraton Addis, Central Addis Ababa",
    imageUrl:
      "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: PLACE_IDS.BUNA_HERITAGE,
    name: "Buna Heritage Coffee House",
    category: "Food",
    description:
      "An intimate artisanal coffee roastery celebrating Ethiopia as the birthplace of Arabica coffee. Offers authentic traditional clay pot (jebena) ceremonies, freshly roasted single-origin Yirgacheffe, Sidama, and Harar beans, accompanied by freshly baked ambasha bread.",
    openingHours: "7:00 AM - 10:00 PM (Daily)",
    address: "Namibia St, Bole Sub-City, Addis Ababa",
    imageUrl:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
  },
];

async function main() {
  console.log("==> Cleaning existing data...");
  await prisma.booking.deleteMany();
  await prisma.tourSlot.deleteMany();
  await prisma.review.deleteMany();
  await prisma.place.deleteMany();
  await prisma.user.deleteMany();

  console.log("==> Seeding 3 primary demo users...");
  for (const user of DEMO_USERS) {
    await prisma.user.create({ data: user });
  }

  console.log("==> Seeding community reviewer accounts...");
  const communityUsers: { id: string; name: string }[] = [];
  const firstNames = ["Abebe", "Marta", "Daniel", "Helen", "Tewodros", "Senait", "Yared", "Hiwot", "Kassahun", "Meron", "Solomon", "Selam", "Fikru", "Tigist", "Biruk", "Zewditu", "Michael", "Elena", "Lucas", "Amina"];
  const lastNames = ["Bekele", "Haile", "Girma", "Alemu", "Tafari", "Kassa", "Mekonnen", "Assefa", "Negash", "Desta", "Worku", "Gebre", "Feleke", "Wolde", "Tesfaye"];

  const communityUserData: { id: string; name: string; isActor: boolean }[] = [];
  for (let i = 1; i <= 350; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const id = `00000000-0000-0000-0001-${String(i).padStart(12, "0")}`;
    communityUserData.push({
      id,
      name: `${fn} ${ln}`,
      isActor: false,
    });
    communityUsers.push({ id, name: `${fn} ${ln}` });
  }

  await prisma.user.createMany({
    data: communityUserData,
  });

  console.log("==> Seeding 10 places...");
  for (const place of PLACES) {
    await prisma.place.create({ data: place });
  }

  console.log("==> Generating review distribution across places...");
  const reviewsToInsert: {
    placeId: string;
    userId: string;
    rating: number;
    body: string;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];

  const sampleComments5Star = [
    "An absolute highlight of my trip to Addis Ababa! The history and guides were exceptional.",
    "Breathtaking sights and deeply enriching cultural experience. Highly recommended!",
    "One of the best destinations in Ethiopia. Truly unforgettable and beautifully maintained.",
    "Superb atmosphere, friendly staff, and very informative exhibits.",
    "A masterpiece of Ethiopian heritage. Everyone visiting the capital must come here.",
  ];

  const sampleComments4Star = [
    "Great experience overall. Can get quite busy during the afternoons, but well worth the visit.",
    "Wonderful place to spend a couple of hours. Very informative exhibits and nice scenery.",
    "Very interesting historical context. The facilities are good and clean.",
    "Loved the atmosphere and views. Would recommend coming with a guide for full context.",
  ];

  const sampleComments3Star = [
    "Interesting place, though could use a bit more modern signage in some sections.",
    "Good experience overall, quite crowded on weekends.",
  ];

  const generateReviewsForPlace = (
    placeId: string,
    targetCount: number,
    targetAvg: number
  ) => {
    const fiveStarCount = Math.min(targetCount, Math.max(0, Math.round((targetAvg - 4.0) * targetCount)));
    const fourStarCount = targetCount - fiveStarCount;
    const threeStarCount = 0;

    let userIdx = 0;

    for (let i = 0; i < fiveStarCount && userIdx < communityUsers.length; i++) {
      reviewsToInsert.push({
        placeId,
        userId: communityUsers[userIdx++].id,
        rating: 5,
        body: sampleComments5Star[i % sampleComments5Star.length],
        createdAt: new Date(Date.now() - (i * 3600000 * 12)),
        updatedAt: new Date(Date.now() - (i * 3600000 * 12)),
      });
    }

    for (let i = 0; i < fourStarCount && userIdx < communityUsers.length; i++) {
      reviewsToInsert.push({
        placeId,
        userId: communityUsers[userIdx++].id,
        rating: 4,
        body: sampleComments4Star[i % sampleComments4Star.length],
        createdAt: new Date(Date.now() - (i * 3600000 * 18)),
        updatedAt: new Date(Date.now() - (i * 3600000 * 18)),
      });
    }

    for (let i = 0; i < threeStarCount && userIdx < communityUsers.length; i++) {
      reviewsToInsert.push({
        placeId,
        userId: communityUsers[userIdx++].id,
        rating: 3,
        body: sampleComments3Star[i % sampleComments3Star.length],
        createdAt: new Date(Date.now() - (i * 3600000 * 24)),
        updatedAt: new Date(Date.now() - (i * 3600000 * 24)),
      });
    }
  };

  generateReviewsForPlace(PLACE_IDS.NATIONAL_MUSEUM, 312, 4.70);
  generateReviewsForPlace(PLACE_IDS.HOLY_TRINITY, 120, 4.80);
  generateReviewsForPlace(PLACE_IDS.UNITY_PARK, 180, 4.75);
  generateReviewsForPlace(PLACE_IDS.ENTOTO_PARK, 95, 4.60);
  generateReviewsForPlace(PLACE_IDS.RED_TERROR, 88, 4.85);
  generateReviewsForPlace(PLACE_IDS.ETHNOLOGICAL_MUSEUM, 75, 4.60);
  generateReviewsForPlace(PLACE_IDS.MOUNT_ENTOTO, 60, 4.50);
  generateReviewsForPlace(PLACE_IDS.MESKEL_SQUARE, 110, 4.40);
  generateReviewsForPlace(PLACE_IDS.FRIENDSHIP_PARK, 52, 4.30);

  reviewsToInsert.push({
    placeId: PLACE_IDS.BUNA_HERITAGE,
    userId: DEMO_USERS[0].id,
    rating: 5,
    body: "An incredible authentic Ethiopian coffee ceremony! Watching the fresh green beans roasted over hot coals and brewed in the traditional jebena with fragrant rosemary and fresh ambasha was the best hospitality experience in Addis Ababa. Truly 5 stars!",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`==> Inserting ${reviewsToInsert.length} total reviews...`);
  for (let i = 0; i < reviewsToInsert.length; i += 100) {
    const chunk = reviewsToInsert.slice(i, i + 100);
    await prisma.review.createMany({
      data: chunk,
    });
  }

  await prisma.review.create({
    data: {
      placeId: PLACE_IDS.HOLY_TRINITY,
      userId: DEMO_USERS[1].id,
      rating: 5,
      body: "The stained glass windows and imperial tombs are deeply majestic. Beautiful peace and serenity inside.",
    },
  });

  await prisma.review.create({
    data: {
      placeId: PLACE_IDS.ENTOTO_PARK,
      userId: DEMO_USERS[2].id,
      rating: 5,
      body: "Fresh mountain air, great walking trails, and amazing views of the city. A breath of fresh air in Addis!",
    },
  });

  console.log("==> Seeding guided tour slots and existing bookings...");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const tomorrowAfternoon = new Date();
  tomorrowAfternoon.setDate(tomorrowAfternoon.getDate() + 1);
  tomorrowAfternoon.setHours(14, 0, 0, 0);

  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(10, 0, 0, 0);

  const museumSlotA = await prisma.tourSlot.create({
    data: {
      id: "20000000-0000-0000-0000-000000000001",
      placeId: PLACE_IDS.NATIONAL_MUSEUM,
      startsAt: tomorrow,
      capacity: 10,
    },
  });

  await prisma.booking.create({
    data: {
      slotId: museumSlotA.id,
      userId: communityUsers[0].id,
      seats: 5,
    },
  });
  await prisma.booking.create({
    data: {
      slotId: museumSlotA.id,
      userId: communityUsers[1].id,
      seats: 3,
    },
  });

  const museumSlotB = await prisma.tourSlot.create({
    data: {
      id: "20000000-0000-0000-0000-000000000002",
      placeId: PLACE_IDS.NATIONAL_MUSEUM,
      startsAt: tomorrowAfternoon,
      capacity: 12,
    },
  });
  await prisma.booking.create({
    data: {
      slotId: museumSlotB.id,
      userId: communityUsers[2].id,
      seats: 6,
    },
  });
  await prisma.booking.create({
    data: {
      slotId: museumSlotB.id,
      userId: communityUsers[3].id,
      seats: 6,
    },
  });

  await prisma.tourSlot.create({
    data: {
      id: "20000000-0000-0000-0000-000000000003",
      placeId: PLACE_IDS.NATIONAL_MUSEUM,
      startsAt: dayAfterTomorrow,
      capacity: 15,
      bookings: {
        create: [
          {
            userId: communityUsers[4].id,
            seats: 5,
          },
        ],
      },
    },
  });

  await prisma.tourSlot.create({
    data: {
      id: "20000000-0000-0000-0000-000000000004",
      placeId: PLACE_IDS.HOLY_TRINITY,
      startsAt: tomorrow,
      capacity: 8,
      bookings: {
        create: [
          {
            userId: communityUsers[5].id,
            seats: 2,
          },
        ],
      },
    },
  });

  await prisma.tourSlot.create({
    data: {
      id: "20000000-0000-0000-0000-000000000005",
      placeId: PLACE_IDS.UNITY_PARK,
      startsAt: tomorrow,
      capacity: 20,
      bookings: {
        create: [
          {
            userId: communityUsers[6].id,
            seats: 10,
          },
        ],
      },
    },
  });

  await prisma.tourSlot.create({
    data: {
      id: "20000000-0000-0000-0000-000000000006",
      placeId: PLACE_IDS.ENTOTO_PARK,
      startsAt: tomorrowAfternoon,
      capacity: 15,
      bookings: {
        create: [
          {
            userId: communityUsers[7].id,
            seats: 4,
          },
        ],
      },
    },
  });

  await prisma.tourSlot.create({
    data: {
      id: "20000000-0000-0000-0000-000000000007",
      placeId: PLACE_IDS.BUNA_HERITAGE,
      startsAt: tomorrowAfternoon,
      capacity: 8,
      bookings: {
        create: [
          {
            userId: communityUsers[8].id,
            seats: 2,
          },
        ],
      },
    },
  });

  console.log("==> Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
