const { nanoid } = require('nanoid');
const db = require('./database');

const sites = [
  {
    id: 'site_golconda',
    name: 'Golconda Fort',
    short_description: 'A majestic 16th-century fortress famed for its acoustics and diamond legacy.',
    long_description:
      'Golconda Fort rises on a granite hill on the outskirts of Hyderabad, its ramparts stretching for miles around a citadel once ruled by the Qutb Shahi dynasty. Built and expanded between the 14th and 17th centuries, it was legendary as the trading hub for diamonds mined nearby, including stones said to have become the Koh-i-Noor. The fort is celebrated for its ingenious acoustic design — a hand clap at the main gate can be heard clearly at the highest pavilion, nearly a kilometre away, a system once used to warn the royal family of approaching danger.',
    era: '16th century, Qutb Shahi dynasty',
    location_name: 'Hyderabad, Telangana',
    latitude: 17.3833,
    longitude: 78.4011,
    image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Golkonda%20Fort.jpg',
    risk_status: 'yellow'
  },
  {
    id: 'site_charminar',
    name: 'Charminar',
    short_description: 'The iconic four-minaret monument at the heart of old Hyderabad.',
    long_description:
      'Built in 1591 by Sultan Muhammad Quli Qutb Shah, Charminar marks the centre of Hyderabad and is said to commemorate the end of a devastating plague in the city. Its four grand arches face the cardinal directions and its four minarets rise nearly 56 metres, each carrying delicate stucco ornamentation. It sits at the heart of a bustling market famous for pearls and bangles, and remains the most photographed symbol of the city\'s Qutb Shahi heritage.',
    era: '1591 CE, Qutb Shahi dynasty',
    location_name: 'Hyderabad, Telangana',
    latitude: 17.3616,
    longitude: 78.4747,
    image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Charminar%20Hyderabad.jpg',
    risk_status: 'green'
  },
  {
    id: 'site_ramappa',
    name: 'Ramappa Temple',
    short_description: 'A UNESCO World Heritage sandstone temple famed for its floating bricks.',
    long_description:
      'Dedicated to Lord Shiva and built under the Kakatiya dynasty in 1213 CE, the Ramappa Temple at Palampet is renowned for its intricately carved sandstone sculptures and a roof built with porous, lightweight bricks that are said to float on water — an early feat of earthquake-resistant engineering. Inscribed as a UNESCO World Heritage Site in 2021, it remains a living example of Kakatiya-era craftsmanship and devotion.',
    era: '1213 CE, Kakatiya dynasty',
    location_name: 'Palampet, Mulugu district, Telangana',
    latitude: 18.2617,
    longitude: 80.0987,
    image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ramappa%20Temple.jpg',
    risk_status: 'green'
  },
  {
    id: 'site_ajanta',
    name: 'Ajanta Caves',
    short_description: 'Ancient rock-cut Buddhist caves adorned with masterful murals.',
    long_description:
      'Carved into a horseshoe-shaped cliff above the Waghora river, the Ajanta Caves comprise thirty rock-cut Buddhist monastery and prayer halls dating from the 2nd century BCE to about 480 CE. Their walls and ceilings hold some of the finest surviving examples of ancient Indian painting, depicting the Jataka tales alongside serene Bodhisattva figures. Rediscovered in 1819, the caves are now a UNESCO World Heritage Site and one of the most significant collections of Buddhist art in the world.',
    era: '2nd century BCE – 480 CE',
    location_name: 'Aurangabad district, Maharashtra',
    latitude: 20.5519,
    longitude: 75.7033,
    image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ajanta%20Caves.jpg',
    risk_status: 'red'
  },
  {
    id: 'site_hampi',
    name: 'Hampi',
    short_description: 'The sprawling ruins of the mighty Vijayanagara Empire capital.',
    long_description:
      'Hampi was the capital of the Vijayanagara Empire, one of the greatest Hindu kingdoms in Indian history, flourishing between the 14th and 16th centuries. Spread across a dramatic boulder-strewn landscape on the banks of the Tungabhadra river, its ruins include the iconic stone chariot and musical pillars of the Vittala Temple, the towering Virupaksha Temple still in active worship, and remnants of royal enclosures, markets, and aqueducts. A UNESCO World Heritage Site, Hampi offers a vivid window into a golden age of South Indian art, trade, and architecture.',
    era: '14th–16th century, Vijayanagara Empire',
    location_name: 'Hampi, Karnataka',
    latitude: 15.335,
    longitude: 76.46,
    image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hampi%20Virupaksha%20Temple.jpg',
    risk_status: 'yellow'
  }
];

function seed() {
  const countRow = db.prepare('SELECT COUNT(*) as c FROM sites').get();
  if (countRow.c > 0) {
    console.log('Sites already seeded, skipping site seed.');
  } else {
    const insert = db.prepare(`
      INSERT INTO sites (id, name, short_description, long_description, era, location_name, latitude, longitude, image_url, risk_status, verified)
      VALUES (@id, @name, @short_description, @long_description, @era, @location_name, @latitude, @longitude, @image_url, @risk_status, 1)
    `);
    const insertMany = db.transaction((rows) => {
      for (const row of rows) insert.run(row);
    });
    insertMany(sites);
    console.log(`Seeded ${sites.length} heritage sites.`);
  }

  // Seed a couple of demo risk reports so the Risk Map / admin queue feel alive
  const reportCount = db.prepare('SELECT COUNT(*) as c FROM risk_reports').get();
  if (reportCount.c === 0) {
    const insertReport = db.prepare(`
      INSERT INTO risk_reports (id, site_id, severity, description, photo_path, reporter_name, reporter_contact, alert_message, alert_sent, status)
      VALUES (@id, @site_id, @severity, @description, @photo_path, @reporter_name, @reporter_contact, @alert_message, @alert_sent, @status)
    `);
    insertReport.run({
      id: 'report_' + nanoid(8),
      site_id: 'site_ajanta',
      severity: 'severe',
      description: 'Visible seepage and structural cracking near cave 9 entrance after monsoon rains.',
      photo_path: null,
      reporter_name: 'Anonymous Visitor',
      reporter_contact: '',
      alert_message: 'Draft alert auto-generated for Local ASI Circle Office regarding structural risk at Ajanta Caves.',
      alert_sent: 1,
      status: 'approved'
    });
    insertReport.run({
      id: 'report_' + nanoid(8),
      site_id: 'site_golconda',
      severity: 'moderate',
      description: 'Overgrowth of vegetation along the outer bastion walls, some minor cracking observed.',
      photo_path: null,
      reporter_name: 'Anonymous Visitor',
      reporter_contact: '',
      alert_message: 'Draft alert auto-generated for Local ASI Circle Office regarding vegetation overgrowth at Golconda Fort.',
      alert_sent: 1,
      status: 'approved'
    });
    console.log('Seeded 2 demo risk reports.');
  }

  // Seed one pending new-site submission so the Admin queue has something to review
  const subCount = db.prepare('SELECT COUNT(*) as c FROM submissions').get();
  if (subCount.c === 0) {
    db.prepare(`
      INSERT INTO submissions (id, site_name, location_name, latitude, longitude, description, photo_path, voice_note_path, reporter_name, reporter_contact, status)
      VALUES (@id, @site_name, @location_name, @latitude, @longitude, @description, @photo_path, @voice_note_path, @reporter_name, @reporter_contact, 'pending')
    `).run({
      id: 'sub_' + nanoid(8),
      site_name: 'Bhongir Fort',
      location_name: 'Bhuvanagiri, Telangana',
      latitude: 17.5167,
      longitude: 78.8833,
      description: 'A striking monolithic rock fort with a steep climb and panoramic views, said to date to the Chalukya era.',
      photo_path: null,
      voice_note_path: null,
      reporter_name: 'Community Contributor',
      reporter_contact: 'contributor@example.com',
      status: 'pending'
    });
    console.log('Seeded 1 demo pending submission.');
  }
}

seed();
module.exports = seed;
